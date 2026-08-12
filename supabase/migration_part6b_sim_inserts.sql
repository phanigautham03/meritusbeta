-- ============================================================
-- PART 6B: Insert NTA Simulations — 4 per exam × 9 exams = 36
-- Uses INSERT ... SELECT instead of VALUES to avoid planner issues
-- Run AFTER part6a_sim_function.sql
-- ============================================================

-- JEE Main
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'JEE Main','JEE Main Full Simulation 1','Complete NTA-pattern JEE Main simulation — Physics, Chemistry, Mathematics. +4/−1 marking.',300,180,'hard','Physics, Chemistry, Mathematics','simulation', public.sample_questions_for_exam('JEE Main',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'JEE Main','JEE Main Full Simulation 2','NTA-style JEE Main mock — randomly drawn from our question bank. Mirrors actual exam pattern.',300,180,'hard','Physics, Chemistry, Mathematics','simulation', public.sample_questions_for_exam('JEE Main',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'JEE Main','JEE Main Full Simulation 3','Third full-length JEE Main simulation. Real exam experience with timed interface.',300,180,'hard','Physics, Chemistry, Mathematics','simulation', public.sample_questions_for_exam('JEE Main',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'JEE Main','JEE Main Full Simulation 4','Final JEE Main NTA simulation — best used as a revision test before exam day.',300,180,'hard','Physics, Chemistry, Mathematics','simulation', public.sample_questions_for_exam('JEE Main',300);

-- NEET
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'NEET','NEET Full Simulation 1','Complete NEET UG simulation — Physics, Chemistry, Biology. 300 questions, 200 minutes, +4/−1 marking.',300,200,'hard','Physics, Chemistry, Biology','simulation', public.sample_questions_for_exam('NEET',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'NEET','NEET Full Simulation 2','Second full-length NEET simulation. Randomised question order from our question bank.',300,200,'hard','Physics, Chemistry, Biology','simulation', public.sample_questions_for_exam('NEET',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'NEET','NEET Full Simulation 3','Third NEET NTA simulation. NCERT-aligned questions across all three subjects.',300,200,'hard','Physics, Chemistry, Biology','simulation', public.sample_questions_for_exam('NEET',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'NEET','NEET Full Simulation 4','Final NEET simulation — best attempted after completing all chapters.',300,200,'hard','Physics, Chemistry, Biology','simulation', public.sample_questions_for_exam('NEET',300);

-- NEET PG
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'NEET PG','NEET PG Full Simulation 1','Full-length NEET PG simulation — Anatomy, Physiology, Biochemistry, Pathology, Pharmacology. 300 Qs.',300,210,'hard','Pre-clinical & Clinical','simulation', public.sample_questions_for_exam('NEET PG',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'NEET PG','NEET PG Full Simulation 2','Second NEET PG simulation — questions randomly sampled from our clinical sciences bank.',300,210,'hard','Pre-clinical & Clinical','simulation', public.sample_questions_for_exam('NEET PG',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'NEET PG','NEET PG Full Simulation 3','Third NEET PG NTA-pattern simulation. Detailed explanations after submission.',300,210,'hard','Pre-clinical & Clinical','simulation', public.sample_questions_for_exam('NEET PG',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'NEET PG','NEET PG Full Simulation 4','Final NEET PG simulation — comprehensive revision across all 19 subjects.',300,210,'hard','Pre-clinical & Clinical','simulation', public.sample_questions_for_exam('NEET PG',300);

-- INICET
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'INICET','INICET Full Simulation 1','Complete INICET simulation — Surgery, Medicine, Obstetrics & Gynaecology. 300 questions.',300,210,'hard','Surgery, Medicine, O&G','simulation', public.sample_questions_for_exam('INICET',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'INICET','INICET Full Simulation 2','Second INICET simulation — randomly drawn clinical questions from AIIMS PG pattern.',300,210,'hard','Surgery, Medicine, O&G','simulation', public.sample_questions_for_exam('INICET',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'INICET','INICET Full Simulation 3','Third INICET simulation — advanced clinical sciences as tested in INI-CET.',300,210,'hard','Surgery, Medicine, O&G','simulation', public.sample_questions_for_exam('INICET',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'INICET','INICET Full Simulation 4','Final INICET simulation — best attempt close to exam date for time management.',300,210,'hard','Surgery, Medicine, O&G','simulation', public.sample_questions_for_exam('INICET',300);

-- UPSC
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'UPSC','UPSC CSE Prelims Simulation 1','Full UPSC CSE Prelims GS Paper — Polity, History, Geography, Economy, Science. 300 questions.',300,120,'hard','General Studies','simulation', public.sample_questions_for_exam('UPSC',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'UPSC','UPSC CSE Prelims Simulation 2','Second UPSC Prelims simulation — comprehensive GS Paper 1 syllabus coverage.',300,120,'hard','General Studies','simulation', public.sample_questions_for_exam('UPSC',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'UPSC','UPSC CSE Prelims Simulation 3','Third UPSC simulation — Current Affairs + Static GS mix mirroring actual exam.',300,120,'hard','General Studies','simulation', public.sample_questions_for_exam('UPSC',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'UPSC','UPSC CSE Prelims Simulation 4','Final UPSC Prelims simulation — complete mock before examination.',300,120,'hard','General Studies','simulation', public.sample_questions_for_exam('UPSC',300);

-- CAT
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'CAT','CAT Full Simulation 1','Complete CAT simulation — VARC, DILR, and Quantitative Aptitude. 300 questions, 120 minutes.',300,120,'hard','VARC, DILR, QA','simulation', public.sample_questions_for_exam('CAT',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'CAT','CAT Full Simulation 2','Second CAT simulation — randomly drawn across all three sections.',300,120,'hard','VARC, DILR, QA','simulation', public.sample_questions_for_exam('CAT',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'CAT','CAT Full Simulation 3','Third CAT simulation — accuracy and time management under exam conditions.',300,120,'hard','VARC, DILR, QA','simulation', public.sample_questions_for_exam('CAT',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'CAT','CAT Full Simulation 4','Final CAT simulation — complete IIM-pattern mock to identify weak areas.',300,120,'hard','VARC, DILR, QA','simulation', public.sample_questions_for_exam('CAT',300);

-- GATE
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'GATE','GATE CSE Full Simulation 1','Full-length GATE CSE simulation — DS, Algorithms, OS, Networks, DBMS, TOC. 300 questions.',300,180,'hard','CS Core Subjects','simulation', public.sample_questions_for_exam('GATE',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'GATE','GATE CSE Full Simulation 2','Second GATE simulation — randomly drawn from our CS question bank. IIT/IISc pattern.',300,180,'hard','CS Core Subjects','simulation', public.sample_questions_for_exam('GATE',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'GATE','GATE CSE Full Simulation 3','Third GATE CSE simulation — includes numerical answer type (NAT) style questions.',300,180,'hard','CS Core Subjects','simulation', public.sample_questions_for_exam('GATE',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'GATE','GATE CSE Full Simulation 4','Final GATE simulation — assess score and readiness close to exam.',300,180,'hard','CS Core Subjects','simulation', public.sample_questions_for_exam('GATE',300);

-- IBPS PO
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'IBPS PO','IBPS PO Mains Simulation 1','Full IBPS PO Mains simulation — Reasoning, English, QA, General Awareness, Computer. 300 questions.',300,120,'hard','All Sections','simulation', public.sample_questions_for_exam('IBPS PO',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'IBPS PO','IBPS PO Mains Simulation 2','Second IBPS PO simulation — comprehensive Mains pattern coverage.',300,120,'hard','All Sections','simulation', public.sample_questions_for_exam('IBPS PO',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'IBPS PO','IBPS PO Mains Simulation 3','Third IBPS PO simulation — banking awareness mixed with GA questions.',300,120,'hard','All Sections','simulation', public.sample_questions_for_exam('IBPS PO',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'IBPS PO','IBPS PO Mains Simulation 4','Final IBPS PO simulation — timed mock to practice speed and accuracy.',300,120,'hard','All Sections','simulation', public.sample_questions_for_exam('IBPS PO',300);

-- SSC CGL
INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'SSC CGL','SSC CGL Tier-I Simulation 1','Full SSC CGL Tier-I simulation — GK, English, Quantitative Aptitude, Reasoning. 300 questions.',300,120,'medium','All Sections','simulation', public.sample_questions_for_exam('SSC CGL',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'SSC CGL','SSC CGL Tier-I Simulation 2','Second SSC CGL simulation — complete Tier-I syllabus with SSC-pattern questions.',300,120,'medium','All Sections','simulation', public.sample_questions_for_exam('SSC CGL',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'SSC CGL','SSC CGL Tier-I Simulation 3','Third SSC CGL simulation — Current Affairs and reasoning heavily tested.',300,120,'medium','All Sections','simulation', public.sample_questions_for_exam('SSC CGL',300);

INSERT INTO public.mock_tests (exam_name, title, description, num_questions, duration_minutes, difficulty, subject, test_type, questions)
SELECT 'SSC CGL','SSC CGL Tier-I Simulation 4','Final SSC CGL simulation — complete mock to assess Tier-I readiness.',300,120,'medium','All Sections','simulation', public.sample_questions_for_exam('SSC CGL',300);

-- Verify
SELECT exam_name, test_type, COUNT(*) AS count
FROM public.mock_tests
GROUP BY exam_name, test_type
ORDER BY exam_name, test_type;
