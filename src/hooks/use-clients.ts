"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { ClientCreateInput, ClientListItem } from "@/lib/types";

interface UseClientsResult {
  clients: ClientListItem[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  createClient: (input: ClientCreateInput) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

async function parseApiResponse<T>(response: Response): Promise<{
  data: T | null;
  error: string | null;
}> {
  const json = (await response.json()) as { data?: T; error?: string };

  return {
    data: json.data ?? null,
    error: response.ok ? null : (json.error ?? "요청에 실패했습니다."),
  };
}

export function useClients(): UseClientsResult {
  const { configured, isAuthenticated, role, session } = useAuth();
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = session?.access_token ?? null;

  const refresh = useCallback(async () => {
    if (!configured || !isAuthenticated || role !== "admin" || !accessToken) {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/clients", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const result = await parseApiResponse<ClientListItem[]>(response);

    if (result.error) {
      setError(result.error);
      setClients([]);
    } else {
      setClients(result.data ?? []);
    }

    setLoading(false);
  }, [accessToken, configured, isAuthenticated, role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createClient = useCallback(
    async (input: ClientCreateInput) => {
      if (!accessToken) {
        return { error: "세션이 없습니다." };
      }

      setCreating(true);
      setError(null);

      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(input),
      });

      const result = await parseApiResponse<ClientListItem>(response);

      setCreating(false);

      if (result.error) {
        setError(result.error);
        return { error: result.error };
      }

      await refresh();

      return { error: null };
    },
    [accessToken, refresh],
  );

  return useMemo(
    () => ({
      clients,
      loading,
      error,
      creating,
      createClient,
      refresh,
    }),
    [clients, createClient, creating, error, loading, refresh],
  );
}
