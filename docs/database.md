# Database Schema — LinguaQuest
# Version: 1.0.0

## 🏗️ Schema Overview

```
Core Tables:
profiles           ← User accounts + roles
decks              ← Flashcard collections
cards              ← Individual flashcards
user_progress      ← SRS progress per card per user
study_sessions     ← Study session history
user_stats         ← Aggregated stats (XP, streak, level)

Phase 2:
battles            ← Battle Zone sessions
study_groups       ← Community groups
posts              ← Community feed

Phase 3:
ai_conversations   ← AI Companion history
mock_tests         ← IELTS/TOEIC tests
tutor_groups       ← Paid tutor groups

Admin:
audit_logs         ← Admin action history
content_reports    ← User reports
```

---

## 📋 Core Tables — MVP

### profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,

  -- Subscription & Roles
  role TEXT DEFAULT 'user'
    CHECK (role IN ('guest', 'user', 'admin')),
  subscription TEXT DEFAULT 'free'
    CHECK (subscription IN ('free', 'pro')),
  subscription_expires_at TIMESTAMPTZ,

  -- Onboarding
  goal TEXT CHECK (goal IN ('ielts', 'toeic', 'daily', 'business', 'other')),
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  daily_goal_minutes INTEGER DEFAULT 30,
  onboarding_completed BOOLEAN DEFAULT false,

  -- Trust
  trust_score INTEGER DEFAULT 100 CHECK (trust_score BETWEEN 0 AND 100),
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Public profile data (username, avatar only)
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);
```

### decks
```sql
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
  score REAL DEFAULT 0, -- For ranking

  -- Status
  is_public BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false, -- Platform official decks
  is_approved BOOLEAN DEFAULT false, -- Community decks need approval
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
    is_public = true AND is_approved = true
    OR auth.uid() = user_id
  );

CREATE POLICY "decks_insert_own" ON decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "decks_update_own" ON decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "decks_delete_own" ON decks
  FOR DELETE USING (auth.uid() = user_id);
```

### cards
```sql
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,

  -- Core content
  word TEXT NOT NULL,
  ipa TEXT,
  meaning_th TEXT NOT NULL,
  meaning_en TEXT,

  -- Rich content
  examples JSONB DEFAULT '[]', -- [{en: "", th: ""}]
  etymology TEXT,
  word_family TEXT[] DEFAULT '{}',
  collocations TEXT[] DEFAULT '{}',
  synonyms TEXT[] DEFAULT '{}',

  -- Metadata
  cefr_level TEXT CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  register TEXT, -- 'formal', 'informal', 'academic', 'technical'
  audio_url_uk TEXT,
  audio_url_us TEXT,
  image_url TEXT,

  -- Ordering
  position INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Cards are readable if deck is readable
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
```

### user_progress (SRS Core)
```sql
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

-- Critical index for SRS queries
CREATE INDEX idx_user_progress_due
  ON user_progress(user_id, next_review_at)
  WHERE next_review_at IS NOT NULL;
```

### user_stats
```sql
CREATE TABLE user_stats (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,

  -- XP & Level
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,

  -- Streak
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  streak_freeze_count INTEGER DEFAULT 2, -- Free: 2, Pro: 5

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

-- Leaderboard: public read for weekly_xp
CREATE POLICY "stats_leaderboard" ON user_stats
  FOR SELECT USING (true);
```

---

## 📋 Phase 2 Tables

### battles
```sql
CREATE TABLE battles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES decks(id),
  status TEXT DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  question_count INTEGER DEFAULT 10,
  time_limit_seconds INTEGER DEFAULT 60,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE battle_participants (
  battle_id UUID REFERENCES battles(id),
  user_id UUID REFERENCES profiles(id),
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (battle_id, user_id)
);
```

---

## 📋 Phase 3 Tables

### ai_conversations
```sql
CREATE TABLE ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL, -- 'alex', 'sarah', 'johnson', 'mei'
  title TEXT,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  audio_url TEXT, -- For voice messages
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_own" ON ai_conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "messages_via_conversation" ON ai_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE id = ai_messages.conversation_id
      AND user_id = auth.uid()
    )
  );
```

---

## 🔧 Useful Database Functions

### Auto-update streak
```sql
CREATE OR REPLACE FUNCTION update_streak_on_study()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_study_date, current_streak
  INTO v_last_date, v_current_streak
  FROM user_stats WHERE user_id = NEW.user_id;

  -- Same day = no change
  IF v_last_date = CURRENT_DATE THEN
    RETURN NEW;
  END IF;

  -- Yesterday = streak continues
  IF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE user_stats SET
      current_streak = v_current_streak + 1,
      longest_streak = GREATEST(longest_streak, v_current_streak + 1),
      last_study_date = CURRENT_DATE,
      weekly_xp = weekly_xp + NEW.xp_earned,
      total_xp = total_xp + NEW.xp_earned
    WHERE user_id = NEW.user_id;
  ELSE
    -- Streak broken
    UPDATE user_stats SET
      current_streak = 1,
      last_study_date = CURRENT_DATE,
      weekly_xp = weekly_xp + NEW.xp_earned,
      total_xp = total_xp + NEW.xp_earned
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Auto-create user stats on signup
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );

  -- Create stats
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```
