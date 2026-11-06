ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS notifications_user_created_at_idx
  ON public.notifications (user_id, created_at DESC);

DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
CREATE POLICY "Users can read their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users receive post engagement notifications" ON public.notifications;
CREATE POLICY "Users receive post engagement notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    actor_id = auth.uid()
    AND user_id <> auth.uid()
    AND (
      (
        type IN ('like', 'comment')
        AND EXISTS (
          SELECT 1
          FROM public.posts AS post
          WHERE post.id = notifications.post_id
            AND post.author_id = notifications.user_id
        )
      )
      OR (
        type = 'mention'
        AND (
          EXISTS (
            SELECT 1
            FROM public.post_comments AS comment
            JOIN public.profiles AS mentioned_user ON mentioned_user.id = notifications.user_id
            WHERE comment.id = notifications.comment_id
              AND comment.post_id = notifications.post_id
              AND comment.author_id = auth.uid()
              AND position('@' || lower(mentioned_user.username) IN lower(comment.content)) > 0
          )
          OR EXISTS (
            SELECT 1
            FROM public.posts AS mentioned_post
            JOIN public.profiles AS mentioned_user ON mentioned_user.id = notifications.user_id
            WHERE mentioned_post.id = notifications.post_id
              AND mentioned_post.author_id = auth.uid()
              AND position('@' || lower(mentioned_user.username) IN lower(mentioned_post.content)) > 0
          )
        )
      )
    )
  );
