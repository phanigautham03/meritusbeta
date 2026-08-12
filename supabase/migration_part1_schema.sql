-- ============================================================
-- PART 1: Schema changes + INICET rename
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- 1. Add test_type column to mock_tests
ALTER TABLE public.mock_tests
  ADD COLUMN IF NOT EXISTS test_type text DEFAULT 'practice'
  CHECK (test_type IN ('practice', 'simulation'));

-- 2. Rename AIIMS PG → INICET everywhere
UPDATE public.mock_tests   SET exam_name = 'INICET' WHERE exam_name IN ('AIIMS PG','INI-CET');
-- INICET rows already exist in study_topics; just remove the old AIIMS PG/INI-CET duplicates
DELETE FROM public.study_topics WHERE exam_name IN ('AIIMS PG','INI-CET');
UPDATE public.user_exams   SET exam_name = 'INICET' WHERE exam_name IN ('AIIMS PG','INI-CET');

-- 3. Fix legacy onboarding mismatches
UPDATE public.user_exams SET exam_name = 'NEET'  WHERE exam_name = 'NEET UG';
UPDATE public.user_exams SET exam_name = 'UPSC'  WHERE exam_name = 'UPSC CSE';
UPDATE public.user_exams SET exam_name = 'GATE'  WHERE exam_name = 'GATE CSE';

-- 4. Create question_bank table (source of truth for all questions)
CREATE TABLE IF NOT EXISTS public.question_bank (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_name     text NOT NULL,
  subject       text NOT NULL,
  topic         text NOT NULL,
  difficulty    text CHECK (difficulty IN ('easy','medium','hard')) DEFAULT 'medium',
  text          text NOT NULL,
  options       jsonb NOT NULL,   -- ["A text","B text","C text","D text"]
  correct       integer NOT NULL CHECK (correct BETWEEN 0 AND 3),
  explanation   text NOT NULL,
  source        text,             -- e.g. "NCERT Class 11", "JEE 2023"
  year          integer,
  created_at    timestamptz DEFAULT now()
);

-- Index for fast random sampling per exam
CREATE INDEX IF NOT EXISTS idx_qb_exam ON public.question_bank (exam_name);
CREATE INDEX IF NOT EXISTS idx_qb_exam_subject ON public.question_bank (exam_name, subject);

-- RLS
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "question_bank_select_auth" ON public.question_bank;
CREATE POLICY "question_bank_select_auth"
  ON public.question_bank FOR SELECT TO authenticated USING (true);

-- 5. Mark existing seed_more_tests data as practice (already default)
UPDATE public.mock_tests SET test_type = 'practice' WHERE test_type IS NULL;

-- Verify
SELECT exam_name, test_type, COUNT(*) FROM public.mock_tests GROUP BY exam_name, test_type ORDER BY exam_name;
