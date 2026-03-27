-- Create "avatars" bucket if it doesn't already exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up RLS policies for storage.objects
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
