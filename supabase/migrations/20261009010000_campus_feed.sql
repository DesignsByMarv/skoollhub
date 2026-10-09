ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General';

ALTER TABLE public.posts
  ADD CONSTRAINT posts_category_check
  CHECK (category IN ('General', 'Academic', 'Housing', 'Events', 'Marketplace'));

CREATE UNIQUE INDEX IF NOT EXISTS favourites_user_entity_unique
  ON public.favourites (user_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx
  ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_category_created_at_idx
  ON public.posts (category, created_at DESC);

DROP POLICY IF EXISTS "Users can read posts" ON public.posts;
CREATE POLICY "Users can read posts"
  ON public.posts FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can read their own post likes"
  ON public.post_likes FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can like posts as themselves"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read post comments"
  ON public.post_comments FOR SELECT
  USING (true);
CREATE POLICY "Users can comment as themselves"
  ON public.post_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own comments"
  ON public.post_comments FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete their own comments"
  ON public.post_comments FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can read their own post bookmarks"
  ON public.favourites FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can bookmark posts as themselves"
  ON public.favourites FOR INSERT
  WITH CHECK (auth.uid() = user_id AND entity_type = 'post');
CREATE POLICY "Users can remove their own post bookmarks"
  ON public.favourites FOR DELETE
  USING (auth.uid() = user_id AND entity_type = 'post');

CREATE OR REPLACE FUNCTION public.create_profile_for_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
BEGIN
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  base_username := lower(regexp_replace(
    coalesce(nullif(NEW.raw_user_meta_data ->> 'username', ''), split_part(NEW.email, '@', 1)),
    '[^a-z0-9_]+',
    '_',
    'g'
  ));

  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    coalesce(nullif(NEW.raw_user_meta_data ->> 'full_name', ''), split_part(NEW.email, '@', 1)),
    coalesce(nullif(base_username, ''), 'student') || '_' || replace(NEW.id::text, '-', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_auth_user();

INSERT INTO public.profiles (id, email, full_name, username)
SELECT
  users.id,
  users.email,
  coalesce(nullif(users.raw_user_meta_data ->> 'full_name', ''), split_part(users.email, '@', 1)),
  coalesce(
    nullif(lower(regexp_replace(
      coalesce(nullif(users.raw_user_meta_data ->> 'username', ''), split_part(users.email, '@', 1)),
      '[^a-z0-9_]+',
      '_',
      'g'
    )), ''),
    'student'
  ) || '_' || replace(users.id::text, '-', '')
FROM auth.users AS users
WHERE users.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

UPDATE public.posts AS post
SET likes_count = (
      SELECT count(*) FROM public.post_likes AS post_like
      WHERE post_like.post_id = post.id
    ),
    comments_count = (
      SELECT count(*) FROM public.post_comments AS post_comment
      WHERE post_comment.post_id = post.id
    );

CREATE OR REPLACE FUNCTION public.sync_post_engagement_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_post_id UUID;
BEGIN
  target_post_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.post_id ELSE NEW.post_id END;

  IF TG_TABLE_NAME = 'post_likes' THEN
    UPDATE public.posts
    SET likes_count = (SELECT count(*) FROM public.post_likes WHERE post_id = target_post_id)
    WHERE id = target_post_id;
  ELSE
    UPDATE public.posts
    SET comments_count = (SELECT count(*) FROM public.post_comments WHERE post_id = target_post_id)
    WHERE id = target_post_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_post_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_engagement_counts();
CREATE TRIGGER sync_post_comments_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_engagement_counts();
