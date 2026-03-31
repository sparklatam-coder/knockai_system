"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NODE_META, LEAD_NURTURE_SPLIT, PACKAGE_NODE_ACCESS, PACKAGE_INFO } from "@/lib/constants";
import { useClientDetail } from "@/hooks/use-client-detail";
import { useAuth } from "@/hooks/use-auth";
import { HospitalLoadingScreen } from "@/components/HospitalLoadingScreen";
import type { ActivityLog, AuthRole, Client, GuideLink, LogType, NodeKey, NodeRecord, NodeStatus, PackageTier, SubNode } from "@/lib/types";
import { GuidePanel } from "@/components/admin/guide-panel";
import { MessagingView } from "@/components/messaging/messaging-view";

/* ── constants ──────────────────────────────────────── */
const STATUS_OPTIONS: { value: NodeStatus; label: string; color: string; bg: string }[] = [
  { value: "inactive",    label: "대기",    color: "var(--status-inactive)", bg: "var(--status-inactive-bg)" },
  { value: "in_progress", label: "진행 중", color: "var(--status-progress)", bg: "var(--status-progress-bg)" },
  { value: "active",      label: "완료",    color: "var(--status-active)",   bg: "var(--status-active-bg)"  },
];

const LOG_TYPE_META: Record<LogType, { label: string; badge: string; color: string; bg: string }> = {
  memo: { label: "내부 메모", badge: "🔒 내부", color: "#72728a", bg: "rgba(114,114,138,0.15)" },
  work: { label: "작업 기록", badge: "👁 공개", color: "#34c759", bg: "rgba(52,199,89,0.1)" },
};

/* ── types for global pending changes ─────────────── */
interface PendingChanges {
  nodes: Record<string, { status: NodeStatus }>;
  tasks: Record<string, boolean>;
}

const EMPTY_PENDING: PendingChanges = { nodes: {}, tasks: {} };

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

/* ── image thumbnails (shared by LogItem + LogComposer) */
function ImageThumbnails({ urls }: { urls: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (urls.length === 0) return null;

  const overlay = open !== null ? createPortal(
    <div
      onClick={() => setOpen(null)}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,0,0,0.9)", display: "flex",
        alignItems: "center", justifyContent: "center", cursor: "zoom-out",
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(null); }}
        style={{
          position: "fixed", top: 20, right: 20,
          background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
          width: 48, height: 48, fontSize: 28, color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >✕</button>
      {urls.length > 1 && open > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(open - 1); }}
          style={{
            position: "fixed", left: 20, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
            width: 48, height: 48, fontSize: 24, color: "#fff", cursor: "pointer",
          }}
        >‹</button>
      )}
      {urls.length > 1 && open < urls.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(open + 1); }}
          style={{
            position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
            width: 48, height: 48, fontSize: 24, color: "#fff", cursor: "pointer",
          }}
        >›</button>
      )}
      <img
        src={urls[open]}
        alt={`첨부 ${open + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 8, cursor: "default" }}
      />
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
        {urls.map((url, i) => (
          <img
            key={i} src={url} alt={`첨부 ${i + 1}`}
            onClick={() => setOpen(i)}
            style={{
              width: 100, height: 68, objectFit: "cover", borderRadius: 8,
              border: "1px solid var(--border)", cursor: "pointer",
            }}
          />
        ))}
      </div>
      {overlay}
    </>
  );
}

/* ── URL auto-link helper ──────────────────────────── */
function renderWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
        style={{ color: "#4a9eff", wordBreak: "break-all" }}>
        {part.length > 60 ? part.slice(0, 60) + "..." : part}
      </a>
    ) : part
  );
}

/* ── log item: view / edit ──────────────────────────── */
function LogItem({
  log, saving, readOnly,
  onUpdate, onDelete,
}: {
  log: ActivityLog;
  saving: boolean;
  readOnly?: boolean;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing,   setEditing]   = useState(false);
  const [draft,     setDraft]     = useState(log.content);
  const [confirming,setConfirming] = useState(false);

  async function save() {
    await onUpdate(log.id, draft);
    setEditing(false);
  }

  const lt = log.log_type ?? (log.visible_to_client ? "work" : "memo");
  const meta = LOG_TYPE_META[lt];

  return (
    <li style={{ padding: "12px 0", borderBottom: "1px solid var(--overlay-3)", opacity: lt === "memo" ? 0.85 : 1 }}>
      {/* header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 6px",
          borderRadius: 4, background: meta.bg, color: meta.color,
        }}>
          {meta.badge}
        </span>
        <span style={{ fontSize: 11, color: "var(--tdim)", flex: 1 }}>
          {new Date(log.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
        </span>

        {!editing && !readOnly && (
          <>
            <button type="button" onClick={() => { setDraft(log.content); setEditing(true); }}
              style={{ fontSize: 11, color: "var(--tsub)", background: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 6, border: "1px solid var(--border)" }}>
              수정
            </button>
            {confirming ? (
              <>
                <button type="button" onClick={() => void onDelete(log.id)} disabled={saving}
                  style={{ fontSize: 11, color: "var(--error)", background: "var(--error-bg)", cursor: "pointer", padding: "2px 8px", borderRadius: 6, border: "1px solid var(--error-border)", fontWeight: 700 }}>
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
          <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} className="apple-textarea" />
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
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
        <>
          <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {renderWithLinks(log.content)}
          </p>
          <ImageThumbnails urls={log.image_urls ?? []} />
        </>
      )}
    </li>
  );
}

/* ── quick log composer with 2 buttons ────────────── */
function LogComposer({
  nodeKey, saving, onCreate, clientId, accessToken,
}: {
  nodeKey: string;
  saving: boolean;
  onCreate: (input: { node_key: string; log_type: LogType; content: string; image_urls?: string[] }) => Promise<{ error: string | null }>;
  clientId: string;
  accessToken: string;
}) {
  const [activeInput, setActiveInput] = useState<LogType | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingImages, setPendingImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPendingImage = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) { alert("이미지 크기는 5MB 이하만 가능합니다."); return; }
    setPendingImages((prev) => prev.length >= 5 ? prev : [...prev, { file, preview: URL.createObjectURL(file) }]);
  }, []);

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index); });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) { e.preventDefault(); const file = item.getAsFile(); if (file) addPendingImage(file); }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/")).forEach(addPendingImage);
    e.target.value = "";
  };

  async function uploadImages(): Promise<string[]> {
    if (pendingImages.length === 0) return [];
    setUploading(true);
    try {
      return await Promise.all(
        pendingImages.map(async (img) => {
          const formData = new FormData();
          formData.append("file", img.file);
          formData.append("client_id", clientId);
          const res = await fetch("/api/admin/upload", { method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: formData });
          const json = (await res.json()) as { url?: string; error?: string };
          if (!res.ok) throw new Error(json.error ?? "업로드 실패");
          return json.url!;
        }),
      );
    } finally { setUploading(false); }
  }

  function resetForm() {
    setDraft("");
    setActiveInput(null);
    pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setPendingImages([]);
  }

  async function submit() {
    if (!activeInput || !draft.trim()) return;
    try {
      const imageUrls = await uploadImages();
      const result = await onCreate({
        node_key: nodeKey,
        log_type: activeInput,
        content: draft,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      });
      if (!result.error) resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    }
  }

  const toggleInput = (type: LogType) => {
    if (activeInput === type) { resetForm(); } else { setActiveInput(type); setDraft(""); pendingImages.forEach((img) => URL.revokeObjectURL(img.preview)); setPendingImages([]); }
  };

  const activeMeta = activeInput ? LOG_TYPE_META[activeInput] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* 2 buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["memo", "work"] as const).map((type) => {
          const m = LOG_TYPE_META[type];
          const active = activeInput === type;
          return (
            <button key={type} type="button" onClick={() => toggleInput(type)}
              style={{
                flex: 1, padding: "10px", fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                background: active ? m.bg : "transparent",
                border: active ? `1px solid ${m.color}` : "1px solid var(--border)",
                color: active ? m.color : "#72728a",
              }}
            >
              {type === "memo" ? "📝 내부 메모" : "✅ 작업 기록"}
            </button>
          );
        })}
      </div>

      {/* Input form */}
      {activeInput && activeMeta && (
        <div
          style={{
            border: `1px solid ${activeMeta.color}`,
            borderRadius: 10, padding: 12, background: "#060611",
          }}
          onPaste={handlePaste}
          onDrop={(e) => { e.preventDefault(); Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")).forEach(addPendingImage); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div style={{ fontSize: 11, color: activeMeta.color, marginBottom: 8, fontWeight: 600 }}>
            {activeInput === "memo" ? "🔒 내부 메모 — 관리자만 볼 수 있습니다" : "👁 작업 기록 — 고객에게 공개됩니다"}
          </div>
          <textarea
            autoFocus className="apple-textarea" rows={3}
            placeholder={activeInput === "memo" ? "내부 참고용 메모를 작성하세요..." : "고객에게 보여질 작업 내용을 작성하세요..."}
            value={draft} disabled={saving || uploading}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void submit(); }}
            style={{ background: "transparent", border: "none", width: "100%", color: "#eaeaef", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none" }}
          />

          {/* Image previews */}
          {pendingImages.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, paddingTop: 8, borderTop: "1px solid #1e1e32" }}>
              {pendingImages.map((img, i) => (
                <div key={i} style={{ position: "relative", width: 64, height: 64 }}>
                  <img src={img.preview} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, border: "1px solid #1e1e32" }} />
                  <button type="button" onClick={() => removePendingImage(i)}
                    style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#e94560", color: "#fff", border: "none", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e1e32" }}>
            <label style={{ padding: "4px 8px", fontSize: 12, color: "#72728a", border: "1px solid #1e1e32", borderRadius: 6, cursor: "pointer" }}>
              📎 이미지
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileSelect} />
            </label>
            <button type="button" onClick={() => void submit()} disabled={saving || uploading || !draft.trim()}
              style={{
                padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
                background: activeInput === "memo" ? "#72728a" : "#34c759",
                opacity: (!draft.trim() || saving || uploading) ? 0.4 : 1,
              }}
            >
              {uploading ? "업로드 중..." : saving ? "저장 중..." : activeInput === "memo" ? "메모 저장" : "기록 저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── global floating save toast ──────────────────── */
function GlobalSaveToast({ count, onSave, onDiscard, isSaving, saveSuccess }: {
  count: number;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}) {
  const content = saveSuccess ? (
    <div className="save-toast save-toast--success">
      <span style={{ color: "#34c759", fontSize: 13, fontWeight: 600 }}>
        ✓ 저장 완료
      </span>
    </div>
  ) : (
    <div className="save-toast">
      <span style={{ fontSize: 13, color: "#eaeaef", fontWeight: 600 }}>
        변경한 항목을 저장하시겠습니까?
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={onDiscard} className="save-toast-btn-cancel">취소</button>
        <button type="button" onClick={onSave} disabled={isSaving} className="save-toast-btn-save">
          {isSaving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );

  if (typeof document === "undefined") return content;
  return createPortal(content, document.body);
}

/* ── node card (no local save — uses global pending) ─ */
function NodeCard({
  node,
  subNodes,
  nodeLogs,
  displayMeta,
  showStatusControl,
  saving: globalSaving,
  pendingChanges,
  onStatusChange,
  onTaskToggle,
  createLog,
  updateLog,
  deleteLog,
  onUpdateGuide,
  clientId,
  accessToken,
  role,
}: {
  node: NodeRecord;
  subNodes: SubNode[];
  nodeLogs: ActivityLog[];
  displayMeta: { emoji: string; label: string; description: string };
  showStatusControl: boolean;
  saving: boolean;
  pendingChanges: PendingChanges;
  onStatusChange: (nodeKey: string, status: NodeStatus) => void;
  onTaskToggle: (taskId: string, checked: boolean) => void;
  createLog: (input: { node_key: string; log_type: LogType; content: string; image_urls?: string[] }) => Promise<{ error: string | null }>;
  updateLog: (logId: string, content: string) => Promise<{ error: string | null }>;
  deleteLog: (logId: string) => Promise<{ error: string | null }>;
  onUpdateGuide: (subNodeId: string, content: string | null, links: GuideLink[]) => Promise<{ error: string | null }>;
  clientId: string;
  accessToken: string;
  role: AuthRole;
}) {
  const isClient = role === "client";
  // Effective status (global pending override or server)
  const pendingNodeStatus = pendingChanges.nodes[node.node_key]?.status;
  const effectiveStatus = pendingNodeStatus ?? node.status;
  const statusOpt = STATUS_OPTIONS.find((s) => s.value === effectiveStatus)!;

  // Check if this node has pending changes
  const nodeHasChanges = pendingChanges.nodes[node.node_key] !== undefined
    || subNodes.some((sn) => sn.id in pendingChanges.tasks);

  // Effective task states
  const effectiveSubNodes = subNodes.map((sn) => ({
    ...sn,
    is_done: sn.id in pendingChanges.tasks ? pendingChanges.tasks[sn.id] : sn.is_done,
  }));

  const doneCount = effectiveSubNodes.filter((s) => s.is_done).length;
  const allDone = effectiveSubNodes.length > 0 && doneCount === effectiveSubNodes.length;
  const sortedSubs = [...effectiveSubNodes].sort((a, b) => {
    if (a.is_done === b.is_done) return a.sort_order - b.sort_order;
    return a.is_done ? 1 : -1;
  });

  return (
    <article className="apple-node-card" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Node header */}
      <div className="apple-node-top">
        <div className="apple-node-icon">{displayMeta.emoji}</div>
        <div className="apple-node-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <h3 className="apple-node-title">{displayMeta.label}</h3>
            {nodeHasChanges && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff9500", display: "inline-block", flexShrink: 0 }} title="미저장 변경사항" />
            )}
          </div>
          <p className="apple-node-desc">{displayMeta.description}</p>
        </div>
        <span className="apple-node-badge" style={{ background: statusOpt.bg, color: statusOpt.color }}>
          {statusOpt.label}
        </span>
      </div>

      {/* Status selector — hidden for client */}
      {showStatusControl && !isClient && (
        <div className="apple-section">
          <p className="apple-section-label">상태 변경</p>
          <SegControl
            options={STATUS_OPTIONS}
            value={effectiveStatus}
            onChange={(v) => onStatusChange(node.node_key, v)}
          />
        </div>
      )}

      {/* Sub-node checklist */}
      {effectiveSubNodes.length > 0 && (
        <div className="apple-section">
          <div className="apple-section-row">
            <p className="apple-section-label">태스크</p>
            <span className="apple-progress-chip" style={{ fontVariantNumeric: "tabular-nums" }}>{doneCount}/{effectiveSubNodes.length}</span>
          </div>
          <div className="apple-progress-bar">
            <div className="apple-progress-fill"
              style={{ width: `${effectiveSubNodes.length ? (doneCount / effectiveSubNodes.length) * 100 : 0}%`, background: allDone ? "var(--status-active)" : statusOpt.color, transition: "width 0.4s ease, background 0.3s" }} />
          </div>
          {allDone && (
            <div style={{ padding: "8px 12px", background: "var(--status-active-bg)", border: "1px solid rgba(52,199,89,0.15)", borderRadius: 8, textAlign: "center", fontSize: 13, fontWeight: 700, color: "var(--status-active)" }}>
              모든 설정이 완료되었습니다! 🎉
            </div>
          )}
          <ul className="apple-checklist">
            {sortedSubs.map((sn) => (
              <li key={sn.id} style={{ position: "relative" }}>
                <div className="apple-checklist-item" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label className="apple-checkbox-label" style={{ flex: 1, minWidth: 0 }}>
                    <input type="checkbox" className="apple-checkbox"
                      checked={sn.is_done}
                      disabled={isClient}
                      onChange={(e) => onTaskToggle(sn.id, e.target.checked)} />
                    <span style={{
                      color: sn.is_done ? "var(--tdim)" : "var(--text)",
                      textDecoration: sn.is_done ? "line-through" : "none",
                      textDecorationColor: sn.is_done ? "var(--tdim)" : undefined,
                      transition: "color 0.25s, text-decoration 0.25s",
                    }}>
                      {sn.label}
                    </span>
                  </label>
                  <GuidePanel
                    subNodeId={sn.id}
                    guideContent={sn.guide_content}
                    guideLinks={sn.guide_links ?? []}
                    role={role}
                    onSave={onUpdateGuide}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Existing logs */}
      {nodeLogs.length > 0 && (
        <div className="apple-section">
          <div className="apple-section-row">
            <p className="apple-section-label">활동 기록</p>
            <span className="apple-progress-chip">{nodeLogs.length}건</span>
          </div>
          <ul style={{ listStyle: "none", maxHeight: 320, overflowY: "auto" }}>
            {nodeLogs.map((log) => (
              <LogItem
                key={log.id}
                log={log}
                saving={globalSaving}
                readOnly={isClient}
                onUpdate={async (id, content) => { await updateLog(id, content); }}
                onDelete={async (id) => { await deleteLog(id); }}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Quick log composer — hidden for client */}
      {!isClient && (
        <div className="apple-section apple-log-form">
          {nodeLogs.length === 0 && <p className="apple-section-label">활동 기록</p>}
          <LogComposer
            nodeKey={node.node_key}
            saving={globalSaving}
            onCreate={createLog}
            clientId={clientId}
            accessToken={accessToken}
          />
        </div>
      )}
    </article>
  );
}

/* ── client edit modal ──────────────────────────────── */
const TIER_OPTIONS: PackageTier[] = ["entry", "basic", "standard", "premium", "platinum"];

function ClientEditModal({
  client,
  onSave,
  onClose,
}: {
  client: Client;
  onSave: (fields: Record<string, unknown>, logo?: File | null) => Promise<{ error: string | null }>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: client.name,
    region: client.region ?? "",
    contact_name: client.contact_name ?? "",
    contact_phone: client.contact_phone ?? "",
    contact_email: client.contact_email ?? "",
    package_tier: client.package_tier,
    contract_start: client.contract_start ?? "",
    memo: client.memo ?? "",
    solapi_pfid: client.solapi_pfid ?? "",
    solapi_sender_number: client.solapi_sender_number ?? "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(client.logo_url);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const applyLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setErr("이미지 파일만 가능합니다."); return; }
    if (file.size > 2 * 1024 * 1024) { setErr("로고 파일은 2MB 이하만 가능합니다."); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) applyLogoFile(file);
  };

  const handleLogoPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) { applyLogoFile(file); e.preventDefault(); return; }
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErr("병원명은 필수입니다."); return; }
    setSaving(true);
    setErr(null);
    const result = await onSave(form, logoFile);
    setSaving(false);
    if (result.error) { setErr(result.error); return; }
    onClose();
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: 14,
    border: "1px solid hsl(214 32% 91%)", borderRadius: 10,
    background: "hsl(210 40% 98%)", color: "hsl(222 47% 11%)",
    outline: "none", transition: "border-color 0.2s",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "hsl(222 47% 11%)", marginBottom: 4,
  };

  return createPortal(
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, padding: 28, width: 480, maxWidth: "92vw",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "hsl(222 47% 11%)", margin: "0 0 20px" }}>고객 정보 수정</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Logo upload */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 14 }}
            onPaste={handleLogoPaste}
            onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) applyLogoFile(file); }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div
              onClick={() => logoInputRef.current?.click()}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") logoInputRef.current?.click(); }}
              style={{
                width: 64, height: 64, borderRadius: 14, flexShrink: 0,
                border: "2px dashed hsl(214 32% 85%)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", background: "hsl(210 40% 98%)",
                transition: "border-color 0.2s",
              }}
            >
              {logoPreview
                ? <img src={logoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 24, color: "hsl(215 16% 72%)" }}>+</span>}
            </div>
            <div>
              <p style={{ ...labelStyle, marginBottom: 2 }}>로고</p>
              <p style={{ fontSize: 11, color: "hsl(215 16% 62%)", margin: 0 }}>
                클릭, 붙여넣기(Ctrl+V), 또는 드래그 (2MB 이하)
              </p>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
          </div>

          <div>
            <p style={labelStyle}>병원명 *</p>
            <input style={fieldStyle} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div>
            <p style={labelStyle}>지역</p>
            <input style={fieldStyle} value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="예: 서울 강남구" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <p style={labelStyle}>패키지</p>
              <select
                style={{ ...fieldStyle, cursor: "pointer" }}
                value={form.package_tier}
                onChange={(e) => set("package_tier", e.target.value)}
              >
                {TIER_OPTIONS.map((t) => (
                  <option key={t} value={t}>{PACKAGE_INFO[t].label} — {PACKAGE_INFO[t].price}</option>
                ))}
              </select>
            </div>
            <div>
              <p style={labelStyle}>계약 시작일</p>
              <input style={fieldStyle} type="date" value={form.contract_start} onChange={(e) => set("contract_start", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <p style={labelStyle}>담당자</p>
              <input style={fieldStyle} value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} placeholder="담당자 이름" />
            </div>
            <div>
              <p style={labelStyle}>담당자 연락처</p>
              <input style={fieldStyle} value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="010-0000-0000" />
            </div>
          </div>

          <div>
            <p style={labelStyle}>담당자 이메일</p>
            <input style={fieldStyle} type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} placeholder="email@example.com" />
          </div>

          <div>
            <p style={labelStyle}>메모</p>
            <textarea
              style={{ ...fieldStyle, minHeight: 70, resize: "vertical", fontFamily: "inherit" }}
              value={form.memo}
              onChange={(e) => set("memo", e.target.value)}
              placeholder="내부 메모"
            />
          </div>

          <div style={{ borderTop: "1px solid hsl(214 32% 91%)", paddingTop: 14, marginTop: 6 }}>
            <p style={{ ...labelStyle, fontSize: 13, marginBottom: 10 }}>솔라피 (메시징)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <p style={labelStyle}>카카오 채널 PFID</p>
                <input style={fieldStyle} value={form.solapi_pfid} onChange={(e) => set("solapi_pfid", e.target.value)} placeholder="KA01PF..." />
              </div>
              <div>
                <p style={labelStyle}>발신번호</p>
                <input style={fieldStyle} value={form.solapi_sender_number} onChange={(e) => set("solapi_sender_number", e.target.value)} placeholder="0312345678" />
              </div>
            </div>
          </div>
        </div>

        {err && <p style={{ marginTop: 12, color: "#e94560", fontSize: 13 }}>{err}</p>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" onClick={onClose} style={{
            padding: "8px 18px", fontSize: 13, borderRadius: 10, cursor: "pointer",
            border: "1px solid hsl(214 32% 91%)", background: "#fff", color: "hsl(215 16% 47%)",
          }}>취소</button>
          <button type="button" onClick={() => void handleSubmit()} disabled={saving} style={{
            padding: "8px 22px", fontSize: 13, fontWeight: 700, borderRadius: 10, cursor: "pointer",
            border: "none", background: "hsl(224 76% 40%)", color: "#fff",
            opacity: saving ? 0.5 : 1,
          }}>{saving ? "저장 중..." : "저장"}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── main component ─────────────────────────────────── */
export function ClientDetailView({ clientId }: { clientId: string }) {
  const { session, role } = useAuth();
  const { data, error, loading, saving, refresh, toggleSubNode, updateNodeStatus, createLog, updateLog, deleteLog, updateClient, updateGuide } =
    useClientDetail(clientId);

  // ── Global pending changes ──
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>(EMPTY_PENDING);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeView, setActiveView] = useState<"marketing" | "messaging">("marketing");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) return;
    setAvatarUploading(true);
    await updateClient({ name: data?.client.name ?? "" }, file);
    setAvatarUploading(false);
  };

  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwValue, setPwValue] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleResetPassword = async () => {
    setPwError(null);
    if (pwValue.length < 8) { setPwError("비밀번호는 8자 이상이어야 합니다."); return; }
    if (pwValue !== pwConfirm) { setPwError("비밀번호가 일치하지 않습니다."); return; }
    setPwSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ password: pwValue }),
      });
      const json = await res.json();
      if (!res.ok) { setPwError(json.error || "비밀번호 변경 실패"); setPwSaving(false); return; }
      setPwSuccess(true);
      setTimeout(() => { setPwModalOpen(false); setPwValue(""); setPwConfirm(""); setPwSuccess(false); }, 1500);
    } catch { setPwError("네트워크 오류"); }
    setPwSaving(false);
  };

  const changedNodeCount = Object.keys(pendingChanges.nodes).length;
  const changedTaskCount = Object.keys(pendingChanges.tasks).length;
  const hasChanges = changedNodeCount > 0 || changedTaskCount > 0;
  const changeCount = changedNodeCount + (changedTaskCount > 0 ? 1 : 0);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  const recordNodeStatusChange = useCallback((nodeKey: string, newStatus: NodeStatus) => {
    // If reverted to server value, remove from pending
    const serverNode = data?.nodes.find((n) => n.node_key === nodeKey);
    if (serverNode && serverNode.status === newStatus) {
      setPendingChanges((prev) => {
        const next = { ...prev, nodes: { ...prev.nodes } };
        delete next.nodes[nodeKey];
        return next;
      });
    } else {
      setPendingChanges((prev) => ({
        ...prev,
        nodes: { ...prev.nodes, [nodeKey]: { status: newStatus } },
      }));
    }
  }, [data?.nodes]);

  const recordTaskToggle = useCallback((taskId: string, checked: boolean) => {
    const original = data?.subNodes.find((s) => s.id === taskId);
    if (original && original.is_done === checked) {
      setPendingChanges((prev) => {
        const next = { ...prev, tasks: { ...prev.tasks } };
        delete next.tasks[taskId];
        return next;
      });
    } else {
      setPendingChanges((prev) => ({
        ...prev,
        tasks: { ...prev.tasks, [taskId]: checked },
      }));
    }
  }, [data?.subNodes]);

  const handleGlobalSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const promises: Promise<{ error: string | null }>[] = [];

      for (const [nodeKey, changes] of Object.entries(pendingChanges.nodes)) {
        promises.push(updateNodeStatus(nodeKey, changes.status));
      }

      for (const [taskId, checked] of Object.entries(pendingChanges.tasks)) {
        promises.push(toggleSubNode(taskId, checked));
      }

      const results = await Promise.all(promises);
      const hasError = results.some((r) => r.error !== null);

      if (!hasError) {
        setPendingChanges(EMPTY_PENDING);
        setSaveSuccess(true);
        await refresh();
        setTimeout(() => setSaveSuccess(false), 1200);
      }
    } catch {
      // Keep pending changes on error
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges, updateNodeStatus, toggleSubNode, refresh]);

  const handleGlobalDiscard = useCallback(() => {
    setPendingChanges(EMPTY_PENDING);
  }, []);

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

  const isClient = role === "client";
  const allowedKeys = PACKAGE_NODE_ACCESS[data.client.package_tier] ?? [];
  const sortedNodes = data.nodes
    .slice()
    .filter((n) => allowedKeys.includes(n.node_key))
    .sort((a, b) => NODE_META[a.node_key].order - NODE_META[b.node_key].order);

  const accessToken = session?.access_token ?? "";

  return (
    <div className="dashboard-content">

      {/* ── Top: client info (full width) ── */}
      <section>
        <div className="apple-info-card">
          <div className="apple-info-header">
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div
              className="apple-info-avatar"
              style={{ cursor: isClient ? undefined : "pointer", position: "relative", opacity: avatarUploading ? 0.5 : 1 }}
              onClick={() => { if (!isClient) avatarInputRef.current?.click(); }}
              onPaste={(e) => {
                if (isClient) return;
                const items = e.clipboardData?.items;
                if (!items) return;
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.startsWith("image/")) {
                    const file = items[i].getAsFile();
                    if (file) { void handleAvatarFile(file); e.preventDefault(); return; }
                  }
                }
              }}
              onDrop={(e) => {
                if (isClient) return;
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) void handleAvatarFile(file);
              }}
              onDragOver={(e) => { if (!isClient) e.preventDefault(); }}
              tabIndex={isClient ? undefined : 0}
              onKeyDown={(e) => { if (!isClient && (e.key === "Enter" || e.key === " ")) avatarInputRef.current?.click(); }}
            >
              {data.client.logo_url
                ? <img src={data.client.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
                : data.client.name.slice(0, 1)}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleAvatarFile(f); e.target.value = ""; }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="apple-info-name">{data.client.name}</h2>
              <p className="apple-info-sub">{data.client.region || "지역 미입력"}</p>
            </div>
            {!isClient && (
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {data.client.auth_user_id && (
                  <button type="button" onClick={() => { setPwModalOpen(true); setPwValue(""); setPwConfirm(""); setPwError(null); setPwSuccess(false); }} style={{
                    padding: "5px 14px", fontSize: 12, fontWeight: 600, borderRadius: 8,
                    border: "1.5px solid hsl(0 70% 50%)", background: "transparent",
                    color: "hsl(0 70% 50%)", cursor: "pointer", transition: "all 0.2s",
                  }}>비밀번호 재설정</button>
                )}
                <button type="button" onClick={() => setEditModalOpen(true)} style={{
                  padding: "5px 14px", fontSize: 12, fontWeight: 600, borderRadius: 8,
                  border: "1.5px solid hsl(224 76% 40%)", background: "transparent",
                  color: "hsl(224 76% 40%)", cursor: "pointer", transition: "all 0.2s",
                }}>수정</button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {/* Left: info fields */}
            <div className="apple-meta-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", flex: "0 0 auto", width: data.client.memo ? "50%" : "100%" }}>
              <div className="apple-meta-item">
                <span className="apple-meta-label">패키지</span>
                <span className="apple-meta-value" style={{ color: PACKAGE_INFO[data.client.package_tier].color, fontWeight: 700 }}>
                  {PACKAGE_INFO[data.client.package_tier].label}
                </span>
              </div>
              <div className="apple-meta-item">
                <span className="apple-meta-label">계약 시작</span>
                <span className="apple-meta-value">{data.client.contract_start || "미정"}</span>
              </div>
              <div className="apple-meta-item">
                <span className="apple-meta-label">담당자</span>
                <span className="apple-meta-value">{data.client.contact_name || "—"}</span>
              </div>
              <div className="apple-meta-item">
                <span className="apple-meta-label">연락처</span>
                <span className="apple-meta-value">{data.client.contact_phone || "—"}</span>
              </div>
              <div className="apple-meta-item">
                <span className="apple-meta-label">이메일</span>
                <span className="apple-meta-value">{data.client.contact_email || "—"}</span>
              </div>
            </div>

            {/* Right: memo */}
            {data.client.memo && (
              <div style={{
                flex: 1, padding: 16, borderRadius: 12,
                background: "hsl(210 40% 98%)", border: "1px solid hsl(214 32% 91%)",
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "hsl(215 16% 52%)", textTransform: "uppercase", letterSpacing: "0.5px" }}>메모</span>
                <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.8, color: "hsl(222 47% 20%)", whiteSpace: "pre-wrap" }}>{data.client.memo}</p>
              </div>
            )}
          </div>

          {editModalOpen && (
            <ClientEditModal
              client={data.client}
              onSave={updateClient}
              onClose={() => setEditModalOpen(false)}
            />
          )}

          {pwModalOpen && createPortal(
            <div onClick={() => setPwModalOpen(false)} style={{
              position: "fixed", inset: 0, zIndex: 99999,
              background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div onClick={(e) => e.stopPropagation()} style={{
                background: "#fff", borderRadius: 16, padding: 28, width: 400, maxWidth: "92vw",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "hsl(222 47% 11%)", margin: "0 0 6px" }}>비밀번호 재설정</h2>
                <p style={{ fontSize: 13, color: "hsl(215 16% 52%)", margin: "0 0 20px" }}>{data.client.contact_email}</p>

                {pwSuccess ? (
                  <p style={{ color: "hsl(142 70% 40%)", fontWeight: 700, fontSize: 14, textAlign: "center", padding: "20px 0" }}>비밀번호가 변경되었습니다.</p>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "hsl(222 47% 11%)", marginBottom: 4 }}>새 비밀번호</p>
                        <input
                          type="password"
                          value={pwValue}
                          onChange={(e) => setPwValue(e.target.value)}
                          placeholder="8자 이상"
                          style={{
                            width: "100%", padding: "10px 14px", fontSize: 14,
                            border: "1px solid hsl(214 32% 91%)", borderRadius: 10,
                            background: "hsl(210 40% 98%)", color: "hsl(222 47% 11%)", outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "hsl(222 47% 11%)", marginBottom: 4 }}>비밀번호 확인</p>
                        <input
                          type="password"
                          value={pwConfirm}
                          onChange={(e) => setPwConfirm(e.target.value)}
                          placeholder="비밀번호 재입력"
                          style={{
                            width: "100%", padding: "10px 14px", fontSize: 14,
                            border: "1px solid hsl(214 32% 91%)", borderRadius: 10,
                            background: "hsl(210 40% 98%)", color: "hsl(222 47% 11%)", outline: "none",
                          }}
                        />
                      </div>
                    </div>
                    {pwError && <p style={{ marginTop: 10, color: "#e94560", fontSize: 13 }}>{pwError}</p>}
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                      <button type="button" onClick={() => setPwModalOpen(false)} style={{
                        padding: "8px 18px", fontSize: 13, borderRadius: 10, cursor: "pointer",
                        border: "1px solid hsl(214 32% 91%)", background: "#fff", color: "hsl(215 16% 47%)",
                      }}>취소</button>
                      <button type="button" onClick={() => void handleResetPassword()} disabled={pwSaving} style={{
                        padding: "8px 22px", fontSize: 13, fontWeight: 700, borderRadius: 10, cursor: "pointer",
                        border: "none", background: "hsl(0 70% 50%)", color: "#fff",
                        opacity: pwSaving ? 0.5 : 1,
                      }}>{pwSaving ? "변경 중..." : "비밀번호 변경"}</button>
                    </div>
                  </>
                )}
              </div>
            </div>,
            document.body,
          )}
        </div>
      </section>

      {/* ── View Toggle: 마케팅 현황 | 메시징 ── */}
      <section style={{ marginBottom: 4 }}>
        <div className="apple-seg" style={{ display: "inline-flex" }}>
          <button type="button"
            className={`apple-seg-btn${activeView === "marketing" ? " apple-seg-active" : ""}`}
            onClick={() => setActiveView("marketing")}
            style={activeView === "marketing" ? { background: "var(--accent-bg)", color: "var(--gP)", borderColor: "var(--accent-border)" } : {}}
          >
            {activeView === "marketing" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gP)", display: "inline-block" }} />}
            마케팅 현황
          </button>
          <button type="button"
            className={`apple-seg-btn${activeView === "messaging" ? " apple-seg-active" : ""}`}
            onClick={() => setActiveView("messaging")}
            style={activeView === "messaging" ? { background: "var(--accent-bg)", color: "var(--gP)", borderColor: "var(--accent-border)" } : {}}
          >
            {activeView === "messaging" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gP)", display: "inline-block" }} />}
            💬 메시징
          </button>
        </div>
      </section>

      {/* ── Messaging View ── */}
      {activeView === "messaging" && (
        <section>
          <MessagingView clientId={clientId} clientName={data.client.name} />
        </section>
      )}

      {/* ── Marketing View (기존 코드) ── */}
      {activeView === "marketing" && (
      <>
      {/* ── Node cards ── */}
      <section className="apple-node-grid">
        {sortedNodes.flatMap((node) => {
          const subNodes  = groupedSubNodes[node.node_key] ?? [];
          const nodeLogs  = groupedLogs[node.node_key] ?? [];

          // lead_nurture → split into 환자 설득 + 방문 예정 cards
          if (node.node_key === "lead_nurture") {
            return Object.entries(LEAD_NURTURE_SPLIT).map(([splitKey, splitMeta]) => {
              const [minSort, maxSort] = splitMeta.sortRange;
              const splitSubs = subNodes.filter((s) => s.sort_order >= minSort && s.sort_order <= maxSort);

              return (
                <NodeCard
                  key={`${node.id}-${splitKey}`}
                  node={node}
                  subNodes={splitSubs}
                  nodeLogs={nodeLogs}
                  displayMeta={splitMeta}
                  showStatusControl
                  saving={saving}
                  pendingChanges={pendingChanges}
                  onStatusChange={recordNodeStatusChange}
                  onTaskToggle={recordTaskToggle}
                  createLog={createLog}
                  updateLog={updateLog}
                  deleteLog={deleteLog}
                  onUpdateGuide={updateGuide}
                  clientId={clientId}
                  accessToken={accessToken}
                  role={role}
                />
              );
            });
          }

          // Normal node card
          const meta = NODE_META[node.node_key];
          return [(
            <NodeCard
              key={node.id}
              node={node}
              subNodes={subNodes}
              nodeLogs={nodeLogs}
              displayMeta={meta}
              showStatusControl
              saving={saving}
              pendingChanges={pendingChanges}
              onStatusChange={recordNodeStatusChange}
              onTaskToggle={recordTaskToggle}
              createLog={createLog}
              updateLog={updateLog}
              deleteLog={deleteLog}
              onUpdateGuide={updateGuide}
              clientId={clientId}
              accessToken={accessToken}
              role={role}
            />
          )];
        })}
      </section>

      {/* ── Activity log (below node cards) ── */}
      <section>
        <div className="apple-log-card">
          <div className="apple-log-header">
            <span className="sec-label" style={{ marginBottom: 0 }}>전체 활동 로그</span>
            <span className="apple-log-count">{data.activityLogs.length}건</span>
          </div>
          <ul className="apple-log-list" style={{ maxHeight: 480, overflowY: "auto" }}>
            {[...data.activityLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((log) => (
              <li key={log.id} className="apple-log-item">
                <div className="apple-log-dot" style={{ background: log.visible_to_client ? "var(--status-active)" : "#5a6374" }} />
                <div className="apple-log-body">
                  <span className="apple-log-node">
                    {NODE_META[log.node_key].emoji} {NODE_META[log.node_key].label}
                    {" · "}
                    <span style={{ color: LOG_TYPE_META[log.log_type ?? (log.visible_to_client ? "work" : "memo")].color }}>
                      {LOG_TYPE_META[log.log_type ?? (log.visible_to_client ? "work" : "memo")].label}
                    </span>
                  </span>
                  <span className="apple-log-content">{log.content}</span>
                  {(log.image_urls?.length ?? 0) > 0 && (
                    <span style={{ fontSize: 10, color: "var(--tdim)", marginLeft: 4 }}>📎 {log.image_urls.length}</span>
                  )}
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

      </>
      )}

      {/* ── Global floating save toast — hidden for client ── */}
      {role !== "client" && (hasChanges || saveSuccess) && (
        <GlobalSaveToast
          count={changeCount}
          onSave={() => void handleGlobalSave()}
          onDiscard={handleGlobalDiscard}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
        />
      )}
    </div>
  );
}
