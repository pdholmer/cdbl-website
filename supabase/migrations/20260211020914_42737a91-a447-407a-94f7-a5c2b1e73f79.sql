
-- Create hero-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true);

-- Allow public read access
CREATE POLICY "Hero images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Allow authenticated users to upload (edge function uses service role, but just in case)
CREATE POLICY "Allow uploads to hero-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hero-images');

-- Allow updates to hero-images
CREATE POLICY "Allow updates to hero-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hero-images');
