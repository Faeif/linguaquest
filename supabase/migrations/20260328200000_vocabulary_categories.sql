-- Migration: Vocabulary Categories
-- 3-level hierarchy: Major → Category → Subcategory
-- With localized names (en/th/zh), word mapping, and user progress tracking.

-- ─── Vocabulary Categories ──────────────────────────────────

CREATE TABLE IF NOT EXISTS vocabulary_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hierarchy
  parent_id UUID REFERENCES vocabulary_categories(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),

  -- Identity
  slug TEXT UNIQUE NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('hsk', 'topic', 'grammar', 'special', 'custom')),

  -- Localized names
  name_en TEXT NOT NULL,
  name_th TEXT NOT NULL,
  name_zh TEXT,

  -- Description
  description_en TEXT,
  description_th TEXT,

  -- Metadata
  icon TEXT,
  color TEXT,
  priority INTEGER DEFAULT 999,

  -- Stats
  word_count INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  -- Visibility
  is_official BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vocab_categories_parent ON vocabulary_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_vocab_categories_type ON vocabulary_categories(category_type);
CREATE INDEX IF NOT EXISTS idx_vocab_categories_slug ON vocabulary_categories(slug);
CREATE INDEX IF NOT EXISTS idx_vocab_categories_level ON vocabulary_categories(level, priority);

-- RLS: Everyone can read official categories
ALTER TABLE vocabulary_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vocab_categories_read_all" ON vocabulary_categories
  FOR SELECT USING (is_active = TRUE);

-- ─── Word ↔ Category Mapping (many-to-many) ─────────────────

CREATE TABLE IF NOT EXISTS word_category_mapping (
  word_id UUID NOT NULL REFERENCES global_cards(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES vocabulary_categories(id) ON DELETE CASCADE,

  is_primary BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMPTZ DEFAULT now(),

  PRIMARY KEY (word_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_word_cat_word ON word_category_mapping(word_id);
CREATE INDEX IF NOT EXISTS idx_word_cat_category ON word_category_mapping(category_id);

ALTER TABLE word_category_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "word_cat_mapping_read_all" ON word_category_mapping
  FOR SELECT USING (true);

-- ─── User Category Progress ─────────────────────────────────

CREATE TABLE IF NOT EXISTS user_category_progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES vocabulary_categories(id) ON DELETE CASCADE,

  -- Stats
  total_words INTEGER DEFAULT 0,
  learned_words INTEGER DEFAULT 0,
  mastered_words INTEGER DEFAULT 0,

  -- Progress
  progress_percentage FLOAT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  last_studied_at TIMESTAMPTZ,

  -- Completion
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  PRIMARY KEY (user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_user_cat_progress ON user_category_progress(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_user_cat_progress_active ON user_category_progress(user_id, last_studied_at DESC);

ALTER TABLE user_category_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_cat_progress_own" ON user_category_progress
  FOR ALL USING (auth.uid() = user_id);
