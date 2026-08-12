-- ============================================================
-- PART 7: Extra practice tests to ensure ≥ 5 per exam
-- Run AFTER seed_more_tests.sql to top up any exam below 5
-- ============================================================

-- JEE Main — add 1 more practice test (subject-specific)
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('JEE Main', 'JEE Main — Mathematics Booster', 'Focused Mathematics practice test covering Calculus, Algebra, Coordinate Geometry, and Trigonometry.', 30, 60, 'hard', 'Mathematics', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'JEE Main' AND subject = 'Mathematics' ORDER BY random() LIMIT 30) q)),

('JEE Main', 'JEE Main — Physics Booster', 'Focused JEE Physics test — Mechanics, Electrostatics, Optics, and Modern Physics.', 30, 60, 'hard', 'Physics', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'JEE Main' AND subject = 'Physics' ORDER BY random() LIMIT 30) q)),

('JEE Main', 'JEE Main — Chemistry Booster', 'JEE Chemistry practice — Organic, Inorganic, Physical Chemistry consolidated.', 30, 60, 'hard', 'Chemistry', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'JEE Main' AND subject = 'Chemistry' ORDER BY random() LIMIT 30) q));

-- NEET UG — extra practice tests
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('NEET', 'NEET — Biology Booster', 'NEET Biology practice — Botany + Zoology. Covers cell biology, genetics, ecology, human physiology.', 40, 45, 'medium', 'Biology', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'NEET' AND subject = 'Biology' ORDER BY random() LIMIT 40) q)),

('NEET', 'NEET — Physics & Chemistry Combined', 'NEET Physics + Chemistry combined practice test, 30 questions each section.', 30, 40, 'medium', 'Physics & Chemistry', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'NEET' AND subject IN ('Physics','Chemistry') ORDER BY random() LIMIT 30) q));

-- NEET PG — extra practice tests
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('NEET PG', 'NEET PG — Anatomy & Physiology', 'Focused Anatomy + Physiology test for NEET PG aspirants. 30 questions, 30 minutes.', 30, 30, 'hard', 'Anatomy, Physiology', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'NEET PG' AND subject IN ('Anatomy','Physiology') ORDER BY random() LIMIT 30) q)),

('NEET PG', 'NEET PG — Pathology & Pharmacology', 'High-yield Pathology + Pharmacology practice for NEET PG. Focus on commonly tested topics.', 30, 30, 'hard', 'Pathology, Pharmacology', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'NEET PG' AND subject IN ('Pathology','Pharmacology') ORDER BY random() LIMIT 30) q));

-- INICET — extra practice tests
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('INICET', 'INICET — Surgery & Medicine Booster', 'High-yield Surgery + Medicine combined practice test for INICET aspirants.', 30, 30, 'hard', 'Surgery, Medicine', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'INICET' AND subject IN ('Surgery','Medicine') ORDER BY random() LIMIT 30) q)),

('INICET', 'INICET — Obstetrics & Gynaecology Practice', 'O&G focused practice test — labour, hypertensive disorders, contraception, malignancies.', 25, 25, 'hard', 'Obstetrics & Gynaecology', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'INICET' AND subject IN ('Obstetrics','Gynaecology') ORDER BY random() LIMIT 25) q));

-- UPSC — extra practice tests
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('UPSC', 'UPSC — Indian Polity Practice Test', 'UPSC Polity-focused test — Constitution, Parliament, Judiciary, Federalism, Rights.', 30, 35, 'hard', 'Polity', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'UPSC' AND subject = 'Polity' ORDER BY random() LIMIT 30) q)),

('UPSC', 'UPSC — Economy & History Practice', 'Combined Economy + History practice for UPSC Prelims. High-frequency topics.', 30, 35, 'medium', 'Economy, History', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'UPSC' AND subject IN ('Economy','History') ORDER BY random() LIMIT 30) q));

-- CAT — extra practice tests
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('CAT', 'CAT — Quantitative Aptitude Sprint', 'Focused QA practice — Number Theory, Algebra, Geometry, Progressions, P&C.', 30, 40, 'hard', 'Quantitative Aptitude', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'CAT' AND subject = 'Quantitative Aptitude' ORDER BY random() LIMIT 30) q)),

('CAT', 'CAT — Verbal Ability & Logical Reasoning', 'VARC + LR combined test to practice reading, inference, para jumbles, and arrangements.', 30, 40, 'hard', 'VARC, LR', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'CAT' AND subject IN ('Verbal Ability','Logical Reasoning') ORDER BY random() LIMIT 30) q));

-- GATE — extra practice tests
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('GATE', 'GATE — Data Structures & Algorithms', 'Focused GATE CS practice — DSA topics: sorting, graphs, DP, trees, complexity.', 20, 30, 'hard', 'Data Structures', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'GATE' AND subject = 'Data Structures' ORDER BY random() LIMIT 20) q)),

('GATE', 'GATE — OS & Networks Practice', 'GATE Operating Systems + Computer Networks combined practice. Key GATE topics.', 20, 30, 'hard', 'OS, Networks', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'GATE' AND subject IN ('Operating Systems','Computer Networks') ORDER BY random() LIMIT 20) q));

-- IBPS PO — extra practice tests
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('IBPS PO', 'IBPS PO — Reasoning Practice', 'IBPS PO Reasoning: syllogisms, inequalities, coding, blood relations, puzzles, arrangements.', 35, 40, 'medium', 'Reasoning Ability', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'IBPS PO' AND subject = 'Reasoning Ability' ORDER BY random() LIMIT 35) q)),

('IBPS PO', 'IBPS PO — English Language Practice', 'IBPS English practice: RC, error spotting, cloze test, sentence rearrangement, idioms.', 25, 25, 'medium', 'English', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'IBPS PO' AND subject = 'English' ORDER BY random() LIMIT 25) q));

-- SSC CGL — extra practice tests
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions) VALUES
('SSC CGL', 'SSC CGL — General Awareness Booster', 'High-frequency GK for SSC CGL — History, Geography, Science, Economy, Current Affairs.', 40, 30, 'easy', 'General Awareness', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'SSC CGL' AND subject = 'General Awareness' ORDER BY random() LIMIT 40) q)),

('SSC CGL', 'SSC CGL — Quantitative Aptitude Practice', 'SSC CGL Tier-I Quant practice — geometry, SI/CI, profit-loss, ratio, time-work.', 25, 30, 'medium', 'Quantitative Aptitude', 'practice',
 (SELECT jsonb_agg(q) FROM (SELECT id::text AS id, text AS question, options, correct AS correct_answer, explanation, subject, topic, difficulty FROM public.question_bank WHERE exam_name = 'SSC CGL' AND subject = 'Quantitative Aptitude' ORDER BY random() LIMIT 25) q));

-- ============================================================
-- Final count check
-- ============================================================
SELECT exam_name, test_type, COUNT(*) as count
FROM public.mock_tests
GROUP BY exam_name, test_type
ORDER BY exam_name, test_type;
