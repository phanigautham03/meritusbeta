import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// ── Cron trigger router ───────────────────────────────────────────────────────
// Runs agents based on the Cloudflare cron schedule defined in wrangler.jsonc.
// Each cron expression maps to one or more agents.

async function handleScheduled(event: { cron: string }): Promise<void> {
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!,
  );

  const { isAgentEnabled } = await import("./lib/agents/agent-utils");

  const cron = event.cron;
  console.log(`[cron] triggered: ${cron}`);

  try {
    // Daily 08:00 IST = "30 2 * * *" UTC
    if (cron === "30 2 * * *") {
      if (await isAgentEnabled(db, "crm")) {
        const { runCrmAgent } = await import("./lib/agents/crm-agent");
        const result = await runCrmAgent(db);
        console.log("[cron] CRM agent done:", result.actionsCount, "actions");
      }
    }

    // Every 30 minutes — Support Agent
    if (cron === "*/30 * * * *") {
      if (await isAgentEnabled(db, "support")) {
        const { runSupportAgent } = await import("./lib/agents/support-agent");
        const result = await runSupportAgent(db);
        console.log("[cron] Support agent done:", result.actionsCount, "actions");
      }
    }

    // Every 4 hours — Admin Agent
    if (cron === "0 */4 * * *") {
      if (await isAgentEnabled(db, "admin")) {
        const { runAdminAgent } = await import("./lib/agents/admin-agent");
        const result = await runAdminAgent(db);
        console.log("[cron] Admin agent done:", result.actionsCount, "anomalies");
      }
    }

    // Monday 07:00 IST = "30 1 * * 1" UTC — Analytics + Marketing
    if (cron === "30 1 * * 1") {
      if (await isAgentEnabled(db, "analytics")) {
        const { runAnalyticsAgent } = await import("./lib/agents/analytics-agent");
        const result = await runAnalyticsAgent(db);
        console.log("[cron] Analytics agent done:", result.actionsCount, "actions");
      }
      if (await isAgentEnabled(db, "marketing")) {
        const { runMarketingAgent } = await import("./lib/agents/marketing-agent");
        const result = await runMarketingAgent(db);
        console.log("[cron] Marketing agent done:", result.actionsCount, "content pieces");
      }
    }

    // Sunday 23:00 IST = "30 17 * * 7" UTC — Content Agent (7 = Sunday in CF cron)
    if (cron === "30 17 * * 7") {
      if (await isAgentEnabled(db, "content")) {
        const { runContentAgent } = await import("./lib/agents/content-agent");
        const result = await runContentAgent(db);
        console.log("[cron] Content agent done:", result.actionsCount, "MCQs generated");
      }
    }
  } catch (err) {
    console.error("[cron] unhandled error in scheduled handler:", err);
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },

  async scheduled(event: { cron: string }, _env: unknown, ctx: { waitUntil: (p: Promise<unknown>) => void }) {
    ctx.waitUntil(handleScheduled(event));
  },
};
