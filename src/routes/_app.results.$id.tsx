import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X, Minus, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/results/$id")({ component: Results });

const subjects = [
  { name: "Physics", score: 56, total: 100, accuracy: 71, color: "bg-sky-500" },
  { name: "Chemistry", score: 48, total: 100, accuracy: 64, color: "bg-emerald-500" },
  { name: "Mathematics", score: 52, total: 100, accuracy: 58, color: "bg-amber-500" },
];

const weak = [
  { topic: "Rotational Dynamics", subject: "Physics" },
  { topic: "Coordination Compounds", subject: "Chemistry" },
  { topic: "3D Geometry", subject: "Mathematics" },
  { topic: "Thermodynamics", subject: "Chemistry" },
];

function Results() {
  const score = 156, max = 300;
  const pct = (score / max) * 100;
  const tone = pct >= 70 ? "text-success" : pct >= 50 ? "text-gold" : "text-danger";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* hero */}
      <div className="rounded-xl bg-gradient-to-br from-navy via-navy-2 to-primary text-white text-center p-10 shadow-card relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-50" />
        <div className="relative">
          <p className="text-indigo-200 text-sm uppercase tracking-wider font-semibold">Test Completed</p>
          <div className="mt-4 text-6xl md:text-7xl font-bold">
            {score} <span className="text-indigo-300 text-4xl font-medium">/ {max}</span>
          </div>
          <div className={cn("mt-2 text-3xl font-bold", pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-rose-400")}>
            {pct.toFixed(1)}%
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[["Rank", "#842"], ["Percentile", "72.3"], ["Time", "2h 15m"]].map(([l, v]) => (
              <span key={l} className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm">
                <b>{v}</b> <span className="text-indigo-200">{l}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Correct", v: 39, icon: Check, color: "bg-success-light text-success" },
          { l: "Incorrect", v: 16, icon: X, color: "bg-danger-light text-danger" },
          { l: "Unattempted", v: 35, icon: Minus, color: "bg-muted text-secondary-text" },
          { l: "Accuracy", v: "70.9%", icon: Target, color: "bg-primary-light text-primary" },
        ].map((s) => {
          const I = s.icon;
          return (
            <div key={s.l} className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", s.color)}><I size={18} /></div>
              <div className="mt-3 text-2xl font-bold text-body">{s.v}</div>
              <div className="text-xs text-secondary-text mt-0.5">{s.l}</div>
            </div>
          );
        })}
      </div>

      {/* subject-wise */}
      <div>
        <h2 className="text-lg font-semibold text-body mb-3">Subject-wise analysis</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <div key={s.name} className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-body">{s.name}</h3>
                <span className="text-sm font-bold text-body">{s.score}/{s.total}</span>
              </div>
              <p className="text-xs text-secondary-text mt-1">Accuracy {s.accuracy}%</p>
              <Progress value={(s.score / s.total) * 100} className={cn("mt-3 h-2", `[&>div]:${s.color}`)} />
            </div>
          ))}
        </div>
      </div>

      {/* weak topics */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-body">Focus on these next</h2>
        <p className="text-sm text-secondary-text mt-1">Topics where your accuracy was below 50%.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {weak.map((w) => (
            <div key={w.topic} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-[#F9FAFB]">
              <div className="flex-1">
                <div className="font-medium text-body text-sm">{w.topic}</div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-primary-light text-primary font-semibold">{w.subject}</span>
              </div>
              <Button size="sm" className="bg-teal hover:bg-teal/90 text-white">Revise</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Button variant="outline" className="border-primary text-primary hover:bg-primary-light">Retake Test</Button>
        <Button className="font-semibold">View Solutions</Button>
        <Link to="/dashboard"><Button variant="ghost">Go to Dashboard</Button></Link>
      </div>
    </div>
  );
}
