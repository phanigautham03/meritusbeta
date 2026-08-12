/**
 * Content Agent — runs Sunday 23:00 IST (17:30 UTC).
 * Generates 10 MCQs per exam via Claude (2-pass: generate + verify).
 * Approved questions go to pending_questions for admin review.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { callClaude, logRunStart, logRunEnd, updateAgentLastRun, getAgentConfig } from "./agent-utils";

// ── Topic rotation per exam ───────────────────────────────────────────────────

const EXAM_TOPICS: Record<string, string[]> = {
  "JEE": [
    "Mechanics — Laws of Motion","Thermodynamics","Electrostatics","Magnetism",
    "Optics","Modern Physics","Chemical Bonding","Organic Chemistry — Hydrocarbons",
    "Electrochemistry","Coordination Compounds","Sets and Relations","Limits and Continuity",
    "Differentiation","Integration","Matrices and Determinants","Probability","Vectors",
    "3D Geometry","Complex Numbers","Differential Equations",
  ],
  "NEET": [
    "Cell Biology","Genetics — Mendelian Inheritance","Human Physiology — Circulatory System",
    "Human Physiology — Nervous System","Plant Physiology","Ecology","Organic Chemistry — Biomolecules",
    "Inorganic Chemistry — p-Block","Mechanics","Electrostatics","Optics","Modern Physics",
    "Biotechnology","Reproduction in Plants","Reproduction in Humans","Microbes in Human Welfare",
    "Animal Kingdom — Classification","Plant Kingdom","Biological Classification","Environmental Issues",
  ],
  "UPSC": [
    "Indian Polity — Constitutional Framework","Indian History — Ancient","Indian History — Medieval",
    "Indian History — Modern Freedom Struggle","Indian Geography — Physical","Indian Geography — Human",
    "Economy — Budget and Fiscal Policy","Economy — Banking and Monetary Policy","Economy — Agriculture",
    "Environment and Ecology","Science and Technology","International Relations",
    "Social Issues","Government Schemes","Art and Culture","Disaster Management",
    "Internal Security","Ethics — Theory","Ethics — Case Studies","Current Affairs",
  ],
  "GATE": [
    "Data Structures","Algorithms — Complexity","Operating Systems — Process Management",
    "Computer Networks — OSI Model","Database Management Systems","Compiler Design",
    "Digital Logic","Computer Organisation","Theory of Computation","Software Engineering",
    "Engineering Mathematics — Linear Algebra","Engineering Mathematics — Calculus",
    "General Aptitude — Verbal","General Aptitude — Numerical",
  ],
  "CAT": [
    "Quantitative Aptitude — Arithmetic","Quantitative Aptitude — Algebra",
    "Quantitative Aptitude — Geometry","Quantitative Aptitude — Modern Maths",
    "VARC — Reading Comprehension","VARC — Verbal Ability","DILR — Data Interpretation",
    "DILR — Logical Reasoning — Arrangements","DILR — Logical Reasoning — Games and Tournaments",
    "Number Systems","Time Speed Distance","Permutation and Combination","Probability",
  ],
  "Banking": [
    "Quantitative Aptitude — Simplification","Quantitative Aptitude — Data Interpretation",
    "Reasoning — Syllogism","Reasoning — Puzzles and Seating Arrangement",
    "Reasoning — Blood Relations","English — Reading Comprehension","English — Error Spotting",
    "General Awareness — Banking Awareness","General Awareness — Current Affairs",
    "Computer Knowledge","Insurance Awareness",
  ],
  "SSC": [
    "General Intelligence — Analogy","General Intelligence — Series","General Awareness — History",
    "General Awareness — Geography","General Awareness — Science","Quantitative Aptitude — Percentage",
    "Quantitative Aptitude — Profit and Loss","English — Cloze Test","English — Idioms and Phrases",
    "Quantitative Aptitude — Geometry and Mensuration",
  ],
  "CUET": [
    "English Language — Reading Comprehension","Domain — Physics Mechanics","Domain — Chemistry Organic",
    "Domain — Biology Cell","Domain — Mathematics Calculus","Domain — Economics Micro",
    "Domain — History — Medieval India","Domain — Geography — India",
    "General Test — Current Affairs","General Test — General Awareness",
  ],
  "State PSC": [
    "Telangana History","Telangana Geography","AP Economy","AP Polity","AP Current Affairs",
    "Indian Polity","Indian Economy","General Science","Quantitative Aptitude","Reasoning",
  ],
};

// ── MCQ structure ─────────────────────────────────────────────────────────────

type MCQ = {
  question_text: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option: string;
  explanation: string;
  key_concept: string;
  memory_tip: string;
  difficulty?: string;
};

type VerifiedMCQ = MCQ & { confidence: number; error_flag: boolean };

// ── Generate + Verify ─────────────────────────────────────────────────────────

async function generateMCQs(exam: string, topic: string): Promise<MCQ[]> {
  const raw = await callClaude(
    `You are an expert question writer for Indian competitive exams. Generate exactly 10 high-quality MCQs. Return ONLY a JSON array, no prose.`,
    `Generate 10 MCQs for ${exam} on topic: "${topic}".
Each item must have exactly these fields:
{
  "question_text": "...",
  "options": {"A":"...","B":"...","C":"...","D":"..."},
  "correct_option": "A|B|C|D",
  "explanation": "2-3 sentence explanation of why the answer is correct",
  "key_concept": "one-line key concept",
  "memory_tip": "one memorable tip",
  "difficulty": "easy|medium|hard"
}
Return only the JSON array.`,
    2048,
  );

  try {
    const match = raw.match(/\[[\s\S]*\]/);
    return JSON.parse(match ? match[0] : raw) as MCQ[];
  } catch {
    return [];
  }
}

async function verifyMCQs(exam: string, topic: string, mcqs: MCQ[]): Promise<VerifiedMCQ[]> {
  const raw = await callClaude(
    `You are a subject matter expert verifying MCQs for ${exam}. Return ONLY a JSON array, no prose.`,
    `Verify each of these ${mcqs.length} MCQs for "${topic}" (${exam}).
For each, check: is the correct_option actually correct? Is the explanation accurate?
Return a JSON array with one item per MCQ:
[{"index": 0, "confidence": 0.0-1.0, "error_flag": true/false, "note": "brief note if error"}]
Return only the JSON array.
MCQs: ${JSON.stringify(mcqs)}`,
    1024,
  );

  type VerifyResult = { index: number; confidence: number; error_flag: boolean };
  let verifications: VerifyResult[] = [];
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    verifications = JSON.parse(match ? match[0] : raw) as VerifyResult[];
  } catch {
    // If verify parse fails, assume medium confidence for all
    verifications = mcqs.map((_, i) => ({ index: i, confidence: 0.75, error_flag: false }));
  }

  return mcqs.map((mcq, i) => {
    const v = verifications.find((v) => v.index === i) ?? { confidence: 0.7, error_flag: false };
    return { ...mcq, confidence: v.confidence, error_flag: v.error_flag };
  });
}

// ── Main entrypoint ───────────────────────────────────────────────────────────

export async function runContentAgent(
  db: SupabaseClient,
): Promise<{ actionsCount: number; metadata: Record<string, unknown> }> {
  const runId = await logRunStart(db, "content");

  try {
    const config = await getAgentConfig(db, "content");
    const topicIndex = (config.topic_index as Record<string, number>) ?? {};

    let totalGenerated = 0;
    let totalPending = 0;
    let totalFlagged = 0;
    const examSummary: Record<string, { topic: string; generated: number; pending: number; flagged: number }> = {};

    for (const [exam, topics] of Object.entries(EXAM_TOPICS)) {
      const idx = (topicIndex[exam] ?? 0) % topics.length;
      const topic = topics[idx];

      try {
        const mcqs = await generateMCQs(exam, topic);
        if (mcqs.length === 0) continue;

        const verified = await verifyMCQs(exam, topic, mcqs);
        const toInsert = verified.map((mcq) => ({
          exam_name: exam,
          subject: topic.split(" — ")[0] ?? topic,
          topic,
          question_text: mcq.question_text,
          options: mcq.options,
          correct_option: mcq.correct_option,
          explanation: mcq.explanation,
          key_concept: mcq.key_concept,
          memory_tip: mcq.memory_tip,
          difficulty: mcq.difficulty ?? "medium",
          ai_confidence: mcq.confidence,
          status: mcq.error_flag || mcq.confidence < 0.85 ? "flagged" : "pending",
        }));

        await db.from("pending_questions").insert(toInsert);

        const pending = toInsert.filter((q) => q.status === "pending").length;
        const flagged = toInsert.filter((q) => q.status === "flagged").length;
        examSummary[exam] = { topic, generated: toInsert.length, pending, flagged };
        totalGenerated += toInsert.length;
        totalPending += pending;
        totalFlagged += flagged;

        // Advance topic index
        topicIndex[exam] = (idx + 1) % topics.length;
      } catch (examErr) {
        console.error(`[content-agent] failed for ${exam}:`, examErr);
        examSummary[exam] = { topic, generated: 0, pending: 0, flagged: 0 };
      }
    }

    // Persist updated topic index
    await db.from("agent_config").update({
      config: { ...config, topic_index: topicIndex },
    }).eq("agent_name", "content");

    const meta = { total_generated: totalGenerated, total_pending: totalPending, total_flagged: totalFlagged, exams: examSummary };
    await logRunEnd(db, runId, "success", totalGenerated, undefined, meta);
    await updateAgentLastRun(db, "content");
    return { actionsCount: totalGenerated, metadata: meta };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logRunEnd(db, runId, "error", 0, msg);
    throw err;
  }
}
