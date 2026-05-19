
-- profiles additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS mobile TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS study_hours_per_day INTEGER,
  ADD COLUMN IF NOT EXISTS education_level TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT false;

-- test_attempts additions
ALTER TABLE public.test_attempts
  ADD COLUMN IF NOT EXISTS percentage NUMERIC
    GENERATED ALWAYS AS (
      CASE WHEN total_marks IS NULL OR total_marks = 0 THEN NULL
           ELSE ROUND((score / total_marks) * 100, 2) END
    ) STORED,
  ADD COLUMN IF NOT EXISTS weak_topics TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS answers JSONB;

-- Backfill answers from answers_json if present
UPDATE public.test_attempts SET answers = answers_json
  WHERE answers IS NULL AND answers_json IS NOT NULL;

-- user_exams: exam_date as a regular column synced with target_date via trigger (generated col can't ref another col cleanly w/ updates)
ALTER TABLE public.user_exams
  ADD COLUMN IF NOT EXISTS exam_date DATE;

UPDATE public.user_exams SET exam_date = target_date WHERE exam_date IS NULL AND target_date IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_user_exams_dates()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.exam_date IS DISTINCT FROM OLD.exam_date OR TG_OP = 'INSERT' THEN
    IF NEW.exam_date IS NOT NULL THEN NEW.target_date := NEW.exam_date; END IF;
  END IF;
  IF NEW.target_date IS DISTINCT FROM OLD.target_date OR TG_OP = 'INSERT' THEN
    IF NEW.exam_date IS NULL AND NEW.target_date IS NOT NULL THEN NEW.exam_date := NEW.target_date; END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_exams_dates ON public.user_exams;
CREATE TRIGGER trg_sync_user_exams_dates
  BEFORE INSERT OR UPDATE ON public.user_exams
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_exams_dates();

-- user_streaks: merit_points
ALTER TABLE public.user_streaks
  ADD COLUMN IF NOT EXISTS merit_points INTEGER NOT NULL DEFAULT 0;

-- Backfill merit_points from profiles
UPDATE public.user_streaks us SET merit_points = p.merit_points
  FROM public.profiles p WHERE p.id = us.user_id AND us.merit_points = 0 AND p.merit_points > 0;
