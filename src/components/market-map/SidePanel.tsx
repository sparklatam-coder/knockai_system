"use client";

import { X, ExternalLink, CheckCircle2, Radio, Circle } from "lucide-react";
import type { Territory } from "@/hooks/use-territories";
import { SPECIALTIES } from "@/data/specialties";

interface SidePanelProps {
  sido: string;
  city: string;
  territories: Territory[];
  onClose: () => void;
}

const CTA_URL = "https://tally.so/r/q45d67";

export function SidePanel({ sido, city, territories, onClose }: SidePanelProps) {
  return (
    <div className="bg-white border-l border-[var(--knock-border)] w-full md:w-[380px] h-full overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-5 py-4 border-b border-[var(--knock-border)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[var(--knock-text-muted)] uppercase tracking-wider">
              {sido}
            </div>
            <h2 className="text-lg font-bold text-[var(--knock-text)]">{city}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--knock-bg-elevated)] transition-colors cursor-pointer"
          >
            <X size={18} className="text-[var(--knock-text-muted)]" />
          </button>
        </div>
      </div>

      {/* Specialty slots */}
      <div className="p-5 space-y-3">
        {SPECIALTIES.map((spec) => {
          const t = territories.find((t) => t.specialty === spec.label);
          const status = t?.status ?? "available";

          return (
            <div
              key={spec.key}
              className={`
                p-4 rounded-xl border transition-all
                ${status === "secured" ? "bg-emerald-50/50 border-emerald-200" : ""}
                ${status === "recruiting" ? "bg-blue-50/50 border-blue-200" : ""}
                ${status === "available" ? "bg-[var(--knock-bg-elevated)] border-[var(--knock-border)]" : ""}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: status === "secured" ? "#059669" : status === "recruiting" ? "#1e40af" : "#cbd5e1" }}
                  />
                  <span className="text-sm font-bold" style={{ color: spec.color }}>
                    {spec.label}
                  </span>
                </div>
                {status === "secured" && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--knock-success)]">
                    <CheckCircle2 size={13} /> 확보
                  </span>
                )}
                {status === "recruiting" && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--knock-primary)]">
                    <Radio size={13} /> 모집 중
                  </span>
                )}
                {status === "available" && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--knock-text-dim)]">
                    <Circle size={13} /> 비어있음
                  </span>
                )}
              </div>

              {status === "secured" && t && (
                <div className="mt-2 space-y-1">
                  <div className="text-sm font-semibold text-[var(--knock-text)]">
                    {t.client_name}
                  </div>
                  {t.keyword && (
                    <div className="text-[12px] text-[var(--knock-text-muted)]">
                      키워드: {t.keyword}
                      {t.current_rank && (
                        <span className="ml-1.5 text-[var(--knock-success)] font-bold">
                          {t.current_rank}위
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {status === "recruiting" && (
                <a
                  href={CTA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold
                    text-[var(--knock-primary)] hover:underline
                  "
                >
                  이 지역에서 1위 만들기
                  <ExternalLink size={11} />
                </a>
              )}

              {status === "available" && (
                <a
                  href={CTA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold
                    text-[var(--knock-text-muted)] hover:text-[var(--knock-primary)]
                  "
                >
                  선점하기
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="p-5 border-t border-[var(--knock-border)]">
        <a
          href={CTA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            block w-full text-center py-3.5 rounded-xl font-bold text-white text-sm
            bg-[var(--knock-primary)] hover:bg-[var(--knock-primary-hover)]
            shadow-[var(--knock-glow-primary)] transition-all
          "
        >
          이 지역에서 1위 만들기
        </a>
      </div>
    </div>
  );
}
