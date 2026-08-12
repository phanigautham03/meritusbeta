import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Admin-only server functions — use service role key for full access
function adminSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!,
  );
}

import { ADMIN_EMAILS } from "@/lib/admin-config";

// ── Check if current user is admin ────────────────────────────────────────────
export const checkIsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  return { adminEmails: ADMIN_EMAILS };
});

// ── Platform metrics ──────────────────────────────────────────────────────────
export const getPlatformMetrics = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = adminSupabase();

  // User counts by plan
  const { data: profiles } = await supabase
    .from("profiles")
    .select("plan, created_at, onboarding_complete");

  const total = profiles?.length ?? 0;
  const free = profiles?.filter((p) => p.plan === "free").length ?? 0;
  const pro = profiles?.filter((p) => p.plan === "pro").length ?? 0;
  const power = profiles?.filter((p) => p.plan === "power").length ?? 0;
  const onboarded = profiles?.filter((p) => p.onboarding_complete).length ?? 0;

  // New signups last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const newLast7 = profiles?.filter((p) => p.created_at > sevenDaysAgo).length ?? 0;

  // Today's signups
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const newToday = profiles?.filter((p) => new Date(p.created_at) >= today).length ?? 0;

  // Test attempts
  const { count: totalAttempts } = await supabase
    .from("test_attempts")
    .select("*", { count: "exact", head: true });

  const todayISO = today.toISOString();
  const { count: attemptsToday } = await supabase
    .from("test_attempts")
    .select("*", { count: "exact", head: true })
    .gte("submitted_at", todayISO);

  // Estimated MRR (₹)
  const mrr = pro * 499 + power * 999;
  const arr = mrr * 12;

  return {
    total, free, pro, power, onboarded, newLast7, newToday,
    totalAttempts: totalAttempts ?? 0,
    attemptsToday: attemptsToday ?? 0,
    mrr, arr,
    conversionRate: total > 0 ? (((pro + power) / total) * 100).toFixed(1) : "0.0",
    onboardingRate: total > 0 ? ((onboarded / total) * 100).toFixed(1) : "0.0",
  };
});

// ── Recent users ──────────────────────────────────────────────────────────────
export const getRecentUsers = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = adminSupabase();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, plan, city, state, created_at, onboarding_complete")
    .order("created_at", { ascending: false })
    .limit(50);

  // Get auth emails
  const { data: authData } = await supabase.auth.admin.listUsers();
  const emailMap = new Map(
    (authData?.users ?? []).map((u) => [u.id, { email: u.email ?? "", lastSignIn: u.last_sign_in_at ?? "" }])
  );

  return (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap.get(p.id)?.email ?? "",
    lastSignIn: emailMap.get(p.id)?.lastSignIn ?? "",
  }));
});

// ── Signups over time (last 30 days) ─────────────────────────────────────────
export const getSignupTrend = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = adminSupabase();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("created_at, plan")
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: true });

  // Bucket by day
  const buckets: Record<string, { date: string; signups: number; paid: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    buckets[key] = { date: key, signups: 0, paid: 0 };
  }

  for (const p of profiles ?? []) {
    const key = p.created_at.split("T")[0];
    if (buckets[key]) {
      buckets[key].signups++;
      if (p.plan !== "free") buckets[key].paid++;
    }
  }

  return Object.values(buckets);
});

// ── Test attempt activity (last 30 days) ──────────────────────────────────────
export const getActivityTrend = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = adminSupabase();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: attempts } = await supabase
    .from("test_attempts")
    .select("submitted_at, score, total_marks")
    .gte("submitted_at", thirtyDaysAgo);

  const buckets: Record<string, { date: string; attempts: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    buckets[key] = { date: key, attempts: 0 };
  }

  for (const a of attempts ?? []) {
    const key = a.submitted_at.split("T")[0];
    if (buckets[key]) buckets[key].attempts++;
  }

  return Object.values(buckets);
});

// ── All users for email campaigns ─────────────────────────────────────────────
export const getFreeUserEmails = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = adminSupabase();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("plan", "free");

  const { data: authData } = await supabase.auth.admin.listUsers();
  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  return (profiles ?? [])
    .map((p) => ({ id: p.id, name: p.full_name ?? "there", email: emailMap.get(p.id) ?? "" }))
    .filter((u) => u.email);
});

// ── Send bulk marketing email ─────────────────────────────────────────────────
export const dispatchMarketingEmail = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      subject: z.string().min(5),
      bodyHtml: z.string().min(10),
    }).parse(i)
  )
  .handler(async ({ data }) => {
    const supabase = adminSupabase();

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("plan", "free");

    const { data: authData } = await supabase.auth.admin.listUsers();
    const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

    const apiKey = process.env.RESEND_API_KEY;
    let sent = 0; let failed = 0;

    for (const profile of profiles ?? []) {
      const email = emailMap.get(profile.id);
      if (!email) continue;
      const firstName = ((profile.full_name as string | undefined) ?? "there").split(" ")[0];

      if (!apiKey) { sent++; continue; } // dev mode

      const html = `<html><body style="font-family:Inter,sans-serif;padding:32px;max-width:560px;margin:auto;">
        <div style="background:#1E1B4B;padding:20px 28px;border-radius:12px 12px 0 0;">
          <div style="color:#fff;font-size:20px;font-weight:700;">Meritus</div>
          <div style="color:#A5B4FC;font-size:11px;letter-spacing:2px;">MERIT, MASTERED.</div>
        </div>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:0 0 12px 12px;padding:28px;">
          <p>Hi <strong>${firstName}</strong>,</p>
          ${data.bodyHtml}
          <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;"/>
          <p style="font-size:12px;color:#9CA3AF;">© ${new Date().getFullYear()} Meritus · <a href="https://meritus.co.in">meritus.co.in</a></p>
        </div>
      </body></html>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "Meritus <noreply@meritus.co.in>", to: [email], subject: data.subject, html }),
      });

      res.ok ? sent++ : failed++;
      await new Promise((r) => setTimeout(r, 500)); // rate limit
    }

    return { sent, failed, total: (profiles ?? []).length };
  });
