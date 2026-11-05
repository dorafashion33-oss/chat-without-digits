CREATE OR REPLACE FUNCTION public.guest_send(_thread uuid, _token uuid, _text text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF length(trim(_text)) = 0 THEN RAISE EXCEPTION 'invalid_text'; END IF;
  IF _text LIKE '[voice:%' THEN
    IF length(_text) > 400000 OR _text !~ '^\[voice:[a-z]+\]data:audio/' THEN RAISE EXCEPTION 'invalid_voice'; END IF;
  ELSIF length(_text) > 2000 THEN RAISE EXCEPTION 'invalid_text'; END IF;
  IF NOT EXISTS (SELECT 1 FROM guest_threads WHERE id = _thread AND guest_token = _token) THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO guest_messages(thread_id, from_guest, text) VALUES (_thread, true, _text);
  UPDATE guest_threads SET last_at = now() WHERE id = _thread;
END $$;
