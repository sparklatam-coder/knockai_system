-- ============================================================
-- KNOCK Market Map — territories + territory_inquiries
-- Supabase SQL Editor에서 실행
-- ============================================================

-- 1. territories: 지역별 업종 슬롯
CREATE TABLE IF NOT EXISTS territories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sido TEXT NOT NULL,
  sigungu TEXT NOT NULL,
  dong TEXT,
  specialty TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('secured', 'recruiting', 'available')),
  client_id UUID REFERENCES clients(id),
  client_name TEXT,
  keyword TEXT,
  current_rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_territories_unique
  ON territories(sido, sigungu, COALESCE(dong, ''), specialty);
CREATE INDEX IF NOT EXISTS idx_territories_status ON territories(status);
CREATE INDEX IF NOT EXISTS idx_territories_sido ON territories(sido);

-- 2. territory_inquiries: 모집 문의
CREATE TABLE IF NOT EXISTS territory_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  territory_id UUID REFERENCES territories(id),
  hospital_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialty TEXT NOT NULL,
  sido TEXT NOT NULL,
  sigungu TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS policies
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE territory_inquiries ENABLE ROW LEVEL SECURITY;

-- territories: 누구나 읽기 가능 (공개 페이지)
CREATE POLICY "territories_public_read" ON territories
  FOR SELECT USING (true);

-- territories: 관리자만 수정
CREATE POLICY "territories_admin_write" ON territories
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'super_admin'
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- territory_inquiries: 누구나 삽입 가능 (문의 폼)
CREATE POLICY "inquiries_public_insert" ON territory_inquiries
  FOR INSERT WITH CHECK (true);

-- territory_inquiries: 관리자만 조회/수정
CREATE POLICY "inquiries_admin_read" ON territory_inquiries
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'super_admin'
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- 4. 시드 데이터 — 실제 고객 (secured)
INSERT INTO territories (sido, sigungu, specialty, status, client_name, keyword, current_rank) VALUES
  ('경기도', '양주시', '치과', 'secured', '양주이지치과', '양주치과', 3),
  ('경기도', '광명시', '내과', 'secured', '노내과의원', '광명내과', 1),
  ('제주특별자치도', '제주시', '정형외과', 'secured', '제주팔팔의원', '제주정형외과', 1),
  ('서울특별시', '강남구', '피부과', 'secured', '에스앤유피부과', '강남피부과', 2)
ON CONFLICT DO NOTHING;

-- 5. 시드 데이터 — 모집 중 (recruiting)
INSERT INTO territories (sido, sigungu, specialty, status) VALUES
  ('서울특별시', '강남구', '치과', 'recruiting'),
  ('서울특별시', '서초구', '내과', 'recruiting'),
  ('서울특별시', '송파구', '정형외과', 'recruiting'),
  ('서울특별시', '마포구', '피부과', 'recruiting'),
  ('경기도', '수원시', '치과', 'recruiting'),
  ('경기도', '성남시', '내과', 'recruiting'),
  ('경기도', '고양시', '한의원', 'recruiting'),
  ('부산광역시', '해운대구', '치과', 'recruiting'),
  ('부산광역시', '부산진구', '내과', 'recruiting'),
  ('대구광역시', '수성구', '피부과', 'recruiting'),
  ('인천광역시', '남동구', '치과', 'recruiting'),
  ('대전광역시', '유성구', '정형외과', 'recruiting'),
  ('광주광역시', '북구', '한의원', 'recruiting'),
  ('울산광역시', '남구', '내과', 'recruiting')
ON CONFLICT DO NOTHING;
