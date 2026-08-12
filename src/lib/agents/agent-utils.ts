/**
 * Shared utilities for all Meritus AI agents.
 * Every agent imports from here — do not inline these patterns.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Supabase admin client (service-role, bypasses RLS) ────────────────────────

export function adminSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key);
}

// ── Claude API call ───────────────────────────────────────────────────────────

export async function callClaude(
  system: string,
  userPrompt: string,
  maxTokens = 1024,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error ${res.status}: ${text}`);
  }

  const json = await res.json() as { content?: { type: string; text: string }[] };
  return json.content?.find((c) => c.type === "text")?.text ?? "";
}

// ── Resend email sender ───────────────────────────────────────────────────────

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.warn("[agent] RESEND_API_KEY not set — skipping email"); return; }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: opts.from ?? "Meritus <noreply@meritus.co.in>",
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      reply_to: opts.replyTo,
    }),
  });
}

// ── Agent run logging ─────────────────────────────────────────────────────────

export async function logRunStart(
  db: SupabaseClient,
  agentName: string,
): Promise<string> {
  const { data } = await db
    .from("agent_runs")
    .insert({ agent_name: agentName, status: "running" })
    .select("id")
    .single();
  return data?.id ?? "unknown";
}

export async function logRunEnd(
  db: SupabaseClient,
  runId: string,
  status: "success" | "error",
  actionsCount: number,
  errorMessage?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await db.from("agent_runs").update({
    status,
    finished_at: new Date().toISOString(),
    actions_taken: actionsCount,
    error_message: errorMessage ?? null,
    metadata: metadata ?? {},
  }).eq("id", runId);

  // Update agent_config.last_run_at — extract agent name from the run id
  // (agent name is already stored in the run row, but we need it here)
}

export async function updateAgentLastRun(
  db: SupabaseClient,
  agentName: string,
): Promise<void> {
  await db.from("agent_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("agent_name", agentName);
}

export async function isAgentEnabled(
  db: SupabaseClient,
  agentName: string,
): Promise<boolean> {
  const { data } = await db
    .from("agent_config")
    .select("is_enabled")
    .eq("agent_name", agentName)
    .single();
  return data?.is_enabled ?? false;
}

export async function getAgentConfig(
  db: SupabaseClient,
  agentName: string,
): Promise<Record<string, unknown>> {
  const { data } = await db
    .from("agent_config")
    .select("config")
    .eq("agent_name", agentName)
    .single();
  return (data?.config as Record<string, unknown>) ?? {};
}

// ── Branded email wrapper ─────────────────────────────────────────────────────

const NAVY   = "#1E1B4B";
const INDIGO = "#4338CA";
const GOLD   = "#D97706";

export function brandedEmail(opts: {
  title: string;
  preheader: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const cta = opts.ctaText && opts.ctaUrl
    ? `<div style="text-align:center;margin:28px 0;">
        <a href="${opts.ctaUrl}" style="display:inline-block;padding:14px 36px;background:${INDIGO};color:#fff;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">
          ${opts.ctaText}
        </a>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${opts.title}</title></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(67,56,202,.10);">
    <div style="background:${NAVY};padding:24px 32px;">
      <div style="font-size:20px;font-weight:700;color:#fff;">Meritus</div>
      <div style="font-size:10px;color:#A5B4FC;letter-spacing:2px;margin-top:2px;">MERIT, MASTERED.</div>
    </div>
    <div style="padding:32px 36px;">
      ${opts.bodyHtml}
      ${cta}
    </div>
    <div style="background:#F9FAFB;padding:14px 32px;border-top:1px solid #E5E7EB;font-size:12px;color:#9CA3AF;text-align:center;">
      Meritus · meritus.co.in ·
      <a href="https://meritus.co.in/profile" style="color:${INDIGO};">Manage preferences</a>
    </div>
  </div>
</body></html>`;
}

// ── Admin alert email ─────────────────────────────────────────────────────────

export async function alertAdmin(subject: string, bodyHtml: string): Promise<void> {
  await sendEmail({
    to: "phanigautham03@gmail.com",
    subject: `[Meritus Alert] ${subject}`,
    html: brandedEmail({
      title: subject,
      preheader: subject,
      bodyHtml: `<h2 style="color:#DC2626;font-size:18px;margin:0 0 16px;">⚠️ ${subject}</h2>${bodyHtml}`,
    }),
    from: "Meritus Agents <agents@meritus.co.in>",
  });
}
