import { NextResponse } from "next/server";
import { getAdminRequestContext, resolveClientId } from "@/lib/api-auth";
import { getSafeImageExtension } from "@/lib/security";

export async function POST(request: Request) {
  const adminContext = await getAdminRequestContext(request.headers.get("authorization"));
  if ("error" in adminContext) {
    return NextResponse.json({ error: adminContext.error }, { status: adminContext.status });
  }

  const { adminClient } = adminContext;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const clientId = formData.get("client_id") as string | null;

  if (!file || !clientId) {
    return NextResponse.json({ error: "file과 client_id는 필수입니다." }, { status: 400 });
  }

  const resolvedClientId = await resolveClientId(adminClient, clientId);
  if (!resolvedClientId) {
    return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "파일 크기는 5MB 이하만 가능합니다." }, { status: 400 });
  }

  const ext = getSafeImageExtension(file.name);
  if (!ext) {
    return NextResponse.json({ error: "허용되지 않는 파일 형식입니다. (jpg, png, gif, webp만 가능)" }, { status: 400 });
  }
  const fileName = `${resolvedClientId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await adminClient.storage
    .from("activity-images")
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[upload]", uploadError.message);
    return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 500 });
  }

  const { data: urlData } = adminClient.storage
    .from("activity-images")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}
