-- Migration: chinese_pivot_schema
-- Purpose: Adapts LinguaQuest for Chinese learning (HSK) and AI Integration

-- 1. Alter profiles table to handle Chinese-specific onboarding
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_goal_check,
  DROP CONSTRAINT IF EXISTS profiles_level_check,
  DROP COLUMN IF EXISTS goal,
  DROP COLUMN IF EXISTS level;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS hsk_self_assessed TEXT;

-- 2. Create ai_user_profile caching table (JSONB snapshots)
-- Kept extremely small (<5KB) for ultra-fast vector/retrieval reading
CREATE TABLE ai_user_profile (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  active_vocab JSONB DEFAULT '{}'::jsonb,
  weak_vocab_tags TEXT[] DEFAULT '{}',
  phoneme_errors JSONB DEFAULT '{}'::jsonb,
  grammar_weak_points TEXT[] DEFAULT '{}',
  hsk_estimate TEXT,
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for ai_user_profile
ALTER TABLE ai_user_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_user_profile_select_own" ON ai_user_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_user_profile_update_own" ON ai_user_profile
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ai_user_profile_insert_own" ON ai_user_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 3. Create global_cards table for the AI Generator Cache (Cost Flywheel)
CREATE TABLE global_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  pinyin TEXT,
  definition_th TEXT NOT NULL,
  hsk_level TEXT,
  content JSONB NOT NULL, -- Full JSON structure of the card (synonyms, examples, etc.)
  audio_url TEXT,
  search_count INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for fast retrieval
CREATE INDEX idx_global_cards_word ON global_cards(word);
CREATE INDEX idx_global_cards_hsk_level ON global_cards(hsk_level);

-- RLS for global_cards (Readable by all authenticated users, written by edge functions/admins)
ALTER TABLE global_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "global_cards_select_all" ON global_cards
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 4. Create essay_submissions table (for F07 F-Dimension Scoring)
CREATE TABLE essay_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_text TEXT,
  user_essay TEXT NOT NULL,
  ai_feedback JSONB,
  cefr_score TEXT,
  tokens_used INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for essay submissions
ALTER TABLE essay_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "essay_select_own" ON essay_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "essay_insert_own" ON essay_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
