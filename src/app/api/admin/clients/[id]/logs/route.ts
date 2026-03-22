import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";
import type { ActionType } from "@/lib/types";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface CreateLogPayload {
  node_key: string;
  action_type: ActionType;
  content: string;
  visible_to_client: boolean;
}

export async function PATCH(request: Request, context: RouteContext) {
  const adminContext = await getAdminRequestContext(request.headers.get("authorization"));
  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { id: rawId } = await context.params;
  const { adminClient } = adminContext;
  const id = await resolveClientId(adminClient, rawId);
  if (!id) return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });

  let payload: { log_id: string; content: string; visible_to_client: boolean };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (!payload.content.trim()) {
    return NextResponse.json({ error: "내용은 필수입니다." }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("activity_logs")
    .update({ content: payload.content.trim(), visible_to_client: payload.visible_to_client })
    .eq("id", payload.log_id)
    .eq("client_id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request, context: RouteContext) {
  const adminContext = await getAdminRequestContext(request.headers.get("authorization"));
  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { id: rawId } = await context.params;
  const { adminClient } = adminContext;
  const id = await resolveClientId(adminClient, rawId);
  if (!id) return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });

  let payload: { log_id: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  const { error } = await adminClient
    .from("activity_logs")
    .delete()
    .eq("id", payload.log_id)
    .eq("client_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, context: RouteContext) {
  const adminContext = await getAdminRequestContext(
    request.headers.get("authorization"),
  );

  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { id: rawId2 } = await context.params;
  const { adminClient, user } = adminContext;
  const id = await resolveClientId(adminClient, rawId2);
  if (!id) return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });

  let payload: CreateLogPayload;

  try {
    payload = (await request.json()) as CreateLogPayload;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (!payload.content.trim()) {
    return NextResponse.json({ error: "로그 내용은 필수입니다." }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("activity_logs")
    .insert({
      client_id: id,
      node_key: payload.node_key,
      action_type: payload.action_type,
      content: payload.content.trim(),
      visible_to_client: payload.visible_to_client,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
