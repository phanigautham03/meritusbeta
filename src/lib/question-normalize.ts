import type { QuizQuestion } from "@/components/quiz/ExplanationPanel";

/**
 * Normalizes a question object from a mock_tests.questions JSONB row.
 * Supports BOTH shapes:
 *  - legacy: { text, correct: number, options: string[] }
 *  - new:    { question_text, correct_option: "A"|"B"|"C"|"D", options: { A,B,C,D } }
 */
export function normalizeQuestion(raw: any, index = 0): QuizQuestion & { index: number } {
  const text: string = raw.question_text ?? raw.text ?? raw.stem ?? "";

  let options: string[];
  if (Array.isArray(raw.options)) {
    options = raw.options as string[];
  } else if (raw.options && typeof raw.options === "object") {
    options = ["A", "B", "C", "D", "E"]
      .map((k) => raw.options[k])
      .filter((v) => v != null) as string[];
  } else {
    options = [];
  }

  let correct: number;
  if (typeof raw.correct === "number") {
    correct = raw.correct;
  } else if (typeof raw.correct_option === "string") {
    correct = raw.correct_option.toUpperCase().charCodeAt(0) - 65;
  } else if (typeof raw.correct_index === "number") {
    correct = raw.correct_index;
  } else {
    correct = -1;
  }

  return {
    index,
    id: raw.id,
    text,
    options,
    correct,
    subject: raw.subject,
    topic: raw.topic,
    explanation: raw.explanation,
    detailed_explanation: raw.detailed_explanation,
    key_concept: raw.key_concept,
    common_mistakes: raw.common_mistakes,
    memory_tip: raw.memory_tip,
    related_topics: raw.related_topics,
  };
}

export function normalizeQuestions(rawList: any[] | null | undefined): (QuizQuestion & { index: number })[] {
  return (rawList ?? []).map((q, i) => normalizeQuestion(q, i));
}