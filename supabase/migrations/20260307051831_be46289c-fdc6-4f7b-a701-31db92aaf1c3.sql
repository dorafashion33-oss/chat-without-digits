
-- Moments table
CREATE TABLE public.moments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view moments" ON public.moments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own moments" ON public.moments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moments" ON public.moments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Group members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Group messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS for groups: members can view
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _group_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = _user_id AND group_id = _group_id
  )
$$;

CREATE POLICY "Group members can view group" ON public.groups
  FOR SELECT TO authenticated USING (public.is_group_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create groups" ON public.groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creator can update group" ON public.groups
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Group creator can delete group" ON public.groups
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- RLS for group_members
CREATE POLICY "Members can view group members" ON public.group_members
  FOR SELECT TO authenticated USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Group admin can manage members" ON public.group_members
  FOR INSERT TO authenticated WITH CHECK (
    public.is_group_member(auth.uid(), group_id) OR auth.uid() = (SELECT created_by FROM public.groups WHERE id = group_id)
  );

CREATE POLICY "Admin can remove members" ON public.group_members
  FOR DELETE TO authenticated USING (
    auth.uid() = user_id OR auth.uid() = (SELECT created_by FROM public.groups WHERE id = group_id)
  );

-- RLS for group_messages
CREATE POLICY "Members can view group messages" ON public.group_messages
  FOR SELECT TO authenticated USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Members can send group messages" ON public.group_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND public.is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Sender can delete own group messages" ON public.group_messages
  FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- Call signaling table for WebRTC
CREATE TABLE public.call_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  callee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_data JSONB NOT NULL DEFAULT '{}',
  call_type TEXT NOT NULL DEFAULT 'voice',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their calls" ON public.call_signals
  FOR SELECT TO authenticated USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Users can create calls" ON public.call_signals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their calls" ON public.call_signals
  FOR UPDATE TO authenticated USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Users can delete their calls" ON public.call_signals
  FOR DELETE TO authenticated USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- Enable realtime for group messages and call signals
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moments;

-- Storage bucket for moments images
INSERT INTO storage.buckets (id, name, public) VALUES ('moments', 'moments', true);

CREATE POLICY "Authenticated users can upload moments" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'moments');

CREATE POLICY "Anyone can view moments images" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'moments');

CREATE POLICY "Users can delete their moments images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'moments');
