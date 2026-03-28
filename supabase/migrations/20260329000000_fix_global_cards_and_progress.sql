-- Migration: fix_global_cards_and_progress
-- Purpose:
--   1. Add missing columns to global_cards (old schema from chinese_pivot_schema was applied,
--      newer FSRS schema was skipped due to CREATE TABLE IF NOT EXISTS).
--   2. Add card_type column to user_progress (needed by enrollWordAction / getDueCardsAction).
--   3. Add FK user_progress.card_id → global_cards.id so Supabase embedded joins work.
--   4. Add unique constraint on global_cards.word if not present.

-- ─── 1. Add missing columns to global_cards ──────────────────

ALTER TABLE global_cards
  ADD COLUMN IF NOT EXISTS pinyin_numbered  TEXT,
  ADD COLUMN IF NOT EXISTS tones            INTEGER[],
  ADD COLUMN IF NOT EXISTS definition_en    TEXT,
  ADD COLUMN IF NOT EXISTS examples         JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS components       TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stroke_count     INTEGER,
  ADD COLUMN IF NOT EXISTS usage_count      INTEGER  DEFAULT 1;

-- Unique constraint (safe to run if already exists — handled by name check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'global_cards_word_unique'
  ) THEN
    ALTER TABLE global_cards ADD CONSTRAINT global_cards_word_unique UNIQUE (word);
  END IF;
END $$;

-- Index helpers
CREATE INDEX IF NOT EXISTS idx_global_cards_word_v2 ON global_cards(word);
CREATE INDEX IF NOT EXISTS idx_global_cards_hsk_v2  ON global_cards(hsk_level);

-- ─── 2. Add card_type column to user_progress ────────────────

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS card_type TEXT DEFAULT 'character_recognition';

-- ─── 3. Add FK user_progress.card_id → global_cards.id ──────
--
--   This enables Supabase's embedded join syntax:
--     .select('card_id, global_cards (*)')
--
--   The FK is created only if it doesn't already exist.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_progress_card_id_global_cards_fkey'
  ) THEN
    ALTER TABLE user_progress
      ADD CONSTRAINT user_progress_card_id_global_cards_fkey
      FOREIGN KEY (card_id) REFERENCES global_cards(id) ON DELETE CASCADE;
  END IF;
END $$;
