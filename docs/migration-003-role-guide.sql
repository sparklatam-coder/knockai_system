-- ============================================================
-- Migration 003: 3-tier role (super_admin/admin/client) + Guide
-- Supabase SQL Editor에서 실행
-- ============================================================

-- ── 1. is_admin() 함수 업데이트 (super_admin도 포함) ──
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. is_super_admin() 함수 추가 ──
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. sub_nodes에 가이드 컬럼 추가 ──
ALTER TABLE sub_nodes ADD COLUMN IF NOT EXISTS guide_content TEXT;
ALTER TABLE sub_nodes ADD COLUMN IF NOT EXISTS guide_links JSONB DEFAULT '[]';

-- ── 4. Storage RLS 업데이트 (super_admin도 업로드 허용) ──
DROP POLICY IF EXISTS "Admin can upload activity images" ON storage.objects;
DO $$ BEGIN
  CREATE POLICY "Admin can upload activity images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'activity-images'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 5. 성찬 계정을 super_admin으로 변경 ──
-- ⚠️ 아래 이메일을 성찬의 실제 이메일로 변경한 후 실행하세요
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"super_admin"')
-- WHERE email = 'sungchan@example.com';
