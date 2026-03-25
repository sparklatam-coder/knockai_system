"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animated door + doorknob hero background.
 * - Elegant door frame with glass panel
 * - Doorknob that pulses with knock ripples
 * - Floating light particles
 * - Light seeping through the door crack
 */
export function DoorKnockHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [knockPhase, setKnockPhase] = useState(0);

  // Knock ripple cycle: 3 knocks then pause
  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      // Knock at frame 0, 8, 16, then pause until 60
      if (frame % 60 < 24 && frame % 8 === 0) {
        setKnockPhase((p) => p + 1);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Floating particles
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
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() > 0.5 ? 352 : 213,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w(), h());

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += (Math.random() - 0.5) * 0.02;
        p.opacity = Math.max(0.05, Math.min(0.5, p.opacity));

        if (p.y < -10) { p.y = h() + 10; p.x = Math.random() * w(); }
        if (p.x < -10) p.x = w() + 10;
        if (p.x > w() + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Ambient gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 40%, hsla(352, 80%, 59%, 0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 30% 60%, hsla(213, 100%, 65%, 0.04) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 70% 30%, hsla(352, 80%, 50%, 0.03) 0%, transparent 70%)
          `,
        }}
      />

      {/* Door visual — centered right side */}
      <div
        className="absolute hidden md:flex items-center justify-center"
        style={{
          right: "8%",
          top: "50%",
          transform: "translateY(-50%)",
          width: 220,
          height: 420,
          zIndex: 2,
        }}
      >
        {/* Door frame outer glow */}
        <div
          className="absolute inset-[-8px] rounded-[28px]"
          style={{
            background: "linear-gradient(180deg, hsla(352, 80%, 59%, 0.08), hsla(213, 100%, 65%, 0.04))",
            filter: "blur(20px)",
          }}
        />

        {/* Door frame */}
        <div
          className="absolute inset-0 rounded-[20px]"
          style={{
            border: "1px solid hsla(0, 0%, 100%, 0.06)",
            background: "linear-gradient(170deg, hsla(240, 25%, 10%, 0.9), hsla(240, 30%, 6%, 0.95))",
            boxShadow: `
              inset 0 1px 0 hsla(0, 0%, 100%, 0.04),
              0 0 60px hsla(240, 30%, 4%, 0.5),
              0 20px 60px hsla(0, 0%, 0%, 0.3)
            `,
          }}
        />

        {/* Door panel grooves */}
        <div
          className="absolute rounded-lg"
          style={{
            top: 30,
            left: 24,
            right: 24,
            height: 140,
            border: "1px solid hsla(0, 0%, 100%, 0.03)",
            background: "hsla(240, 25%, 8%, 0.5)",
            borderRadius: 12,
          }}
        />
        <div
          className="absolute rounded-lg"
          style={{
            top: 190,
            left: 24,
            right: 24,
            height: 180,
            border: "1px solid hsla(0, 0%, 100%, 0.03)",
            background: "hsla(240, 25%, 8%, 0.5)",
            borderRadius: 12,
          }}
        />

        {/* Light seeping through door crack (left edge) */}
        <div
          className="absolute"
          style={{
            left: -2,
            top: "10%",
            width: 3,
            height: "80%",
            background: "linear-gradient(180deg, transparent, hsla(352, 80%, 59%, 0.3), hsla(352, 80%, 59%, 0.5), hsla(352, 80%, 59%, 0.3), transparent)",
            filter: "blur(2px)",
            animation: "door-light-pulse 3s ease-in-out infinite",
          }}
        />
        {/* Light glow from crack */}
        <div
          className="absolute"
          style={{
            left: -12,
            top: "15%",
            width: 20,
            height: "70%",
            background: "linear-gradient(180deg, transparent, hsla(352, 80%, 59%, 0.06), hsla(352, 80%, 59%, 0.1), hsla(352, 80%, 59%, 0.06), transparent)",
            filter: "blur(8px)",
            animation: "door-light-pulse 3s ease-in-out infinite",
          }}
        />

        {/* Doorknob */}
        <div
          className="absolute"
          style={{
            right: 28,
            top: "52%",
            transform: "translateY(-50%)",
            zIndex: 5,
          }}
        >
          {/* Knock ripples */}
          {[0, 1, 2].map((i) => (
            <div
              key={`${knockPhase}-${i}`}
              className="absolute rounded-full"
              style={{
                top: "50%",
                left: "50%",
                width: 20,
                height: 20,
                transform: "translate(-50%, -50%)",
                border: "1px solid hsla(352, 80%, 59%, 0.4)",
                animation: `knock-ripple 1.2s ease-out ${i * 0.15}s forwards`,
                opacity: 0,
              }}
            />
          ))}

          {/* Knob base plate */}
          <div
            style={{
              width: 16,
              height: 40,
              borderRadius: 8,
              background: "linear-gradient(180deg, hsla(0, 0%, 60%, 0.15), hsla(0, 0%, 40%, 0.1))",
              border: "1px solid hsla(0, 0%, 100%, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Knob sphere */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "radial-gradient(circle at 40% 35%, hsla(352, 70%, 65%, 0.5), hsla(352, 80%, 40%, 0.3) 60%, hsla(240, 20%, 15%, 0.8))",
                border: "1px solid hsla(352, 80%, 59%, 0.3)",
                boxShadow: `
                  0 0 15px hsla(352, 80%, 59%, 0.2),
                  0 0 30px hsla(352, 80%, 59%, 0.1),
                  inset 0 1px 2px hsla(0, 0%, 100%, 0.15)
                `,
                animation: "knob-glow 2.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: "linear-gradient(to top, hsl(240 30% 4%), transparent)",
          zIndex: 3,
        }}
      />
    </div>
  );
}
