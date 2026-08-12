import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase as browserClient } from "@/integrations/supabase/client";

/** Public: list published NEET PG tests with their question count. */
export const listTests = createServerFn({ method: "GET" }).handler(async () => {
  const { data: tests, error } = await browserClient
    .from("tests")
    .select("id,title,description,test_type,duration_min,total_questions,marks_per_correct,marks_per_wrong")
    .eq("exam_id", "neet_pg")
    .eq("is_published", true)
    .order("test_type", { ascending: true });
  if (error) throw new Error(error.message);

  const ids = (tests ?? []).map((t) => t.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: tq } = await browserClient
      .from("test_questions")
      .select("test_id")
      .in("test_id", ids);
    for (const row of tq ?? []) counts.set(row.test_id, (counts.get(row.test_id) ?? 0) + 1);
  }
  return (tests ?? []).map((t) => ({ ...t, question_count: counts.get(t.id) ?? 0 }));
});

/** Auth: load test + questions WITHOUT exposing correct answers. */
export const getTestForAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ testId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: test, error: tErr } = await supabase
      .from("tests")
      .select("id,title,description,test_type,duration_min,total_questions,marks_per_correct,marks_per_wrong")
      .eq("id", data.testId)
      .single();
    if (tErr || !test) throw new Error(tErr?.message ?? "Test not found");

    const { data: tq, error: qErr } = await supabase
      .from("test_questions")
      .select("position, question:questions(id, stem, options, subject_id)")
      .eq("test_id", data.testId)
      .order("position", { ascending: true });
    if (qErr) throw new Error(qErr.message);

    const questions = (tq ?? [])
      .map((row) => row.question)
      .filter(Boolean)
      .map((q: any) => ({
        id: q.id as string,
        stem: q.stem as string,
        options: q.options as string[],
        subject_id: q.subject_id as string | null,
      }));
    return { test, questions };
  });

/** Auth: create a fresh attempt and return its id. */
export const startAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ testId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("test_attempts")
      .insert({ user_id: userId, test_id: data.testId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { attemptId: row.id };
  });

/** Auth: submit all answers, score, return result summary. */
export const submitAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        attemptId: z.string().uuid(),
        answers: z.array(
          z.object({
            questionId: z.string().uuid(),
            selectedIndex: z.number().int().min(0).max(10).nullable(),
            markedReview: z.boolean().optional(),
            timeSpentS: z.number().int().min(0).max(36000).optional(),
          }),
        ),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: attempt, error: aErr } = await supabase
      .from("test_attempts")
      .select("id,user_id,test_id,submitted_at")
      .eq("id", data.attemptId)
      .single();
    if (aErr || !attempt) throw new Error("Attempt not found");
    if (attempt.user_id !== userId) throw new Error("Forbidden");
    if (attempt.submitted_at) throw new Error("Already submitted");

    if (!attempt.test_id) throw new Error("Legacy attempt has no test_id");
    const { data: test } = await supabase
      .from("tests")
      .select("marks_per_correct,marks_per_wrong,total_questions")
      .eq("id", attempt.test_id)
      .single();
    if (!test) throw new Error("Test missing");

    const qIds = data.answers.map((a) => a.questionId);
    const { data: qs } = await supabase
      .from("questions")
      .select("id,correct_index,topic_id")
      .in("id", qIds);
    const keyMap = new Map((qs ?? []).map((q) => [q.id, q]));

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    const rows = data.answers.map((a) => {
      const k = keyMap.get(a.questionId);
      const isCorrect = a.selectedIndex === null ? null : k ? a.selectedIndex === k.correct_index : null;
      if (a.selectedIndex === null) unattempted++;
      else if (isCorrect) correct++;
      else wrong++;
      return {
        attempt_id: data.attemptId,
        question_id: a.questionId,
        selected_index: a.selectedIndex,
        is_correct: isCorrect,
        marked_review: a.markedReview ?? false,
        time_spent_s: a.timeSpentS ?? 0,
      };
    });

    if (rows.length) {
      const { error: insErr } = await supabase.from("attempt_answers").insert(rows);
      if (insErr) throw new Error(insErr.message);
    }

    const score = correct * Number(test.marks_per_correct) + wrong * Number(test.marks_per_wrong);
    const totalMarks = test.total_questions * Number(test.marks_per_correct);

    const { error: updErr } = await supabase
      .from("test_attempts")
      .update({
        submitted_at: new Date().toISOString(),
        score,
        total_marks: totalMarks,
        correct_count: correct,
        wrong_count: wrong,
        unattempted_count: unattempted,
      })
      .eq("id", data.attemptId);
    if (updErr) throw new Error(updErr.message);

    return { attemptId: data.attemptId, score, totalMarks, correct, wrong, unattempted };
  });

/** Auth: detailed result with correct answers + explanations. */
export const getAttemptResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ attemptId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: attempt, error } = await supabase
      .from("test_attempts")
      .select("*, test:tests(title,test_type,duration_min,marks_per_correct,marks_per_wrong,total_questions)")
      .eq("id", data.attemptId)
      .single();
    if (error || !attempt) throw new Error("Attempt not found");
    if (attempt.user_id !== userId) throw new Error("Forbidden");

    const { data: ans } = await supabase
      .from("attempt_answers")
      .select("question_id,selected_index,is_correct,marked_review,question:questions(stem,options,correct_index,explanation,subject:subjects(name))")
      .eq("attempt_id", data.attemptId);

    return { attempt, answers: ans ?? [] };
  });

/** Auth: is current user an admin? */
export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    return { admin: (data ?? []).some((r) => r.role === "admin") };
  });

/** Public: list NEET PG subjects (for admin generator UI). */
export const listSubjects = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await browserClient
    .from("subjects")
    .select("id,name,slug")
    .eq("exam_id", "neet_pg")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

/** Admin: generate AI questions for a subject via Lovable AI Gateway. */
export const generateAIQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        subjectSlug: z.string().min(2).max(40),
        count: z.number().int().min(1).max(10),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw new Error("Admin only");

    const { data: subject } = await supabase
      .from("subjects")
      .select("id,name,slug")
      .eq("slug", data.subjectSlug)
      .eq("exam_id", "neet_pg")
      .single();
    if (!subject) throw new Error("Subject not found");

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const prompt = `Generate ${data.count} high-yield NEET PG MCQ questions for the subject "${subject.name}".
Return STRICT JSON: {"questions":[{"stem":"...","options":["A","B","C","D"],"correct_index":0,"explanation":"...","difficulty":"easy|medium|hard"}]}.
Each question must have exactly 4 options. correct_index is 0-3. Keep stem under 280 chars. Make them clinically relevant and exam-style.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: "You are a NEET PG question setter. Output valid JSON only.",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${txt.slice(0, 200)}`);
    }
    const anthropicJson = (await res.json()) as { content?: { type: string; text: string }[] };
    const content = anthropicJson.content?.find((c) => c.type === "text")?.text ?? "{}";
    let parsed: { questions?: any[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("AI returned invalid JSON");
    }
    const QSchema = z.object({
      stem: z.string().min(8).max(600),
      options: z.array(z.string().min(1).max(300)).length(4),
      correct_index: z.number().int().min(0).max(3),
      explanation: z.string().min(4).max(800),
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    });
    const valid = (parsed.questions ?? []).map((q) => QSchema.safeParse(q)).filter((r) => r.success).map((r: any) => r.data);
    if (!valid.length) throw new Error("No valid questions returned");

    const { data: inserted, error: insErr } = await supabase
      .from("questions")
      .insert(
        valid.map((q) => ({
          exam_id: "neet_pg",
          subject_id: subject.id,
          stem: q.stem,
          options: q.options,
          correct_index: q.correct_index,
          explanation: q.explanation,
          difficulty: q.difficulty,
          source: "ai",
          approved: true,
        })),
      )
      .select("id");
    if (insErr) throw new Error(insErr.message);

    return { added: inserted?.length ?? 0, subject: subject.name };
  });