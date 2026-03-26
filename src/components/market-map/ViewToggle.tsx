"use client";

import { LayoutGrid, Map } from "lucide-react";

type ViewMode = "card" | "map";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const base =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer";
  const active = "bg-[var(--knock-primary)] text-white shadow-sm";
  const inactive =
    "text-[var(--knock-text-muted)] hover:text-[var(--knock-text)] hover:bg-[var(--knock-primary-dim)]";

  return (
    <div className="inline-flex gap-1 p-1 bg-[var(--knock-bg-elevated)] border border-[var(--knock-border)] rounded-xl">
      <button
        type="button"
        className={`${base} ${view === "card" ? active : inactive}`}
        onClick={() => onChange("card")}
      >
        <LayoutGrid size={15} />
        카드
      </button>
      <button
        type="button"
        className={`${base} ${view === "map" ? active : inactive}`}
        onClick={() => onChange("map")}
      >
        <Map size={15} />
        지도
      </button>
    </div>
  );
}
