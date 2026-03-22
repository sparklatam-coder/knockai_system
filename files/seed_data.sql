-- KNOCK Hospital Customer Dashboard
-- Seed Data: 테스트용 샘플 데이터
-- Admin 계정 생성 후 실행

-- ============================================
-- 샘플 고객 1: 노내과의원 (Basic 패키지)
-- ============================================

INSERT INTO clients (id, name, region, contact_name, contact_phone, package_tier, contract_start, memo)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '노내과의원',
  '광명시 철산동',
  '노원장',
  '010-0000-0000',
  'basic',
  '2026-03-01',
  '광명역 인근. 비만 치료 특화.'
);

-- 노내과의원 nodes (10개)
INSERT INTO nodes (client_id, node_key, status) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'awareness', 'active'),
  ('a1111111-1111-1111-1111-111111111111', 'lead_capture', 'in_progress'),
  ('a1111111-1111-1111-1111-111111111111', 'lead_nurture', 'inactive'),
  ('a1111111-1111-1111-1111-111111111111', 'new_patient', 'inactive'),
  ('a1111111-1111-1111-1111-111111111111', 'cs_onboarding', 'inactive'),
  ('a1111111-1111-1111-1111-111111111111', 'cs_upsell', 'inactive'),
  ('a1111111-1111-1111-1111-111111111111', 'cs_support', 'inactive'),
  ('a1111111-1111-1111-1111-111111111111', 'cs_education', 'inactive'),
  ('a1111111-1111-1111-1111-111111111111', 'cs_community', 'inactive'),
  ('a1111111-1111-1111-1111-111111111111', 'cs_analytics', 'in_progress');

-- 노내과의원 sub_nodes
INSERT INTO sub_nodes (client_id, node_key, label, is_done, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'awareness', '네이버 플레이스 대표 키워드 설정', true, 1),
  ('a1111111-1111-1111-1111-111111111111', 'awareness', '블로그 포스팅 발행', true, 2),
  ('a1111111-1111-1111-1111-111111111111', 'awareness', 'SNS 계정 연동', false, 3),
  ('a1111111-1111-1111-1111-111111111111', 'awareness', '네이버 광고 세팅', false, 4),
  ('a1111111-1111-1111-1111-111111111111', 'lead_capture', '전화번호(스마트콜) 설정', true, 1),
  ('a1111111-1111-1111-1111-111111111111', 'lead_capture', '카카오톡 채널 연동', false, 2),
  ('a1111111-1111-1111-1111-111111111111', 'lead_capture', '네이버 예약 활성화', false, 3),
  ('a1111111-1111-1111-1111-111111111111', 'lead_capture', '홈페이지 폼 연동', false, 4);

-- 노내과의원 activity_logs
INSERT INTO activity_logs (client_id, node_key, action_type, content, visible_to_client) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'awareness', 'status_change', '인지 확대 노드 상태: 미설정 → 진행 중', true),
  ('a1111111-1111-1111-1111-111111111111', 'awareness', 'task_complete', '네이버 플레이스 대표 키워드 10개 변경 완료 (광명내과, 철산동내과, 광명비만클리닉 등)', true),
  ('a1111111-1111-1111-1111-111111111111', 'awareness', 'note', '블로그 포스팅 1건 발행 - "광명시 비만 치료, 어떤 방법이 효과적일까?"', true),
  ('a1111111-1111-1111-1111-111111111111', 'awareness', 'status_change', '인지 확대 노드 상태: 진행 중 → 정상 운영', true),
  ('a1111111-1111-1111-1111-111111111111', 'lead_capture', 'status_change', '리드 획득 노드 상태: 미설정 → 진행 중', true),
  ('a1111111-1111-1111-1111-111111111111', 'lead_capture', 'task_complete', '스마트콜 번호 변경 완료', true),
  ('a1111111-1111-1111-1111-111111111111', 'lead_capture', 'note', '카카오톡 채널 연동 대기 중 - 병원 측 카카오 비즈니스 인증 필요', true),
  ('a1111111-1111-1111-1111-111111111111', 'cs_analytics', 'status_change', '분석 노드 상태: 미설정 → 진행 중', true),
  ('a1111111-1111-1111-1111-111111111111', 'cs_analytics', 'note', '3월 1주차 키워드 순위 체크 완료 - 광명내과 12위', false);

-- ============================================
-- 샘플 고객 2: 에이힐동물병원 (Premium 패키지)
-- ============================================

INSERT INTO clients (id, name, region, contact_name, contact_phone, package_tier, contract_start, memo)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  '에이힐동물병원',
  '서울시 강남구',
  '담당자',
  '010-0000-0000',
  'premium',
  '2026-02-15',
  '강남 슬개골 탈구 수술 전문. 유튜브 채널 운영 중.'
);

-- 에이힐동물병원 nodes
INSERT INTO nodes (client_id, node_key, status) VALUES
  ('b2222222-2222-2222-2222-222222222222', 'awareness', 'active'),
  ('b2222222-2222-2222-2222-222222222222', 'lead_capture', 'active'),
  ('b2222222-2222-2222-2222-222222222222', 'lead_nurture', 'in_progress'),
  ('b2222222-2222-2222-2222-222222222222', 'new_patient', 'inactive'),
  ('b2222222-2222-2222-2222-222222222222', 'cs_onboarding', 'inactive'),
  ('b2222222-2222-2222-2222-222222222222', 'cs_upsell', 'inactive'),
  ('b2222222-2222-2222-2222-222222222222', 'cs_support', 'in_progress'),
  ('b2222222-2222-2222-2222-222222222222', 'cs_education', 'inactive'),
  ('b2222222-2222-2222-2222-222222222222', 'cs_community', 'in_progress'),
  ('b2222222-2222-2222-2222-222222222222', 'cs_analytics', 'active');
