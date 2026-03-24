-- ============================================================
-- Migration 002: activity_logs 단순화 (memo / work)
-- Supabase SQL Editor에서 실행
-- ============================================================

-- ① log_type 컬럼 추가
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS log_type text DEFAULT 'memo';

-- ② 기존 데이터 마이그레이션
-- note → memo (비공개), 나머지 → work (공개)
UPDATE activity_logs
SET log_type = 'work', visible_to_client = true
WHERE action_type IN ('task_complete', 'status_change', 'file_upload');

UPDATE activity_logs
SET log_type = CASE
  WHEN visible_to_client = true THEN 'work'
  ELSE 'memo'
END
WHERE action_type = 'note';

-- ③ CHECK 제약 추가
ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_log_type_check CHECK (log_type IN ('memo', 'work'));

-- ④ RLS 정책 업데이트: 기존 client 정책 교체
DROP POLICY IF EXISTS "Client read visible logs" ON activity_logs;

CREATE POLICY "Client read visible logs" ON activity_logs FOR SELECT USING (
  client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  AND visible_to_client = true
);
