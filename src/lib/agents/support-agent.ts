/**
 * Support Agent — runs every 30 minutes via cron.
 * Reads pending support_tickets, drafts AI replies, auto-sends high-confidence
 * replies in whitelisted categories, flags the rest for human review.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { callClaude, sendEmail, logRunStart, logRunEnd, updateAgentLastRun, getAgentConfig } from "./agent-utils";

const SYSTEM_PROMPT = `You are a friendly, helpful customer support agent for Meritus, an AI-powered competitive exam prep platform in India.
You always respond in clear, simple English. You are warm but concise (under 150 words).
Meritus covers JEE, NEET, UPSC, CAT, GATE, Banking, SSC, CUET, and State PSC exams.
Common issues: password reset (direct to /login → "Forgot password"), test not saved (explain local-storage auto-save, suggest retaking), billing (all features free during beta), account issues (contact hello@meritus.co.in).
You MUST respond with valid JSON only — no prose outside the JSON.`;

type Ticket = {
  id: string;
  from_email: string;
  subject: string | null;
  body: string;
};

type AiResponse = {
  category: string;
  draft_reply: string;
  confidence: number;
  needs_human: boolean;
};

// ── Standard reply templates (used when Claude confidence is high) ─────────────

const TEMPLATES: Record<string, { subject: string; body: string }> = {
  password_reset: {
    subject: "Re: Password Reset — Meritus",
    body: `<p>Hi there,</p>
<p>To reset your password, go to <a href="https://meritus.co.in/login">meritus.co.in/login</a> and click <strong>"Forgot password?"</strong> below the sign-in button. You'll receive a reset link in your email within a minute.</p>
<p>If you don't see it, please check your spam folder.</p>
<p>Let us know if you need any further help!</p>
<p>Warm regards,<br/>Meritus Support</p>`,
  },
  test_not_saved: {
    subject: "Re: Test Results — Meritus",
    body: `<p>Hi there,</p>
<p>We're sorry to hear your test didn't save as expected. Meritus auto-saves your answers every 30 seconds to local storage as a backup, so a sudden page close can sometimes cause this.</p>
<p>Your completed tests should appear in <a href="https://meritus.co.in/mock-tests">My Results</a>. If the test isn't there, it's possible the session timed out before submission.</p>
<p>We'd recommend retaking the test — your next attempt will be fully recorded. We're actively working on more robust save handling.</p>
<p>Thanks for your patience!</p>
<p>Warm regards,<br/>Meritus Support</p>`,
  },
};

export async function runSupportAgent(
  db: SupabaseClient,
): Promise<{ actionsCount: number; metadata: Record<string, unknown> }> {
  const runId = await logRunStart(db, "support");

  try {
    const config = await getAgentConfig(db, "support");
    const autoSendCategories = (config.auto_send_categories as string[]) ?? ["password_reset", "test_not_saved"];

    // Fetch pending tickets
    const { data: tickets } = await db
      .from("support_tickets")
      .select("id, from_email, subject, body")
      .eq("status", "pending")
      .order("received_at", { ascending: true })
      .limit(20);

    const pendingTickets = (tickets ?? []) as Ticket[];
    let autoSent = 0;
    let flagged = 0;

    for (const ticket of pendingTickets) {
      try {
        // Ask Claude to classify and draft
        const aiRaw = await callClaude(
          SYSTEM_PROMPT,
          `Support email from ${ticket.from_email}:
Subject: ${ticket.subject ?? "(no subject)"}
Body: ${ticket.body.slice(0, 800)}

Respond with JSON:
{
  "category": "password_reset|test_not_saved|refund|account_issue|general",
  "draft_reply": "<HTML reply here>",
  "confidence": 0.0-1.0,
  "needs_human": true/false
}`,
          800,
        );

        let ai: AiResponse;
        try {
          const jsonMatch = aiRaw.match(/\{[\s\S]*\}/);
          ai = JSON.parse(jsonMatch ? jsonMatch[0] : aiRaw) as AiResponse;
        } catch {
          // JSON parse failed — flag for human
          await db.from("support_tickets").update({
            status: "pending_review",
            ai_draft_reply: aiRaw,
            category: "general",
            confidence: 0,
            needs_human: true,
          }).eq("id", ticket.id);
          flagged++;
          continue;
        }

        const shouldAutoSend =
          ai.confidence >= 0.92 &&
          !ai.needs_human &&
          autoSendCategories.includes(ai.category);

        if (shouldAutoSend) {
          // Use template if available, otherwise use Claude draft
          const template = TEMPLATES[ai.category];
          const replySubject = template ? template.subject : `Re: ${ticket.subject ?? "Your Meritus Query"}`;
          const replyHtml = template
            ? `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;color:#374151;">${template.body}</body></html>`
            : ai.draft_reply;

          await sendEmail({
            to: ticket.from_email,
            subject: replySubject,
            html: replyHtml,
            from: "Meritus Support <support@meritus.co.in>",
            replyTo: "support@meritus.co.in",
          });

          await db.from("support_tickets").update({
            status: "sent",
            category: ai.category,
            ai_draft_reply: replyHtml,
            confidence: ai.confidence,
            needs_human: false,
            handled_by: "AI",
            handled_at: new Date().toISOString(),
          }).eq("id", ticket.id);

          autoSent++;
        } else {
          await db.from("support_tickets").update({
            status: "pending_review",
            category: ai.category,
            ai_draft_reply: ai.draft_reply,
            confidence: ai.confidence,
            needs_human: true,
          }).eq("id", ticket.id);
          flagged++;
        }
      } catch (ticketErr) {
        console.error(`[support-agent] error processing ticket ${ticket.id}:`, ticketErr);
        await db.from("support_tickets").update({ status: "pending_review", needs_human: true }).eq("id", ticket.id);
        flagged++;
      }
    }

    const meta = { auto_sent: autoSent, flagged_for_review: flagged, total_processed: pendingTickets.length };
    await logRunEnd(db, runId, "success", autoSent + flagged, undefined, meta);
    await updateAgentLastRun(db, "support");
    return { actionsCount: autoSent + flagged, metadata: meta };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logRunEnd(db, runId, "error", 0, msg);
    throw err;
  }
}
