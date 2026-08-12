import { ADMIN_EMAILS } from "@/lib/admin-config";

/**
 * Beta mode configuration — single source of truth.
 *
 * Set IS_BETA = false when paid plans go live.
 * All plan-gating logic should reference getEffectivePlan() rather than
 * reading profiles.plan directly, so flipping this one flag is all it takes.
 */

export const IS_BETA = false;

/**
 * During beta every user gets Pro access for free.
 * After beta, this returns the user's actual purchased plan.
 * Admin users always receive Power-tier access.
 */
export function getEffectivePlan(userPlan?: string | null, userEmail?: string | null): "free" | "pro" | "power" {
  if (IS_BETA) return "pro";
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) return "power";
  return (userPlan as "free" | "pro" | "power") ?? "free";
}

/** Returns true when the effective plan includes the given tier. */
export function hasAccess(userPlan: string | null | undefined, required: "pro" | "power"): boolean {
  const plan = getEffectivePlan(userPlan);
  if (required === "pro")   return plan === "pro" || plan === "power";
  if (required === "power") return plan === "power";
  return true;
}
