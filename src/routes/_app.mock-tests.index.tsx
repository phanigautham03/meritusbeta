import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Clock, ArrowRight, Loader2, BookOpen, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { listMockTests } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/mock-tests/")({
  component: MockTests,
  head: () => ({
    meta: [
      { title: "Mock Tests — Meritus" },
      { name: "description", content: "Real exam-pattern mock tests and NTA simulations for JEE, NEET, UPSC, IBPS PO, CAT, GATE, INICET and more." },
    ],
  }),
});

const examTone: Record<string, string> = {
  "JEE Main":    "bg-primary-light text-primary",
  "JEE Advanced":"bg-primary-light text-primary",
  "NEET":        "bg-teal-light text-teal",
  "NEET PG":     "bg-teal-light text-teal",
  "INICET":      "bg-cyan-50 text-cyan-700",
  "UPSC":        "bg-gold-light text-gold",
  "UPSC CSE":    "bg-gold-light text-gold",
  "IBPS PO":     "bg-violet-100 text-violet-700",
  "CAT":         "bg-orange-50 text-orange-700",
  "GATE":        "bg-blue-100 text-blue-700",
  "SSC CGL":     "bg-pink-50 text-pink-700",
  "Banking":     "bg-emerald-50 text-emerald-700",
};

const diffTone: Record<string, string> = {
  easy:   "bg-success/15 text-success",
  medium: "bg-gold-light text-gold",
  hard:   "bg-danger-light text-danger",
};

type Tab = "practice" | "simulation";

function MockTests() {
  const fetchTests = useServerFn(listMockTests);
  const { data, isLoading, error } = useQuery({ queryKey: ["mock-tests"], queryFn: () => fetchTests() });

  const [tab, setTab] = useState<Tab>("practice");
  const [activeExam, setActiveExam] = useState<string>("All");

  const byTab = useMemo(() => {
    if (!data) return [];
    if (tab === "simulation") return data.filter((t) => (t as any).test_type === "simulation");
    return data.filter((t) => (t as any).test_type !== "simulation");
  }, [data, tab]);

  const exams = useMemo(() => {
    const names = [...new Set(byTab.map((t) => t.exam_name))].sort();
    return ["All", ...names];
  }, [byTab]);

  const filtered = useMemo(() =>
    activeExam === "All" ? byTab : byTab.filter((t) => t.exam_name === activeExam),
    [byTab, activeExam]);

  const simCount = useMemo(() => (data ?? []).filter((t) => (t as any).test_type === "simulation").length, [data]);
  const practiceCount = useMemo(() => (data ?? []).filter((t) => (t as any).test_type !== "simulation").length, [data]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-body">Mock Tests</h1>
        <p className="text-sm text-secondary-text mt-1">
          Real exam-pattern tests and full NTA simulations across JEE, NEET, UPSC, IBPS PO, CAT, GATE, INICET and more.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => { setTab("practice"); setActiveExam("All"); }}
          className={cn(
            "pb-3 px-1 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5",
            tab === "practice" ? "border-primary text-primary" : "border-transparent text-secondary-text hover:text-body"
          )}
        >
          <FileText size={15} /> Practice Tests
          <span className="ml-1 text-xs bg-muted text-secondary-text px-1.5 py-0.5 rounded-full">{practiceCount}</span>
        </button>
        <button
          onClick={() => { setTab("simulation"); setActiveExam("All"); }}
          className={cn(
            "pb-3 px-1 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5",
            tab === "simulation" ? "border-primary text-primary" : "border-transparent text-secondary-text hover:text-body"
          )}
        >
          <Zap size={15} /> NTA Simulations
          <span className="ml-1 text-xs bg-muted text-secondary-text px-1.5 py-0.5 rounded-full">{simCount}</span>
        </button>
      </div>

      {tab === "simulation" && (
        <div className="rounded-xl bg-primary-light border border-primary/20 px-5 py-3 text-sm text-primary flex items-start gap-2.5">
          <Zap size={16} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Full NTA Simulations</span> — 300 questions, full exam duration, NTA-style interface with +4/−1 marking. These replicate the actual exam experience end-to-end.
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-secondary-text"><Loader2 className="animate-spin" size={16} /> Loading tests…</div>
      )}
      {error && <div className="text-danger text-sm">Failed to load: {(error as Error).message}</div>}

      {!isLoading && !error && (
        <>
          {/* Exam filter tabs */}
          {exams.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {exams.map((exam) => (
                <button
                  key={exam}
                  onClick={() => setActiveExam(exam)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    activeExam === exam
                      ? "bg-primary text-white border-primary"
                      : "bg-card text-secondary-text border-border hover:border-indigo-300"
                  )}
                >
                  {exam}
                  {exam !== "All" && (
                    <span className="ml-1.5 opacity-60">
                      {byTab.filter((t) => t.exam_name === exam).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <BookOpen className="mx-auto mb-3 text-secondary-text" size={32} />
              <p className="text-sm font-medium text-body">
                {tab === "simulation" ? "No simulations yet" : `No tests yet for ${activeExam}`}
              </p>
              <p className="text-xs text-secondary-text mt-1">We're adding more content every week. Check back soon.</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => {
              const isSim = (t as any).test_type === "simulation";
              return (
                <div key={t.id} className={cn(
                  "bg-card border rounded-xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col",
                  isSim ? "border-primary/30 hover:border-primary/60" : "border-border hover:border-indigo-200"
                )}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${examTone[t.exam_name] ?? "bg-muted text-secondary-text"}`}>{t.exam_name}</span>
                    {isSim
                      ? <span className="text-xs font-bold px-2 py-1 rounded-md bg-primary text-white flex items-center gap-1"><Zap size={10} /> NTA SIM</span>
                      : <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${diffTone[t.difficulty ?? ""] ?? "bg-muted text-secondary-text"}`}>{t.difficulty}</span>
                    }
                  </div>
                  <h3 className="mt-3 font-semibold text-body line-clamp-2">{t.title}</h3>
                  <p className="mt-1.5 text-sm text-secondary-text line-clamp-2">{t.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-secondary-text">
                    <span className="inline-flex items-center gap-1"><FileText size={13} /> {t.num_questions} Qs</span>
                    <span className="inline-flex items-center gap-1"><Clock size={13} /> {t.duration_minutes} min</span>
                    {t.subject && <span className="truncate">{t.subject}</span>}
                  </div>
                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-end">
                    <Link to="/mock-tests/$id" params={{ id: t.id }}>
                      <Button size="sm" className={cn("font-semibold", isSim && "bg-primary hover:bg-primary/90")}>
                        {isSim ? "Start Simulation" : "Start Test"} <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
