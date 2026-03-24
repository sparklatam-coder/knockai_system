"use client";

import { Outfit } from "next/font/google";
import type { ReactNode } from "react";
import "./landing.css";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export default function LandingGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`landing-theme ${outfit.variable}`}>
      {children}
    </div>
  );
}
