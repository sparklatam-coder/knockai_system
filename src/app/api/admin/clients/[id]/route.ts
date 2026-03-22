import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";
import type { ClientDashboardData } from "@/lib/types";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const adminContext = await getAdminRequestContext(
    request.headers.get("authorization"),
  );

  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { id: rawId } = await context.params;
  const { adminClient } = adminContext;

  const clientId = await resolveClientId(adminClient, rawId);
  if (!clientId) {
    return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
  }

  const [clientResult, nodesResult, subNodesResult, logsResult] = await Promise.all([
    adminClient.from("clients").select("*").eq("id", clientId).single(),
    adminClient.from("nodes").select("*").eq("client_id", clientId).order("node_key"),
    adminClient
      .from("sub_nodes")
      .select("*")
      .eq("client_id", clientId)
      .order("sort_order"),
    adminClient
      .from("activity_logs")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
  ]);

  if (clientResult.error || nodesResult.error || subNodesResult.error || logsResult.error) {
    return NextResponse.json(
      {
        error:
          clientResult.error?.message ??
          nodesResult.error?.message ??
          subNodesResult.error?.message ??
          logsResult.error?.message ??
          "고객 상세를 불러오지 못했습니다.",
      },
      { status: 500 },
    );
  }

  const response: ClientDashboardData = {
    client: clientResult.data,
    nodes: nodesResult.data ?? [],
    subNodes: subNodesResult.data ?? [],
    activityLogs: logsResult.data ?? [],
  };

  return NextResponse.json({ data: response });
}
