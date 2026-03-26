"use client";

import { SPECIALTIES } from "@/data/specialties";

interface SpecialtyFilterProps {
  selected: string | null;
  onChange: (key: string | null) => void;
}

export function SpecialtyFilter({ selected, onChange }: SpecialtyFilterProps) {
  const base =
    "px-3 py-1.5 text-[13px] font-semibold rounded-full border transition-all cursor-pointer whitespace-nowrap";

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        type="button"
        className={`${base} ${
          selected === null
            ? "bg-[var(--knock-primary)] text-white border-[var(--knock-primary)]"
            : "bg-white text-[var(--knock-text-muted)] border-[var(--knock-border)] hover:border-[var(--knock-primary)] hover:text-[var(--knock-primary)]"
        }`}
        onClick={() => onChange(null)}
      >
        전체
      </button>
      {SPECIALTIES.map((s) => (
        <button
          key={s.key}
          type="button"
          className={`${base} ${
            selected === s.label
              ? "text-white border-transparent"
              : "bg-white text-[var(--knock-text-muted)] border-[var(--knock-border)] hover:text-[var(--knock-text)]"
          }`}
          style={
            selected === s.label
              ? { background: s.color, borderColor: s.color }
              : undefined
          }
          onClick={() => onChange(selected === s.label ? null : s.label)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
