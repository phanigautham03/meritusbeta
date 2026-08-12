-- ============================================================
-- PART 2 FIX: Recreate question_bank with correct schema
-- Run this BEFORE migration_part2_jee_neet_qbank.sql
-- Safe to run — question_bank is empty, no data is lost
-- ============================================================

-- Drop the broken table (missing "text" column from a partial earlier run)
DROP TABLE IF EXISTS public.question_bank CASCADE;

-- Recreate with all columns
CREATE TABLE public.question_bank (
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

-- Indexes for fast random sampling per exam
CREATE INDEX idx_qb_exam ON public.question_bank (exam_name);
CREATE INDEX idx_qb_exam_subject ON public.question_bank (exam_name, subject);

-- RLS
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "question_bank_select_auth" ON public.question_bank;
CREATE POLICY "question_bank_select_auth"
  ON public.question_bank FOR SELECT TO authenticated USING (true);

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'question_bank'
ORDER BY ordinal_position;
