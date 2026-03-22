import { ClientDetailView } from "@/components/admin/client-detail-view";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import Link from "next/link";

interface AdminClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminClientDetailPage({ params }: AdminClientDetailPageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute requireAdmin>
      <DashboardShell
        title="고객 관리"
        description="마케팅 서비스 진행 상황과 활동 기록을 관리합니다."
        actions={
          <Link
            href={`/admin/clients/${id}/preview`}
            className="primary-button"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            👁 고객 대시보드 미리보기
          </Link>
        }
      >
        <ClientDetailView clientId={id} />
      </DashboardShell>
    </ProtectedRoute>
  );
}
