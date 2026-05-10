-- ============================================================
-- PondyPrep Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- EXAMS
CREATE TABLE exams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  year          INT,
  exam_type     TEXT NOT NULL,
  duration_mins INT NOT NULL DEFAULT 120,
  is_free       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  source_file   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- QUESTIONS
CREATE TABLE questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id        UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  position       INT NOT NULL,
  question_text  TEXT NOT NULL,
  option_a       TEXT NOT NULL,
  option_b       TEXT NOT NULL,
  option_c       TEXT NOT NULL,
  option_d       TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  category       TEXT,
  explanation    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exam_id, position)
);

CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_questions_category ON questions(category);

-- Public view: never exposes correct_answer to browser
CREATE VIEW questions_public AS
  SELECT id, exam_id, position, question_text, option_a, option_b, option_c, option_d, category, explanation
  FROM questions;

-- USER PROFILES
CREATE TABLE user_profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT,
  has_paid            BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at             TIMESTAMPTZ,
  razorpay_payment_id TEXT,
  free_tests_used     INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ACTIVE SESSIONS (single-session enforcement)
CREATE TABLE active_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  last_seen     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EXAM SESSIONS
CREATE TABLE exam_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id         UUID REFERENCES exams(id) ON DELETE SET NULL,
  session_type    TEXT NOT NULL CHECK (session_type IN ('mock','mini_topic','mini_random','mini_exam')),
  is_free_attempt BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress','submitted','timed_out')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at    TIMESTAMPTZ,
  duration_secs   INT,
  score           INT,
  total_questions INT NOT NULL,
  question_ids    JSONB NOT NULL,
  category        TEXT,
  question_count  INT,
  ai_review       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX idx_sessions_exam_id ON exam_sessions(exam_id);

-- USER ANSWERS
CREATE TABLE user_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES questions(id),
  selected_option CHAR(1) CHECK (selected_option IN ('A','B','C','D')),
  is_correct      BOOLEAN,
  answered_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (session_id, question_id)
);

CREATE INDEX idx_answers_session_id ON user_answers(session_id);

-- BOOKMARKS
CREATE TABLE bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- PAYMENTS
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id),
  razorpay_order_id   TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature  TEXT,
  amount_paise        INT NOT NULL DEFAULT 29900,
  currency            TEXT NOT NULL DEFAULT 'INR',
  status              TEXT NOT NULL DEFAULT 'created'
                      CHECK (status IN ('created','paid','failed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Exams: public read
CREATE POLICY "exams_public_read" ON exams
  FOR SELECT USING (is_active = TRUE);

-- Questions: only via questions_public view; direct table access blocked
CREATE POLICY "questions_no_direct_access" ON questions
  FOR SELECT USING (FALSE);

-- User profiles: own row only
CREATE POLICY "profiles_own" ON user_profiles
  FOR ALL USING (id = auth.uid());

-- Active sessions: own row only
CREATE POLICY "active_sessions_own" ON active_sessions
  FOR ALL USING (user_id = auth.uid());

-- Exam sessions: own rows only
CREATE POLICY "sessions_own" ON exam_sessions
  FOR ALL USING (user_id = auth.uid());

-- User answers: own rows only (via session ownership)
CREATE POLICY "answers_own" ON user_answers
  FOR ALL USING (
    session_id IN (
      SELECT id FROM exam_sessions WHERE user_id = auth.uid()
    )
  );

-- Payments: own rows read only; insert/update via service role only
CREATE POLICY "payments_own_read" ON payments
  FOR SELECT USING (user_id = auth.uid());

-- Bookmarks: own rows only
CREATE POLICY "bookmarks_own" ON bookmarks
  FOR ALL USING (user_id = auth.uid());

-- ai_review is stored in exam_sessions (no separate table needed)
