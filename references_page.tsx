"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Style tokens – match knockai.click exactly
   ───────────────────────────────────────────── */
const T = {
  bg:        "var(--bg,        #060611)",
  bgCard:    "var(--bg-card,   #0d0d1a)",
  bgHover:   "var(--bg-hover,  #141428)",
  accent:    "var(--accent,    #e94560)",
  accentDim: "var(--accent-dim,rgba(233,69,96,.15))",
  green:     "var(--green,     #34c759)",
  greenDim:  "var(--green-dim, rgba(52,199,89,.12))",
  yellow:    "var(--yellow,    #f9a825)",
  yellowDim: "var(--yellow-dim,rgba(249,168,37,.12))",
  blue:      "var(--blue,      #4a9eff)",
  gw:        "var(--gw,        rgba(255,255,255,.06))",   // glass-white
  text:      "var(--text,      #eaeaef)",
  muted:     "var(--muted,     #72728a)",
  dim:       "var(--dim,       #3a3a52)",
  border:    "var(--border,    #1e1e32)",
};

/* ─────────────────────────────────────────────
   Tiny helpers
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

function Badge({ children, color = T.accent, bg }: { children: ReactNode; color?: string; bg?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: bg || `${color}18`, border: `1px solid ${color}30`,
      color, padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function SectionTag({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{
        width: 28, height: 28, borderRadius: "50%", background: T.accent,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: 13,
      }}>{num}</span>
      <span style={{ color: T.accent, fontSize: 12, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" }}>{label}</span>
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

/* ─────────────────────────────────────────────
   Data
   ───────────────────────────────────────────── */
const CASES = [
  {
    id: "noh",
    name: "노내과의원",
    area: "광명시",
    category: "내과",
    keyword: "광명 내과",
    rank: 1,
    totalBiz: 481,
    monthlySearch: 1040,
    period: "2025.11 ~ 현재",
    highlights: ["1위 달성", "키워드 5개 동시 관리", "481개 업체 중 최상위"],
    tracking: [
      { d: "03-21", r: 3 }, { d: "03-20", r: 3 }, { d: "03-19", r: 3 },
      { d: "03-18", r: 3 }, { d: "03-17", r: 3 }, { d: "03-16", r: 3 },
      { d: "03-10", r: 2 }, { d: "03-09", r: 2 }, { d: "03-08", r: 1 },
      { d: "03-07", r: 1 }, { d: "03-05", r: 1 }, { d: "03-04", r: 1 },
    ],
  },
  {
    id: "jeju",
    name: "인체발란의원",
    area: "제주시",
    category: "정형외과",
    keyword: "제주 정형외과",
    rank: 1,
    totalBiz: 169,
    monthlySearch: 1730,
    period: "2025.11 ~ 현재",
    highlights: ["1위 30일+ 연속", "169개 업체 부동의 1위"],
    tracking: [
      { d: "03-21", r: 1 }, { d: "03-20", r: 1 }, { d: "03-19", r: 1 },
      { d: "03-18", r: 1 }, { d: "03-17", r: 1 }, { d: "03-16", r: 1 },
      { d: "03-15", r: 1 }, { d: "03-14", r: 1 }, { d: "03-13", r: 1 },
      { d: "03-12", r: 1 }, { d: "03-11", r: 1 }, { d: "03-10", r: 1 },
    ],
  },
  {
    id: "yangju",
    name: "양주이지치과의원",
    area: "양주시",
    category: "치과",
    keyword: "양주치과",
    rank: 3,
    totalBiz: 385,
    monthlySearch: 1530,
    period: "2026.03 ~ 현재",
    highlights: ["Top 5 안착", "385개 업체 경쟁"],
    tracking: [
      { d: "03-21", r: 3 }, { d: "03-20", r: 5 }, { d: "03-19", r: 6 },
      { d: "03-18", r: 6 }, { d: "03-17", r: 5 }, { d: "03-16", r: 5 },
      { d: "03-15", r: 3 }, { d: "03-14", r: 6 }, { d: "03-13", r: 6 },
      { d: "03-12", r: 6 },
    ],
  },
];

const YOUTUBE = {
  name: "산부인과TV",
  subs: "41만",
  views: "1.56억",
  years: 5,
  highlights: ["MBN '쉬는 부부' 협업", "공중파 다수 출연", "국제크리에이터대상 의료부문", "조회수 37% 증가"],
};

const PACKAGES = [
  { name: "Entry", price: "50만원/월", note: "순위 상승", guarantee: "순위 상승 보장", color: T.muted },
  { name: "Basic", price: "100만원/월", note: "5위 개런티", guarantee: "3개월 5위 개런티", color: T.blue },
  { name: "Standard", price: "200만원/월", note: "홈페이지 + 자동화", guarantee: "5위 유지 보장", color: T.green },
  { name: "Premium", price: "300만원/월", note: "광고 + 업셀", guarantee: "성과 트래킹", color: T.yellow },
  { name: "Platinum", price: "400만원+α", note: "신환 책임", guarantee: "성과 기반 과금", color: T.accent, featured: true },
];

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */
function CaseCard({ c }: { c: typeof CASES[0] }) {
  const [open, setOpen] = useState(false);
  const fade = useFadeIn();

  return (
    <div ref={fade.ref} style={{ ...fade.style }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: "28px 28px 24px", cursor: "pointer", position: "relative", overflow: "hidden",
          transition: "border-color .25s",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = `${T.accent}44`)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
      >
        {/* top accent line */}
        <div style={{ position: "absolute", inset: "0 0 auto 0", height: 3, background: c.rank === 1 ? T.green : c.rank <= 3 ? T.yellow : T.accent }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 1 }}>{c.category} · {c.area}</span>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 0", color: T.text }}>{c.name}</h3>
          </div>
          <RankDot rank={c.rank} />
        </div>

        {/* stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "18px 0 16px" }}>
          {[
            { l: "대표 키워드", v: c.keyword },
            { l: "경쟁 업체", v: `${c.totalBiz}개` },
            { l: "월 검색량", v: `${c.monthlySearch.toLocaleString()}건` },
          ].map((s, i) => (
            <div key={i} style={{ background: T.gw, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: T.muted }}>{s.l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {c.highlights.map((h, i) => <Badge key={i} color={T.green}>✓ {h}</Badge>)}
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: T.dim, display: "flex", alignItems: "center", gap: 6 }}>
          <span>🕐 {c.period}</span>
          <span style={{ marginLeft: "auto", color: T.accent, fontWeight: 600 }}>
            {open ? "트래킹 접기 ▲" : "순위 트래킹 보기 ▼"}
          </span>
        </div>

        {/* Tracking expand */}
        {open && (
          <div style={{ marginTop: 18, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: T.muted, fontWeight: 600, marginBottom: 10, letterSpacing: 1 }}>DAILY RANK TRACKING</div>
            {c.tracking.map((t, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "6px 0",
                borderBottom: `1px solid ${T.gw}`,
                animation: `fadeSlide .35s ease ${i * 40}ms both`,
              }}>
                <span style={{ width: 56, fontSize: 12, color: T.muted }}>{t.d}</span>
                <RankDot rank={t.r} />
                <div style={{ flex: 1, height: 3, background: T.gw, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.max(8, 100 - (t.r - 1) * 16)}%`, height: "100%", borderRadius: 2,
                    background: t.r === 1 ? T.green : t.r <= 3 ? T.yellow : T.accent,
                    transition: "width .6s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function YoutubeCard() {
  const fade = useFadeIn();
  return (
    <div ref={fade.ref} style={{ ...fade.style }}>
      <div style={{
        background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
        padding: "28px 28px 24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: "0 0 auto 0", height: 3, background: "#ff0000" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 1 }}>유튜브 · 의료 콘텐츠</span>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 0", color: T.text }}>{YOUTUBE.name}</h3>
          </div>
          <Badge color="#ff0000">▶ YouTube 41만</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "18px 0 16px" }}>
          {[
            { l: "구독자", v: YOUTUBE.subs + "명" },
            { l: "누적 조회수", v: YOUTUBE.views + " 뷰" },
            { l: "운영 기간", v: YOUTUBE.years + "년" },
          ].map((s, i) => (
            <div key={i} style={{ background: T.gw, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: T.muted }}>{s.l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {YOUTUBE.highlights.map((h, i) => <Badge key={i} color="#ff0000">✓ {h}</Badge>)}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */
export default function ReferencesPage() {
  return (
    <main style={{
      background: T.bg, color: T.text, minHeight: "100vh",
      fontFamily: "var(--font-sans, 'Pretendard', -apple-system, sans-serif)",
    }}>
      <style>{`
        @keyframes fadeSlide { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${T.bg}cc`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${T.border}`, padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ color: T.text, textDecoration: "none", fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>
          <span style={{ color: T.accent }}>KNOCK</span> 병원 마케팅
        </Link>
        <div style={{ display: "flex", gap: 20, fontSize: 13, fontWeight: 600 }}>
          <Link href="/" style={{ color: T.muted, textDecoration: "none" }}>노크 시스템</Link>
          <Link href="/references" style={{ color: T.accent, textDecoration: "none" }}>레퍼런스</Link>
          <Link href="/login" style={{ color: T.muted, textDecoration: "none" }}>로그인</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header style={{
        padding: "80px 24px 60px", textAlign: "center", position: "relative",
        background: `radial-gradient(ellipse at 50% 0%, rgba(15,52,96,.3) 0%, transparent 60%)`,
      }}>
        <Badge color={T.accent}>동별 1업종 독점 보장</Badge>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, lineHeight: 1.15, margin: "20px 0 14px" }}>
          숫자로 증명하는<br />
          <span style={{ color: T.accent }}>병원 마케팅 레퍼런스</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 15, maxWidth: 420, margin: "0 auto", lineHeight: 1.7 }}>
          네이버 플레이스 상위 노출부터 유튜브 채널 성장까지,<br />
          실제 고객사의 성과를 투명하게 공개합니다.
        </p>
      </header>

      {/* ── SECTION 1 — CASES ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>
        <SectionTag num="1" label="Reference Cases" />
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>실적이 말합니다</h2>
        <p style={{ color: T.muted, fontSize: 14, marginBottom: 36 }}>
          카드를 클릭하면 일별 순위 트래킹 데이터를 볼 수 있습니다.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {CASES.map(c => <CaseCard key={c.id} c={c} />)}
          <YoutubeCard />
        </div>
      </section>

      {/* ── SECTION 2 — TRACKING ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>
        <SectionTag num="2" label="Tracking System" />
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>실시간으로 확인하세요</h2>
        <p style={{ color: T.muted, fontSize: 14, marginBottom: 36 }}>
          고객님 전용 대시보드에서 순위·활동·성과를 24시간 확인할 수 있습니다.
        </p>

        <div style={{
          background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: 28, display: "flex", flexDirection: "column", gap: 20,
        }}>
          {/* Feature pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {["📊 일별 순위 트래킹", "📝 활동 로그 타임라인", "✅ 서브노드 체크리스트", "📎 리포트 첨부", "🔒 패키지별 잠금/해제"].map((f, i) => (
              <span key={i} style={{
                background: T.gw, border: `1px solid ${T.border}`,
                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: T.blue,
              }}>{f}</span>
            ))}
          </div>

          {/* How it works */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            {[
              { step: "01", title: "계약 시 계정 발급", desc: "전용 로그인 제공" },
              { step: "02", title: "노크 시스템 상태 표시", desc: "초록/노랑/회색 실시간" },
              { step: "03", title: "활동 로그 기록", desc: "모든 작업 내역 공개" },
              { step: "04", title: "월간 리포트", desc: "성과 요약 제공" },
            ].map((s, i) => (
              <div key={i} style={{ background: T.gw, borderRadius: 12, padding: "16px 14px" }}>
                <div style={{ color: T.accent, fontSize: 11, fontWeight: 800, marginBottom: 6 }}>{s.step}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{s.desc}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${T.accentDim}, ${T.greenDim})`,
            border: `1px solid ${T.border}`, borderRadius: 12, padding: 18,
            fontSize: 14, color: T.text, textAlign: "center", fontWeight: 600,
          }}>
            🔐 숨기는 것 없이, 고객이 직접 확인하는 투명한 마케팅
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — GUARANTEE ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>
        <SectionTag num="3" label="Our Guarantee" />
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>못 하면, 책임집니다</h2>
        <p style={{ color: T.muted, fontSize: 14, marginBottom: 36 }}>
          계약서에 명시되는 성과 보장입니다.
        </p>

        {/* Timeline */}
        <div style={{
          background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: 28, marginBottom: 24,
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 16, position: "relative",
          }}>
            {[
              { m: "시작", ico: "⚡", d: "키워드 분석 착수", c: T.accent },
              { m: "1개월", ico: "📈", d: "순위 상승 시작", c: T.yellow },
              { m: "2개월", ico: "📊", d: "목표 근접", c: T.yellow },
              { m: "3개월", ico: "🎯", d: "5위 이내 확인", c: T.green },
              { m: "미달성?", ico: "🛡️", d: "달성까지 무료 연장", c: T.green },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", margin: "0 auto 10px",
                  background: `${s.c}20`, border: `2px solid ${s.c}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>{s.ico}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: s.c, marginBottom: 3 }}>{s.m}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{s.d}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 24, background: T.greenDim, border: `1px solid ${T.green}30`,
            borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 28 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 800, color: T.green, fontSize: 16 }}>
                Basic 이상: 3개월 5위 이내 개런티
              </div>
              <div style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>
                미달성 시 달성까지 추가 비용 없이 관리를 계속합니다.
              </div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}>
          {PACKAGES.map((p, i) => (
            <div key={i} style={{
              background: p.featured ? T.accentDim : T.bgCard,
              border: `1px solid ${p.featured ? `${T.accent}44` : T.border}`,
              borderRadius: 14, padding: "18px 16px", textAlign: "center",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: "0 0 auto 0", height: 3, background: p.color }} />
              <div style={{ fontSize: 12, fontWeight: 800, color: p.color, marginBottom: 3 }}>{p.name}</div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 3 }}>{p.price}</div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>{p.note}</div>
              <Badge color={p.color}>{p.guarantee}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{
          background: `linear-gradient(135deg, ${T.bgCard}, rgba(15,52,96,.2))`,
          border: `1px solid ${T.border}`, borderRadius: 20,
          padding: "52px 32px", textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 320, height: 320, borderRadius: "50%",
            background: `radial-gradient(circle, ${T.accent}0c, transparent 70%)`,
          }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>지금 시작하세요</h2>
            <p style={{ color: T.muted, fontSize: 14, maxWidth: 380, margin: "0 auto 28px", lineHeight: 1.7 }}>
              귀사 지역의 경쟁 분석 리포트를 무료로 제공합니다.<br />
              동별 독점이므로, 선점이 중요합니다.
            </p>
            <a href="tel:010-0000-0000" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: T.accent, color: "#fff", textDecoration: "none",
              padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 700,
              boxShadow: `0 4px 20px ${T.accentDim}`,
            }}>
              📞 무료 상담 신청 →
            </a>
            <div style={{ marginTop: 14, fontSize: 12, color: T.dim }}>
              노크AI · Knock
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `1px solid ${T.border}`, padding: "24px", textAlign: "center",
        fontSize: 12, color: T.dim,
      }}>
        노크 병원 마케팅 · 파이프라인 + CS 360 통합 전략
      </footer>
    </main>
  );
}
