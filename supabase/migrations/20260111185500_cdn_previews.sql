-- Add preview_url column to components table
ALTER TABLE components ADD COLUMN IF NOT EXISTS preview_url TEXT;

-- Create storage bucket for component previews if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('component-previews', 'component-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on objects is usually on by default. We skip explicit ENABLE to avoid permission errors.
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow Public Read Access
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'component-previews' );

-- Policy: Allow Authenticated Users to Upload (Insert)
-- Note: 'authenticated' role is used for logged-in users.
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'component-previews' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow Authenticated Users to Update their own uploads (optional, but good for re-publishing)
-- For simplicity in this MVP, we might allow any authenticated user to overwrite if we don't track ownership strictly on files.
-- Let's stick to simple authenticated write for now.
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'component-previews' 
  AND auth.role() = 'authenticated'
);
