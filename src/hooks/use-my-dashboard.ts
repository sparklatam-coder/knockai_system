"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { ActivityLog, Client, NodeRecord } from "@/lib/types";

interface MyDashboardData {
  client: Client | null;
  nodes: NodeRecord[];
  logs: ActivityLog[];
}

export function useMyDashboard() {
  const { configured, isAuthenticated, user } = useAuth();
  const [data, setData] = useState<MyDashboardData>({
    client: null,
    nodes: [],
    logs: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function load() {
      if (!configured || !isAuthenticated || !user || !supabase) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const clientResult = await supabase
        .from("clients")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (clientResult.error) {
        setError(clientResult.error.message);
        setLoading(false);
        return;
      }

      const client = clientResult.data;

      if (!client) {
        setData({ client: null, nodes: [], logs: [] });
        setLoading(false);
        return;
      }

      const [nodesResult, logsResult] = await Promise.all([
        supabase.from("nodes").select("*").eq("client_id", client.id),
        supabase
          .from("activity_logs")
          .select("*")
          .eq("client_id", client.id)
          .eq("visible_to_client", true)
          .order("created_at", { ascending: false }),
      ]);

      if (nodesResult.error || logsResult.error) {
        setError(nodesResult.error?.message ?? logsResult.error?.message ?? "불러오기 실패");
      } else {
        setData({
          client,
          nodes: nodesResult.data ?? [],
          logs: logsResult.data ?? [],
        });
      }

      setLoading(false);
    }

    void load();
  }, [configured, isAuthenticated, user]);

  return useMemo(
    () => ({
      data,
      loading,
      error,
    }),
    [data, error, loading],
  );
}
