"use client";

import { memo, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import type { Territory } from "@/hooks/use-territories";
import { SIDO_SHORT } from "@/data/regions";

const TOPO_URL = "/korea-topo.json";
const TOPO_OBJECT_KEY = "skorea_provinces_2018_geo";

/** TopoJSON 이름 → regions.ts 이름 매핑 (변경된 행정구역명) */
const TOPO_NAME_MAP: Record<string, string> = {
  "강원도": "강원특별자치도",
  "전라북도": "전북특별자치도",
};

/** regions.ts 이름 → TopoJSON 이름 (역방향) */
const REGION_TO_TOPO: Record<string, string> = {
  "강원특별자치도": "강원도",
  "전북특별자치도": "전라북도",
};

interface MapViewProps {
  territories: Territory[];
  selectedSido: string | null;
  onSidoSelect: (sido: string) => void;
  specialtyFilter: string | null;
}

function getRegionName(topoName: string): string {
  return TOPO_NAME_MAP[topoName] ?? topoName;
}

/** 시/도별 상태 요약 계산 */
function useSidoStatusMap(territories: Territory[], specialtyFilter: string | null) {
  return useMemo(() => {
    const map: Record<string, { secured: number; recruiting: number; total: number }> = {};
    const filtered = specialtyFilter
      ? territories.filter((t) => t.specialty === specialtyFilter)
      : territories;

    for (const t of filtered) {
      if (!map[t.sido]) map[t.sido] = { secured: 0, recruiting: 0, total: 0 };
      map[t.sido].total++;
      if (t.status === "secured") map[t.sido].secured++;
      if (t.status === "recruiting") map[t.sido].recruiting++;
    }
    return map;
  }, [territories, specialtyFilter]);
}

function getSidoColor(
  status: { secured: number; recruiting: number; total: number } | undefined,
  isSelected: boolean,
  isHovered: boolean,
): string {
  if (isSelected) return "#1e40af";
  if (!status || status.total === 0) {
    return isHovered ? "#e2e8f0" : "#f1f5f9";
  }
  if (status.secured > 0) {
    return isHovered ? "#059669" : "#a7f3d0";
  }
  if (status.recruiting > 0) {
    return isHovered ? "#1e40af" : "#bfdbfe";
  }
  return isHovered ? "#e2e8f0" : "#f1f5f9";
}

function MapViewInner({ territories, selectedSido, onSidoSelect, specialtyFilter }: MapViewProps) {
  const statusMap = useSidoStatusMap(territories, specialtyFilter);

  return (
    <div className="relative w-full max-w-[700px] mx-auto">
      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mb-4 text-[12px] font-semibold text-[var(--knock-text-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#a7f3d0" }} />
          확보됨
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#bfdbfe" }} />
          모집 중
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#f1f5f9" }} />
          비어있음
        </div>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 4800,
          center: [127.8, 36.0],
        }}
        width={600}
        height={700}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup>
          <Geographies geography={TOPO_URL} parseGeographies={(geos) => geos}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const topoName = geo.properties.name as string;
                const regionName = getRegionName(topoName);
                const status = statusMap[regionName];
                const isSelected = selectedSido === regionName;
                const shortName = SIDO_SHORT[regionName] ?? regionName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => onSidoSelect(regionName)}
                    style={{
                      default: {
                        fill: getSidoColor(status, isSelected, false),
                        stroke: "#cbd5e1",
                        strokeWidth: 0.8,
                        cursor: "pointer",
                        outline: "none",
                        transition: "fill 0.2s",
                      },
                      hover: {
                        fill: getSidoColor(status, isSelected, true),
                        stroke: "#94a3b8",
                        strokeWidth: 1.2,
                        cursor: "pointer",
                        outline: "none",
                      },
                      pressed: {
                        fill: "#1e40af",
                        stroke: "#1e3a8a",
                        strokeWidth: 1.5,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Overlay labels - positioned via CSS for key regions */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <SidoLabels statusMap={statusMap} selectedSido={selectedSido} />
      </div>
    </div>
  );
}

/** 시/도 이름 라벨 (지도 위 오버레이) */
function SidoLabels({
  statusMap,
  selectedSido,
}: {
  statusMap: Record<string, { secured: number; recruiting: number; total: number }>;
  selectedSido: string | null;
}) {
  const labels: { name: string; short: string; top: string; left: string }[] = [
    { name: "서울특별시", short: "서울", top: "28%", left: "32%" },
    { name: "경기도", short: "경기", top: "23%", left: "39%" },
    { name: "인천광역시", short: "인천", top: "30%", left: "24%" },
    { name: "강원특별자치도", short: "강원", top: "20%", left: "58%" },
    { name: "충청북도", short: "충북", top: "39%", left: "47%" },
    { name: "충청남도", short: "충남", top: "42%", left: "30%" },
    { name: "세종특별자치시", short: "세종", top: "38%", left: "37%" },
    { name: "대전광역시", short: "대전", top: "44%", left: "40%" },
    { name: "전북특별자치도", short: "전북", top: "54%", left: "33%" },
    { name: "전라남도", short: "전남", top: "68%", left: "30%" },
    { name: "광주광역시", short: "광주", top: "63%", left: "28%" },
    { name: "경상북도", short: "경북", top: "36%", left: "65%" },
    { name: "대구광역시", short: "대구", top: "47%", left: "63%" },
    { name: "경상남도", short: "경남", top: "58%", left: "58%" },
    { name: "부산광역시", short: "부산", top: "58%", left: "70%" },
    { name: "울산광역시", short: "울산", top: "51%", left: "72%" },
    { name: "제주특별자치도", short: "제주", top: "88%", left: "28%" },
  ];

  return (
    <>
      {labels.map((l) => {
        const s = statusMap[l.name];
        const isSelected = selectedSido === l.name;
        const count = s ? s.secured + s.recruiting : 0;
        return (
          <div
            key={l.name}
            className="absolute flex flex-col items-center"
            style={{ top: l.top, left: l.left, transform: "translate(-50%, -50%)" }}
          >
            <span
              className={`text-[11px] font-bold leading-none ${
                isSelected ? "text-white" : "text-[var(--knock-text)]"
              }`}
            >
              {l.short}
            </span>
            {count > 0 && (
              <span className="text-[9px] font-bold text-[var(--knock-primary)] bg-white/80 rounded-full px-1 mt-0.5">
                {count}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}

export const MapView = memo(MapViewInner);
