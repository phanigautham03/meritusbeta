/**
 * POST /api/agents/sales/webhook
 * Supabase Database Webhook fires here on INSERT to test_attempts.
 * Triggers the sales agent for the user who just submitted.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { runSalesAgent } from "@/lib/agents/sales-agent";

function adminSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!,
  );
}

export const Route = createFileRoute("/api/agents/sales/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Verify Supabase webhook secret header
          const secret = request.headers.get("x-supabase-webhook-secret");
          if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const body = await request.json() as {
            type?: string;
            record?: { user_id?: string };
          };

          if (body.type !== "INSERT" || !body.record?.user_id) {
            return Response.json({ ok: true, skipped: "not an insert" });
          }

          const db = adminSupabase();
          const result = await runSalesAgent(db, body.record.user_id);
          return Response.json({ ok: true, ...result });
        } catch (err) {
          console.error("[sales-webhook]", err);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
