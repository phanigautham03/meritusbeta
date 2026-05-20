import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Star, Flame, BookOpen, AlertTriangle, ArrowRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboard } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Meritus" }] }),
});

function Dashboard() {
  const fetch = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetch() });
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("welcomed")) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    if (typeof window !== "undefined") sessionStorage.setItem("welcomed", "true");
    setShowWelcome(false);
  };

  if (isLoading || !data) return <div className="p-8 text-secondary-text"><Loader2 className="animate-spin inline mr-2" size={16}/> Loading…</div>;

  const name = data.profile?.first_name ?? data.profile?.display_name ?? "there";
  const merit = (data.streak as any)?.merit_points ?? data.profile?.merit_points ?? 0;
  const streak = data.streak?.current_streak ?? 0;
  const longest = data.streak?.longest_streak ?? 0;
  const nextExam = data.exams[0];

  const stats = [
    { icon: Star, label: "Merit Points", value: merit.toLocaleString(), color: "bg-gold-light text-gold" },
    { icon: Flame, label: "Study Streak", value: `${streak} days`, sub: `Best: ${longest}`, color: "bg-orange-50 text-orange-600" },
    { icon: BookOpen, label: "Tests Taken", value: String(data.testsTaken), color: "bg-teal-light text-teal" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {showWelcome && (
        <div className="rounded-xl bg-[#4338CA] text-white p-4 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm md:text-base">
            🎉 Welcome to Meritus, <strong>{name}</strong>! Your question bank is ready. Start your first quiz to kick off your streak.
          </p>
          <button
            onClick={dismissWelcome}
            className="shrink-0 p-1 rounded hover:bg-white/10 transition"
            aria-label="Dismiss welcome"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <section className="rounded-xl bg-gradient-to-br from-navy via-navy-2 to-primary text-white p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {name} 👋</h1>
        <p className="mt-1 text-indigo-200">{nextExam ? `Next target: ${nextExam.exam_name}${nextExam.target_date ? ` · ${nextExam.target_date}` : ""}` : "Add your target exams to start tracking."}</p>
        <div className="mt-4 flex gap-2">
          <Link to="/mock-tests"><Button className="bg-white text-navy hover:bg-white/90 font-semibold">Take a Test</Button></Link>
          <Link to="/study-planner"><Button variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white">Plan Week</Button></Link>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", s.color)}><Icon size={18} /></div>
              <div className="mt-4 text-2xl font-bold text-body">{s.value}</div>
              <div className="text-xs text-secondary-text mt-0.5">{s.label}</div>
              {s.sub && <div className="text-[11px] text-secondary-text mt-1">{s.sub}</div>}
            </div>
          );
        })}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-body">Recent Tests</h2>
          <Link to="/mock-tests" className="text-sm text-primary font-medium hover:underline">View all</Link>
        </div>
        {data.recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-secondary-text">No tests taken yet. <Link to="/mock-tests" className="text-primary font-medium">Take your first one →</Link></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {data.recent.map((t: any) => {
              const pct = t.total_marks ? Math.round((Number(t.score) / Number(t.total_marks)) * 100) : 0;
              return (
                <div key={t.id} className="bg-card border border-border rounded-xl p-5 shadow-card">
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-primary-light text-primary">{t.mock?.exam_name ?? "Test"}</span>
                  <h3 className="mt-3 font-semibold text-body text-sm line-clamp-2">{t.mock?.title ?? "Mock test"}</h3>
                  <div className="mt-2 text-2xl font-bold text-body">{pct}%</div>
                  <div className="text-xs text-secondary-text">{t.score} / {t.total_marks} marks · {t.correct_count} correct</div>
                  <Link to="/results/$id" params={{ id: t.id }} className="mt-3 inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline">View report <ArrowRight size={12} /></Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-danger-light text-danger flex items-center justify-center"><AlertTriangle size={18} /></div>
            <h3 className="font-semibold text-body">Forget-Meter Alerts</h3>
          </div>
          <Link to="/forget-meter" className="text-sm text-primary font-medium hover:underline">View all</Link>
        </div>
        {data.forgets.length === 0 ? (
          <div className="p-6 text-sm text-secondary-text">All clear — no topics below 50% retention.</div>
        ) : (
          <div className="divide-y divide-border">
            {data.forgets.map((a: any) => {
              const tone = a.retention_score < 40 ? "bg-danger" : "bg-gold";
              return (
                <div key={a.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-body text-sm">{a.topic?.topic_name}</div>
                    <div className="text-xs text-secondary-text">{a.topic?.subject} · {a.topic?.exam_name}</div>
                  </div>
                  <div className="hidden sm:block w-40">
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div className={cn("h-full rounded-full", tone)} style={{ width: `${a.retention_score}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold w-10 text-right">{a.retention_score}%</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
