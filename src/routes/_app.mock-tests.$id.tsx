import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getTestForAttempt, startAttempt, submitAttempt } from "@/lib/tests.functions";

export const Route = createFileRoute("/_app/mock-tests/$id")({
  component: TestUI,
  head: () => ({ meta: [{ title: "NEET PG Test — Meritus" }] }),
});

type AnswerState = "answered" | "marked" | "notAnswered";

function TestUI() {
  const { id: testId } = Route.useParams();
  const nav = useNavigate();
  const fetchTest = useServerFn(getTestForAttempt);
  const startFn = useServerFn(startAttempt);
  const submitFn = useServerFn(submitAttempt);

  const { data, isLoading, error } = useQuery({
    queryKey: ["test-attempt", testId],
    queryFn: () => fetchTest({ data: { testId } }),
    staleTime: Infinity,
  });

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState<Record<string, number | null>>({});
  const [statuses, setStatuses] = useState<Record<string, AnswerState>>({});
  const [secs, setSecs] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  // Start attempt + timer once test loads
  useEffect(() => {
    if (!data || startedRef.current) return;
    startedRef.current = true;
    setSecs(data.test.duration_min * 60);
    startFn({ data: { testId } })
      .then((r) => setAttemptId(r.attemptId))
      .catch((e) => toast.error(`Could not start test: ${e.message}`));
  }, [data, startFn, testId]);

  useEffect(() => {
    if (!attemptId) return;
    const i = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, [attemptId]);

  const questions = data?.questions ?? [];
  const total = questions.length;
  const q = questions[current];

  const counts = useMemo(() => {
    let answered = 0, notAnswered = 0, marked = 0;
    for (const s of Object.values(statuses)) {
      if (s === "answered") answered++;
      else if (s === "notAnswered") notAnswered++;
      else if (s === "marked") marked++;
    }
    return { answered, notAnswered, marked, notVisited: total - Object.keys(statuses).length };
  }, [statuses, total]);

  const fmt = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${ss}`;
  };

  function pick(idx: number) {
    if (!q) return;
    setSelections((p) => ({ ...p, [q.id]: idx }));
  }

  function save(markReview = false) {
    if (!q) return;
    const sel = selections[q.id];
    setStatuses((p) => ({
      ...p,
      [q.id]: markReview ? "marked" : sel != null ? "answered" : "notAnswered",
    }));
    setCurrent((c) => Math.min(total - 1, c + 1));
  }

  async function handleSubmit() {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const answers = questions.map((qq) => ({
        questionId: qq.id,
        selectedIndex: selections[qq.id] ?? null,
        markedReview: statuses[qq.id] === "marked",
        timeSpentS: 0,
      }));
      await submitFn({ data: { attemptId, answers } });
      nav({ to: "/results/$id", params: { id: attemptId } });
    } catch (e: any) {
      toast.error(`Submit failed: ${e.message}`);
      setSubmitting(false);
    }
  }

  // Auto-submit when timer hits zero
  useEffect(() => {
    if (attemptId && secs === 0 && !submitting) handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secs, attemptId]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-secondary-text"><Loader2 className="animate-spin" /> Loading test…</div>
      </div>
    );
  }
  if (error) return <div className="p-8 text-danger">Failed: {(error as Error).message}</div>;
  if (!total) return <div className="p-8">This test has no questions yet.</div>;

  const cls = (i: number) => {
    if (i === current) return "bg-card border-2 border-gold text-gold";
    const s = statuses[questions[i].id];
    if (s === "answered") return "bg-success text-white";
    if (s === "notAnswered") return "bg-danger text-white";
    if (s === "marked") return "bg-violet-600 text-white";
    return "bg-muted text-secondary-text";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-navy text-white px-4 h-16 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center font-bold text-sm">M</div>
          <div>
            <div className="font-bold text-sm leading-tight">{data.test.title}</div>
            <div className="text-xs text-indigo-200">+{data.test.marks_per_correct} correct · {data.test.marks_per_wrong} wrong</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("font-mono text-lg md:text-xl font-bold tabular-nums px-3 py-1 rounded", secs < 60 ? "text-red-400" : "text-white")}>
            {fmt(secs)}
          </div>
          <Button onClick={handleSubmit} disabled={submitting || !attemptId} className="bg-danger hover:bg-danger/90 font-semibold">
            {submitting ? "Submitting…" : "Submit Test"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-body">Question {current + 1} of {total}</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <p className="text-base leading-relaxed text-body whitespace-pre-wrap">{q.stem}</p>
              <div className="mt-6 space-y-3">
                {q.options.map((opt, i) => {
                  const sel = selections[q.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => pick(i)}
                      className={cn(
                        "w-full text-left rounded-lg border p-4 flex items-center gap-3 transition-all",
                        sel ? "border-primary bg-primary-light" : "border-border bg-card hover:border-indigo-200 hover:bg-primary-light/40",
                      )}
                    >
                      <span className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0", sel ? "border-primary bg-primary" : "border-border")}>
                        {sel && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span className="text-sm text-body">{String.fromCharCode(65 + i)}. {opt}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => save(true)} variant="outline" className="border-violet-500 text-violet-600 hover:bg-violet-50">Mark for Review & Next</Button>
                <Button onClick={() => setSelections((p) => ({ ...p, [q.id]: null }))} variant="ghost">Clear Response</Button>
                <Button onClick={() => setCurrent((c) => Math.max(0, c - 1))} variant="outline" disabled={current === 0}>Previous</Button>
                <Button onClick={() => save(false)} className="ml-auto font-semibold">Save & Next</Button>
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:w-[300px] bg-card border-t lg:border-t-0 lg:border-l border-border p-5 overflow-y-auto">
          <h3 className="font-semibold text-body">Question Palette</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {[
              ["Answered", counts.answered, "bg-success"],
              ["Not Answered", counts.notAnswered, "bg-danger"],
              ["Marked", counts.marked, "bg-violet-600"],
              ["Not Visited", counts.notVisited, "bg-muted-text"],
            ].map(([l, c, color]) => (
              <div key={l as string} className="flex items-center gap-2">
                <span className={cn("h-3 w-3 rounded", color as string)} />
                <span className="text-secondary-text">{l as string}: <b className="text-body">{c as number}</b></span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-5 gap-1.5">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={cn("h-9 rounded text-xs font-bold flex items-center justify-center", cls(i))}>
                {i + 1}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}