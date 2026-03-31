-- clients 테이블에 솔라피 설정 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE clients ADD COLUMN IF NOT EXISTS solapi_pfid TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS solapi_sender_number TEXT;
