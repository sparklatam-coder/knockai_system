"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function SessionActions() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, role, signOut, user } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  const isAdminPage = pathname.startsWith("/admin");

  return (
    <div className="session-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div className="session-pill">
        <span>{role === "admin" ? "관리자" : "고객"}</span>
        <strong>{user?.email}</strong>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        {role === "admin" && (
          <button
            type="button"
            onClick={() => router.push(isAdminPage ? "/dashboard" : "/admin/clients")}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: isAdminPage
                ? "1px solid var(--accent-border)"
                : "1px solid var(--overlay-5)",
              background: isAdminPage
                ? "var(--accent-bg)"
                : "var(--overlay-3)",
              color: isAdminPage
                ? "var(--gP)"
                : "var(--tsub)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {isAdminPage ? "👁 고객 대시보드" : "⚙ 관리자 페이지"}
          </button>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            border: "1px solid var(--overlay-5)",
            background: "var(--overlay-3)",
            color: "var(--tsub)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--error-bg)";
            e.currentTarget.style.color = "var(--error)";
            e.currentTarget.style.borderColor = "var(--error-border)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--overlay-3)";
            e.currentTarget.style.color = "var(--tsub)";
            e.currentTarget.style.borderColor = "var(--overlay-5)";
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
