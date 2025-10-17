-- Add address fields to player_guardians table
ALTER TABLE public.player_guardians
ADD COLUMN address_line1 TEXT,
ADD COLUMN address_line2 TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT DEFAULT 'OH',
ADD COLUMN zip_code TEXT;