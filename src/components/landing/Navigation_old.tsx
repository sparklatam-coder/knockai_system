"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const serviceItems = [
  { emoji: "\uD83D\uDCCD", label: "네이버 플레이스", desc: "상위노출 전문", href: "/place" },
  { emoji: "\uD83C\uDFAC", label: "유튜브", desc: "채널 성장 전문", href: "/youtube" },
];

export const Navigation = () => {
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

  const handleServiceEnter = () => {
    if (serviceTimeout.current) clearTimeout(serviceTimeout.current);
    setServiceOpen(true);
  };

  const handleServiceLeave = () => {
    serviceTimeout.current = setTimeout(() => setServiceOpen(false), 150);
  };

  const isServiceActive = pathname === "/place" || pathname === "/youtube";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "var(--knock-bg-overlay)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--knock-border)",
      }}
    >
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/landing/knock-logo.png" alt="KNOCK 병원 마케팅" className="h-14 w-auto" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {/* 홈 */}
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-[var(--knock-primary)] ${
              pathname === "/" ? "text-[var(--knock-primary)]" : "text-[var(--knock-text-muted)]"
            }`}
          >
            홈
          </Link>

          {/* 서비스 드롭다운 */}
          <div
            ref={serviceRef}
            className="relative"
            onMouseEnter={handleServiceEnter}
            onMouseLeave={handleServiceLeave}
          >
            <button
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-[var(--knock-primary)] ${
                isServiceActive ? "text-[var(--knock-primary)]" : "text-[var(--knock-text-muted)]"
              }`}
            >
              서비스
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${serviceOpen ? "rotate-180" : ""}`} />
            </button>

            {serviceOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 py-2"
                style={{
                  background: "var(--knock-bg-card)",
                  border: "1px solid var(--knock-border)",
                  borderRadius: "var(--knock-radius-md)",
                }}
              >
                {serviceItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{item.label}</div>
                      <div className="text-xs text-[var(--knock-text-muted)]">{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 레퍼런스 */}
          <Link
            href="/references"
            className={`text-sm font-medium transition-colors hover:text-[var(--knock-primary)] ${
              pathname === "/references" ? "text-[var(--knock-primary)]" : "text-[var(--knock-text-muted)]"
            }`}
          >
            레퍼런스
          </Link>

          {/* 플라이휠 시스템 */}
          <Link
            href="/system"
            className={`text-sm font-medium transition-colors hover:text-[var(--knock-primary)] ${
              pathname === "/system" ? "text-[var(--knock-primary)]" : "text-[var(--knock-text-muted)]"
            }`}
          >
            노크 시스템
          </Link>

          {/* 고객 로그인 */}
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--knock-text-muted)] hover:text-white transition-colors"
          >
            고객 로그인
          </Link>

          {/* 무료 상담 */}
          <Button
            className="font-semibold rounded-xl glow-button text-white"
            style={{ background: "var(--knock-primary)" }}
            asChild
          >
            <a href="https://tally.so/r/q45d67" target="_blank" rel="noopener noreferrer">
              무료 상담
            </a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            background: "var(--knock-bg-overlay-dense)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--knock-border)",
          }}
        >
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`text-base font-medium py-3 ${pathname === "/" ? "text-[var(--knock-primary)]" : "text-[var(--knock-text-muted)]"}`}
            >
              홈
            </Link>

            {/* 서비스 섹션 */}
            <div className="py-2">
              <div className="text-xs font-semibold text-[var(--knock-text-muted)]/60 uppercase tracking-wider mb-2 px-0">서비스</div>
              {serviceItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 py-3 pl-2 ${
                    pathname === item.href ? "text-[var(--knock-primary)]" : "text-[var(--knock-text-muted)]"
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div>
                    <span className="text-base font-medium">{item.label}</span>
                    <span className="text-xs text-[var(--knock-text-muted)]/60 ml-2">{item.desc}</span>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/references"
              onClick={() => setMobileOpen(false)}
              className={`text-base font-medium py-3 ${pathname === "/references" ? "text-[var(--knock-primary)]" : "text-[var(--knock-text-muted)]"}`}
            >
              레퍼런스
            </Link>

            <Link
              href="/system"
              onClick={() => setMobileOpen(false)}
              className={`text-base font-medium py-3 ${pathname === "/system" ? "text-[var(--knock-primary)]" : "text-[var(--knock-text-muted)]"}`}
            >
              노크 시스템
            </Link>

            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium py-3 text-[var(--knock-text-muted)]"
            >
              고객 로그인
            </Link>

            <Button
              className="font-semibold rounded-xl w-full mt-2 text-white"
              style={{ background: "var(--knock-primary)" }}
              asChild
            >
              <a href="https://tally.so/r/q45d67" target="_blank" rel="noopener noreferrer">
                무료 상담
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
