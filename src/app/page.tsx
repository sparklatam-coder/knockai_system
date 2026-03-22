"use client";

import { useEffect, useMemo, useState } from "react";

interface PopupItem {
  text: string;
  core?: boolean;
}

interface PopupContent {
  title: string;
  color: string;
  sub: string;
  items: PopupItem[];
}

interface WheelSegment {
  id: PopupKey;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  angle: number;
}

type PopupKey =
  | "awareness"
  | "lead"
  | "nurture"
  | "qualified"
  | "convert"
  | "onboarding"
  | "upsell"
  | "support"
  | "education"
  | "community"
  | "product"
  | "analytics";

const popups: Record<PopupKey, PopupContent> = {
  awareness: {
    title: "🔍 인지 확대",
    color: "var(--gW)",
    sub: '잠재 환자가 우리 치과를 발견하는 모든 접점.<br><strong style="color:#FF8A50">네이버 플레이스가 신규 유입의 60~80%를 차지합니다.</strong>',
    items: [
      {
        text: '<strong class="ours">네이버 플레이스 순위 최적화</strong><span class="ours-tag">제공서비스</span> — 리뷰 관리, 저장수 확보, 사진/영상 최적화, 키워드 세팅. <strong style="color:#FF8A50">가장 중요하고, 가장 먼저 해야 하는 서비스입니다.</strong>',
        core: true,
      },
      {
        text: '<strong class="ours">네이버 플레이스 순위 분석/트래킹</strong><span class="ours-tag">제공서비스</span> — 키워드별 일간/주간 순위 변동 모니터링, 경쟁 치과 비교',
        core: true,
      },
      {
        text: '<strong class="ours">블로그 SEO 콘텐츠 제작</strong><span class="ours-tag">제공서비스</span> — "강남 임플란트 잘하는 곳" 등 상위노출 콘텐츠',
      },
      {
        text: '<strong class="ours">카페글 바이럴</strong><span class="ours-tag">제공서비스</span> — 맘카페, 지역카페 자연스러운 추천글',
      },
      {
        text: '<strong class="ours">인스타그램 운영 대행</strong><span class="ours-tag">제공서비스</span> — 비포/애프터, 릴스, 병원 일상',
      },
      {
        text: '<strong class="ours">검색광고(SA) 운영</strong><span class="ours-tag">제공서비스</span> — 네이버 파워링크, 메타 광고',
      },
      {
        text: '<strong>홈페이지</strong> — 모바일 최적화, 전화/카톡 연결',
      },
      { text: '<strong>지인추천</strong> — 전환율 80%+, 소개 카드 활용' },
    ],
  },
  lead: {
    title: "📋 리드 획득",
    color: "var(--gP)",
    sub: "관심을 보인 잠재 환자의 연락처를 확보하는 단계",
    items: [
      { text: '<strong>전화 응대</strong> — 3콜 이내 수신, 상담 스크립트 필수' },
      {
        text: '<strong class="ours">카카오톡 채널 세팅/자동응답</strong><span class="ours-tag">제공서비스</span> — 운영시간, 위치, 예약 방법 자동 안내',
      },
      { text: '<strong>네이버 예약</strong> — 24시간 자동 예약, 심야 고객 확보' },
      {
        text: '<strong class="ours">홈페이지 상담 폼 세팅</strong><span class="ours-tag">제공서비스</span> — 전환율 높은 양식 설계',
      },
    ],
  },
  nurture: {
    title: "💬 리드 육성",
    color: "var(--gPu)",
    sub: "아직 결정하지 못한 환자를 설득하는 과정",
    items: [
      {
        text: '<strong class="ours">미예약자 팔로업 문자 시나리오</strong><span class="ours-tag">제공서비스</span> — 3일/7일/14일 자동 발송',
      },
      { text: '<strong>비용 고민 환자</strong> — 할부/보험 안내 재발송' },
      {
        text: '<strong class="ours">차별점 강조 콘텐츠 제작</strong><span class="ours-tag">제공서비스</span> — 왜 우리 치과인지 어필',
      },
      { text: '<strong>재활용 DB 관리</strong> — 이탈 환자도 채널에 모아두기' },
    ],
  },
  qualified: {
    title: "⭐ 유망 리드",
    color: "var(--gG)",
    sub: "방문 가능성이 높은 환자를 선별하고 확정",
    items: [
      { text: '<strong>예약 확정 + 리마인드</strong> — 자동 알림으로 노쇼 방지' },
      {
        text: '<strong class="ours">초진 이벤트 기획</strong><span class="ours-tag">제공서비스</span> — 첫 방문 할인/무료 검진',
      },
      { text: '<strong>오시는 길 문자</strong> — 주차, 위치 자동 발송' },
    ],
  },
  convert: {
    title: "🏥 약속 방문 → 상담 → 진료 (신환 획득)",
    color: "var(--gG)",
    sub: "첫 방문 경험과 상담이 치료 결정을 좌우합니다",
    items: [
      { text: '<strong>대기 환경</strong> — 청결, 음료, 모니터 안내' },
      { text: '<strong>상담 품질</strong> — X-ray, 구강카메라로 시각적 설명' },
      { text: '<strong>투명한 비용</strong> — 치료 옵션별 가격 명확 안내' },
      { text: '<strong>충분한 설명</strong> — "왜 이 치료가 필요한지" 공감' },
      { text: '<strong>치료 계획서</strong> — 단계별 비용/기간 서면 제공' },
      {
        text: '<strong class="ours">리뷰 유도 프로세스 세팅</strong><span class="ours-tag">제공서비스</span> — QR코드, 영수증 리뷰 요청 플로우',
      },
    ],
  },
  onboarding: {
    title: "🎯 온보딩",
    color: "var(--gP)",
    sub: '첫 방문 환자를 "단골"로 만드는 첫 48시간',
    items: [
      {
        text: '<strong class="ours">당일 감사 문자 자동화</strong><span class="ours-tag">제공서비스</span> — "치료 후 불편한 점 없으세요?"',
      },
      {
        text: '<strong class="ours">카톡 채널 추가 유도 시나리오</strong><span class="ours-tag">제공서비스</span> — "추가 시 다음 진료 10% 할인"',
      },
      { text: '<strong>치료 후 주의사항</strong> — 카톡으로 이미지/영상 발송' },
      { text: '<strong>다음 예약 확인</strong> — 자동 리마인드 설정' },
    ],
  },
  upsell: {
    title: "💎 업셀 · 크로스셀",
    color: "var(--gW)",
    sub: "추가 진료 기회를 자연스럽게 제안",
    items: [
      { text: '<strong>스케일링 → 미백</strong> — "깨끗해진 김에 미백 해보실래요?"' },
      { text: '<strong>충치 → 정기검진</strong> — 6개월 후 검진 예약' },
      {
        text: '<strong class="ours">크로스셀 문자 시나리오</strong><span class="ours-tag">제공서비스</span> — 시술별 후속 제안 자동화',
      },
      { text: '<strong>가족 진료 할인</strong> — "가족분도 함께" 프로모션' },
    ],
  },
  support: {
    title: "🤝 고객 지원",
    color: "var(--gG)",
    sub: "치료 후에도 계속 관심을 보여주기",
    items: [
      {
        text: '<strong class="ours">시술 후 팔로업 자동화</strong><span class="ours-tag">제공서비스</span> — 임플란트, 발치 후 1주일 안부',
      },
      { text: '<strong>투약 리마인드</strong> — 카톡 자동 발송' },
      { text: '<strong>불편사항 즉시 대응</strong> — 24시간 채팅 상담' },
    ],
  },
  education: {
    title: "📚 건강 교육",
    color: "var(--gC)",
    sub: '"이 치과는 다르다"고 느끼는 순간',
    items: [
      {
        text: '<strong class="ours">월간 구강건강 콘텐츠 제작</strong><span class="ours-tag">제공서비스</span> — 카톡 발송용 카드뉴스',
      },
      {
        text: '<strong class="ours">계절별 관리 팁 콘텐츠</strong><span class="ours-tag">제공서비스</span> — 겨울 구강건조, 여름 구취',
      },
      { text: '<strong>올바른 칫솔질 영상</strong> — 치간칫솔 사용법' },
    ],
  },
  community: {
    title: "👥 커뮤니티",
    color: "var(--gPu)",
    sub: "환자가 스스로 우리 치과를 홍보하는 구조",
    items: [
      {
        text: '<strong class="ours">리뷰 이벤트 기획/운영</strong><span class="ours-tag">제공서비스</span> — 영수증 리뷰 시 사은품',
      },
      {
        text: '<strong class="ours">소개 리워드 프로그램 설계</strong><span class="ours-tag">제공서비스</span> — 추천인/피추천인 혜택',
      },
      {
        text: '<strong class="ours">인스타 태그 이벤트 운영</strong><span class="ours-tag">제공서비스</span>',
      },
      { text: '<strong style="color:#3DDC84">→ 입소문 → 인지확대 파이프라인으로 순환!</strong>' },
    ],
  },
  product: {
    title: "🎁 프로덕트",
    color: "var(--gPk)",
    sub: "상품 패키징으로 재방문 유도",
    items: [
      {
        text: '<strong class="ours">정기검진 패키지 기획</strong><span class="ours-tag">제공서비스</span> — 연 2회 스케일링+검진 할인',
      },
      {
        text: '<strong class="ours">멤버십 제도 설계</strong><span class="ours-tag">제공서비스</span> — VIP 등급별 혜택',
      },
      {
        text: '<strong class="ours">시즌 프로모션 기획</strong><span class="ours-tag">제공서비스</span> — 봄 미백, 가을 검진',
      },
    ],
  },
  analytics: {
    title: "📊 분석",
    color: "var(--gP)",
    sub: "데이터 기반으로 개선점을 찾는 단계",
    items: [
      {
        text: '<strong class="ours">플레이스 순위 트래킹</strong><span class="ours-tag">제공서비스</span> — 키워드별 일간/주간 변동 분석',
      },
      {
        text: '<strong class="ours">리뷰 감성 분석</strong><span class="ours-tag">제공서비스</span> — 긍정/부정 키워드 추출',
      },
      {
        text: '<strong class="ours">채널별 ROI 분석</strong><span class="ours-tag">제공서비스</span> — 어디서 환자가 오는지 측정',
      },
      {
        text: '<strong class="ours">경쟁 치과 모니터링</strong><span class="ours-tag">제공서비스</span> — 상위 20개 비교',
      },
    ],
  },
};

const segments: WheelSegment[] = [
  { id: "onboarding", label: "온보딩", sublabel: "첫 48시간", icon: "🎯", color: "var(--gP)", angle: 0 },
  { id: "upsell", label: "업셀", sublabel: "추가 진료", icon: "💎", color: "var(--gW)", angle: 51.4 },
  { id: "support", label: "고객 지원", sublabel: "사후 관리", icon: "🤝", color: "var(--gG)", angle: 102.8 },
  { id: "education", label: "건강 교육", sublabel: "콘텐츠", icon: "📚", color: "var(--gC)", angle: 154.3 },
  { id: "community", label: "커뮤니티", sublabel: "리뷰·소개", icon: "👥", color: "var(--gPu)", angle: 205.7 },
  { id: "product", label: "프로덕트", sublabel: "패키지", icon: "🎁", color: "var(--gPk)", angle: 257.1 },
  { id: "analytics", label: "분석", sublabel: "데이터", icon: "📊", color: "var(--gP)", angle: 308.5 },
];

export default function Home() {
  const [activePopup, setActivePopup] = useState<PopupKey | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePopup(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const stars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, index) => ({
        left: `${(index * 37.7) % 100}%`,
        top: `${(index * 19.3) % 100}%`,
        duration: `${2 + ((index * 11) % 40) / 10}s`,
        delay: `${((index * 7) % 30) / 10}s`,
      })),
    [],
  );

  const selectedPopup = activePopup ? popups[activePopup] : null;

  return (
    <>
      <div className="stars" aria-hidden="true">
        {stars.map((star, index) => (
          <span
            key={`star-${index}`}
            style={{
              left: star.left,
              top: star.top,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <div className="hero">
        <div className="hero-badge">KNOCK 병원 마케팅 시스템</div>
        <h1>
          노크 병원 마케팅 <span className="ac">플라이휠 전략</span>
        </h1>
        <p>
          신규 환자를 만들고, 한 번 온 환자를 <strong>평생 환자</strong>로 바꾸는 순환
          시스템
        </p>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-line" /> <span className="ours legend-label">밑줄</span> = 제공 서비스
          </div>
          <div className="legend-item">
            <span className="legend-dot" /> 핵심 = 네이버 플레이스
          </div>
        </div>
        <a
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 24,
            padding: "12px 28px",
            borderRadius: 12,
            background: "linear-gradient(135deg, var(--gP), var(--gC))",
            color: "#081018",
            fontSize: 15,
            fontWeight: 800,
            textDecoration: "none",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 20px rgba(79,156,255,0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(79,156,255,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(79,156,255,0.3)";
          }}
        >
          🔐 고객사 대시보드 접속
        </a>
      </div>

      <div className="container">
        <div className="main-row">
          <div className="pipeline-col">
            <div className="sec-label">신규 환자 확보</div>
            <div className="sec-title">신규 환자 확보 파이프라인</div>
            <div className="sec-desc">잠재 환자 발견 → 리드 확보 → 신환 획득까지의 여정</div>

            <div className="p-row">
              <button className="p-node star" style={{ ["--ng" as string]: "var(--gW)" }} onClick={() => setActivePopup("awareness")} type="button">
                <div className="p-box">
                  <span className="sp" style={{ background: "var(--gW)", ["--sx" as string]: "-10px", ["--sy" as string]: "-14px", top: "8%", left: "18%" }} />
                  <span className="sp" style={{ background: "var(--gC)", ["--sx" as string]: "12px", ["--sy" as string]: "-10px", top: "12%", right: "14%" }} />
                  <span className="sp" style={{ background: "#fff", ["--sx" as string]: "-6px", ["--sy" as string]: "10px", bottom: "16%", left: "28%" }} />
                  <div className="ico">🔍</div>
                  <div className="lb">인지 확대</div>
                  <div className="sb">네이버 플레이스 · 블로그 · 광고 · SNS</div>
                  <div className="star-tag">핵심 — 네이버 플레이스 순위 ★</div>
                </div>
              </button>
            </div>

            <div className="v-arrow">↓</div>

            <div className="p-row">
              <button className="p-node" style={{ ["--ng" as string]: "var(--gP)" }} onClick={() => setActivePopup("lead")} type="button">
                <div className="p-box">
                  <span className="sp" style={{ background: "var(--gP)", ["--sx" as string]: "10px", ["--sy" as string]: "-12px", top: "10%", right: "18%" }} />
                  <span className="sp" style={{ background: "#fff", ["--sx" as string]: "-8px", ["--sy" as string]: "-10px", top: "16%", left: "14%" }} />
                  <div className="ico">📋</div>
                  <div className="lb">리드 획득</div>
                  <div className="sb">전화 · 카카오톡 · 네이버 예약 · 홈페이지 폼</div>
                </div>
              </button>
            </div>

            <div className="v-arrow">↓</div>

            <div className="p-row">
              <button className="p-node" style={{ ["--ng" as string]: "var(--gPu)" }} onClick={() => setActivePopup("nurture")} type="button">
                <div className="p-box">
                  <span className="sp" style={{ background: "var(--gPu)", ["--sx" as string]: "-10px", ["--sy" as string]: "-12px", top: "10%", left: "20%" }} />
                  <div className="ico">💬</div>
                  <div className="lb">리드 육성</div>
                  <div className="sb">팔로업 · 설득</div>
                </div>
              </button>
              <div className="p-arr">+</div>
              <button className="p-node" style={{ ["--ng" as string]: "var(--gG)" }} onClick={() => setActivePopup("qualified")} type="button">
                <div className="p-box">
                  <span className="sp" style={{ background: "var(--gG)", ["--sx" as string]: "8px", ["--sy" as string]: "-14px", top: "6%", right: "22%" }} />
                  <div className="ico">⭐</div>
                  <div className="lb">유망 리드</div>
                  <div className="sb">방문 의향 확인</div>
                </div>
              </button>
            </div>

            <div className="v-arrow">↓</div>

            <div className="p-row">
              <button className="p-merged" style={{ ["--ng" as string]: "var(--gW)" }} onClick={() => setActivePopup("convert")} type="button">
                <div className="p-box convert-box">
                  <span className="sp" style={{ background: "var(--gG)", ["--sx" as string]: "-12px", ["--sy" as string]: "-10px", top: "8%", left: "16%" }} />
                  <span className="sp" style={{ background: "var(--gW)", ["--sx" as string]: "10px", ["--sy" as string]: "-12px", top: "8%", right: "16%" }} />
                  <span className="sp" style={{ background: "#fff", ["--sx" as string]: "4px", ["--sy" as string]: "10px", bottom: "10%", right: "28%" }} />
                  <div className="lb merge-title">🏥 약속 방문 → 상담 → 진료</div>
                  <div className="merge-items">
                    <div className="merge-item"><div className="mi-ico">🪑</div><div className="mi-lb">내원</div></div>
                    <div className="merge-item"><div className="mi-ico">🦷</div><div className="mi-lb">상담</div></div>
                    <div className="merge-item"><div className="mi-ico">✅</div><div className="mi-lb">치료 결정</div></div>
                  </div>
                  <div className="star-tag success-tag">= 신환 획득</div>
                </div>
              </button>
            </div>

            <div className="info-row">
              <div className="recycle-bar">
                <h4>♻️ 재활용</h4>
                <p>
                  <strong>카톡 채널, 문자 DB</strong>에 모아두면
                  <br />
                  이탈 환자도 시즌 때 재연락 가능.
                  <br />
                  <strong>채널에 없으면 영원히 잃음.</strong>
                </p>
              </div>
              <div className="crm-box">
                <h4>📱 채널에 모으기 = CRM</h4>
                <p>
                  <strong>관심은 있지만 아직인 환자</strong>의
                  <br />
                  연락처가 채널에 있어야 합니다.
                </p>
                <div className="crm-chips">
                  <span className="crm-chip">카카오톡</span>
                  <span className="crm-chip">문자 DB</span>
                  <span className="crm-chip">예약 DB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="flywheel-col">
            <div className="sec-label">고객 관리 360</div>
            <div className="sec-title">기존 환자 → 평생 환자</div>
            <div className="sec-desc">한 번 방문한 환자를 반복 방문 + 입소문 자산으로 전환</div>
            <div className="fw-wrap">
              <div className="wheel-box">
                <div className="wheel-ring" />
                <div className="wheel-center">
                  <div className="wc-circle">
                    <div className="wl">CS 360</div>
                    <div className="wt">평생 환자</div>
                  </div>
                </div>

                {segments.map((segment) => {
                  const radians = ((segment.angle - 90) * Math.PI) / 180;
                  const radius = 248;
                  const centerX = 340;
                  const centerY = 340;
                  const x = centerX + radius * Math.cos(radians) - 55;
                  const y = centerY + radius * Math.sin(radians) - 34;

                  return (
                    <button
                      key={segment.id}
                      className="w-seg"
                      onClick={() => setActivePopup(segment.id)}
                      style={{ ["--sc" as string]: segment.color, left: `${x}px`, top: `${y}px` }}
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
              <div className="return-loop">↩ 커뮤니티(리뷰·소개) → 다시 인지확대 파이프라인으로</div>
            </div>
          </div>
        </div>

        <div className="bottom-cta">
          <h3>플라이휠이 돌아가면, 치과가 성장합니다</h3>
          <p>
            왼쪽 파이프라인으로 <strong>새 환자</strong>를 만들고, 오른쪽 CS 360으로 <strong>평생
            환자</strong>로 전환.
            <br />
            두 바퀴가 맞물릴 때 경쟁 병원과의 격차가 벌어집니다.
          </p>
          <div className="cyc-row">
            <span className="cyc-pill">인지</span>
            <span className="cyc-a">→</span>
            <span className="cyc-pill">리드</span>
            <span className="cyc-a">→</span>
            <span className="cyc-pill">육성+유망</span>
            <span className="cyc-a">→</span>
            <span className="cyc-pill cyc-success">신환 획득</span>
            <span className="cyc-a">→</span>
            <span className="cyc-pill cyc-loop">CS 360 ↻</span>
          </div>
        </div>
      </div>

      <div className="footer">노크 병원 마케팅 프레임워크 · 파이프라인 + CS 360 통합 전략</div>

      <div
        aria-hidden={activePopup === null}
        className={`popup-overlay${activePopup ? " show" : ""}`}
        onClick={() => setActivePopup(null)}
      >
        <div
          className="popup"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <button className="popup-close" onClick={() => setActivePopup(null)} type="button">
            ✕
          </button>
          {selectedPopup ? (
            <div>
              <h3 style={{ color: selectedPopup.color }}>{selectedPopup.title}</h3>
              <div className="p-sub" dangerouslySetInnerHTML={{ __html: selectedPopup.sub }} />
              <ul className="p-list">
                {selectedPopup.items.map((item) => (
                  <li
                    key={item.text}
                    className={item.core ? "core-item" : undefined}
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
