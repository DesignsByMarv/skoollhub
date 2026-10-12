DROP POLICY IF EXISTS "Participants can delete expired call signals"
  ON public.call_signals;

CREATE POLICY "Participants can delete expired call signals"
  ON public.call_signals FOR DELETE TO authenticated
  USING (
    public.is_chat_participant(chat_id)
    AND created_at < NOW() - INTERVAL '1 day'
  );
