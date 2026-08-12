import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, TrendingUp, FileText, Crown, Zap, Mail, Send,
  RefreshCw, ShieldCheck, Search, Download, BarChart3,
  ArrowUpRight, ArrowDownRight, Activity, DollarSign,
  UserCheck, AlertCircle, CheckCircle, Loader2, Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPlatformMetrics, getRecentUsers, getSignupTrend,
  getActivityTrend, dispatchMarketingEmail,
} from "@/lib/admin.functions";
import { useAuth } from "@/integrations/external-supabase/auth-context";
import { isAdminEmail } from "@/lib/admin-config";

export const Route = createFileRoute("/_app/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin Dashboard — Meritus" }, { name: "robots", content: "noindex" }] }),
});

// ── Mini bar chart component ───────────────────────────────────────────────────
function SparkBar({ values, color = "#4338CA", label }: { values: number[]; color?: string; label: string }) {
  const max = Math.max(...values, 1);
  return (
    <div>
      <p className="text-xs text-secondary-text mb-1">{label}</p>
      <div className="flex items-end gap-0.5 h-10">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all"
            style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? "3px" : "1px", background: v > 0 ? color : "#E5E7EB" }}
            title={String(v)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({
  icon: Icon, label, value, sub, color, trend,
}: {
  icon: any; label: string; value: string | number; sub?: string; color: string; trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-secondary-text"}`}>
            {trend === "up" ? <ArrowUpRight size={13} /> : trend === "down" ? <ArrowDownRight size={13} /> : null}
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold text-body">{value}</div>
      <div className="text-sm text-secondary-text">{label}</div>
      {sub && <div className="text-xs text-muted-text mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Plan badge ────────────────────────────────────────────────────────────────
function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    free: "bg-muted text-secondary-text",
    pro: "bg-primary-light text-primary",
    power: "bg-gold-light text-gold",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[plan] ?? styles.free}`}>
      {plan.toUpperCase()}
    </span>
  );
}

// ── Main admin dashboard ───────────────────────────────────────────────────────
function AdminDashboard() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview" | "users" | "emails" | "agents">("overview");
  const [userSearch, setUserSearch] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailPreview, setEmailPreview] = useState(false);

  // Server functions
  const fetchMetrics = useServerFn(getPlatformMetrics);
  const fetchUsers   = useServerFn(getRecentUsers);
  const fetchSignups = useServerFn(getSignupTrend);
  const fetchActivity = useServerFn(getActivityTrend);
  const dispatch     = useServerFn(dispatchMarketingEmail);

  // Redirect non-admins immediately — client-side guard (server functions also enforce this)
  useEffect(() => {
    if (!loading && !isAdminEmail(user?.email)) {
      nav({ to: "/dashboard" });
    }
  }, [loading, user, nav]);

  // Queries — only run when user is confirmed admin
  const metricsQ  = useQuery({ queryKey: ["adminMetrics"], queryFn: () => fetchMetrics(), refetchInterval: 60_000, enabled: isAdminEmail(user?.email) });
  const usersQ    = useQuery({ queryKey: ["adminUsers"],    queryFn: () => fetchUsers(),    enabled: isAdminEmail(user?.email) });
  const signupsQ  = useQuery({ queryKey: ["adminSignups"],  queryFn: () => fetchSignups(),  enabled: isAdminEmail(user?.email) });
  const activityQ = useQuery({ queryKey: ["adminActivity"], queryFn: () => fetchActivity(), enabled: isAdminEmail(user?.email) });

  const sendMutation = useMutation({
    mutationFn: () => dispatch({ data: { subject: emailSubject, bodyHtml: emailBody } }),
    onSuccess: (r) => {
      toast.success(`Sent to ${r.sent} users (${r.failed} failed)`);
      setEmailSubject(""); setEmailBody("");
      qc.invalidateQueries({ queryKey: ["adminMetrics"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Send failed"),
  });

  // Show spinner while auth loads (redirect fires in useEffect above)
  if (loading || !isAdminEmail(user?.email)) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-text">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading…
      </div>
    );
  }

  const m = metricsQ.data;
  const users = usersQ.data ?? [];
  const filteredUsers = users.filter(
    (u) => !userSearch || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const signupValues = (signupsQ.data ?? []).map((d) => d.signups);
  const activityValues = (activityQ.data ?? []).map((d) => d.attempts);
  const freeUsers = users.filter((u) => u.plan === "free");

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-body flex items-center gap-2">
            <ShieldCheck size={22} className="text-primary" /> Admin Dashboard
          </h1>
          <p className="text-sm text-secondary-text mt-0.5">
            Real-time platform activity · Auto-refreshes every 60s
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => { qc.invalidateQueries({ queryKey: ["adminMetrics"] }); qc.invalidateQueries({ queryKey: ["adminUsers"] }); }}
          >
            <RefreshCw size={14} className="mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { key: "overview", label: "Overview",       icon: BarChart3 },
          { key: "users",    label: "Users",           icon: Users },
          { key: "emails",   label: "Email Campaigns", icon: Mail },
          { key: "agents",   label: "AI Agents",       icon: Zap },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === key ? "bg-white shadow-sm text-primary" : "text-secondary-text hover:text-body"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6">

          {/* Key metric cards */}
          {metricsQ.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 h-28 animate-pulse" />
              ))}
            </div>
          ) : m && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard icon={Users}     label="Total Users"     value={m.total.toLocaleString()}  color="bg-primary-light text-primary"  trend="up" sub={`+${m.newToday} today`} />
                <MetricCard icon={Crown}     label="Pro Users"       value={m.pro.toLocaleString()}    color="bg-gold-light text-gold"        trend="up" sub={`${m.conversionRate}% conversion`} />
                <MetricCard icon={Zap}       label="Power Users"     value={m.power.toLocaleString()}  color="bg-violet-50 text-violet-600"   />
                <MetricCard icon={TrendingUp} label="Free Users"     value={m.free.toLocaleString()}  color="bg-muted text-secondary-text"   sub="Conversion opportunity" />
                <MetricCard icon={DollarSign} label="Est. MRR"       value={`₹${m.mrr.toLocaleString("en-IN")}`} color="bg-success-light text-success" trend="up" sub={`ARR ₹${m.arr.toLocaleString("en-IN")}`} />
                <MetricCard icon={FileText}   label="Tests Taken"    value={m.totalAttempts.toLocaleString()} color="bg-sky-50 text-sky-600" sub={`${m.attemptsToday} today`} />
                <MetricCard icon={UserCheck}  label="Onboarded"      value={`${m.onboardingRate}%`}   color="bg-teal-50 text-teal"           sub={`${m.onboarded}/${m.total} users`} />
                <MetricCard icon={Activity}   label="New (7 days)"   value={m.newLast7.toLocaleString()} color="bg-orange-50 text-orange-500" trend="up" />
              </div>

              {/* Plan split bar */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h2 className="text-sm font-semibold text-body mb-4 flex items-center gap-2">
                  <Users size={15} className="text-primary" /> User Plan Distribution
                </h2>
                <div className="flex rounded-full overflow-hidden h-4 gap-0.5">
                  <div style={{ width: m.total > 0 ? `${(m.free / m.total) * 100}%` : "100%" }} className="bg-border" title={`Free: ${m.free}`} />
                  <div style={{ width: `${(m.pro / m.total) * 100}%` }} className="bg-primary" title={`Pro: ${m.pro}`} />
                  <div style={{ width: `${(m.power / m.total) * 100}%` }} className="bg-gold" title={`Power: ${m.power}`} />
                </div>
                <div className="flex gap-5 mt-3 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-border" /> Free ({m.free})</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Pro ({m.pro})</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gold" /> Power ({m.power})</span>
                </div>
              </div>
            </>
          )}

          {/* Trend charts */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <h2 className="text-sm font-semibold text-body mb-4 flex items-center gap-2">
                <Users size={15} className="text-primary" /> Signups — Last 30 Days
              </h2>
              {signupsQ.isLoading
                ? <div className="h-10 animate-pulse bg-muted rounded" />
                : <SparkBar values={signupValues} color="#4338CA" label="" />
              }
              <p className="text-xs text-secondary-text mt-2">Each bar = 1 day</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <h2 className="text-sm font-semibold text-body mb-4 flex items-center gap-2">
                <FileText size={15} className="text-teal" /> Test Attempts — Last 30 Days
              </h2>
              {activityQ.isLoading
                ? <div className="h-10 animate-pulse bg-muted rounded" />
                : <SparkBar values={activityValues} color="#0D9488" label="" />
              }
              <p className="text-xs text-secondary-text mt-2">Each bar = 1 day</p>
            </div>
          </div>

          {/* Revenue snapshot */}
          {m && (
            <div className="bg-gradient-to-br from-navy to-indigo-900 text-white rounded-xl p-6 shadow-card">
              <h2 className="text-sm font-semibold text-indigo-200 mb-4 flex items-center gap-2">
                <DollarSign size={15} /> Revenue Snapshot (estimated from active plans)
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Monthly Recurring", value: `₹${m.mrr.toLocaleString("en-IN")}` },
                  { label: "Annual Run Rate",   value: `₹${m.arr.toLocaleString("en-IN")}` },
                  { label: "Paying Users",      value: `${m.pro + m.power} / ${m.total}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 rounded-lg p-4">
                    <div className="text-xl font-bold">{value}</div>
                    <div className="text-xs text-indigo-200 mt-1">{label}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-indigo-300 mt-4">* Based on monthly pricing. Actual revenue depends on billing cycle mix and Razorpay settlements.</p>
            </div>
          )}
        </div>
      )}

      {/* ── USERS TAB ───────────────────────────────────────────────────── */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={15} />
              <Input
                className="pl-9 h-9"
                placeholder="Search by name or email…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-secondary-text">
              {filteredUsers.length} of {users.length} users
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              <Download size={14} className="mr-1.5" /> Export CSV
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {["Name", "Email", "Plan", "City", "Onboarded", "Signup Date", "Last Login"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-secondary-text">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersQ.isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 7 }).map((__, j) => (
                            <td key={j} className="py-3 px-4"><div className="h-4 animate-pulse bg-muted rounded w-24" /></td>
                          ))}
                        </tr>
                      ))
                    : filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-body">{u.full_name || "—"}</td>
                          <td className="py-3 px-4 text-secondary-text">{u.email || "—"}</td>
                          <td className="py-3 px-4"><PlanBadge plan={u.plan ?? "free"} /></td>
                          <td className="py-3 px-4 text-secondary-text">{u.city || "—"}</td>
                          <td className="py-3 px-4">
                            {u.onboarding_complete
                              ? <CheckCircle size={15} className="text-success" />
                              : <AlertCircle size={15} className="text-secondary-text" />}
                          </td>
                          <td className="py-3 px-4 text-secondary-text text-xs">
                            {new Date(u.created_at).toLocaleDateString("en-IN")}
                          </td>
                          <td className="py-3 px-4 text-secondary-text text-xs">
                            {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString("en-IN") : "—"}
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── EMAIL CAMPAIGNS TAB ─────────────────────────────────────────── */}
      {tab === "emails" && (
        <div className="space-y-5 max-w-3xl">
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold text-body mb-1">
              Send Campaign to Free Users
            </h2>
            <p className="text-sm text-secondary-text mb-5">
              Compose and send a marketing email to all <strong>{freeUsers.length}</strong> free users at once.
              Emails are sent via Resend at 2/sec.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-body mb-1.5 block">Subject line</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Your JEE 2025 study plan is ready 🎯"
                  className="h-11"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-body mb-1.5 block">Email body (HTML allowed)</label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  placeholder={`<p>Hi {firstName},</p>\n<p>We've added 500 new NEET questions this week...</p>\n<a href="https://meritus.co.in/upgrade" style="...">Upgrade to Pro →</a>`}
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEmailPreview(!emailPreview)}
                >
                  <Eye size={14} className="mr-1.5" /> {emailPreview ? "Hide" : "Show"} Preview
                </Button>
                <Button
                  onClick={() => sendMutation.mutate()}
                  disabled={!emailSubject || !emailBody || sendMutation.isPending}
                  className="flex-1"
                >
                  {sendMutation.isPending
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Sending to {freeUsers.length} users…</>
                    : <><Send size={14} className="mr-2" /> Send to {freeUsers.length} Free Users</>
                  }
                </Button>
              </div>

              {emailPreview && emailBody && (
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted px-4 py-2 text-xs font-medium text-secondary-text border-b border-border">
                    Email Preview
                  </div>
                  <div
                    className="p-4 text-sm"
                    dangerouslySetInnerHTML={{ __html: emailBody }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Campaign ideas */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-semibold text-body mb-3">Quick campaign templates</h3>
            <div className="space-y-2">
              {[
                {
                  label: "Upgrade nudge — new features",
                  subject: "3 new AI features just landed on Meritus 🚀",
                  body: `<p>We've shipped Forget-Meter AI, the AI Study Planner, and our NTA Exam Simulator — all live now.</p><p>Free users get a taste. <a href="https://meritus.co.in/upgrade">Upgrade to Pro (₹499/month)</a> to unlock everything.</p>`,
                },
                {
                  label: "Exam season reminder",
                  subject: "JEE 2025 is 60 days away. Are you ready?",
                  body: `<p>With 60 days left, the students who crack JEE are the ones who focus on <strong>weak spots</strong>, not just hours studied.</p><p>Meritus Forget-Meter tells you exactly which topics to revise. <a href="https://meritus.co.in/dashboard">Open your dashboard →</a></p>`,
                },
                {
                  label: "Social proof / leaderboard",
                  subject: "Students on Meritus are scoring 87% on average",
                  body: `<p>Our top students are averaging 87% on mock tests and improving their rank by 40% in 90 days.</p><p>Check the <a href="https://meritus.co.in/leaderboard">Meritus Leaderboard</a> and see where you stand.</p>`,
                },
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => { setEmailSubject(t.subject); setEmailBody(t.body); }}
                  className="w-full text-left rounded-lg border border-border p-3 hover:border-primary/40 hover:bg-primary-light/20 transition-colors text-sm"
                >
                  <div className="font-medium text-body">{t.label}</div>
                  <div className="text-xs text-secondary-text mt-0.5 truncate">{t.subject}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AGENTS TAB ──────────────────────────────────────────────────── */}
      {tab === "agents" && (
        <AgentsPanel />
      )}
    </div>
  );
}

// ── AI Agents Panel ───────────────────────────────────────────────────────────

const AGENT_SCHEDULES: Record<string, string> = {
  crm:          "Daily 08:00 IST",
  sales:        "On test submission",
  support:      "Every 30 min",
  content:      "Sunday 23:00 IST",
  marketing:    "Monday 07:00 IST",
  analytics:    "Monday 07:00 IST",
  admin:        "Every 4 hours",
  mentor_match: "On demand",
};

const AGENT_DESCRIPTIONS: Record<string, string> = {
  crm:          "Sends drip emails: Day 1 welcome → Day 3 nudge → Day 7 upgrade → Day 30 re-engagement",
  sales:        "Detects free users who hit 3-test limit, sends personalised upgrade email",
  support:      "Reads support inbox, AI-drafts replies, auto-sends high-confidence responses",
  content:      "Generates 10 MCQs per exam from syllabus topics, 2-pass AI verification",
  marketing:    "Weekly social posts, A/B subject lines, and strategic insights",
  analytics:    "Weekly business summary email with signups, tests, and growth metrics",
  admin:        "Anomaly detection: stuck onboarding, support backlog, agent failures",
  mentor_match: "On-demand mentor ranking for students (activates with Mentor Sessions)",
};

function AgentsPanel() {
  const { user } = useAuth();
  const adminEmail = user?.email ?? "";

  const [status, setStatus] = useState<null | {
    agents: {
      name: string;
      is_enabled: boolean;
      last_run_at: string | null;
      last_status: string | null;
      last_actions: number;
      last_error: string | null;
    }[];
    queues: {
      support_pending_review: number;
      content_pending_review: number;
      marketing_drafts: number;
    };
  }>(null);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [supportTickets, setSupportTickets] = useState<{
    id: string; from_email: string; subject: string | null; ai_draft_reply: string | null; confidence: number | null;
  }[]>([]);
  const [pendingMCQs, setPendingMCQs] = useState<{
    id: string; exam_name: string; topic: string; question_text: string; correct_option: string; ai_confidence: number | null;
  }[]>([]);
  const [marketingDrafts, setMarketingDrafts] = useState<{
    id: string; content_type: string; platform: string | null; exam_vertical: string | null; content_text: string;
  }[]>([]);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/status");
      const data = await res.json();
      setStatus(data);
    } finally {
      setLoading(false);
    }
  }

  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${adminEmail}`,
  };

  async function triggerAgent(name: string) {
    setTriggering(name);
    try {
      const res = await fetch(`/api/agents/trigger/${name}`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json() as { ok?: boolean; actionsCount?: number; error?: string };
      if (data.ok) {
        toast.success(`${name} agent completed — ${data.actionsCount ?? 0} actions`);
        fetchStatus();
      } else {
        toast.error(data.error ?? "Agent run failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setTriggering(null);
    }
  }

  async function sendTicket(id: string) {
    const res = await fetch(`/api/agents/support/send/${id}`, {
      method: "POST",
      headers: authHeaders,
      body: "{}",
    });
    if (res.ok) { toast.success("Reply sent"); setSupportTickets((t) => t.filter((x) => x.id !== id)); }
    else toast.error("Failed to send");
  }

  async function approveQuestion(id: string) {
    const res = await fetch(`/api/agents/content/approve/${id}`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ action: "approve" }),
    });
    if (res.ok) { toast.success("Question approved"); setPendingMCQs((q) => q.filter((x) => x.id !== id)); }
    else toast.error("Failed");
  }

  async function rejectQuestion(id: string) {
    const res = await fetch(`/api/agents/content/approve/${id}`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ action: "reject" }),
    });
    if (res.ok) { toast.success("Question rejected"); setPendingMCQs((q) => q.filter((x) => x.id !== id)); }
    else toast.error("Failed");
  }

  useEffect(() => { fetchStatus(); }, []);

  const statusColor = (s: string | null) =>
    s === "success" ? "text-success" : s === "error" ? "text-danger" : s === "running" ? "text-gold" : "text-muted-text";

  return (
    <div className="space-y-6">
      {/* Agent status grid */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            <h2 className="font-semibold text-body">AI Agents</h2>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading}>
            <RefreshCw size={13} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {loading && !status ? (
          <div className="flex items-center justify-center py-12 text-secondary-text">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading agent status…
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(status?.agents ?? []).map((agent) => (
              <div key={agent.name} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-body capitalize">{agent.name.replace("_", " ")}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${agent.is_enabled ? "bg-success/10 text-success" : "bg-muted text-muted-text"}`}>
                      {agent.is_enabled ? "ON" : "OFF"}
                    </span>
                    {agent.last_status && (
                      <span className={`text-xs font-medium ${statusColor(agent.last_status)}`}>
                        {agent.last_status === "success" ? "✅" : agent.last_status === "error" ? "❌" : "⏳"} {agent.last_status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary-text mt-0.5 truncate">{AGENT_DESCRIPTIONS[agent.name]}</p>
                  <div className="flex gap-3 mt-1 text-[11px] text-muted-text">
                    <span>🕐 {AGENT_SCHEDULES[agent.name]}</span>
                    {agent.last_run_at && <span>Last: {new Date(agent.last_run_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short" })}</span>}
                    {agent.last_actions > 0 && <span>Actions: {agent.last_actions}</span>}
                  </div>
                  {agent.last_error && (
                    <p className="text-[11px] text-danger mt-0.5 truncate">Error: {agent.last_error}</p>
                  )}
                </div>
                {!["sales", "mentor_match"].includes(agent.name) && (
                  <Button
                    variant="outline" size="sm"
                    onClick={() => triggerAgent(agent.name)}
                    disabled={triggering === agent.name || !agent.is_enabled}
                    className="shrink-0 text-xs"
                  >
                    {triggering === agent.name ? <Loader2 size={12} className="animate-spin mr-1" /> : <Zap size={12} className="mr-1" />}
                    Run now
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Queue stats */}
      {status && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Support tickets to review", value: status.queues.support_pending_review, color: "text-danger" },
            { label: "MCQs pending approval", value: status.queues.content_pending_review, color: "text-gold" },
            { label: "Marketing drafts", value: status.queues.marketing_drafts, color: "text-primary" },
          ].map((q) => (
            <div key={q.label} className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
              <div className={`text-3xl font-bold ${q.color}`}>{q.value}</div>
              <div className="text-xs text-secondary-text mt-1">{q.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Support queue */}
      {supportTickets.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border font-semibold text-body flex items-center gap-2">
            <Mail size={16} className="text-danger" /> Support Queue ({supportTickets.length})
          </div>
          <div className="divide-y divide-border">
            {supportTickets.map((t) => (
              <div key={t.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-body truncate">{t.subject ?? "(no subject)"}</div>
                    <div className="text-xs text-secondary-text">From: {t.from_email}</div>
                    {t.ai_draft_reply && (
                      <div className="mt-2 text-xs text-body bg-primary-light/20 rounded-lg p-3 border border-primary/10">
                        <span className="font-semibold text-primary">AI Draft: </span>
                        {t.ai_draft_reply.replace(/<[^>]*>/g, " ").slice(0, 200)}…
                      </div>
                    )}
                    {t.confidence && (
                      <div className="text-[10px] text-muted-text mt-1">Confidence: {Math.round(t.confidence * 100)}%</div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => sendTicket(t.id)} className="text-xs">Send</Button>
                    <Button size="sm" variant="outline" onClick={() => setSupportTickets((x) => x.filter((s) => s.id !== t.id))} className="text-xs">Dismiss</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending MCQs */}
      {pendingMCQs.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border font-semibold text-body flex items-center gap-2">
            <FileText size={16} className="text-gold" /> Pending MCQs ({pendingMCQs.length})
          </div>
          <div className="divide-y divide-border">
            {pendingMCQs.map((q) => (
              <div key={q.id} className="p-5 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-primary">{q.exam_name} — {q.topic}</div>
                  <p className="text-sm text-body mt-1">{q.question_text}</p>
                  <div className="text-xs text-secondary-text mt-1">Answer: {q.correct_option} · Confidence: {q.ai_confidence ? `${Math.round(q.ai_confidence * 100)}%` : "?"}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => approveQuestion(q.id)} className="text-xs bg-success hover:bg-success/90 text-white">Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => rejectQuestion(q.id)} className="text-xs text-danger border-danger/30">Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-secondary-text text-center">
        Agents run automatically on schedule. Use "Run now" to trigger manually. Disable an agent in the agent_config table via Supabase.
      </p>
    </div>
  );
}
