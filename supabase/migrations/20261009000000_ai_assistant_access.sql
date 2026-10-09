-- AI conversations belong directly to authenticated users. Profiles may be
-- created separately from signup, so they must not block chat history.
ALTER TABLE public.ai_conversations
  DROP CONSTRAINT IF EXISTS ai_conversations_user_id_fkey;

ALTER TABLE public.ai_conversations
  ADD CONSTRAINT ai_conversations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users access own AI chats" ON public.ai_conversations;
CREATE POLICY "Users can read their own AI chats"
  ON public.ai_conversations FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI chats"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI chats"
  ON public.ai_conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own AI chats"
  ON public.ai_conversations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read messages in their own AI chats"
  ON public.ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can add messages to their own AI chats"
  ON public.ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update messages in their own AI chats"
  ON public.ai_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete messages in their own AI chats"
  ON public.ai_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    )
  );
