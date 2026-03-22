"use client";

import { PACKAGE_INFO } from "@/lib/constants";
import type { PackageTier } from "@/lib/types";

interface PackageBadgeProps {
  tier: PackageTier;
  size?: "sm" | "md";
}

export function PackageBadge({ tier, size = "sm" }: PackageBadgeProps) {
  const info = PACKAGE_INFO[tier];
  const isSm = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSm ? 4 : 6,
        padding: isSm ? "3px 10px" : "5px 14px",
        borderRadius: 100,
        fontSize: isSm ? 11 : 13,
        fontWeight: 800,
        letterSpacing: "0.3px",
        background: `${info.color}1a`,
        color: info.color,
        border: `1px solid ${info.color}33`,
        whiteSpace: "nowrap",
      }}
    >
      {info.label}
    </span>
  );
}
