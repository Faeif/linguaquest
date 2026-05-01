-- Add push subscription storage to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_subscription JSONB;
