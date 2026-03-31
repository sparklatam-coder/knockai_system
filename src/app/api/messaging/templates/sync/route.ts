import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";
import { getSolapiAuthHeader, mapSolapiStatus } from "@/lib/solapi";

// POST /api/messaging/templates/sync?client_id=xxx
// 솔라피에서 템플릿 목록을 가져와 DB 상태를 동기화
export async function POST(request: Request) {
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

  // 병원의 PFID 조회
  const { data: client } = await adminClient
    .from("clients")
    .select("solapi_pfid")
    .eq("id", clientId)
    .single();

  if (!client?.solapi_pfid) {
    return NextResponse.json({ error: "이 병원의 카카오 채널(PFID)이 설정되지 않았습니다." }, { status: 400 });
  }

  const authHeader = await getSolapiAuthHeader();
  if (!authHeader) {
    return NextResponse.json({ error: "솔라피 API 키가 설정되지 않았습니다." }, { status: 503 });
  }

  // 솔라피에서 템플릿 목록 조회
  type SolapiTemplate = { templateId: string; name: string; content: string; status: string; buttons?: { name: string; linkMo?: string; linkPc?: string }[]; messageType?: string };
  let solapiTemplates: SolapiTemplate[] = [];
  let rawResponse: unknown = null;
  try {
    // pfId 없이 전체 조회 후 필터링
    const res = await fetch("https://api.solapi.com/kakao/v2/templates", {
      headers: { Authorization: authHeader },
    });
    rawResponse = await res.json();

    // 솔라피 응답이 배열일 수도, { templateList: [] }일 수도 있음
    if (Array.isArray(rawResponse)) {
      solapiTemplates = rawResponse as SolapiTemplate[];
    } else if (rawResponse && typeof rawResponse === "object") {
      const obj = rawResponse as Record<string, unknown>;
      if (Array.isArray(obj.templateList)) {
        solapiTemplates = obj.templateList as SolapiTemplate[];
      } else if (Array.isArray(obj.data)) {
        solapiTemplates = obj.data as SolapiTemplate[];
      }
    }
  } catch (err) {
    return NextResponse.json({ error: "솔라피 API 호출 실패", detail: String(err) }, { status: 502 });
  }

  // 해당 병원 PFID로 필터링
  const pfId = client.solapi_pfid;
  const beforeFilter = solapiTemplates.length;
  solapiTemplates = solapiTemplates.filter(
    (t) => !pfId || (t as unknown as Record<string, unknown>).pfId === pfId || (t as unknown as Record<string, unknown>).channelId === pfId,
  );

  // 템플릿을 못 가져온 경우 디버깅용 rawResponse 반환
  if (solapiTemplates.length === 0) {
    return NextResponse.json({
      success: true,
      total: 0,
      synced: 0,
      created: 0,
      debug: { pfId: client.solapi_pfid, rawResponse },
    });
  }

  // DB의 기존 템플릿 조회
  const { data: dbTemplates } = await adminClient
    .from("messaging_templates")
    .select("id, solapi_template_id, status")
    .eq("client_id", clientId);

  const existingMap = new Map(
    (dbTemplates ?? [])
      .filter((t: { solapi_template_id: string | null }) => t.solapi_template_id)
      .map((t: { solapi_template_id: string | null; id: string; status: string }) => [t.solapi_template_id, t]),
  );

  let synced = 0;
  let created = 0;

  for (const st of solapiTemplates) {
    const mappedStatus = mapSolapiStatus(st.status);
    const existing = existingMap.get(st.templateId);

    if (existing) {
      // 상태가 다르면 업데이트
      if ((existing as { status: string }).status !== mappedStatus) {
        await adminClient
          .from("messaging_templates")
          .update({ status: mappedStatus })
          .eq("id", (existing as { id: string }).id);
        synced++;
      }
    } else {
      // 새 템플릿 → DB에 추가
      const btn = st.buttons?.[0];
      const msgType = st.messageType;
      let subtype = "기본형";
      if (msgType === "AD") subtype = "채널추가형";
      else if (msgType === "MI") subtype = "복합형";
      else if (msgType === "EX") subtype = "부가정보형";

      await adminClient.from("messaging_templates").insert({
        client_id: clientId,
        name: st.name,
        type: "alimtalk",
        subtype,
        status: mappedStatus,
        body: st.content,
        button_name: btn?.name ?? null,
        button_url: btn?.linkMo ?? btn?.linkPc ?? null,
        solapi_template_id: st.templateId,
      });
      created++;
    }
  }

  return NextResponse.json({
    success: true,
    total: solapiTemplates.length,
    synced,
    created,
  });
}
