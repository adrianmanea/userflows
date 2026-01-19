-- Add og_image_url column to components table
-- This stores a static image URL for Open Graph/Twitter sharing
-- Required because MP4 thumbnails don't work for OG meta tags

ALTER TABLE components
ADD COLUMN IF NOT EXISTS og_image_url text;

-- Add comment explaining the column purpose
COMMENT ON COLUMN components.og_image_url IS 'Static image URL for social sharing (OG/Twitter cards). Required when thumbnail_url is an MP4.';
