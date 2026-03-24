-- ============================================================
-- KNOCK Hospital — 전체 초기 설정 + 데모 데이터
-- Supabase SQL Editor에서 한 번에 실행
-- ============================================================

-- ============================================
-- 1. TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  package_tier TEXT NOT NULL DEFAULT 'entry' CHECK (package_tier IN ('entry', 'basic', 'standard', 'premium', 'platinum')),
  contract_start DATE,
  auth_user_id UUID REFERENCES auth.users(id),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'in_progress', 'active')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(client_id, node_key)
);

CREATE TABLE IF NOT EXISTS sub_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  label TEXT NOT NULL,
  is_done BOOLEAN DEFAULT false,
  done_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  UNIQUE(client_id, node_key, label)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'note' CHECK (action_type IN ('status_change', 'task_complete', 'note', 'file_upload')),
  content TEXT NOT NULL,
  attachment_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  visible_to_client BOOLEAN DEFAULT true
);

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

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_nodes_client ON nodes(client_id);
CREATE INDEX IF NOT EXISTS idx_sub_nodes_client_node ON sub_nodes(client_id, node_key);
CREATE INDEX IF NOT EXISTS idx_activity_logs_client ON activity_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_client_node ON activity_logs(client_id, node_key);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_auth_user ON clients(auth_user_id);

-- ============================================
-- 3. RLS POLICIES
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- clients
DO $$ BEGIN
  CREATE POLICY "Admin full access on clients" ON clients FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Client read own" ON clients FOR SELECT USING (auth_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- nodes
DO $$ BEGIN
  CREATE POLICY "Admin full access on nodes" ON nodes FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Client read own nodes" ON nodes FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- sub_nodes
DO $$ BEGIN
  CREATE POLICY "Admin full access on sub_nodes" ON sub_nodes FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Client read own sub_nodes" ON sub_nodes FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- activity_logs
DO $$ BEGIN
  CREATE POLICY "Admin full access on activity_logs" ON activity_logs FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Client read visible logs" ON activity_logs FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
    AND visible_to_client = true
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- inquiries
DO $$ BEGIN
  CREATE POLICY "Admin full access on inquiries" ON inquiries FOR ALL USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Client insert own inquiries" ON inquiries FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Client read own inquiries" ON inquiries FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 4. TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS nodes_updated_at ON nodes;
CREATE TRIGGER nodes_updated_at
  BEFORE UPDATE ON nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 5. DEMO DATA
-- ============================================================

-- ---- easytoothhospital (Premium) ----
DELETE FROM activity_logs WHERE client_id = '00000000-0001-0001-0001-000000000001';
DELETE FROM sub_nodes    WHERE client_id = '00000000-0001-0001-0001-000000000001';
DELETE FROM nodes        WHERE client_id = '00000000-0001-0001-0001-000000000001';
DELETE FROM clients      WHERE id        = '00000000-0001-0001-0001-000000000001';

INSERT INTO clients (id, name, region, contact_name, contact_phone, contact_email, package_tier, contract_start, memo, auth_user_id)
VALUES (
  '00000000-0001-0001-0001-000000000001',
  '이지투스치과',
  '서울시 강남구 역삼동',
  '김원장',
  '010-1234-5678',
  'easytooth@demo.com',
  'premium',
  '2026-02-01',
  '강남 역삼역 3번출구. 임플란트/교정 전문. 야간진료 운영.',
  (SELECT id FROM auth.users WHERE email = 'easytooth@demo.com')
);

INSERT INTO nodes (client_id, node_key, status) VALUES
  ('00000000-0001-0001-0001-000000000001', 'awareness',      'active'),
  ('00000000-0001-0001-0001-000000000001', 'lead_capture',   'active'),
  ('00000000-0001-0001-0001-000000000001', 'lead_nurture',   'in_progress'),
  ('00000000-0001-0001-0001-000000000001', 'new_patient',    'in_progress'),
  ('00000000-0001-0001-0001-000000000001', 'cs_onboarding',  'active'),
  ('00000000-0001-0001-0001-000000000001', 'cs_upsell',      'in_progress'),
  ('00000000-0001-0001-0001-000000000001', 'cs_support',     'in_progress'),
  ('00000000-0001-0001-0001-000000000001', 'cs_education',   'inactive'),
  ('00000000-0001-0001-0001-000000000001', 'cs_community',   'in_progress'),
  ('00000000-0001-0001-0001-000000000001', 'cs_analytics',   'active');

INSERT INTO sub_nodes (client_id, node_key, label, sort_order, is_done) VALUES
  ('00000000-0001-0001-0001-000000000001', 'awareness',      '네이버 플레이스 대표 키워드 설정',                1, true),
  ('00000000-0001-0001-0001-000000000001', 'awareness',      '블로그 포스팅 발행',                           2, true),
  ('00000000-0001-0001-0001-000000000001', 'awareness',      'SNS 계정 연동',                              3, true),
  ('00000000-0001-0001-0001-000000000001', 'awareness',      '네이버 광고 세팅',                             4, true),
  ('00000000-0001-0001-0001-000000000001', 'lead_capture',   '전화번호(스마트콜) 설정',                       1, true),
  ('00000000-0001-0001-0001-000000000001', 'lead_capture',   '카카오톡 채널 연동',                            2, true),
  ('00000000-0001-0001-0001-000000000001', 'lead_capture',   '네이버 예약 활성화',                            3, true),
  ('00000000-0001-0001-0001-000000000001', 'lead_capture',   '홈페이지 폼 연동',                             4, false),
  ('00000000-0001-0001-0001-000000000001', 'lead_nurture',   '팔로업 프로세스 수립',                          1, true),
  ('00000000-0001-0001-0001-000000000001', 'lead_nurture',   '부재중 콜백 ARS 설정',                         2, false),
  ('00000000-0001-0001-0001-000000000001', 'lead_nurture',   '카카오 자동응답 설정',                          3, true),
  ('00000000-0001-0001-0001-000000000001', 'lead_nurture',   '예약 확정 + 리마인드 알림 설정',                  4, false),
  ('00000000-0001-0001-0001-000000000001', 'lead_nurture',   '초진 이벤트 기획 (첫 방문 할인/무료 검진)',         5, false),
  ('00000000-0001-0001-0001-000000000001', 'lead_nurture',   '오시는 길 + 주차 안내 자동 문자 발송',             6, true),
  ('00000000-0001-0001-0001-000000000001', 'new_patient',    '내원 동선 안내 설정',                           1, true),
  ('00000000-0001-0001-0001-000000000001', 'new_patient',    '상담 스크립트 제공',                            2, false),
  ('00000000-0001-0001-0001-000000000001', 'new_patient',    '치료 동의 프로세스 점검',                        3, false),
  ('00000000-0001-0001-0001-000000000001', 'cs_onboarding',  '첫 방문 감사 문자',                             1, true),
  ('00000000-0001-0001-0001-000000000001', 'cs_onboarding',  '치료 후 주의사항 발송',                          2, true),
  ('00000000-0001-0001-0001-000000000001', 'cs_onboarding',  '다음 예약 안내',                               3, true),
  ('00000000-0001-0001-0001-000000000001', 'cs_upsell',      '추가 진료 추천 시나리오',                        1, false),
  ('00000000-0001-0001-0001-000000000001', 'cs_upsell',      '패키지 상품 안내',                              2, false),
  ('00000000-0001-0001-0001-000000000001', 'cs_support',     '치료 후 케어 문자',                             1, true),
  ('00000000-0001-0001-0001-000000000001', 'cs_support',     '정기 검진 리마인더',                            2, false),
  ('00000000-0001-0001-0001-000000000001', 'cs_community',   '리뷰 요청 자동화',                              1, true),
  ('00000000-0001-0001-0001-000000000001', 'cs_community',   '소개 이벤트 운영',                              2, false),
  ('00000000-0001-0001-0001-000000000001', 'cs_analytics',   '월간 유입/전환 리포트',                          1, true),
  ('00000000-0001-0001-0001-000000000001', 'cs_analytics',   '키워드 순위 추적',                              2, true);

INSERT INTO activity_logs (client_id, node_key, action_type, content, visible_to_client, created_at) VALUES
  ('00000000-0001-0001-0001-000000000001', 'awareness',      'task_complete',  '네이버 플레이스 ''강남 임플란트'' 키워드 1페이지 달성',            true,  now() - interval '1 day'),
  ('00000000-0001-0001-0001-000000000001', 'awareness',      'note',           '블로그 포스팅 10건 발행 완료. 네이버 검색 노출 확인',            true,  now() - interval '2 days'),
  ('00000000-0001-0001-0001-000000000001', 'awareness',      'status_change',  '인지 확대 노드 → 완료 처리',                                 true,  now() - interval '3 days'),
  ('00000000-0001-0001-0001-000000000001', 'lead_capture',   'task_complete',  '스마트콜 번호 설정 완료 (02-1234-5678)',                       true,  now() - interval '3 days'),
  ('00000000-0001-0001-0001-000000000001', 'lead_capture',   'task_complete',  '카카오톡 채널 개설 및 연동 완료',                               true,  now() - interval '4 days'),
  ('00000000-0001-0001-0001-000000000001', 'lead_capture',   'note',           '네이버 예약 시스템 활성화. 실시간 예약 가능',                     true,  now() - interval '5 days'),
  ('00000000-0001-0001-0001-000000000001', 'lead_nurture',   'task_complete',  '팔로업 프로세스 수립 — 미예약 리드 3일/7일/14일 자동 재연락',      true,  now() - interval '5 days'),
  ('00000000-0001-0001-0001-000000000001', 'lead_nurture',   'note',           '카카오 자동응답 시나리오 5개 설정 (진료문의, 가격문의, 위치, 주차, 예약)', true, now() - interval '6 days'),
  ('00000000-0001-0001-0001-000000000001', 'lead_nurture',   'file_upload',    '오시는 길 안내 이미지 + 주차 안내 문자 템플릿 업로드',              true,  now() - interval '7 days'),
  ('00000000-0001-0001-0001-000000000001', 'new_patient',    'task_complete',  '내원 동선 안내 완료 — 접수 → 대기 → 촬영 → 상담 → 진료',         true,  now() - interval '8 days'),
  ('00000000-0001-0001-0001-000000000001', 'new_patient',    'note',           '상담 스크립트 초안 작성 중. 임플란트/교정 각 시나리오별 분류',        false, now() - interval '9 days'),
  ('00000000-0001-0001-0001-000000000001', 'cs_onboarding',  'task_complete',  '첫 방문 감사 문자 자동발송 설정 완료',                           true,  now() - interval '10 days'),
  ('00000000-0001-0001-0001-000000000001', 'cs_onboarding',  'task_complete',  '치료 후 주의사항 문자 템플릿 5종 등록',                           true,  now() - interval '11 days'),
  ('00000000-0001-0001-0001-000000000001', 'cs_support',     'task_complete',  '임플란트 수술 후 24h/72h/7일 케어 문자 자동발송 설정',             true,  now() - interval '12 days'),
  ('00000000-0001-0001-0001-000000000001', 'cs_community',   'task_complete',  '네이버 플레이스 리뷰 요청 자동화 — 진료 완료 3일 후 발송',          true,  now() - interval '13 days'),
  ('00000000-0001-0001-0001-000000000001', 'cs_community',   'note',           '소개 이벤트 기획 검토 중 (소개 시 스케일링 무료 쿠폰)',             false, now() - interval '14 days'),
  ('00000000-0001-0001-0001-000000000001', 'cs_analytics',   'task_complete',  '월간 리포트 자동화 설정 완료 — 매월 1일 이메일 발송',              true,  now() - interval '15 days'),
  ('00000000-0001-0001-0001-000000000001', 'cs_analytics',   'file_upload',    '2월 유입/전환 리포트 발송 — 네이버 유입 320건, 예약전환 42건 (13.1%)', true, now() - interval '16 days'),
  ('00000000-0001-0001-0001-000000000001', 'cs_analytics',   'note',           '키워드 순위 추적 시작 — ''강남 임플란트'' 3위, ''역삼 치과'' 5위',    true,  now() - interval '17 days');


-- ---- hardtoothhospital (Entry) ----
DELETE FROM activity_logs WHERE client_id = '00000000-0002-0002-0002-000000000002';
DELETE FROM sub_nodes    WHERE client_id = '00000000-0002-0002-0002-000000000002';
DELETE FROM nodes        WHERE client_id = '00000000-0002-0002-0002-000000000002';
DELETE FROM clients      WHERE id        = '00000000-0002-0002-0002-000000000002';

INSERT INTO clients (id, name, region, contact_name, contact_phone, contact_email, package_tier, contract_start, memo, auth_user_id)
VALUES (
  '00000000-0002-0002-0002-000000000002',
  '하드투스치과',
  '수원시 영통구',
  '박원장',
  '010-9876-5432',
  'hardtooth@demo.com',
  'entry',
  '2026-03-10',
  '수원 영통역 근처. 일반진료 위주. 마케팅 시작 단계.',
  (SELECT id FROM auth.users WHERE email = 'hardtooth@demo.com')
);

INSERT INTO nodes (client_id, node_key, status) VALUES
  ('00000000-0002-0002-0002-000000000002', 'awareness',      'in_progress'),
  ('00000000-0002-0002-0002-000000000002', 'lead_capture',   'inactive'),
  ('00000000-0002-0002-0002-000000000002', 'lead_nurture',   'inactive'),
  ('00000000-0002-0002-0002-000000000002', 'new_patient',    'inactive'),
  ('00000000-0002-0002-0002-000000000002', 'cs_onboarding',  'inactive'),
  ('00000000-0002-0002-0002-000000000002', 'cs_upsell',      'inactive'),
  ('00000000-0002-0002-0002-000000000002', 'cs_support',     'inactive'),
  ('00000000-0002-0002-0002-000000000002', 'cs_education',   'inactive'),
  ('00000000-0002-0002-0002-000000000002', 'cs_community',   'inactive'),
  ('00000000-0002-0002-0002-000000000002', 'cs_analytics',   'in_progress');

INSERT INTO sub_nodes (client_id, node_key, label, sort_order, is_done) VALUES
  ('00000000-0002-0002-0002-000000000002', 'awareness',    '네이버 플레이스 대표 키워드 설정', 1, true),
  ('00000000-0002-0002-0002-000000000002', 'awareness',    '블로그 포스팅 발행',             2, false),
  ('00000000-0002-0002-0002-000000000002', 'awareness',    'SNS 계정 연동',                3, false),
  ('00000000-0002-0002-0002-000000000002', 'awareness',    '네이버 광고 세팅',               4, false),
  ('00000000-0002-0002-0002-000000000002', 'cs_analytics', '월간 유입/전환 리포트',            1, false),
  ('00000000-0002-0002-0002-000000000002', 'cs_analytics', '키워드 순위 추적',                2, true);

INSERT INTO activity_logs (client_id, node_key, action_type, content, visible_to_client, created_at) VALUES
  ('00000000-0002-0002-0002-000000000002', 'awareness',    'task_complete',  '네이버 플레이스 ''수원 치과'' 키워드 등록 완료',     true,  now() - interval '2 days'),
  ('00000000-0002-0002-0002-000000000002', 'awareness',    'note',           '플레이스 사진 업로드 및 영업시간 정보 업데이트',     true,  now() - interval '4 days'),
  ('00000000-0002-0002-0002-000000000002', 'awareness',    'note',           '블로그 포스팅 주제 리스트 작성 중',               false, now() - interval '5 days'),
  ('00000000-0002-0002-0002-000000000002', 'cs_analytics', 'task_complete',  '키워드 순위 추적 설정 — ''수원 치과'' 현재 12위',   true,  now() - interval '3 days'),
  ('00000000-0002-0002-0002-000000000002', 'cs_analytics', 'note',           '첫 월간 리포트 다음 주 발송 예정',               true,  now() - interval '1 day');

-- ============================================
-- 6. STORAGE (이미지 업로드)
-- ============================================

-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO NOTHING;

-- activity_logs에 image_urls 컬럼 추가
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- RLS: admin만 업로드
DO $$ BEGIN
  CREATE POLICY "Admin can upload activity images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'activity-images'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS: 누구나 조회
DO $$ BEGIN
  CREATE POLICY "Anyone can view activity images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'activity-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 7. LOG TYPE (memo / work)
-- ============================================

-- log_type 컬럼 추가
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS log_type text DEFAULT 'memo';

-- 기존 데이터 마이그레이션
UPDATE activity_logs
SET log_type = 'work', visible_to_client = true
WHERE action_type IN ('task_complete', 'status_change', 'file_upload');

UPDATE activity_logs
SET log_type = CASE
  WHEN visible_to_client = true THEN 'work'
  ELSE 'memo'
END
WHERE action_type = 'note';

-- CHECK 제약 추가
DO $$ BEGIN
  ALTER TABLE activity_logs
  ADD CONSTRAINT activity_logs_log_type_check CHECK (log_type IN ('memo', 'work'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS 정책 업데이트: 기존 client 정책 교체
DROP POLICY IF EXISTS "Client read visible logs" ON activity_logs;

CREATE POLICY "Client read visible logs" ON activity_logs FOR SELECT USING (
  client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  AND visible_to_client = true
);
