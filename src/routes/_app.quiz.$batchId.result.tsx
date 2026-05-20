import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronDown, Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExplanationPanel, type QuizQuestion } from "@/components/quiz/ExplanationPanel";
import { normalizeQuestions } from "@/lib/question-normalize";

export const Route = createFileRoute("/_app/quiz/$batchId/result")({
  component: QuizResult,
  head: () => ({ meta: [{ title: "Quiz Result — Meritus" }] }),
});

type Batch = { id: string; title: string; questions: QuizQuestion[]; duration_minutes: number };

function QuizResult() {
  const { batchId } = Route.useParams();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [final, setFinal] = useState<{ answers: Record<number, number>; timeTaken: number } | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set());

  useEffect(() => {
    supabase.from("mock_tests")
      .select("id,title,questions,duration_minutes").eq("id", batchId).maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setBatch({
          ...(data as any),
          questions: normalizeQuestions((data as any).questions),
        } as Batch);
      });
    try {
      const raw = localStorage.getItem(`quiz_${batchId}_final`);
      if (raw) setFinal(JSON.parse(raw));
    } catch {}
  }, [batchId]);

  const stats = useMemo(() => {
    if (!batch || !final) return null;
    let correct = 0, wrong = 0, skipped = 0;
    const bySubject: Record<string, { attempted: number; correct: number; total: number }> = {};
    batch.questions.forEach((q, i) => {
      const subj = q.subject ?? "General";
      bySubject[subj] ??= { attempted: 0, correct: 0, total: 0 };
      bySubject[subj].total += 1;
      const a = final.answers[i];
      if (a == null) skipped++;
      else {
        bySubject[subj].attempted += 1;
        if (a === q.correct) { correct++; bySubject[subj].correct += 1; }
        else wrong++;
      }
    });
    const total = batch.questions.length;
    const pct = Math.round((correct / total) * 100);
    const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
    return { correct, wrong, skipped, total, pct, accuracy, bySubject };
  }, [batch, final]);

  if (!batch || !final || !stats) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4338CA]" /></div>;
  }

  const ringColor = stats.pct >= 70 ? "#10B981" : stats.pct >= 40 ? "#D97706" : "#EF4444";
  const r = 56, c = 2 * Math.PI * r;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Score card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative h-36 w-36 shrink-0">
          <svg className="-rotate-90 h-36 w-36">
            <circle cx="72" cy="72" r={r} stroke="#E5E7EB" strokeWidth="10" fill="none" />
            <circle
              cx="72" cy="72" r={r} stroke={ringColor} strokeWidth="10" fill="none"
              strokeDasharray={c}
              strokeDashoffset={c - (c * stats.pct) / 100}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold" style={{ color: ringColor }}>{stats.pct}%</p>
            <p className="text-[11px] text-gray-500 uppercase tracking-wide">Score</p>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl font-bold text-[#1E1B4B]">{batch.title}</h1>
          <p className="text-gray-600 mt-1">{stats.correct} / {stats.total} correct</p>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <Stat label="Correct" value={stats.correct} tone="text-green-600" />
            <Stat label="Wrong" value={stats.wrong} tone="text-red-600" />
            <Stat label="Skipped" value={stats.skipped} tone="text-gray-500" />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Time taken: {fmtMin(final.timeTaken)} • Accuracy: {stats.accuracy}%
          </p>
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h2 className="font-bold text-[#1E1B4B] mb-4">Subject-wise Breakdown</h2>
        <div className="space-y-3">
          {Object.entries(stats.bySubject).map(([subj, s]) => {
            const pct = s.attempted > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div key={subj}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-800">{subj}</span>
                  <span className="text-gray-500">
                    {s.correct}/{s.total} correct • {s.attempted} attempted
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0D9488] rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question review */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h2 className="font-bold text-[#1E1B4B] mb-4">Question Review</h2>
        <ul className="divide-y divide-[#E5E7EB]">
          {batch.questions.map((q, i) => {
            const a = final.answers[i];
            const status = a == null ? "skipped" : a === q.correct ? "correct" : "wrong";
            const isOpen = open.has(i);
            return (
              <li key={i} className="py-3">
                <button
                  onClick={() => setOpen((s) => {
                    const n = new Set(s);
                    n.has(i) ? n.delete(i) : n.add(i);
                    return n;
                  })}
                  className="w-full flex items-start gap-3 text-left"
                >
                  <span className="text-xs font-bold text-gray-400 mt-1 w-6">{i + 1}</span>
                  <p className="flex-1 text-sm text-gray-800 line-clamp-2">{q.text}</p>
                  <StatusBadge status={status} />
                  <ChevronDown size={16} className={cn("text-gray-400 transition-transform mt-1", isOpen && "rotate-180")} />
                </button>
                {isOpen && <ExplanationPanel q={q} selected={a} />}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/quiz/$batchId/revise"
          params={{ batchId }}
          className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold text-sm"
        >Revise Wrong Answers</Link>
        <Link
          to="/quiz"
          className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#1E1B4B] font-semibold text-sm hover:bg-[#F5F3FF]"
        >Try Another Quiz</Link>
        <button
          disabled
          title="Coming soon"
          className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-lg border border-[#E5E7EB] bg-gray-50 text-gray-400 font-semibold text-sm cursor-not-allowed"
        >Save to Forget-Meter</button>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg bg-[#F5F3FF] py-2">
      <p className={cn("text-xl font-bold", tone)}>{value}</p>
      <p className="text-[11px] text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "correct" | "wrong" | "skipped" }) {
  if (status === "correct") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
      <Check size={12} /> Correct
    </span>
  );
  if (status === "wrong") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
      <X size={12} /> Wrong
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
      <Minus size={12} /> Skipped
    </span>
  );
}

function fmtMin(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m ${s}s`;
}