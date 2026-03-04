-- Allow senders to update their own messages (for editing)
CREATE POLICY "Users can edit their own messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id);
