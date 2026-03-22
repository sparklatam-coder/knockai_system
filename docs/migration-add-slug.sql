-- Add slug column to clients table for clean URLs
-- Run in Supabase SQL Editor

ALTER TABLE clients ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Generate slugs for existing clients from name
-- Korean names → use a simple numeric slug based on row number
UPDATE clients SET slug = 'client-' || ROW_NUMBER() OVER (ORDER BY created_at)
WHERE slug IS NULL;

-- For demo data, set friendly slugs
UPDATE clients SET slug = 'easytooth' WHERE name = '이지투스치과';
UPDATE clients SET slug = 'hardtooth' WHERE name = '하드투스치과';

-- Make slug NOT NULL after populating
ALTER TABLE clients ALTER COLUMN slug SET NOT NULL;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
