import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";
import type { MsgType, MsgTemplateStatus } from "@/lib/types";

const VALID_TYPES: MsgType[] = ["alimtalk", "friendtalk"];
const VALID_STATUSES: MsgTemplateStatus[] = ["draft", "review", "approved", "rejected"];

// GET /api/messaging/templates?client_id=xxx
export async function GET(request: Request) {
  const adminContext = await getAdminRequestContext(request.headers.get("authorization"));
  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { adminClient } = adminContext;
  const url = new URL(request.url);
  const rawClientId = url.searchParams.get("client_id");
  if (!rawClientId) return NextResponse.json({ error: "client_id 필수" }, { status: 400 });

  const clientId = await resolveClientId(adminClient, rawClientId);
  if (!clientId) return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });

  const { data, error } = await adminClient
    .from("messaging_templates")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) { console.error("[templates]", error.message); return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 }); }
  return NextResponse.json({ data });
}

// POST /api/messaging/templates
export async function POST(request: Request) {
  const adminContext = await getAdminRequestContext(request.headers.get("authorization"));
  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { adminClient } = adminContext;
  const body = await request.json() as Record<string, unknown>;

  const clientId = typeof body.client_id === "string" ? body.client_id : "";
  const resolved = await resolveClientId(adminClient, clientId);
  if (!resolved) return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" && VALID_TYPES.includes(body.type as MsgType) ? body.type : "";
  const bodyText = typeof body.body === "string" ? body.body.trim() : "";

  if (!name || !type || !bodyText) {
    return NextResponse.json({ error: "이름, 유형, 본문은 필수입니다." }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("messaging_templates")
    .insert({
      client_id: resolved,
      name,
      type,
      subtype: typeof body.subtype === "string" ? body.subtype : null,
      status: "draft",
      body: bodyText,
      button_name: typeof body.button_name === "string" ? body.button_name : null,
      button_url: typeof body.button_url === "string" ? body.button_url : null,
    })
    .select("*")
    .single();

  if (error) { console.error("[templates]", error.message); return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 }); }
  return NextResponse.json({ data }, { status: 201 });
}

// PATCH /api/messaging/templates  (update by id in body)
export async function PATCH(request: Request) {
  const adminContext = await getAdminRequestContext(request.headers.get("authorization"));
  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { adminClient } = adminContext;
  const body = await request.json() as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  const rawClientId = typeof body.client_id === "string" ? body.client_id : "";
  if (!rawClientId) return NextResponse.json({ error: "client_id 필수" }, { status: 400 });
  const clientId = await resolveClientId(adminClient, rawClientId);
  if (!clientId) return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.type === "string" && VALID_TYPES.includes(body.type as MsgType)) updates.type = body.type;
  if (typeof body.subtype === "string") updates.subtype = body.subtype;
  if (typeof body.status === "string" && VALID_STATUSES.includes(body.status as MsgTemplateStatus)) updates.status = body.status;
  if (typeof body.body === "string") updates.body = body.body;
  if (typeof body.button_name === "string") updates.button_name = body.button_name;
  if (typeof body.button_url === "string") updates.button_url = body.button_url;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "변경할 항목이 없습니다." }, { status: 400 });
  }

  const { error } = await adminClient
    .from("messaging_templates")
    .update(updates)
    .eq("id", id)
    .eq("client_id", clientId);

  if (error) { console.error("[templates]", error.message); return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 }); }
  return NextResponse.json({ success: true });
}
