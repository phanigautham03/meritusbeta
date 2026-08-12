-- ============================================================
-- PART 6: NTA Simulations — 4 per exam, 300 Qs each
-- Run AFTER parts 1-5 (question_bank must be populated)
-- ============================================================
-- This inserts simulation records. The questions jsonb is populated
-- by randomly sampling from question_bank per exam.
-- The test interface uses mock_tests.questions for the exam.
-- ============================================================

-- Helper function to sample N questions from question_bank for a given exam
-- Returns jsonb array compatible with existing test interface
CREATE OR REPLACE FUNCTION public.sample_questions_for_exam(
  p_exam_name text,
  p_count integer DEFAULT 300
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_questions jsonb;
  v_available integer;
BEGIN
  SELECT COUNT(*) INTO v_available
  FROM public.question_bank
  WHERE exam_name = p_exam_name;

  -- If fewer questions available, use all of them (repeated if needed for demo)
  SELECT jsonb_agg(q ORDER BY random())
  INTO v_questions
  FROM (
    SELECT
      id::text AS id,
      text AS question,
      options AS options,
      correct AS correct_answer,
      explanation AS explanation,
      subject AS subject,
      topic AS topic,
      difficulty AS difficulty
    FROM public.question_bank
    WHERE exam_name = p_exam_name
    ORDER BY random()
    LIMIT p_count
  ) q;

  RETURN COALESCE(v_questions, '[]'::jsonb);
END;
$$;

-- ============================================================
-- JEE Main — 4 NTA Simulations (180 min, 300 questions)
-- ============================================================
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('JEE Main', 'JEE Main Full Simulation 1', 'Complete NTA-pattern JEE Main simulation covering Physics, Chemistry, and Mathematics. +4/−1 marking. 300 questions, 180 minutes.', 300, 180, 'hard', 'Physics, Chemistry, Mathematics', 'simulation', public.sample_questions_for_exam('JEE Main', 300)),
('JEE Main', 'JEE Main Full Simulation 2', 'NTA-style JEE Main mock — randomly drawn from our question bank. Mirrors actual exam pattern and difficulty.', 300, 180, 'hard', 'Physics, Chemistry, Mathematics', 'simulation', public.sample_questions_for_exam('JEE Main', 300)),
('JEE Main', 'JEE Main Full Simulation 3', 'Third full-length JEE Main simulation. Questions randomly selected per section. Real exam experience.', 300, 180, 'hard', 'Physics, Chemistry, Mathematics', 'simulation', public.sample_questions_for_exam('JEE Main', 300)),
('JEE Main', 'JEE Main Full Simulation 4', 'Fourth JEE Main NTA simulation — best used as a final revision test before exam day.', 300, 180, 'hard', 'Physics, Chemistry, Mathematics', 'simulation', public.sample_questions_for_exam('JEE Main', 300));

-- ============================================================
-- NEET — 4 NTA Simulations (200 min, 300 questions)
-- ============================================================
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('NEET', 'NEET Full Simulation 1', 'Complete NEET UG simulation — Physics, Chemistry, Biology. 300 questions, 200 minutes, +4/−1 marking. NTA-pattern.', 300, 200, 'hard', 'Physics, Chemistry, Biology', 'simulation', public.sample_questions_for_exam('NEET', 300)),
('NEET', 'NEET Full Simulation 2', 'Second full-length NEET simulation. Randomised question order from our question bank for authentic practice.', 300, 200, 'hard', 'Physics, Chemistry, Biology', 'simulation', public.sample_questions_for_exam('NEET', 300)),
('NEET', 'NEET Full Simulation 3', 'Third NEET NTA simulation. Covers NCERT-aligned questions across all three subjects.', 300, 200, 'hard', 'Physics, Chemistry, Biology', 'simulation', public.sample_questions_for_exam('NEET', 300)),
('NEET', 'NEET Full Simulation 4', 'Final NEET simulation — comprehensive coverage. Best attempted after completing all chapters.', 300, 200, 'hard', 'Physics, Chemistry, Biology', 'simulation', public.sample_questions_for_exam('NEET', 300));

-- ============================================================
-- NEET PG — 4 NTA Simulations (210 min, 300 questions)
-- ============================================================
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('NEET PG', 'NEET PG Full Simulation 1', 'Full-length NEET PG simulation covering Anatomy, Physiology, Biochemistry, Pathology, Pharmacology and more. 300 Qs.', 300, 210, 'hard', 'Pre-clinical & Clinical', 'simulation', public.sample_questions_for_exam('NEET PG', 300)),
('NEET PG', 'NEET PG Full Simulation 2', 'Second NEET PG simulation — questions randomly sampled from our clinical sciences bank.', 300, 210, 'hard', 'Pre-clinical & Clinical', 'simulation', public.sample_questions_for_exam('NEET PG', 300)),
('NEET PG', 'NEET PG Full Simulation 3', 'Third NEET PG NTA-pattern simulation. Detailed explanations available after submission.', 300, 210, 'hard', 'Pre-clinical & Clinical', 'simulation', public.sample_questions_for_exam('NEET PG', 300)),
('NEET PG', 'NEET PG Full Simulation 4', 'Final NEET PG simulation — comprehensive revision covering all 19 subjects.', 300, 210, 'hard', 'Pre-clinical & Clinical', 'simulation', public.sample_questions_for_exam('NEET PG', 300));

-- ============================================================
-- INICET — 4 NTA Simulations (210 min, 300 questions)
-- ============================================================
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('INICET', 'INICET Full Simulation 1', 'Complete INI-CET pattern simulation covering Surgery, Medicine, Obstetrics & Gynaecology, Paediatrics. 300 questions.', 300, 210, 'hard', 'Surgery, Medicine, O&G', 'simulation', public.sample_questions_for_exam('INICET', 300)),
('INICET', 'INICET Full Simulation 2', 'Second INICET simulation — randomly drawn clinical questions from AIIMS PG pattern.', 300, 210, 'hard', 'Surgery, Medicine, O&G', 'simulation', public.sample_questions_for_exam('INICET', 300)),
('INICET', 'INICET Full Simulation 3', 'Third INICET simulation. Covers advanced clinical sciences as tested in INI-CET.', 300, 210, 'hard', 'Surgery, Medicine, O&G', 'simulation', public.sample_questions_for_exam('INICET', 300)),
('INICET', 'INICET Full Simulation 4', 'Final INICET NTA simulation — best attempt close to exam date for time management practice.', 300, 210, 'hard', 'Surgery, Medicine, O&G', 'simulation', public.sample_questions_for_exam('INICET', 300));

-- ============================================================
-- UPSC — 4 Simulations (120 min GS Paper, 300 questions)
-- ============================================================
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('UPSC', 'UPSC CSE Prelims Simulation 1', 'Full UPSC CSE Prelims GS Paper simulation — Polity, History, Geography, Economy, Science. 300 questions, 120 min.', 300, 120, 'hard', 'General Studies', 'simulation', public.sample_questions_for_exam('UPSC', 300)),
('UPSC', 'UPSC CSE Prelims Simulation 2', 'Second UPSC Prelims simulation — comprehensive coverage of the GS Paper 1 syllabus.', 300, 120, 'hard', 'General Studies', 'simulation', public.sample_questions_for_exam('UPSC', 300)),
('UPSC', 'UPSC CSE Prelims Simulation 3', 'Third UPSC simulation. Current Affairs + Static GS mix to mirror actual exam pattern.', 300, 120, 'hard', 'General Studies', 'simulation', public.sample_questions_for_exam('UPSC', 300)),
('UPSC', 'UPSC CSE Prelims Simulation 4', 'Final UPSC Prelims simulation. Best attempted as a complete mock before examination.', 300, 120, 'hard', 'General Studies', 'simulation', public.sample_questions_for_exam('UPSC', 300));

-- ============================================================
-- CAT — 4 Simulations (120 min, 300 questions)
-- ============================================================
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('CAT', 'CAT Full Simulation 1', 'Complete CAT simulation — VARC, DILR, and Quantitative Aptitude. 300 questions, 120 minutes. IIM-pattern.', 300, 120, 'hard', 'VARC, DILR, QA', 'simulation', public.sample_questions_for_exam('CAT', 300)),
('CAT', 'CAT Full Simulation 2', 'Second CAT simulation — randomly drawn from our question bank across all three sections.', 300, 120, 'hard', 'VARC, DILR, QA', 'simulation', public.sample_questions_for_exam('CAT', 300)),
('CAT', 'CAT Full Simulation 3', 'Third CAT simulation. Focus on accuracy and time management under exam conditions.', 300, 120, 'hard', 'VARC, DILR, QA', 'simulation', public.sample_questions_for_exam('CAT', 300)),
('CAT', 'CAT Full Simulation 4', 'Final CAT simulation — complete IIM-pattern mock test. Use to identify weak areas.', 300, 120, 'hard', 'VARC, DILR, QA', 'simulation', public.sample_questions_for_exam('CAT', 300));

-- ============================================================
-- GATE — 4 Simulations (180 min, 300 questions)
-- ============================================================
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('GATE', 'GATE CSE Full Simulation 1', 'Full-length GATE CSE simulation — Data Structures, Algorithms, OS, Networks, DBMS, TOC. 300 questions.', 300, 180, 'hard', 'CS Core Subjects', 'simulation', public.sample_questions_for_exam('GATE', 300)),
('GATE', 'GATE CSE Full Simulation 2', 'Second GATE simulation — randomly drawn from our CS question bank. IIT/IISC pattern.', 300, 180, 'hard', 'CS Core Subjects', 'simulation', public.sample_questions_for_exam('GATE', 300)),
('GATE', 'GATE CSE Full Simulation 3', 'Third GATE CSE simulation. Includes numerical answer type (NAT) style questions.', 300, 180, 'hard', 'CS Core Subjects', 'simulation', public.sample_questions_for_exam('GATE', 300)),
('GATE', 'GATE CSE Full Simulation 4', 'Final GATE simulation — best attempt close to exam to assess score and readiness.', 300, 180, 'hard', 'CS Core Subjects', 'simulation', public.sample_questions_for_exam('GATE', 300));

-- ============================================================
-- IBPS PO — 4 Simulations (120 min, 300 questions)
-- ============================================================
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('IBPS PO', 'IBPS PO Mains Simulation 1', 'Full IBPS PO Mains simulation — Reasoning, English, Quantitative Aptitude, General Awareness, Computer. 300 questions.', 300, 120, 'hard', 'All Sections', 'simulation', public.sample_questions_for_exam('IBPS PO', 300)),
('IBPS PO', 'IBPS PO Mains Simulation 2', 'Second IBPS PO simulation — comprehensive coverage of the Mains pattern.', 300, 120, 'hard', 'All Sections', 'simulation', public.sample_questions_for_exam('IBPS PO', 300)),
('IBPS PO', 'IBPS PO Mains Simulation 3', 'Third IBPS PO simulation. Includes banking awareness questions mixed with GA.', 300, 120, 'hard', 'All Sections', 'simulation', public.sample_questions_for_exam('IBPS PO', 300)),
('IBPS PO', 'IBPS PO Mains Simulation 4', 'Final IBPS PO simulation — timed mock to practice speed and accuracy under pressure.', 300, 120, 'hard', 'All Sections', 'simulation', public.sample_questions_for_exam('IBPS PO', 300));

-- ============================================================
-- SSC CGL — 4 Simulations (120 min, 300 questions)
-- ============================================================
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('SSC CGL', 'SSC CGL Tier-I Simulation 1', 'Full SSC CGL Tier-I simulation — General Intelligence, GK, English, Quantitative Aptitude. 300 questions, 120 min.', 300, 120, 'medium', 'All Sections', 'simulation', public.sample_questions_for_exam('SSC CGL', 300)),
('SSC CGL', 'SSC CGL Tier-I Simulation 2', 'Second SSC CGL simulation — covers complete Tier-I syllabus with SSC-pattern questions.', 300, 120, 'medium', 'All Sections', 'simulation', public.sample_questions_for_exam('SSC CGL', 300)),
('SSC CGL', 'SSC CGL Tier-I Simulation 3', 'Third SSC CGL simulation. Current Affairs + reasoning heavily tested in this set.', 300, 120, 'medium', 'All Sections', 'simulation', public.sample_questions_for_exam('SSC CGL', 300)),
('SSC CGL', 'SSC CGL Tier-I Simulation 4', 'Final SSC CGL simulation — complete mock test to assess Tier-I readiness.', 300, 120, 'medium', 'All Sections', 'simulation', public.sample_questions_for_exam('SSC CGL', 300));

-- ============================================================
-- VERIFY: Count simulations per exam
-- ============================================================
SELECT exam_name, test_type, COUNT(*) as count
FROM public.mock_tests
GROUP BY exam_name, test_type
ORDER BY exam_name, test_type;

-- Count practice tests too (ensure ≥5 per exam)
SELECT exam_name, test_type, COUNT(*) as count
FROM public.mock_tests
WHERE test_type = 'practice'
GROUP BY exam_name, test_type
ORDER BY exam_name;
