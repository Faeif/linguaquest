-- Add foreign key constraint to link user_progress to global_cards
-- This enables Supabase's PostgREST to perform nested joins like global_cards (*)

DO $$ 
BEGIN
  -- Re-add constraint pointing to global_cards
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_global_card_id_fkey'
  ) THEN
    ALTER TABLE user_progress 
      ADD CONSTRAINT user_progress_global_card_id_fkey 
      FOREIGN KEY (card_id) REFERENCES global_cards(id) ON DELETE CASCADE;
  END IF;

  -- Also for review_logs
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'review_logs_global_card_id_fkey'
  ) THEN
    ALTER TABLE review_logs 
      ADD CONSTRAINT review_logs_global_card_id_fkey 
      FOREIGN KEY (card_id) REFERENCES global_cards(id) ON DELETE CASCADE;
  END IF;
END $$;
