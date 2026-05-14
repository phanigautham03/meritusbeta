# NEET PG End-to-End — Iteration 1

Goal: ship a fully working NEET PG study + testing experience on Lovable Cloud, powered by AI-generated questions, with real data flowing into every page and live leaderboard updates. Other exams stay listed as "Coming soon".

## Scope

In scope (this iteration):
- Migrate auth + data from the external Supabase (`iupkxkfvqfzwqvocexxr`) to **Lovable Cloud** so everything lives in one backend.
- Real **NEET PG syllabus** (19 subjects, full topic tree).
- 3 seeded NEET PG mock tests (Grand Test 200Q, Subject Test ~50Q, Daily Quiz 20Q) with **AI-generated MCQs** stored in DB (one-time generation; admin can regenerate).
- Working test runner: timer, palette, save & next, mark for review, submit → scoring → results page with subject breakdown + explanations.
- Real dashboard, my-exams, leaderboard, mock-tests list pulling from DB.
- **Realtime leaderboard** (Supabase Realtime) — rank updates as others submit.
- Forget-Meter: spaced-repetition list backed by user's answered questions (weak topics surfaced).
- AI Tutor: Lovable AI chat scoped to NEET PG syllabus.
- Other exams (JEE, NEET UG, UPSC, GATE, CAT) shown with "Coming soon" badge — links disabled.

Out of scope (future iterations):
- Other exams' real content
- Mentor sessions booking flow (kept as static)
- Payments / Upgrade actual billing
- Mobile app

## Architecture

```text
Browser ──► TanStack Start (Lovable Cloud)
              ├─ createServerFn (RLS as user)         ── reads/writes
              ├─ createServerFn (admin)               ── AI question generation
              └─ Supabase Realtime channel            ── leaderboard live
                       │
                       ▼
                 Lovable Cloud DB
   ┌──────────────────────────────────────────────┐
   │ exams, subjects, topics                      │
   │ tests, test_questions                        │
   │ questions (stem, options, answer, explain)   │
   │ test_attempts, attempt_answers               │
   │ user_topic_mastery (for Forget-Meter)        │
   │ profiles, user_roles                         │
   └──────────────────────────────────────────────┘
                       │
                       ▼
              Lovable AI Gateway
        (Gemini for question gen + AI Tutor)
```

## Database (Lovable Cloud migration)

New tables (all RLS-protected):
- `profiles` — display name, target exam, year, avatar
- `user_roles` — separate roles table (admin / student)
- `exams` — neet_pg, jee, neet_ug…  (only neet_pg active)
- `subjects` — 19 NEET PG subjects (Anatomy, Physiology, …, Medicine, Surgery)
- `topics` — hierarchical topics under each subject
- `questions` — stem, 4 options, correct index, explanation, difficulty, topic_id, source ('ai' | 'manual')
- `tests` — title, type (grand/subject/daily), exam_id, duration_min, total_marks
- `test_questions` — join table with question order + marks
- `test_attempts` — user_id, test_id, started_at, submitted_at, score, percentile
- `attempt_answers` — attempt_id, question_id, selected_index, marked_review, time_spent_s
- `user_topic_mastery` — user_id, topic_id, correct, total, last_seen_at, ease_factor (SM-2 lite for Forget-Meter)

Realtime enabled on `test_attempts` for the leaderboard.

## Server functions

- `generateQuestionsForTest(testId)` — admin-only; calls Lovable AI (Gemini 2.5 Flash) with topic + difficulty, stores generated MCQs. Idempotent.
- `seedNeetPg()` — one-shot admin function: inserts subjects/topics/3 tests, then triggers question generation.
- `submitAttempt(attemptId)` — scores answers, computes subject breakdown, updates `user_topic_mastery`, computes percentile.
- `getLeaderboard(testId?)` — top 50 by score, with realtime subscription on the client.
- `getForgetMeterItems()` — returns weakest topics + sample questions for the user.
- `aiTutorChat` — AI SDK streaming endpoint scoped to NEET PG.

## Pages — wire to real data

- `/` — landing (no change beyond gating non-NEET-PG features)
- `/dashboard` — real stats (attempts, average score, weak subjects, next recommended test)
- `/mock-tests` — list from `tests` table; non-NEET-PG exams show Coming soon
- `/mock-tests/$id` — real questions from DB; persists `attempt_answers` as user goes
- `/results/$id` — real score, subject-wise breakdown, per-question explanation
- `/leaderboard` — DB-backed, live via Realtime subscription
- `/forget-meter` — user-specific weak topics from `user_topic_mastery`
- `/ai-tutor` — Lovable AI chat
- `/my-exams` — user's attempts history
- `/study-planner` — generated plan based on weak topics (simple v1)
- `/profile` — edit profile (target exam locked to NEET PG for now)

## Auth migration

- Switch all `useAuth` / `externalSupabase` usage to the Lovable Cloud `supabase` client.
- Keep email/password + Google OAuth (configure social auth in same migration).
- Add `_authenticated` layout route to gate `/dashboard`, `/mock-tests/$id`, etc.
- Auto-create `profiles` row + assign `student` role on signup via DB trigger.
- The external Supabase + Vercel API code path is removed.

## Step-by-step build order

1. **DB migration** — create all tables, RLS policies, trigger for profile + role on signup.
2. **Auth migration** — swap external Supabase client for Lovable Cloud, configure Google.
3. **Seed script** — admin-only server fn that inserts NEET PG syllabus + 3 test shells.
4. **AI question generation** — server fn that fills each test with Gemini-generated MCQs (one-time, ~270 questions total, ≈ ₹0 because Gemini Flash is free during promo).
5. **Test runner refactor** — `/mock-tests/$id` reads questions, persists answers, submit → results.
6. **Results + scoring** — subject breakdown, explanations, mastery update.
7. **Dashboard + my-exams + leaderboard (with Realtime)** — pull live data.
8. **Forget-Meter + AI Tutor** — wire to mastery + Lovable AI Gateway.
9. **Disable non-NEET-PG entry points** — Coming soon badges.
10. **QA pass** — sign up fresh student, take Daily Quiz, see results, see leaderboard update from a 2nd browser.

## Trade-offs you should know

- **AI-generated questions**: quality is decent (Gemini 2.5 has medical knowledge) but not exam-grade. Plan for a manual review pass before promoting to real students. I'll add an admin "approve" toggle on each question and only show approved ones in tests.
- **Migration to Lovable Cloud**: existing users in the external Supabase project will not carry over. If you have real users there now, tell me and I'll add a one-time export/import step.
- **Cost**: ~270 AI generations is small. Realtime is included. Should stay within Lovable Cloud + AI free tier for early testing.
- **Time/size**: this is a large build — I'll do it in 3–4 sequential turns (migration → seed/AI → test runner → realtime/tutor) so you can review each step.

## Confirm before I start

1. OK to **delete the external Supabase + Vercel code paths** (no users to migrate)?
2. OK that AI-generated questions ship behind an **admin approval flag** (so you can review before students see them)?
3. Should I make **your account the admin** automatically on first signup, or do you want me to hardcode your email?

Once you confirm, I'll start with step 1 (DB migration) and check back after each major step.
