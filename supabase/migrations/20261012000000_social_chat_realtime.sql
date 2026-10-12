CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT follows_not_self CHECK (follower_id <> following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by authenticated users"
  ON public.follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow from their own account"
  ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow from their own account"
  ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS document_name TEXT,
  ADD COLUMN IF NOT EXISTS call_type TEXT,
  ADD COLUMN IF NOT EXISTS call_duration INT;

CREATE OR REPLACE FUNCTION public.is_chat_participant(target_chat_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE chat_id = target_chat_id
      AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_chat_participant(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_chat_participant(UUID) TO authenticated;

CREATE POLICY "Users can view chats they participate in"
  ON public.chats FOR SELECT TO authenticated
  USING (public.is_chat_participant(id));
CREATE POLICY "Users can view participants in their chats"
  ON public.chat_participants FOR SELECT TO authenticated
  USING (public.is_chat_participant(chat_id));

CREATE POLICY "Users can view messages in their chats"
  ON public.messages FOR SELECT TO authenticated
  USING (public.is_chat_participant(chat_id));
CREATE POLICY "Participants can send messages in their chats"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_chat_participant(chat_id)
  );
CREATE POLICY "Senders can delete their own messages"
  ON public.messages FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.create_direct_chat(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  existing_chat_id UUID;
  new_chat_id UUID;
BEGIN
  IF current_user_id IS NULL OR other_user_id IS NULL OR current_user_id = other_user_id THEN
    RAISE EXCEPTION 'A different signed-in user is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = other_user_id) THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  SELECT mine.chat_id INTO existing_chat_id
  FROM public.chat_participants AS mine
  JOIN public.chat_participants AS theirs ON theirs.chat_id = mine.chat_id
  JOIN public.chats ON chats.id = mine.chat_id AND chats.is_group = FALSE
  WHERE mine.user_id = current_user_id
    AND theirs.user_id = other_user_id
    AND (
      SELECT COUNT(*) FROM public.chat_participants AS members
      WHERE members.chat_id = mine.chat_id
    ) = 2
  LIMIT 1;

  IF existing_chat_id IS NOT NULL THEN
    RETURN existing_chat_id;
  END IF;

  INSERT INTO public.chats (is_group) VALUES (FALSE) RETURNING id INTO new_chat_id;
  INSERT INTO public.chat_participants (chat_id, user_id)
  VALUES (new_chat_id, current_user_id), (new_chat_id, other_user_id);

  RETURN new_chat_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_direct_chat(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_direct_chat(UUID) TO authenticated;
