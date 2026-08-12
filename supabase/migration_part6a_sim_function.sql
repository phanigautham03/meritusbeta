-- ============================================================
-- PART 6A: Create the question-sampling function
-- Run this FIRST, then run part6b_sim_inserts.sql
-- ============================================================

CREATE OR REPLACE FUNCTION public.sample_questions_for_exam(
  p_exam_name text,
  p_count     integer DEFAULT 300
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as owner, bypasses RLS
SET search_path = public
AS $$
DECLARE
  v_questions jsonb;
BEGIN
  SELECT jsonb_agg(q)
  INTO v_questions
  FROM (
    SELECT
      id::text          AS id,
      text              AS question,
      options           AS options,
      correct           AS correct_answer,
      explanation       AS explanation,
      subject           AS subject,
      topic             AS topic,
      difficulty        AS difficulty
    FROM public.question_bank
    WHERE exam_name = p_exam_name
    ORDER BY random()
    LIMIT p_count
  ) q;

  RETURN COALESCE(v_questions, '[]'::jsonb);
END;
$$;

-- Verify function exists and works
SELECT
  exam_name,
  COUNT(*) AS available_questions,
  jsonb_array_length(public.sample_questions_for_exam(exam_name)) AS sampled
FROM (
  SELECT DISTINCT exam_name FROM public.question_bank
) e
GROUP BY exam_name
ORDER BY exam_name;
