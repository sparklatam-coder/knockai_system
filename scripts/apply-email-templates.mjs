#!/usr/bin/env node

/**
 * Apply custom email templates to Supabase hosted project.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=<token> node scripts/apply-email-templates.mjs
 *
 * Get your access token at: https://supabase.com/dashboard/account/tokens
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
// Extract project ref from the Supabase URL in .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!ACCESS_TOKEN) {
  console.error("Error: SUPABASE_ACCESS_TOKEN is required.");
  console.error("Get one at: https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

if (!PROJECT_REF) {
  console.error("Error: Could not extract project ref from NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const inviteHtml = readFileSync(
  resolve(__dirname, "email-templates/invite.html"),
  "utf-8",
);

const body = {
  mailer_subjects_invite: "노크 병원 마케팅 시스템 — 계정이 생성되었습니다",
  mailer_templates_invite_content: inviteHtml,
};

console.log(`Applying email templates to project: ${PROJECT_REF}`);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  },
);

if (!res.ok) {
  const text = await res.text();
  console.error(`Failed (${res.status}): ${text}`);
  process.exit(1);
}

console.log("Email templates applied successfully!");
console.log("  - Invite subject: 노크 병원 마케팅 시스템 — 계정이 생성되었습니다");
console.log("  - Invite template: scripts/email-templates/invite.html");
