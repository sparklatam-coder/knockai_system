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

interface GuideUpdatePayload {
  kind: "guide_update";
  sub_node_id: string;
  guide_content: string | null;
  guide_links: { label: string; url: string }[];
}

type RequestPayload = NodeStatusUpdatePayload | SubNodeTogglePayload | GuideUpdatePayload;

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
      console.error("[nodes]", error.message); return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  if (payload.kind === "guide_update") {
    if (user.app_metadata?.role !== "super_admin") {
      return NextResponse.json({ error: "가이드 수정은 슈퍼관리자만 가능합니다." }, { status: 403 });
    }

    const links = Array.isArray(payload.guide_links) ? payload.guide_links : [];
    const { data: guideData, error: guideError } = await adminClient
      .from("sub_nodes")
      .update({
        guide_content: payload.guide_content?.trim() || null,
        guide_links: links,
      })
      .eq("id", payload.sub_node_id)
      .eq("client_id", id)
      .select("*")
      .single();

    if (guideError) {
      return NextResponse.json({ error: guideError.message }, { status: 500 });
    }

    return NextResponse.json({ data: guideData });
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
    console.error("[nodes]", error.message); return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ data });
}
