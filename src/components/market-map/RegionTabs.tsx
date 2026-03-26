"use client";

import { REGIONS, SIDO_SHORT } from "@/data/regions";

interface RegionTabsProps {
  selected: string;
  onChange: (sido: string) => void;
  /** Count of non-available territories per sido */
  counts: Record<string, number>;
}

export function RegionTabs({ selected, onChange, counts }: RegionTabsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {REGIONS.map((r) => {
        const isActive = selected === r.label;
        const count = counts[r.label] ?? 0;
        return (
          <button
            key={r.label}
            type="button"
            className={`
              relative flex items-center gap-1 px-3.5 py-2 text-sm font-semibold rounded-xl
              transition-all whitespace-nowrap cursor-pointer
              ${
                isActive
                  ? "bg-[var(--knock-primary)] text-white shadow-sm"
                  : "bg-white text-[var(--knock-text-muted)] border border-[var(--knock-border)] hover:border-[var(--knock-primary)] hover:text-[var(--knock-primary)]"
              }
            `}
            onClick={() => onChange(r.label)}
          >
            {SIDO_SHORT[r.label] ?? r.label}
            {count > 0 && (
              <span
                className={`
                  text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none
                  ${isActive ? "bg-white/25 text-white" : "bg-[var(--knock-primary-dim)] text-[var(--knock-primary)]"}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
