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
    <>
      {/* ⓘ icon button — inline, sits at far right of checkbox row */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="guide-icon-btn"
        title="실행 가이드"
        style={{
          width: 24, height: 24, borderRadius: "50%",
          border: hasGuide ? "1.5px solid hsl(224 76% 48%)" : "1.5px solid hsl(214 32% 85%)",
          background: hasGuide ? "hsla(224, 76%, 48%, 0.08)" : "transparent",
          color: hasGuide ? "hsl(224 76% 48%)" : "hsl(215 16% 62%)",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 0.2s",
        }}
      >
        ⓘ
      </button>

      {/* Guide content panel — expands below the checkbox row */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", left: 0, right: 0, top: "100%",
            marginTop: 6, padding: 14,
            background: "#ffffff",
            border: "1px solid hsl(214 32% 91%)",
            borderLeft: "3px solid hsl(224 76% 48%)",
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            zIndex: 10,
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
                  width: "100%", minHeight: 100, background: "hsl(210 40% 98%)",
                  border: "1px solid hsl(214 32% 91%)", borderRadius: 8, padding: 10,
                  color: "hsl(222 47% 11%)", fontSize: 13, lineHeight: 1.7,
                  resize: "vertical", fontFamily: "inherit", outline: "none",
                }}
              />

              {/* Links editor */}
              <div>
                <span style={{ fontSize: 11, color: "hsl(215 16% 52%)" }}>🔗 링크</span>
                {draftLinks.map((link, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <input
                      placeholder="라벨"
                      value={link.label}
                      onChange={(e) => updateLink(i, "label", e.target.value)}
                      style={{
                        flex: 1, padding: "5px 8px", fontSize: 12,
                        background: "hsl(210 40% 98%)", border: "1px solid hsl(214 32% 91%)",
                        borderRadius: 6, color: "hsl(222 47% 11%)", outline: "none",
                      }}
                    />
                    <input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      style={{
                        flex: 2, padding: "5px 8px", fontSize: 12,
                        background: "hsl(210 40% 98%)", border: "1px solid hsl(214 32% 91%)",
                        borderRadius: 6, color: "hsl(222 47% 11%)", outline: "none",
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
                    color: "hsl(224 76% 48%)", background: "transparent",
                    border: "1px dashed hsla(224, 76%, 48%, 0.3)",
                    borderRadius: 6, cursor: "pointer",
                  }}>
                  + 링크 추가
                </button>
              </div>

              {/* Save / Cancel */}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" onClick={cancelEdit}
                  style={{
                    padding: "5px 12px", fontSize: 12, color: "hsl(215 16% 52%)",
                    background: "transparent", border: "1px solid hsl(214 32% 91%)",
                    borderRadius: 8, cursor: "pointer",
                  }}>
                  취소
                </button>
                <button type="button" onClick={() => void handleSave()} disabled={saving}
                  style={{
                    padding: "5px 14px", fontSize: 12, fontWeight: 700,
                    color: "#fff", background: "hsl(224 76% 48%)", border: "none",
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
                    <p style={{ fontSize: 13, color: "hsl(222 47% 25%)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                      {guideContent}
                    </p>
                  )}
                  {guideLinks.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {guideLinks.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, color: "hsl(224 76% 48%)", textDecoration: "none" }}>
                          🔗 {link.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontSize: 12, color: "hsl(215 16% 62%)", margin: 0 }}>아직 가이드가 없습니다</p>
              )}
              {isSuperAdmin && (
                <button type="button" onClick={startEdit}
                  style={{
                    marginTop: 8, padding: "4px 12px", fontSize: 11,
                    color: "hsl(224 76% 48%)", background: "hsla(224, 76%, 48%, 0.06)",
                    border: "1px solid hsla(224, 76%, 48%, 0.15)",
                    borderRadius: 6, cursor: "pointer",
                  }}>
                  {hasGuide ? "수정" : "가이드 작성"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
