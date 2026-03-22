import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  hasSupabaseEnv,
  hasSupabaseServiceRole,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "@/lib/env";

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!hasSupabaseEnv) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!hasSupabaseEnv || !hasSupabaseServiceRole) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
