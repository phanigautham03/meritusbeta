/**
 * Mentor Matching Agent — on-demand HTTP trigger.
 * Called when user clicks "Find a Mentor". Returns top 3 ranked mentors.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { callClaude } from "./agent-utils";

type MentorMatch = {
  mentor_id: string;
  rank: number;
  match_score: number;
  match_reason: string;
};

export async function runMentorMatchAgent(
  db: SupabaseClient,
  userId: string,
): Promise<{ matches: MentorMatch[] }> {
  // Fetch user context
  const { data: profile } = await db
    .from("profiles")
    .select("full_name, city, state, study_hours_per_day")
    .eq("id", userId)
    .single();

  const { data: userExams } = await db
    .from("user_exams")
    .select("exam_name")
    .eq("user_id", userId);

  const { data: attempts } = await db
    .from("test_attempts")
    .select("weak_topics, score, total_marks")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(5);

  // Fetch active mentors
  const { data: mentors } = await db
    .from("mentor_profiles")
    .select("id, name, exam_cleared, rank_achieved, institution, price_per_session, rating, specialisation_tags, bio")
    .eq("is_active", true)
    .limit(20);

  const exams = (userExams ?? []).map((e: { exam_name: string }) => e.exam_name);
  const weakTopics = [...new Set(
    (attempts ?? []).flatMap((a: { weak_topics: string[] | null }) => a.weak_topics ?? [])
  )].slice(0, 5);

  const studentContext = `
Student: ${profile?.full_name ?? "Student"}
Location: ${profile?.city ?? "India"}, ${profile?.state ?? ""}
Study hours/day: ${profile?.study_hours_per_day ?? 4}
Preparing for: ${exams.join(", ") || "competitive exam"}
Weak topics: ${weakTopics.join(", ") || "not yet identified"}`;

  const mentorList = (mentors ?? []).map((m: {
    id: string; name: string; exam_cleared: string; rank_achieved: string | null;
    institution: string | null; price_per_session: number; rating: number;
    specialisation_tags: string[] | null; bio: string | null;
  }) =>
    `ID: ${m.id} | ${m.name} | Cleared: ${m.exam_cleared} | Rank: ${m.rank_achieved ?? "N/A"} | ` +
    `Price: ₹${m.price_per_session}/session | Rating: ${m.rating} | ` +
    `Tags: ${(m.specialisation_tags ?? []).join(", ")} | Bio: ${(m.bio ?? "").slice(0, 100)}`
  ).join("\n");

  const raw = await callClaude(
    "You are a mentor matching engine for Meritus. Return ONLY valid JSON, no prose.",
    `Match this student to the best 3 mentors from the list below.
${studentContext}

Mentors:
${mentorList}

Return JSON array with exactly 3 items:
[{
  "mentor_id": "...",
  "rank": 1,
  "match_score": 85,
  "match_reason": "One sentence explaining why this mentor is ideal for this student"
}]`,
    600,
  );

  let matches: MentorMatch[] = [];
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    matches = JSON.parse(jsonMatch ? jsonMatch[0] : raw) as MentorMatch[];
  } catch {
    matches = [];
  }

  return { matches };
}
