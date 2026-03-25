import { ProtectedRoute } from "@/components/auth/protected-route";
import { ClientDashboardView } from "@/components/dashboard/client-dashboard-view";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell
        hideNav
        title="마케팅 대시보드"
        description="현재 진행 중인 마케팅 서비스 현황과 작업 기록을 확인하세요."
      >
        <ClientDashboardView />
      </DashboardShell>
    </ProtectedRoute>
  );
}
