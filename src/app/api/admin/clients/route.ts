import { NextResponse } from "next/server";
import { ALL_NODE_KEYS, DEFAULT_SUB_NODES } from "@/lib/constants";
import type {
  ClientCreateInput,
  ClientListItem,
  NodeKey,
  NodeRecord,
} from "@/lib/types";
import { getAdminRequestContext } from "@/lib/api-auth";
import { getSafeImageExtension } from "@/lib/security";

type RawClientInput = Partial<ClientCreateInput> & {
  package_tier?: string;
};

function normalizeInput(payload: RawClientInput): ClientCreateInput {
  return {
    name: payload.name?.trim() ?? "",
    region: payload.region?.trim() ?? "",
    contact_name: payload.contact_name?.trim() ?? "",
    contact_phone: payload.contact_phone?.trim() ?? "",
    contact_email: payload.contact_email?.trim() ?? "",
    package_tier:
      payload.package_tier === "standard" || payload.package_tier === "premium"
        ? payload.package_tier
        : "basic",
    contract_start: payload.contract_start?.trim() ?? "",
    login_email: payload.login_email?.trim() ?? "",
    memo: payload.memo?.trim() ?? "",
  };
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(request: Request) {
  const adminContext = await getAdminRequestContext(
    request.headers.get("authorization"),
  );

  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { adminClient } = adminContext;
  const { data: clients, error: clientsError } = await adminClient
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (clientsError) {
    return NextResponse.json({ error: clientsError.message }, { status: 500 });
  }

  const clientIds = (clients ?? []).map((client) => client.id);

  const [{ data: nodes, error: nodesError }, { data: activityLogs, error: logsError }] =
    await Promise.all([
      clientIds.length > 0
        ? adminClient
            .from("nodes")
            .select("client_id, node_key, status")
            .in("client_id", clientIds)
        : Promise.resolve({ data: [], error: null }),
      clientIds.length > 0
        ? adminClient
            .from("activity_logs")
            .select("client_id, created_at")
            .in("client_id", clientIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (nodesError || logsError) {
    return NextResponse.json(
      { error: nodesError?.message ?? logsError?.message ?? "데이터를 불러오지 못했습니다." },
      { status: 500 },
    );
  }

  const statusMap = new Map<string, Partial<Record<NodeKey, NodeRecord["status"]>>>();
  const lastActivityMap = new Map<string, string>();

  for (const node of nodes ?? []) {
    const current = statusMap.get(node.client_id) ?? {};
    current[node.node_key as NodeKey] = node.status;
    statusMap.set(node.client_id, current);
  }

  for (const log of activityLogs ?? []) {
    if (!lastActivityMap.has(log.client_id)) {
      lastActivityMap.set(log.client_id, log.created_at);
    }
  }

  const response: ClientListItem[] = (clients ?? []).map((client) => ({
    ...client,
    last_activity_at: lastActivityMap.get(client.id) ?? null,
    node_statuses: statusMap.get(client.id) ?? {},
  }));

  return NextResponse.json({ data: response });
}

export async function POST(request: Request) {
  const adminContext = await getAdminRequestContext(
    request.headers.get("authorization"),
  );

  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { adminClient } = adminContext;

  let payload: RawClientInput;
  let logoFile: File | null = null;

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const rawJson = formData.get("data") as string | null;
    logoFile = formData.get("logo") as File | null;

    try {
      payload = rawJson ? (JSON.parse(rawJson) as RawClientInput) : {};
    } catch {
      return badRequest("잘못된 요청 본문입니다.");
    }
  } else {
    try {
      payload = (await request.json()) as RawClientInput;
    } catch {
      return badRequest("잘못된 요청 본문입니다.");
    }
  }

  const input = normalizeInput(payload);

  if (!input.name) {
    return badRequest("병원명은 필수입니다.");
  }

  if (logoFile) {
    if (!logoFile.type.startsWith("image/")) {
      return badRequest("로고는 이미지 파일만 가능합니다.");
    }

    if (logoFile.size > 2 * 1024 * 1024) {
      return badRequest("로고 파일은 2MB 이하만 가능합니다.");
    }
  }

  let authUserId: string | null = null;

  if (input.login_email) {
    const siteOrigin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const inviteResult = await adminClient.auth.admin.inviteUserByEmail(input.login_email, {
      redirectTo: `${siteOrigin}/auth/callback`,
    });

    if (inviteResult.error) {
      return NextResponse.json({ error: inviteResult.error.message }, { status: 400 });
    }

    authUserId = inviteResult.data.user?.id ?? null;

    // Set role in app_metadata (not user_metadata, which is user-editable)
    if (authUserId) {
      await adminClient.auth.admin.updateUserById(authUserId, {
        app_metadata: { role: "client" },
      });
    }
  }

  let logoUrl: string | null = null;

  if (logoFile) {
    const ext = getSafeImageExtension(logoFile.name);
    if (!ext) {
      return badRequest("허용되지 않는 파일 형식입니다. (jpg, png, gif, webp만 가능)");
    }
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

    logoUrl = urlData.publicUrl;
  }

  const { data: createdClient, error: createClientError } = await adminClient
    .from("clients")
    .insert({
      name: input.name,
      region: input.region || null,
      contact_name: input.contact_name || null,
      contact_phone: input.contact_phone || null,
      contact_email: input.contact_email || input.login_email || null,
      package_tier: input.package_tier,
      contract_start: input.contract_start || null,
      auth_user_id: authUserId,
      logo_url: logoUrl,
      memo: input.memo || null,
    })
    .select("*")
    .single();

  if (createClientError || !createdClient) {
    return NextResponse.json(
      { error: createClientError?.message ?? "고객 생성에 실패했습니다." },
      { status: 500 },
    );
  }

  const nodeRows = ALL_NODE_KEYS.map((nodeKey) => ({
    client_id: createdClient.id,
    node_key: nodeKey,
    status: "inactive",
  }));

  const subNodeRows = ALL_NODE_KEYS.flatMap((nodeKey) =>
    DEFAULT_SUB_NODES[nodeKey].map((label, index) => ({
      client_id: createdClient.id,
      node_key: nodeKey,
      label,
      sort_order: index + 1,
    })),
  );

  const [{ error: nodeInsertError }, { error: subNodeInsertError }] = await Promise.all([
    adminClient.from("nodes").insert(nodeRows),
    adminClient.from("sub_nodes").insert(subNodeRows),
  ]);

  if (nodeInsertError || subNodeInsertError) {
    return NextResponse.json(
      {
        error:
          nodeInsertError?.message ??
          subNodeInsertError?.message ??
          "초기 노드 생성에 실패했습니다.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: createdClient }, { status: 201 });
}
