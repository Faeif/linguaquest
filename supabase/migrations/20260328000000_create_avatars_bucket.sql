-- Try to create "avatars" bucket if it doesn't exist.
-- Wrap in a DO block to catch the undefined_table error during local db reset.
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN undefined_table THEN
        -- Locally, storage.buckets might not exist yet when migrations run
        RAISE NOTICE 'storage.buckets table does not exist, skipping avatars bucket creation';
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create avatars bucket: %', SQLERRM;
END $$;

-- Set up RLS policies for storage.objects
DO $$
BEGIN
    -- Allow public access to view avatars
    create policy "Avatar images are publicly accessible."
      on storage.objects for select
      using ( bucket_id = 'avatars' );

    -- Allow users to upload their own avatars
    create policy "Users can upload their own avatar."
      on storage.objects for insert
      with check ( bucket_id = 'avatars' and auth.uid() = owner );

    -- Allow users to update their own avatars
    create policy "Users can update their own avatar."
      on storage.objects for update
      using ( auth.uid() = owner );

    -- Allow users to delete their own avatars
    create policy "Users can delete their own avatar."
      on storage.objects for delete
      using ( auth.uid() = owner );
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'storage.objects table does not exist, skipping avatars RLS creation';
    WHEN duplicate_object THEN
        RAISE NOTICE 'Avatars RLS policies already exist, skipping';
END $$;
