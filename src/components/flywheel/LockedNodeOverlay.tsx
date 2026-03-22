"use client";

import { PACKAGE_INFO, getMinimumPackageForNode } from "@/lib/constants";
import type { PackageTier } from "@/lib/types";

interface LockedNodeOverlayProps {
  nodeKey: string;
  currentTier: PackageTier;
  onUpgradeClick: () => void;
}

export function LockedNodeOverlay({
  nodeKey,
  currentTier,
  onUpgradeClick,
}: LockedNodeOverlayProps) {
  const minTier = getMinimumPackageForNode(nodeKey);
  const minInfo = PACKAGE_INFO[minTier];
  const currentInfo = PACKAGE_INFO[currentTier];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: "inherit",
        background: "rgba(8,16,24,0.7)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        cursor: "pointer",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onUpgradeClick();
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1 }}>🔒</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          lineHeight: 1.5,
          padding: "0 8px",
        }}
      >
        <span style={{ color: minInfo.color, fontWeight: 800 }}>
          {minInfo.label}
        </span>{" "}
        이상
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onUpgradeClick();
        }}
        style={{
          marginTop: 2,
          padding: "4px 12px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.8)",
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        업그레이드 문의
      </button>
    </div>
  );
}
