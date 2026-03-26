"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { Footer } from "@/components/landing/Footer";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { DoorKnockHero } from "@/components/landing/DoorKnockHero";
import { BarChart3 } from "lucide-react";

/* ─────────────────────────────────────────────
   Style tokens
   ───────────────────────────────────────────── */
const T = {
  bg:        "var(--bg,        #f0f6ff)",
  bgCard:    "var(--bg-card,   #ffffff)",
  bgHover:   "var(--bg-hover,  #f1f5f9)",
  accent:    "var(--accent,    #1e40af)",
  accentDim: "var(--accent-dim,rgba(30,64,175,.08))",
  green:     "var(--green,     #059669)",
  greenDim:  "var(--green-dim, rgba(5,150,105,.08))",
  yellow:    "var(--yellow,    #d97706)",
  yellowDim: "var(--yellow-dim,rgba(217,119,6,.08))",
  blue:      "var(--blue,      #3b82f6)",
  gw:        "var(--gw,        rgba(0,0,0,.03))",
  text:      "var(--text,      #1e293b)",
  muted:     "var(--muted,     #64748b)",
  dim:       "var(--dim,       #cbd5e1)",
  border:    "var(--border,    #e2e8f0)",
};

const NAVER = "#03C75A";
const YT_RED = "#ff0000";

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */
function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: "all .55s cubic-bezier(.22,1,.36,1)" } as React.CSSProperties };
}

function Badge({ children, color = T.accent }: { children: ReactNode; color?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: `${color}18`, border: `1px solid ${color}30`,
      color, padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function SectionTag({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
      <span style={{
        width: 28, height: 28, borderRadius: "50%", background: "hsl(224 76% 40%)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: 13,
      }}>{num}</span>
      <span style={{ color: "hsl(224 76% 40%)", fontSize: 13, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function RankDot({ rank }: { rank: number }) {
  const c = rank === 1 ? T.green : rank <= 3 ? T.yellow : T.accent;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 32, height: 32, borderRadius: "50%",
      background: `${c}20`, border: `2px solid ${c}`,
      fontWeight: 800, fontSize: 14, color: c,
    }}>{rank}</span>
  );
}

function TierBadge({ tier, extra }: { tier: "basic" | "premium" | "platinum"; extra?: string }) {
  const label = tier === "basic" ? "Basic" : tier === "premium" ? "Premium" : "Platinum";
  const isHighTier = tier === "premium" || tier === "platinum";
  const colors: Record<string, { bg: string; color: string; border?: string }> = {
    basic: { bg: `${T.blue}20`, color: T.blue, border: `1px solid ${T.blue}40` },
    premium: { bg: "linear-gradient(135deg, #f9a825, #e68a00)", color: "#fff" },
    platinum: { bg: "linear-gradient(135deg, #1e40af, #1d4ed8)", color: "#fff" },
  };
  const c = colors[tier];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
      color: c.color,
      background: c.bg,
      border: c.border || "none",
    }}>
      {isHighTier && "⭐ "}{label}{extra ? ` + ${extra}` : ""}
    </span>
  );
}

function NaverLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        color: NAVER, fontSize: 12, fontWeight: 600, textDecoration: "none",
        padding: "6px 12px", borderRadius: 8,
        background: `${NAVER}12`, border: `1px solid ${NAVER}30`,
        transition: "background .2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = `${NAVER}25`)}
      onMouseLeave={e => (e.currentTarget.style.background = `${NAVER}12`)}
    >
      <span style={{
        width: 18, height: 18, borderRadius: 4, background: NAVER,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 11, fontWeight: 900,
      }}>N</span>
      네이버 플레이스에서 확인 →
    </a>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: T.gw, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: T.muted }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: color || T.text, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: T.green, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Data – 4 Real Cases
   ───────────────────────────────────────────── */

interface ClientCase {
  id: string;
  name: string;
  area: string;
  category: string;
  keyword: string;
  tier: "basic" | "premium" | "platinum";
  tierExtra?: string;
  naverUrl: string;
  capability: "seo_mastery" | "consistent_dominance" | "automation" | "content_growth";
  capabilityIcon: string;
  capabilityLabel: string;
  capabilityQuote: string;
  accentColor: string;
  rank?: number;
  totalBiz?: number;
  monthlySearch?: number;
  period: string;
  highlights: string[];
  tracking?: Array<{ d: string; r: number }>;
  takeoverIndex?: number;
  proofImage?: string;
  automationFeatures?: string[];
  youtube?: {
    channelName: string;
    subs: string;
    totalViews: string;
    years: number;
    recent28d: {
      views: string;
      viewsSub: string;
      watchHours: string;
      newSubs: string;
      revenue: string;
    };
    growth: string;
    mediaCredits: string[];
  };
}

const CLIENT_CASES: ClientCase[] = [
  {
    id: "jeju",
    name: "제주팔팔의원",
    area: "제주시",
    category: "정형외과",
    keyword: "제주 정형외과",
    tier: "basic",
    naverUrl: "https://naver.me/F3TGJPtu",
    capability: "consistent_dominance",
    capabilityIcon: "👑",
    capabilityLabel: "1위 독점 유지",
    capabilityQuote: "타 업체 5개월간 5~8위 정체 → 노크 이관 후 1위 독점",
    accentColor: T.green,
    rank: 1,
    totalBiz: 169,
    monthlySearch: 1730,
    period: "타 업체 5개월 운영 → 노크 이관",
    highlights: ["타 업체 5개월간 5~8위 정체 → 노크 이관 후 1위", "169개 업체 부동의 1위", "월 검색량 1,730건"],
    proofImage: "/references/jeju88-proof.png",
    tracking: [
      // 3월: 1위 독점
      { d: "03.22", r: 1 }, { d: "03.21", r: 1 }, { d: "03.20", r: 1 }, { d: "03.19", r: 1 },
      { d: "03.18", r: 1 }, { d: "03.17", r: 1 }, { d: "03.16", r: 1 }, { d: "03.15", r: 1 },
      { d: "03.14", r: 1 }, { d: "03.13", r: 1 }, { d: "03.12", r: 1 },
      { d: "03.11", r: 1 }, { d: "03.10", r: 1 }, { d: "03.09", r: 1 }, { d: "03.08", r: 1 },
      { d: "03.07", r: 1 }, { d: "03.06", r: 1 }, { d: "03.05", r: 1 }, { d: "03.04", r: 1 },
      { d: "03.03", r: 1 }, { d: "03.02", r: 1 },
      // 3~2월: 1위 유지
      { d: "03.01", r: 1 }, { d: "02.28", r: 1 }, { d: "02.27", r: 1 }, { d: "02.26", r: 1 },
      { d: "02.25", r: 1 }, { d: "02.24", r: 1 }, { d: "02.23", r: 1 }, { d: "02.22", r: 1 },
      { d: "02.21", r: 1 }, { d: "02.20", r: 1 }, { d: "02.19", r: 1 },
      { d: "02.18", r: 1 }, { d: "02.17", r: 1 }, { d: "02.16", r: 1 }, { d: "02.15", r: 1 },
      { d: "02.14", r: 1 }, { d: "02.13", r: 2 }, { d: "02.12", r: 2 }, { d: "02.11", r: 2 },
      { d: "02.10", r: 2 }, { d: "02.09", r: 2 }, { d: "02.08", r: 2 },
      { d: "02.07", r: 2 }, { d: "02.06", r: 2 }, { d: "02.05", r: 2 }, { d: "02.04", r: 2 },
      { d: "02.03", r: 2 }, { d: "02.02", r: 2 }, { d: "02.01", r: 2 },
      // 1월: 1~2위
      { d: "01.31", r: 2 }, { d: "01.30", r: 2 }, { d: "01.29", r: 1 },
      { d: "01.28", r: 1 }, { d: "01.27", r: 1 }, { d: "01.26", r: 1 }, { d: "01.25", r: 2 },
      { d: "01.24", r: 2 }, { d: "01.23", r: 2 }, { d: "01.22", r: 2 }, { d: "01.21", r: 1 },
      { d: "01.20", r: 1 }, { d: "01.19", r: 1 }, { d: "01.18", r: 1 },
      { d: "01.17", r: 1 }, { d: "01.16", r: 1 }, { d: "01.15", r: 1 }, { d: "01.14", r: 1 },
      { d: "01.13", r: 1 }, { d: "01.12", r: 1 }, { d: "01.11", r: 1 }, { d: "01.10", r: 2 },
      { d: "01.09", r: 2 }, { d: "01.08", r: 2 }, { d: "01.07", r: 2 },
      { d: "01.06", r: 2 }, { d: "01.05", r: 2 }, { d: "01.04", r: 2 }, { d: "01.03", r: 2 },
      { d: "01.02", r: 2 }, { d: "01.01", r: 2 },
      // 12월: 1~3위
      { d: "12.31", r: 2 }, { d: "12.30", r: 2 }, { d: "12.29", r: 2 }, { d: "12.28", r: 2 },
      { d: "12.27", r: 2 }, { d: "12.26", r: 2 }, { d: "12.25", r: 2 }, { d: "12.24", r: 2 },
      { d: "12.23", r: 2 }, { d: "12.22", r: 2 }, { d: "12.21", r: 2 }, { d: "12.20", r: 2 },
      { d: "12.19", r: 2 }, { d: "12.18", r: 3 }, { d: "12.17", r: 3 }, { d: "12.16", r: 3 },
      { d: "12.15", r: 2 }, { d: "12.14", r: 2 }, { d: "12.13", r: 2 }, { d: "12.12", r: 2 },
      { d: "12.11", r: 2 }, { d: "12.10", r: 2 }, { d: "12.09", r: 2 }, { d: "12.08", r: 2 },
      { d: "12.07", r: 2 }, { d: "12.06", r: 1 }, { d: "12.05", r: 2 },
      { d: "12.04", r: 2 }, { d: "12.03", r: 2 }, { d: "12.02", r: 2 }, { d: "12.01", r: 2 },
      // 11월: 노크 이관 후 2~4위
      { d: "11.30", r: 2 }, { d: "11.29", r: 2 }, { d: "11.28", r: 2 }, { d: "11.27", r: 3 },
      { d: "11.26", r: 3 }, { d: "11.25", r: 3 }, { d: "11.24", r: 4 },
    ],
    takeoverIndex: 100,
  },
  {
    id: "noh",
    name: "노내과의원",
    area: "광명시",
    category: "내과",
    keyword: "광명 내과",
    tier: "basic",
    naverUrl: "https://naver.me/xuca2M07",
    capability: "seo_mastery",
    capabilityIcon: "🎯",
    capabilityLabel: "순위 최적화",
    capabilityQuote: "162위 → 2달 이내 3위 진입",
    accentColor: T.yellow,
    rank: 3,
    totalBiz: 481,
    monthlySearch: 1040,
    period: "2025.11 ~ 현재",
    highlights: ["162위 → 3위, 2달 이내", "순위 조절 가능한 실력", "481개 업체 중 상위"],
    proofImage: "/references/noh-proof.png",
    tracking: [
      // 3월: 1~3위 안정권
      { d: "03.22", r: 3 }, { d: "03.21", r: 3 }, { d: "03.20", r: 3 }, { d: "03.19", r: 3 },
      { d: "03.18", r: 3 }, { d: "03.17", r: 3 }, { d: "03.16", r: 3 }, { d: "03.15", r: 3 },
      { d: "03.14", r: 3 }, { d: "03.13", r: 3 }, { d: "03.12", r: 3 },
      { d: "03.11", r: 2 }, { d: "03.10", r: 2 }, { d: "03.09", r: 2 }, { d: "03.08", r: 1 },
      { d: "03.07", r: 1 }, { d: "03.06", r: 1 }, { d: "03.05", r: 1 }, { d: "03.04", r: 1 },
      { d: "03.03", r: 1 }, { d: "03.02", r: 1 },
      // 3~2월: 1위 → 3위 유지
      { d: "03.01", r: 1 }, { d: "02.28", r: 1 }, { d: "02.27", r: 1 }, { d: "02.26", r: 1 },
      { d: "02.25", r: 1 }, { d: "02.24", r: 1 }, { d: "02.23", r: 1 }, { d: "02.22", r: 1 },
      { d: "02.21", r: 3 }, { d: "02.20", r: 3 }, { d: "02.19", r: 3 },
      { d: "02.18", r: 3 }, { d: "02.17", r: 3 }, { d: "02.16", r: 4 }, { d: "02.15", r: 4 },
      { d: "02.14", r: 4 }, { d: "02.13", r: 4 }, { d: "02.12", r: 5 }, { d: "02.11", r: 5 },
      { d: "02.10", r: 5 }, { d: "02.09", r: 5 }, { d: "02.08", r: 6 },
      { d: "02.07", r: 6 }, { d: "02.06", r: 6 }, { d: "02.05", r: 7 }, { d: "02.04", r: 7 },
      { d: "02.03", r: 6 }, { d: "02.02", r: 5 }, { d: "02.01", r: 5 },
      // 1월: 42위 → 3위 (급속 상승)
      { d: "01.31", r: 4 }, { d: "01.30", r: 3 }, { d: "01.29", r: 3 },
      { d: "01.28", r: 3 }, { d: "01.27", r: 3 }, { d: "01.26", r: 4 }, { d: "01.25", r: 6 },
      { d: "01.24", r: 10 }, { d: "01.23", r: 19 }, { d: "01.22", r: 19 }, { d: "01.21", r: 19 },
      { d: "01.20", r: 17 }, { d: "01.19", r: 17 }, { d: "01.18", r: 15 },
      { d: "01.17", r: 13 }, { d: "01.16", r: 13 }, { d: "01.15", r: 13 }, { d: "01.14", r: 13 },
      { d: "01.13", r: 15 }, { d: "01.12", r: 16 }, { d: "01.11", r: 20 }, { d: "01.10", r: 29 },
      { d: "01.09", r: 35 }, { d: "01.08", r: 38 }, { d: "01.07", r: 42 },
      { d: "01.06", r: 43 }, { d: "01.05", r: 41 }, { d: "01.04", r: 40 }, { d: "01.03", r: 40 },
      { d: "01.02", r: 40 }, { d: "01.01", r: 42 },
      // 12월: 42~49위대 (중간 등락)
      { d: "12.31", r: 42 }, { d: "12.30", r: 42 }, { d: "12.29", r: 43 }, { d: "12.28", r: 43 },
      { d: "12.27", r: 45 }, { d: "12.26", r: 45 }, { d: "12.25", r: 45 }, { d: "12.24", r: 45 },
      { d: "12.23", r: 48 }, { d: "12.22", r: 48 }, { d: "12.21", r: 47 }, { d: "12.20", r: 47 },
      { d: "12.19", r: 48 }, { d: "12.18", r: 48 }, { d: "12.17", r: 49 }, { d: "12.16", r: 42 },
      { d: "12.15", r: 42 }, { d: "12.14", r: 40 }, { d: "12.13", r: 35 }, { d: "12.12", r: 32 },
      { d: "12.11", r: 32 }, { d: "12.10", r: 30 }, { d: "12.09", r: 32 }, { d: "12.08", r: 36 },
      { d: "12.07", r: 37 }, { d: "12.06", r: 37 }, { d: "12.05", r: 40 },
      { d: "12.04", r: 42 }, { d: "12.03", r: 43 }, { d: "12.02", r: 43 }, { d: "12.01", r: 44 },
      // 11월: 162위에서 시작 (11.27)
      { d: "11.30", r: 44 }, { d: "11.29", r: 47 }, { d: "11.28", r: 48 },
      { d: "11.27", r: 162 },
    ],
  },
  {
    id: "iheal",
    name: "아이힐동물병원",
    area: "강남구",
    category: "동물병원",
    keyword: "강남 동물병원",
    tier: "premium",
    naverUrl: "",
    capability: "automation",
    capabilityIcon: "⚙️",
    capabilityLabel: "자동화 & 채널 셋업",
    capabilityQuote: "카카오톡 채널부터 업무 자동화까지",
    accentColor: T.blue,
    period: "2026.03 ~ 현재",
    highlights: ["카카오톡 채널 구축", "시즌별 자동 발송", "Premium 풀서비스"],
    automationFeatures: [
      { label: "카카오톡 채널 개설 & 자동응답 설정", done: true },
      { label: "봄철 슬개골 주의보 카톡 자동 발송", done: true },
      { label: "예약 리마인드 알림 자동화", done: true },
      { label: "시술 후 팔로업 문자 자동 발송", done: true },
      { label: "리뷰 요청 자동 발송 시나리오", done: true },
      { label: "시즌 프로모션 콘텐츠 제작 & 배포", done: true },
    ] as unknown as string[],
  },
  {
    id: "hyesung",
    name: "혜성산부인과",
    area: "동두천시",
    category: "산부인과",
    keyword: "동두천 산부인과",
    tier: "premium",
    tierExtra: "Youtube",
    naverUrl: "https://naver.me/F74Vx2y5",
    capability: "content_growth",
    capabilityIcon: "▶",
    capabilityLabel: "콘텐츠 제작 · 관리 · 성장",
    capabilityQuote: "41.2만 구독자, 조회수 37% 성장",
    accentColor: YT_RED,
    period: "운영 5년+",
    highlights: ["유튜브 41.2만 구독자", "조회수 37% 증가", "MBN·MBC 다수 협업", "국제크리에이터대상 의료부문"],
    youtube: {
      channelName: "산부인과TV",
      subs: "41.2만",
      totalViews: "1.56억",
      years: 5,
      recent28d: {
        views: "132.9만",
        viewsSub: "평소보다 24.9만 높음",
        watchHours: "1.7만",
        newSubs: "+877",
        revenue: "$552",
      },
      growth: "37%",
      mediaCredits: [
        "MBN 쉬는 부부 협업",
        "MBN 끝내주는 부부 협업",
        "MBC 몸신 협업",
        "국제크리에이터 대상 의료부문 대상",
      ],
    },
  },
];

/* ─────────────────────────────────────────────
   Capability-specific Sections
   ───────────────────────────────────────────── */

function AutomationChecklist({ features }: { features: Array<{ label: string; done: boolean }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "16px 0 12px" }}>
      {features.map((f, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
          background: T.gw, borderRadius: 10,
          animation: `fadeSlide .35s ease ${i * 60}ms both`,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: "50%",
            background: f.done ? `${T.green}20` : T.gw,
            border: `2px solid ${f.done ? T.green : T.dim}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: T.green,
          }}>{f.done ? "✓" : ""}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{f.label}</span>
          {f.done && (
            <span style={{
              marginLeft: "auto", fontSize: 10, fontWeight: 700,
              color: T.green, background: `${T.green}15`,
              padding: "2px 8px", borderRadius: 4,
            }}>완료</span>
          )}
        </div>
      ))}
    </div>
  );
}

function YouTubeSection({ yt }: { yt: NonNullable<ClientCase["youtube"]> }) {
  return (
    <div style={{ margin: "16px 0 12px" }}>
      {/* 28-day stats */}
      <div style={{
        background: `${YT_RED}08`, border: `1px solid ${YT_RED}20`,
        borderRadius: 12, padding: 16, marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: YT_RED, marginBottom: 10, letterSpacing: 1 }}>
          📊 최근 28일 실적 (YouTube Studio)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          <StatBox label="조회수" value={yt.recent28d.views} sub={`↑ ${yt.recent28d.viewsSub}`} />
          <StatBox label="시청 시간" value={`${yt.recent28d.watchHours} 시간`} />
          <StatBox label="신규 구독자" value={yt.recent28d.newSubs} color={T.green} />
          <StatBox label="예상 수익" value={yt.recent28d.revenue} />
        </div>
      </div>

      {/* Growth loop */}
      <div style={{
        background: T.gw, borderRadius: 12, padding: 16, marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 12, letterSpacing: 1 }}>
          🔄 제작 → 관리 → 상승 루프
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
          {[
            { step: "제작", icon: "🎬", desc: "기획·촬영·편집", color: T.blue },
            { step: "관리", icon: "📋", desc: "SEO·썸네일·업로드", color: T.yellow },
            { step: "상승", icon: "📈", desc: "조회수·구독자 성장", color: T.green },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", minWidth: 80 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", margin: "0 auto 6px",
                  background: `${s.color}20`, border: `2px solid ${s.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.step}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{s.desc}</div>
              </div>
              {i < 2 && (
                <span style={{ fontSize: 18, color: T.dim, margin: "0 8px 16px" }}>→</span>
              )}
            </div>
          ))}
        </div>
        <div style={{
          textAlign: "center", marginTop: 10, fontSize: 12, color: T.muted,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <span style={{ fontSize: 16 }}>↻</span>
          이 루프를 반복하며 채널 조회수
          <span style={{ color: T.green, fontWeight: 800 }}>{yt.growth} 증가</span>
          달성
        </div>
      </div>

      {/* Channel overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
        <StatBox label="총 구독자" value={`${yt.subs}명`} />
        <StatBox label="누적 조회수" value={`${yt.totalViews} 뷰`} />
        <StatBox label="운영 기간" value={`${yt.years}년+`} />
      </div>

      {/* YouTube → Awareness → Broadcast story */}
      <div style={{
        background: `linear-gradient(135deg, ${YT_RED}08, rgba(75,0,130,.08))`,
        border: `1px solid ${YT_RED}18`, borderRadius: 12, padding: 16, marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: YT_RED, marginBottom: 12, letterSpacing: 1 }}>
          📺 유튜브가 만든 선순환
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
          {[
            { step: "유튜브 성장", icon: "▶", desc: "41.2만 구독자", color: YT_RED },
            { step: "인지도 상승", icon: "🔥", desc: "의료계 인플루언서", color: T.yellow },
            { step: "공중파 출연", icon: "📺", desc: "MBN·MBC 다수", color: T.blue },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", minWidth: 80 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", margin: "0 auto 6px",
                  background: `${s.color}20`, border: `2px solid ${s.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>{s.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.step}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{s.desc}</div>
              </div>
              {i < 2 && (
                <span style={{ fontSize: 18, color: T.dim, margin: "0 8px 16px" }}>→</span>
              )}
            </div>
          ))}
        </div>
        <div style={{
          textAlign: "center", marginTop: 12, fontSize: 12, fontWeight: 600, color: T.text,
          background: `${YT_RED}10`, borderRadius: 8, padding: "8px 12px",
        }}>
          유튜브 채널 성장으로 <span style={{ color: YT_RED, fontWeight: 800 }}>공중파 제안이 쏟아지는</span> 선순환 구조
        </div>
      </div>

      {/* Media credits */}
      <div style={{
        background: T.gw, borderRadius: 12, padding: 14, marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 10, letterSpacing: 1 }}>
          📺 공중파 · 미디어 출연 실적
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
          {yt.mediaCredits.map((m, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 10px", background: `${YT_RED}08`, borderRadius: 8,
              fontSize: 12, fontWeight: 600, color: T.text,
            }}>
              <span style={{ color: YT_RED }}>✦</span> {m}
            </div>
          ))}
        </div>
      </div>

      {/* Current YouTube clients */}
      <div style={{
        background: T.gw, borderRadius: 12, padding: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 10, letterSpacing: 1 }}>
          🎬 현재 유튜브 협업 고객사
        </div>
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center",
        }}>
          {[
            "NAFIK", "만택루쎄의원", "MEDILOGIA", "Gaberoun", "모두의지인",
            "슈퍼맨 비뇨기과", "HBT", "MBLab", "스탠탑 비뇨의학과", "Liz TV",
            "Womanizer", "bnvbiolab", "Only for you", "박혜성몰", "Neomedix",
            "HOMETHERA", "해성산부인과", "LEE YOUNG WHEE", "펠리체여성의원",
          ].map((name, i) => (
            <span key={i} style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
              background: T.bgCard, border: `1px solid ${T.border}`, color: T.text,
              whiteSpace: "nowrap",
            }}>{name}</span>
          ))}
        </div>
        <div style={{
          textAlign: "center", marginTop: 10, fontSize: 11, color: T.muted,
        }}>
          외 다수 · 의료·뷰티·라이프스타일 전문
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Unified CaseCard
   ───────────────────────────────────────────── */
function ProofModal({ src, onClose }: { src: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale(s => Math.min(s + 0.3, 5));
      if (e.key === "-") setScale(s => Math.max(s - 0.3, 0.5));
      if (e.key === "0") { setScale(1); setPos({ x: 0, y: 0 }); }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale(s => Math.min(Math.max(s - e.deltaY * 0.002, 0.5), 5));
    };
    document.addEventListener("keydown", onKey);
    const el = containerRef.current;
    if (el) el.addEventListener("wheel", onWheel, { passive: false });
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      if (el) el.removeEventListener("wheel", onWheel);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPos({
      x: dragRef.current.ox + (e.clientX - dragRef.current.startX),
      y: dragRef.current.oy + (e.clientY - dragRef.current.startY),
    });
  };
  const onPointerUp = () => { dragRef.current = null; };

  return (
    <div ref={containerRef} onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      {/* Controls bar */}
      <div onClick={e => e.stopPropagation()} style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 6, zIndex: 10,
        background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: 12, padding: "6px 10px",
      }}>
        <button onClick={() => setScale(s => Math.max(s - 0.3, 0.5))} style={zoomBtnStyle}>−</button>
        <span style={{ fontSize: 12, color: T.text, fontWeight: 700, minWidth: 48, textAlign: "center" }}>
          {Math.round(scale * 100)}%
        </span>
        <button onClick={() => setScale(s => Math.min(s + 0.3, 5))} style={zoomBtnStyle}>+</button>
        <div style={{ width: 1, height: 18, background: T.border, margin: "0 4px" }} />
        <button onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }} style={{ ...zoomBtnStyle, fontSize: 11, width: "auto", padding: "0 8px" }}>초기화</button>
        <div style={{ width: 1, height: 18, background: T.border, margin: "0 4px" }} />
        <button onClick={onClose} style={{ ...zoomBtnStyle, color: T.accent }}>✕</button>
      </div>

      {/* Image */}
      <div
        onClick={e => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          cursor: scale > 1 ? "grab" : "zoom-in",
          overflow: "hidden", maxWidth: "95vw", maxHeight: "85vh",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <img
          src={src}
          alt="실제 순위 트래킹 증명"
          draggable={false}
          onClick={() => { if (scale <= 1) setScale(2); else { setScale(1); setPos({ x: 0, y: 0 }); } }}
          style={{
            maxWidth: "95vw", maxHeight: "85vh",
            borderRadius: 12, border: `1px solid ${T.border}`,
            objectFit: "contain",
            transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
            transition: dragRef.current ? "none" : "transform 0.2s ease",
            userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}

const zoomBtnStyle: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8,
  background: "transparent", border: `1px solid ${T.border}`,
  color: T.text, fontSize: 16, fontWeight: 700,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
};

function CaseCard({ c }: { c: ClientCase }) {
  const [open, setOpen] = useState(true);
  const [showProof, setShowProof] = useState(false);
  const fade = useFadeIn();
  const hasTracking = !!c.tracking && c.tracking.length > 0;
  const autoFeatures = c.automationFeatures as unknown as Array<{ label: string; done: boolean }> | undefined;

  return (
    <div ref={fade.ref} style={{ ...fade.style }} id={c.id}>
      <div
        onClick={() => hasTracking && setOpen(!open)}
        style={{
          background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: "28px 28px 24px", cursor: hasTracking ? "pointer" : "default",
          position: "relative", overflow: "hidden", transition: "border-color .25s",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = `${c.accentColor}44`)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
      >
        {/* top accent line */}
        <div style={{ position: "absolute", inset: "0 0 auto 0", height: 3, background: c.accentColor }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 1 }}>{c.category} · {c.area}</span>
              <TierBadge tier={c.tier} extra={c.tierExtra} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: T.text }}>{c.name}</h3>
          </div>
          {c.rank != null && <RankDot rank={c.rank} />}
        </div>

        {/* Capability banner */}
        <div style={{
          margin: "16px 0", padding: "12px 16px", borderRadius: 10,
          background: `${c.accentColor}12`, border: `1px solid ${c.accentColor}25`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 22 }}>{c.capabilityIcon}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: c.accentColor, letterSpacing: 1 }}>{c.capabilityLabel}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 2 }}>{c.capabilityQuote}</div>
          </div>
        </div>

        {/* Ranking stats (cases 1, 2) */}
        {c.totalBiz != null && c.monthlySearch != null && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, margin: "0 0 14px" }}>
            <StatBox label="대표 키워드" value={c.keyword} />
            <StatBox label="경쟁 업체" value={`${c.totalBiz}개`} />
            <StatBox label="월 검색량" value={`${c.monthlySearch.toLocaleString()}건`} />
          </div>
        )}

        {/* Automation checklist (case 3) */}
        {c.capability === "automation" && autoFeatures && (
          <AutomationChecklist features={autoFeatures} />
        )}

        {/* YouTube section (case 4) */}
        {c.capability === "content_growth" && c.youtube && (
          <YouTubeSection yt={c.youtube} />
        )}

        {/* Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {c.highlights.map((h, i) => <Badge key={i} color={T.green}>✓ {h}</Badge>)}
        </div>

        {/* Footer row */}
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {c.naverUrl && <NaverLink url={c.naverUrl} />}
          {c.proofImage && (
            <button
              onClick={e => { e.stopPropagation(); setShowProof(true); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                color: T.yellow, background: `${T.yellowDim}`,
                border: `1px solid ${T.yellow}40`, cursor: "pointer",
                transition: "background .2s",
              }}
            >📸 실제 증명 보기</button>
          )}
          <span style={{ fontSize: 12, color: T.dim }}>🕐 {c.period}</span>
          {hasTracking && (
            <span style={{ marginLeft: "auto", color: T.accent, fontWeight: 600, fontSize: 12 }}>
              {open ? "트래킹 접기 ▲" : "순위 트래킹 보기 ▼"}
            </span>
          )}
        </div>

        {showProof && c.proofImage && (
          <ProofModal src={c.proofImage} onClose={() => setShowProof(false)} />
        )}

        {/* Tracking expand — 7-column grid */}
        {open && c.tracking && (() => {
          const knockRanks = c.takeoverIndex != null
            ? c.tracking.slice(0, c.takeoverIndex).map(t => t.r)
            : c.tracking.map(t => t.r);
          const ranks = c.tracking.map(t => t.r);
          const avg = (knockRanks.reduce((a, b) => a + b, 0) / knockRanks.length).toFixed(1);
          const currentRank = ranks[0];
          const initialRank = c.takeoverIndex != null
            ? c.tracking[c.takeoverIndex]?.r ?? ranks[ranks.length - 1]
            : ranks[ranks.length - 1];
          const rankColor = (r: number) =>
            r === 1 ? T.green : r <= 3 ? T.yellow : r <= 5 ? T.blue : T.muted;
          const rankBg = (r: number) =>
            r === 1 ? "rgba(52,199,89,0.08)" : r <= 3 ? "rgba(249,168,37,0.08)" : r <= 5 ? "rgba(74,158,255,0.06)" : "transparent";
          return (
            <div style={{ marginTop: 18, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 1 }}>DAILY RANK TRACKING</div>
                  <span style={{ fontSize: 11, color: T.muted }}>최신순 ↓</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.25)",
                    color: T.accent, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                  }}>{c.takeoverIndex != null ? "5~8위 오르락 내리락 (맡을 당시)" : `맡을 당시 ${initialRank}위`}</span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: `${rankColor(currentRank)}15`, border: `1px solid ${rankColor(currentRank)}35`,
                    color: rankColor(currentRank), padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                  }}>현재 {currentRank}위</span>
                </div>
              </div>
              <div className="rank-grid">
                {c.tracking.map((t, i) => {
                  const isPre = c.takeoverIndex != null && i >= c.takeoverIndex;
                  if (isPre) return null;
                  return (
                    <React.Fragment key={i}>
                      {c.takeoverIndex != null && i === c.takeoverIndex && (
                        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8, margin: "6px 0", padding: "4px 0" }}>
                          <span style={{ flex: 1, height: 1, background: `${T.accent}30` }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, whiteSpace: "nowrap" }}>↓ 타 업체 운영 기간 (5~8위 오르락 내리락)</span>
                          <span style={{ flex: 1, height: 1, background: `${T.accent}30` }} />
                        </div>
                      )}
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        gap: 2, padding: 8, borderRadius: 8,
                        background: rankBg(t.r),
                        animation: `fadeSlide .2s ease ${Math.min(i, 40) * 15}ms both`,
                      }}>
                        <span style={{ fontSize: 11, color: T.muted, lineHeight: 1 }}>{t.d}</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: rankColor(t.r), lineHeight: 1.2 }}>{t.r}위</span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* 노크 이관 구분선 + 타 업체 요약 배너 */}
              {c.takeoverIndex != null && (
                <>
                  {/* 구분선 with pill */}
                  <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "20px 0 16px" }}>
                    <span style={{ flex: 1, height: 1, background: "#1e1e32" }} />
                    <span style={{
                      background: "#0d0d1a", border: "1px solid #e94560", color: "#e94560",
                      fontSize: 11, padding: "4px 12px", borderRadius: 99, whiteSpace: "nowrap", fontWeight: 600,
                    }}>노크 이관 (2025.11)</span>
                    <span style={{ flex: 1, height: 1, background: "#1e1e32" }} />
                  </div>

                  {/* 타 업체 요약 배너 */}
                  <div style={{
                    background: "rgba(249, 168, 37, 0.06)",
                    border: "1px dashed rgba(249, 168, 37, 0.3)",
                    borderRadius: 12, padding: "24px 32px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 13, color: "#f9a825", fontWeight: 600, marginBottom: 8 }}>
                      ⚠️ 타 업체 5개월간 운영 (11월 이관 전)
                    </div>
                    <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 36, fontWeight: 900, color: T.yellow, lineHeight: 1.2 }}>
                      5~8위
                    </div>
                    <div style={{ fontSize: 15, color: T.muted, marginTop: 4 }}>
                      오르락 내리락
                    </div>
                    <div style={{ fontSize: 12, color: T.dim, marginTop: 10 }}>
                      5개월간 상위권 진입 실패
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */
export default function ReferencesPage() {
  const basicCases = CLIENT_CASES.filter(c => c.tier === "basic");
  const premiumCases = CLIENT_CASES.filter(c => c.tier === "premium");

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <style>{`
        @keyframes fadeSlide { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:none; } }
        .rank-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        @media (max-width: 640px) {
          .rank-grid { grid-template-columns: repeat(5, 1fr); }
        }
        @media (max-width: 420px) {
          .rank-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* ── NAV ── */}
      <GlobalNav />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center">
        <DoorKnockHero />
        <div className="container mx-auto px-6 relative">
          <div className="content-max text-center">
            <AnimatedSection>
              <div className="knock-badge-premium mb-8 mx-auto w-fit">
                실제 고객사 성과 공개
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 premium-title">
                숫자로 증명하는
                <br />
                <span className="gradient-text text-5xl md:text-7xl lg:text-[5.4rem]">병원 마케팅 레퍼런스</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                네이버 플레이스 상위 노출부터 유튜브 채널 성장까지,
                <br />
                실제 고객사의 성과를 투명하게 공개합니다.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="flex justify-center flex-wrap gap-3">
                {CLIENT_CASES.map(c => (
                  <a key={c.id} href={`#${c.id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors hover:opacity-80" style={{
                    color: c.accentColor, background: `${c.accentColor}12`,
                    border: `1px solid ${c.accentColor}25`, textDecoration: "none",
                  }}>
                    {c.capabilityIcon} {c.capabilityLabel}
                  </a>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── SECTION 1 — BASIC CASES (순위) ── */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <SectionTag num="1" label="Naver Place Ranking" />
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">순위가 증명합니다</h2>
              <p className="text-muted-foreground text-center text-base md:text-lg mb-12">
                카드를 클릭하면 일별 순위 트래킹 데이터를 볼 수 있습니다.
              </p>
            </AnimatedSection>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {basicCases.map(c => <CaseCard key={c.id} c={c} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="content-max mx-auto px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <span className="text-sm md:text-base font-bold text-primary whitespace-nowrap">
            순위를 넘어, 비즈니스 전체를
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>
      </div>

      {/* ── SECTION 2 — PLATINUM CASES (풀서비스) ── */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <SectionTag num="2" label="Full Service" />
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">풀서비스로 성장시킵니다</h2>
              <p className="text-muted-foreground text-center text-base md:text-lg mb-12">
                순위 관리를 넘어 자동화, 콘텐츠, 채널 성장까지 책임집니다.
              </p>
            </AnimatedSection>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {premiumCases.map(c => <CaseCard key={c.id} c={c} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — TRACKING ── */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <SectionTag num="3" label="Tracking System" />
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">실시간으로 확인하세요</h2>
              <p className="text-muted-foreground text-center text-base md:text-lg mb-12">
                고객님 전용 대시보드에서 순위·활동·성과를 24시간 확인할 수 있습니다.
              </p>
            </AnimatedSection>

            <div className="knock-card p-7" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="flex flex-wrap gap-3">
                {["📊 일별 순위 트래킹", "📝 활동 로그 타임라인", "✅ 서브노드 체크리스트", "📎 리포트 첨부", "🔒 패키지별 잠금/해제"].map((f, i) => (
                  <span key={i} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{
                    background: "hsl(var(--primary) / 0.04)", borderColor: "hsl(var(--border))", color: "hsl(var(--primary))",
                  }}>{f}</span>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { step: "01", title: "계약 시 계정 발급", desc: "전용 로그인 제공" },
                  { step: "02", title: "노크 시스템 상태 표시", desc: "초록/노랑/회색 실시간" },
                  { step: "03", title: "활동 로그 기록", desc: "모든 작업 내역 공개" },
                  { step: "04", title: "월간 리포트", desc: "성과 요약 제공" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: "hsl(var(--primary) / 0.04)" }}>
                    <div className="text-primary text-xs font-extrabold mb-2">{s.step}</div>
                    <div className="text-sm font-bold text-foreground mb-1">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-5 text-center font-semibold text-sm text-foreground" style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--accent) / 0.04))",
                border: "1px solid hsl(var(--border))",
              }}>
                숨기는 것 없이, 고객이 직접 확인하는 투명한 마케팅
              </div>

              <Link href="/system" className="glow-button flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold text-white" style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                textDecoration: "none",
              }}>
                트래킹 솔루션 보러가기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="content-max text-center space-y-8">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black">
                지금, 우리 병원의
                <br />
                <span className="text-primary">성장을 시작하세요</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <p className="text-muted-foreground text-lg">
                귀사 지역의 경쟁 분석 리포트를 무료로 제공합니다.
                <br />
                동별 독점이므로, 선점이 중요합니다.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <a href="https://open.kakao.com/o/saS7qini" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xl px-12 py-7 rounded-xl glow-button">
                무료 상담 신청 →
              </a>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
