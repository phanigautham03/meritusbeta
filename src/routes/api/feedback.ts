import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const TEAM_EMAIL = "hello@meritus.co.in";

async function notifyTeam(body: Record<string, unknown>): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // skip in dev

  const nps = body.nps as number | null;
  const ratings = body.ratings as Record<string, number> | null ?? {};
  const wishlist = (body.wishlist as string[] | null ?? []).join(", ") || "—";
  const userEmail = (body.email as string | null) || "anonymous";
  const bugDesc = (body.bugDesc as string | null) || "";
  const whatWorks = (body.whatWorks as string | null) || "";
  const whatNeeds = (body.whatNeeds as string | null) || "";
  const story = body.story as Record<string, string> | null ?? {};

  const ratingRows = Object.entries(ratings)
    .map(([k, v]) => `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:13px;">${k.replace(/_/g, " ")}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-weight:700;color:#4338CA;">${v}/10</td></tr>`)
    .join("");

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">
      <div style="background:#1E1B4B;padding:20px 28px;">
        <div style="color:#fff;font-size:18px;font-weight:700;">📬 New Feedback — Meritus Beta</div>
        <div style="color:#A5B4FC;font-size:12px;margin-top:4px;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST · From: ${userEmail}</div>
      </div>
      <div style="padding:24px 28px;">
        ${nps ? `<div style="margin-bottom:16px;"><strong>NPS Score:</strong> <span style="font-size:22px;font-weight:700;color:${nps >= 9 ? "#059669" : nps >= 7 ? "#D97706" : "#DC2626"};">${nps}/10</span></div>` : ""}
        ${ratingRows ? `<div style="margin-bottom:16px;"><strong>Feature Ratings:</strong><table style="width:100%;margin-top:8px;border-collapse:collapse;">${ratingRows}</table></div>` : ""}
        ${whatWorks ? `<div style="margin-bottom:12px;background:#F5F3FF;border-left:4px solid #4338CA;padding:10px 14px;border-radius:0 8px 8px 0;"><strong style="font-size:12px;text-transform:uppercase;color:#4338CA;">What's working</strong><p style="margin:4px 0 0;font-size:14px;">${whatWorks}</p></div>` : ""}
        ${whatNeeds ? `<div style="margin-bottom:12px;background:#FFF7ED;border-left:4px solid #D97706;padding:10px 14px;border-radius:0 8px 8px 0;"><strong style="font-size:12px;text-transform:uppercase;color:#D97706;">Needs improvement</strong><p style="margin:4px 0 0;font-size:14px;">${whatNeeds}</p></div>` : ""}
        ${wishlist !== "—" ? `<div style="margin-bottom:12px;"><strong>Feature wishlist:</strong> <span style="font-size:13px;color:#374151;">${wishlist}</span></div>` : ""}
        ${bugDesc ? `<div style="margin-bottom:12px;background:#FEF2F2;border-left:4px solid #DC2626;padding:10px 14px;border-radius:0 8px 8px 0;"><strong style="font-size:12px;text-transform:uppercase;color:#DC2626;">🐛 Bug report</strong><p style="margin:4px 0 0;font-size:14px;">${bugDesc}</p></div>` : ""}
        ${story.quote ? `<div style="margin-bottom:12px;background:#F0FDF4;border-left:4px solid #059669;padding:10px 14px;border-radius:0 8px 8px 0;"><strong style="font-size:12px;text-transform:uppercase;color:#059669;">❤️ Success story — ${story.name || "?"} (${story.exam || "?"})</strong><p style="margin:4px 0 0;font-size:14px;font-style:italic;">"${story.quote}"</p></div>` : ""}
      </div>
      <div style="background:#F9FAFB;padding:14px 28px;border-top:1px solid #E5E7EB;font-size:12px;color:#9CA3AF;">
        Reply to this email to respond to the user · <a href="https://supabase.com" style="color:#4338CA;">View all in Supabase</a>
      </div>
    </div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Meritus Feedback <noreply@meritus.co.in>",
      to: [TEAM_EMAIL],
      reply_to: userEmail !== "anonymous" ? userEmail : undefined,
      subject: `[Feedback] NPS ${nps ?? "—"} · ${userEmail}`,
      html,
    }),
  }).catch(() => {}); // never block the response
}

export const Route = createFileRoute("/api/feedback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as Record<string, unknown>;

          // 1. Save to Supabase (best-effort, silent fail)
          const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

          if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            await supabase.from("beta_feedback").insert({
              nps: body.nps ?? null,
              ratings: body.ratings ?? {},
              what_works: body.whatWorks ?? null,
              what_needs: body.whatNeeds ?? null,
              wishlist: body.wishlist ?? [],
              bug_desc: body.bugDesc ?? null,
              bug_steps: body.bugSteps ?? null,
              story: body.story ?? null,
              email: body.email ?? null,
              submitted_at: new Date().toISOString(),
            }).then(() => {}).catch(() => {});
          }

          // 2. Email the team (best-effort, silent fail)
          await notifyTeam(body);

          return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
