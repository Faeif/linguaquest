-- Fix hsk_reviews: change FK from profiles(id) to auth.users(id)
-- profiles table may be empty on fresh local setups (trigger hasn't fired yet)

ALTER TABLE hsk_reviews
  DROP CONSTRAINT IF EXISTS hsk_reviews_user_id_fkey;

ALTER TABLE hsk_reviews
  ADD CONSTRAINT hsk_reviews_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
