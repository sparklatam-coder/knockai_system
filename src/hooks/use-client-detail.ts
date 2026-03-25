"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { ClientDashboardData, GuideLink, LogType, NodeStatus } from "@/lib/types";

interface CreateLogInput {
  node_key: string;
  log_type: LogType;
  content: string;
  image_urls?: string[];
}

export function useClientDetail(clientId: string) {
  const { configured, isAuthenticated, role, session } = useAuth();
  const encodedId = encodeURIComponent(clientId);
  const [data, setData] = useState<ClientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!configured || !isAuthenticated || (role !== "admin" && role !== "super_admin") || !session?.access_token) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch(`/api/admin/clients/${encodedId}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    });

    const json = (await response.json()) as {
      data?: ClientDashboardData;
      error?: string;
    };

    if (!response.ok) {
      setError(json.error ?? "고객 상세를 불러오지 못했습니다.");
      setData(null);
    } else {
      setData(json.data ?? null);
    }

    setLoading(false);
  }, [clientId, configured, isAuthenticated, role, session?.access_token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateNodeStatus = useCallback(
    async (nodeKey: string, status: NodeStatus) => {
      if (!session?.access_token) {
        return { error: "세션이 없습니다." };
      }

      const response = await fetch(`/api/admin/clients/${clientId}/nodes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          kind: "node_status",
          node_key: nodeKey,
          status,
        }),
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        return { error: json.error ?? "상태 변경에 실패했습니다." };
      }

      return { error: null };
    },
    [clientId, session?.access_token],
  );

  const toggleSubNode = useCallback(
    async (subNodeId: string, isDone: boolean) => {
      if (!session?.access_token) {
        return { error: "세션이 없습니다." };
      }

      const response = await fetch(`/api/admin/clients/${clientId}/nodes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          kind: "sub_node_toggle",
          sub_node_id: subNodeId,
          is_done: isDone,
        }),
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        return { error: json.error ?? "체크리스트 변경에 실패했습니다." };
      }

      return { error: null };
    },
    [clientId, session?.access_token],
  );

  const createLog = useCallback(
    async (input: CreateLogInput) => {
      if (!session?.access_token) {
        return { error: "세션이 없습니다." };
      }

      setSaving(true);

      const response = await fetch(`/api/admin/clients/${clientId}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(input),
      });

      const json = (await response.json()) as { error?: string };
      setSaving(false);

      if (!response.ok) {
        setError(json.error ?? "로그 작성에 실패했습니다.");
        return { error: json.error ?? "로그 작성에 실패했습니다." };
      }

      await refresh();
      return { error: null };
    },
    [clientId, refresh, session?.access_token],
  );

  const updateLog = useCallback(
    async (logId: string, content: string) => {
      if (!session?.access_token) return { error: "세션이 없습니다." };
      setSaving(true);
      const response = await fetch(`/api/admin/clients/${clientId}/logs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ log_id: logId, content }),
      });
      const json = (await response.json()) as { error?: string };
      setSaving(false);
      if (!response.ok) return { error: json.error ?? "수정에 실패했습니다." };
      await refresh();
      return { error: null };
    },
    [clientId, refresh, session?.access_token],
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      if (!session?.access_token) return { error: "세션이 없습니다." };
      setSaving(true);
      const response = await fetch(`/api/admin/clients/${clientId}/logs`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ log_id: logId }),
      });
      const json = (await response.json()) as { error?: string };
      setSaving(false);
      if (!response.ok) return { error: json.error ?? "삭제에 실패했습니다." };
      await refresh();
      return { error: null };
    },
    [clientId, refresh, session?.access_token],
  );

  const updateGuide = useCallback(
    async (subNodeId: string, guideContent: string | null, guideLinks: GuideLink[]) => {
      if (!session?.access_token) return { error: "세션이 없습니다." };
      const response = await fetch(`/api/admin/clients/${clientId}/nodes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ kind: "guide_update", sub_node_id: subNodeId, guide_content: guideContent, guide_links: guideLinks }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) return { error: json.error ?? "가이드 저장에 실패했습니다." };
      await refresh();
      return { error: null };
    },
    [clientId, refresh, session?.access_token],
  );

  return useMemo(
    () => ({
      data,
      loading,
      error,
      saving,
      refresh,
      updateNodeStatus,
      toggleSubNode,
      createLog,
      updateLog,
      deleteLog,
      updateGuide,
    }),
    [createLog, data, deleteLog, error, loading, refresh, saving, toggleSubNode, updateLog, updateGuide, updateNodeStatus],
  );
}
