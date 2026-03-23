-- Migration: functions and triggers
-- Auto-create profile+stats on signup, streak update trigger

-- ============================
-- HANDLE NEW USER SIGNUP
-- ============================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create stats
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================
-- STREAK UPDATE ON STUDY SESSION
-- ============================
CREATE OR REPLACE FUNCTION update_streak_on_study()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_study_date, current_streak
  INTO v_last_date, v_current_streak
  FROM user_stats WHERE user_id = NEW.user_id;

  -- Same day = no streak change
  IF v_last_date = CURRENT_DATE THEN
    UPDATE user_stats SET
      total_xp = total_xp + NEW.xp_earned,
      weekly_xp = weekly_xp + NEW.xp_earned,
      monthly_xp = monthly_xp + NEW.xp_earned,
      total_cards_studied = total_cards_studied + NEW.cards_studied,
      total_study_minutes = total_study_minutes + (NEW.duration_seconds / 60)
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  END IF;

  -- Yesterday = streak continues
  IF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE user_stats SET
      current_streak = v_current_streak + 1,
      longest_streak = GREATEST(longest_streak, v_current_streak + 1),
      last_study_date = CURRENT_DATE,
      total_xp = total_xp + NEW.xp_earned,
      weekly_xp = weekly_xp + NEW.xp_earned,
      monthly_xp = monthly_xp + NEW.xp_earned,
      total_cards_studied = total_cards_studied + NEW.cards_studied,
      total_study_minutes = total_study_minutes + (NEW.duration_seconds / 60)
    WHERE user_id = NEW.user_id;
  ELSE
    -- Streak broken (or first study)
    UPDATE user_stats SET
      current_streak = 1,
      last_study_date = CURRENT_DATE,
      total_xp = total_xp + NEW.xp_earned,
      weekly_xp = weekly_xp + NEW.xp_earned,
      monthly_xp = monthly_xp + NEW.xp_earned,
      total_cards_studied = total_cards_studied + NEW.cards_studied,
      total_study_minutes = total_study_minutes + (NEW.duration_seconds / 60)
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_study_session_complete
  AFTER INSERT ON study_sessions
  FOR EACH ROW EXECUTE FUNCTION update_streak_on_study();

-- ============================
-- AUTO-UPDATE deck card_count
-- ============================
CREATE OR REPLACE FUNCTION update_deck_card_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE decks SET card_count = card_count + 1 WHERE id = NEW.deck_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE decks SET card_count = card_count - 1 WHERE id = OLD.deck_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_card_change
  AFTER INSERT OR DELETE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_deck_card_count();
