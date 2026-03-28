-- Drop foreign key constraints on card_id to allow referencing global_cards instead of just decks/cards

DO $$ 
BEGIN
  -- Drop constraint on user_progress
  ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_card_id_fkey;
  
  -- Drop constraint on review_logs
  ALTER TABLE review_logs DROP CONSTRAINT IF EXISTS review_logs_card_id_fkey;
END $$;
