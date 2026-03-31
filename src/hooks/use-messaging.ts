"use client";

import { useState, useEffect, useCallback } from "react";
import type { MsgPatient, MsgTemplate, MsgCampaign, MsgLog } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

interface UseMessagingReturn {
  patients: MsgPatient[];
  templates: MsgTemplate[];
  campaigns: MsgCampaign[];
  logs: MsgLog[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  uploadCSV: (file: File) => Promise<{ error: string | null; count?: number }>;
  createTemplate: (tpl: Partial<MsgTemplate>) => Promise<{ error: string | null }>;
  updateTemplate: (id: string, fields: Partial<MsgTemplate>) => Promise<{ error: string | null }>;
  createCampaign: (camp: Partial<MsgCampaign>) => Promise<{ error: string | null }>;
  updateCampaign: (id: string, fields: Partial<MsgCampaign>) => Promise<{ error: string | null }>;
  sendCampaign: (campaignId: string, recipients: { patient_id: string; phone: string; name: string }[], templateName: string, type: string) => Promise<{ error: string | null }>;
  syncTemplates: () => Promise<{ error: string | null; synced?: number; created?: number; total?: number; debug?: unknown }>;
}

export function useMessaging(clientId: string): UseMessagingReturn {
  const { session } = useAuth();
  const [patients, setPatients] = useState<MsgPatient[]>([]);
  const [templates, setTemplates] = useState<MsgTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<MsgCampaign[]>([]);
  const [logs, setLogs] = useState<MsgLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = session?.access_token ?? "";

  const headers = useCallback(
    (json = true): HeadersInit => {
      const h: HeadersInit = { Authorization: `Bearer ${token}` };
      if (json) h["Content-Type"] = "application/json";
      return h;
    },
    [token],
  );

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [pRes, tRes, cRes, lRes] = await Promise.all([
        fetch(`/api/messaging/patients?client_id=${clientId}`, { headers: headers() }),
        fetch(`/api/messaging/templates?client_id=${clientId}`, { headers: headers() }),
        fetch(`/api/messaging/campaigns?client_id=${clientId}`, { headers: headers() }),
        fetch(`/api/messaging/history?client_id=${clientId}&limit=50`, { headers: headers() }),
      ]);

      const [pJson, tJson, cJson, lJson] = await Promise.all([
        pRes.json() as Promise<{ data?: MsgPatient[]; error?: string }>,
        tRes.json() as Promise<{ data?: MsgTemplate[]; error?: string }>,
        cRes.json() as Promise<{ data?: MsgCampaign[]; error?: string }>,
        lRes.json() as Promise<{ data?: MsgLog[]; error?: string }>,
      ]);

      if (pJson.error || tJson.error || cJson.error || lJson.error) {
        setError(pJson.error || tJson.error || cJson.error || lJson.error || "데이터를 불러올 수 없습니다.");
      }

      setPatients(pJson.data ?? []);
      setTemplates(tJson.data ?? []);
      setCampaigns(cJson.data ?? []);
      setLogs(lJson.data ?? []);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, [clientId, token, headers]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const uploadCSV = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("client_id", clientId);
      formData.append("file", file);

      const res = await fetch("/api/messaging/patients", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json() as { error?: string; count?: number };
      if (!res.ok) return { error: json.error ?? "업로드 실패" };
      await refresh();
      return { error: null, count: json.count };
    },
    [clientId, token, refresh],
  );

  const createTemplate = useCallback(
    async (tpl: Partial<MsgTemplate>) => {
      const res = await fetch("/api/messaging/templates", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ ...tpl, client_id: clientId }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) return { error: json.error ?? "템플릿 생성 실패" };
      await refresh();
      return { error: null };
    },
    [clientId, headers, refresh],
  );

  const updateTemplate = useCallback(
    async (id: string, fields: Partial<MsgTemplate>) => {
      const res = await fetch("/api/messaging/templates", {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ ...fields, id }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) return { error: json.error ?? "템플릿 수정 실패" };
      await refresh();
      return { error: null };
    },
    [headers, refresh],
  );

  const createCampaign = useCallback(
    async (camp: Partial<MsgCampaign>) => {
      const res = await fetch("/api/messaging/campaigns", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ ...camp, client_id: clientId }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) return { error: json.error ?? "캠페인 생성 실패" };
      await refresh();
      return { error: null };
    },
    [clientId, headers, refresh],
  );

  const updateCampaign = useCallback(
    async (id: string, fields: Partial<MsgCampaign>) => {
      const res = await fetch("/api/messaging/campaigns", {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ ...fields, id }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) return { error: json.error ?? "캠페인 수정 실패" };
      await refresh();
      return { error: null };
    },
    [headers, refresh],
  );

  const sendCampaign = useCallback(
    async (
      campaignId: string,
      recipients: { patient_id: string; phone: string; name: string }[],
      templateName: string,
      type: string,
    ) => {
      const res = await fetch("/api/messaging/send", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          client_id: clientId,
          campaign_id: campaignId,
          recipients,
          template_name: templateName,
          type,
        }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) return { error: json.error ?? "발송 실패" };
      await refresh();
      return { error: null };
    },
    [clientId, headers, refresh],
  );

  const syncTemplates = useCallback(
    async () => {
      const res = await fetch(`/api/messaging/templates/sync?client_id=${clientId}`, {
        method: "POST",
        headers: headers(),
      });
      const json = await res.json() as { error?: string; synced?: number; created?: number; total?: number; debug?: unknown };
      if (!res.ok) return { error: json.error ?? "동기화 실패" };
      await refresh();
      return { error: null, synced: json.synced, created: json.created, total: json.total, debug: json.debug };
    },
    [clientId, headers, refresh],
  );

  return {
    patients,
    templates,
    campaigns,
    logs,
    loading,
    error,
    refresh,
    uploadCSV,
    createTemplate,
    updateTemplate,
    createCampaign,
    updateCampaign,
    sendCampaign,
    syncTemplates,
  };
}
