-- Composite index for the two most common query patterns on hsk_reviews:
-- 1. /api/flashcard/session?level=N  → WHERE user_id = ? AND hsk_level = ? AND next_review_at <= ?
-- 2. /api/flashcard/session?review=all → WHERE user_id = ? AND next_review_at <= ?

CREATE INDEX IF NOT EXISTS idx_hsk_reviews_user_level_next
  ON hsk_reviews (user_id, hsk_level, next_review_at);

CREATE INDEX IF NOT EXISTS idx_hsk_reviews_user_next
  ON hsk_reviews (user_id, next_review_at);
