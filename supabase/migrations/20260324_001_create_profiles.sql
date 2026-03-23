-- Migration: create_profiles
-- Creates the user profiles table with RLS

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,

  -- Subscription
  role TEXT DEFAULT 'user'
    CHECK (role IN ('user', 'tutor', 'moderator', 'admin', 'super_admin')),
  subscription TEXT DEFAULT 'free'
    CHECK (subscription IN ('free', 'coffee', 'pro', 'tutor')),
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

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Public read for username + avatar (for leaderboard, etc.)
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
