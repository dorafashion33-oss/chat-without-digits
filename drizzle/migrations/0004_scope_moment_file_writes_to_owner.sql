DROP POLICY IF EXISTS "Authenticated users can upload moments" ON storage.objects;
CREATE POLICY "Authenticated users can upload moments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'moments'
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

DROP POLICY IF EXISTS "Users can delete their moments images" ON storage.objects;
CREATE POLICY "Users can delete their moments images" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'moments'
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);