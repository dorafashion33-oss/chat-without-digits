
CREATE TABLE public.moment_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(moment_id, viewer_id)
);

ALTER TABLE public.moment_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view moment views" 
ON public.moment_views 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own views" 
ON public.moment_views 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = viewer_id);

CREATE INDEX idx_moment_views_moment_id ON public.moment_views(moment_id);
CREATE INDEX idx_moment_views_viewer_id ON public.moment_views(viewer_id);
