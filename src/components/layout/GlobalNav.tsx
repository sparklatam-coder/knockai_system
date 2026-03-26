"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

/* ── service dropdown items ── */
const serviceItems = [
  { emoji: "\uD83D\uDCCD", label: "네이버 플레이스", desc: "상위노출 전문", href: "/place" },
  { emoji: "\uD83C\uDFAC", label: "유튜브", desc: "채널 성장 전문", href: "/youtube" },
  { emoji: "\uD83C\uDFE0", label: "홈페이지 제작", desc: "자동화시스템", href: "/homepage" },
];

/* ── nav link items ── */
const navLinks = [
  { label: "홈", href: "/" },
  { label: "레퍼런스", href: "/references" },
  { label: "노크 시스템", href: "/system" },
];

/* ── KNOCK logo (O = doorknob) ── */
function KnockLogo() {
  return (
    <Link href="/" className="flex items-center" aria-label="KNOCK 홈">
      <span
        style={{
          fontFamily: "'Outfit', var(--font-outfit), sans-serif",
          fontWeight: 900,
          fontSize: 18,
          display: "inline-flex",
          alignItems: "center",
          letterSpacing: "0.04em",
          color: "#0f172a",
        }}
      >
        KN
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "0.95em",
            height: "0.95em",
            border: "2px solid var(--knock-primary)",
            borderRadius: "50%",
            position: "relative",
            margin: "0 0.5px",
          }}
        >
          <span
            style={{
              width: "0.28em",
              height: "0.28em",
              background: "var(--knock-primary)",
              borderRadius: "50%",
            }}
          />
        </span>
        CK
      </span>
    </Link>
  );
}

export function GlobalNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const serviceRef = useRef<HTMLDivElement>(null);
  const serviceTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    return () => {
      if (serviceTimeout.current) clearTimeout(serviceTimeout.current);
    };
  }, []);

  /* close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleServiceEnter = () => {
    if (serviceTimeout.current) clearTimeout(serviceTimeout.current);
    setServiceOpen(true);
  };

  const handleServiceLeave = () => {
    serviceTimeout.current = setTimeout(() => setServiceOpen(false), 150);
  };

  const isServiceActive = pathname === "/place" || pathname === "/youtube" || pathname === "/homepage";

  const linkStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "var(--knock-font-body)",
    fontSize: 14,
    fontWeight: 600,
    color: active ? "var(--knock-primary)" : "var(--knock-text-muted)",
    textDecoration: "none",
    transition: "color 0.2s",
  });

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 56,
        display: "flex",
        alignItems: "center",
        background: "var(--knock-bg-overlay)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--knock-border)",
        padding: "0 24px",
      }}
    >
      <nav
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* ── Left: Logo ── */}
        <KnockLogo />

        {/* ── Center: Desktop nav links ── */}
        <div
          className="hidden md:flex"
          style={{ alignItems: "center", gap: 32 }}
        >
          {/* 홈 */}
          <Link
            href="/"
            style={linkStyle(pathname === "/")}
            onMouseEnter={(e) => {
              if (pathname !== "/") e.currentTarget.style.color = "var(--knock-text-bright)";
            }}
            onMouseLeave={(e) => {
              if (pathname !== "/") e.currentTarget.style.color = "var(--knock-text-muted)";
            }}
          >
            홈
          </Link>

          {/* 서비스 드롭다운 */}
          <div
            ref={serviceRef}
            style={{ position: "relative" }}
            onMouseEnter={handleServiceEnter}
            onMouseLeave={handleServiceLeave}
          >
            <button
              type="button"
              style={{
                ...linkStyle(isServiceActive),
                display: "flex",
                alignItems: "center",
                gap: 3,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                if (!isServiceActive) e.currentTarget.style.color = "var(--knock-text-bright)";
              }}
              onMouseLeave={(e) => {
                if (!isServiceActive) e.currentTarget.style.color = "var(--knock-text-muted)";
              }}
            >
              서비스
              <ChevronDown
                style={{
                  width: 14,
                  height: 14,
                  transition: "transform 0.2s",
                  transform: serviceOpen ? "rotate(180deg)" : "rotate(0)",
                }}
              />
            </button>

            {serviceOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 240,
                  background: "#ffffff",
                  border: "1px solid var(--knock-border)",
                  borderRadius: "var(--knock-radius-md)",
                  padding: "12px 16px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                }}
              >
                {serviceItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: "var(--knock-radius-sm)",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{item.emoji}</span>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--knock-text-bright)",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--knock-text-muted)",
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 레퍼런스, 노크 시스템 */}
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={linkStyle(pathname === link.href)}
              onMouseEnter={(e) => {
                if (pathname !== link.href) e.currentTarget.style.color = "var(--knock-text-bright)";
              }}
              onMouseLeave={(e) => {
                if (pathname !== link.href) e.currentTarget.style.color = "var(--knock-text-muted)";
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Right: Login + CTA (desktop) ── */}
        <div
          className="hidden md:flex"
          style={{ alignItems: "center", gap: 16 }}
        >
          <Link
            href="/login"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--knock-text-muted)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--knock-text-bright)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--knock-text-muted)";
            }}
          >
            고객 로그인
          </Link>
          <a
            href="https://open.kakao.com/o/saS7qini"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "var(--knock-primary)",
              color: "#fff",
              padding: "10px 24px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(30, 64, 175, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--knock-primary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--knock-primary)";
            }}
          >
            무료 상담
          </a>
        </div>

        {/* ── Mobile: Hamburger toggle ── */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#0f172a",
            padding: 4,
          }}
          aria-label="메뉴 열기"
        >
          {mobileOpen ? <X style={{ width: 24, height: 24 }} /> : <Menu style={{ width: 24, height: 24 }} />}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#ffffff",
            zIndex: 49,
            overflowY: "auto",
            padding: "24px 24px 40px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 홈 */}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            style={{
              ...linkStyle(pathname === "/"),
              fontSize: 16,
              padding: "14px 0",
              display: "block",
            }}
          >
            홈
          </Link>

          {/* 서비스 섹션 */}
          <div style={{ padding: "8px 0 4px" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--knock-text-muted)",
                opacity: 0.6,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              서비스
            </div>
            {serviceItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 8px",
                  textDecoration: "none",
                  color: pathname === item.href ? "var(--knock-primary)" : "var(--knock-text-muted)",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: 18 }}>{item.emoji}</span>
                <span>{item.label}</span>
                <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 4 }}>{item.desc}</span>
              </Link>
            ))}
          </div>

          {/* 나머지 링크 */}
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                ...linkStyle(pathname === link.href),
                fontSize: 16,
                padding: "14px 0",
                display: "block",
              }}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--knock-text-muted)",
              padding: "14px 0",
              display: "block",
              textDecoration: "none",
            }}
          >
            고객 로그인
          </Link>

          {/* 무료 상담 버튼 (full width) */}
          <a
            href="https://open.kakao.com/o/saS7qini"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 16,
              display: "block",
              textAlign: "center",
              background: "var(--knock-primary)",
              color: "#fff",
              padding: "14px 24px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              width: "100%",
            }}
          >
            무료 상담
          </a>
        </div>
      )}
    </header>
  );
}
