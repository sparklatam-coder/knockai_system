import type { User } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

interface AdminRequestContext {
  adminClient: NonNullable<ReturnType<typeof getSupabaseAdminClient>>;
  user: User;
}

function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7).trim() || null;
}

export async function getAdminRequestContext(
  authorizationHeader: string | null,
): Promise<AdminRequestContext | { error: string; status: number }> {
  const adminClient = getSupabaseAdminClient();

  if (!adminClient) {
    return {
      error: "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.",
      status: 503,
    };
  }

  const accessToken = getBearerToken(authorizationHeader);

  if (!accessToken) {
    return {
      error: "인증 토큰이 없습니다.",
      status: 401,
    };
  }

  const { data, error } = await adminClient.auth.getUser(accessToken);

  if (error || !data.user) {
    return {
      error: "유효한 세션을 확인할 수 없습니다.",
      status: 401,
    };
  }

  const role = data.user.app_metadata?.role;
  if (role !== "admin" && role !== "super_admin") {
    return {
      error: "관리자 권한이 필요합니다.",
      status: 403,
    };
  }

  return {
    adminClient,
    user: data.user,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a route param (UUID or client name) to a client UUID.
 * Returns the UUID string or null if not found.
 */
export async function resolveClientId(
  adminClient: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  idOrName: string,
): Promise<string | null> {
  if (UUID_RE.test(idOrName)) {
    return idOrName;
  }
  const decoded = decodeURIComponent(idOrName);
  const { data } = await adminClient
    .from("clients")
    .select("id")
    .eq("name", decoded)
    .single();
  return data?.id ?? null;
}
