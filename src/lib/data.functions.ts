import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ============================================================
   MOCK TESTS
   ============================================================ */

export const listMockTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("mock_tests")
      .select("id,exam_name,title,description,num_questions,duration_minutes,difficulty,subject,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMockTestForAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ testId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: t, error } = await supabase
      .from("mock_tests")
      .select("id,exam_name,title,description,num_questions,duration_minutes,difficulty,subject,questions")
      .eq("id", data.testId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!t) throw new Error("Test not found");
    const questions = (t.questions as any[]).map((q: any, i: number) => ({
      index: i,
      text: q.text as string,
      options: q.options as string[],
      subject: q.subject as string | undefined,
      topic: q.topic as string | undefined,
    }));
    return {
      test: {
        id: t.id, title: t.title, exam_name: t.exam_name, subject: t.subject,
        difficulty: t.difficulty, duration_minutes: t.duration_minutes,
        num_questions: t.num_questions, description: t.description,
      },
      questions,
    };
  });

export const startMockAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ mockTestId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("test_attempts")
      .insert({ user_id: userId, mock_test_id: data.mockTestId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { attemptId: row.id };
  });

export const submitMockAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      attemptId: z.string().uuid(),
      mockTestId: z.string().uuid(),
      answers: z.array(z.object({
        index: z.number().int().min(0).max(199),
        selected: z.number().int().min(-1).max(10),
        marked: z.boolean().optional(),
      })),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: t } = await supabase.from("mock_tests").select("questions").eq("id", data.mockTestId).maybeSingle();
    if (!t) throw new Error("Test missing");
    const qs = t.questions as any[];

    let correct = 0, wrong = 0, unattempted = 0;
    const review = data.answers.map((a) => {
      const q = qs[a.index];
      const isCorrect = a.selected < 0 ? null : a.selected === q?.correct;
      if (a.selected < 0) unattempted++;
      else if (isCorrect) correct++;
      else wrong++;
      return { index: a.index, selected: a.selected, isCorrect, marked: a.marked ?? false };
    });

    const score = correct * 4 - wrong * 1;
    const totalMarks = qs.length * 4;
    const meritDelta = correct * 10;

    const { error: updErr } = await supabase
      .from("test_attempts")
      .update({
        submitted_at: new Date().toISOString(),
        score, total_marks: totalMarks,
        correct_count: correct, wrong_count: wrong, unattempted_count: unattempted,
        answers_json: review,
        answers: review as any,
      })
      .eq("id", data.attemptId)
      .eq("user_id", userId);
    if (updErr) throw new Error(updErr.message);

    // Award merit points on user_streaks (canonical) + mirror on profiles for legacy reads.
    if (meritDelta > 0) {
      const { data: s } = await supabase.from("user_streaks").select("merit_points").eq("user_id", userId).maybeSingle();
      const newPoints = ((s as any)?.merit_points ?? 0) + meritDelta;
      await supabase.from("user_streaks").upsert({ user_id: userId, merit_points: newPoints, updated_at: new Date().toISOString() } as any);
      const { data: prof } = await supabase.from("profiles").select("merit_points").eq("id", userId).maybeSingle();
      await supabase.from("profiles").update({ merit_points: (prof?.merit_points ?? 0) + meritDelta }).eq("id", userId);
    }

    // Bump streak.
    const today = new Date().toISOString().slice(0, 10);
    const { data: streak } = await supabase.from("user_streaks").select("*").eq("user_id", userId).maybeSingle();
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let current = 1, longest = 1;
    if (streak) {
      if (streak.last_active_date === today) { current = streak.current_streak; longest = streak.longest_streak; }
      else if (streak.last_active_date === yesterday) { current = streak.current_streak + 1; longest = Math.max(streak.longest_streak, current); }
      else { current = 1; longest = Math.max(streak.longest_streak, 1); }
    }
    await supabase.from("user_streaks").upsert({
      user_id: userId, current_streak: current, longest_streak: longest, last_active_date: today, updated_at: new Date().toISOString(),
    });

    return { attemptId: data.attemptId, score, totalMarks, correct, wrong, unattempted, meritDelta };
  });

export const getMockAttemptResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ attemptId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: a, error } = await supabase
      .from("test_attempts")
      .select("id,user_id,mock_test_id,test_id,score,total_marks,correct_count,wrong_count,unattempted_count,answers,answers_json,submitted_at,started_at, mock:mock_tests(id,title,exam_name,subject,difficulty,duration_minutes,questions)")
      .eq("id", data.attemptId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!a) throw new Error("Attempt not found");
    if (a.user_id !== userId) throw new Error("Forbidden");
    return a;
  });

/* ============================================================
   MENTORS
   ============================================================ */

export const listMentors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("mentor_profiles")
      .select("*")
      .eq("is_active", true)
      .order("rating", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/* ============================================================
   DASHBOARD
   ============================================================ */

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profile, streak, exams, recent, forgets, attemptsCount] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_streaks").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_exams").select("*").eq("user_id", userId).order("target_date", { ascending: true }),
      supabase.from("test_attempts")
        .select("id,score,total_marks,correct_count,wrong_count,submitted_at, mock:mock_tests(id,title,exam_name)")
        .eq("user_id", userId).not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false }).limit(3),
      supabase.from("topic_revisions")
        .select("id,retention_score,times_revised,last_revised_at, topic:study_topics(topic_name,subject,exam_name)")
        .eq("user_id", userId).lt("retention_score", 50)
        .order("retention_score", { ascending: true }).limit(3),
      supabase.from("test_attempts").select("id", { count: "exact", head: true })
        .eq("user_id", userId).not("submitted_at", "is", null),
    ]);

    return {
      profile: profile.data,
      streak: streak.data,
      exams: exams.data ?? [],
      recent: recent.data ?? [],
      forgets: forgets.data ?? [],
      testsTaken: attemptsCount.count ?? 0,
    };
  });

/* ============================================================
   FORGET METER
   ============================================================ */

export const listMyRevisions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("topic_revisions")
      .select("id,retention_score,last_revised_at,times_revised, topic:study_topics(id,topic_name,subject,exam_name)")
      .eq("user_id", userId)
      .order("retention_score", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAllTopics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("study_topics")
      .select("id,topic_name,subject,exam_name")
      .order("exam_name")
      .order("subject");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const reviseTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ topicId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("topic_revisions").select("times_revised")
      .eq("user_id", userId).eq("topic_id", data.topicId).maybeSingle();
    const { error } = await supabase.from("topic_revisions").upsert({
      user_id: userId,
      topic_id: data.topicId,
      retention_score: 100,
      last_revised_at: new Date().toISOString(),
      times_revised: (existing?.times_revised ?? 0) + 1,
    }, { onConflict: "user_id,topic_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============================================================
   LEADERBOARD
   ============================================================ */

export const getLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase.from("leaderboard").select("*").limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/* ============================================================
   MY EXAMS
   ============================================================ */

export const listMyExams = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_exams").select("*").eq("user_id", userId)
      .order("added_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addMyExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    examName: z.string().min(2).max(60),
    targetDate: z.string().nullable().optional(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("user_exams").insert({
      user_id: userId,
      exam_name: data.examName,
      target_date: data.targetDate ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeMyExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("user_exams").delete()
      .eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============================================================
   STUDY PLANNER (AI-generated weekly plan via Lovable AI)
   ============================================================ */

export const generateStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    examDate: z.string().min(8).max(40),
    availableHours: z.number().int().min(1).max(16),
    selectedExams: z.array(z.string().min(1).max(60)).min(1).max(10),
    weakTopics: z.array(z.string().min(1).max(120)).max(20).optional(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Build a 7-day study plan as STRICT JSON for a student preparing for: ${data.selectedExams.join(", ")}.
Exam date: ${data.examDate}. Available hours per day: ${data.availableHours}.
${data.weakTopics?.length ? `Weak topics to prioritise: ${data.weakTopics.join(", ")}.` : ""}
Return JSON: {"weekly_plan":{"Mon":[{"time":"6:00 - 8:00","subject":"Physics","topic":"Mechanics","kind":"theory|practice|revision"}],"Tue":[...],"Wed":[...],"Thu":[...],"Fri":[...],"Sat":[...],"Sun":[...]}}.
Each day must total roughly ${data.availableHours} hours. Include theory + practice + revision blocks. Keep topic names concise.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert exam coach. Output valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${txt.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices: { message: { content: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { weekly_plan?: Record<string, any[]> };
    try { parsed = JSON.parse(content); } catch { throw new Error("AI returned invalid JSON"); }
    return { user_id: userId, weekly_plan: parsed.weekly_plan ?? {} };
  });
