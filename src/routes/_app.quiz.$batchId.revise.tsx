import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExplanationPanel, type QuizQuestion } from "@/components/quiz/ExplanationPanel";
import { normalizeQuestions } from "@/lib/question-normalize";

export const Route = createFileRoute("/_app/quiz/$batchId/revise")({
  component: ReviseWrong,
  head: () => ({ meta: [{ title: "Revise — Meritus" }] }),
});

type Batch = { id: string; title: string; questions: QuizQuestion[] };

function ReviseWrong() {
  const { batchId } = Route.useParams();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [final, setFinal] = useState<{ answers: Record<number, number> } | null>(null);
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("mock_tests")
      .select("id,title,questions").eq("id", batchId).maybeSingle()
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

  const wrongs = useMemo(() => {
    if (!batch || !final) return [];
    const out: { q: QuizQuestion; originalSelected: number }[] = [];
    batch.questions.forEach((q, i) => {
      const a = final.answers[i];
      if (a != null && a !== q.correct) out.push({ q, originalSelected: a });
    });
    return out;
  }, [batch, final]);

  if (!batch || !final) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4338CA]" /></div>;
  }

  if (wrongs.length === 0) {
    return (
      <Done message="Nothing to revise — you got everything right!" />
    );
  }

  if (pos >= wrongs.length) {
    return <Done message="Great work! You've reviewed all wrong answers." celebrate />;
  }

  const item = wrongs[pos];
  const revealed = picked != null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/quiz" className="text-sm text-gray-500 hover:text-[#4338CA]">← Quiz Hub</Link>
        <p className="text-sm font-semibold text-gray-600">
          Reviewing {pos + 1} of {wrongs.length} wrong answers
        </p>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#0D9488] transition-all" style={{ width: `${((pos + 1) / wrongs.length) * 100}%` }} />
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5">
        <p className="text-xs font-semibold text-gray-500 uppercase">
          {item.q.subject}{item.q.topic ? ` • ${item.q.topic}` : ""}
        </p>
        <h2 className="text-lg font-medium text-[#1E1B4B] leading-relaxed">{item.q.text}</h2>

        <div className="space-y-2.5">
          {item.q.options.map((opt, i) => {
            const isCorrect = i === item.q.correct;
            const isPicked = picked === i;
            let cls = "bg-white border-[#E5E7EB] hover:border-[#4338CA] hover:bg-[#F5F3FF]";
            if (revealed) {
              if (isCorrect) cls = "bg-green-50 border-green-400 text-green-900";
              else if (isPicked) cls = "bg-red-50 border-red-400 text-red-900";
              else cls = "bg-white border-[#E5E7EB] opacity-60";
            }
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => setPicked(i)}
                className={cn(
                  "w-full text-left flex gap-3 items-start px-4 py-3 rounded-lg border transition-all",
                  cls,
                )}
              >
                <span className="h-6 w-6 shrink-0 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm">{opt}</span>
              </button>
            );
          })}
        </div>

        {revealed && <ExplanationPanel q={item.q} selected={picked} />}

        {revealed && (
          <button
            onClick={() => { setPos((p) => p + 1); setPicked(null); }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold text-sm"
          >
            {pos + 1 === wrongs.length ? "Finish Review" : "Next Wrong Answer"} <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function Done({ message, celebrate }: { message: string; celebrate?: boolean }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="relative inline-flex">
        <PartyPopper size={56} className="text-[#D97706]" />
        {celebrate && (
          <>
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-2 w-2 rounded-sm animate-confetti"
                style={{
                  left: "50%", top: "50%",
                  background: ["#4338CA", "#0D9488", "#D97706", "#EF4444", "#10B981"][i % 5],
                  // @ts-expect-error css var
                  "--dx": `${(Math.random() - 0.5) * 200}px`,
                  "--dy": `${-Math.random() * 200 - 40}px`,
                  "--rot": `${Math.random() * 720}deg`,
                  animationDelay: `${i * 30}ms`,
                }}
              />
            ))}
          </>
        )}
      </div>
      <h2 className="text-2xl font-bold text-[#1E1B4B] mt-6">{message}</h2>
      <Link
        to="/quiz"
        className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold text-sm"
      >Back to Quiz Hub <ArrowRight size={14} /></Link>
    </div>
  );
}