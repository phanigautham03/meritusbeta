/**
 * Marketing Agent — runs Monday 07:00 IST (after Analytics Agent).
 * Generates weekly social posts, email subject A/B variants, and insights.
 * Stores in marketing_content table for admin review.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { callClaude, logRunStart, logRunEnd, updateAgentLastRun } from "./agent-utils";

const EXAM_VERTICALS = ["JEE", "NEET", "UPSC", "CAT", "Banking"];

export async function runMarketingAgent(
  db: SupabaseClient,
): Promise<{ actionsCount: number; metadata: Record<string, unknown> }> {
  const runId = await logRunStart(db, "marketing");

  try {
    // Fetch basic usage stats from last 7 days to give Claude context
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const { count: tests } = await db.from("test_attempts").select("id", { count: "exact", head: true }).gte("submitted_at", weekAgo);
    const { count: signups } = await db.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo);

    const contextHint = `This week: ${signups ?? 0} new signups, ${tests ?? 0} tests taken.`;
    const contentRows: {
      content_type: string;
      platform?: string;
      exam_vertical?: string;
      content_text: string;
      ab_variant?: string;
    }[] = [];

    // 1. Generate 5 social posts (one per exam vertical)
    for (const exam of EXAM_VERTICALS) {
      const post = await callClaude(
        "You are a social media manager for Meritus, an Indian AI exam prep app. Write engaging, authentic posts. No corporate speak. Use 1-2 emojis. No hashtag spam.",
        `Write an Instagram/LinkedIn post for ${exam} aspirants promoting Meritus.
${contextHint}
Feature to highlight this week: Forget-Meter (tracks which topics you're forgetting using memory science).
Keep it under 150 words. End with a call to action: visit meritus.co.in.
Include 3 relevant hashtags at the end.`,
        400,
      );
      contentRows.push({ content_type: "social_post", platform: "instagram", exam_vertical: exam, content_text: post });
    }

    // 2. Generate 2 A/B email subject lines for the weekly newsletter
    const subjectRaw = await callClaude(
      "You are an email marketing expert. Return ONLY valid JSON, no prose.",
      `Generate 2 A/B test email subject lines for Meritus's weekly student newsletter.
This week's theme: retention and the Forget-Meter feature.
${contextHint}
Return JSON: [{"variant":"A","subject":"..."},{"variant":"B","subject":"..."}]`,
      200,
    );
    try {
      const match = subjectRaw.match(/\[[\s\S]*\]/);
      const subjects = JSON.parse(match ? match[0] : subjectRaw) as { variant: string; subject: string }[];
      for (const s of subjects) {
        contentRows.push({ content_type: "email_subject", ab_variant: s.variant, content_text: s.subject });
      }
    } catch {
      contentRows.push({ content_type: "email_subject", ab_variant: "A", content_text: subjectRaw.slice(0, 200) });
    }

    // 3. Generate one strategic insight
    const insight = await callClaude(
      "You are a growth analyst for an Indian EdTech startup. Be specific, data-aware, and practical.",
      `Based on these metrics: ${contextHint}
Write ONE strategic marketing insight or recommendation for the Meritus team this week. 2-3 sentences max. Plain text.`,
      200,
    );
    contentRows.push({ content_type: "insight", content_text: insight });

    // Insert all content
    if (contentRows.length > 0) {
      await db.from("marketing_content").insert(
        contentRows.map((r) => ({ ...r, status: "draft" })),
      );
    }

    const meta = { social_posts: EXAM_VERTICALS.length, subject_lines: 2, insights: 1, total: contentRows.length };
    await logRunEnd(db, runId, "success", contentRows.length, undefined, meta);
    await updateAgentLastRun(db, "marketing");
    return { actionsCount: contentRows.length, metadata: meta };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logRunEnd(db, runId, "error", 0, msg);
    throw err;
  }
}
