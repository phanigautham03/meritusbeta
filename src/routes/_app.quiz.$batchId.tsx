import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight, Flag, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/components/quiz/ExplanationPanel";
import { normalizeQuestions } from "@/lib/question-normalize";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/quiz/$batchId")({
  component: QuizRunner,
  head: () => ({ meta: [{ title: "Quiz — Meritus" }] }),
});

type Batch = {
  id: string; title: string; duration_minutes: number;
  num_questions: number; questions: QuizQuestion[]; subject: string | null;
};

function QuizRunner() {
  const { batchId } = Route.useParams();
  const nav = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const startedAt = useRef<number>(Date.now());

  const storageKey = `quiz_${batchId}`;

  useEffect(() => {
    supabase.from("mock_tests")
      .select("id,title,duration_minutes,num_questions,questions,subject")
      .eq("id", batchId).maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const b = {
          ...(data as any),
          questions: normalizeQuestions((data as any).questions),
        } as Batch;
        setBatch(b);
        // Restore from localStorage
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const s = JSON.parse(raw);
            if (s.answers) setAnswers(s.answers);
            if (s.marked) setMarked(new Set(s.marked));
            if (s.visited) setVisited(new Set(s.visited));
            if (typeof s.idx === "number") setIdx(s.idx);
            if (typeof s.secondsLeft === "number") {
              setSecondsLeft(s.secondsLeft);
              return;
            }
          }
        } catch {}
        setSecondsLeft(b.duration_minutes * 60);
      });
  }, [batchId, storageKey]);

  // Timer
  useEffect(() => {
    if (!batch) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); submitNow(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch]);

  // Auto-save every 30s
  useEffect(() => {
    const t = setInterval(() => persist(), 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, marked, visited, idx, secondsLeft]);

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        answers, marked: [...marked], visited: [...visited], idx, secondsLeft,
      }));
    } catch {}
  }

  function goto(i: number) {
    setIdx(i);
    setVisited((v) => new Set(v).add(i));
  }

  function selectOption(opt: number) {
    setAnswers((a) => ({ ...a, [idx]: opt }));
  }

  function markReview() {
    setMarked((m) => { const n = new Set(m); n.add(idx); return n; });
    next();
  }

  function clearResponse() {
    setAnswers((a) => { const n = { ...a }; delete n[idx]; return n; });
  }

  function next() {
    if (!batch) return;
    if (idx < batch.questions.length - 1) goto(idx + 1);
  }
  function prev() { if (idx > 0) goto(idx - 1); }

  function submitNow() {
    if (!batch) return;
    persist();
    const timeTaken = batch.duration_minutes * 60 - secondsLeft;
    try {
      localStorage.setItem(`${storageKey}_final`, JSON.stringify({
        answers, timeTaken, submittedAt: Date.now(),
      }));
    } catch {}
    nav({ to: "/quiz/$batchId/result", params: { batchId } });
  }

  if (!batch) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#4338CA]" />
      </div>
    );
  }

  const qs = batch.questions;
  const q = qs[idx];
  const selected = answers[idx];
  const lowTime = secondsLeft < 300;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -my-6 min-h-[calc(100vh-4rem)] flex flex-col bg-[#F5F3FF]">
      {/* Top bar */}
      <header className="bg-[#1E1B4B] text-white px-4 md:px-6 h-14 flex items-center justify-between sticky top-16 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-7 w-7 rounded bg-[#4338CA] flex items-center justify-center font-bold text-xs">M</div>
          <p className="text-sm font-semibold truncate">{batch.title}</p>
        </div>
        <div className={cn(
          "font-mono text-base font-bold tabular-nums px-3 py-1 rounded-md",
          lowTime ? "bg-red-500/30 text-red-200 animate-pulse" : "bg-white/10",
        )}>
          {fmt(secondsLeft)}
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-semibold px-4 py-1.5 rounded-md"
        >
          Submit Test
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px]">
        {/* Main question area */}
        <section className="p-4 md:p-8 order-2 lg:order-1">
          <div className="max-w-3xl mx-auto bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Question {idx + 1} of {qs.length}</span>
              <span>
                {q.subject ?? batch.subject}{q.topic ? ` • ${q.topic}` : ""}
              </span>
            </div>
            <h2 className="text-lg font-medium text-[#1E1B4B] leading-relaxed">
              {q.text}
            </h2>
            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                const active = selected === i;
                return (
                  <button
                    key={i}
                    onClick={() => selectOption(i)}
                    className={cn(
                      "w-full text-left flex gap-3 items-start px-4 py-3 rounded-lg border transition-all",
                      active
                        ? "bg-[#4338CA] text-white border-[#4338CA] shadow-sm"
                        : "bg-white border-[#E5E7EB] text-gray-800 hover:border-[#4338CA] hover:bg-[#F5F3FF]",
                    )}
                  >
                    <span className={cn(
                      "h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold",
                      active ? "bg-white text-[#4338CA]" : "bg-gray-100 text-gray-700",
                    )}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={markReview}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-md border border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Flag size={14} /> Mark for Review
              </button>
              <button
                onClick={clearResponse}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Eraser size={14} /> Clear Response
              </button>
              <button
                onClick={() => { persist(); next(); }}
                className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-md bg-[#4338CA] hover:bg-[#3730A3] text-white"
              >
                Save & Next <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex justify-between pt-1">
              <button
                onClick={prev}
                disabled={idx === 0}
                className="inline-flex items-center gap-1 text-sm text-gray-600 disabled:opacity-30 hover:text-[#4338CA]"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                onClick={next}
                disabled={idx === qs.length - 1}
                className="inline-flex items-center gap-1 text-sm text-gray-600 disabled:opacity-30 hover:text-[#4338CA]"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Palette */}
        <aside className="bg-white border-l border-[#E5E7EB] p-4 order-1 lg:order-2 lg:max-h-[calc(100vh-7.5rem)] lg:sticky lg:top-[7.5rem] overflow-y-auto">
          <h3 className="text-sm font-bold text-[#1E1B4B] mb-3">Question Palette</h3>
          <div className="grid grid-cols-6 lg:grid-cols-5 gap-1.5">
            {qs.map((_, i) => {
              const isAns = answers[i] != null;
              const isMark = marked.has(i);
              const isVis = visited.has(i);
              const isCur = i === idx;
              let style = "bg-gray-200 text-gray-700";
              if (isMark) style = "bg-purple-500 text-white";
              else if (isAns) style = "bg-green-500 text-white";
              else if (isVis) style = "bg-red-500 text-white";
              return (
                <button
                  key={i}
                  onClick={() => goto(i)}
                  className={cn(
                    "h-9 w-9 rounded text-xs font-bold transition",
                    style,
                    isCur && "ring-2 ring-[#4338CA] ring-offset-1",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-1.5 text-xs">
            <Legend color="bg-green-500" label="Answered" />
            <Legend color="bg-red-500" label="Not Answered" />
            <Legend color="bg-gray-300" label="Not Visited" />
            <Legend color="bg-purple-500" label="Marked for Review" />
          </div>

          <div className="mt-5 rounded-lg bg-[#F5F3FF] p-3 text-center">
            <p className="text-xs text-gray-600">Questions Answered</p>
            <p className="text-2xl font-bold text-[#4338CA]">
              {answeredCount} <span className="text-base text-gray-400">/ {qs.length}</span>
            </p>
          </div>
        </aside>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your quiz?</DialogTitle>
            <DialogDescription>
              You've answered {answeredCount} of {qs.length} questions. You won't be able to make changes after submitting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 text-sm font-semibold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >Continue Quiz</button>
            <button
              onClick={submitNow}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-[#4338CA] hover:bg-[#3730A3] text-white"
            >Submit Now</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Link to="/quiz" className="hidden" />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-4 w-4 rounded", color)} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}