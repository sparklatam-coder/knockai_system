"use client";

import { CheckCircle2, Radio, Globe } from "lucide-react";

interface StatsBarProps {
  secured: number;
  recruiting: number;
  total: number;
}

export function StatsBar({ secured, recruiting, total }: StatsBarProps) {
  return (
    <div className="flex items-center gap-6 flex-wrap text-sm font-semibold">
      <div className="flex items-center gap-1.5 text-[var(--knock-success)]">
        <CheckCircle2 size={15} />
        <span>확보 {secured}곳</span>
      </div>
      <div className="flex items-center gap-1.5 text-[var(--knock-primary)]">
        <Radio size={15} />
        <span>모집 중 {recruiting}곳</span>
      </div>
      <div className="flex items-center gap-1.5 text-[var(--knock-text-muted)]">
        <Globe size={15} />
        <span>전체 {total}슬롯</span>
      </div>
    </div>
  );
}
