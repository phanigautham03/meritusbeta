/**
 * CRM Agent — runs daily at 08:00 IST
 * Sends 4 drip sequences based on user lifecycle stage.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { callClaude, sendEmail, brandedEmail, logRunStart, logRunEnd, updateAgentLastRun } from "./agent-utils";

const INDIGO = "#4338CA";

type Profile = {
  id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  onboarding_complete: boolean;
  plan: string;
};

type UserExam = { user_id: string; exam_name: string };
type TestAttempt = { user_id: string; submitted_at: string };
type EmailSeq = { user_id: string };

// ── Helper: days ago boundaries ────────────────────────────────────────────────

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

// ── Send one email and record it ───────────────────────────────────────────────

async function markSent(
  db: SupabaseClient,
  userId: string,
  emailType: string,
  email: string,
  subject: string,
  html: string,
): Promise<void> {
  await sendEmail({ to: email, subject, html });
  await db.from("email_sequences").upsert(
    { user_id: userId, email_type: emailType, sent_at: new Date().toISOString() },
    { onConflict: "user_id,email_type", ignoreDuplicates: true },
  );
}

// ── Sequence 1: Day 1 Welcome ──────────────────────────────────────────────────

async function runDay1(
  db: SupabaseClient,
  profiles: Profile[],
  examMap: Map<string, string[]>,
  authEmails: Map<string, string>,
  alreadySent: Set<string>,
): Promise<number> {
  const cutoffStart = daysAgo(2);
  const cutoffEnd   = daysAgo(1);
  const candidates = profiles.filter(
    (p) => p.created_at >= cutoffStart && p.created_at <= cutoffEnd && !alreadySent.has(`${p.id}:day1_welcome`),
  );

  let count = 0;
  for (const user of candidates) {
    const email = authEmails.get(user.id);
    if (!email) continue;
    const name = (user.full_name ?? email.split("@")[0]).split(" ")[0];
    const exams = examMap.get(user.id) ?? ["JEE"];
    const examList = exams.join(", ");

    const body = await callClaude(
      "You are a warm, encouraging onboarding assistant for Meritus, an AI exam prep platform for Indian competitive exams. Write concise, friendly HTML email body (no <html>/<head>/<body> tags). No filler phrases like 'I'm here to help'.",
      `Write a 100-word welcome email body for ${name} who is preparing for ${examList}. Mention Meritus's top 3 features: Forget-Meter, unlimited mock tests, AI Study Planner. End with a single CTA to take their first mock test. HTML only, no markdown.`,
      512,
    );

    const html = brandedEmail({
      title: `Welcome to Meritus, ${name}!`,
      preheader: `Your ${examList} prep journey starts now`,
      bodyHtml: `<h1 style="font-size:22px;color:#1E1B4B;margin:0 0 16px;">Welcome, ${name}! 🎉</h1>${body}`,
      ctaText: "Take Your First Mock Test",
      ctaUrl: "https://meritus.co.in/mock-tests",
    });

    await markSent(db, user.id, "day1_welcome", email, `Welcome to Meritus, ${name}!`, html);
    count++;
  }
  return count;
}

// ── Sequence 2: Day 3 — No test yet ───────────────────────────────────────────

async function runDay3(
  db: SupabaseClient,
  profiles: Profile[],
  examMap: Map<string, string[]>,
  authEmails: Map<string, string>,
  alreadySent: Set<string>,
  attemptUserIds: Set<string>,
): Promise<number> {
  const cutoffStart = daysAgo(4);
  const cutoffEnd   = daysAgo(3);
  const candidates = profiles.filter(
    (p) =>
      p.created_at >= cutoffStart &&
      p.created_at <= cutoffEnd &&
      !alreadySent.has(`${p.id}:day3_nudge`) &&
      !attemptUserIds.has(p.id),
  );

  let count = 0;
  for (const user of candidates) {
    const email = authEmails.get(user.id);
    if (!email) continue;
    const name = (user.full_name ?? email.split("@")[0]).split(" ")[0];
    const exams = examMap.get(user.id) ?? ["your exam"];
    const exam = exams[0];

    const bodyHtml = `
      <h1 style="font-size:20px;color:#1E1B4B;margin:0 0 12px;">Hey ${name}, still getting started? 👋</h1>
      <p style="font-size:15px;line-height:1.7;color:#374151;">You signed up for Meritus 3 days ago but haven't taken your first <strong>${exam}</strong> mock test yet.</p>
      <p style="font-size:15px;line-height:1.7;color:#374151;">It takes just 10 minutes to get your baseline score — and our AI will instantly show you exactly which topics need the most work.</p>
      <p style="font-size:14px;color:#6B7280;font-style:italic;">Most students who take a test in their first week are 2x more likely to stay on track till exam day.</p>`;

    const html = brandedEmail({
      title: `${name}, your first ${exam} test is waiting`,
      preheader: "Take a 10-minute test and get your baseline score",
      bodyHtml,
      ctaText: `Start My First ${exam} Test`,
      ctaUrl: "https://meritus.co.in/mock-tests",
    });

    await markSent(db, user.id, "day3_nudge", email, `${name}, your first ${exam} test is waiting`, html);
    count++;
  }
  return count;
}

// ── Sequence 3: Day 7 — Upgrade nudge (free users who took tests) ─────────────

async function runDay7(
  db: SupabaseClient,
  profiles: Profile[],
  examMap: Map<string, string[]>,
  authEmails: Map<string, string>,
  alreadySent: Set<string>,
  attemptUserIds: Set<string>,
): Promise<number> {
  const cutoffStart = daysAgo(8);
  const cutoffEnd   = daysAgo(7);
  const candidates = profiles.filter(
    (p) =>
      p.created_at >= cutoffStart &&
      p.created_at <= cutoffEnd &&
      p.plan === "free" &&
      !alreadySent.has(`${p.id}:day7_upgrade`) &&
      attemptUserIds.has(p.id),
  );

  let count = 0;
  for (const user of candidates) {
    const email = authEmails.get(user.id);
    if (!email) continue;
    const name = (user.full_name ?? email.split("@")[0]).split(" ")[0];
    const exams = examMap.get(user.id) ?? ["your exam"];
    const exam = exams[0];

    const bodyHtml = `
      <h1 style="font-size:20px;color:#1E1B4B;margin:0 0 12px;">Great first week, ${name}! 🚀</h1>
      <p style="font-size:15px;line-height:1.7;color:#374151;">You've been putting in the work for <strong>${exam}</strong>. Here's what Pro unlocks for you:</p>
      <ul style="font-size:14px;line-height:2;color:#374151;padding-left:20px;">
        <li><strong>Forget-Meter</strong> — know exactly what you're about to forget, before you forget it</li>
        <li><strong>Unlimited mock tests</strong> — no monthly cap</li>
        <li><strong>AI Study Planner</strong> — a weekly schedule built around your weak topics</li>
        <li><strong>Full analytics</strong> — time-per-question, accuracy trends, rank predictor</li>
      </ul>
      <p style="font-size:14px;color:#6B7280;">All features are free during beta. This is what's coming — join the waitlist for early-bird pricing.</p>`;

    const html = brandedEmail({
      title: `Unlock the full ${exam} prep engine, ${name}`,
      preheader: "See what Pro unlocks for your exam prep",
      bodyHtml,
      ctaText: "See Pro Plans",
      ctaUrl: "https://meritus.co.in/upgrade",
    });

    await markSent(db, user.id, "day7_upgrade", email, `Unlock the full ${exam} prep engine, ${name}`, html);
    count++;
  }
  return count;
}

// ── Sequence 4: Day 30 Re-engagement ─────────────────────────────────────────

async function runDay30(
  db: SupabaseClient,
  profiles: Profile[],
  examMap: Map<string, string[]>,
  authEmails: Map<string, string>,
  alreadySent: Set<string>,
): Promise<number> {
  const thirtyDaysAgo = daysAgo(30);
  const fourteenDaysAgo = daysAgo(14);
  const candidates = profiles.filter(
    (p) =>
      p.created_at <= thirtyDaysAgo &&
      p.updated_at <= fourteenDaysAgo &&
      !alreadySent.has(`${p.id}:day30_reengage`),
  );

  let count = 0;
  for (const user of candidates) {
    const email = authEmails.get(user.id);
    if (!email) continue;
    const name = (user.full_name ?? email.split("@")[0]).split(" ")[0];
    const exams = examMap.get(user.id) ?? ["your exam"];
    const exam = exams[0];

    const bodyHtml = `
      <h1 style="font-size:20px;color:#1E1B4B;margin:0 0 12px;">We miss you, ${name} 💙</h1>
      <p style="font-size:15px;line-height:1.7;color:#374151;">It's been a while since you last visited Meritus. Your <strong>${exam}</strong> prep is waiting — and we've added new content since you left.</p>
      <p style="font-size:15px;line-height:1.7;color:#374151;">Even 15 minutes a day keeps your retention scores healthy. Your Forget-Meter is tracking topics that need urgent revision.</p>
      <p style="font-size:14px;color:#6B7280;margin-top:8px;">Come back and see what needs revising — it takes less time than you think.</p>`;

    const html = brandedEmail({
      title: `${name}, your ${exam} prep needs you`,
      preheader: `Your Forget-Meter has flagged topics that need urgent revision`,
      bodyHtml,
      ctaText: "Check My Forget-Meter",
      ctaUrl: "https://meritus.co.in/forget-meter",
    });

    await markSent(db, user.id, "day30_reengage", email, `${name}, your ${exam} prep needs you`, html);
    count++;
  }
  return count;
}

// ── Main entrypoint ───────────────────────────────────────────────────────────

export async function runCrmAgent(db: SupabaseClient): Promise<{ actionsCount: number; metadata: Record<string, unknown> }> {
  const runId = await logRunStart(db, "crm");

  try {
    // Fetch all profiles
    const { data: profiles } = await db
      .from("profiles")
      .select("id, full_name, created_at, updated_at, onboarding_complete, plan");

    // Fetch user exams
    const { data: userExams } = await db
      .from("user_exams")
      .select("user_id, exam_name");

    // Fetch all test attempts (just user_ids for dedup)
    const { data: attempts } = await db
      .from("test_attempts")
      .select("user_id");

    // Fetch already-sent sequences
    const { data: sent } = await db
      .from("email_sequences")
      .select("user_id, email_type");

    // Fetch auth user emails via admin API
    const { data: authData } = await db.auth.admin.listUsers({ perPage: 1000 });

    const profileList = (profiles ?? []) as Profile[];
    const examMap = new Map<string, string[]>();
    for (const ue of (userExams ?? []) as UserExam[]) {
      const arr = examMap.get(ue.user_id) ?? [];
      arr.push(ue.exam_name);
      examMap.set(ue.user_id, arr);
    }
    const attemptUserIds = new Set((attempts ?? []).map((a: TestAttempt) => a.user_id));
    const alreadySent = new Set((sent ?? []).map((s: EmailSeq & { email_type: string }) => `${s.user_id}:${s.email_type}`));
    const authEmails = new Map<string, string>();
    for (const u of authData?.users ?? []) {
      if (u.email) authEmails.set(u.id, u.email);
    }

    const [d1, d3, d7, d30] = await Promise.all([
      runDay1(db, profileList, examMap, authEmails, alreadySent),
      runDay3(db, profileList, examMap, authEmails, alreadySent, attemptUserIds),
      runDay7(db, profileList, examMap, authEmails, alreadySent, attemptUserIds),
      runDay30(db, profileList, examMap, authEmails, alreadySent),
    ]);

    const total = d1 + d3 + d7 + d30;
    const meta = { day1_welcome: d1, day3_nudge: d3, day7_upgrade: d7, day30_reengage: d30 };
    await logRunEnd(db, runId, "success", total, undefined, meta);
    await updateAgentLastRun(db, "crm");
    return { actionsCount: total, metadata: meta };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logRunEnd(db, runId, "error", 0, msg);
    throw err;
  }
}
