"use client";

import { useMemo, useState } from "react";
import { NODE_META } from "@/lib/constants";
import { useClientDetail } from "@/hooks/use-client-detail";
import { HospitalLoadingScreen } from "@/components/HospitalLoadingScreen";
import type { ActionType, ActivityLog, NodeStatus, SubNode } from "@/lib/types";

/* ── constants ──────────────────────────────────────── */
const STATUS_OPTIONS: { value: NodeStatus; label: string; color: string; bg: string }[] = [
  { value: "inactive",    label: "대기",    color: "#9E9E9E", bg: "rgba(158,158,158,0.12)" },
  { value: "in_progress", label: "진행 중", color: "#F9A825", bg: "rgba(249,168,37,0.12)" },
  { value: "active",      label: "완료",    color: "#34C759", bg: "rgba(52,199,89,0.12)"  },
];

const ACTION_OPTIONS: { value: ActionType; label: string; color: string }[] = [
  { value: "note",          label: "메모",       color: "var(--gP)" },
  { value: "task_complete", label: "작업 완료",   color: "var(--gG)" },
  { value: "status_change", label: "상태 변경",   color: "var(--gW)" },
  { value: "file_upload",   label: "파일 업로드", color: "var(--gPu)" },
];

const ACTION_LABEL: Record<ActionType, string> = {
  note: "메모", task_complete: "작업 완료", status_change: "상태 변경", file_upload: "파일 업로드",
};
const ACTION_COLOR: Record<ActionType, string> = {
  note: "var(--gP)", task_complete: "var(--gG)", status_change: "var(--gW)", file_upload: "var(--gPu)",
};

/* ── segmented control ──────────────────────────────── */
function SegControl<T extends string>({
  options, value, onChange, disabled,
}: {
  options: { value: T; label: string; color?: string; bg?: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="apple-seg">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button key={opt.value} type="button" disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`apple-seg-btn${active ? " apple-seg-active" : ""}`}
            style={active && opt.color ? { background: opt.bg, color: opt.color, borderColor: opt.color + "55" } : {}}
          >
            {active && opt.color && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: opt.color, display: "inline-block", flexShrink: 0 }} />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── log item: view / edit ──────────────────────────── */
function LogItem({
  log, saving,
  onUpdate, onDelete,
}: {
  log: ActivityLog;
  saving: boolean;
  onUpdate: (id: string, content: string, visible: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing,   setEditing]   = useState(false);
  const [draft,     setDraft]     = useState(log.content);
  const [visible,   setVisible]   = useState(log.visible_to_client);
  const [confirming,setConfirming] = useState(false);

  async function save() {
    await onUpdate(log.id, draft, visible);
    setEditing(false);
  }

  const color = ACTION_COLOR[log.action_type];

  return (
    <li style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      {/* header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{
          padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 800,
          background: `${color}1a`, color, border: `1px solid ${color}33`,
        }}>
          {ACTION_LABEL[log.action_type]}
        </span>
        <span style={{ fontSize: 11, color: "var(--tdim)", flex: 1 }}>
          {new Date(log.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 100,
          background: log.visible_to_client ? "rgba(61,220,132,0.12)" : "rgba(255,255,255,0.05)",
          color: log.visible_to_client ? "#34C759" : "var(--tdim)",
        }}>
          {log.visible_to_client ? "공개" : "비공개"}
        </span>

        {!editing && (
          <>
            <button type="button" onClick={() => { setDraft(log.content); setVisible(log.visible_to_client); setEditing(true); }}
              style={{ fontSize: 11, color: "var(--tsub)", background: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 6, border: "1px solid var(--border)" }}>
              수정
            </button>
            {confirming ? (
              <>
                <button type="button" onClick={() => void onDelete(log.id)} disabled={saving}
                  style={{ fontSize: 11, color: "#ef4444", background: "rgba(239,68,68,0.12)", cursor: "pointer", padding: "2px 8px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", fontWeight: 700 }}>
                  삭제 확인
                </button>
                <button type="button" onClick={() => setConfirming(false)}
                  style={{ fontSize: 11, color: "var(--tdim)", background: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 6, border: "1px solid var(--border)" }}>
                  취소
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirming(true)}
                style={{ fontSize: 11, color: "var(--tdim)", background: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 6, border: "1px solid var(--border)" }}>
                삭제
              </button>
            )}
          </>
        )}
      </div>

      {/* content */}
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="apple-textarea"
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tsub)", cursor: "pointer", flex: 1 }}>
              <div className={`apple-toggle${visible ? " on" : ""}`} onClick={() => setVisible((v) => !v)}>
                <div className="apple-toggle-knob" />
              </div>
              고객 공개
            </label>
            <button type="button" onClick={() => setEditing(false)}
              style={{ fontSize: 12, color: "var(--tsub)", background: "none", cursor: "pointer", padding: "5px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
              취소
            </button>
            <button type="button" onClick={() => void save()} disabled={saving || !draft.trim()}
              style={{ fontSize: 12, fontWeight: 700, color: "#081018", background: "linear-gradient(135deg,var(--gP),var(--gC))", cursor: "pointer", padding: "5px 14px", borderRadius: 8, border: "none", opacity: (!draft.trim() || saving) ? 0.4 : 1 }}>
              저장
            </button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {log.content}
        </p>
      )}
    </li>
  );
}

/* ── quick log composer ─────────────────────────────── */
function LogComposer({
  nodeKey, saving, onCreate,
}: {
  nodeKey: string;
  saving: boolean;
  onCreate: (input: { node_key: string; action_type: ActionType; content: string; visible_to_client: boolean }) => Promise<{ error: string | null }>;
}) {
  const [activeType, setActiveType] = useState<ActionType | null>(null);
  const [draft,      setDraft]      = useState("");
  const [visible,    setVisible]    = useState(true);

  async function submit() {
    if (!activeType || !draft.trim()) return;
    const result = await onCreate({ node_key: nodeKey, action_type: activeType, content: draft, visible_to_client: visible });
    if (!result.error) { setDraft(""); setActiveType(null); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Quick type buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ACTION_OPTIONS.map((opt) => {
          const active = activeType === opt.value;
          return (
            <button key={opt.value} type="button"
              onClick={() => { setActiveType(active ? null : opt.value); if (active) setDraft(""); }}
              style={{
                padding: "5px 13px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                background: active ? `${opt.color}1a` : "rgba(255,255,255,0.04)",
                border: active ? `1px solid ${opt.color}55` : "1px solid var(--border)",
                color: active ? opt.color : "var(--tsub)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Inline input when type selected */}
      {activeType && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn 0.15s ease" }}>
          <textarea
            autoFocus
            className="apple-textarea"
            rows={3}
            placeholder={`${ACTION_LABEL[activeType]} 내용을 입력하세요`}
            value={draft}
            disabled={saving}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void submit(); }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tsub)", cursor: "pointer", flex: 1 }}>
              <div className={`apple-toggle${visible ? " on" : ""}`} onClick={() => setVisible((v) => !v)}>
                <div className="apple-toggle-knob" />
              </div>
              고객 공개
            </label>
            <span style={{ fontSize: 10, color: "var(--tdim)" }}>⌘↵ 저장</span>
            <button type="button" onClick={() => void submit()} disabled={saving || !draft.trim()}
              className="apple-save-btn"
              style={{ padding: "6px 18px", opacity: (!draft.trim() || saving) ? 0.4 : 1 }}>
              {saving ? "…" : "저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── main component ─────────────────────────────────── */
export function ClientDetailView({ clientId }: { clientId: string }) {
  const { data, error, loading, saving, toggleSubNode, updateNodeStatus, createLog, updateLog, deleteLog } =
    useClientDetail(clientId);

  const groupedSubNodes = useMemo(() => {
    return (data?.subNodes ?? []).reduce<Record<string, SubNode[]>>((acc, sn) => {
      (acc[sn.node_key] ??= []).push(sn);
      return acc;
    }, {});
  }, [data?.subNodes]);

  const groupedLogs = useMemo(() => {
    return (data?.activityLogs ?? []).reduce<Record<string, ActivityLog[]>>((acc, log) => {
      (acc[log.node_key] ??= []).push(log);
      return acc;
    }, {});
  }, [data?.activityLogs]);

  if (loading) return <HospitalLoadingScreen />;
  if (error || !data) return <div className="error-banner">⚠️ {error ?? "고객 정보를 찾을 수 없습니다."}</div>;

  const sortedNodes = data.nodes
    .slice()
    .sort((a, b) => NODE_META[a.node_key].order - NODE_META[b.node_key].order);

  return (
    <div className="dashboard-content">

      {/* ── Top: client info + activity log ── */}
      <section className="apple-top-grid">
        <div className="apple-info-card">
          <div className="apple-info-header">
            <div className="apple-info-avatar">{data.client.name.slice(0, 1)}</div>
            <div>
              <h2 className="apple-info-name">{data.client.name}</h2>
              <p className="apple-info-sub">{data.client.region || "지역 미입력"}</p>
            </div>
          </div>
          <div className="apple-meta-grid">
            <div className="apple-meta-item">
              <span className="apple-meta-label">패키지</span>
              <span className="apple-meta-value">{data.client.package_tier}</span>
            </div>
            <div className="apple-meta-item">
              <span className="apple-meta-label">계약 시작</span>
              <span className="apple-meta-value">{data.client.contract_start || "미정"}</span>
            </div>
            <div className="apple-meta-item">
              <span className="apple-meta-label">노드 수</span>
              <span className="apple-meta-value">{data.nodes.length}개</span>
            </div>
            <div className="apple-meta-item">
              <span className="apple-meta-label">Active</span>
              <span className="apple-meta-value" style={{ color: "#34C759" }}>
                {data.nodes.filter((n) => n.status === "active").length}개
              </span>
            </div>
          </div>
        </div>

        <div className="apple-log-card">
          <div className="apple-log-header">
            <span className="sec-label" style={{ marginBottom: 0 }}>전체 활동 로그</span>
            <span className="apple-log-count">{data.activityLogs.length}건</span>
          </div>
          <ul className="apple-log-list" style={{ maxHeight: 420, overflowY: "auto" }}>
            {[...data.activityLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((log) => (
              <li key={log.id} className="apple-log-item">
                <div className="apple-log-dot" style={{ background: log.visible_to_client ? "#34C759" : "#5a6374" }} />
                <div className="apple-log-body">
                  <span className="apple-log-node">
                    {NODE_META[log.node_key].emoji} {NODE_META[log.node_key].label}
                    {" · "}
                    <span style={{ color: ACTION_COLOR[log.action_type] }}>{ACTION_LABEL[log.action_type]}</span>
                  </span>
                  <span className="apple-log-content">{log.content}</span>
                </div>
                <span className="apple-log-date">
                  {new Date(log.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                </span>
              </li>
            ))}
            {data.activityLogs.length === 0 && (
              <li className="apple-log-empty">아직 활동 로그가 없습니다</li>
            )}
          </ul>
        </div>
      </section>

      {/* ── Node cards ── */}
      <section className="apple-node-grid">
        {sortedNodes.map((node) => {
          const meta      = NODE_META[node.node_key];
          const subNodes  = groupedSubNodes[node.node_key] ?? [];
          const nodeLogs  = groupedLogs[node.node_key] ?? [];
          const doneCount = subNodes.filter((s) => s.is_done).length;
          const statusOpt = STATUS_OPTIONS.find((s) => s.value === node.status)!;

          return (
            <article key={node.id} className="apple-node-card">

              {/* Node header */}
              <div className="apple-node-top">
                <div className="apple-node-icon">{meta.emoji}</div>
                <div className="apple-node-title-group">
                  <h3 className="apple-node-title">{meta.label}</h3>
                  <p className="apple-node-desc">{meta.description}</p>
                </div>
                <span className="apple-node-badge" style={{ background: statusOpt.bg, color: statusOpt.color }}>
                  {statusOpt.label}
                </span>
              </div>

              {/* Status selector */}
              <div className="apple-section">
                <p className="apple-section-label">상태 변경</p>
                <SegControl
                  options={STATUS_OPTIONS}
                  value={node.status}
                  onChange={(v) => void updateNodeStatus(node.node_key, v)}
                  disabled={saving}
                />
              </div>

              {/* Sub-node checklist */}
              {subNodes.length > 0 && (() => {
                const allDone = doneCount === subNodes.length;
                // Sort: undone first, done last (within original order)
                const sortedSubs = [...subNodes].sort((a, b) => {
                  if (a.is_done === b.is_done) return a.sort_order - b.sort_order;
                  return a.is_done ? 1 : -1;
                });
                return (
                  <div className="apple-section">
                    <div className="apple-section-row">
                      <p className="apple-section-label">태스크</p>
                      <span className="apple-progress-chip" style={{ fontVariantNumeric: "tabular-nums" }}>{doneCount}/{subNodes.length}</span>
                    </div>
                    <div className="apple-progress-bar">
                      <div className="apple-progress-fill"
                        style={{ width: `${subNodes.length ? (doneCount / subNodes.length) * 100 : 0}%`, background: allDone ? "#34C759" : statusOpt.color, transition: "width 0.4s ease, background 0.3s" }} />
                    </div>
                    {allDone && (
                      <div style={{ padding: "8px 12px", background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.15)", borderRadius: 8, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#34C759" }}>
                        모든 설정이 완료되었습니다! 🎉
                      </div>
                    )}
                    <ul className="apple-checklist">
                      {sortedSubs.map((sn) => {
                        const showDivider = node.node_key === "lead_nurture" && sn.sort_order === 4 && !sn.is_done;
                        return (
                          <li key={sn.id}>
                            {showDivider && (
                              <div style={{ padding: "8px 0 4px" }}>
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.7px", textTransform: "uppercase", color: "var(--gW)" }}>
                                  ⭐ 유망 리드 → 초진 이벤트
                                </span>
                              </div>
                            )}
                            <div className="apple-checklist-item">
                              <label className="apple-checkbox-label">
                                <input type="checkbox" className="apple-checkbox"
                                  checked={sn.is_done} disabled={saving}
                                  onChange={(e) => void toggleSubNode(sn.id, e.target.checked)} />
                                <span style={{
                                  color: sn.is_done ? "var(--tdim)" : "var(--text)",
                                  textDecoration: sn.is_done ? "line-through" : "none",
                                  textDecorationColor: sn.is_done ? "var(--tdim)" : undefined,
                                  transition: "color 0.25s, text-decoration 0.25s",
                                }}>
                                  {sn.label}
                                </span>
                              </label>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })()}

              {/* ── Existing logs ── */}
              {nodeLogs.length > 0 && (
                <div className="apple-section">
                  <div className="apple-section-row">
                    <p className="apple-section-label">활동 기록</p>
                    <span className="apple-progress-chip">{nodeLogs.length}건</span>
                  </div>
                  <ul style={{ listStyle: "none" }}>
                    {nodeLogs.map((log) => (
                      <LogItem
                        key={log.id}
                        log={log}
                        saving={saving}
                        onUpdate={async (id, content, visible) => { await updateLog(id, content, visible); }}
                        onDelete={async (id) => { await deleteLog(id); }}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Quick log composer ── */}
              <div className="apple-section apple-log-form">
                {nodeLogs.length === 0 && <p className="apple-section-label">활동 기록</p>}
                <LogComposer
                  nodeKey={node.node_key}
                  saving={saving}
                  onCreate={createLog}
                />
              </div>

            </article>
          );
        })}
      </section>
    </div>
  );
}
