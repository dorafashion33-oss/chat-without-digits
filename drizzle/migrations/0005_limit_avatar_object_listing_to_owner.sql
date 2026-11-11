DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT TO public USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);