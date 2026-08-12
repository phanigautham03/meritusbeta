/**
 * POST /api/agents/support/send/:id
 * Admin approves and sends a support ticket reply.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

function adminSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!,
  );
}

export const Route = createFileRoute("/api/agents/support/send/$id")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const db = adminSupabase();
        const { id } = params;

        const body = await request.json() as { custom_reply?: string };

        // Fetch ticket
        const { data: ticket } = await db
          .from("support_tickets")
          .select("*")
          .eq("id", id)
          .single();

        if (!ticket) return Response.json({ error: "Ticket not found" }, { status: 404 });

        const replyHtml = body.custom_reply ?? ticket.ai_draft_reply;
        if (!replyHtml) return Response.json({ error: "No reply content" }, { status: 400 });

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) return Response.json({ error: "Resend not configured" }, { status: 500 });

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Meritus Support <support@meritus.co.in>",
            to: [ticket.from_email],
            subject: `Re: ${ticket.subject ?? "Your Meritus Query"}`,
            html: replyHtml.includes("<!DOCTYPE") ? replyHtml : `<div style="font-family:Inter,sans-serif;">${replyHtml}</div>`,
          }),
        });

        if (!res.ok) {
          return Response.json({ error: "Email send failed" }, { status: 502 });
        }

        await db.from("support_tickets").update({
          status: "sent",
          ai_draft_reply: replyHtml,
          handled_by: "admin",
          handled_at: new Date().toISOString(),
        }).eq("id", id);

        return Response.json({ ok: true });
      },
    },
  },
});
