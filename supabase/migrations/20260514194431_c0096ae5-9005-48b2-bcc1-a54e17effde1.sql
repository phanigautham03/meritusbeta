
ALTER TABLE public.test_attempts
  ADD COLUMN IF NOT EXISTS answers_json JSONB;
