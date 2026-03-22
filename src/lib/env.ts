export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hasSupabaseEnv =
  supabaseUrl.trim().length > 0 && supabaseAnonKey.trim().length > 0;

export const hasSupabaseServiceRole = supabaseServiceRoleKey.trim().length > 0;
