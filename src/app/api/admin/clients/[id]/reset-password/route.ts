import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
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

  const { data: client, error: clientError } = await adminClient
    .from("clients")
    .select("auth_user_id")
    .eq("id", clientId)
    .single();

  if (clientError || !client?.auth_user_id) {
    return NextResponse.json({ error: "연결된 로그인 계정이 없습니다." }, { status: 400 });
  }

  const body = await request.json() as { password?: string };
  const password = typeof body.password === "string" ? body.password.trim() : "";

  if (password.length < 8) {
    return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    client.auth_user_id,
    { password },
  );

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
