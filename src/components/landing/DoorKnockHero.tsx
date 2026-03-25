"use client";

import { useEffect, useRef, useState } from "react";

interface DoorKnockHeroProps {
  enableScrollOpen?: boolean;
  onProgress?: (progress: number) => void;
}

export function DoorKnockHero({ enableScrollOpen = false, onProgress }: DoorKnockHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [knockPhase, setKnockPhase] = useState(0);
  const progressRef = useRef(0);
  const [, forceRender] = useState(0);

  // ── Scroll-driven progress (over 2vh worth of scroll) ──
  useEffect(() => {
    if (!enableScrollOpen) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        // 145vh wrapper - 100vh visible = 45vh scroll room → progress 0-1
        const p = Math.min(1, Math.max(0, window.scrollY / (vh * 0.45)));
        progressRef.current = p;
        onProgress?.(p);
        forceRender((n) => n + 1);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [enableScrollOpen, onProgress]);

  const progress = enableScrollOpen ? progressRef.current : 0;

  // ── Animation phases (spread across 200vh of scroll) ──
  // Phase 1 (0–0.30): Door flies from right-center → bottom-center, scales up
  // Phase 2 (0.30–0.70): Door pauses in place and rotates open, light pours through
  // Phase 3 (0.70–1.0): Everything fades, page continues to next section
  const movePhase = Math.min(1, progress / 0.30);
  const moveEased = 1 - Math.pow(1 - movePhase, 3);
  const openPhase = Math.max(0, Math.min(1, (progress - 0.30) / 0.40));
  const openEased = 1 - Math.pow(1 - openPhase, 2);
  // No fade out — door stays open until sticky section scrolls away naturally
  const fadeOut = 0;

  // Door position: right-center → bottom-center
  const doorLeft = enableScrollOpen ? 85 - moveEased * 35 : 85;   // 85% → 50%
  const doorTop = enableScrollOpen ? 50 + moveEased * 38 : 50;    // 50% → 88%
  const doorScale = enableScrollOpen ? 1 + moveEased * 1.2 : 1;   // 1x → 2.2x
  const doorRotation = openEased * -75;
  const lightIntensity = Math.pow(openPhase, 0.5);
  const showKnock = progress < 0.03;
  const crackOpacity = Math.max(0, 1 - openPhase * 3);
  const overallOpacity = enableScrollOpen ? 1 - fadeOut : 1;

  // ── Knock animation ──
  useEffect(() => {
    if (enableScrollOpen && progress > 0.03) return;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      if (frame % 60 < 24 && frame % 8 === 0) {
        setKnockPhase((p) => p + 1);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [enableScrollOpen, progress > 0.03]);

  // ── Floating particles ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; hue: number;
    }
    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;
    const particles: Particle[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * w(), y: Math.random() * h(),
      vx: (Math.random() - 0.5) * 0.2, vy: -Math.random() * 0.3 - 0.1,
      size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.15 + 0.05,
      hue: Math.random() > 0.5 ? 224 : 210,
    }));
    const animate = () => {
      ctx.clearRect(0, 0, w(), h());
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.opacity += (Math.random() - 0.5) * 0.01;
        p.opacity = Math.max(0.03, Math.min(0.2, p.opacity));
        if (p.y < -10) { p.y = h() + 10; p.x = Math.random() * w(); }
        if (p.x < -10) p.x = w() + 10;
        if (p.x > w() + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, ${p.opacity})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: overallOpacity }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

      {/* Ambient gradient */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 60% 50% at 50% 40%, hsla(224, 76%, 40%, 0.04) 0%, transparent 70%),
          radial-gradient(ellipse 40% 60% at 30% 60%, hsla(210, 100%, 60%, 0.03) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 70% 30%, hsla(224, 76%, 50%, 0.02) 0%, transparent 70%)
        `,
      }} />

      {/* ── Light behind door ── */}
      {enableScrollOpen && openPhase > 0 && (
        <>
          {/* Core glow */}
          <div className="absolute hidden md:block" style={{
            left: `${doorLeft}%`, top: `${doorTop}%`,
            transform: `translate(-50%, -50%) scale(${doorScale})`,
            width: 220, height: 420, zIndex: 1, borderRadius: 20,
            opacity: lightIntensity,
            background: `radial-gradient(ellipse 90% 80% at 50% 50%,
              hsla(224, 85%, 68%, ${0.7 * lightIntensity}) 0%,
              hsla(210, 100%, 75%, ${0.4 * lightIntensity}) 35%,
              transparent 100%)`,
            filter: `blur(${10 + lightIntensity * 30}px)`,
          }} />
          {/* Wide ambient spread */}
          <div className="absolute hidden md:block" style={{
            left: `${doorLeft}%`, top: `${doorTop}%`,
            transform: `translate(-50%, -50%) scale(${doorScale * 1.5})`,
            width: 400, height: 600, zIndex: 0,
            opacity: lightIntensity * 0.5,
            background: `radial-gradient(ellipse at center,
              hsla(224, 70%, 65%, 0.3) 0%, transparent 70%)`,
            filter: `blur(${50 + lightIntensity * 40}px)`,
          }} />
        </>
      )}

      {/* ── Door ── */}
      <div
        className="absolute hidden md:flex items-center justify-center"
        style={{
          left: `${doorLeft}%`, top: `${doorTop}%`,
          transform: `translate(-50%, -50%) scale(${doorScale})`,
          width: 220, height: 420, zIndex: 2,
          perspective: enableScrollOpen ? 1000 : undefined,
          perspectiveOrigin: "left center",
          willChange: enableScrollOpen ? "transform" : undefined,
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          transformOrigin: "left center",
          transform: enableScrollOpen ? `rotateY(${doorRotation}deg)` : undefined,
          backfaceVisibility: "hidden",
        }}>
          {/* Door frame outer glow */}
          <div className="absolute inset-[-8px] rounded-[28px]" style={{
            background: "linear-gradient(180deg, hsla(224, 76%, 40%, 0.06), hsla(210, 100%, 60%, 0.03))",
            filter: "blur(20px)",
          }} />
          {/* Door frame */}
          <div className="absolute inset-0 rounded-[20px]" style={{
            border: "1px solid hsla(214, 32%, 91%, 1)",
            background: "linear-gradient(170deg, hsla(210, 40%, 98%, 1), hsla(210, 40%, 96%, 1))",
            boxShadow: "0 0 60px hsla(224, 76%, 40%, 0.04), 0 20px 60px hsla(0, 0%, 0%, 0.06)",
          }} />
          {/* Door panels */}
          <div className="absolute rounded-lg" style={{
            top: 30, left: 24, right: 24, height: 140,
            border: "1px solid hsla(214, 32%, 91%, 1)", background: "hsla(210, 40%, 97%, 1)", borderRadius: 12,
          }} />
          <div className="absolute rounded-lg" style={{
            top: 190, left: 24, right: 24, height: 180,
            border: "1px solid hsla(214, 32%, 91%, 1)", background: "hsla(210, 40%, 97%, 1)", borderRadius: 12,
          }} />
          {/* Door crack light */}
          <div className="absolute" style={{
            left: -2, top: "10%", width: 3, height: "80%",
            background: "linear-gradient(180deg, transparent, hsla(224, 76%, 40%, 0.2), hsla(224, 76%, 40%, 0.35), hsla(224, 76%, 40%, 0.2), transparent)",
            filter: "blur(2px)",
            animation: showKnock ? "door-light-pulse 3s ease-in-out infinite" : "none",
            opacity: crackOpacity,
          }} />
          <div className="absolute" style={{
            left: -12, top: "15%", width: 20, height: "70%",
            background: "linear-gradient(180deg, transparent, hsla(224, 76%, 40%, 0.04), hsla(224, 76%, 40%, 0.06), hsla(224, 76%, 40%, 0.04), transparent)",
            filter: "blur(8px)",
            animation: showKnock ? "door-light-pulse 3s ease-in-out infinite" : "none",
            opacity: crackOpacity,
          }} />
          {/* Knocking hand */}
          {showKnock && (
            <div className="absolute" style={{
              right: -38, top: "38%",
              transform: "translate(-50%, -50%) rotate(-15deg)",
              zIndex: 10,
              fontSize: 32,
              animation: "hand-knock 2.4s ease-in-out infinite",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.12))",
            }}>
              ✊
            </div>
          )}

          {/* Doorknob */}
          <div className="absolute" style={{ right: 28, top: "52%", transform: "translateY(-50%)", zIndex: 5 }}>
            {showKnock && [0, 1, 2].map((i) => (
              <div key={`${knockPhase}-${i}`} className="absolute rounded-full" style={{
                top: "50%", left: "50%", width: 20, height: 20,
                transform: "translate(-50%, -50%)",
                border: "1px solid hsla(224, 76%, 40%, 0.3)",
                animation: `knock-ripple 1.2s ease-out ${i * 0.15}s forwards`, opacity: 0,
              }} />
            ))}
            <div style={{
              width: 16, height: 40, borderRadius: 8,
              background: "linear-gradient(180deg, hsla(214, 32%, 85%, 0.5), hsla(214, 32%, 75%, 0.3))",
              border: "1px solid hsla(214, 32%, 91%, 1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "radial-gradient(circle at 40% 35%, hsla(224, 70%, 55%, 0.4), hsla(224, 76%, 35%, 0.3) 60%, hsla(224, 40%, 25%, 0.6))",
                border: "1px solid hsla(224, 76%, 40%, 0.2)",
                boxShadow: "0 0 15px hsla(224, 76%, 40%, 0.15), 0 0 30px hsla(224, 76%, 40%, 0.08), inset 0 1px 2px hsla(0, 0%, 100%, 0.3)",
                animation: showKnock ? "knob-glow 2.5s ease-in-out infinite" : "none",
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-40" style={{
        background: "linear-gradient(to top, #ffffff, transparent)", zIndex: 3,
      }} />
    </div>
  );
}
