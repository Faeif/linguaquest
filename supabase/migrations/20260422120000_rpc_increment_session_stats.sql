CREATE OR REPLACE FUNCTION increment_session_stats(
  p_user_id UUID,
  p_xp INTEGER DEFAULT 0,
  p_minutes INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_stats (
    user_id,
    total_xp,
    weekly_xp,
    monthly_xp,
    speaking_minutes_total,
    lifetime_convos
  )
  VALUES (
    p_user_id,
    p_xp,
    p_xp,
    p_xp,
    p_minutes,
    1
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp             = user_stats.total_xp + p_xp,
    weekly_xp            = user_stats.weekly_xp + p_xp,
    monthly_xp           = user_stats.monthly_xp + p_xp,
    speaking_minutes_total = user_stats.speaking_minutes_total + p_minutes,
    lifetime_convos      = user_stats.lifetime_convos + 1;
END;
$$;
