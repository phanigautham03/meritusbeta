import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CheckCircle2, XCircle, MinusCircle, Trophy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMockAttemptResult } from "@/lib/data.functions";
import { normalizeQuestions } from "@/lib/question-normalize";
import { toast } from "sonner";

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
  const questions = normalizeQuestions((mock?.questions ?? []) as any[]);
  const score = Number((data as any).score ?? 0);
  const total = Number((data as any).total_marks ?? 0);
  const correct = (data as any).correct_count ?? 0;
  const wrong = (data as any).wrong_count ?? 0;
  const unattempted = (data as any).unattempted_count ?? 0;
  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
  const scorePct = total > 0 ? Math.max(0, Math.round((score / total) * 100)) : 0;

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
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-indigo-200">
            <span>Score</span><span>{scorePct}%</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700",
                scorePct >= 70 ? "bg-emerald-400" : scorePct >= 40 ? "bg-amber-400" : "bg-red-400")}
              style={{ width: `${scorePct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-indigo-200 mt-1">
            <span>{correct} correct · {wrong} wrong · {unattempted} unattempted</span>
            <span>{questions.length} Qs total</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="font-semibold text-body">Review</h2>
        <p className="text-xs text-secondary-text mt-1">{correct} correct · {wrong} wrong · {unattempted} unattempted</p>
        <div className="mt-5 space-y-4">
          {questions.map((q: any, i: number) => {
            const r = review.find((x) => x.index === i);
            const sel = r?.selected ?? -1;
            // correctIdx from normaliser; if -1 (unknown field in DB), fall back to
            // inferring from isCorrect flag — the option the user selected AND got right IS correct
            let correctIdx = q.correct;
            if (correctIdx === -1 && r?.isCorrect === true && sel >= 0) correctIdx = sel;
            const skipped = sel < 0;
            return (
              <div key={i} className="border border-border rounded-lg p-4">
                <div className="flex items-start gap-2">
                  {r?.isCorrect === true && <CheckCircle2 className="text-success shrink-0 mt-0.5" size={18} />}
                  {r?.isCorrect === false && <XCircle className="text-danger shrink-0 mt-0.5" size={18} />}
                  {(r?.isCorrect == null || skipped) && <MinusCircle className="text-secondary-text shrink-0 mt-0.5" size={18} />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-body">Q{i + 1}. {q.text}</p>
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      {q.options.map((opt: string, oi: number) => {
                        const isCorrectOpt = oi === correctIdx;
                        const isSelectedWrong = oi === sel && !isCorrectOpt && !skipped;
                        return (
                          <div key={oi} className={cn("text-xs rounded-md border p-2 flex items-start gap-1.5",
                            isCorrectOpt ? "border-success bg-success/10 text-success font-medium" :
                            isSelectedWrong ? "border-danger bg-danger/10 text-danger" :
                            "border-border text-body")}>
                            <span className={cn("shrink-0 font-bold", isCorrectOpt ? "text-success" : isSelectedWrong ? "text-danger" : "text-secondary-text")}>
                              {String.fromCharCode(65 + oi)}.
                            </span>
                            <span>{opt}</span>
                            {isCorrectOpt && <span className="ml-auto shrink-0 text-success">✓</span>}
                            {isSelectedWrong && <span className="ml-auto shrink-0 text-danger">✗</span>}
                          </div>
                        );
                      })}
                    </div>
                    {correctIdx >= 0 && (
                      <p className="mt-2 text-xs font-medium text-success">
                        Correct answer: {String.fromCharCode(65 + correctIdx)}. {q.options[correctIdx]}
                      </p>
                    )}
                    {q.explanation && <p className="mt-2 text-xs text-secondary-text"><b className="text-body">Explanation:</b> {q.explanation}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/mock-tests"><Button variant="outline">Back to tests</Button></Link>
          <Link to="/dashboard"><Button>Dashboard</Button></Link>
          <Button
            variant="outline"
            className="gap-2 border-green-500 text-green-600 hover:bg-green-50 ml-auto"
            onClick={() => {
              const examName = mock?.exam_name ?? "my exam";
              const pct = total > 0 ? Math.round((score / total) * 100) : 0;
              const text = `📊 Just scored ${score}/${total} (${pct}%) on a ${examName} mock test on Meritus!\n\nMeritus has NTA-style simulators, AI-powered Forget-Meter, and personalised study plans.\n\n👉 Try it free: https://meritus.co.in`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
              toast.success("Opening WhatsApp to share your score!");
            }}
          >
            <Share2 size={14} /> Share score
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-white/10 rounded-lg p-3"><div className="text-xs text-indigo-200">{label}</div><div className="mt-1 font-bold text-lg">{value}</div></div>;
}
