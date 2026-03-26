import type { Metadata } from "next";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { MarketMapPage } from "@/components/market-map/MarketMapPage";

export const metadata: Metadata = {
  title: "마켓맵 — 전국 병의원 네이버 1위 독점 현황 | KNOCK",
  description:
    "전국 시/군/구별 업종 독점 현황을 확인하세요. 선점한 병원만이 지역 네이버 플레이스 1위를 보장받습니다.",
};

export default function MapPage() {
  return (
    <>
      <GlobalNav />
      <MarketMapPage />
    </>
  );
}
