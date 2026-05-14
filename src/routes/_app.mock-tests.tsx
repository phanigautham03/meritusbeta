import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { FileText, Clock, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { listMockTests } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/mock-tests")({
  component: MockTests,
  head: () => ({
    meta: [
      { title: "Mock Tests — Meritus" },
      { name: "description", content: "Real exam-pattern mock tests for JEE, NEET, UPSC, IBPS PO, CAT, GATE and more." },
    ],
  }),
});

const examTone: Record<string, string> = {
  "JEE Main": "bg-primary-light text-primary",
  "JEE Advanced": "bg-primary-light text-primary",
  "NEET": "bg-teal-light text-teal",
  "UPSC": "bg-gold-light text-gold",
  "IBPS PO": "bg-violet-100 text-violet-700",
  "CAT": "bg-orange-50 text-orange-700",
  "GATE": "bg-blue-100 text-blue-700",
};
const diffTone: Record<string, string> = {
  easy: "bg-success/15 text-success",
  medium: "bg-gold-light text-gold",
  hard: "bg-danger-light text-danger",
};

function MockTests() {
  const fetchTests = useServerFn(listMockTests);
  const { data, isLoading, error } = useQuery({ queryKey: ["mock-tests"], queryFn: () => fetchTests() });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-body">Mock Tests</h1>
        <p className="text-sm text-secondary-text mt-1">Real exam-pattern questions across JEE, NEET, UPSC, IBPS PO, CAT and GATE.</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-secondary-text"><Loader2 className="animate-spin" size={16} /> Loading tests…</div>
      )}
      {error && <div className="text-danger text-sm">Failed to load: {(error as Error).message}</div>}
      {!isLoading && !error && (data?.length ?? 0) === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <BookOpen className="mx-auto mb-3 text-secondary-text" />
          <p className="text-sm text-secondary-text">No tests found. Check back soon.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data ?? []).map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-5 shadow-card hover:border-indigo-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${examTone[t.exam_name] ?? "bg-muted text-secondary-text"}`}>{t.exam_name}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${diffTone[t.difficulty] ?? "bg-muted text-secondary-text"}`}>{t.difficulty}</span>
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
                <Button size="sm" className="font-semibold">Start Test <ArrowRight size={14} className="ml-1" /></Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
