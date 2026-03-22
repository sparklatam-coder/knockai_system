import type { NodeKey, NodeMeta } from "@/lib/types";

export const NODE_META: Record<NodeKey, NodeMeta> = {
  awareness: {
    label: "인지 확대",
    emoji: "🔍",
    description: "네이버 플레이스 · 블로그 · 광고 · SNS",
    group: "pipeline",
    order: 1,
  },
  lead_capture: {
    label: "리드 획득",
    emoji: "📋",
    description: "전화 · 카카오톡 · 네이버 예약 · 홈페이지 폼",
    group: "pipeline",
    order: 2,
  },
  lead_nurture: {
    label: "리드 육성",
    emoji: "💬",
    description: "팔로업 · 설득 · 유망 리드 확인",
    group: "pipeline",
    order: 3,
  },
  new_patient: {
    label: "신환 획득",
    emoji: "🏥",
    description: "내원 → 상담 → 치료 결정",
    group: "pipeline",
    order: 4,
  },
  cs_onboarding: {
    label: "온보딩",
    emoji: "🎯",
    description: "첫 48시간 관리",
    group: "cs360",
    order: 5,
  },
  cs_upsell: {
    label: "업셀",
    emoji: "💎",
    description: "추가 진료 안내",
    group: "cs360",
    order: 6,
  },
  cs_support: {
    label: "고객 지원",
    emoji: "🤝",
    description: "사후 관리",
    group: "cs360",
    order: 7,
  },
  cs_education: {
    label: "건강 교육",
    emoji: "📚",
    description: "콘텐츠 제공",
    group: "cs360",
    order: 8,
  },
  cs_community: {
    label: "커뮤니티",
    emoji: "👥",
    description: "리뷰 · 소개",
    group: "cs360",
    order: 9,
  },
  cs_analytics: {
    label: "분석",
    emoji: "📊",
    description: "데이터 리포트",
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
    // 유망 리드 → 초진 이벤트
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
    price: "100만원/월",
    description: "플레이스 + 블로그/카페 확장 + SNS",
    guarantee: "3개월 내 5위 이내 개런티 (미달성 시 달성까지 무료 연장)",
    color: "#2196F3",
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
    "lead_capture",
    "cs_analytics",
  ],
  standard: [
    "awareness",
    "lead_capture",
    "lead_nurture",
    "cs_support",
    "cs_community",
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
