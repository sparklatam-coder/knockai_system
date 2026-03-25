import { ClientDetailView } from "@/components/admin/client-detail-view";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";

interface AdminClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminClientDetailPage({ params }: AdminClientDetailPageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute requireAdmin>
      <DashboardShell
        hideNav
        title="고객 관리"
        description="마케팅 서비스 진행 상황과 활동 기록을 관리합니다."
      >
        <ClientDetailView clientId={id} />
      </DashboardShell>
    </ProtectedRoute>
  );
}
