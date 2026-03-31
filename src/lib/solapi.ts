// 솔라피 API 인증 헬퍼

export async function getSolapiAuthHeader(): Promise<string | null> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  if (!apiKey || !apiSecret) return null;

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

  return `HMAC-SHA256 apiKey=${apiKey}, date=${timestamp}, salt=${salt}, signature=${sigHex}`;
}

// 솔라피 status → 우리 status 매핑
const STATUS_MAP: Record<string, string> = {
  PENDING: "draft",
  INSPECTING: "review",
  APPROVED: "approved",
  REJECTED: "rejected",
  DORMANT: "rejected",
};

export function mapSolapiStatus(solapiStatus: string): string {
  return STATUS_MAP[solapiStatus] ?? "draft";
}
