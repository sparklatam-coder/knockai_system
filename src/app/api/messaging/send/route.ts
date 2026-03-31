import { NextResponse } from "next/server";
import { getAdminRequestContext } from "@/lib/api-auth";

// POST /api/messaging/send
// 솔라피 API를 통한 메시지 발송
export async function POST(request: Request) {
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

  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const pfId = process.env.SOLAPI_PFID;
  const senderNumber = process.env.SOLAPI_SENDER_NUMBER;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "솔라피 API 키가 설정되지 않았습니다." }, { status: 503 });
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
    client_id: body.client_id,
    campaign_id: body.campaign_id || null,
    patient_id: r.patient_id,
    type: body.type,
    template_name: body.template_name || null,
    status: "success" as const, // Will be updated by webhook/polling
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

  return NextResponse.json({
    success: true,
    sent: body.recipients.length,
    solapi: solapiResult,
  });
}
