import { Lightbulb } from "lucide-react";

export type QuizQuestion = {
  id?: number;
  text: string;
  options: string[];
  correct: number;
  subject?: string;
  topic?: string;
  explanation?: string;
  detailed_explanation?: string;
  key_concept?: string;
  common_mistakes?: string;
  memory_tip?: string;
  related_topics?: string[];
};

export function ExplanationPanel({
  q,
  selected,
}: {
  q: QuizQuestion;
  selected: number | null | undefined;
}) {
  const wrong = selected != null && selected >= 0 && selected !== q.correct;
  return (
    <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div
          className={`rounded-md p-3 text-sm border ${
            wrong
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-gray-50 border-gray-200 text-gray-700"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
            Your answer
          </p>
          <p className="font-medium mt-1">
            {selected == null || selected < 0
              ? "Not attempted"
              : `${String.fromCharCode(65 + selected)}. ${q.options[selected]}`}
          </p>
        </div>
        <div className="rounded-md p-3 text-sm border bg-green-50 border-green-200 text-green-800">
          <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
            Correct answer
          </p>
          <p className="font-medium mt-1">
            {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}
          </p>
        </div>
      </div>

      {q.explanation && (
        <p className="text-sm font-semibold text-[#1E1B4B]">{q.explanation}</p>
      )}
      {q.detailed_explanation && (
        <p className="text-sm text-gray-700 leading-relaxed">{q.detailed_explanation}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {q.key_concept && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA]">
            Concept: {q.key_concept}
          </span>
        )}
        {q.topic && !q.key_concept && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA]">
            Topic: {q.topic}
          </span>
        )}
      </div>

      {q.common_mistakes && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1">Common mistake</p>
          {q.common_mistakes}
        </div>
      )}
      {q.memory_tip && (
        <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900 flex gap-2">
          <Lightbulb size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide mb-1">Memory tip</p>
            {q.memory_tip}
          </div>
        </div>
      )}
      {q.related_topics && q.related_topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {q.related_topics.map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}