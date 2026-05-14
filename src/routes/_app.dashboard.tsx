import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Star, Flame, BookOpen, Trophy, AlertTriangle, ArrowRight, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — Meritus" },
      { name: "description", content: "Track streaks, mock test scores, Forget-Meter alerts and upcoming exams in one place." },
      { property: "og:title", content: "Dashboard — Meritus" },
      { property: "og:description", content: "Track streaks, mock test scores, Forget-Meter alerts and upcoming exams in one place." },
      { property: "og:url", content: "https://meritusbeta.lovable.app/dashboard" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meritusbeta.lovable.app/dashboard" }],
  }),
});

const stats = [
  { icon: Star, label: "Merit Points", value: "2,847", sub: "+120 this week", color: "bg-gold-light text-gold" },
  { icon: Flame, label: "Study Streak", value: "14 days", sub: "Best: 21 days", color: "bg-orange-50 text-orange-600" },
  { icon: BookOpen, label: "Tests Taken", value: "32", sub: "Last 30 days", color: "bg-teal-light text-teal" },
  { icon: Trophy, label: "Global Rank", value: "142", sub: "Top 10%", color: "bg-primary-light text-primary" },
];

const tests = [
  { exam: "JEE Main", title: "Full Mock Test #14", score: 78, marks: "234/300", color: "success" },
  { exam: "JEE Main", title: "Physics Sectional", score: 62, marks: "62/100", color: "amber" },
  { exam: "JEE Advanced", title: "Mathematics Mock", score: 45, marks: "90/200", color: "danger" },
];

const forgetAlerts = [
  { topic: "Rotational Motion", subject: "Physics", retention: 28 },
  { topic: "Coordination Compounds", subject: "Chemistry", retention: 35 },
  { topic: "Probability", subject: "Mathematics", retention: 41 },
];

const countdowns = [
  { days: 47, name: "JEE Main S1", date: "Apr 2, 2025" },
  { days: 92, name: "JEE Main S2", date: "May 16, 2025" },
  { days: 124, name: "JEE Advanced", date: "Jun 17, 2025" },
  { days: 178, name: "BITSAT", date: "Aug 10, 2025" },
];

function scoreColor(s: number) {
  if (s >= 70) return "bg-success text-success";
  if (s >= 50) return "bg-gold text-gold";
  return "bg-danger text-danger";
}

function Dashboard() {
  const goalPct = 75;
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-navy via-navy-2 to-primary text-white p-6 md:p-8">
        <div className="absolute inset-0 bg-dot-grid opacity-50" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Good morning, Rahul 👋</h1>
            <p className="mt-1 text-indigo-200">47 days until JEE Main · April 2, 2025</p>
          </div>
          <div className="flex gap-2">
            <Link to="/mock-tests"><Button className="bg-white text-navy hover:bg-white/90 font-semibold">Take a Test</Button></Link>
            <Link to="/study-planner"><Button variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white">View Plan</Button></Link>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-card hover:border-indigo-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", s.color)}>
                <Icon size={18} />
              </div>
              <div className="mt-4 text-2xl font-bold text-body">{s.value}</div>
              <div className="text-xs text-secondary-text mt-0.5">{s.label}</div>
              <div className="text-[11px] text-success mt-1 font-medium">{s.sub}</div>
            </div>
          );
        })}
      </section>

      {/* Goal + Streak */}
      <section className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h3 className="font-semibold text-body">Today's Study Goal</h3>
          <div className="mt-5 flex items-center gap-6">
            <RingProgress value={goalPct} />
            <div className="flex-1">
              <p className="text-sm text-secondary-text">3 of 4 hours studied</p>
              <Progress value={goalPct} className="mt-2 h-2" />
              <div className="mt-4 flex flex-wrap gap-2">
                {[["Math", "45m"], ["Physics", "60m"], ["Chemistry", "75m"]].map(([s, t]) => (
                  <span key={s} className="text-xs font-medium px-2.5 py-1 rounded-md bg-primary-light text-primary">{s} · {t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h3 className="font-semibold text-body">Study Streak</h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-bold text-orange-600">14</span>
            <span className="text-sm text-secondary-text">days in a row 🔥</span>
          </div>
          <div className="mt-5 flex gap-1">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className={cn("h-7 flex-1 rounded", i < 14 ? "bg-orange-500" : "bg-muted")}
                style={{ animation: `fade-up 0.4s ease-out ${i * 0.04}s both` }} />
            ))}
          </div>
          <p className="mt-4 text-xs text-secondary-text">Study today to keep your streak!</p>
        </div>
      </section>

      {/* Recent tests */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-body">Recent Tests</h2>
          <Link to="/mock-tests" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {tests.map((t) => {
            const sc = scoreColor(t.score);
            return (
              <div key={t.title} className="bg-card border border-border rounded-xl p-5 shadow-card hover:border-indigo-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-primary-light text-primary">{t.exam}</span>
                  <span className={cn("text-lg font-bold", sc.split(" ")[1])}>{t.score}%</span>
                </div>
                <h3 className="mt-3 font-semibold text-body text-sm">{t.title}</h3>
                <Progress value={t.score} className={cn("mt-3 h-1.5", `[&>div]:${sc.split(" ")[0]}`)} />
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-secondary-text">{t.marks} marks</span>
                  <Link to="/results/$id" params={{ id: "1" }} className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                    View report <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Forget-Meter alerts */}
      <section className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-danger-light text-danger flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-body">Forget-Meter Alerts</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-danger-light text-danger font-bold">3 at risk</span>
            </div>
          </div>
          <Link to="/forget-meter" className="text-sm text-primary font-medium hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-border">
          {forgetAlerts.map((a) => {
            const tone = a.retention < 40 ? "bg-danger" : a.retention < 70 ? "bg-gold" : "bg-success";
            return (
              <div key={a.topic} className="flex items-center gap-4 p-4 bg-[#F9FAFB] hover:bg-primary-light transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-body text-sm">{a.topic}</div>
                  <div className="text-xs text-secondary-text">{a.subject}</div>
                </div>
                <div className="hidden sm:block w-40">
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div className={cn("h-full rounded-full", tone)} style={{ width: `${a.retention}%` }} />
                  </div>
                </div>
                <span className={cn("text-sm font-bold w-10 text-right", a.retention < 40 ? "text-danger" : a.retention < 70 ? "text-gold" : "text-success")}>{a.retention}%</span>
                <Button size="sm" className="bg-teal hover:bg-teal/90 text-white">Revise</Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Countdowns */}
      <section>
        <h2 className="text-lg font-semibold text-body mb-3">Exam Countdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {countdowns.map((c) => (
            <div key={c.name} className="bg-card border border-border rounded-xl p-5 shadow-card text-center">
              <div className="text-3xl font-bold text-primary">{c.days}</div>
              <div className="label-caps text-secondary-text mt-1">Days left</div>
              <div className="mt-3 font-semibold text-body text-sm">{c.name}</div>
              <div className="text-xs text-secondary-text">{c.date}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function RingProgress({ value }: { value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-primary-light)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="8"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      <text x="50" y="55" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--color-primary)">{value}%</text>
    </svg>
  );
}
