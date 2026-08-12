import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MeritusIcon } from "@/components/meritus/MeritusLogo";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getMockTestForAttempt, startMockAttempt, submitMockAttempt } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/mock-tests/$id")({
  component: TestUI,
  head: () => ({ meta: [{ title: "Mock Test — Meritus" }] }),
});

function TestUI() {
  const { id: testId } = Route.useParams();
  const nav = useNavigate();
  const fetchTest = useServerFn(getMockTestForAttempt);
  const startFn = useServerFn(startMockAttempt);
  const submitFn = useServerFn(submitMockAttempt);

  const { data, isLoading, error } = useQuery({
    queryKey: ["mock-test-attempt", testId],
    queryFn: () => fetchTest({ data: { testId } }),
    staleTime: Infinity,
  });

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({});
  const [secs, setSecs] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!data || startedRef.current) return;
    startedRef.current = true;
    setSecs(data.test.duration_minutes * 60);
    startFn({ data: { mockTestId: testId } })
      .then((r) => setAttemptId(r.attemptId))
      .catch((e) => toast.error(`Could not start: ${e.message}`));
  }, [data, startFn, testId]);

  useEffect(() => { if (data) setVisited((v) => ({ ...v, [current]: true })); }, [current, data]);

  useEffect(() => {
    if (!attemptId) return;
    const i = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, [attemptId]);

  const questions = data?.questions ?? [];
  const total = questions.length;
  const q = questions[current];

  const counts = useMemo(() => {
    let answered = 0, markedC = 0, notAnswered = 0;
    for (let i = 0; i < total; i++) {
      if (marked[i]) markedC++;
      else if (selections[i] != null) answered++;
      else if (visited[i]) notAnswered++;
    }
    return { answered, marked: markedC, notAnswered, notVisited: total - answered - markedC - notAnswered };
  }, [marked, selections, visited, total]);

  const fmt = (s: number) => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  async function handleSubmit() {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const answers = questions.map((qq) => ({
        index: qq.index,
        selected: selections[qq.index] ?? -1,
        marked: !!marked[qq.index],
      }));
      await submitFn({ data: { attemptId, mockTestId: testId, answers } });
      nav({ to: "/results/$id", params: { id: attemptId } });
    } catch (e: any) {
      toast.error(`Submit failed: ${e.message}`);
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (attemptId && secs === 0 && !submitting) handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, attemptId]);

  // counts for the pre-submit confirmation screen
  const confirmCounts = useMemo(() => {
    let answered = 0, markedAnswered = 0, markedUnanswered = 0, notAnswered = 0;
    for (let i = 0; i < total; i++) {
      const isMarked = !!marked[i];
      const hasAnswer = selections[i] != null;
      if (isMarked && hasAnswer) markedAnswered++;
      else if (isMarked && !hasAnswer) markedUnanswered++;
      else if (!isMarked && hasAnswer) answered++;
      else if (visited[i]) notAnswered++;
    }
    const notVisited = total - answered - markedAnswered - markedUnanswered - notAnswered;
    return { answered, markedAnswered, markedUnanswered, notAnswered, notVisited };
  }, [marked, selections, visited, total]);

  if (isLoading || !data) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-secondary-text">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-sm">Loading test…</span>
      </div>
    </div>
  );
  if (error) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-8">
      <div className="max-w-lg w-full bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-semibold text-lg mb-2">Failed to load test</p>
        <p className="text-red-600 text-sm font-mono break-all">{(error as Error).message}</p>
        <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Go Back</button>
      </div>
    </div>
  );
  if (!total) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg font-semibold text-body">This test has no questions.</p>
        <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm">Go Back</button>
      </div>
    </div>
  );

  const cls = (i: number) => {
    if (i === current) return "bg-card border-2 border-gold text-gold";
    if (marked[i]) return "bg-violet-600 text-white";
    if (selections[i] != null) return "bg-success text-white";
    if (visited[i]) return "bg-danger text-white";
    return "bg-muted text-secondary-text";
  };

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col overflow-hidden">
      <header className="bg-navy text-white px-4 h-16 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <MeritusIcon size={30} />
          <div>
            <div className="font-bold text-sm leading-tight">{data.test.title}</div>
            <div className="text-xs text-indigo-200">{data.test.exam_name} · +4 / −1</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("font-mono text-lg md:text-xl font-bold tabular-nums px-3 py-1 rounded", secs < 60 ? "text-red-400" : "text-white")}>{fmt(secs)}</div>
          <Button onClick={() => setShowConfirm(true)} disabled={submitting || !attemptId} className="bg-danger hover:bg-danger/90 font-semibold">{submitting ? "Submitting…" : "Submit Test"}</Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-body">Question {current + 1} of {total}</span>
              {q.topic && <span className="text-xs text-secondary-text">{q.subject} · {q.topic}</span>}
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <p className="text-base leading-relaxed text-body whitespace-pre-wrap">{q.text}</p>
              <div className="mt-6 space-y-3">
                {q.options.map((opt, i) => {
                  const sel = selections[q.index] === i;
                  return (
                    <button key={i} onClick={() => setSelections((p) => ({ ...p, [q.index]: i }))}
                      className={cn("w-full text-left rounded-lg border p-4 flex items-center gap-3 transition-all",
                        sel ? "border-primary bg-primary-light" : "border-border bg-card hover:border-indigo-200 hover:bg-primary-light/40")}>
                      <span className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0", sel ? "border-primary bg-primary" : "border-border")}>
                        {sel && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span className="text-sm text-body">{String.fromCharCode(65 + i)}. {opt}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => { setMarked((p) => ({ ...p, [q.index]: true })); setCurrent((c) => Math.min(total - 1, c + 1)); }} variant="outline" className="border-violet-500 text-violet-600 hover:bg-violet-50">Mark for Review & Next</Button>
                <Button onClick={() => setSelections((p) => { const n = { ...p }; delete n[q.index]; return n; })} variant="ghost">Clear Response</Button>
                <Button onClick={() => setCurrent((c) => Math.max(0, c - 1))} variant="outline" disabled={current === 0}>Previous</Button>
                <Button onClick={() => { setMarked((p) => { const n = { ...p }; delete n[q.index]; return n; }); setCurrent((c) => Math.min(total - 1, c + 1)); }} className="ml-auto font-semibold">Save & Next</Button>
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:w-[300px] bg-card border-t lg:border-t-0 lg:border-l border-border p-5 overflow-y-auto">
          <h3 className="font-semibold text-body">Question Palette</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {[["Answered", counts.answered, "bg-success"], ["Not Answered", counts.notAnswered, "bg-danger"], ["Marked", counts.marked, "bg-violet-600"], ["Not Visited", counts.notVisited, "bg-muted-text"]].map(([l, c, color]) => (
              <div key={l as string} className="flex items-center gap-2">
                <span className={cn("h-3 w-3 rounded", color as string)} />
                <span className="text-secondary-text">{l as string}: <b className="text-body">{c as number}</b></span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-5 gap-1.5">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={cn("h-9 rounded text-xs font-bold flex items-center justify-center", cls(i))}>{i + 1}</button>
            ))}
          </div>
        </aside>
      </div>

      {/* ── Pre-submit confirmation modal ───────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-body">Ready to submit?</h2>
            <p className="text-sm text-secondary-text mt-1">Review your attempt summary before final submission.</p>

            <div className="mt-5 space-y-2">
              {[
                { label: "Answered", count: confirmCounts.answered, color: "bg-success", textColor: "text-success" },
                { label: "Marked for review (answered)", count: confirmCounts.markedAnswered, color: "bg-violet-600", textColor: "text-violet-600" },
                { label: "Marked for review (not answered)", count: confirmCounts.markedUnanswered, color: "bg-violet-300", textColor: "text-violet-500" },
                { label: "Not answered", count: confirmCounts.notAnswered, color: "bg-danger", textColor: "text-danger" },
                { label: "Not visited", count: confirmCounts.notVisited, color: "bg-muted-text", textColor: "text-secondary-text" },
              ].map(({ label, count, color, textColor }) => (
                <div key={label} className="flex items-center justify-between bg-background rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("h-3 w-3 rounded", color)} />
                    <span className="text-sm text-body">{label}</span>
                  </div>
                  <span className={cn("text-sm font-bold tabular-nums", textColor)}>{count}</span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-navy/5 border border-navy/10 rounded-lg px-4 py-2.5 mt-1">
                <span className="text-sm font-semibold text-body">Total questions</span>
                <span className="text-sm font-bold text-body tabular-nums">{total}</span>
              </div>
            </div>

            {(confirmCounts.notAnswered + confirmCounts.markedUnanswered + confirmCounts.notVisited) > 0 && (
              <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠ You have {confirmCounts.notAnswered + confirmCounts.markedUnanswered + confirmCounts.notVisited} unanswered question(s). Unanswered questions score 0 (no negative marking).
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Back to Test</Button>
              <Button className="flex-1 bg-danger hover:bg-danger/90 font-semibold" disabled={submitting} onClick={() => { setShowConfirm(false); handleSubmit(); }}>
                {submitting ? "Submitting…" : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
