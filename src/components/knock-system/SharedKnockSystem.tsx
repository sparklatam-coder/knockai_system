"use client";

import React from "react";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
export type NodeStatus = "active" | "in_progress" | "inactive";

export interface PipelineNodeData {
  key: string;
  emoji: string;
  label: string;
  sub: string;
  color: string;
  /** first node highlight */
  star?: boolean;
  /** convert (bottom) node */
  convert?: boolean;
  /** pills instead of sub text */
  pills?: string[];
  /** insight card text (static mode only) */
  insight?: React.ReactNode;
  insightColor?: string;
}

/** Dual-node row (e.g. 환자 설득 + 방문 예정) */
export interface PipelinePairData {
  left: PipelineNodeData;
  right: PipelineNodeData;
  /** insight card text */
  insight?: React.ReactNode;
  insightColor?: string;
}

export interface WheelSegmentData {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  angle: number;
}

export interface DashboardNodeStatus {
  status: NodeStatus;
  logCount?: number;
  locked?: boolean;
}

export interface SharedKnockSystemProps {
  mode: "static" | "dashboard";

  /* ── Pipeline ── */
  pipelineTitle?: string;
  pipelineSub?: string;
  pipelineDesc?: string;
  /** Ordered list of pipeline rows. Each is a single node or a pair. */
  pipelineRows: (PipelineNodeData | PipelinePairData)[];
  /** Show CRM banner at bottom of pipeline (static mode) */
  showCrmBanner?: boolean;

  /* ── CS360 Wheel ── */
  wheelTitle?: string;
  wheelSub?: string;
  wheelDesc?: string;
  wheelCenterLabel?: string;
  wheelCenterSub?: string;
  segments: WheelSegmentData[];

  /* ── Dashboard mode extras ── */
  nodeStatuses?: Record<string, DashboardNodeStatus>;

  /* ── Callbacks ── */
  onNodeClick?: (key: string) => void;
  onSegmentClick?: (id: string) => void;
}

/* ── Status helpers ── */
const SC: Record<NodeStatus, string> = {
  active: "var(--status-active)",
  in_progress: "var(--status-progress)",
  inactive: "var(--status-inactive)",
};
const SB: Record<NodeStatus, string> = {
  active: "var(--status-active-bg)",
  in_progress: "var(--status-progress-bg)",
  inactive: "var(--status-inactive-bg)",
};
const SL: Record<NodeStatus, string> = {
  active: "완료",
  in_progress: "진행 중",
  inactive: "대기",
};

/* ── Helpers ── */
function isPair(row: PipelineNodeData | PipelinePairData): row is PipelinePairData {
  return "left" in row && "right" in row;
}

/* ── Sub-components ── */
function StatusPill({ status }: { status: NodeStatus }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 600,
        background: SB[status],
        color: SC[status],
        marginTop: 4,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: SC[status] }} />
      {SL[status]}
    </span>
  );
}

function LogCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 22,
        height: 22,
        borderRadius: 99,
        padding: "0 6px",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "'Outfit', sans-serif",
        background: "var(--gP)",
        color: "#ffffff",
        marginLeft: "auto",
        flexShrink: 0,
      }}
    >
      {count}건
    </span>
  );
}

function LockOverlay() {
  return (
    <span
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.7)",
        borderRadius: "inherit",
        zIndex: 5,
        fontSize: 18,
      }}
    >
      🔒
    </span>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
export function SharedKnockSystem({
  mode,
  pipelineTitle = "신환 유입",
  pipelineSub = "신환 유입 구조",
  pipelineDesc = "검색 → 발견 → 전화 → 방문, 자동화된 유입 파이프라인",
  pipelineRows,
  showCrmBanner = false,
  wheelTitle = "재방문 순환",
  wheelSub = "재방문 순환 구조",
  wheelDesc = "첫 방문 감동 → 추가 진료 → 리뷰 → 소개, 선순환",
  wheelCenterLabel = "다시오게360",
  wheelCenterSub = "평생 환자",
  segments,
  nodeStatuses,
  onNodeClick,
  onSegmentClick,
}: SharedKnockSystemProps) {
  const isDashboard = mode === "dashboard";

  const getStatus = (key: string): DashboardNodeStatus | undefined =>
    nodeStatuses?.[key];

  const isLocked = (key: string): boolean =>
    getStatus(key)?.locked ?? false;

  const nodeColor = (key: string, defaultColor: string): string => {
    if (!isDashboard) return defaultColor;
    const s = getStatus(key);
    if (!s) return defaultColor;
    if (s.locked) return "#555";
    return SC[s.status];
  };

  /* ── Render a single pipeline node ── */
  function renderPipeNode(node: PipelineNodeData) {
    const locked = isDashboard && isLocked(node.key);
    const color = nodeColor(node.key, node.color);
    const status = getStatus(node.key);
    const logCount = status?.logCount ?? 0;

    const classNames = [
      "pipe-node",
      node.star ? "pipe-star" : "",
      node.convert ? "pipe-convert" : "",
      locked ? "locked-node" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const content = (
      <>
        {locked && <LockOverlay />}
        <div className="pipe-dot">{locked ? "🔒" : node.emoji}</div>
        <div className="pipe-info">
          <div className="pipe-name">{node.label}</div>
          {node.pills ? (
            <div className="pipe-pills">
              {node.pills.map((p) => (
                <span key={p} className="pipe-pill">{p}</span>
              ))}
            </div>
          ) : (
            <div className="pipe-sub">{node.sub}</div>
          )}
          {isDashboard && status && <StatusPill status={status.status} />}
        </div>
        {!isDashboard && node.star && <span className="pipe-badge-star">핵심 ★</span>}
        {isDashboard && !locked && logCount > 0 && <LogCountBadge count={logCount} />}
      </>
    );

    if (isDashboard) {
      return (
        <div
          className={classNames}
          style={{ ["--nc" as string]: color, cursor: "pointer", position: "relative" }}
          onClick={() => onNodeClick?.(node.key)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onNodeClick?.(node.key)}
        >
          {content}
        </div>
      );
    }

    return (
      <button
        className={classNames}
        style={{ ["--nc" as string]: color, ["--glow-delay" as string]: `${glowIndex++ * 0.5}s` }}
        onClick={() => onNodeClick?.(node.key)}
        type="button"
      >
        {content}
      </button>
    );
  }

  /* ── Render insight card (static only) ── */
  function renderInsight(insight: React.ReactNode | undefined, color: string | undefined) {
    if (isDashboard || !insight) return null;
    return (
      <>
        <div className="pipe-link">
          <span className="pipe-link-dot" style={{ background: color ?? "var(--gP)" }} />
        </div>
        <div className="pipe-insight" style={{ ["--ic" as string]: color ?? "var(--gP)" }}>
          <span>{insight}</span>
        </div>
      </>
    );
  }

  /* ── Wheel constants ── */
  const WHEEL = 680;
  const CX = 340;
  const CY = 340;
  const R = 248;
  const SW = 55;
  const SH = 34;

  let glowIndex = 0;

  return (
    <div className="main-row main-row--sync">
      {/* ── LEFT: Pipeline ── */}
      <div className="pipeline-col">
        <div className="sec-label">{pipelineTitle}</div>
        <div className="sec-title">{pipelineSub}</div>
        <div className="sec-desc">{pipelineDesc}</div>

        <div className="pipe-flow">
          {pipelineRows.map((row, i) => {
            const isLast = i === pipelineRows.length - 1;

            if (isPair(row)) {
              const leftLocked = isDashboard && isLocked(row.left.key);
              const rightLocked = isDashboard && isLocked(row.right.key);
              const leftStatus = getStatus(row.left.key);
              const rightStatus = getStatus(row.right.key);

              return (
                <React.Fragment key={`pair-${i}`}>
                  <div className="pipe-row">
                    <div className="pipe-pair">
                      {/* Left node */}
                      {(() => {
                        const color = nodeColor(row.left.key, row.left.color);
                        const logCount = leftStatus?.logCount ?? 0;
                        const nodeEl = isDashboard ? (
                          <div
                            className={`pipe-node${leftLocked ? " locked-node" : ""}`}
                            style={{ ["--nc" as string]: color, cursor: "pointer", position: "relative" }}
                            onClick={() => onNodeClick?.(row.left.key)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && onNodeClick?.(row.left.key)}
                          >
                            {leftLocked && <LockOverlay />}
                            <div className="pipe-dot">{row.left.emoji}</div>
                            <div className="pipe-info">
                              <div className="pipe-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {row.left.label}
                                {!leftLocked && logCount > 0 && <LogCountBadge count={logCount} />}
                              </div>
                              <div className="pipe-sub">{row.left.sub}</div>
                              {leftStatus && <StatusPill status={leftStatus.status} />}
                            </div>
                          </div>
                        ) : (
                          <button
                            className="pipe-node"
                            style={{ ["--nc" as string]: color, ["--glow-delay" as string]: `${glowIndex++ * 0.5}s` }}
                            onClick={() => onNodeClick?.(row.left.key)}
                            type="button"
                          >
                            <div className="pipe-dot">{row.left.emoji}</div>
                            <div className="pipe-info">
                              <div className="pipe-name">{row.left.label}</div>
                              <div className="pipe-sub">{row.left.sub}</div>
                            </div>
                          </button>
                        );
                        return nodeEl;
                      })()}
                      <span className="pipe-plus">+</span>
                      {/* Right node */}
                      {(() => {
                        const color = isDashboard
                          ? (rightLocked ? "#555" : "var(--gG)")
                          : row.right.color;
                        const rightLogCount = rightStatus?.logCount ?? 0;
                        const nodeEl = isDashboard ? (
                          <div
                            className={`pipe-node${rightLocked ? " locked-node" : ""}`}
                            style={{ ["--nc" as string]: color, cursor: "pointer", position: "relative" }}
                            onClick={() => onNodeClick?.(row.right.key)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && onNodeClick?.(row.right.key)}
                          >
                            {rightLocked && <LockOverlay />}
                            <div className="pipe-dot">{rightLocked ? "🔒" : row.right.emoji}</div>
                            <div className="pipe-info">
                              <div className="pipe-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {row.right.label}
                                {!rightLocked && rightLogCount > 0 && <LogCountBadge count={rightLogCount} />}
                              </div>
                              <div className="pipe-sub">{row.right.sub}</div>
                              {rightStatus && <StatusPill status={rightStatus.status} />}
                            </div>
                          </div>
                        ) : (
                          <button
                            className="pipe-node"
                            style={{ ["--nc" as string]: color, ["--glow-delay" as string]: `${glowIndex++ * 0.5}s` }}
                            onClick={() => onNodeClick?.(row.right.key)}
                            type="button"
                          >
                            <div className="pipe-dot">{row.right.emoji}</div>
                            <div className="pipe-info">
                              <div className="pipe-name">{row.right.label}</div>
                              <div className="pipe-sub">{row.right.sub}</div>
                            </div>
                          </button>
                        );
                        return nodeEl;
                      })()}
                    </div>
                    {renderInsight(row.insight, row.insightColor)}
                  </div>
                  {!isLast && <div className="pipe-line"><span /></div>}
                </React.Fragment>
              );
            }

            // Single node row
            return (
              <React.Fragment key={row.key}>
                <div className="pipe-row">
                  {renderPipeNode(row)}
                  {renderInsight(row.insight, row.insightColor)}
                </div>
                {!isLast && <div className="pipe-line"><span /></div>}
              </React.Fragment>
            );
          })}
        </div>

        {showCrmBanner && (
          <div className="pipe-crm-banner">
            <span>♻️ 연락처만 있으면, 떠난 환자도 다시 부를 수 있습니다</span>
            <div className="pipe-crm-chips">
              <span>카카오톡</span>
              <span>문자 DB</span>
              <span>예약 DB</span>
            </div>
          </div>
        )}
      </div>

      <div className="divider" />

      {/* ── RIGHT: CS360 Wheel ── */}
      <div className="knock-system-col">
        <div className="sec-label">{wheelTitle}</div>
        <div className="sec-title">{wheelSub}</div>
        <div className="sec-desc">{wheelDesc}</div>
        <div className="fw-wrap">
          <div className="wheel-box" style={{ width: WHEEL, height: WHEEL }}>
            <div className="wheel-ring" />

            {/* SVG connectors (dashboard mode adds dashed circle + arrows) */}
            {isDashboard && (
              <svg
                className="wheel-connectors"
                viewBox={`0 0 ${WHEEL} ${WHEEL}`}
                style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
              >
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--accent-bg)" strokeWidth="1" strokeDasharray="6 8" />
                {segments.map((_, i) => {
                  const angles = segments.map((__, j) => (360 / segments.length) * j);
                  const a1 = ((angles[i]! - 90) * Math.PI) / 180;
                  const a2 = ((angles[(i + 1) % segments.length]! - 90) * Math.PI) / 180;
                  const midAngle = (a1 + a2) / 2 + (i === segments.length - 1 ? Math.PI : 0);
                  const ax = CX + (R + 2) * Math.cos(midAngle);
                  const ay = CY + (R + 2) * Math.sin(midAngle);
                  const arrowAngle = midAngle + Math.PI / 2;
                  return (
                    <g key={i} transform={`translate(${ax},${ay}) rotate(${(arrowAngle * 180) / Math.PI})`}>
                      <path d="M-4,-3 L0,4 L4,-3" fill="none" stroke="var(--accent-border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  );
                })}
              </svg>
            )}

            <div className="wheel-center">
              <div className="wc-circle">
                <div className="wl">{wheelCenterLabel}</div>
                <div className="wt">{wheelCenterSub}</div>
              </div>
            </div>

            {segments.map((segment, index) => {
              const angle = isDashboard
                ? (360 / segments.length) * index
                : segment.angle;
              const rad = ((angle - 90) * Math.PI) / 180;
              const x = CX + R * Math.cos(rad) - SW;
              const y = CY + R * Math.sin(rad) - SH;

              const segStatus = getStatus(segment.id);
              const segLocked = segStatus?.locked ?? false;
              const color = isDashboard
                ? (segLocked ? "#555" : SC[segStatus?.status ?? "inactive"])
                : segment.color;
              const logCount = segStatus?.logCount ?? 0;

              if (isDashboard) {
                return (
                  <div
                    key={segment.id}
                    className={`w-seg${segLocked ? " locked-seg" : ""}`}
                    style={{ ["--sc" as string]: color, left: `${x}px`, top: `${y}px`, cursor: "pointer" }}
                    onClick={() => onSegmentClick?.(segment.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${segment.label} — ${segLocked ? "잠금" : SL[segStatus?.status ?? "inactive"]}`}
                    onKeyDown={(e) => e.key === "Enter" && onSegmentClick?.(segment.id)}
                  >
                    <div
                      className="w-dot"
                      style={{
                        borderColor: color,
                        borderStyle: segLocked ? "dashed" : "solid",
                        boxShadow: segLocked ? "none" : `0 0 20px -4px ${color}`,
                        background: segLocked ? "var(--overlay-2)" : SB[segStatus?.status ?? "inactive"],
                        position: "relative",
                      }}
                    >
                      {segLocked ? "🔒" : segment.icon}
                      {!segLocked && logCount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "var(--gP)",
                            color: "#ffffff",
                            fontSize: 9,
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid var(--bg)",
                          }}
                        >
                          {logCount}
                        </span>
                      )}
                    </div>
                    <div className="wsl">{segment.label}</div>
                    <div className="wss">{segment.sublabel}</div>
                    {segLocked ? (
                      <span className="w-status-pill" style={{ color: "#666", borderColor: "var(--overlay-4)" }}>
                        🔒 잠금
                      </span>
                    ) : (
                      <span className="w-status-pill" style={{ color, borderColor: `${color}33` }}>
                        {SL[segStatus?.status ?? "inactive"]}
                      </span>
                    )}
                  </div>
                );
              }

              // Static mode
              return (
                <button
                  key={segment.id}
                  className="w-seg"
                  onClick={() => onSegmentClick?.(segment.id)}
                  style={{ ["--sc" as string]: segment.color, ["--glow-delay" as string]: `${index * 0.4}s`, left: `${x}px`, top: `${y}px` }}
                  type="button"
                >
                  <div className="w-dot" style={{ borderColor: segment.color }}>
                    <span className="sp" style={{ background: segment.color, ["--sx" as string]: "-8px", ["--sy" as string]: "-10px", top: "2px", left: "3px" }} />
                    <span className="sp" style={{ background: "#fff", ["--sx" as string]: "8px", ["--sy" as string]: "-6px", top: "4px", right: "3px" }} />
                    {segment.icon}
                  </div>
                  <div className="wsl">{segment.label}</div>
                  <div className="wss">{segment.sublabel}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Default data — used by /system (static mode)
   ───────────────────────────────────────────── */
export const DEFAULT_PIPELINE_ROWS: (PipelineNodeData | PipelinePairData)[] = [
  {
    key: "awareness",
    emoji: "🔍",
    label: "검색 노출",
    sub: "네이버 지도 · 블로그 · SNS",
    color: "var(--gW)",
    star: true,
    insight: <>💡 환자 10명 중 7명이 네이버 지도에서 병원을 찾습니다</>,
    insightColor: "var(--gW)",
  },
  {
    key: "lead_capture",
    emoji: "📋",
    label: "문의 유입",
    sub: "전화 · 카톡 · 네이버 예약",
    color: "var(--gP)",
    insight: <>💡 유입 경로를 자동으로 추적합니다</>,
    insightColor: "var(--gP)",
  },
  {
    left: {
      key: "lead_nurture",
      emoji: "💬",
      label: "환자 설득",
      sub: "안내 · 재연락",
      color: "var(--gPu)",
    },
    right: {
      key: "qualified",
      emoji: "⭐",
      label: "방문 예정",
      sub: "방문 의향 확인",
      color: "var(--gG)",
    },
    insight: <>💡 부재중 콜백 하나로 이탈 <strong>30% 회수</strong></>,
    insightColor: "var(--gPu)",
  },
  {
    key: "new_patient",
    emoji: "🏥",
    label: "신환 확보",
    sub: "",
    color: "var(--gG)",
    convert: true,
    pills: ["🪑 내원", "📋 상담", "✅ 치료결정"],
    insight: <>💡 실제 사례: <strong>매출 300% 달성</strong></>,
    insightColor: "var(--gG)",
  },
];

export const DEFAULT_SEGMENTS: WheelSegmentData[] = [
  { id: "onboarding", label: "첫 방문 케어", sublabel: "첫 48시간", icon: "🎯", color: "var(--gP)", angle: 0 },
  { id: "upsell", label: "추가 진료", sublabel: "필요한 진료 안내", icon: "💎", color: "var(--gW)", angle: 51.4 },
  { id: "support", label: "사후 관리", sublabel: "불편사항 케어", icon: "🤝", color: "var(--gG)", angle: 102.8 },
  { id: "education", label: "건강 정보", sublabel: "콘텐츠", icon: "📚", color: "var(--gC)", angle: 154.3 },
  { id: "community", label: "리뷰·소개", sublabel: "입소문", icon: "👥", color: "var(--gPu)", angle: 205.7 },
  { id: "product", label: "맞춤 패키지", sublabel: "환자별 제안", icon: "🎁", color: "var(--gPk)", angle: 257.1 },
  { id: "analytics", label: "성과 분석", sublabel: "리포트", icon: "📊", color: "var(--gP)", angle: 308.5 },
];
