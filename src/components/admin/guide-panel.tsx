"use client";

import { useCallback, useState } from "react";
import type { AuthRole, GuideLink } from "@/lib/types";

interface GuidePanelProps {
  subNodeId: string;
  guideContent: string | null;
  guideLinks: GuideLink[];
  role: AuthRole;
  onSave: (subNodeId: string, content: string | null, links: GuideLink[]) => Promise<{ error: string | null }>;
}

export function GuidePanel({ subNodeId, guideContent, guideLinks, role, onSave }: GuidePanelProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(guideContent ?? "");
  const [draftLinks, setDraftLinks] = useState<GuideLink[]>(guideLinks);

  const isSuperAdmin = role === "super_admin";
  const hasGuide = Boolean(guideContent?.trim()) || guideLinks.length > 0;

  // client: hide icon if no guide
  if (role === "client" && !hasGuide) return null;

  const startEdit = () => {
    setDraft(guideContent ?? "");
    setDraftLinks(guideLinks.length > 0 ? [...guideLinks] : []);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(guideContent ?? "");
    setDraftLinks(guideLinks);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    const result = await onSave(
      subNodeId,
      draft.trim() || null,
      draftLinks.filter((l) => l.label.trim() && l.url.trim()),
    );
    setSaving(false);
    if (!result.error) {
      setEditing(false);
    }
  }, [subNodeId, draft, draftLinks, onSave]);

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    setDraftLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const addLink = () => setDraftLinks((prev) => [...prev, { label: "", url: "" }]);
  const removeLink = (index: number) => setDraftLinks((prev) => prev.filter((_, i) => i !== index));

  return (
    <span className="guide-wrapper">
      {/* ⓘ icon button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="guide-icon-btn"
        title="실행 가이드"
        style={{
          width: 18, height: 18, borderRadius: "50%",
          border: hasGuide ? "1px solid #4a9eff" : "1px solid var(--border)",
          background: hasGuide ? "rgba(74,158,255,0.1)" : "transparent",
          color: hasGuide ? "#4a9eff" : "var(--tdim)",
          fontSize: 10, fontWeight: 700, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        ⓘ
      </button>

      {/* Guide content panel */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 8, padding: 12,
            background: "#060611",
            border: "1px solid #1e1e32",
            borderLeft: "3px solid #4a9eff",
            borderRadius: 8,
          }}
        >
          {editing && isSuperAdmin ? (
            /* ── Edit mode (super_admin only) ── */
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={"실행 가이드를 작성하세요...\n\n1. 첫 번째 단계\n2. 두 번째 단계"}
                style={{
                  width: "100%", minHeight: 100, background: "#0a0a1a",
                  border: "1px solid #1e1e32", borderRadius: 8, padding: 10,
                  color: "#eaeaef", fontSize: 13, lineHeight: 1.7,
                  resize: "vertical", fontFamily: "inherit", outline: "none",
                }}
              />

              {/* Links editor */}
              <div>
                <span style={{ fontSize: 11, color: "#72728a" }}>🔗 링크</span>
                {draftLinks.map((link, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <input
                      placeholder="라벨"
                      value={link.label}
                      onChange={(e) => updateLink(i, "label", e.target.value)}
                      style={{
                        flex: 1, padding: "5px 8px", fontSize: 12,
                        background: "#0a0a1a", border: "1px solid #1e1e32",
                        borderRadius: 6, color: "#eaeaef", outline: "none",
                      }}
                    />
                    <input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      style={{
                        flex: 2, padding: "5px 8px", fontSize: 12,
                        background: "#0a0a1a", border: "1px solid #1e1e32",
                        borderRadius: 6, color: "#eaeaef", outline: "none",
                      }}
                    />
                    <button type="button" onClick={() => removeLink(i)}
                      style={{ color: "#e94560", background: "none", border: "none", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addLink}
                  style={{
                    marginTop: 6, padding: "3px 10px", fontSize: 11,
                    color: "#4a9eff", background: "transparent",
                    border: "1px dashed rgba(74,158,255,0.3)",
                    borderRadius: 6, cursor: "pointer",
                  }}>
                  + 링크 추가
                </button>
              </div>

              {/* Save / Cancel */}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" onClick={cancelEdit}
                  style={{
                    padding: "5px 12px", fontSize: 12, color: "#72728a",
                    background: "transparent", border: "1px solid #1e1e32",
                    borderRadius: 8, cursor: "pointer",
                  }}>
                  취소
                </button>
                <button type="button" onClick={() => void handleSave()} disabled={saving}
                  style={{
                    padding: "5px 14px", fontSize: 12, fontWeight: 700,
                    color: "#fff", background: "#4a9eff", border: "none",
                    borderRadius: 8, cursor: "pointer",
                    opacity: saving ? 0.5 : 1,
                  }}>
                  {saving ? "저장 중..." : "가이드 저장"}
                </button>
              </div>
            </div>
          ) : (
            /* ── Read mode ── */
            <div>
              {hasGuide ? (
                <>
                  {guideContent && (
                    <p style={{ fontSize: 13, color: "#c8c8d4", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                      {guideContent}
                    </p>
                  )}
                  {guideLinks.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {guideLinks.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, color: "#4a9eff", textDecoration: "none" }}>
                          🔗 {link.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontSize: 12, color: "#72728a", margin: 0 }}>아직 가이드가 없습니다</p>
              )}
              {isSuperAdmin && (
                <button type="button" onClick={startEdit}
                  style={{
                    marginTop: 8, padding: "3px 10px", fontSize: 11,
                    color: "#72728a", background: "transparent",
                    border: "1px solid #1e1e32", borderRadius: 6, cursor: "pointer",
                  }}>
                  {hasGuide ? "수정" : "가이드 작성"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </span>
  );
}
