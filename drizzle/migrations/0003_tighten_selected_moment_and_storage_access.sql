DROP POLICY IF EXISTS "Anyone authenticated can view moments" ON public.moments;
CREATE POLICY "Users can view active moments" ON public.moments FOR SELECT TO authenticated USING (expires_at > now());

DROP POLICY IF EXISTS "Users can view moment views" ON public.moment_views;
CREATE POLICY "Moment owners can view their moment viewers" ON public.moment_views FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.moments
    WHERE public.moments.id = public.moment_views.moment_id
      AND public.moments.user_id = auth.uid()
  )
);

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