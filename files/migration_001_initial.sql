-- KNOCK Hospital Customer Dashboard
-- Supabase Migration: Initial Schema
-- Run this in Supabase SQL Editor

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
  package_tier TEXT NOT NULL DEFAULT 'basic' CHECK (package_tier IN ('basic', 'standard', 'premium')),
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
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX idx_nodes_client ON nodes(client_id);
CREATE INDEX idx_sub_nodes_client_node ON sub_nodes(client_id, node_key);
CREATE INDEX idx_activity_logs_client ON activity_logs(client_id);
CREATE INDEX idx_activity_logs_client_node ON activity_logs(client_id, node_key);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_clients_auth_user ON clients(auth_user_id);

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
CREATE POLICY "Admin full access on clients" ON clients
  FOR ALL USING (is_admin());

CREATE POLICY "Client read own" ON clients
  FOR SELECT USING (auth_user_id = auth.uid());

-- nodes
CREATE POLICY "Admin full access on nodes" ON nodes
  FOR ALL USING (is_admin());

CREATE POLICY "Client read own nodes" ON nodes
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  );

-- sub_nodes
CREATE POLICY "Admin full access on sub_nodes" ON sub_nodes
  FOR ALL USING (is_admin());

CREATE POLICY "Client read own sub_nodes" ON sub_nodes
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  );

-- activity_logs
CREATE POLICY "Admin full access on activity_logs" ON activity_logs
  FOR ALL USING (is_admin());

CREATE POLICY "Client read visible logs" ON activity_logs
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
    AND visible_to_client = true
  );

-- inquiries
CREATE POLICY "Admin full access on inquiries" ON inquiries
  FOR ALL USING (is_admin());

CREATE POLICY "Client insert own inquiries" ON inquiries
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Client read own inquiries" ON inquiries
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
  );

-- ============================================
-- 4. UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER nodes_updated_at
  BEFORE UPDATE ON nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
