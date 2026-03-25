import type { NodeKey, NodeMeta } from "@/lib/types";

export const NODE_META: Record<NodeKey, NodeMeta> = {
  awareness: {
    label: "검색 노출",
    emoji: "🔍",
    description: "네이버 지도 · 블로그 · SNS",
    group: "pipeline",
    order: 1,
  },
  lead_capture: {
    label: "문의 유입",
    emoji: "📋",
    description: "전화 · 카톡 · 네이버 예약",
    group: "pipeline",
    order: 2,
  },
  lead_nurture: {
    label: "환자 설득",
    emoji: "💬",
    description: "안내 · 재연락",
    group: "pipeline",
    order: 3,
  },
  new_patient: {
    label: "신환 확보",
    emoji: "🏥",
    description: "내원 · 상담 · 치료결정",
    group: "pipeline",
    order: 4,
  },
  cs_onboarding: {
    label: "첫 방문 케어",
    emoji: "🎯",
    description: "첫 48시간",
    group: "cs360",
    order: 5,
  },
  cs_upsell: {
    label: "추가 진료",
    emoji: "💎",
    description: "필요한 진료 안내",
    group: "cs360",
    order: 6,
  },
  cs_support: {
    label: "사후 관리",
    emoji: "🤝",
    description: "불편사항 케어",
    group: "cs360",
    order: 7,
  },
  cs_education: {
    label: "건강 정보",
    emoji: "📚",
    description: "콘텐츠",
    group: "cs360",
    order: 8,
  },
  cs_community: {
    label: "리뷰·소개",
    emoji: "👥",
    description: "입소문",
    group: "cs360",
    order: 9,
  },
  cs_analytics: {
    label: "성과 분석",
    emoji: "📊",
    description: "리포트",
    group: "cs360",
    order: 10,
  },
};

export const ALL_NODE_KEYS = Object.keys(NODE_META) as NodeKey[];

export const DEFAULT_SUB_NODES: Record<NodeKey, string[]> = {
  awareness: [
    "네이버 플레이스 대표 키워드 설정",
    "블로그 포스팅 발행",
    "SNS 계정 연동",
    "네이버 광고 세팅",
  ],
  lead_capture: [
    "전화번호(스마트콜) 설정",
    "카카오톡 채널 연동",
    "네이버 예약 활성화",
    "홈페이지 폼 연동",
  ],
  lead_nurture: [
    "팔로업 프로세스 수립",
    "부재중 콜백 ARS 설정",
    "카카오 자동응답 설정",
    "예약 확정 + 리마인드 알림 설정",
    "초진 이벤트 기획 (첫 방문 할인/무료 검진)",
    "오시는 길 + 주차 안내 자동 문자 발송",
  ],
  new_patient: ["내원 동선 안내 설정", "상담 스크립트 제공", "치료 동의 프로세스 점검"],
  cs_onboarding: ["첫 방문 감사 문자", "치료 후 주의사항 발송", "다음 예약 안내"],
  cs_upsell: ["추가 진료 추천 시나리오", "패키지 상품 안내"],
  cs_support: ["치료 후 케어 문자", "정기 검진 리마인더"],
  cs_education: ["블로그 건강정보 발행", "카카오 채널 콘텐츠"],
  cs_community: ["리뷰 요청 자동화", "소개 이벤트 운영"],
  cs_analytics: ["월간 유입/전환 리포트", "키워드 순위 추적"],
};

/**
 * lead_nurture DB 노드를 관리자 화면에서 "환자 설득" / "방문 예정" 두 섹션으로 나눠 표시.
 * sort_order 기준: 0-2 → 환자 설득, 3-5 → 방문 예정
 */
export const LEAD_NURTURE_SPLIT = {
  persuade: {
    label: "환자 설득",
    emoji: "💬",
    description: "안내 · 재연락",
    sortRange: [0, 2] as const, // sort_order 0,1,2
  },
  qualified: {
    label: "방문 예정",
    emoji: "📅",
    description: "예약 확정 · 내원 준비",
    sortRange: [3, 5] as const, // sort_order 3,4,5
  },
} as const;

// ============================================
// 패키지 티어 시스템
// ============================================

import type { PackageTier } from "@/lib/types";

export const PACKAGE_INFO: Record<PackageTier, {
  label: string;
  price: string;
  description: string;
  guarantee: string;
  color: string;
  priceNote?: string;
}> = {
  entry: {
    label: "Entry",
    price: "50만원/월",
    description: "네이버 플레이스 순위 상승",
    guarantee: "순위 상승 보장 (5위 이내 미보장)",
    color: "#9E9E9E",
  },
  basic: {
    label: "Basic",
    price: "100~150만원/월",
    description: "네이버 플레이스 1~5위",
    guarantee: "3개월 내 5위 이내 개런티 (미달성 시 달성까지 무료 연장)",
    color: "#2196F3",
    priceNote: "키워드 유입량·경쟁 강도에 따라 변동될 수 있습니다.\n정확한 견적은 상담을 통해 안내드립니다.",
  },
  standard: {
    label: "Standard",
    price: "200만원/월",
    description: "Basic + 홈페이지 + 카카오톡 + 자동화 + 리뷰 관리",
    guarantee: "5위 개런티 유지",
    color: "#4CAF50",
  },
  premium: {
    label: "Premium",
    price: "300만원/월",
    description: "Standard + 광고집행 대행 + 카드뉴스 + 재유입/업셀 트래킹",
    guarantee: "",
    color: "#FF9800",
  },
  platinum: {
    label: "Platinum",
    price: "400만원+α",
    description: "Premium + 콜/채팅 응대 + 신환 유입 책임",
    guarantee: "신환 유입 성과 보장 (성과 기반 인센티브)",
    color: "#E94560",
  },
};

export const PACKAGE_NODE_ACCESS: Record<PackageTier, string[]> = {
  entry: [
    "awareness",
    "cs_analytics",
  ],
  basic: [
    "awareness",
    "cs_analytics",
  ],
  standard: [
    "awareness",
    "lead_capture",
    "lead_nurture",
    "new_patient",
    "cs_analytics",
  ],
  premium: [
    "awareness",
    "lead_capture",
    "lead_nurture",
    "new_patient",
    "cs_onboarding",
    "cs_upsell",
    "cs_support",
    "cs_education",
    "cs_community",
    "cs_analytics",
  ],
  platinum: ALL_NODE_KEYS as string[],
};

export function isNodeLocked(nodeKey: string, packageTier: PackageTier): boolean {
  return !PACKAGE_NODE_ACCESS[packageTier].includes(nodeKey);
}

export function getMinimumPackageForNode(nodeKey: string): PackageTier {
  const tiers: PackageTier[] = ["entry", "basic", "standard", "premium", "platinum"];
  for (const tier of tiers) {
    if (PACKAGE_NODE_ACCESS[tier].includes(nodeKey)) {
      return tier;
    }
  }
  return "platinum";
}
