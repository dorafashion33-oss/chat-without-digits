CREATE TABLE public.guest_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  guest_token uuid NOT NULL DEFAULT gen_random_uuid(),
  nickname text NOT NULL DEFAULT 'Guest',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.guest_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.guest_threads(id) ON DELETE CASCADE,
  from_guest boolean NOT NULL DEFAULT false,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.guest_threads TO authenticated;
GRANT SELECT, INSERT ON public.guest_messages TO authenticated;
GRANT ALL ON public.guest_threads TO service_role;
GRANT ALL ON public.guest_messages TO service_role;
ALTER TABLE public.guest_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads threads" ON public.guest_threads FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "owner deletes threads" ON public.guest_threads FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "owner reads guest msgs" ON public.guest_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.guest_threads t WHERE t.id = thread_id AND t.owner_id = auth.uid()));
CREATE POLICY "owner replies" ON public.guest_messages FOR INSERT TO authenticated
  WITH CHECK (from_guest = false AND EXISTS (SELECT 1 FROM public.guest_threads t WHERE t.id = thread_id AND t.owner_id = auth.uid()));
CREATE INDEX ON public.guest_messages(thread_id, created_at);

CREATE OR REPLACE FUNCTION public.guest_start(_username text, _nickname text)
RETURNS TABLE(thread_id uuid, token uuid, owner_name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p record; t record;
BEGIN
  SELECT user_id, coalesce(display_name, username) AS n INTO p FROM profiles WHERE lower(username) = lower(trim(_username)) LIMIT 1;
  IF p IS NULL THEN RAISE EXCEPTION 'user_not_found'; END IF;
  INSERT INTO guest_threads(owner_id, nickname) VALUES (p.user_id, left(coalesce(nullif(trim(_nickname),''),'Guest'),30)) RETURNING id, guest_token INTO t;
  RETURN QUERY SELECT t.id, t.guest_token, p.n;
END $$;

CREATE OR REPLACE FUNCTION public.guest_send(_thread uuid, _token uuid, _text text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF length(trim(_text)) = 0 OR length(_text) > 2000 THEN RAISE EXCEPTION 'invalid_text'; END IF;
  IF NOT EXISTS (SELECT 1 FROM guest_threads WHERE id = _thread AND guest_token = _token) THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO guest_messages(thread_id, from_guest, text) VALUES (_thread, true, _text);
  UPDATE guest_threads SET last_at = now() WHERE id = _thread;
END $$;

CREATE OR REPLACE FUNCTION public.guest_fetch(_thread uuid, _token uuid)
RETURNS TABLE(id uuid, from_guest boolean, text text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM guest_threads WHERE guest_threads.id = _thread AND guest_token = _token) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT m.id, m.from_guest, m.text, m.created_at FROM guest_messages m WHERE m.thread_id = _thread ORDER BY m.created_at LIMIT 300;
END $$;

GRANT EXECUTE ON FUNCTION public.guest_start(text,text), public.guest_send(uuid,uuid,text), public.guest_fetch(uuid,uuid) TO anon, authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guest_messages;