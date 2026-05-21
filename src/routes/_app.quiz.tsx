import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, ClipboardList, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EXAM_LABELS: Record<string, string> = {
  "JEE Main": "JEE Main",
  "JEE Advanced": "JEE Advanced",
  "NEET": "NEET UG",
  "NEET PG": "NEET PG",
  "AIIMS PG": "AIIMS PG",
  "UPSC": "UPSC CSE",
  "IBPS PO": "IBPS PO",
  "CAT": "CAT",
  "GATE": "GATE CSE",
  "SSC CGL": "SSC CGL",
};

export const Route = createFileRoute("/_app/quiz")({
  component: QuizHub,
  head: () => ({
    meta: [
      { title: "Quiz — Meritus" },
      { name: "description", content: "Topic-wise practice quizzes across 9 exams with NTA-style interface." },
    ],
  }),
});

const diffTone: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

type Batch = {
  id: string;
  exam_name: string;
  title: string;
  difficulty: string;
  subject: string | null;
  num_questions: number;
};

function QuizHub() {
  const [batches, setBatches] = useState<Batch[] | null>(null);
  const [exam, setExam] = useState<string>("");
  const [diff, setDiff] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase
      .from("mock_tests")
      .select("id,exam_name,title,difficulty,subject,num_questions,created_at")
      .order("exam_name")
      .order("created_at")
      .then(({ data }) => {
        const rows = (data as Batch[]) ?? [];
        setBatches(rows);
        setExam((prev) => prev || rows[0]?.exam_name || "");
      });
  }, []);

  const exams = useMemo(() => {
    const m = new Map<string, number>();
    batches?.forEach((b) => m.set(b.exam_name, (m.get(b.exam_name) ?? 0) + 1));
    return Array.from(m.entries())
      .map(([value, count]) => ({ value, label: EXAM_LABELS[value] ?? value, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [batches]);

  const filtered = useMemo(() => {
    if (!batches) return [];
    const needle = q.trim().toLowerCase();
    return batches.filter((b) =>
      b.exam_name === exam &&
      (diff === "all" || b.difficulty?.toLowerCase() === diff) &&
      (!needle ||
        b.title.toLowerCase().includes(needle) ||
        (b.subject ?? "").toLowerCase().includes(needle)),
    );
  }, [batches, exam, diff, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E1B4B]">Quiz Mode</h1>
        <p className="text-sm text-gray-600 mt-1">
          Topic-wise practice batches across 9 competitive exams. NTA-style interface, instant explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Exam sidebar */}
        <aside className="bg-white border border-[#E5E7EB] rounded-xl p-2 h-fit lg:sticky lg:top-20">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 px-3 pt-2 pb-1">
            Exams
          </p>
          <div className="flex flex-col">
            {exams.length === 0 && batches !== null && (
              <p className="px-3 py-2 text-xs text-gray-400">No exams available.</p>
            )}
            {exams.map((e) => {
              const active = e.value === exam;
              return (
                <button
                  key={e.value}
                  onClick={() => setExam(e.value)}
                  className={cn(
                    "flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-[#4338CA] text-white font-semibold"
                      : "text-gray-700 hover:bg-[#F5F3FF]",
                  )}
                >
                  <span>{e.label}</span>
                  <span className={cn(
                    "text-[11px] px-1.5 py-0.5 rounded-full",
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500",
                  )}>
                    {e.count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Batches */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-lg p-1 w-fit">
              {["all", "easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDiff(d)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors",
                    diff === d ? "bg-[#4338CA] text-white" : "text-gray-600 hover:bg-[#F5F3FF]",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search title or subject..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 h-9 bg-white"
              />
            </div>
          </div>

          {batches === null ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-[#4338CA]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-dashed border-[#E5E7EB] rounded-xl p-10 text-center">
              <ClipboardList className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-500">
                No quiz batches match your filters yet.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((b) => (
                <article
                  key={b.id}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "text-[11px] font-bold uppercase px-2 py-0.5 rounded-full",
                      diffTone[b.difficulty?.toLowerCase()] ?? "bg-gray-100 text-gray-700",
                    )}>
                      {b.difficulty}
                    </span>
                    {b.subject && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA]">
                        {b.subject}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#1E1B4B] leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {b.num_questions} questions
                  </p>
                  <Link
                    to="/quiz/$batchId"
                    params={{ batchId: b.id }}
                    className="mt-auto inline-flex items-center justify-center gap-1.5 bg-[#4338CA] hover:bg-[#3730A3] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Start Quiz <ArrowRight size={14} />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}