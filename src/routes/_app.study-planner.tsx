import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/study-planner")({
  component: Planner,
  head: () => ({
    meta: [
      { title: "Study Planner — Meritus" },
      { name: "description", content: "Personalised AI-generated week-by-week study plan tailored to your exam." },
      { property: "og:title", content: "Study Planner — Meritus" },
      { property: "og:description", content: "Personalised AI-generated week-by-week study plan tailored to your exam." },
      { property: "og:url", content: "https://meritusbeta.lovable.app/study-planner" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meritusbeta.lovable.app/study-planner" }],
  }),
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const subjectColor: Record<string, string> = {
  Physics: "bg-sky-100 text-sky-700 border-sky-200",
  Chemistry: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Math: "bg-amber-100 text-amber-700 border-amber-200",
  Bio: "bg-teal-100 text-teal-700 border-teal-200",
};
const week: Record<string, { sub: string; topic: string; mins: number }[]> = {
  Mon: [{ sub: "Physics", topic: "Kinematics", mins: 90 }, { sub: "Math", topic: "Calculus", mins: 60 }],
  Tue: [{ sub: "Chemistry", topic: "Organic basics", mins: 75 }, { sub: "Physics", topic: "Newton's laws", mins: 60 }],
  Wed: [{ sub: "Math", topic: "Algebra", mins: 90 }, { sub: "Chemistry", topic: "Mole concept", mins: 60 }, { sub: "Physics", topic: "Friction", mins: 45 }],
  Thu: [{ sub: "Physics", topic: "Work, Energy", mins: 90 }, { sub: "Math", topic: "Trigonometry", mins: 60 }],
  Fri: [{ sub: "Chemistry", topic: "Periodic table", mins: 60 }, { sub: "Math", topic: "Mock test", mins: 120 }],
  Sat: [{ sub: "Physics", topic: "Full mock", mins: 180 }],
  Sun: [{ sub: "Bio", topic: "Revision", mins: 45 }, { sub: "Chemistry", topic: "Doubts", mins: 60 }],
};

function Planner() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-xl bg-gradient-to-br from-primary to-navy-2 text-white p-6 md:p-7 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 text-xs font-bold"><Sparkles size={12} /> AI</span>
            <h1 className="mt-3 text-2xl md:text-3xl font-bold">Your AI Study Plan</h1>
            <p className="mt-1 text-indigo-100">JEE Main · 47 days remaining</p>
          </div>
          <Button variant="outline" className="border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white">
            <RefreshCw size={14} className="mr-2" /> Regenerate Plan
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div className="bg-card border border-border rounded-xl p-5 shadow-card overflow-x-auto">
          <h3 className="font-semibold text-body mb-4">This week</h3>
          <div className="grid grid-cols-7 gap-2 min-w-[800px]">
            {days.map((d) => (
              <div key={d}>
                <div className="text-xs font-bold text-secondary-text mb-2 px-1">{d}</div>
                <div className="space-y-2">
                  {week[d].map((s, i) => {
                    const key = `${d}-${i}`;
                    const isDone = done[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setDone((x) => ({ ...x, [key]: !x[key] }))}
                        className={cn(
                          "w-full text-left rounded-lg border p-2.5 transition-all",
                          subjectColor[s.sub] || "bg-muted text-body border-border",
                          isDone && "opacity-60 line-through",
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wide">{s.sub}</span>
                          {isDone && <Check size={12} />}
                        </div>
                        <div className="text-xs font-semibold mt-1">{s.topic}</div>
                        <div className="text-[10px] mt-0.5 opacity-75">{s.mins} min</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-semibold text-body mb-4">Weekly targets</h3>
            <div className="space-y-4">
              {[["Physics", 70, "stroke-sky-500"], ["Chemistry", 55, "stroke-emerald-500"], ["Math", 82, "stroke-amber-500"]].map(([n, v, c]) => (
                <div key={n as string} className="flex items-center gap-3">
                  <MiniRing value={v as number} className={c as string} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-body">{n}</div>
                    <div className="text-xs text-secondary-text">{v}% of weekly goal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-semibold text-body mb-3">Upcoming exams</h3>
            <ul className="space-y-3 text-sm">
              {[["JEE Main S1", "47 days"], ["JEE Main S2", "92 days"], ["BITSAT", "178 days"]].map(([n, d]) => (
                <li key={n} className="flex justify-between"><span className="text-body">{n}</span><span className="text-primary font-bold">{d}</span></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MiniRing({ value, className }: { value: number; className: string }) {
  const r = 22, c = 2 * Math.PI * r;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-border)" strokeWidth="5" />
      <circle cx="28" cy="28" r={r} fill="none" strokeWidth="5" strokeDasharray={c} strokeDashoffset={c - (value/100)*c} strokeLinecap="round" transform="rotate(-90 28 28)" className={className} />
      <text x="28" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-body)">{value}%</text>
    </svg>
  );
}
