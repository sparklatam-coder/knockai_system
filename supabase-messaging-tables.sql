-- ================================================
-- KNOCK AI 메시징 시스템 테이블
-- Supabase SQL Editor에서 실행하세요
-- ================================================

-- 1. messaging_patients
CREATE TABLE messaging_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  last_visit DATE,
  treatment TEXT,
  is_channel_friend BOOLEAN DEFAULT FALSE,
  patient_group TEXT, -- '6m', '1y', '2y', '2y+'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, phone)
);

-- 2. messaging_templates
CREATE TABLE messaging_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'alimtalk', 'friendtalk'
  subtype TEXT, -- '채널추가형', '기본형', '이미지형'
  status TEXT DEFAULT 'draft', -- 'draft', 'review', 'approved', 'rejected'
  body TEXT NOT NULL,
  button_name TEXT,
  button_url TEXT,
  solapi_template_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. messaging_campaigns
CREATE TABLE messaging_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  template_id UUID REFERENCES messaging_templates(id),
  type TEXT NOT NULL, -- 'alimtalk', 'friendtalk'
  target_group TEXT, -- 'all', '6m', '1y', '2y', '2y+', 'friends'
  target_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  wave INTEGER, -- 분할 발송 차수
  sent_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. messaging_logs
CREATE TABLE messaging_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES messaging_campaigns(id),
  patient_id UUID REFERENCES messaging_patients(id),
  type TEXT NOT NULL, -- 'alimtalk', 'friendtalk', 'sms'
  template_name TEXT,
  status TEXT NOT NULL, -- 'success', 'sms_fallback', 'fail'
  solapi_message_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- RLS 정책
-- ================================================

ALTER TABLE messaging_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_logs ENABLE ROW LEVEL SECURITY;

-- service_role은 항상 접근 가능 (API routes에서 adminClient 사용)
-- client는 자기 client_id 레코드만 읽기

CREATE POLICY "service_role_all" ON messaging_patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "clients_read_own_patients" ON messaging_patients
  FOR SELECT USING (client_id = (SELECT id FROM clients WHERE auth_user_id = auth.uid()));

CREATE POLICY "service_role_all" ON messaging_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "clients_read_own_templates" ON messaging_templates
  FOR SELECT USING (client_id = (SELECT id FROM clients WHERE auth_user_id = auth.uid()));

CREATE POLICY "service_role_all" ON messaging_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "clients_read_own_campaigns" ON messaging_campaigns
  FOR SELECT USING (client_id = (SELECT id FROM clients WHERE auth_user_id = auth.uid()));

CREATE POLICY "service_role_all" ON messaging_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "clients_read_own_logs" ON messaging_logs
  FOR SELECT USING (client_id = (SELECT id FROM clients WHERE auth_user_id = auth.uid()));

-- ================================================
-- 인덱스
-- ================================================

CREATE INDEX idx_msg_patients_client ON messaging_patients(client_id);
CREATE INDEX idx_msg_templates_client ON messaging_templates(client_id);
CREATE INDEX idx_msg_campaigns_client ON messaging_campaigns(client_id);
CREATE INDEX idx_msg_logs_client ON messaging_logs(client_id);
CREATE INDEX idx_msg_logs_sent_at ON messaging_logs(sent_at DESC);
