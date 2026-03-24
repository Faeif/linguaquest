-- Migration: create_decks_and_cards
-- Creates decks and cards tables with RLS

CREATE TABLE decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  language_from TEXT DEFAULT 'en',
  language_to TEXT DEFAULT 'th',
  level TEXT CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Stats
  card_count INTEGER DEFAULT 0,
  learner_count INTEGER DEFAULT 0,
  score REAL DEFAULT 0,

  -- Status
  is_public BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  price_thb INTEGER DEFAULT 0,

  -- Metadata
  source_url TEXT,
  license TEXT DEFAULT 'free_cc',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decks_select_public" ON decks
  FOR SELECT USING (
    (is_public = true AND is_approved = true)
    OR auth.uid() = user_id
  );

CREATE POLICY "decks_insert_own" ON decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "decks_update_own" ON decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "decks_delete_own" ON decks
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER decks_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================
-- CARDS
-- ============================
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,

  -- Core content
  word TEXT NOT NULL,
  ipa TEXT,
  meaning_th TEXT NOT NULL,
  meaning_en TEXT,

  -- Rich content
  examples JSONB DEFAULT '[]',
  etymology TEXT,
  word_family TEXT[] DEFAULT '{}',
  collocations TEXT[] DEFAULT '{}',
  synonyms TEXT[] DEFAULT '{}',

  -- Metadata
  cefr_level TEXT CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  register TEXT,
  audio_url_uk TEXT,
  audio_url_us TEXT,
  image_url TEXT,

  -- Ordering
  position INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_select_via_deck" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
      AND (
        (decks.is_public = true AND decks.is_approved = true)
        OR decks.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "cards_insert_via_deck" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

CREATE POLICY "cards_update_via_deck" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

CREATE POLICY "cards_delete_via_deck" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );
