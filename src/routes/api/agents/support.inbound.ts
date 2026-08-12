/**
 * POST /api/agents/support/inbound
 * Resend Inbound webhook — receives emails to support@meritus.co.in
 * and inserts them into support_tickets.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

function adminSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!,
  );
}

export const Route = createFileRoute("/api/agents/support/inbound")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as {
            from?: string;
            subject?: string;
            text?: string;
            html?: string;
          };

          const fromEmail = body.from ?? "unknown@unknown.com";
          const subject   = body.subject ?? "(no subject)";
          // Prefer plain text, strip HTML tags as fallback
          const bodyText  = body.text ?? (body.html ?? "").replace(/<[^>]*>/g, " ").trim();

          if (!bodyText) {
            return Response.json({ ok: true, skipped: "empty body" });
          }

          const db = adminSupabase();
          await db.from("support_tickets").insert({
            from_email: fromEmail,
            subject,
            body: bodyText.slice(0, 4000), // cap at 4k chars
            status: "pending",
          });

          return Response.json({ ok: true });
        } catch (err) {
          console.error("[support-inbound]", err);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
