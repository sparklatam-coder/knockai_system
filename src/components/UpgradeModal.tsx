"use client";

import { useState, useEffect, useCallback } from "react";
import { PACKAGE_INFO, PACKAGE_NODE_ACCESS, getMinimumPackageForNode } from "@/lib/constants";
import { NODE_META } from "@/lib/constants";
import type { PackageTier, NodeKey } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: PackageTier;
  nodeKey: NodeKey;
  clientId: string;
  clientName: string;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  nodeKey,
  clientId,
  clientName,
  contactName,
  contactPhone,
  contactEmail,
}: UpgradeModalProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleClose = useCallback(() => {
    setSent(false);
    setShowToast(false);
    onClose();
  }, [onClose]);

  // Auto-close 3s after sent
  useEffect(() => {
    if (sent) {
      setShowToast(true);
      const timer = setTimeout(() => handleClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [sent, handleClose]);

  if (!isOpen) return null;

  const targetTier = getMinimumPackageForNode(nodeKey);
  const currentInfo = PACKAGE_INFO[currentTier];
  const targetInfo = PACKAGE_INFO[targetTier];
  const meta = NODE_META[nodeKey];

  // 타겟 패키지에서 추가로 열리는 노드 목록
  const currentNodes = new Set(PACKAGE_NODE_ACCESS[currentTier]);
  const targetNodes = PACKAGE_NODE_ACCESS[targetTier];
  const newNodes = targetNodes.filter((k) => !currentNodes.has(k));

  const handleInquiry = async () => {
    setSending(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.from("inquiries").insert({
          client_id: clientId,
          inquiry_type: "upgrade",
          current_tier: currentTier,
          target_tier: targetTier,
          node_key: nodeKey,
          message: `${clientName}님이 ${meta.label} 기능 이용을 위해 ${currentInfo.label} → ${targetInfo.label} 업그레이드를 문의했습니다.`,
        });
      }
      setSent(true);
    } catch {
      // 저장 실패해도 모달은 유지
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="popup-overlay show"
      onClick={handleClose}
      aria-modal="true"
    >
      <div
        className="popup"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520, textAlign: "center" }}
      >
        <button
          className="popup-close"
          onClick={handleClose}
          type="button"
        >
          ✕
        </button>

        {/* Lock icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--overlay-3)",
            border: "1px solid var(--overlay-4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 32,
          }}
        >
          🔒
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>
          {meta.emoji} {meta.label}
        </h3>

        <p
          style={{
            fontSize: 15,
            color: "var(--tsub)",
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          이 기능은{" "}
          <strong style={{ color: targetInfo.color }}>
            {targetInfo.label}
          </strong>{" "}
          패키지 이상에서 이용 가능합니다.
          <br />
          업그레이드가 필요하시면 담당자에게 문의해 주세요.
        </p>

        {/* 현재 vs 타겟 비교 카드 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 12,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {/* Current */}
          <div
            style={{
              background: "var(--overlay-2)",
              border: `1px solid ${currentInfo.color}33`,
              borderRadius: 12,
              padding: "14px 12px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--tdim)",
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              현재 패키지
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: currentInfo.color,
                marginBottom: 4,
              }}
            >
              {currentInfo.label}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--tsub)" }}
            >
              {currentInfo.price}
            </div>
          </div>

          {/* Arrow */}
          <div style={{ fontSize: 20, color: "var(--tdim)" }}>→</div>

          {/* Target */}
          <div
            style={{
              background: `${targetInfo.color}0d`,
              border: `1px solid ${targetInfo.color}44`,
              borderRadius: 12,
              padding: "14px 12px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--tdim)",
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              필요 패키지
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: targetInfo.color,
                marginBottom: 4,
              }}
            >
              {targetInfo.label}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--tsub)" }}
            >
              {targetInfo.price}
            </div>
          </div>
        </div>

        {/* 추가 기능 목록 */}
        {newNodes.length > 0 && (
          <div
            style={{
              background: "var(--overlay-1)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 20,
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--tdim)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              추가되는 기능
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {newNodes.map((k) => {
                const nodeMeta = NODE_META[k as NodeKey];
                if (!nodeMeta) return null;
                return (
                  <span
                    key={k}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${targetInfo.color}14`,
                      color: targetInfo.color,
                      border: `1px solid ${targetInfo.color}22`,
                    }}
                  >
                    {nodeMeta.emoji} {nodeMeta.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 담당자 연락처 */}
        <div
          style={{
            background: "var(--overlay-2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            textAlign: "left",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--tdim)",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            담당자 연락처
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            <span style={{ fontSize: 16 }}>👤</span>
            <span style={{ color: "var(--text)", fontWeight: 600 }}>박성찬</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            <span style={{ fontSize: 16 }}>📞</span>
            <a href="tel:010-5565-0261" style={{ color: "var(--gP)", textDecoration: "none", fontWeight: 600 }}>
              010-5565-0261
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            <span style={{ fontSize: 16 }}>✉️</span>
            <a href="mailto:contact@knockai.com" style={{ color: "var(--gP)", textDecoration: "none", fontWeight: 600 }}>
              contact@knockai.com
            </a>
          </div>
        </div>

        {/* 버튼 */}
        {sent ? (
          <div
            style={{
              padding: "14px 0",
              borderRadius: 12,
              background: "var(--status-active-bg)",
              color: "var(--status-active)",
              fontSize: 15,
              fontWeight: 800,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>✓</span> 문의가 접수되었습니다
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--tdim)" }}>3초 후 자동으로 닫힙니다</span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleClose}
              type="button"
              aria-label="닫기"
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--tsub)",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              닫기
            </button>
            <button
              onClick={handleInquiry}
              disabled={sending}
              type="button"
              aria-label="업그레이드 문의"
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 12,
                border: "none",
                background: targetInfo.color,
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                cursor: sending ? "not-allowed" : "pointer",
                opacity: sending ? 0.6 : 1,
                transition: "opacity 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {sending && (
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
              )}
              {sending ? "전송 중..." : "업그레이드 문의"}
            </button>
          </div>
        )}

        {/* Toast notification */}
        {showToast && (
          <div style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 24px",
            borderRadius: 12,
            background: "var(--status-active)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            zIndex: 2000,
            animation: "popUp 0.3s cubic-bezier(0.22,1,0.36,1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            ✓ 업그레이드 문의가 접수되었습니다
          </div>
        )}
      </div>
    </div>
  );
}
