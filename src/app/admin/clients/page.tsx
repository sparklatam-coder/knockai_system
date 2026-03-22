import { AdminClientsView } from "@/components/admin/admin-clients-view";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function AdminClientsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <DashboardShell
        title="고객 관리"
        description="병원 고객의 마케팅 서비스 현황을 관리하고, 신규 고객을 등록하세요."
      >
        <AdminClientsView />
      </DashboardShell>
    </ProtectedRoute>
  );
}
