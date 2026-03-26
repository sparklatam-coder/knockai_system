"use client";

import type { Territory } from "@/hooks/use-territories";
import { SPECIALTIES } from "@/data/specialties";

interface CityCardProps {
  city: string;
  territories: Territory[];
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  secured: "#059669",
  recruiting: "#1e40af",
  available: "#cbd5e1",
};

export function CityCard({ city, territories, isSelected, onClick }: CityCardProps) {
  const securedCount = territories.filter((t) => t.status === "secured").length;
  const recruitingCount = territories.filter((t) => t.status === "recruiting").length;
  const hasActivity = securedCount > 0 || recruitingCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-2xl border transition-all cursor-pointer
        ${
          isSelected
            ? "bg-[var(--knock-primary-dim)] border-[var(--knock-primary)] shadow-md"
            : hasActivity
              ? "bg-white border-[var(--knock-border)] hover:border-[var(--knock-primary)] hover:shadow-md"
              : "bg-[var(--knock-bg-elevated)] border-[var(--knock-border)] hover:border-[var(--knock-border-accent)]"
        }
      `}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[15px] font-bold text-[var(--knock-text)]">{city}</span>
        {securedCount > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[var(--knock-success)]">
            {securedCount}개 확보
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SPECIALTIES.map((s) => {
          const t = territories.find((t) => t.specialty === s.label);
          const status = t?.status ?? "available";
          return (
            <span
              key={s.key}
              title={`${s.label}: ${status === "secured" ? "확보" : status === "recruiting" ? "모집 중" : "비어있음"}`}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: STATUS_COLORS[status] }}
            />
          );
        })}
      </div>
      {recruitingCount > 0 && (
        <div className="mt-2 text-[11px] text-[var(--knock-primary)] font-semibold">
          모집 중 {recruitingCount}개
        </div>
      )}
    </button>
  );
}
