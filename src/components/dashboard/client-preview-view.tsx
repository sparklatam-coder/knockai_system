"use client";

import { useClientDetail } from "@/hooks/use-client-detail";
import { DashboardCanvas } from "@/components/dashboard/dashboard-canvas";
import { HospitalLoadingScreen } from "@/components/HospitalLoadingScreen";

export function ClientPreviewView({ clientId }: { clientId: string }) {
  const { data, loading, error } = useClientDetail(clientId);

  if (loading) return <HospitalLoadingScreen />;
  if (error || !data) return <div className="error-banner">⚠️ {error ?? "데이터를 불러오지 못했습니다."}</div>;

  // 고객에게 공개된 로그만 필터링 (실제 고객 뷰와 동일하게)
  const visibleLogs = data.activityLogs.filter((log) => log.visible_to_client);

  return (
    <DashboardCanvas
      client={data.client}
      nodes={data.nodes}
      logs={visibleLogs}
    />
  );
}
