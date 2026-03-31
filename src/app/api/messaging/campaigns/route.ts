import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";
import type { MsgType, MsgCampaignStatus } from "@/lib/types";

const VALID_TYPES: MsgType[] = ["alimtalk", "friendtalk"];
const VALID_STATUSES: MsgCampaignStatus[] = ["draft", "scheduled", "sending", "sent", "cancelled"];

// GET /api/messaging/campaigns?client_id=xxx
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
    .from("messaging_campaigns")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/messaging/campaigns
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
  if (!name || !type) {
    return NextResponse.json({ error: "캠페인 이름과 유형은 필수입니다." }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("messaging_campaigns")
    .insert({
      client_id: resolved,
      name,
      template_id: typeof body.template_id === "string" ? body.template_id : null,
      type,
      target_group: typeof body.target_group === "string" ? body.target_group : null,
      target_count: typeof body.target_count === "number" ? body.target_count : 0,
      scheduled_at: typeof body.scheduled_at === "string" ? body.scheduled_at : null,
      status: "draft",
      wave: typeof body.wave === "number" ? body.wave : null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

// PATCH /api/messaging/campaigns
export async function PATCH(request: Request) {
  const adminContext = await getAdminRequestContext(request.headers.get("authorization"));
  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { adminClient } = adminContext;
  const body = await request.json() as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.type === "string" && VALID_TYPES.includes(body.type as MsgType)) updates.type = body.type;
  if (typeof body.template_id === "string") updates.template_id = body.template_id;
  if (typeof body.target_group === "string") updates.target_group = body.target_group;
  if (typeof body.target_count === "number") updates.target_count = body.target_count;
  if (typeof body.scheduled_at === "string") updates.scheduled_at = body.scheduled_at;
  if (typeof body.status === "string" && VALID_STATUSES.includes(body.status as MsgCampaignStatus)) updates.status = body.status;
  if (typeof body.wave === "number") updates.wave = body.wave;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "변경할 항목이 없습니다." }, { status: 400 });
  }

  const { error } = await adminClient
    .from("messaging_campaigns")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/messaging/campaigns
export async function DELETE(request: Request) {
  const adminContext = await getAdminRequestContext(request.headers.get("authorization"));
  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { adminClient } = adminContext;
  const body = await request.json() as { id?: string };
  if (!body.id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  const { error } = await adminClient
    .from("messaging_campaigns")
    .delete()
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
