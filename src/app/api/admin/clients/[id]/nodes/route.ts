import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";
import type { NodeStatus } from "@/lib/types";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface NodeStatusUpdatePayload {
  kind: "node_status";
  node_key: string;
  status: NodeStatus;
}

interface SubNodeTogglePayload {
  kind: "sub_node_toggle";
  sub_node_id: string;
  is_done: boolean;
}

type RequestPayload = NodeStatusUpdatePayload | SubNodeTogglePayload;

export async function PATCH(request: Request, context: RouteContext) {
  const adminContext = await getAdminRequestContext(
    request.headers.get("authorization"),
  );

  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { id: rawId } = await context.params;
  const { adminClient, user } = adminContext;

  const id = await resolveClientId(adminClient, rawId);
  if (!id) {
    return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
  }

  let payload: RequestPayload;

  try {
    payload = (await request.json()) as RequestPayload;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (payload.kind === "node_status") {
    const { data, error } = await adminClient
      .from("nodes")
      .update({
        status: payload.status,
        updated_by: user.id,
      })
      .eq("client_id", id)
      .eq("node_key", payload.node_key)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  const { data, error } = await adminClient
    .from("sub_nodes")
    .update({
      is_done: payload.is_done,
      done_at: payload.is_done ? new Date().toISOString() : null,
    })
    .eq("id", payload.sub_node_id)
    .eq("client_id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
