/**
 * POST /api/agents/content/approve/:id  — approve a pending MCQ → moves to mock_tests
 * POST /api/agents/content/reject/:id   — reject (via status param)
 */

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

function adminSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!,
  );
}

export const Route = createFileRoute("/api/agents/content/approve/$id")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const db = adminSupabase();
        const { id } = params;
        const body = await request.json() as { action?: "approve" | "reject" };
        const action = body.action ?? "approve";

        const { data: question } = await db
          .from("pending_questions")
          .select("*")
          .eq("id", id)
          .single();

        if (!question) return Response.json({ error: "Question not found" }, { status: 404 });

        if (action === "reject") {
          await db.from("pending_questions").update({
            status: "rejected",
            reviewed_by: "admin",
            reviewed_at: new Date().toISOString(),
          }).eq("id", id);
          return Response.json({ ok: true, action: "rejected" });
        }

        // Approve: find or create a mock_test for this exam, then append question
        // For now: insert into a daily-generated mock_test per exam
        const today = new Date().toISOString().split("T")[0];
        const testTitle = `AI-Generated: ${question.topic} (${today})`;

        const { data: existingTest } = await db
          .from("mock_tests")
          .select("id, questions, num_questions")
          .eq("exam_name", question.exam_name)
          .eq("title", testTitle)
          .single();

        const newQuestion = {
          question_text: question.question_text,
          options: question.options,
          correct_option: question.correct_option,
          explanation: question.explanation,
          key_concept: question.key_concept,
          memory_tip: question.memory_tip,
          difficulty: question.difficulty,
        };

        if (existingTest) {
          const questions = Array.isArray(existingTest.questions) ? existingTest.questions : [];
          questions.push(newQuestion);
          await db.from("mock_tests").update({
            questions,
            num_questions: questions.length,
          }).eq("id", existingTest.id);
        } else {
          await db.from("mock_tests").insert({
            exam_name: question.exam_name,
            title: testTitle,
            description: `AI-generated questions on ${question.topic}`,
            num_questions: 1,
            duration_minutes: 15,
            difficulty: question.difficulty,
            subject: question.subject,
            questions: [newQuestion],
          });
        }

        await db.from("pending_questions").update({
          status: "approved",
          reviewed_by: "admin",
          reviewed_at: new Date().toISOString(),
        }).eq("id", id);

        return Response.json({ ok: true, action: "approved" });
      },
    },
  },
});
