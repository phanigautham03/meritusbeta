import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ── Brand colours (inlined for email HTML) ────────────────────────────────────
const NAVY   = "#1E1B4B";
const INDIGO = "#4338CA";
const GOLD   = "#D97706";
const SOFT   = "#F5F3FF";
const SUCCESS= "#059669";

// ── Base email wrapper ─────────────────────────────────────────────────────────
function baseEmail(title: string, previewText: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
  body{margin:0;padding:0;background:#F5F3FF;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
  .wrapper{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(67,56,202,.10);}
  .header{background:${NAVY};padding:28px 36px 24px;}
  .logo-text{font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.3px;}
  .tagline{font-size:11px;color:#A5B4FC;letter-spacing:2px;margin-top:2px;}
  .body{padding:32px 36px;}
  h1{margin:0 0 8px;font-size:22px;font-weight:700;color:${NAVY};}
  p{margin:0 0 16px;font-size:15px;line-height:1.65;color:#374151;}
  .btn{display:inline-block;padding:14px 32px;background:${INDIGO};color:#fff !important;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;margin:8px 0;}
  .divider{height:1px;background:#E5E7EB;margin:24px 0;}
  .badge{display:inline-block;padding:4px 12px;background:${SOFT};color:${INDIGO};border-radius:100px;font-size:12px;font-weight:600;}
  .stat-row{display:flex;gap:12px;margin:20px 0;}
  .stat{flex:1;background:${SOFT};border-radius:12px;padding:14px;text-align:center;}
  .stat-num{font-size:22px;font-weight:700;color:${NAVY};}
  .stat-lbl{font-size:11px;color:#6B7280;margin-top:2px;}
  .footer{background:#F9FAFB;padding:20px 36px;border-top:1px solid #E5E7EB;}
  .footer p{font-size:12px;color:#9CA3AF;margin:0;}
  .gold{color:${GOLD};font-weight:700;}
  .success{color:${SUCCESS};font-weight:700;}
  ul{margin:0 0 16px;padding-left:20px;}
  li{font-size:15px;line-height:1.7;color:#374151;}
  .highlight-box{background:${SOFT};border-left:4px solid ${INDIGO};border-radius:0 10px 10px 0;padding:16px 20px;margin:16px 0;}
</style>
</head>
<body>
<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>
<div class="wrapper">
  <div class="header">
    <div class="logo-text">Meritus</div>
    <div class="tagline">MERIT, MASTERED.</div>
  </div>
  <div class="body">${body}</div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Meritus · <a href="https://meritus.co.in" style="color:#4338CA;">meritus.co.in</a></p>
    <p style="margin-top:6px;">Questions? Reply to this email or write to <a href="mailto:support@meritus.co.in" style="color:#4338CA;">support@meritus.co.in</a></p>
    <p style="margin-top:6px;"><a href="https://meritus.co.in/privacy" style="color:#9CA3AF;">Privacy Policy</a> · <a href="https://meritus.co.in/terms" style="color:#9CA3AF;">Terms</a> · <a href="https://meritus.co.in/refund" style="color:#9CA3AF;">Refund Policy</a></p>
  </div>
</div>
</body>
</html>`;
}

// ── Email template builders ────────────────────────────────────────────────────

export function buildWelcomeEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: `Welcome to Meritus, ${firstName}! Your merit journey starts now 🎯`,
    html: baseEmail(
      "Welcome to Meritus",
      `Hi ${firstName}, your Meritus account is ready. Let's crack your target exam together.`,
      `
      <h1>Welcome, ${firstName}! 🎉</h1>
      <p>You've just joined <strong>India's first AI-powered all-exam preparation platform</strong>. Whether you're targeting JEE, NEET, UPSC, GATE, CAT, or any of 200+ other exams — Meritus is built to get you there.</p>

      <div class="highlight-box">
        <strong>Your account is active.</strong> Here's what to do in the next 10 minutes:
      </div>

      <ul>
        <li><strong>Complete onboarding</strong> — tell us which exam you're targeting and your study schedule.</li>
        <li><strong>Take your first mock test</strong> — our NTA-style simulator replicates the real exam interface.</li>
        <li><strong>Check your Forget-Meter</strong> — AI tracks which topics you're likely to forget using the Ebbinghaus curve.</li>
        <li><strong>Try ExamMatch AI</strong> — get a personalised exam recommendation based on your profile.</li>
      </ul>

      <a class="btn" href="https://meritus.co.in/dashboard">Open My Dashboard →</a>

      <div class="divider"></div>
      <p style="font-size:13px;color:#6B7280;">Free users get 3 mock tests/month. <a href="https://meritus.co.in/upgrade" style="color:${INDIGO};">Upgrade to Pro</a> for unlimited tests, AI Study Planner, and Forget-Meter.</p>
      `
    ),
  };
}

export function buildLoginEmail(firstName: string, loginTime: string, device?: string): { subject: string; html: string } {
  return {
    subject: `Login confirmed — welcome back, ${firstName}`,
    html: baseEmail(
      "Login to Meritus",
      `Hi ${firstName}, we detected a new login to your Meritus account. If this wasn't you, secure your account immediately.`,
      `
      <h1>New login to your account</h1>
      <p>Hi <strong>${firstName}</strong>, we noticed a successful login to your Meritus account.</p>

      <div class="stat-row">
        <div class="stat">
          <div class="stat-num" style="font-size:14px;">${loginTime}</div>
          <div class="stat-lbl">Login Time (IST)</div>
        </div>
        <div class="stat">
          <div class="stat-num" style="font-size:14px;">${device || "Web Browser"}</div>
          <div class="stat-lbl">Device</div>
        </div>
      </div>

      <div class="highlight-box">
        <strong>Not you?</strong> If you did not log in, <a href="https://meritus.co.in/profile" style="color:${INDIGO};">change your password immediately</a> and contact us at <a href="mailto:security@meritus.co.in" style="color:${INDIGO};">security@meritus.co.in</a>.
      </div>

      <a class="btn" href="https://meritus.co.in/dashboard">Go to Dashboard →</a>

      <div class="divider"></div>
      <p style="font-size:13px;color:#6B7280;">This is an automated security notification. You cannot unsubscribe from security emails.</p>
      `
    ),
  };
}

export function buildUpgradeEmail(
  firstName: string,
  plan: "pro" | "power",
  paymentId: string,
  billing: "monthly" | "annual",
  amount: number,
): { subject: string; html: string } {
  const planLabel = plan === "power" ? "Power" : "Pro";
  const planColor = plan === "power" ? GOLD : INDIGO;
  const features = plan === "power"
    ? ["Unlimited mock tests", "Full analytics & rank predictor", "AI Study Planner", "Forget-Meter AI", "1-on-1 Mentor Sessions", "Voice AI Tutor", "Priority support", "Custom study plan"]
    : ["Unlimited mock tests", "Full analytics & rank predictor", "AI Study Planner", "Forget-Meter AI", "ExamMatch AI recommendations"];

  return {
    subject: `You're now on Meritus ${planLabel}! 🚀 Receipt enclosed`,
    html: baseEmail(
      `Meritus ${planLabel} — Welcome`,
      `Congratulations ${firstName}! Your Meritus ${planLabel} subscription is active. Here's your receipt.`,
      `
      <div style="text-align:center;padding:8px 0 24px;">
        <div style="display:inline-block;padding:8px 20px;background:${planColor};border-radius:100px;color:#fff;font-weight:700;font-size:16px;">
          Meritus ${planLabel} · Active
        </div>
      </div>

      <h1>Congratulations, ${firstName}! 🎉</h1>
      <p>Your <strong>Meritus ${planLabel}</strong> subscription is now active. You have unlocked the full power of AI-driven exam preparation.</p>

      <div class="highlight-box">
        <strong>Payment Receipt</strong><br/>
        Amount: <strong>₹${(amount / 100).toLocaleString("en-IN")}</strong> (${billing})<br/>
        Payment ID: <span style="font-family:monospace;font-size:13px;">${paymentId}</span><br/>
        Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </div>

      <p><strong>What's unlocked for you:</strong></p>
      <ul>
        ${features.map((f) => `<li>${f}</li>`).join("")}
      </ul>

      <a class="btn" href="https://meritus.co.in/dashboard">Start using ${planLabel} features →</a>

      <div class="divider"></div>
      <p style="font-size:13px;color:#6B7280;">
        Need a GST invoice? Email <a href="mailto:billing@meritus.co.in" style="color:${INDIGO};">billing@meritus.co.in</a> with your GSTIN.<br/>
        Refund policy: <a href="https://meritus.co.in/refund" style="color:${INDIGO};">7-day money-back guarantee</a> on first-time subscriptions.
      </p>
      `
    ),
  };
}

export function buildMarketingEmail(
  firstName: string,
  subject: string,
  bodyHtml: string,
): { subject: string; html: string } {
  return {
    subject,
    html: baseEmail(subject, `Hi ${firstName}, ${subject}`, bodyHtml),
  };
}

// ── Core email sender (server-only) ───────────────────────────────────────────
async function sendViaResend(to: string, subject: string, html: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return { ok: true }; // silent skip in dev
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Meritus <noreply@meritus.co.in>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Resend error:", err);
    return { ok: false, error: err };
  }

  const data = (await res.json()) as { id: string };
  return { ok: true, id: data.id };
}

// ── Server functions (callable from client via useServerFn) ───────────────────

export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({ email: z.string().email(), firstName: z.string() }).parse(i)
  )
  .handler(async ({ data }) => {
    const { subject, html } = buildWelcomeEmail(data.firstName);
    return sendViaResend(data.email, subject, html);
  });

export const sendLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({ email: z.string().email(), firstName: z.string() }).parse(i)
  )
  .handler(async ({ data }) => {
    const now = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const { subject, html } = buildLoginEmail(data.firstName, now);
    return sendViaResend(data.email, subject, html);
  });

export const sendUpgradeEmailFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      email: z.string().email(),
      firstName: z.string(),
      plan: z.enum(["pro", "power"]),
      paymentId: z.string(),
      billing: z.enum(["monthly", "annual"]),
      amount: z.number(),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    const { subject, html } = buildUpgradeEmail(
      data.firstName, data.plan, data.paymentId, data.billing, data.amount
    );
    return sendViaResend(data.email, subject, html);
  });

export const sendBulkMarketingEmail = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      subject: z.string().min(5),
      bodyHtml: z.string().min(10),
      adminSecret: z.string(),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    // Basic admin gate
    if (data.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("Unauthorized");
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!,
    );

    // Fetch all free users with confirmed emails
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, full_name, plan")
      .eq("plan", "free");

    if (error) throw new Error(error.message);

    // Get auth emails via admin API
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const emailMap = new Map(
      (authUsers?.users ?? []).map((u) => [u.id, u.email ?? ""])
    );

    let sent = 0;
    let failed = 0;

    for (const user of users ?? []) {
      const email = emailMap.get(user.id);
      if (!email) continue;
      const firstName = (user.full_name ?? "there").split(" ")[0];
      const { subject, html } = buildMarketingEmail(firstName, data.subject, data.bodyHtml);
      const r = await sendViaResend(email, subject, html);
      r.ok ? sent++ : failed++;
      // Rate-limit: 2 emails/sec (Resend free: 100/day, paid: unlimited)
      await new Promise((res) => setTimeout(res, 500));
    }

    return { sent, failed, total: (users ?? []).length };
  });
