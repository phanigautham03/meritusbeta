import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/forget-meter")({
  component: ForgetMeter,
  head: () => ({
    meta: [
      { title: "Forget-Meter — Meritus" },
      { name: "description", content: "AI spaced-repetition based on the Ebbinghaus forgetting curve. Revise exactly when you need to." },
      { property: "og:title", content: "Forget-Meter — Meritus" },
      { property: "og:description", content: "AI spaced-repetition based on the Ebbinghaus forgetting curve. Revise exactly when you need to." },
      { property: "og:url", content: "https://meritusbeta.lovable.app/forget-meter" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meritusbeta.lovable.app/forget-meter" }],
  }),
});

const topics = [
  { topic: "Rotational Motion", subject: "Physics", revised: "3 days ago", retention: 22 },
  { topic: "Coordination Compounds", subject: "Chemistry", revised: "5 days ago", retention: 31 },
  { topic: "Probability", subject: "Math", revised: "2 days ago", retention: 38 },
  { topic: "Thermodynamics", subject: "Physics", revised: "1 day ago", retention: 52 },
  { topic: "Electrochemistry", subject: "Chemistry", revised: "6 hours ago", retention: 64 },
  { topic: "Calculus", subject: "Math", revised: "Yesterday", retention: 78 },
  { topic: "Optics", subject: "Physics", revised: "Today", retention: 91 },
];

const subjBadge: Record<string, string> = {
  Physics: "bg-sky-100 text-sky-700",
  Chemistry: "bg-emerald-100 text-emerald-700",
  Math: "bg-amber-100 text-amber-700",
};

function tone(r: number) {
  if (r < 40) return { bar: "bg-danger", text: "text-danger" };
  if (r < 70) return { bar: "bg-gold", text: "text-gold" };
  return { bar: "bg-success", text: "text-success" };
}

function ForgetMeter() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-light text-teal flex items-center justify-center">
              <Brain size={20} />
            </div>
            <h1 className="text-2xl font-bold text-body">Forget-Meter</h1>
          </div>
          <p className="mt-2 text-sm text-secondary-text">
            <span className="px-2 py-1 rounded-full bg-primary-light text-primary text-xs font-bold">Based on Ebbinghaus Forgetting Curve</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4">
          <Tabs defaultValue="all">
            <TabsList className="bg-card border border-border h-auto p-1">
              <TabsTrigger value="all">All ({topics.length})</TabsTrigger>
              <TabsTrigger value="risk">At Risk (3)</TabsTrigger>
              <TabsTrigger value="mod">Moderate (2)</TabsTrigger>
              <TabsTrigger value="strong">Strong (2)</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            {topics.map((t) => {
              const c = tone(t.retention);
              return (
                <div key={t.topic} className="bg-card border border-border rounded-xl p-4 shadow-card hover:border-indigo-200 hover:shadow-card-hover transition-all">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className={cn("text-xs font-semibold px-2 py-1 rounded-md", subjBadge[t.subject])}>{t.subject}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-body">{t.topic}</div>
                      <div className="text-xs text-secondary-text">Last revised: {t.revised}</div>
                    </div>
                    <div className="hidden md:block w-48">
                      <div className="h-2 rounded-full bg-border overflow-hidden">
                        <div className={cn("h-full rounded-full", c.bar)} style={{ width: `${t.retention}%` }} />
                      </div>
                    </div>
                    <span className={cn("font-bold w-12 text-right", c.text)}>{t.retention}%</span>
                    <Button size="sm" className="bg-teal hover:bg-teal/90 text-white">Revise Now</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="font-semibold text-body mb-4">Avg retention by subject</h3>
            <div className="space-y-4">
              {[["Physics", 53, "stroke-sky-500"], ["Chemistry", 49, "stroke-emerald-500"], ["Math", 65, "stroke-amber-500"]].map(([n, v, c]) => (
                <div key={n as string} className="flex items-center gap-3">
                  <Ring value={v as number} className={c as string} />
                  <div className="text-sm font-medium text-body">{n}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-danger-light border border-rose-200 rounded-xl p-5">
            <div className="text-3xl font-bold text-danger">3</div>
            <div className="text-sm font-semibold text-danger mt-1">Topics at risk</div>
            <p className="text-xs text-secondary-text mt-2">Revise these in the next 24 hours to prevent forgetting.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Ring({ value, className }: { value: number; className: string }) {
  const r = 22, c = 2 * Math.PI * r;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-border)" strokeWidth="5" />
      <circle cx="28" cy="28" r={r} fill="none" strokeWidth="5" strokeDasharray={c} strokeDashoffset={c - (value/100)*c} strokeLinecap="round" transform="rotate(-90 28 28)" className={className} />
      <text x="28" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-body)">{value}%</text>
    </svg>
  );
}
