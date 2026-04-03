-- ================================================
-- SECURITY FIX: RLS policies were too permissive
-- The "service_role_all" policies used USING(true) without
-- restricting to service_role, allowing ANY authenticated user
-- full access via the anon key.
--
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "service_role_all" ON messaging_patients;
DROP POLICY IF EXISTS "service_role_all" ON messaging_templates;
DROP POLICY IF EXISTS "service_role_all" ON messaging_campaigns;
DROP POLICY IF EXISTS "service_role_all" ON messaging_logs;

-- Re-create with proper role restriction
CREATE POLICY "service_role_all" ON messaging_patients
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON messaging_templates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON messaging_campaigns
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all" ON messaging_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
