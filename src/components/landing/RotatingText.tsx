"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = [
  { ko: "매출", en: "Sales" },
  { ko: "브랜드", en: "Brand" },
  { ko: "예약", en: "Customers" },
  { ko: "스토리", en: "Content" },
  { ko: "검색", en: "Exposure" },
];

export const RotatingText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block min-w-[320px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute left-0 top-0 text-highlight glow-text whitespace-nowrap"
        >
          {words[index].en}
        </motion.span>
      </AnimatePresence>
      <span className="invisible whitespace-nowrap">Customers</span>
    </span>
  );
};
