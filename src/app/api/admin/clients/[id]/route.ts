import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";
import type { ClientDashboardData, PackageTier } from "@/lib/types";

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

const VALID_TIERS: PackageTier[] = ["entry", "basic", "standard", "premium", "platinum"];

export async function PATCH(request: Request, context: RouteContext) {
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

  let body: Record<string, unknown>;
  let logoFile: File | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const rawJson = formData.get("data") as string | null;
    logoFile = formData.get("logo") as File | null;
    try {
      body = rawJson ? JSON.parse(rawJson) : {};
    } catch {
      return NextResponse.json({ error: "잘못된 데이터입니다." }, { status: 400 });
    }
  } else {
    body = await request.json() as Record<string, unknown>;
  }

  const updates: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.region === "string") updates.region = body.region.trim() || null;
  if (typeof body.contact_name === "string") updates.contact_name = body.contact_name.trim() || null;
  if (typeof body.contact_phone === "string") updates.contact_phone = body.contact_phone.trim() || null;
  if (typeof body.contact_email === "string") updates.contact_email = body.contact_email.trim() || null;
  if (typeof body.memo === "string") updates.memo = body.memo.trim() || null;
  if (typeof body.contract_start === "string") updates.contract_start = body.contract_start.trim() || null;
  if (typeof body.solapi_pfid === "string") updates.solapi_pfid = body.solapi_pfid.trim() || null;
  if (typeof body.solapi_sender_number === "string") updates.solapi_sender_number = body.solapi_sender_number.trim() || null;

  if (typeof body.package_tier === "string" && VALID_TIERS.includes(body.package_tier as PackageTier)) {
    updates.package_tier = body.package_tier;
  }

  // Handle logo upload
  if (logoFile) {
    if (!logoFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "로고는 이미지 파일만 가능합니다." }, { status: 400 });
    }
    if (logoFile.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "로고 파일은 2MB 이하만 가능합니다." }, { status: 400 });
    }
    const ext = logoFile.name.split(".").pop() ?? "png";
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const arrayBuffer = await logoFile.arrayBuffer();

    const { error: uploadError } = await adminClient.storage
      .from("client-logos")
      .upload(fileName, Buffer.from(arrayBuffer), {
        contentType: logoFile.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `로고 업로드 실패: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = adminClient.storage
      .from("client-logos")
      .getPublicUrl(fileName);

    updates.logo_url = urlData.publicUrl;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "변경할 항목이 없습니다." }, { status: 400 });
  }

  const { error } = await adminClient
    .from("clients")
    .update(updates)
    .eq("id", clientId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
