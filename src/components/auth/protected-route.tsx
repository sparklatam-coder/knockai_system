"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { configured, loading, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!configured || loading) {
      return;
    }

    if (!isAuthenticated) {
      const redirectTo = encodeURIComponent(pathname);
      router.replace(`/login?redirectTo=${redirectTo}`);
      return;
    }

    const isAdminRole = role === "admin" || role === "super_admin";
    if (requireAdmin && !isAdminRole) {
      router.replace("/dashboard");
    }
  }, [configured, isAuthenticated, loading, pathname, requireAdmin, role, router]);

  if (!configured) {
    return (
      <div className="state-card">
        <h2>Supabase 설정이 필요합니다</h2>
        <p>
          `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 설정하면 인증
          라우트를 바로 테스트할 수 있습니다.
        </p>
      </div>
    );
  }

  const isAdminRole2 = role === "admin" || role === "super_admin";
  if (loading || !isAuthenticated || (requireAdmin && !isAdminRole2)) {
    return (
      <div className="state-card">
        <h2>인증 상태를 확인하는 중입니다</h2>
        <p>세션을 불러온 뒤 적절한 화면으로 이동합니다.</p>
      </div>
    );
  }

  return <>{children}</>;
}
