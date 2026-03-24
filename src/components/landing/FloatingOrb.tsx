"use client";

import { motion } from "framer-motion";

interface FloatingOrbProps {
  size: number;
  color: string;
  delay: number;
  duration: number;
  x: string;
  y: string;
  mouseX: number;
  mouseY: number;
  parallaxStrength?: number;
}

export const FloatingOrb = ({ 
  size, 
  color, 
  delay, 
  duration, 
  x, 
  y, 
  mouseX, 
  mouseY,
  parallaxStrength = 20 
}: FloatingOrbProps) => {
  // Calculate parallax offset based on mouse position
  const parallaxX = (mouseX - 0.5) * parallaxStrength;
  const parallaxY = (mouseY - 0.5) * parallaxStrength;

  return (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-30"
      style={{
        width: size,
        height: size,
        background: color,
        left: x,
        top: y,
      }}
      animate={{
        y: [parallaxY, parallaxY - 30, parallaxY],
        x: [parallaxX, parallaxX + 20, parallaxX],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};
