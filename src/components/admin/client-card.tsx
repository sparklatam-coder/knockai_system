import Link from "next/link";
import { ALL_NODE_KEYS, NODE_META } from "@/lib/constants";
import { PackageBadge } from "@/components/PackageBadge";
import type { ClientListItem, NodeStatus } from "@/lib/types";

const STATUS_COLOR: Record<NodeStatus, string> = {
  active:      "var(--status-active)",
  in_progress: "var(--status-progress)",
  inactive:    "var(--status-inactive)",
};

export function ClientCard({ client }: { client: ClientListItem }) {
  const activeCount     = Object.values(client.node_statuses).filter((s) => s === "active").length;
  const inProgressCount = Object.values(client.node_statuses).filter((s) => s === "in_progress").length;

  return (
    <Link
      href={`/admin/clients/${client.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <article style={{
        background: "var(--card-alpha)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "var(--space-card)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-hover)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg, var(--gP), var(--gC))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#081018",
          }}>
            {client.name.slice(0, 1)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2, marginBottom: 2 }}>{client.name}</h3>
            <p style={{ fontSize: 12, color: "var(--tsub)" }}>{client.region || "지역 미입력"}</p>
          </div>
          <PackageBadge tier={client.package_tier} />
        </div>

        {/* Node status strip */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {ALL_NODE_KEYS.map((key) => {
            const status = client.node_statuses[key] ?? "inactive";
            const meta   = NODE_META[key];
            return (
              <div
                key={key}
                title={`${meta.label}: ${status}`}
                style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: STATUS_COLOR[status],
                  opacity: status === "inactive" ? 0.3 : 1,
                }}
              />
            );
          })}
        </div>

        {/* Stats + meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, flex: 1 }}>
            {activeCount > 0 && (
              <span style={{ fontSize: 12, color: "var(--status-active)", fontWeight: 700 }}>✓ {activeCount} 완료</span>
            )}
            {inProgressCount > 0 && (
              <span style={{ fontSize: 12, color: "var(--status-progress)", fontWeight: 700 }}>◑ {inProgressCount} 진행</span>
            )}
          </div>
          <span style={{ fontSize: 11, color: "var(--tdim)" }}>
            {client.last_activity_at
              ? new Date(client.last_activity_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
              : "활동 없음"}
          </span>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--overlay-3)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--tsub)" }}>
            {client.contact_name ? `담당: ${client.contact_name}` : "담당자 미입력"}
          </span>
          <span style={{ fontSize: 12, color: "var(--gP)", fontWeight: 600 }}>관리 →</span>
        </div>
      </article>
    </Link>
  );
}
