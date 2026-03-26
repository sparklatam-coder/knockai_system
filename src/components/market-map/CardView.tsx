"use client";

import { useMemo } from "react";
import { REGIONS } from "@/data/regions";
import type { Territory } from "@/hooks/use-territories";
import { CityCard } from "./CityCard";

interface CardViewProps {
  selectedSido: string;
  selectedCity: string | null;
  onCitySelect: (city: string) => void;
  territories: Territory[];
  specialtyFilter: string | null;
}

export function CardView({
  selectedSido,
  selectedCity,
  onCitySelect,
  territories,
  specialtyFilter,
}: CardViewProps) {
  const region = REGIONS.find((r) => r.label === selectedSido);

  const filteredTerritories = useMemo(() => {
    let filtered = territories.filter((t) => t.sido === selectedSido);
    if (specialtyFilter) {
      filtered = filtered.filter((t) => t.specialty === specialtyFilter);
    }
    return filtered;
  }, [territories, selectedSido, specialtyFilter]);

  if (!region) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {region.cities.map((city) => {
        const cityTerritories = filteredTerritories.filter(
          (t) => t.sigungu === city
        );
        return (
          <CityCard
            key={city}
            city={city}
            territories={cityTerritories}
            isSelected={selectedCity === city}
            onClick={() => onCitySelect(city)}
          />
        );
      })}
    </div>
  );
}
