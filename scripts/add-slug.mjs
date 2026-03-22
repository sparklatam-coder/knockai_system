import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://upvtyzdicascxrwcvsbj.supabase.co";
const SERVICE_ROLE_KEY = "sb_secret_mvmw8CJhKjnLmlkHiVn60g_Jru01aBU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Check if slug column already exists by trying to select it
  const { data: test, error: testErr } = await supabase
    .from("clients")
    .select("id, name, slug")
    .limit(1);

  if (testErr && testErr.message.includes("slug")) {
    console.log("slug column doesn't exist yet.");
    console.log("Please run the following SQL in Supabase Dashboard > SQL Editor:\n");
    console.log(`
ALTER TABLE clients ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
UPDATE clients SET slug = 'easytooth' WHERE name = '이지투스치과';
UPDATE clients SET slug = 'hardtooth' WHERE name = '하드투스치과';
ALTER TABLE clients ALTER COLUMN slug SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
    `);
    return;
  }

  // Column exists, check values
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, slug")
    .order("created_at");

  console.log("Current clients:");
  for (const c of clients ?? []) {
    console.log(`  ${c.name} → slug: ${c.slug ?? "(none)"}`);
  }

  // Update slugs for clients without them
  for (const c of clients ?? []) {
    if (!c.slug) {
      const slug = generateSlug(c.name);
      const { error } = await supabase
        .from("clients")
        .update({ slug })
        .eq("id", c.id);
      if (error) {
        console.log(`  ❌ ${c.name}: ${error.message}`);
      } else {
        console.log(`  ✅ ${c.name} → ${slug}`);
      }
    }
  }
}

function generateSlug(name) {
  // Korean dental clinic names → simple romanized slug
  const map = {
    "이지투스치과": "easytooth",
    "하드투스치과": "hardtooth",
  };
  if (map[name]) return map[name];
  // Fallback: use name with special chars removed
  return name.toLowerCase().replace(/[^a-z0-9가-힣]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "client";
}

main().catch(console.error);
