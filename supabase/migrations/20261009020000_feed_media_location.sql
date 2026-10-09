ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_category_check,
  ALTER COLUMN category DROP NOT NULL,
  ALTER COLUMN category SET DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;

UPDATE public.posts
SET category = NULL
WHERE category = 'General';

ALTER TABLE public.posts
  ADD CONSTRAINT posts_category_check
    CHECK (category IS NULL OR category IN ('Academic', 'Housing', 'Events', 'Marketplace')),
  ADD CONSTRAINT posts_location_pair_check
    CHECK ((location_lat IS NULL AND location_lng IS NULL) OR (location_lat IS NOT NULL AND location_lng IS NOT NULL)),
  ADD CONSTRAINT posts_location_lat_range_check
    CHECK (location_lat IS NULL OR location_lat BETWEEN -90 AND 90),
  ADD CONSTRAINT posts_location_lng_range_check
    CHECK (location_lng IS NULL OR location_lng BETWEEN -180 AND 180);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media',
  'post-media',
  TRUE,
  26214400,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Anyone can view public post media" ON storage.objects;
CREATE POLICY "Anyone can view public post media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

DROP POLICY IF EXISTS "Users can upload their own post media" ON storage.objects;
CREATE POLICY "Users can upload their own post media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own post media" ON storage.objects;
CREATE POLICY "Users can update their own post media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own post media" ON storage.objects;
CREATE POLICY "Users can delete their own post media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
