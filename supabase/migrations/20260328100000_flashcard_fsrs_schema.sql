-- Migration: FlashCard FSRS Schema
-- Creates global_cards cache table, review_logs, and adds FSRS columns to user_progress.

-- ─── Global Cards (AI-generated cache) ─────────────────────────

CREATE TABLE IF NOT EXISTS global_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  word TEXT NOT NULL,                     -- Hanzi (unique)
  pinyin TEXT NOT NULL,
  pinyin_numbered TEXT,                   -- e.g. "han4zi4"
  tones INTEGER[],                        -- e.g. {4, 4}
  definition_th TEXT NOT NULL,            -- Thai definition
  definition_en TEXT,                     -- English definition
  examples JSONB DEFAULT '[]',            -- [{zh, pinyin, th}]
  
  -- Character analysis
  components TEXT[] DEFAULT '{}',         -- Radical decomposition
  stroke_count INTEGER,
  
  -- Classification
  hsk_level TEXT,
  
  -- Audio
  audio_url TEXT,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT global_cards_word_unique UNIQUE (word)
);

-- Index for fast word lookup
CREATE INDEX IF NOT EXISTS idx_global_cards_word ON global_cards(word);
CREATE INDEX IF NOT EXISTS idx_global_cards_hsk ON global_cards(hsk_level);

-- RLS: Anyone can read global cards, only server/admin can write
ALTER TABLE global_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "global_cards_read_all" ON global_cards
  FOR SELECT USING (true);

-- ─── Review Logs (FSRS history) ────────────────────────────────

CREATE TABLE IF NOT EXISTS review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- FSRS review data
  rating TEXT NOT NULL,                                    
  state TEXT NOT NULL,                                     
  due TIMESTAMPTZ NOT NULL,
  stability FLOAT,
  difficulty FLOAT,
  elapsed_days INTEGER,
  last_elapsed_days INTEGER,
  scheduled_days INTEGER,
  
  -- Timing
  reviewed_at TIMESTAMPTZ DEFAULT now(),
  review_duration_ms INTEGER
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_review_logs_card ON review_logs(card_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_logs_user ON review_logs(user_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_logs_user_date ON review_logs(user_id, reviewed_at);

-- RLS: Users can only access their own review logs
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_logs_own" ON review_logs
  FOR ALL USING (auth.uid() = user_id);

-- ─── Add FSRS columns to user_progress ─────────────────────────

-- Add FSRS fields alongside existing SM-2 fields
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS stability FLOAT,
  ADD COLUMN IF NOT EXISTS difficulty_rating FLOAT,
  ADD COLUMN IF NOT EXISTS fsrs_state TEXT,
  ADD COLUMN IF NOT EXISTS fsrs_data JSONB,
  ADD COLUMN IF NOT EXISTS last_elapsed_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scheduled_days INTEGER DEFAULT 0;

-- Optimize the due cards query for FSRS
CREATE INDEX IF NOT EXISTS idx_user_progress_fsrs_due
  ON user_progress(user_id, next_review_at, fsrs_state)
  WHERE next_review_at IS NOT NULL;
