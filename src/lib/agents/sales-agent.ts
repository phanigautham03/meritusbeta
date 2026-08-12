/**
 * Sales Agent — triggered via Supabase webhook on test_attempts INSERT.
 * Fires when a free user hits their 3rd test of the month.
 * Sends a personalised upgrade email referencing their actual weak topics.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { callClaude, sendEmail, brandedEmail, logRunStart, logRunEnd } from "./agent-utils";

export async function runSalesAgent(
  db: SupabaseClient,
  userId: string,
): Promise<{ sent: boolean; reason: string }> {
  const runId = await logRunStart(db, "sales");

  try {
    // 1. Check plan
    const { data: profile } = await db
      .from("profiles")
      .select("plan, full_name")
      .eq("id", userId)
      .single();

    if (!profile || profile.plan !== "free") {
      await logRunEnd(db, runId, "success", 0, undefined, { skipped: "not free plan" });
      return { sent: false, reason: "not_free_plan" };
    }

    // 2. Count tests this calendar month
    const monthStart = new Date();
    monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const { count } = await db
      .from("test_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("submitted_at", monthStart.toISOString());

    if ((count ?? 0) < 3) {
      await logRunEnd(db, runId, "success", 0, undefined, { skipped: "less than 3 tests" });
      return { sent: false, reason: "under_limit" };
    }

    // 3. Check if already sent a sales email
    const { data: existing } = await db
      .from("email_sequences")
      .select("id")
      .eq("user_id", userId)
      .eq("email_type", "sales_upgrade")
      .single();

    if (existing) {
      await logRunEnd(db, runId, "success", 0, undefined, { skipped: "already sent" });
      return { sent: false, reason: "already_sent" };
    }

    // 4. Gather context: exam names + weak topics
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

    const exams = (userExams ?? []).map((e: { exam_name: string }) => e.exam_name);
    const exam = exams[0] ?? "competitive exam";
    const allWeakTopics = (attempts ?? [])
      .flatMap((a: { weak_topics: string[] | null }) => a.weak_topics ?? [])
      .slice(0, 6);
    const weakTopics = [...new Set(allWeakTopics)].slice(0, 4);
    const avgScore = attempts?.length
      ? Math.round(attempts.reduce((s: number, a: { score: number; total_marks: number }) => s + (a.score / a.total_marks) * 100, 0) / attempts.length)
      : null;

    // 5. Get email
    const { data: authUser } = await db.auth.admin.getUserById(userId);
    const email = authUser?.user?.email;
    if (!email) {
      await logRunEnd(db, runId, "success", 0, undefined, { skipped: "no email" });
      return { sent: false, reason: "no_email" };
    }

    const name = (profile.full_name ?? email.split("@")[0]).split(" ")[0];

    // 6. Claude personalises the email
    const weakTopicStr = weakTopics.length > 0
      ? weakTopics.join(", ")
      : "several key topics";
    const scoreHint = avgScore ? `Their average score is ${avgScore}%.` : "";

    const emailBody = await callClaude(
      "You are a warm sales assistant for Meritus, an AI exam prep platform. Write HTML email body (no html/head/body tags, no markdown). Be specific about the user's data. Avoid being pushy.",
      `Write a 120-word upgrade email for ${name} who is preparing for ${exam}.
       They've hit their free plan limit (3 tests/month). ${scoreHint}
       Their weak topics are: ${weakTopicStr}.
       Mention exactly how Pro's Forget-Meter and unlimited tests help with these specific topics.
       End with a benefit statement about early-bird beta pricing. HTML only.`,
      600,
    );

    const html = brandedEmail({
      title: `You've hit your test limit, ${name}`,
      preheader: `Your ${exam} weak areas identified — here's how to fix them`,
      bodyHtml: `<h1 style="font-size:20px;color:#1E1B4B;margin:0 0 12px;">You've completed your 3 free tests, ${name} 🎯</h1>${emailBody}`,
      ctaText: "Join the Pro Waitlist",
      ctaUrl: "https://meritus.co.in/upgrade",
    });

    await sendEmail({
      to: email,
      subject: `${name}, your ${exam} weak spots identified — here's the fix`,
      html,
    });

    await db.from("email_sequences").insert({
      user_id: userId,
      email_type: "sales_upgrade",
      sent_at: new Date().toISOString(),
    });

    await logRunEnd(db, runId, "success", 1, undefined, { exam, weak_topics: weakTopics });
    return { sent: true, reason: "sent" };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logRunEnd(db, runId, "error", 0, msg);
    throw err;
  }
}
