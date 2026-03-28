CREATE TABLE hsk_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  word_simplified text NOT NULL,
  hsk_level smallint NOT NULL,
  stability float DEFAULT 0 NOT NULL,
  difficulty float DEFAULT 0 NOT NULL,
  state text DEFAULT 'Learning' NOT NULL,
  assessed_at timestamptz,
  next_review_at timestamptz DEFAULT NOW() NOT NULL,
  review_count int DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, word_simplified)
);

CREATE INDEX hsk_reviews_due_idx ON hsk_reviews(user_id, next_review_at);
CREATE INDEX hsk_reviews_level_idx ON hsk_reviews(user_id, hsk_level);

ALTER TABLE hsk_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON hsk_reviews FOR ALL USING (auth.uid() = user_id);
