/**
 * POST /api/agents/trigger/:name
 * Manually triggers an agent by name. Admin-only.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAILS } from "@/lib/admin-config";
import { runCrmAgent } from "@/lib/agents/crm-agent";
import { runSupportAgent } from "@/lib/agents/support-agent";
import { runContentAgent } from "@/lib/agents/content-agent";
import { runAnalyticsAgent } from "@/lib/agents/analytics-agent";
import { runMarketingAgent } from "@/lib/agents/marketing-agent";
import { runAdminAgent } from "@/lib/agents/admin-agent";

function adminSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!,
  );
}

export const Route = createFileRoute("/api/agents/trigger/$name")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        // Verify admin — accept email as Bearer token (beta simplicity)
        const bearer = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
        if (!ADMIN_EMAILS.includes(bearer)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = adminSupabase();
        const agentName = params.name;

        try {
          let result;
          switch (agentName) {
            case "crm":      result = await runCrmAgent(db); break;
            case "support":  result = await runSupportAgent(db); break;
            case "content":  result = await runContentAgent(db); break;
            case "analytics": result = await runAnalyticsAgent(db); break;
            case "marketing": result = await runMarketingAgent(db); break;
            case "admin":    result = await runAdminAgent(db); break;
            default:
              return Response.json({ error: `Unknown agent: ${agentName}` }, { status: 400 });
          }
          return Response.json({ ok: true, agent: agentName, ...result });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
    },
  },
});
