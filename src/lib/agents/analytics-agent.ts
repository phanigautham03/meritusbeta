/**
 * Analytics Agent — runs Monday 07:00 IST.
 * Queries Supabase for the week's metrics, calls Claude to generate
 * a business summary, and emails it to admin.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { callClaude, sendEmail, brandedEmail, logRunStart, logRunEnd, updateAgentLastRun } from "./agent-utils";

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

export async function runAnalyticsAgent(
  db: SupabaseClient,
): Promise<{ actionsCount: number; metadata: Record<string, unknown> }> {
  const runId = await logRunStart(db, "analytics");

  try {
    const weekAgo = daysAgo(7);

    // New signups this week
    const { count: newSignups } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo);

    // Total users
    const { count: totalUsers } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true });

    // Onboarding complete
    const { count: onboarded } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("onboarding_complete", true);

    // Plans
    const { data: planData } = await db
      .from("profiles")
      .select("plan");
    const plans = planData ?? [];
    const freePlan = plans.filter((p: { plan: string }) => p.plan === "free").length;
    const proPlan  = plans.filter((p: { plan: string }) => p.plan === "pro").length;
    const powerPlan= plans.filter((p: { plan: string }) => p.plan === "power").length;

    // Tests this week
    const { count: testsThisWeek } = await db
      .from("test_attempts")
      .select("id", { count: "exact", head: true })
      .gte("submitted_at", weekAgo);

    // Total tests ever
    const { count: totalTests } = await db
      .from("test_attempts")
      .select("id", { count: "exact", head: true });

    // Support tickets this week
    const { count: supportTickets } = await db
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .gte("received_at", weekAgo);
    const { count: resolvedTickets } = await db
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "sent")
      .gte("received_at", weekAgo);

    // Pending content
    const { count: pendingMCQs } = await db
      .from("pending_questions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    // CRM emails sent this week
    const { count: emailsSent } = await db
      .from("email_sequences")
      .select("id", { count: "exact", head: true })
      .gte("sent_at", weekAgo);

    const statsText = `
MERITUS WEEKLY METRICS:
- New signups this week: ${newSignups ?? 0}
- Total users: ${totalUsers ?? 0}
- Onboarding complete: ${onboarded ?? 0} (${totalUsers ? Math.round((onboarded ?? 0) / (totalUsers ?? 1) * 100) : 0}%)
- Plan breakdown: Free=${freePlan}, Pro=${proPlan}, Power=${powerPlan}
- Tests taken this week: ${testsThisWeek ?? 0}
- Total tests all time: ${totalTests ?? 0}
- Support tickets this week: ${supportTickets ?? 0} (resolved: ${resolvedTickets ?? 0})
- CRM emails sent this week: ${emailsSent ?? 0}
- MCQs pending admin review: ${pendingMCQs ?? 0}`;

    // Claude generates the business summary
    const summary = await callClaude(
      "You are a business analyst for Meritus, an Indian EdTech startup. Write a concise weekly business report in HTML (no html/head/body tags). Use bullet points. Be direct, actionable, and honest about what needs attention.",
      `Based on these metrics, write a weekly business report with 4 sections:
1. "This Week in Numbers" (3-4 bullet highlights)
2. "What's Working" (positive signals)
3. "Needs Attention" (risks or weak points)
4. "Recommended Action This Week" (1-2 specific things to do)

${statsText}

HTML only, use <h3> for section headers, <ul><li> for bullets. Keep it under 300 words.`,
      800,
    );

    const weekNum = Math.ceil((Date.now() - new Date("2026-01-01").getTime()) / (7 * 86_400_000));
    const html = brandedEmail({
      title: `Meritus Week ${weekNum} Report`,
      preheader: `${newSignups ?? 0} new signups · ${testsThisWeek ?? 0} tests taken this week`,
      bodyHtml: `
        <h1 style="font-size:20px;color:#1E1B4B;margin:0 0 8px;">Weekly Report — Week ${weekNum}</h1>
        <p style="font-size:12px;color:#9CA3AF;margin:0 0 20px;">${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        <div style="background:#F5F3FF;border-left:4px solid #4338CA;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;font-size:13px;line-height:1.8;color:#374151;">
          👥 ${totalUsers ?? 0} total users &nbsp;·&nbsp; 📝 ${totalTests ?? 0} total tests &nbsp;·&nbsp; 📧 ${emailsSent ?? 0} CRM emails sent
        </div>
        ${summary}`,
      ctaText: "Open Admin Dashboard",
      ctaUrl: "https://meritus.co.in/admin",
    });

    await sendEmail({
      to: "phanigautham03@gmail.com",
      subject: `Meritus Week ${weekNum} Report — ${newSignups ?? 0} signups, ${testsThisWeek ?? 0} tests`,
      html,
      from: "Meritus Analytics <agents@meritus.co.in>",
    });

    const meta = { new_signups: newSignups, total_users: totalUsers, tests_this_week: testsThisWeek };
    await logRunEnd(db, runId, "success", 1, undefined, meta);
    await updateAgentLastRun(db, "analytics");
    return { actionsCount: 1, metadata: meta };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logRunEnd(db, runId, "error", 0, msg);
    throw err;
  }
}
