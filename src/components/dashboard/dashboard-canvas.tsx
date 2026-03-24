"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NODE_META, ALL_NODE_KEYS, PACKAGE_INFO, PACKAGE_NODE_ACCESS, isNodeLocked, getMinimumPackageForNode, LEAD_NURTURE_SPLIT } from "@/lib/constants";
import { UpgradeModal } from "@/components/UpgradeModal";
import { SharedKnockSystem, DEFAULT_PIPELINE_ROWS, DEFAULT_SEGMENTS } from "@/components/knock-system/SharedKnockSystem";
import type { DashboardNodeStatus } from "@/components/knock-system/SharedKnockSystem";
import { PackageBadge } from "@/components/PackageBadge";
import type { ActivityLog, ActionType, Client, NodeKey, NodeRecord, NodeStatus, PackageTier } from "@/lib/types";

/* ── image lightbox ───────────────────────────────────── */
function ImageLightbox({ urls }: { urls: string[] }) {
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
              width: 120, height: 80, objectFit: "cover", borderRadius: 8,
              border: "1px solid var(--border)", cursor: "pointer",
            }}
          />
        ))}
      </div>
      {overlay}
    </>
  );
}

/* ── status colour tokens ─────────────────────────────── */
const SC: Record<NodeStatus, string> = {
  active:      "var(--status-active)",
  in_progress: "var(--status-progress)",
  inactive:    "var(--status-inactive)",
};
const SB: Record<NodeStatus, string> = {
  active:      "var(--status-active-bg)",
  in_progress: "var(--status-progress-bg)",
  inactive:    "var(--status-inactive-bg)",
};
const SL: Record<NodeStatus, string> = {
  active:      "완료",
  in_progress: "진행 중",
  inactive:    "대기",
};

const ACTION_LABEL: Record<ActionType, string> = {
  note:          "메모",
  task_complete: "작업 완료",
  status_change: "상태 변경",
  file_upload:   "파일 업로드",
};
const ACTION_ICON: Record<ActionType, string> = {
  note:          "\uD83D\uDCDD",
  task_complete: "\u2705",
  status_change: "\uD83D\uDD04",
  file_upload:   "\uD83D\uDCCE",
};
const ACTION_COLOR: Record<ActionType, string> = {
  note:          "var(--gP)",
  task_complete: "var(--gG)",
  status_change: "var(--gW)",
  file_upload:   "var(--gPu)",
};

/* ── helpers ───────────────────────────────────────────── */
function getDateGroup(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays <= 7) return "이번 주";
  return "이전";
}

const URL_RE = /https?:\/\/[^\s<>"']+/g;

function linkify(text: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  URL_RE.lastIndex = 0;

  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const url = match[0];
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "var(--gP)",
          textDecoration: "underline",
          textDecorationColor: "var(--accent-hover)",
          textUnderlineOffset: 3,
          wordBreak: "break-all",
        }}
      >
        {url}
      </a>,
    );
    last = match.index + url.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}


/* ── log modal ─────────────────────────────────────────── */
function LogModal({ nodeKey, displayKey, logs, onClose }: { nodeKey: NodeKey; displayKey?: string; logs: ActivityLog[]; onClose: () => void }) {
  // If displayKey is "qualified", show 방문 예정 info instead of 환자 설득
  const isQualified = displayKey === "qualified";
  const splitInfo = isQualified ? LEAD_NURTURE_SPLIT.qualified : null;
  const meta      = splitInfo
    ? { ...NODE_META[nodeKey], label: splitInfo.label, emoji: splitInfo.emoji, description: splitInfo.description }
    : NODE_META[nodeKey];
  const nodeLogs  = logs.filter((l) => l.node_key === nodeKey);

  return (
    <div
      className="popup-overlay show"
      onClick={onClose}
      aria-modal="true"
    >
      <div
        className="popup"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 600 }}
      >
        <button className="popup-close" onClick={onClose} type="button">✕</button>

        <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          {meta.emoji} {meta.label}
        </h3>
        <p style={{ fontSize: 14, color: "var(--tsub)", marginBottom: 20 }}>{meta.description}</p>

        {nodeLogs.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>📋</div>
            <p style={{ fontSize: 15, color: "var(--tsub)", fontWeight: 600, marginBottom: 4 }}>아직 활동 기록이 없습니다</p>
            <p style={{ fontSize: 13, color: "var(--tdim)" }}>곧 마케팅 활동이 시작됩니다!</p>
          </div>
        ) : (
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {(() => {
              const groups: Record<string, ActivityLog[]> = {};
              for (const log of nodeLogs) {
                const group = getDateGroup(log.created_at);
                if (!groups[group]) groups[group] = [];
                groups[group].push(log);
              }
              return Object.entries(groups).map(([group, groupLogs]) => (
                <div key={group}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tdim)", textTransform: "uppercase", letterSpacing: "0.5px", padding: "12px 0 6px", borderBottom: "1px solid var(--overlay-3)" }}>
                    {group}
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 0 }}>
                    {groupLogs.map((log) => (
                      <li key={log.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--overlay-3)", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                            background: `${ACTION_COLOR[log.action_type]}1a`,
                            color: ACTION_COLOR[log.action_type],
                            border: `1px solid ${ACTION_COLOR[log.action_type]}33`,
                          }}>
                            {ACTION_ICON[log.action_type]} {ACTION_LABEL[log.action_type]}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--tdim)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                            {new Date(log.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {linkify(log.content)}
                        </p>
                        {log.attachment_url && (
                          <a href={log.attachment_url} target="_blank" rel="noopener noreferrer" style={{
                            display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                            background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--gP)", textDecoration: "none", width: "fit-content",
                          }}>
                            📎 첨부 파일 열기
                          </a>
                        )}
                        {(log.image_urls?.length ?? 0) > 0 && (
                          <ImageLightbox urls={log.image_urls} />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── QualifiedLeadPopup ─────────────────────────────────── */
function QualifiedLeadPopup({ logs, onClose }: { logs: ActivityLog[]; onClose: () => void }) {
  const nurtureLogs = logs.filter((l) => l.node_key === "lead_nurture");

  const ITEMS = [
    { icon: "📅", title: "예약 확정 + 리마인드", desc: "유망 리드 예약 일정 확정 후 리마인드 메시지 자동 발송", color: "var(--status-active)" },
    { icon: "🎁", title: "초진 이벤트 기획", desc: "첫 내원 환자 대상 특별 혜택 · 이벤트 설계 및 발송", color: "var(--gold-warm)" },
    { icon: "📍", title: "오시는 길 문자 발송", desc: "예약 확정 시 위치·주차 안내 자동 발송으로 내원율 향상", color: "var(--gP)" },
    { icon: "📊", title: "리드 전환 추적", desc: "유망 리드 → 예약 → 내원까지의 전환율 실시간 모니터링", color: "#E040FB" },
  ];

  return (
    <div className="popup-overlay show" onClick={onClose} aria-modal="true">
      <div className="popup" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <button className="popup-close" onClick={onClose} type="button">✕</button>

        <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          ⭐ 유망 리드
        </h3>
        <p style={{ fontSize: 14, color: "var(--tsub)", marginBottom: 20 }}>
          예약 확정 · 초진 이벤트 · 내원 유도까지 관리
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {ITEMS.map((item) => (
            <div key={item.title} style={{
              padding: "14px 16px", borderRadius: 12,
              background: "var(--overlay-2)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${item.color}14`, border: `1px solid ${item.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
              }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "var(--tsub)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {nurtureLogs.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--tdim)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              최근 활동
            </div>
            <div style={{ maxHeight: "30vh", overflowY: "auto" }}>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 0 }}>
                {nurtureLogs.slice(0, 8).map((log) => (
                  <li key={log.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--overlay-3)", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                        background: `${ACTION_COLOR[log.action_type]}1a`,
                        color: ACTION_COLOR[log.action_type],
                        border: `1px solid ${ACTION_COLOR[log.action_type]}33`,
                      }}>
                        {ACTION_ICON[log.action_type]} {ACTION_LABEL[log.action_type]}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--tdim)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                        {new Date(log.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {linkify(log.content)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── PlatinumUpgradePopup ──────────────────────────────── */
function PlatinumUpgradePopup({ currentTier, clientName, onClose }: { currentTier: PackageTier; clientName: string; onClose: () => void }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const currentInfo = PACKAGE_INFO[currentTier];
  const platInfo = PACKAGE_INFO.platinum;

  const BENEFITS = [
    { icon: "📞", title: "전화 응대 전담", desc: "전문 상담사가 모든 신환 전화를 직접 응대", color: "var(--gold)" },
    { icon: "💬", title: "채팅 응대 전담", desc: "카카오톡·네이버톡톡 실시간 채팅 응대 대행", color: "var(--gold-warm)" },
    { icon: "🏥", title: "신환 유입 책임제", desc: "성과 기반 인센티브 — 신환 유입 결과에 책임", color: "#E94560" },
    { icon: "📊", title: "VIP 전용 리포트", desc: "주간 콜 분석·전환율·예약률 전용 대시보드 제공", color: "var(--status-active)" },
    { icon: "🎯", title: "풀 퍼널 최적화", desc: "인지부터 재방문까지 전 과정 통합 관리·최적화", color: "var(--gP)" },
  ];

  return (
    <div className="popup-overlay show" onClick={onClose} aria-modal="true">
      <div className="popup" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, textAlign: "center" }}>
        <button className="popup-close" onClick={onClose} type="button">✕</button>

        {/* Crown icon */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--gold-border), var(--gold-bg))",
          border: "2px solid var(--gold-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 36,
          boxShadow: "0 0 40px var(--gold-bg)",
          animation: "floatGlow 3s ease-in-out infinite",
        }}>👑</div>

        <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, color: "var(--gold)" }}>
          Platinum 전환 안내
        </h3>
        <p style={{ fontSize: 14, color: "var(--tsub)", lineHeight: 1.7, marginBottom: 24 }}>
          전문 상담사가 전화·채팅을 직접 응대하여<br />
          <strong style={{ color: "var(--gold)" }}>신환 유입을 책임</strong>집니다
        </p>

        {/* Current → Platinum comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <div style={{ background: "var(--overlay-2)", border: `1px solid ${currentInfo.color}33`, borderRadius: 12, padding: "14px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tdim)", marginBottom: 6, textTransform: "uppercase" }}>현재 패키지</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: currentInfo.color, marginBottom: 4 }}>{currentInfo.label}</div>
            <div style={{ fontSize: 12, color: "var(--tsub)" }}>{currentInfo.price}</div>
          </div>
          <div style={{ fontSize: 20, color: "var(--tdim)" }}>→</div>
          <div style={{ background: "var(--gold-bg)", border: "1px solid var(--gold-border)", borderRadius: 12, padding: "14px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tdim)", marginBottom: 6, textTransform: "uppercase" }}>추천 패키지</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "var(--gold)", marginBottom: 4 }}>Platinum</div>
            <div style={{ fontSize: 12, color: "var(--tsub)" }}>{platInfo.price}</div>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ textAlign: "left", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tdim)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            Platinum 전용 혜택
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BENEFITS.map((b) => (
              <div key={b.title} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10,
                background: "var(--overlay-1)", border: "1px solid var(--border)",
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: b.color }}>{b.title}</div>
                  <div style={{ fontSize: 11, color: "var(--tsub)" }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{
          background: "var(--overlay-2)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8,
          textAlign: "left", marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tdim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>담당자 연락처</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            <span style={{ fontSize: 16 }}>👤</span>
            <span style={{ color: "var(--text)", fontWeight: 600 }}>박성찬</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            <span style={{ fontSize: 16 }}>📞</span>
            <a href="tel:010-5565-0261" style={{ color: "var(--gP)", textDecoration: "none", fontWeight: 600 }}>010-5565-0261</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            <span style={{ fontSize: 16 }}>✉️</span>
            <a href="mailto:contact@knockai.com" style={{ color: "var(--gP)", textDecoration: "none", fontWeight: 600 }}>contact@knockai.com</a>
          </div>
        </div>

        {/* Button */}
        {sent ? (
          <div style={{
            padding: "14px 0", borderRadius: 12,
            background: "var(--status-active-bg)", color: "var(--status-active)",
            fontSize: 15, fontWeight: 800, textAlign: "center",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>✓</span> 문의가 접수되었습니다
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} type="button" style={{
              flex: 1, padding: "12px 0", borderRadius: 10,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--tsub)", fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>닫기</button>
            <button onClick={async () => {
              setSending(true);
              try {
                const { getSupabaseBrowserClient } = await import("@/lib/supabase");
                const supabase = getSupabaseBrowserClient();
                if (supabase) {
                  await supabase.from("inquiries").insert({
                    inquiry_type: "upgrade",
                    current_tier: currentTier,
                    target_tier: "platinum",
                    message: `${clientName}님이 Platinum 전환을 문의했습니다.`,
                  });
                }
                setSent(true);
                setTimeout(onClose, 3000);
              } catch { /* ignore */ } finally { setSending(false); }
            }} disabled={sending} type="button" style={{
              flex: 1, padding: "12px 0", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, var(--gold), var(--gold-warm))",
              color: "#1a1a2e", fontSize: 15, fontWeight: 800,
              cursor: sending ? "not-allowed" : "pointer",
              opacity: sending ? 0.6 : 1,
            }}>
              {sending ? "전송 중..." : "Platinum 문의하기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── main component ────────────────────────────────────── */
interface Props {
  client: Client;
  nodes: NodeRecord[];
  logs: ActivityLog[];
}

export function DashboardCanvas({ client, nodes, logs }: Props) {
  const [selectedKey, setSelectedKey] = useState<NodeKey | null>(null);
  const [selectedDisplayKey, setSelectedDisplayKey] = useState<string | null>(null);
  const [lockedKey, setLockedKey] = useState<NodeKey | null>(null);
  const [showQualified, setShowQualified] = useState(false);
  const [showPlatinumUpgrade, setShowPlatinumUpgrade] = useState(false);

  const locked = (key: string) => isNodeLocked(key, client.package_tier);

  /** 노드 클릭 핸들러 — 잠긴 노드는 업그레이드 팝업, 열린 노드는 로그 모달 */
  const handleNodeClick = (dbKey: NodeKey, displayKey?: string) => {
    if (locked(dbKey)) {
      setLockedKey(dbKey);
    } else {
      setSelectedKey(dbKey);
      setSelectedDisplayKey(displayKey ?? null);
    }
  };

  // 패키지 비교표 CTA에서 보내는 이벤트 수신
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.nodeKey) setLockedKey(detail.nodeKey as NodeKey);
    };
    window.addEventListener("upgrade-inquiry", handler);
    return () => window.removeEventListener("upgrade-inquiry", handler);
  }, []);

  const byKey = Object.fromEntries(nodes.map((n) => [n.node_key, n])) as Record<string, NodeRecord | undefined>;

  const csKeys  = ["cs_onboarding", "cs_upsell", "cs_support", "cs_education", "cs_community", "cs_analytics"];
  const csNodes = csKeys.map((k) => byKey[k]).filter(Boolean) as NodeRecord[];

  const [showAllLogs, setShowAllLogs] = useState(false);
  const visibleLogs = showAllLogs ? logs.slice(0, 30) : logs.slice(0, 10);

  const activeCount     = nodes.filter((n) => n.status === "active").length;
  const inProgressCount = nodes.filter((n) => n.status === "in_progress").length;
  const inactiveCount   = nodes.filter((n) => n.status === "inactive").length;

  // count logs per node to show indicator
  const logCountByKey = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.node_key] = (acc[l.node_key] ?? 0) + 1;
    return acc;
  }, {});

  // Build nodeStatuses for SharedKnockSystem
  const nodeStatusMap: Record<string, DashboardNodeStatus> = {};
  for (const n of nodes) {
    nodeStatusMap[n.node_key] = {
      status: n.status,
      logCount: logCountByKey[n.node_key] ?? 0,
      locked: locked(n.node_key),
    };
    // Mirror lead_nurture status to "qualified" display key
    if (n.node_key === "lead_nurture") {
      nodeStatusMap["qualified"] = { ...nodeStatusMap[n.node_key] };
    }
  }
  // Map cs_ keys to segment ids used by SharedKnockSystem
  const csKeyToSegmentId: Record<string, string> = {
    cs_onboarding: "onboarding",
    cs_upsell: "upsell",
    cs_support: "support",
    cs_education: "education",
    cs_community: "community",
    cs_analytics: "analytics",
  };
  for (const n of csNodes) {
    const segId = csKeyToSegmentId[n.node_key];
    if (segId) {
      nodeStatusMap[segId] = {
        status: n.status,
        logCount: logCountByKey[n.node_key] ?? 0,
        locked: locked(n.node_key),
      };
    }
  }

  // Dashboard segments — 6 nodes (no "product"), use DB order
  const dashboardSegments = csNodes.map((n, i) => {
    const meta = NODE_META[n.node_key];
    const segId = csKeyToSegmentId[n.node_key] ?? n.node_key;
    const defaultSeg = DEFAULT_SEGMENTS.find((s) => s.id === segId);
    return {
      id: segId,
      label: defaultSeg?.label ?? meta.label,
      sublabel: defaultSeg?.sublabel ?? meta.description,
      icon: defaultSeg?.icon ?? meta.emoji,
      color: defaultSeg?.color ?? "var(--gP)",
      angle: (360 / csNodes.length) * i,
    };
  });

  return (
    <>
      {/* Portal modals to document.body to avoid transform containment */}
      {selectedKey && typeof document !== "undefined" && createPortal(
        <LogModal nodeKey={selectedKey} displayKey={selectedDisplayKey ?? undefined} logs={logs} onClose={() => { setSelectedKey(null); setSelectedDisplayKey(null); }} />,
        document.body,
      )}
      {lockedKey && typeof document !== "undefined" && createPortal(
        <UpgradeModal
          isOpen
          onClose={() => setLockedKey(null)}
          currentTier={client.package_tier}
          nodeKey={lockedKey}
          clientId={client.id}
          clientName={client.name}
          contactName={client.contact_name}
          contactPhone={client.contact_phone}
          contactEmail={client.contact_email}
        />,
        document.body,
      )}
      {showQualified && typeof document !== "undefined" && createPortal(
        <QualifiedLeadPopup logs={logs} onClose={() => setShowQualified(false)} />,
        document.body,
      )}
      {showPlatinumUpgrade && typeof document !== "undefined" && createPortal(
        <PlatinumUpgradePopup currentTier={client.package_tier} clientName={client.name} onClose={() => setShowPlatinumUpgrade(false)} />,
        document.body,
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Overview ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "12px 16px", background: "var(--card-alpha)", border: "1px solid var(--border)", borderRadius: 12 }}>
          <img
            src="/client-logo.jpeg"
            alt={`${client.name} 로고`}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              objectFit: "contain",
              background: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 120 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.3px", lineHeight: 1.2, marginBottom: 3 }}>{client.name}</h2>
            <p style={{ color: "var(--tsub)", fontSize: 12, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {client.region || "지역 미입력"} · <PackageBadge tier={client.package_tier} size="md" />
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, marginLeft: "auto" }}>
            {([
              { n: activeCount,    c: SC.active,    l: "완료"  },
              { n: inProgressCount,c: SC.in_progress,l: "진행 중" },
              { n: inactiveCount,  c: SC.inactive,  l: "대기 중"  },
            ] as const).map(({ n, c, l }) => (
              <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: c, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{n}</span>
                <span style={{ fontSize: 10, color: "var(--tsub)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { icon: "📊", value: `${activeCount}/${nodes.length}`, label: "활성 노드", bg: "var(--status-active-bg)", color: "var(--text)" },
            { icon: "📋", value: `${logs.length}`, label: "활동 기록", bg: "var(--accent-bg)", color: "var(--text)" },
            { icon: "💎", value: PACKAGE_INFO[client.package_tier].label, label: PACKAGE_INFO[client.package_tier].price, bg: `${PACKAGE_INFO[client.package_tier].color}18`, color: PACKAGE_INFO[client.package_tier].color },
            { icon: "🕐", value: logs.length > 0 ? (() => { const d = Math.floor((Date.now() - new Date(logs[0].created_at).getTime()) / 864e5); return d === 0 ? "오늘" : `${d}일 전`; })() : "—", label: "마지막 업데이트", bg: "var(--status-progress-bg)", color: "var(--text)" },
          ].map((c) => (
            <div key={c.label} className="panel-card" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {c.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: c.color, lineHeight: 1, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.value}</div>
                <div style={{ fontSize: 10, color: "var(--tdim)", marginTop: 2, whiteSpace: "nowrap" }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Status legend ── */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", padding: "8px 16px", alignItems: "center", justifyContent: "center" }}>
          {([
            ["active", "완료", "작업 완료"],
            ["in_progress", "진행 중", "작업 진행중"],
            ["inactive", "대기", "작업 진행 전"],
          ] as const).map(([s, label, desc]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--tdim)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: SC[s as NodeStatus], display: "inline-block", flexShrink: 0 }} />
              <span style={{ color: SC[s as NodeStatus], fontWeight: 600 }}>{label}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>

        {/* ── Main knock system ── */}
        <SharedKnockSystem
          mode="dashboard"
          pipelineRows={DEFAULT_PIPELINE_ROWS}
          segments={dashboardSegments}
          nodeStatuses={nodeStatusMap}
          onNodeClick={(key) => {
            // Map shared keys back to dashboard node keys
            const keyMap: Record<string, NodeKey> = {
              awareness: "awareness",
              lead_capture: "lead_capture",
              lead_nurture: "lead_nurture",
              qualified: "lead_nurture",
              new_patient: "new_patient",
            };
            const nodeKey = keyMap[key] ?? key as NodeKey;
            handleNodeClick(nodeKey, key);
          }}
          onSegmentClick={(id) => {
            // Map segment ids back to cs_ node keys
            const segToKey: Record<string, NodeKey> = {
              onboarding: "cs_onboarding",
              upsell: "cs_upsell",
              support: "cs_support",
              education: "cs_education",
              community: "cs_community",
              analytics: "cs_analytics",
            };
            const nodeKey = segToKey[id] ?? id as NodeKey;
            handleNodeClick(nodeKey);
          }}
        />

        {/* ── Return loop + Platinum box ── */}
        <div className="return-loop">↩ 커뮤니티(리뷰·소개) → 인지확대 파이프라인으로 순환</div>

        {/* ── Platinum 골드 박스 ── */}
        <div
          className="platinum-gold-box"
          style={{
            padding: "20px 18px 16px",
            borderRadius: 16,
            border: "2px solid var(--gold-border)",
            background: "linear-gradient(135deg, var(--gold-bg) 0%, var(--gold-bg) 40%, var(--gold-bg) 100%)",
            boxShadow: "0 0 40px var(--gold-bg), 0 0 80px var(--gold-bg), inset 0 1px 0 var(--gold-border)",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onClick={() => setShowPlatinumUpgrade(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
            e.currentTarget.style.boxShadow = "0 0 60px var(--gold-border), 0 8px 32px var(--gold-bg), inset 0 1px 0 var(--gold-border)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow = "0 0 40px var(--gold-bg), 0 0 80px var(--gold-bg), inset 0 1px 0 var(--gold-border)";
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") setShowPlatinumUpgrade(true); }}
        >
          {/* Animated shimmer sweep */}
          <div style={{
            position: "absolute", top: 0, left: "-100%", width: "200%", height: "100%",
            background: "linear-gradient(90deg, transparent 0%, var(--gold-bg) 25%, var(--gold-bg) 50%, var(--gold-bg) 75%, transparent 100%)",
            animation: "goldShimmerSweep 4s ease-in-out infinite",
            pointerEvents: "none",
          }} />
          {/* Top border glow */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, transparent, var(--gold), var(--gold-warm), transparent)",
          }} />
          {/* Bottom border glow */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)",
          }} />
          {/* Main content */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: "linear-gradient(135deg, var(--gold-border), var(--gold-bg))",
              border: "1px solid var(--gold-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, flexShrink: 0,
              boxShadow: "0 4px 20px var(--gold-bg)",
              animation: "floatGlow 3s ease-in-out infinite",
            }}>👑</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "var(--gold)", marginBottom: 4, letterSpacing: "-0.3px" }}>
                신환 전화응대 · 채팅응대 전담
              </div>
              <div style={{ fontSize: 12, color: "var(--tsub)", lineHeight: 1.6 }}>
                전문 상담사가 전화·채팅을 직접 응대하여 <strong style={{ color: "var(--gold)" }}>신환 유입을 책임</strong>집니다
              </div>
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: 100,
              background: "linear-gradient(135deg, var(--gold), var(--gold-warm))",
              color: "#1a1a2e", fontSize: 12, fontWeight: 900, flexShrink: 0,
              letterSpacing: "0.5px", boxShadow: "0 2px 12px var(--gold-border)",
            }}>Platinum</div>
          </div>
          {/* Feature pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            {[
              { icon: "📞", label: "전화 응대" },
              { icon: "💬", label: "채팅 응대" },
              { icon: "🏥", label: "신환 책임제" },
              { icon: "📊", label: "VIP 리포트" },
            ].map((f) => (
              <span key={f.label} style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                padding: "4px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700,
                background: "var(--gold-bg)", color: "var(--gold)",
                border: "1px solid var(--gold-border)",
              }}>{f.icon} {f.label}</span>
            ))}
          </div>
          {/* CTA hint */}
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--gold-border)", fontWeight: 600, textAlign: "center", position: "relative", zIndex: 1 }}>
            클릭하여 자세히 알아보기 →
          </div>
        </div>

        {/* ── Activity log ── */}
        <div className="panel-card">
          <div className="sec-label">활동 내역</div>
          <h2 style={{ marginBottom: 16 }}>최근 작업 기록</h2>
          {logs.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📋</div>
              <p style={{ fontSize: 15, color: "var(--tsub)", fontWeight: 600, marginBottom: 4 }}>아직 활동 기록이 없습니다</p>
              <p style={{ fontSize: 13, color: "var(--tdim)" }}>곧 마케팅 활동이 시작됩니다!</p>
            </div>
          ) : (
            <>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 0 }}>
                {visibleLogs.map((log) => {
                  const nodeMeta = NODE_META[log.node_key];
                  return (
                    <li
                      key={log.id}
                      style={{ padding: "12px 0", borderBottom: "1px solid var(--overlay-3)", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12, transition: "background 0.15s", borderRadius: 8 }}
                      onClick={() => setSelectedKey(log.node_key)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedKey(log.node_key)}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{ACTION_ICON[log.action_type]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                            background: `${SC[byKey[log.node_key]?.status ?? "inactive"]}18`,
                            color: SC[byKey[log.node_key]?.status ?? "inactive"],
                          }}>
                            {nodeMeta.emoji} {nodeMeta.label}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--tdim)", fontVariantNumeric: "tabular-nums" }}>
                            {new Date(log.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {log.content}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {logs.length > 10 && !showAllLogs && (
                <button
                  type="button"
                  onClick={() => setShowAllLogs(true)}
                  style={{
                    display: "block", width: "100%", marginTop: 12, padding: "10px 0",
                    textAlign: "center", fontSize: 13, fontWeight: 700, color: "var(--gP)",
                    background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                    borderRadius: 10, cursor: "pointer", transition: "background 0.15s",
                  }}
                >
                  더 보기 ({logs.length - 10}건)
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Educational tip: CRM ── */}
        <div style={{
          padding: "16px 20px",
          background: "var(--overlay-1)",
          border: "1px solid var(--border)",
          borderRadius: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 15 }}>💡</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gP)", letterSpacing: "0.3px" }}>알아두면 좋은 마케팅 TIP</span>
          </div>
          <div className="info-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="recycle-bar">
              <h4>♻️ 재활용</h4>
              <p><strong>카톡 채널, 문자 DB</strong>에 모아두면<br />이탈 환자도 시즌 때 재연락 가능.<br /><strong>채널에 없으면 영원히 잃음.</strong></p>
            </div>
            <div className="crm-box">
              <h4>📱 채널에 모으기 = CRM</h4>
              <p><strong>관심은 있지만 아직인 환자</strong>의<br />연락처가 채널에 있어야 합니다.</p>
              <div className="crm-chips">
                <span className="crm-chip">카카오톡</span>
                <span className="crm-chip">문자 DB</span>
                <span className="crm-chip">예약 DB</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Package comparison table ── */}
        <PackageComparisonTable currentTier={client.package_tier} />
      </div>
    </>
  );
}

/* ── Google AI-style pricing cards ─────────────────────── */
const TIERS: PackageTier[] = ["entry", "basic", "standard", "premium", "platinum"];

function PackageComparisonTable({ currentTier }: { currentTier: PackageTier }) {
  const currentIdx = TIERS.indexOf(currentTier);

  return (
    <div style={{ padding: "0 0 8px" }}>
      {/* Section header */}
      <div style={{ marginBottom: 28 }}>
        <div className="sec-label">패키지 비교</div>
        <h2 style={{ marginBottom: 6 }}>나에게 맞는 패키지를 선택하세요</h2>
        <p style={{ fontSize: 14, color: "var(--tsub)", marginBottom: 0 }}>
          현재 이용 중: <strong style={{ color: PACKAGE_INFO[currentTier].color }}>{PACKAGE_INFO[currentTier].label}</strong>
        </p>
      </div>

      {/* Cards grid — horizontal scroll on mobile */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 16,
        paddingBottom: 8,
      }}>
        {TIERS.map((tier) => {
          const info = PACKAGE_INFO[tier];
          const isCurrent = tier === currentTier;
          const tierIdx = TIERS.indexOf(tier);
          const isUpgrade = tierIdx > currentIdx;
          const includedNodes = PACKAGE_NODE_ACCESS[tier];
          const count = includedNodes.length;

          // Popular tier (recommended) is the next upgrade from current
          const isPopular = tierIdx === currentIdx + 1;

          return (
            <div
              key={tier}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 16,
                border: isCurrent
                  ? `2px solid ${info.color}`
                  : isPopular
                    ? `2px solid ${info.color}80`
                    : "1px solid var(--overlay-4)",
                background: isCurrent
                  ? `linear-gradient(168deg, ${info.color}15 0%, ${info.color}06 40%, var(--overlay-1) 100%)`
                  : isPopular
                    ? `linear-gradient(168deg, ${info.color}0c 0%, var(--overlay-1) 60%)`
                    : "var(--overlay-1)",
                overflow: "hidden",
                position: "relative",
                transition: "transform 0.3s, box-shadow 0.3s",
                boxShadow: isCurrent
                  ? `0 0 0 1px ${info.color}20, 0 8px 32px ${info.color}12`
                  : isPopular
                    ? `0 4px 20px ${info.color}10`
                    : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                e.currentTarget.style.boxShadow = `0 0 0 1px ${info.color}30, 0 20px 60px ${info.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = isCurrent
                  ? `0 0 0 1px ${info.color}20, 0 8px 32px ${info.color}12`
                  : isPopular
                    ? `0 4px 20px ${info.color}10`
                    : "none";
              }}
            >
              {/* Top glow accent bar */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${info.color}, transparent)`,
                opacity: isCurrent ? 1 : isPopular ? 0.6 : 0.2,
              }} />

              {/* Badges */}
              {isCurrent && (
                <div style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)`,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  boxShadow: `0 2px 8px ${info.color}40`,
                }}>
                  현재
                </div>
              )}
              {isPopular && !isCurrent && (
                <div style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: `linear-gradient(135deg, ${info.color}dd, ${info.color}99)`,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  boxShadow: `0 2px 8px ${info.color}30`,
                }}>
                  추천
                </div>
              )}

              {/* Card top section — flex:1 pushes button to consistent position */}
              <div style={{ padding: "20px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Tier icon + name */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${info.color}20, ${info.color}08)`,
                  border: `1px solid ${info.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  marginBottom: 8,
                }}>
                  {tierIdx === 0 ? "🌱" : tierIdx === 1 ? "⚡" : tierIdx === 2 ? "🚀" : tierIdx === 3 ? "👑" : "💎"}
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: info.color,
                  marginBottom: 4,
                  letterSpacing: "-0.3px",
                }}>
                  {info.label}
                </div>

                {/* Description — fixed height for cross-card alignment */}
                <p style={{
                  fontSize: 11,
                  color: "var(--tsub)",
                  lineHeight: 1.4,
                  marginBottom: 12,
                  height: 48,
                  overflow: "hidden",
                  wordBreak: "keep-all",
                }}>
                  {info.description}
                </p>

                {/* Price — pushed to bottom of top section */}
                <div style={{ marginTop: "auto" }}>
                  <div style={{ marginBottom: 4, display: "flex", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: "var(--text)",
                      letterSpacing: "-1px",
                      lineHeight: 1,
                    }}>
                      {info.price.replace("/월", "").replace("만원", "")}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--tsub)" }}>만원</span>
                    <span style={{ fontSize: 11, color: "var(--tdim)", marginLeft: 1 }}>/월</span>
                  </div>

                  {/* Guarantee */}
                  <p style={{
                    fontSize: 11,
                    color: info.guarantee ? info.color : "transparent",
                    lineHeight: 1.4,
                    marginBottom: 0,
                    fontWeight: 600,
                    opacity: 0.85,
                    minHeight: info.priceNote ? 16 : 48,
                  }}>
                    {info.guarantee || "\u00A0"}
                  </p>

                  {/* Price note callout */}
                  {info.priceNote && (
                    <div style={{
                      marginTop: 8,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: `${info.color}0d`,
                      border: `1px solid ${info.color}22`,
                      fontSize: 10,
                      lineHeight: 1.5,
                      color: "var(--tsub)",
                      whiteSpace: "pre-line",
                    }}>
                      <span style={{ fontSize: 11, marginRight: 4 }}>💡</span>
                      {info.priceNote}
                    </div>
                  )}
                </div>
              </div>

              {/* CTA button */}
              <div style={{ padding: "0 14px 14px" }}>
                {isCurrent ? (
                  <div style={{
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: 10,
                    border: `1px solid ${info.color}40`,
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: info.color,
                    opacity: 0.7,
                    background: `${info.color}08`,
                  }}>
                    이용 중
                  </div>
                ) : isUpgrade ? (
                  <button
                    type="button"
                    aria-label={`${info.label} 패키지 업그레이드 문의`}
                    style={{
                      width: "100%",
                      padding: "11px 0",
                      borderRadius: 10,
                      border: "none",
                      background: isPopular
                        ? `linear-gradient(135deg, ${info.color}, ${info.color}cc)`
                        : info.color,
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: isPopular ? `0 4px 16px ${info.color}40` : "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = `0 6px 20px ${info.color}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = isPopular ? `0 4px 16px ${info.color}40` : "none";
                    }}
                    onClick={() => {
                      const firstLocked = ALL_NODE_KEYS.find((k) => !PACKAGE_NODE_ACCESS[currentTier].includes(k));
                      if (firstLocked) {
                        window.dispatchEvent(new CustomEvent("upgrade-inquiry", { detail: { nodeKey: firstLocked } }));
                      }
                    }}
                  >
                    업그레이드 문의
                  </button>
                ) : (
                  <div style={{
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: 10,
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--tdim)",
                  }}>
                    —
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{
                height: 1,
                background: isCurrent
                  ? `linear-gradient(90deg, transparent, ${info.color}30, transparent)`
                  : "var(--overlay-3)",
                margin: "0 22px",
              }} />

              {/* Feature list */}
              <div style={{ padding: "18px 22px 24px" }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--tdim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <span>포함 서비스</span>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: 100,
                    background: `${info.color}14`,
                    color: info.color,
                    fontWeight: 800,
                    fontSize: 11,
                  }}>
                    {count}/{ALL_NODE_KEYS.length}
                  </span>
                </div>
                <ul style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}>
                  {ALL_NODE_KEYS.map((nodeKey) => {
                    const meta = NODE_META[nodeKey];
                    const included = includedNodes.includes(nodeKey);
                    return (
                      <li
                        key={nodeKey}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          color: included ? "var(--text)" : "var(--tdim)",
                          opacity: included ? 1 : 0.35,
                          fontWeight: included ? 600 : 400,
                          transition: "opacity 0.2s",
                        }}
                      >
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          fontSize: 10,
                          flexShrink: 0,
                          background: included ? `${info.color}1a` : "var(--overlay-3)",
                          color: included ? info.color : "var(--tdim)",
                          fontWeight: 900,
                        }}>
                          {included ? "✓" : "—"}
                        </span>
                        <span>{meta.emoji} {meta.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
