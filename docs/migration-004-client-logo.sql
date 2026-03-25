-- Migration 004: Add logo_url to clients + client-logos storage bucket
-- Run this in Supabase SQL Editor

-- 1. Add logo_url column
ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Create storage bucket for client logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS: admin can upload logos
DO $$ BEGIN
  CREATE POLICY "Admin can upload client logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'client-logos'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. RLS: anyone can view logos (public)
DO $$ BEGIN
  CREATE POLICY "Anyone can view client logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'client-logos');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. RLS: admin can delete/update logos
DO $$ BEGIN
  CREATE POLICY "Admin can manage client logos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'client-logos'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
