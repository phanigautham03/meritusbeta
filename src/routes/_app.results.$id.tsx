import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CheckCircle2, XCircle, MinusCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMockAttemptResult } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/results/$id")({
  component: ResultsPage,
  head: () => ({ meta: [{ title: "Results — Meritus" }] }),
});

function ResultsPage() {
  const { id } = Route.useParams();
  const fetchResult = useServerFn(getMockAttemptResult);
  const { data, isLoading, error } = useQuery({ queryKey: ["mock-result", id], queryFn: () => fetchResult({ data: { attemptId: id } }) });

  if (isLoading) return <div className="p-8 text-secondary-text"><Loader2 className="animate-spin inline mr-2" size={16} /> Loading result…</div>;
  if (error || !data) return <div className="p-8 text-danger">Failed: {(error as Error)?.message ?? "Not found"}</div>;

  const mock = (data as any).mock;
  const review = (((data as any).answers ?? (data as any).answers_json) ?? []) as { index: number; selected: number; isCorrect: boolean | null }[];
  const questions = (mock?.questions ?? []) as any[];
  const score = Number((data as any).score ?? 0);
  const total = Number((data as any).total_marks ?? 0);
  const correct = (data as any).correct_count ?? 0;
  const wrong = (data as any).wrong_count ?? 0;
  const unattempted = (data as any).unattempted_count ?? 0;
  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-navy via-navy-2 to-primary text-white rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3"><Trophy /> <h1 className="text-xl font-bold">{mock?.title ?? "Test Result"}</h1></div>
        <div className="mt-2 text-sm text-indigo-200">{mock?.exam_name} · {mock?.subject}</div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Score" value={`${score} / ${total}`} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Correct" value={String(correct)} />
          <Stat label="Wrong" value={String(wrong)} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="font-semibold text-body">Review</h2>
        <p className="text-xs text-secondary-text mt-1">{correct} correct · {wrong} wrong · {unattempted} unattempted</p>
        <div className="mt-5 space-y-4">
          {questions.map((q: any, i: number) => {
            const r = review.find((x) => x.index === i);
            const sel = r?.selected ?? -1;
            const correctIdx = q.correct;
            return (
              <div key={i} className="border border-border rounded-lg p-4">
                <div className="flex items-start gap-2">
                  {r?.isCorrect === true && <CheckCircle2 className="text-success shrink-0 mt-0.5" size={18} />}
                  {r?.isCorrect === false && <XCircle className="text-danger shrink-0 mt-0.5" size={18} />}
                  {r?.isCorrect == null && <MinusCircle className="text-secondary-text shrink-0 mt-0.5" size={18} />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-body">Q{i + 1}. {q.text}</p>
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      {q.options.map((opt: string, oi: number) => (
                        <div key={oi} className={cn("text-xs rounded-md border p-2",
                          oi === correctIdx ? "border-success bg-success/10 text-success" :
                          oi === sel ? "border-danger bg-danger/10 text-danger" :
                          "border-border")}>
                          {String.fromCharCode(65 + oi)}. {opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation && <p className="mt-3 text-xs text-secondary-text"><b className="text-body">Explanation:</b> {q.explanation}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex gap-2">
          <Link to="/mock-tests"><Button variant="outline">Back to tests</Button></Link>
          <Link to="/dashboard"><Button>Dashboard</Button></Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-white/10 rounded-lg p-3"><div className="text-xs text-indigo-200">{label}</div><div className="mt-1 font-bold text-lg">{value}</div></div>;
}
