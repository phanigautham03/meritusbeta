-- ============================================================
-- Meritus AI Agent Tables
-- Created: 2026-05-30
-- ============================================================

-- 1. Execution log for every agent run
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name      text        NOT NULL,
  started_at      timestamptz DEFAULT now(),
  finished_at     timestamptz,
  status          text        CHECK (status IN ('running','success','error')) DEFAULT 'running',
  actions_taken   integer     DEFAULT 0,
  error_message   text,
  metadata        jsonb       DEFAULT '{}'
);
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read agent_runs" ON public.agent_runs FOR SELECT USING (true);
CREATE INDEX idx_agent_runs_name_started ON public.agent_runs (agent_name, started_at DESC);

-- 2. CRM drip sequence state — one row per user+type, prevents double-sending
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_type  text        NOT NULL,  -- 'day1_welcome' | 'day3_nudge' | 'day7_upgrade' | 'day30_reengage' | 'sales_upgrade'
  sent_at     timestamptz DEFAULT now(),
  opened      boolean     DEFAULT false,
  clicked     boolean     DEFAULT false,
  UNIQUE (user_id, email_type)
);
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User read own sequences" ON public.email_sequences FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_email_sequences_user ON public.email_sequences (user_id);

-- 3. Support inbox with AI-drafted replies
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  from_email      text        NOT NULL,
  subject         text,
  body            text        NOT NULL,
  received_at     timestamptz DEFAULT now(),
  category        text,          -- 'password_reset' | 'test_not_saved' | 'refund' | 'account_issue' | 'general'
  ai_draft_reply  text,
  confidence      numeric(4,3),  -- 0.000 – 1.000
  needs_human     boolean     DEFAULT true,
  status          text        CHECK (status IN ('pending','pending_review','sent','dismissed')) DEFAULT 'pending',
  handled_by      text,
  handled_at      timestamptz
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read support_tickets" ON public.support_tickets FOR SELECT USING (true);
CREATE INDEX idx_support_tickets_status ON public.support_tickets (status, received_at DESC);

-- 4. AI-generated MCQs awaiting human review before going into mock_tests
CREATE TABLE IF NOT EXISTS public.pending_questions (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_name       text        NOT NULL,
  subject         text        NOT NULL,
  topic           text        NOT NULL,
  question_text   text        NOT NULL,
  options         jsonb       NOT NULL,  -- {"A":"...","B":"...","C":"...","D":"..."}
  correct_option  text        NOT NULL,  -- "A" | "B" | "C" | "D"
  explanation     text,
  key_concept     text,
  memory_tip      text,
  ai_confidence   numeric(4,3),
  difficulty      text        CHECK (difficulty IN ('easy','medium','hard')) DEFAULT 'medium',
  status          text        CHECK (status IN ('pending','flagged','approved','rejected')) DEFAULT 'pending',
  reviewed_by     text,
  reviewed_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE public.pending_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage pending_questions" ON public.pending_questions FOR ALL USING (true);
CREATE INDEX idx_pending_questions_status ON public.pending_questions (status, created_at DESC);

-- 5. AI-generated marketing content (posts, subject lines, insights)
CREATE TABLE IF NOT EXISTS public.marketing_content (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type    text        NOT NULL,  -- 'social_post' | 'email_subject' | 'email_body' | 'insight'
  platform        text,                  -- 'instagram' | 'linkedin' | 'twitter' | null
  exam_vertical   text,                  -- 'JEE' | 'NEET' | etc.
  content_text    text        NOT NULL,
  ab_variant      text,                  -- 'A' | 'B' | null
  status          text        CHECK (status IN ('draft','approved','published','discarded')) DEFAULT 'draft',
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage marketing_content" ON public.marketing_content FOR ALL USING (true);

-- 6. Per-agent on/off switch and configuration
CREATE TABLE IF NOT EXISTS public.agent_config (
  agent_name  text    PRIMARY KEY,
  is_enabled  boolean DEFAULT true,
  last_run_at timestamptz,
  config      jsonb   DEFAULT '{}'
);
ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage agent_config" ON public.agent_config FOR ALL USING (true);

-- Seed default agent configs
INSERT INTO public.agent_config (agent_name, is_enabled, config) VALUES
  ('crm',          true,  '{}'),
  ('sales',         true,  '{}'),
  ('support',       true,  '{"auto_send_categories": ["password_reset", "test_not_saved"]}'),
  ('content',       true,  '{"topic_index": {"JEE": 0, "NEET": 0, "UPSC": 0, "GATE": 0, "CAT": 0, "Banking": 0, "SSC": 0, "CUET": 0, "State PSC": 0}}'),
  ('marketing',     true,  '{}'),
  ('analytics',     true,  '{}'),
  ('admin',         true,  '{"stuck_onboarding_days": 3, "support_backlog_limit": 10, "support_age_hours": 2}'),
  ('mentor_match',  false, '{}')
ON CONFLICT (agent_name) DO NOTHING;
