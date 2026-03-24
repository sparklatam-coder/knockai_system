"use client";

import { useEffect, useMemo, useState } from "react";
import { GlobalNav } from "@/components/layout/GlobalNav";
import {
  SharedKnockSystem,
  DEFAULT_PIPELINE_ROWS,
  DEFAULT_SEGMENTS,
} from "@/components/knock-system/SharedKnockSystem";

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
    title: "🔍 검색 노출",
    color: "var(--gW)",
    sub: '환자가 네이버 지도에서 우리 병원을 발견하게 만드는 단계입니다.<br><strong style="color:#FF8A50">환자 10명 중 7명이 네이버 지도에서 병원을 찾습니다.</strong>',
    items: [
      {
        text: '<strong class="ours">네이버 플레이스 순위 최적화</strong><span class="ours-tag">제공서비스</span> — 리뷰 관리, 저장수 확보, 사진/영상 최적화, 키워드 세팅. <strong style="color:#FF8A50">가장 중요하고, 가장 먼저 해야 하는 서비스입니다.</strong>',
        core: true,
      },
      {
        text: '<strong class="ours">네이버 플레이스 순위 분석/트래킹</strong><span class="ours-tag">제공서비스</span> — 키워드별 일간/주간 순위 변동 모니터링, 경쟁 병원 비교',
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
    title: "📋 문의 유입",
    color: "var(--gP)",
    sub: "우리 병원을 본 환자가 실제로 전화하거나 예약하게 만드는 단계",
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
    title: "💬 환자 설득",
    color: "var(--gPu)",
    sub: "전화는 했지만 아직 예약을 안 한 환자에게 다시 한번 안내하는 과정",
    items: [
      {
        text: '<strong class="ours">미예약자 팔로업 문자 시나리오</strong><span class="ours-tag">제공서비스</span> — 3일/7일/14일 자동 발송',
      },
      { text: '<strong>비용 고민 환자</strong> — 할부/보험 안내 재발송' },
      {
        text: '<strong class="ours">차별점 강조 콘텐츠 제작</strong><span class="ours-tag">제공서비스</span> — 왜 우리 병원인지 어필',
      },
      { text: '<strong>재활용 DB 관리</strong> — 이탈 환자도 채널에 모아두기' },
    ],
  },
  qualified: {
    title: "⭐ 방문 예정",
    color: "var(--gG)",
    sub: "방문 가능성이 높은 환자를 골라서 예약을 확정하는 단계",
    items: [
      { text: '<strong>예약 확정 + 리마인드</strong> — 자동 알림으로 노쇼 방지' },
      {
        text: '<strong class="ours">초진 이벤트 기획</strong><span class="ours-tag">제공서비스</span> — 첫 방문 할인/무료 검진',
      },
      { text: '<strong>오시는 길 문자</strong> — 주차, 위치 자동 발송' },
    ],
  },
  convert: {
    title: "🏥 신환 확보",
    color: "var(--gG)",
    sub: "환자가 병원에 와서 상담받고 치료를 결정하는 단계입니다",
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
    title: "🎯 첫 방문 케어",
    color: "var(--gP)",
    sub: '처음 온 환자가 "여기 좋다"고 느끼게 만드는 첫 48시간',
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
    title: "💎 추가 진료",
    color: "var(--gW)",
    sub: "환자에게 필요한 다른 진료를 자연스럽게 안내",
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
    title: "🤝 사후 관리",
    color: "var(--gG)",
    sub: "치료 끝난 뒤에도 안부를 묻고 불편한 점을 챙기기",
    items: [
      {
        text: '<strong class="ours">시술 후 팔로업 자동화</strong><span class="ours-tag">제공서비스</span> — 임플란트, 발치 후 1주일 안부',
      },
      { text: '<strong>투약 리마인드</strong> — 카톡 자동 발송' },
      { text: '<strong>불편사항 즉시 대응</strong> — 24시간 채팅 상담' },
    ],
  },
  education: {
    title: "📚 건강 정보",
    color: "var(--gC)",
    sub: '유용한 건강 정보를 보내서 "이 병원은 다르다"고 느끼게 하기',
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
    title: "👥 리뷰·소개",
    color: "var(--gPu)",
    sub: "만족한 환자가 직접 리뷰를 쓰고 주변에 소개하는 구조",
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
    title: "🎁 맞춤 패키지",
    color: "var(--gPk)",
    sub: "환자별로 딱 맞는 검진·관리 패키지를 만들어 재방문 유도",
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
    title: "📊 성과 분석",
    color: "var(--gP)",
    sub: "어디서 환자가 오는지, 뭐가 잘 되고 있는지 숫자로 확인",
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
        text: '<strong class="ours">경쟁 병원 모니터링</strong><span class="ours-tag">제공서비스</span> — 상위 20개 비교',
      },
    ],
  },
};


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
      <GlobalNav />

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
        <div className="hero-badge">노크가 일하는 방식</div>
        <h1>
          새 환자가 오고,{"\n"}
          <span className="ac">온 환자가 다시 오는 구조</span>
        </h1>
        <p>
          노크는 두 가지를 동시에 만듭니다.<br />
          왼쪽은 새 환자를 만드는 길,<br />
          오른쪽은 한번 온 환자를 평생 환자로 만드는 길.<br />
          이 두 바퀴가 맞물려 돌아갈 때, <strong>병원이 성장합니다.</strong>
        </p>
        <a
          href="/login"
          className="primary-button"
          style={{ marginTop: 24, gap: 8, padding: "12px 28px", textDecoration: "none", fontSize: 15 }}
        >
          🔐 내 병원 현황 보기
        </a>
      </div>

      <div className="container">
        <SharedKnockSystem
          mode="static"
          pipelineRows={DEFAULT_PIPELINE_ROWS}
          segments={DEFAULT_SEGMENTS}
          showCrmBanner
          onNodeClick={(key) => {
            const keyMap: Record<string, PopupKey> = {
              awareness: "awareness",
              lead_capture: "lead",
              lead_nurture: "nurture",
              qualified: "qualified",
              new_patient: "convert",
            };
            const popupKey = keyMap[key];
            if (popupKey) setActivePopup(popupKey);
          }}
          onSegmentClick={(id) => setActivePopup(id as PopupKey)}
        />

        <div className="bottom-cta">
          <h3>이 두 바퀴가 맞물리면, 경쟁 병원과 격차가 벌어집니다</h3>
          <p>
            왼쪽에서 <strong>새 환자</strong>를 만들고, 오른쪽에서 <strong>평생
            환자</strong>로 만듭니다.
            <br />
            이 구조가 한번 돌아가기 시작하면, 병원은 계속 성장합니다.
          </p>
          <div className="cyc-row">
            <span className="cyc-pill">검색 노출</span>
            <span className="cyc-a">→</span>
            <span className="cyc-pill">문의 유입</span>
            <span className="cyc-a">→</span>
            <span className="cyc-pill">설득+확정</span>
            <span className="cyc-a">→</span>
            <span className="cyc-pill cyc-success">신환 확보</span>
            <span className="cyc-a">→</span>
            <span className="cyc-pill cyc-loop">다시오게360 ↻</span>
          </div>
        </div>
      </div>

      <div className="footer">노크 병원 마케팅 시스템 · 새 환자 만들기 + 다시오게360</div>

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

      {/* Bottom CTA */}
      <div style={{
        textAlign: "center",
        padding: "60px 24px 80px",
        maxWidth: 600,
        margin: "0 auto",
      }}>
        <p style={{ color: "var(--knock-text)", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          이 시스템을 우리 병원에 적용하고 싶다면
        </p>
        <p style={{ color: "var(--knock-text-muted)", fontSize: 14, marginBottom: 24 }}>
          무료 상담을 통해 우리 병원에 맞는 맞춤 전략을 설계해드립니다.
        </p>
        <a
          href="https://tally.so/r/q45d67"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--knock-primary)",
            color: "var(--knock-text-bright)",
            fontWeight: 700,
            fontSize: 16,
            padding: "14px 32px",
            borderRadius: "var(--knock-radius-md)",
            textDecoration: "none",
            boxShadow: "var(--knock-glow-primary)",
          }}
        >
          무료 상담 시작하기 →
        </a>
      </div>
    </>
  );
}
