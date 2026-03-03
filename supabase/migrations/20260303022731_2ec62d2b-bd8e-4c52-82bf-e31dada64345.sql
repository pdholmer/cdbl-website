
-- Make feedback-screenshots bucket private
UPDATE storage.buckets SET public = false WHERE id = 'feedback-screenshots';

-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Anyone can view feedback screenshots" ON storage.objects;

-- Create policy allowing only admins to view feedback screenshots
CREATE POLICY "Admins can view feedback screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'feedback-screenshots'
  AND public.has_admin_access(auth.uid())
);
