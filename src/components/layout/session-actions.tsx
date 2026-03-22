"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function SessionActions() {
  const router = useRouter();
  const { isAuthenticated, role, signOut, user } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="session-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div className="session-pill">
        <span>{role === "admin" ? "관리자" : "고객"}</span>
        <strong>{user?.email}</strong>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        style={{
          padding: "6px 16px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
          color: "var(--tsub)",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          transition: "background 0.15s, color 0.15s",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.12)";
          e.currentTarget.style.color = "#ef4444";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "var(--tsub)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        }}
      >
        로그아웃
      </button>
    </div>
  );
}
