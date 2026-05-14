import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X, Minus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAttemptResult } from "@/lib/tests.functions";

export const Route = createFileRoute("/_app/results/$id")({
  component: Results,
  head: () => ({ meta: [{ title: "Test Result — Meritus" }] }),
});

function Results() {
  const { id } = Route.useParams();
  const fetchResult = useServerFn(getAttemptResult);
  const { data, isLoading, error } = useQuery({
    queryKey: ["attempt", id],
    queryFn: () => fetchResult({ data: { attemptId: id } }),
  });

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-secondary-text p-8">
        <Loader2 className="animate-spin" size={16} /> Loading result…
      </div>
    );
  if (error) return <div className="p-8 text-danger">Failed: {(error as Error).message}</div>;
  if (!data) return null;

  const a = data.attempt as any;
  const total = a.test?.total_questions ?? data.answers.length;
  const accuracy = total ? Math.round(((a.correct_count ?? 0) / total) * 100) : 0;
  const scorePct = a.total_marks ? Math.max(0, Math.round(((a.score ?? 0) / a.total_marks) * 100)) : 0;

  // Per-subject breakdown
  const bySubject = new Map<string, { correct: number; total: number }>();
  for (const ans of data.answers as any[]) {
    const s = ans.question?.subject?.name ?? "Other";
    const cur = bySubject.get(s) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (ans.is_correct) cur.correct += 1;
    bySubject.set(s, cur);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-navy via-navy-2 to-primary text-white rounded-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold">{a.test?.title ?? "Test Result"}</h1>
        <p className="text-indigo-200 mt-1">Submitted {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : "—"}</p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Score" value={`${a.score ?? 0} / ${a.total_marks ?? 0}`} sub={`${scorePct}%`} />
          <Stat label="Accuracy" value={`${accuracy}%`} sub={`${a.correct_count ?? 0} correct`} />
          <Stat label="Wrong" value={`${a.wrong_count ?? 0}`} sub={`-${(a.wrong_count ?? 0) * Math.abs(Number(a.test?.marks_per_wrong ?? 1))} marks`} />
          <Stat label="Skipped" value={`${a.unattempted_count ?? 0}`} sub="Unattempted" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="font-semibold text-body mb-4">Subject-wise accuracy</h2>
        <div className="space-y-3">
          {[...bySubject.entries()].map(([s, v]) => {
            const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
            return (
              <div key={s}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-body font-medium">{s}</span>
                  <span className="text-secondary-text">{v.correct}/{v.total} · {pct}%</span>
                </div>
                <Progress value={pct} className="h-1.5 mt-1" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="font-semibold text-body mb-4">Question review</h2>
        <div className="space-y-4">
          {(data.answers as any[]).map((ans, idx) => {
            const q = ans.question;
            const tone = ans.selected_index == null ? "Minus" : ans.is_correct ? "Check" : "X";
            return (
              <div key={idx} className="border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                    ans.is_correct ? "bg-success-light text-success" : ans.selected_index == null ? "bg-muted text-secondary-text" : "bg-danger-light text-danger")}>
                    {tone === "Check" ? <Check size={14} /> : tone === "X" ? <X size={14} /> : <Minus size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-body">Q{idx + 1}. {q?.stem}</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {(q?.options ?? []).map((o: string, i: number) => {
                        const correct = i === q?.correct_index;
                        const chosen = i === ans.selected_index;
                        return (
                          <li key={i} className={cn("px-2 py-1 rounded",
                            correct ? "bg-success-light text-success font-medium" : chosen ? "bg-danger-light text-danger" : "text-secondary-text")}>
                            {String.fromCharCode(65 + i)}. {o}
                          </li>
                        );
                      })}
                    </ul>
                    {q?.explanation && (
                      <p className="mt-2 text-xs text-secondary-text"><b>Explanation:</b> {q.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link to="/leaderboard"><Button variant="outline">View leaderboard</Button></Link>
        <Link to="/mock-tests"><Button>Take another test</Button></Link>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-indigo-200">{label}</div>
      <div className="text-2xl font-bold mt-0.5">{value}</div>
      <div className="text-xs text-indigo-200 mt-0.5">{sub}</div>
    </div>
  );
}