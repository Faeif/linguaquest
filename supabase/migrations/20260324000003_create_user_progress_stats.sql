-- Migration: create_user_progress_and_stats
-- SRS progress tracking and user statistics

-- ============================
-- USER_PROGRESS (SRS Core)
-- ============================
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,

  -- SM-2 Algorithm fields
  ease_factor REAL DEFAULT 2.5 CHECK (ease_factor >= 1.3),
  interval_days INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review_at TIMESTAMPTZ DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,

  -- Stats
  total_reviews INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  is_mastered BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, card_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_own" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Critical index for SRS queries (due cards)
CREATE INDEX idx_user_progress_due
  ON user_progress(user_id, next_review_at)
  WHERE next_review_at IS NOT NULL;

CREATE TRIGGER user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================
-- STUDY_SESSIONS
-- ============================
CREATE TABLE study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES decks(id) ON DELETE SET NULL,
  cards_studied INTEGER DEFAULT 0,
  cards_correct INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_own" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================
-- USER_STATS
-- ============================
CREATE TABLE user_stats (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,

  -- XP & Level
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,

  -- Streak
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  streak_freeze_count INTEGER DEFAULT 2,

  -- Learning
  total_cards_studied INTEGER DEFAULT 0,
  total_cards_mastered INTEGER DEFAULT 0,
  total_study_minutes INTEGER DEFAULT 0,

  -- IELTS Estimates (Phase 3)
  speaking_band_estimate REAL,
  writing_band_estimate REAL,
  reading_band_estimate REAL,
  listening_band_estimate REAL,

  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stats_own" ON user_stats
  FOR ALL USING (auth.uid() = user_id);

-- Public read for leaderboard
CREATE POLICY "stats_leaderboard" ON user_stats
  FOR SELECT USING (true);
