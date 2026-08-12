/**
 * GET /api/agents/status
 * Returns live status of all agents. Admin-only.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

function adminSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!,
  );
}

export const Route = createFileRoute("/api/agents/status")({
  server: {
    handlers: {
      GET: async () => {
        const db = adminSupabase();

        const [configRes, runsRes, supportRes, contentRes, marketingRes] = await Promise.all([
          db.from("agent_config").select("*"),
          db.from("agent_runs")
            .select("agent_name, status, started_at, finished_at, actions_taken, error_message")
            .order("started_at", { ascending: false })
            .limit(50),
          db.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
          db.from("pending_questions").select("id", { count: "exact", head: true }).eq("status", "pending"),
          db.from("marketing_content").select("id", { count: "exact", head: true }).eq("status", "draft"),
        ]);

        // Build per-agent summary
        const configs = configRes.data ?? [];
        const runs = runsRes.data ?? [];

        const agentStatus = configs.map((c: {
          agent_name: string; is_enabled: boolean; last_run_at: string | null; config: unknown
        }) => {
          const recentRuns = runs.filter((r: { agent_name: string }) => r.agent_name === c.agent_name).slice(0, 3);
          const lastRun = recentRuns[0];
          return {
            name: c.agent_name,
            is_enabled: c.is_enabled,
            last_run_at: c.last_run_at,
            last_status: lastRun?.status ?? null,
            last_actions: lastRun?.actions_taken ?? 0,
            last_error: lastRun?.error_message ?? null,
            recent_runs: recentRuns,
          };
        });

        return Response.json({
          agents: agentStatus,
          queues: {
            support_pending_review: supportRes.count ?? 0,
            content_pending_review: contentRes.count ?? 0,
            marketing_drafts: marketingRes.count ?? 0,
          },
        });
      },
    },
  },
});
