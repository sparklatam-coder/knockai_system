import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_USER = { email: "admin@knock.com", password: "admin" };

const DEMO_USERS = [
  { email: "easytooth@demo.com", password: "demo1234", clientId: "00000000-0001-0001-0001-000000000001" },
  { email: "hardtooth@demo.com", password: "demo1234", clientId: "00000000-0002-0002-0002-000000000002" },
];

async function main() {
  console.log("🔗 Supabase URL:", SUPABASE_URL);

  // Step 0: Create admin user
  console.log(`\n👑 Creating admin user: ${ADMIN_USER.email}`);
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingAdmin = existingUsers?.users?.find((x) => x.email === ADMIN_USER.email);

  if (existingAdmin) {
    console.log(`   ✅ Already exists (${existingAdmin.id})`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      email_confirm: true,
      app_metadata: { role: "admin" },
    });
    if (error) {
      console.error(`   ❌ Error:`, error.message);
      process.exit(1);
    }
    console.log(`   ✅ Created (${data.user.id})`);
  }

  // Step 1: Create client auth users
  for (const u of DEMO_USERS) {
    console.log(`\n👤 Creating auth user: ${u.email}`);

    const found = existingUsers?.users?.find((x) => x.email === u.email);

    if (found) {
      console.log(`   ✅ Already exists (${found.id})`);
      u.authId = found.id;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        app_metadata: { role: "client" },
      });
      if (error) {
        console.error(`   ❌ Error:`, error.message);
        process.exit(1);
      }
      console.log(`   ✅ Created (${data.user.id})`);
      u.authId = data.user.id;
    }
  }

  // Step 2: Run seed SQL
  console.log("\n📄 Running seed SQL...");
  const sqlPath = resolve(__dirname, "../files/seed_demo_accounts.sql");
  let sql = readFileSync(sqlPath, "utf-8");

  // Execute SQL via RPC or direct query
  const { error: sqlError } = await supabase.rpc("exec_sql", { query: sql }).maybeSingle();

  if (sqlError) {
    // If exec_sql RPC doesn't exist, run statements individually
    console.log("   ⚠️  RPC not available, running via REST API...");

    // Parse and run key operations via Supabase client
    await seedViaClient();
  } else {
    console.log("   ✅ Seed SQL executed");
  }

  // Step 3: Link auth_user_id
  for (const u of DEMO_USERS) {
    console.log(`\n🔗 Linking ${u.email} → ${u.clientId}`);
    const { error } = await supabase
      .from("clients")
      .update({ auth_user_id: u.authId })
      .eq("id", u.clientId);
    if (error) {
      console.error(`   ❌ Error:`, error.message);
    } else {
      console.log(`   ✅ Linked`);
    }
  }

  // Verify
  console.log("\n📋 Verification:");
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, package_tier, auth_user_id")
    .in("id", DEMO_USERS.map((u) => u.clientId));

  if (clients?.length) {
    clients.forEach((c) => {
      console.log(`   ${c.name} | ${c.package_tier} | auth=${c.auth_user_id ? "✅" : "❌"}`);
    });
  } else {
    console.log("   ⚠️  No clients found — seed SQL may need manual execution");
  }

  console.log("\n🎉 Done!");
  console.log("\n📌 Demo accounts:");
  console.log(`   👑 ${ADMIN_USER.email} / ${ADMIN_USER.password}  (관리자)`);
  DEMO_USERS.forEach((u) => {
    console.log(`   👤 ${u.email} / ${u.password}`);
  });
}

async function seedViaClient() {
  // ---- easytooth (Premium) ----
  const easyId = "00000000-0001-0001-0001-000000000001";

  // Clean existing
  await supabase.from("activity_logs").delete().eq("client_id", easyId);
  await supabase.from("sub_nodes").delete().eq("client_id", easyId);
  await supabase.from("nodes").delete().eq("client_id", easyId);
  await supabase.from("clients").delete().eq("id", easyId);

  // Insert client
  await supabase.from("clients").insert({
    id: easyId,
    name: "이지투스치과",
    region: "서울시 강남구 역삼동",
    contact_name: "김원장",
    contact_phone: "010-1234-5678",
    contact_email: "easytooth@demo.com",
    package_tier: "premium",
    contract_start: "2026-02-01",
    memo: "강남 역삼역 3번출구. 임플란트/교정 전문. 야간진료 운영.",
  });

  // Insert nodes
  const easyNodes = [
    { node_key: "awareness", status: "active" },
    { node_key: "lead_capture", status: "active" },
    { node_key: "lead_nurture", status: "in_progress" },
    { node_key: "new_patient", status: "in_progress" },
    { node_key: "cs_onboarding", status: "active" },
    { node_key: "cs_upsell", status: "in_progress" },
    { node_key: "cs_support", status: "in_progress" },
    { node_key: "cs_education", status: "inactive" },
    { node_key: "cs_community", status: "in_progress" },
    { node_key: "cs_analytics", status: "active" },
  ];
  await supabase.from("nodes").insert(easyNodes.map((n) => ({ client_id: easyId, ...n })));

  // Insert sub_nodes
  const easySubs = [
    { node_key: "awareness", label: "네이버 플레이스 대표 키워드 설정", sort_order: 1, is_done: true },
    { node_key: "awareness", label: "블로그 포스팅 발행", sort_order: 2, is_done: true },
    { node_key: "awareness", label: "SNS 계정 연동", sort_order: 3, is_done: true },
    { node_key: "awareness", label: "네이버 광고 세팅", sort_order: 4, is_done: true },
    { node_key: "lead_capture", label: "전화번호(스마트콜) 설정", sort_order: 1, is_done: true },
    { node_key: "lead_capture", label: "카카오톡 채널 연동", sort_order: 2, is_done: true },
    { node_key: "lead_capture", label: "네이버 예약 활성화", sort_order: 3, is_done: true },
    { node_key: "lead_capture", label: "홈페이지 폼 연동", sort_order: 4, is_done: false },
    { node_key: "lead_nurture", label: "팔로업 프로세스 수립", sort_order: 1, is_done: true },
    { node_key: "lead_nurture", label: "부재중 콜백 ARS 설정", sort_order: 2, is_done: false },
    { node_key: "lead_nurture", label: "카카오 자동응답 설정", sort_order: 3, is_done: true },
    { node_key: "lead_nurture", label: "예약 확정 + 리마인드 알림 설정", sort_order: 4, is_done: false },
    { node_key: "lead_nurture", label: "초진 이벤트 기획 (첫 방문 할인/무료 검진)", sort_order: 5, is_done: false },
    { node_key: "lead_nurture", label: "오시는 길 + 주차 안내 자동 문자 발송", sort_order: 6, is_done: true },
    { node_key: "new_patient", label: "내원 동선 안내 설정", sort_order: 1, is_done: true },
    { node_key: "new_patient", label: "상담 스크립트 제공", sort_order: 2, is_done: false },
    { node_key: "new_patient", label: "치료 동의 프로세스 점검", sort_order: 3, is_done: false },
    { node_key: "cs_onboarding", label: "첫 방문 감사 문자", sort_order: 1, is_done: true },
    { node_key: "cs_onboarding", label: "치료 후 주의사항 발송", sort_order: 2, is_done: true },
    { node_key: "cs_onboarding", label: "다음 예약 안내", sort_order: 3, is_done: true },
    { node_key: "cs_upsell", label: "추가 진료 추천 시나리오", sort_order: 1, is_done: false },
    { node_key: "cs_upsell", label: "패키지 상품 안내", sort_order: 2, is_done: false },
    { node_key: "cs_support", label: "치료 후 케어 문자", sort_order: 1, is_done: true },
    { node_key: "cs_support", label: "정기 검진 리마인더", sort_order: 2, is_done: false },
    { node_key: "cs_community", label: "리뷰 요청 자동화", sort_order: 1, is_done: true },
    { node_key: "cs_community", label: "소개 이벤트 운영", sort_order: 2, is_done: false },
    { node_key: "cs_analytics", label: "월간 유입/전환 리포트", sort_order: 1, is_done: true },
    { node_key: "cs_analytics", label: "키워드 순위 추적", sort_order: 2, is_done: true },
  ];
  await supabase.from("sub_nodes").insert(easySubs.map((s) => ({ client_id: easyId, ...s })));

  // Insert activity logs
  const now = Date.now();
  const day = 86400000;
  const easyLogs = [
    { node_key: "awareness", action_type: "task_complete", content: "네이버 플레이스 '강남 임플란트' 키워드 1페이지 달성", visible_to_client: true, created_at: new Date(now - 1 * day).toISOString() },
    { node_key: "awareness", action_type: "note", content: "블로그 포스팅 10건 발행 완료. 네이버 검색 노출 확인", visible_to_client: true, created_at: new Date(now - 2 * day).toISOString() },
    { node_key: "awareness", action_type: "status_change", content: "인지 확대 노드 → 완료 처리", visible_to_client: true, created_at: new Date(now - 3 * day).toISOString() },
    { node_key: "lead_capture", action_type: "task_complete", content: "스마트콜 번호 설정 완료 (02-1234-5678)", visible_to_client: true, created_at: new Date(now - 3 * day).toISOString() },
    { node_key: "lead_capture", action_type: "task_complete", content: "카카오톡 채널 개설 및 연동 완료", visible_to_client: true, created_at: new Date(now - 4 * day).toISOString() },
    { node_key: "lead_capture", action_type: "note", content: "네이버 예약 시스템 활성화. 실시간 예약 가능", visible_to_client: true, created_at: new Date(now - 5 * day).toISOString() },
    { node_key: "lead_nurture", action_type: "task_complete", content: "팔로업 프로세스 수립 — 미예약 리드 3일/7일/14일 자동 재연락", visible_to_client: true, created_at: new Date(now - 5 * day).toISOString() },
    { node_key: "lead_nurture", action_type: "note", content: "카카오 자동응답 시나리오 5개 설정 (진료문의, 가격문의, 위치, 주차, 예약)", visible_to_client: true, created_at: new Date(now - 6 * day).toISOString() },
    { node_key: "lead_nurture", action_type: "file_upload", content: "오시는 길 안내 이미지 + 주차 안내 문자 템플릿 업로드", visible_to_client: true, created_at: new Date(now - 7 * day).toISOString() },
    { node_key: "new_patient", action_type: "task_complete", content: "내원 동선 안내 완료 — 접수 → 대기 → 촬영 → 상담 → 진료", visible_to_client: true, created_at: new Date(now - 8 * day).toISOString() },
    { node_key: "new_patient", action_type: "note", content: "상담 스크립트 초안 작성 중. 임플란트/교정 각 시나리오별 분류", visible_to_client: false, created_at: new Date(now - 9 * day).toISOString() },
    { node_key: "cs_onboarding", action_type: "task_complete", content: "첫 방문 감사 문자 자동발송 설정 완료", visible_to_client: true, created_at: new Date(now - 10 * day).toISOString() },
    { node_key: "cs_onboarding", action_type: "task_complete", content: "치료 후 주의사항 문자 템플릿 5종 등록", visible_to_client: true, created_at: new Date(now - 11 * day).toISOString() },
    { node_key: "cs_support", action_type: "task_complete", content: "임플란트 수술 후 24h/72h/7일 케어 문자 자동발송 설정", visible_to_client: true, created_at: new Date(now - 12 * day).toISOString() },
    { node_key: "cs_community", action_type: "task_complete", content: "네이버 플레이스 리뷰 요청 자동화 — 진료 완료 3일 후 발송", visible_to_client: true, created_at: new Date(now - 13 * day).toISOString() },
    { node_key: "cs_community", action_type: "note", content: "소개 이벤트 기획 검토 중 (소개 시 스케일링 무료 쿠폰)", visible_to_client: false, created_at: new Date(now - 14 * day).toISOString() },
    { node_key: "cs_analytics", action_type: "task_complete", content: "월간 리포트 자동화 설정 완료 — 매월 1일 이메일 발송", visible_to_client: true, created_at: new Date(now - 15 * day).toISOString() },
    { node_key: "cs_analytics", action_type: "file_upload", content: "2월 유입/전환 리포트 발송 — 네이버 유입 320건, 예약전환 42건 (13.1%)", visible_to_client: true, created_at: new Date(now - 16 * day).toISOString() },
    { node_key: "cs_analytics", action_type: "note", content: "키워드 순위 추적 시작 — '강남 임플란트' 3위, '역삼 치과' 5위", visible_to_client: true, created_at: new Date(now - 17 * day).toISOString() },
  ];
  const { error: logErr1 } = await supabase.from("activity_logs").insert(easyLogs.map((l) => ({ client_id: easyId, ...l })));
  if (logErr1) console.log("   ⚠️  easy logs:", logErr1.message);

  // ---- hardtooth (Entry) ----
  const hardId = "00000000-0002-0002-0002-000000000002";

  await supabase.from("activity_logs").delete().eq("client_id", hardId);
  await supabase.from("sub_nodes").delete().eq("client_id", hardId);
  await supabase.from("nodes").delete().eq("client_id", hardId);
  await supabase.from("clients").delete().eq("id", hardId);

  await supabase.from("clients").insert({
    id: hardId,
    name: "하드투스치과",
    region: "수원시 영통구",
    contact_name: "박원장",
    contact_phone: "010-9876-5432",
    contact_email: "hardtooth@demo.com",
    package_tier: "entry",
    contract_start: "2026-03-10",
    memo: "수원 영통역 근처. 일반진료 위주. 마케팅 시작 단계.",
  });

  const hardNodes = [
    { node_key: "awareness", status: "in_progress" },
    { node_key: "lead_capture", status: "inactive" },
    { node_key: "lead_nurture", status: "inactive" },
    { node_key: "new_patient", status: "inactive" },
    { node_key: "cs_onboarding", status: "inactive" },
    { node_key: "cs_upsell", status: "inactive" },
    { node_key: "cs_support", status: "inactive" },
    { node_key: "cs_education", status: "inactive" },
    { node_key: "cs_community", status: "inactive" },
    { node_key: "cs_analytics", status: "in_progress" },
  ];
  await supabase.from("nodes").insert(hardNodes.map((n) => ({ client_id: hardId, ...n })));

  const hardSubs = [
    { node_key: "awareness", label: "네이버 플레이스 대표 키워드 설정", sort_order: 1, is_done: true },
    { node_key: "awareness", label: "블로그 포스팅 발행", sort_order: 2, is_done: false },
    { node_key: "awareness", label: "SNS 계정 연동", sort_order: 3, is_done: false },
    { node_key: "awareness", label: "네이버 광고 세팅", sort_order: 4, is_done: false },
    { node_key: "cs_analytics", label: "월간 유입/전환 리포트", sort_order: 1, is_done: false },
    { node_key: "cs_analytics", label: "키워드 순위 추적", sort_order: 2, is_done: true },
  ];
  await supabase.from("sub_nodes").insert(hardSubs.map((s) => ({ client_id: hardId, ...s })));

  const hardLogs = [
    { node_key: "awareness", action_type: "task_complete", content: "네이버 플레이스 '수원 치과' 키워드 등록 완료", visible_to_client: true, created_at: new Date(now - 2 * day).toISOString() },
    { node_key: "awareness", action_type: "note", content: "플레이스 사진 업로드 및 영업시간 정보 업데이트", visible_to_client: true, created_at: new Date(now - 4 * day).toISOString() },
    { node_key: "awareness", action_type: "note", content: "블로그 포스팅 주제 리스트 작성 중", visible_to_client: false, created_at: new Date(now - 5 * day).toISOString() },
    { node_key: "cs_analytics", action_type: "task_complete", content: "키워드 순위 추적 설정 — '수원 치과' 현재 12위", visible_to_client: true, created_at: new Date(now - 3 * day).toISOString() },
    { node_key: "cs_analytics", action_type: "note", content: "첫 월간 리포트 다음 주 발송 예정", visible_to_client: true, created_at: new Date(now - 1 * day).toISOString() },
  ];
  const { error: logErr2 } = await supabase.from("activity_logs").insert(hardLogs.map((l) => ({ client_id: hardId, ...l })));
  if (logErr2) console.log("   ⚠️  hard logs:", logErr2.message);

  console.log("   ✅ Seed data inserted via REST API");
}

main().catch(console.error);
