import { ClientPreviewView } from "@/components/dashboard/client-preview-view";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminClientPreviewPage({ params }: Props) {
  const { id } = await params;

  return (
    <ProtectedRoute requireAdmin>
      <DashboardShell
        title="고객 대시보드 미리보기"
        description="고객이 실제로 보게 되는 대시보드입니다. 공개 설정된 로그만 표시됩니다."
        actions={
          <Link
            href={`/admin/clients/${id}`}
            className="secondary-button"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            ← 관리 화면으로 돌아가기
          </Link>
        }
      >
        <ClientPreviewView clientId={id} />
      </DashboardShell>
    </ProtectedRoute>
  );
}
