-- Store user's preferred daily reminder time (e.g. '20:00') and timezone offset in hours
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_time TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS timezone_offset INTEGER DEFAULT 7; -- default UTC+7 (Bangkok)
