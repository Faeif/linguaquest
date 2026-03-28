-- Migration: AI Companion & Memory Tables (F08)

-- 1. Alter existing tables
-- Drop old check constraints that conflict with new Chinese learning spec
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_goal_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_level_check;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS hsk_target_level INTEGER,
  ADD COLUMN IF NOT EXISTS native_lang TEXT DEFAULT 'th',
  ADD COLUMN IF NOT EXISTS learning_lang TEXT DEFAULT 'zh',
  ADD COLUMN IF NOT EXISTS interface_lang TEXT DEFAULT 'th',
  ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS correction_style TEXT DEFAULT 'relaxed';

ALTER TABLE user_stats
  ADD COLUMN IF NOT EXISTS speaking_minutes_total INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lifetime_convos INTEGER DEFAULT 0;

-- 2. AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  companion_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  session_topic TEXT,
  message_count INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_convos_own" ON ai_conversations FOR ALL USING (auth.uid() = user_id);

-- 3. AI Messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  turn_number INTEGER NOT NULL,
  speech_block TEXT,
  explain_block JSONB,
  hint_block TEXT,
  vocab_tags JSONB,
  raw_content TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_messages_own" ON ai_messages FOR ALL USING (auth.uid() = user_id);

-- 4. AI User Profile (Memory)
CREATE TABLE IF NOT EXISTS ai_user_profile (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  personality_notes TEXT,
  weak_grammar TEXT[] DEFAULT '{}',
  strong_vocab TEXT[] DEFAULT '{}',
  weak_tones INTEGER[] DEFAULT '{}',
  weak_chars TEXT[] DEFAULT '{}',
  conversation_style TEXT DEFAULT 'casual',
  last_updated TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_memory_own" ON ai_user_profile FOR ALL USING (auth.uid() = user_id);

-- 5. Pronunciation Errors
CREATE TABLE IF NOT EXISTS pronunciation_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  character TEXT NOT NULL,
  pinyin TEXT NOT NULL,
  expected_tone INTEGER NOT NULL,
  detected_tone INTEGER,
  tone_score REAL,
  phoneme_score REAL,
  fluency_score REAL,
  overall_score REAL,
  context TEXT,
  session_type TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pronunciation_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pronunciation_own" ON pronunciation_errors FOR ALL USING (auth.uid() = user_id);
