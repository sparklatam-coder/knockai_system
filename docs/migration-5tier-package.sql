-- ============================================
-- 패키지 티어 5단계 확장 마이그레이션
-- Supabase SQL Editor에서 실행
-- ============================================

-- 1. 기존 CHECK 제약조건 제거 후 5개 값으로 재설정
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_package_tier_check;
ALTER TABLE clients ADD CONSTRAINT clients_package_tier_check
  CHECK (package_tier IN ('entry', 'basic', 'standard', 'premium', 'platinum'));

-- 2. 기본값을 'entry'로 변경
ALTER TABLE clients ALTER COLUMN package_tier SET DEFAULT 'entry';

-- 3. inquiries 테이블 (업그레이드 문의 저장용, 없으면 생성)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  inquiry_type TEXT NOT NULL DEFAULT 'upgrade',
  current_tier TEXT,
  target_tier TEXT,
  node_key TEXT,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. inquiries RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 클라이언트 본인 문의만 INSERT 가능
CREATE POLICY IF NOT EXISTS "clients_insert_own_inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE auth_user_id = auth.uid()
    )
  );

-- admin은 모든 문의 조회 가능
CREATE POLICY IF NOT EXISTS "admins_read_all_inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
