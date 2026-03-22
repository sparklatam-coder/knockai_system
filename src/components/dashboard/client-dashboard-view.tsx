"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useMyDashboard } from "@/hooks/use-my-dashboard";
import { DashboardCanvas } from "@/components/dashboard/dashboard-canvas";
import { HospitalLoadingScreen } from "@/components/HospitalLoadingScreen";

export function ClientDashboardView() {
  const router = useRouter();
  const { role } = useAuth();
  const { data, loading, error } = useMyDashboard();

  // Admin users should use /admin/clients, not /dashboard
  if (role === "admin") {
    router.replace("/admin/clients");
    return null;
  }

  if (loading) return <HospitalLoadingScreen />;
  if (error) return <div className="error-banner">⚠️ {error}</div>;
  if (!data.client) {
    return (
      <div className="state-card">
        현재 로그인 계정과 연결된 고객 정보가 없습니다.{" "}
        <code>clients.auth_user_id</code> 연결 후 다시 확인해주세요.
      </div>
    );
  }

  return (
    <DashboardCanvas
      client={data.client}
      nodes={data.nodes}
      logs={data.logs}
    />
  );
}
