import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";
import { createRateLimiter } from "@/lib/rate-limit";

// 1분에 최대 10건 발송 요청
const sendLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

// POST /api/messaging/send
// 솔라피 API를 통한 메시지 발송
export async function POST(request: Request) {
  const limited = sendLimiter.check(request, "messaging-send");
  if (limited) return limited;

  const adminContext = await getAdminRequestContext(request.headers.get("authorization"));
  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { adminClient } = adminContext;
  const body = await request.json() as {
    client_id: string;
    campaign_id?: string;
    recipients: { patient_id: string; phone: string; name: string }[];
    template_id?: string;
    template_name?: string;
    type: "alimtalk" | "friendtalk";
    variables?: Record<string, string>;
  };

  if (!body.recipients?.length) {
    return NextResponse.json({ error: "수신자가 없습니다." }, { status: 400 });
  }

  if (!body.client_id) {
    return NextResponse.json({ error: "client_id 필수" }, { status: 400 });
  }

  const clientId = await resolveClientId(adminClient, body.client_id);
  if (!clientId) {
    return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
  }

  // 병원별 솔라피 설정 조회
  const { data: client } = await adminClient
    .from("clients")
    .select("solapi_pfid, solapi_sender_number")
    .eq("id", clientId)
    .single();

  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const pfId = client?.solapi_pfid || process.env.SOLAPI_PFID;
  const senderNumber = client?.solapi_sender_number || process.env.SOLAPI_SENDER_NUMBER;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "솔라피 API 키가 설정되지 않았습니다." }, { status: 503 });
  }

  if (!pfId || !senderNumber) {
    return NextResponse.json({ error: "이 병원의 카카오 채널(PFID) 또는 발신번호가 설정되지 않았습니다. 고객 정보 수정에서 설정해주세요." }, { status: 400 });
  }

  // Build messages for solapi
  const messages = body.recipients.map((r) => {
    const msg: Record<string, unknown> = {
      to: r.phone.replace(/[^0-9]/g, ""),
      from: senderNumber,
    };

    if (body.type === "alimtalk") {
      msg.kakaoOptions = {
        pfId,
        templateId: body.template_id,
        variables: { ...body.variables, "#{고객명}": r.name },
      };
    } else {
      msg.kakaoOptions = {
        pfId,
      };
    }

    return msg;
  });

  // Send via solapi
  let solapiResult: Record<string, unknown> = {};
  try {
    // HMAC signature
    const timestamp = Date.now().toString();
    const salt = crypto.randomUUID();
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(apiSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(timestamp + salt),
    );
    const sigHex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const authHeader = `HMAC-SHA256 apiKey=${apiKey}, date=${timestamp}, salt=${salt}, signature=${sigHex}`;

    const res = await fetch("https://api.solapi.com/messages/v4/send-many", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ messages }),
    });

    solapiResult = await res.json() as Record<string, unknown>;
  } catch (err) {
    // Log send failure but continue to record in DB
    solapiResult = { error: String(err) };
  }

  // Record logs in DB
  const logs = body.recipients.map((r) => ({
    client_id: clientId,
    campaign_id: body.campaign_id || null,
    patient_id: r.patient_id,
    type: body.type,
    template_name: body.template_name || null,
    status: "pending" as const, // Will be updated by webhook/polling
    sent_at: new Date().toISOString(),
  }));

  await adminClient.from("messaging_logs").insert(logs);

  // Update campaign counts if applicable
  if (body.campaign_id) {
    const { data: campaign } = await adminClient
      .from("messaging_campaigns")
      .select("sent_count")
      .eq("id", body.campaign_id)
      .single();

    if (campaign) {
      await adminClient
        .from("messaging_campaigns")
        .update({
          sent_count: (campaign.sent_count ?? 0) + body.recipients.length,
          status: "sent",
        })
        .eq("id", body.campaign_id);
    }
  }

  const hasError = solapiResult.error || solapiResult.errorCode;

  return NextResponse.json({
    success: !hasError,
    sent: body.recipients.length,
  });
}
