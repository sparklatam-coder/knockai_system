"use client";

import { useState, useMemo } from "react";
import { MapPin, TrendingUp } from "lucide-react";
import { useTerritories } from "@/hooks/use-territories";
import { REGIONS, SIDO_SHORT } from "@/data/regions";
import { ViewToggle } from "./ViewToggle";
import { SpecialtyFilter } from "./SpecialtyFilter";
import { RegionTabs } from "./RegionTabs";
import { CardView } from "./CardView";
import { MapView } from "./MapView";
import { SidePanel } from "./SidePanel";
import { StatsBar } from "./StatsBar";

const CTA_URL = "https://tally.so/r/q45d67";

export function MarketMapPage() {
  const { territories, loading, stats } = useTerritories();

  const [view, setView] = useState<"card" | "map">("card");
  const [selectedSido, setSelectedSido] = useState(REGIONS[0].label);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null);

  /** Count of non-available territories per sido (for tab badges) */
  const sidoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of territories) {
      if (t.status !== "available") {
        counts[t.sido] = (counts[t.sido] ?? 0) + 1;
      }
    }
    return counts;
  }, [territories]);

  /** Territories for the selected city (for side panel) */
  const cityTerritories = useMemo(() => {
    if (!selectedCity) return [];
    return territories.filter(
      (t) => t.sido === selectedSido && t.sigungu === selectedCity
    );
  }, [territories, selectedSido, selectedCity]);

  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido);
    setSelectedCity(null);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[var(--knock-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--knock-text-muted)]">마켓맵을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--knock-bg)]">
      {/* Hero */}
      <section className="pt-12 pb-8 px-5 text-center">
        <div className="max-w-[800px] mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--knock-primary-dim)] border border-[var(--knock-border-accent)] rounded-full text-[12px] font-bold text-[var(--knock-primary)] mb-5">
            <MapPin size={13} />
            전국 병의원 네이버 플레이스 1위 독점 현황
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--knock-text-bright)] leading-tight mb-4">
            우리 지역 <span className="text-[var(--knock-primary)]">1위</span>,{" "}
            <br className="md:hidden" />
            아직 비어있습니다
          </h1>
          <p className="text-base text-[var(--knock-text-muted)] leading-relaxed max-w-[560px] mx-auto">
            전국 시/군/구별 업종 독점 현황을 확인하세요.
            <br />
            <strong className="text-[var(--knock-text)] font-semibold">선점한 병원만이 지역 1위</strong>를 보장받습니다.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-[1200px] mx-auto px-5 pb-16">
        {/* Controls row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <ViewToggle view={view} onChange={setView} />
          <StatsBar {...stats} />
        </div>

        {/* Specialty filter */}
        <div className="mb-5">
          <SpecialtyFilter selected={specialtyFilter} onChange={setSpecialtyFilter} />
        </div>

        {/* Region tabs (card view only) */}
        {view === "card" && (
          <div className="mb-6">
            <RegionTabs
              selected={selectedSido}
              onChange={handleSidoChange}
              counts={sidoCounts}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex gap-0 relative">
          <div className={`flex-1 min-w-0 ${selectedCity ? "pr-0 md:pr-5" : ""}`}>
            {view === "card" && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-bold text-[var(--knock-text)]">
                    {SIDO_SHORT[selectedSido] ?? selectedSido}
                  </h2>
                  <span className="text-[13px] text-[var(--knock-text-muted)]">
                    {REGIONS.find((r) => r.label === selectedSido)?.cities.length ?? 0}개 시/군/구
                  </span>
                </div>
                <CardView
                  selectedSido={selectedSido}
                  selectedCity={selectedCity}
                  onCitySelect={setSelectedCity}
                  territories={territories}
                  specialtyFilter={specialtyFilter}
                />
              </>
            )}

            {view === "map" && (
              <div className="flex flex-col lg:flex-row gap-6">
                <MapView
                  territories={territories}
                  selectedSido={selectedSido}
                  onSidoSelect={(sido) => {
                    handleSidoChange(sido);
                    setSelectedCity(null);
                  }}
                  specialtyFilter={specialtyFilter}
                />
                {/* Map view: city list for selected sido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-[var(--knock-text)]">
                      {SIDO_SHORT[selectedSido] ?? selectedSido}
                    </h2>
                    <span className="text-[13px] text-[var(--knock-text-muted)]">
                      {REGIONS.find((r) => r.label === selectedSido)?.cities.length ?? 0}개 시/군/구
                    </span>
                  </div>
                  <CardView
                    selectedSido={selectedSido}
                    selectedCity={selectedCity}
                    onCitySelect={setSelectedCity}
                    territories={territories}
                    specialtyFilter={specialtyFilter}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Side panel (desktop: right fixed, mobile: bottom sheet) */}
          {selectedCity && (
            <>
              <div className="fixed inset-0 z-40 md:hidden bg-black/20" onClick={() => setSelectedCity(null)} />
              <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden max-h-[75vh] rounded-t-2xl overflow-hidden shadow-2xl">
                <SidePanel
                  sido={selectedSido}
                  city={selectedCity}
                  territories={cityTerritories}
                  onClose={() => setSelectedCity(null)}
                />
              </div>
              <div className="hidden md:block sticky top-[72px] h-[calc(100vh-88px)] rounded-2xl overflow-hidden border border-[var(--knock-border)] shadow-lg">
                <SidePanel
                  sido={selectedSido}
                  city={selectedCity}
                  territories={cityTerritories}
                  onClose={() => setSelectedCity(null)}
                />
              </div>
            </>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-8 bg-white rounded-2xl border border-[var(--knock-border)] shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp size={20} className="text-[var(--knock-primary)]" />
            <h3 className="text-xl font-black text-[var(--knock-text)]">
              우리 지역, 지금 선점하세요
            </h3>
          </div>
          <p className="text-sm text-[var(--knock-text-muted)] mb-6 max-w-[480px] mx-auto leading-relaxed">
            업종별 <strong className="text-[var(--knock-text)] font-semibold">1개 병원만</strong> 선점 가능합니다.
            먼저 신청한 병원이 해당 지역의 네이버 플레이스 1위를 독점합니다.
          </p>
          <a
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="knock-btn knock-btn-primary knock-btn-lg"
          >
            지금 무료 상담 신청하기
          </a>
        </div>
      </section>
    </div>
  );
}
