-- ============================================================================
-- QUICK FIX: Avatar Upload RLS Policies
-- ============================================================================
-- Copy this entire file and paste it into:
-- https://supabase.com/dashboard/project/ydhnhbcbiqmblfdmmywu/sql
-- Then click "Run"
-- ============================================================================

-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- 1. Public read access
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 2. Users can upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (regexp_match(name, '^avatars/([a-f0-9-]+)-'))[1]
);

-- 3. Users can update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (regexp_match(name, '^avatars/([a-f0-9-]+)-'))[1]
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (regexp_match(name, '^avatars/([a-f0-9-]+)-'))[1]
);

-- 4. Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (regexp_match(name, '^avatars/([a-f0-9-]+)-'))[1]
);

-- ============================================================================
-- Verify policies were created
-- ============================================================================
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- ============================================================================
-- You should see 4 policies listed above
-- ============================================================================
