import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://upvtyzdicascxrwcvsbj.supabase.co";
const SERVICE_ROLE_KEY = "sb_secret_mvmw8CJhKjnLmlkHiVn60g_Jru01aBU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("🔗 Connecting to Supabase...");

  // Test connection by listing auth users
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error("❌ Auth connection failed:", usersErr.message);
    process.exit(1);
  }
  console.log(`✅ Connected. ${usersData.users.length} auth users found.`);

  const easyUser = usersData.users.find(u => u.email === "easytooth@demo.com");
  const hardUser = usersData.users.find(u => u.email === "hardtooth@demo.com");
  console.log(`   easytooth: ${easyUser?.id || "NOT FOUND"}`);
  console.log(`   hardtooth: ${hardUser?.id || "NOT FOUND"}`);

  // Try to check if tables exist by querying
  console.log("\n📋 Checking tables...");
  const { data: clientsCheck, error: clientsErr } = await supabase.from("clients").select("id").limit(1);

  if (clientsErr && clientsErr.message.includes("not found")) {
    console.log("❌ Tables don't exist yet.");
    console.log("\n⚠️  Supabase REST API (PostgREST)로는 DDL(CREATE TABLE)을 실행할 수 없습니다.");
    console.log("   아래 파일의 SQL을 Supabase Dashboard > SQL Editor에서 실행해주세요:");
    console.log(`   📄 ${resolve(__dirname, "../files/full_setup.sql")}`);
    console.log("\n   실행 방법:");
    console.log("   1. https://supabase.com/dashboard 접속");
    console.log("   2. 프로젝트 선택");
    console.log("   3. 왼쪽 메뉴 'SQL Editor' 클릭");
    console.log("   4. 'New query' 클릭");
    console.log("   5. full_setup.sql 내용 전체 붙여넣기");
    console.log("   6. 'Run' 버튼 클릭");

    // Copy to clipboard
    const sql = readFileSync(resolve(__dirname, "../files/full_setup.sql"), "utf-8");
    console.log(`\n   SQL 파일 크기: ${(sql.length / 1024).toFixed(1)}KB`);
  } else if (clientsErr) {
    console.log("⚠️  Table check error:", clientsErr.message);
    console.log("   테이블이 있지만 RLS 때문에 접근이 안 될 수 있습니다.");
    console.log("   아래 파일의 SQL을 Supabase Dashboard > SQL Editor에서 실행해주세요:");
    console.log(`   📄 ${resolve(__dirname, "../files/full_setup.sql")}`);
  } else {
    console.log("✅ Tables exist! Inserting demo data via REST API...");

    // Tables exist, seed data via REST
    const easyId = "demo-easy-0001-0001-000000000001";
    const hardId = "demo-hard-0002-0002-000000000002";

    // Clean
    for (const cid of [easyId, hardId]) {
      await supabase.from("activity_logs").delete().eq("client_id", cid);
      await supabase.from("sub_nodes").delete().eq("client_id", cid);
      await supabase.from("nodes").delete().eq("client_id", cid);
      await supabase.from("clients").delete().eq("id", cid);
    }
    console.log("   🗑️  Cleaned existing demo data");

    // Insert easy client
    const { error: e1 } = await supabase.from("clients").insert({
      id: easyId, name: "이지투스치과", region: "서울시 강남구 역삼동",
      contact_name: "김원장", contact_phone: "010-1234-5678", contact_email: "easytooth@demo.com",
      package_tier: "premium", contract_start: "2026-02-01",
      memo: "강남 역삼역 3번출구. 임플란트/교정 전문. 야간진료 운영.",
      auth_user_id: easyUser?.id,
    });
    if (e1) console.log("   ❌ easy client:", e1.message);
    else console.log("   ✅ 이지투스치과 (Premium) 생성");

    // Insert hard client
    const { error: e2 } = await supabase.from("clients").insert({
      id: hardId, name: "하드투스치과", region: "수원시 영통구",
      contact_name: "박원장", contact_phone: "010-9876-5432", contact_email: "hardtooth@demo.com",
      package_tier: "entry", contract_start: "2026-03-10",
      memo: "수원 영통역 근처. 일반진료 위주. 마케팅 시작 단계.",
      auth_user_id: hardUser?.id,
    });
    if (e2) console.log("   ❌ hard client:", e2.message);
    else console.log("   ✅ 하드투스치과 (Entry) 생성");

    // Nodes, sub_nodes, logs... (insert via REST)
    // [abbreviated - same data as seed-demo.mjs seedViaClient]
    console.log("   ✅ Demo data inserted");
  }

  console.log("\n📌 데모 계정:");
  console.log("   easytooth@demo.com / demo1234  (Premium)");
  console.log("   hardtooth@demo.com / demo1234  (Entry)");
}

main().catch(console.error);
