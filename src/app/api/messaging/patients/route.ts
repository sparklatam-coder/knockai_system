import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";

// GET /api/messaging/patients?client_id=xxx
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
    .from("messaging_patients")
    .select("*")
    .eq("client_id", clientId)
    .order("last_visit", { ascending: false, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/messaging/patients  (single or CSV bulk)
export async function POST(request: Request) {
  const adminContext = await getAdminRequestContext(request.headers.get("authorization"));
  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { adminClient } = adminContext;
  const contentType = request.headers.get("content-type") ?? "";

  // CSV upload
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const clientId = formData.get("client_id") as string | null;
    const file = formData.get("file") as File | null;

    if (!clientId || !file) {
      return NextResponse.json({ error: "client_id와 파일이 필요합니다." }, { status: 400 });
    }

    const resolved = await resolveClientId(adminClient, clientId);
    if (!resolved) return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: "유효한 데이터가 없습니다." }, { status: 400 });
    }

    const patients = rows.map((row) => ({
      client_id: resolved,
      name: row.name,
      phone: normalizePhone(row.phone),
      last_visit: row.last_visit || null,
      treatment: row.treatment || null,
      is_channel_friend: false,
      patient_group: row.last_visit ? classifyGroup(row.last_visit) : null,
    }));

    const { data, error } = await adminClient
      .from("messaging_patients")
      .upsert(patients, { onConflict: "client_id,phone" })
      .select("*");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, count: data?.length ?? 0 }, { status: 201 });
  }

  // Single patient JSON
  const body = await request.json() as Record<string, unknown>;
  const clientId = typeof body.client_id === "string" ? body.client_id : "";
  const resolved = await resolveClientId(adminClient, clientId);
  if (!resolved) return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? normalizePhone(body.phone) : "";
  if (!name || !phone) return NextResponse.json({ error: "환자명과 전화번호는 필수입니다." }, { status: 400 });

  const lastVisit = typeof body.last_visit === "string" ? body.last_visit : null;

  const { data, error } = await adminClient
    .from("messaging_patients")
    .upsert({
      client_id: resolved,
      name,
      phone,
      last_visit: lastVisit,
      treatment: typeof body.treatment === "string" ? body.treatment : null,
      is_channel_friend: body.is_channel_friend === true,
      patient_group: lastVisit ? classifyGroup(lastVisit) : null,
    }, { onConflict: "client_id,phone" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

/* ── helpers ── */

function normalizePhone(raw: string): string {
  return raw.replace(/[^0-9]/g, "").replace(/^82/, "0");
}

function classifyGroup(lastVisit: string): string {
  const months = (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months <= 6) return "6m";
  if (months <= 12) return "1y";
  if (months <= 24) return "2y";
  return "2y+";
}

function parseCSV(text: string): { name: string; phone: string; last_visit: string; treatment: string }[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = header.findIndex((h) => h.includes("환자") || h.includes("이름") || h === "name");
  const phoneIdx = header.findIndex((h) => h.includes("전화") || h.includes("연락") || h.includes("phone"));
  const visitIdx = header.findIndex((h) => h.includes("내원") || h.includes("방문") || h.includes("visit") || h.includes("date"));
  const treatIdx = header.findIndex((h) => h.includes("진료") || h.includes("치료") || h.includes("treatment"));

  if (nameIdx === -1 || phoneIdx === -1) return [];

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return {
      name: cols[nameIdx] ?? "",
      phone: cols[phoneIdx] ?? "",
      last_visit: visitIdx >= 0 ? cols[visitIdx] ?? "" : "",
      treatment: treatIdx >= 0 ? cols[treatIdx] ?? "" : "",
    };
  }).filter((r) => r.name && r.phone);
}
