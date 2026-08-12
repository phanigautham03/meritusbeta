/**
 * Admin Agent — runs every 4 hours.
 * Detects anomalies and alerts the admin via email — at most ONCE per 24 hours.
 * Persistent/stable conditions (e.g. stuck onboarding) only re-alert if the
 * count increases since the last alert.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { alertAdmin, logRunStart, logRunEnd, updateAgentLastRun, getAgentConfig } from "./agent-utils";

const ALERT_COOLDOWN_HOURS = 24;

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

export async function runAdminAgent(
  db: SupabaseClient,
): Promise<{ actionsCount: number; metadata: Record<string, unknown> }> {
  const runId = await logRunStart(db, "admin");

  try {
    const config = await getAgentConfig(db, "admin");
    const stuckDays    = (config.stuck_onboarding_days as number)  ?? 7;  // raised to 7 for beta
    const backlogLimit = (config.support_backlog_limit as number)   ?? 10;
    const backlogAge   = (config.support_age_hours as number)       ?? 4;

    // ── Cooldown check — skip alerting if we emailed within the last 24h ──────
    const lastAlertAt = config.last_alert_sent_at as string | undefined;
    const cooldownExpiry = lastAlertAt
      ? new Date(new Date(lastAlertAt).getTime() + ALERT_COOLDOWN_HOURS * 3_600_000)
      : null;
    const inCooldown = cooldownExpiry ? new Date() < cooldownExpiry : false;

    // Previous counts — used to detect genuinely new/worsening anomalies
    const prevCounts = (config.prev_anomaly_counts as Record<string, number>) ?? {};

    const anomalies: { key: string; label: string; detail: string; count: number }[] = [];

    // 1. Users stuck on onboarding > N days
    const { count: stuckUsers } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("onboarding_complete", false)
      .lt("created_at", daysAgo(stuckDays));

    if ((stuckUsers ?? 0) > 0) {
      anomalies.push({
        key: "stuck_onboarding",
        label: `${stuckUsers} user(s) stuck on onboarding for >${stuckDays} days`,
        detail: `These users signed up but haven't completed onboarding. <a href="https://meritus.co.in/admin">View in Admin</a>`,
        count: stuckUsers ?? 0,
      });
    }

    // 2. Support ticket backlog
    const { count: oldPending } = await db
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review")
      .lt("received_at", hoursAgo(backlogAge));

    if ((oldPending ?? 0) >= backlogLimit) {
      anomalies.push({
        key: "support_backlog",
        label: `${oldPending} support tickets pending review for >${backlogAge}h`,
        detail: `Support queue is backing up. <a href="https://meritus.co.in/admin">Review tickets</a>`,
        count: oldPending ?? 0,
      });
    }

    // 3. Agent failures in last 24h (always alert — these are always new)
    const { data: failedRuns } = await db
      .from("agent_runs")
      .select("agent_name, started_at, error_message")
      .eq("status", "error")
      .gte("started_at", hoursAgo(24));

    if ((failedRuns?.length ?? 0) > 0) {
      const names = [...new Set(failedRuns!.map((r: { agent_name: string }) => r.agent_name))].join(", ");
      anomalies.push({
        key: "agent_failures",
        label: `Agent failure(s) in last 24h: ${names}`,
        detail: failedRuns!.map((r: { agent_name: string; error_message: string | null }) =>
          `<strong>${r.agent_name}:</strong> ${r.error_message ?? "unknown error"}`).join("<br/>"),
        count: failedRuns!.length,
      });
    }

    // 4. MCQ review backlog
    const { count: pendingMCQs } = await db
      .from("pending_questions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    if ((pendingMCQs ?? 0) > 200) {
      anomalies.push({
        key: "mcq_backlog",
        label: `${pendingMCQs} MCQs pending review`,
        detail: `Content agent backlog is large. <a href="https://meritus.co.in/admin">Review content</a>`,
        count: pendingMCQs ?? 0,
      });
    }

    // ── Decide what to actually alert about ──────────────────────────────────
    // Alert if: (a) not in cooldown, OR (b) a count increased vs last alert
    const newOrWorse = anomalies.filter((a) => {
      if (a.key === "agent_failures") return true; // always alert on failures
      const prev = prevCounts[a.key] ?? 0;
      return a.count > prev; // only alert if count went up
    });

    const shouldSend = !inCooldown
      ? anomalies.length > 0          // outside cooldown: send if any anomaly
      : newOrWorse.length > 0;        // inside cooldown: only send if something got worse

    const toAlert = !inCooldown ? anomalies : newOrWorse;

    if (shouldSend && toAlert.length > 0) {
      const bodyHtml = `
        <p style="font-size:15px;color:#374151;margin:0 0 20px;">
          ${!inCooldown ? `The following ${toAlert.length} issue(s) need your attention:` : `${toAlert.length} issue(s) have worsened since your last alert:`}
        </p>
        ${toAlert.map((a, i) => `
          <div style="border:1px solid #FCA5A5;border-left:4px solid #DC2626;border-radius:8px;padding:12px 16px;margin-bottom:12px;background:#FEF2F2;">
            <p style="font-weight:700;font-size:14px;color:#DC2626;margin:0 0 6px;">${i + 1}. ${a.label}</p>
            <p style="font-size:13px;color:#374151;margin:0;">${a.detail}</p>
          </div>`).join("")}
        <p style="font-size:12px;color:#9CA3AF;margin-top:16px;">Next alert in ${ALERT_COOLDOWN_HOURS}h unless a count increases.</p>`;

      await alertAdmin(`${toAlert.length} issue(s) need attention`, bodyHtml);

      // Update last_alert_sent_at and save current counts
      const newCounts: Record<string, number> = {};
      for (const a of anomalies) newCounts[a.key] = a.count;

      await db.from("agent_config").update({
        config: {
          ...config,
          last_alert_sent_at: new Date().toISOString(),
          prev_anomaly_counts: newCounts,
        },
      }).eq("agent_name", "admin");
    } else {
      // Still save current counts even when not alerting (for next comparison)
      const newCounts: Record<string, number> = {};
      for (const a of anomalies) newCounts[a.key] = a.count;
      if (JSON.stringify(newCounts) !== JSON.stringify(prevCounts)) {
        await db.from("agent_config").update({
          config: { ...config, prev_anomaly_counts: newCounts },
        }).eq("agent_name", "admin");
      }
    }

    const meta = {
      anomalies_found: anomalies.length,
      alerts_sent: shouldSend && toAlert.length > 0 ? 1 : 0,
      in_cooldown: inCooldown,
      checks: 4,
    };
    await logRunEnd(db, runId, "success", anomalies.length, undefined, meta);
    await updateAgentLastRun(db, "admin");
    return { actionsCount: anomalies.length, metadata: meta };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logRunEnd(db, runId, "error", 0, msg);
    throw err;
  }
}
