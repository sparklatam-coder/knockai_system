import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";

// GET /api/messaging/history?client_id=xxx&limit=50
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

  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);

  const { data, error } = await adminClient
    .from("messaging_logs")
    .select("*, patient:messaging_patients(name, phone)")
    .eq("client_id", clientId)
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
