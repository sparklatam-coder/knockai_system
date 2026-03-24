-- Migration: activity_logs 이미지 첨부 기능
-- 1. activity_logs 테이블에 image_urls 컬럼 추가
-- 2. Supabase Storage 버킷 생성 + RLS 정책

-- ① image_urls 컬럼 추가 (배열, 한 로그에 여러 이미지 가능)
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- ② Storage 버킷 생성 (public: 고객도 이미지 볼 수 있어야 함)
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO NOTHING;

-- ③ RLS 정책: admin만 업로드 가능
CREATE POLICY "Admin can upload activity images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'activity-images'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ④ RLS 정책: 누구나 조회 가능 (public 버킷)
CREATE POLICY "Anyone can view activity images"
ON storage.objects FOR SELECT
USING (bucket_id = 'activity-images');
