import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";
import { createRateLimiter } from "@/lib/rate-limit";

// 15분에 최대 5회 비밀번호 재설정
const resetLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 5 });

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const limited = resetLimiter.check(request, "reset-password");
  if (limited) return limited;

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
    .select("auth_user_id, contact_email")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "고객 정보를 불러올 수 없습니다." }, { status: 400 });
  }

  const body = await request.json() as { password?: string };
  const password = typeof body.password === "string" ? body.password.trim() : "";

  if (password.length < 8) {
    return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  const email = client.contact_email?.trim();

  // If no auth user linked, create one
  if (!client.auth_user_id) {
    if (!email) {
      return NextResponse.json({ error: "고객 이메일이 등록되어 있지 않습니다." }, { status: 400 });
    }

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "client" },
    });

    if (createError) {
      return NextResponse.json({ error: `계정 생성 실패: ${createError.message}` }, { status: 500 });
    }

    // Link auth user to client
    await adminClient
      .from("clients")
      .update({ auth_user_id: newUser.user.id })
      .eq("id", clientId);

    return NextResponse.json({ success: true, created: true });
  }

  // Auth user exists — update password, sync email, and ensure confirmed
  const updatePayload: Record<string, unknown> = {
    password,
    email_confirm: true,
  };

  // Sync email if client's contact_email differs from auth user's email
  if (email) {
    updatePayload.email = email;
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    client.auth_user_id,
    updatePayload,
  );

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
