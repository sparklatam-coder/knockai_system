"use client";

import { useEffect, useState } from "react";

const HOSPITAL_EMOJIS = ["🏥", "😁", "💉", "👩‍⚕️", "💪", "😊", "🩻", "❤️‍🩹", "🩺", "👨‍⚕️", "🌟", "💊"];

export function HospitalLoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HOSPITAL_EMOJIS.length);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      gap: 16,
    }}>
      <div
        key={index}
        style={{
          fontSize: 64,
          width: 100,
          height: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "emojiPop 0.6s ease-out",
        }}
      >
        {HOSPITAL_EMOJIS[index]}
      </div>
      <p style={{ fontSize: 14, color: "var(--tsub)" }}>
        로딩중입니다...
      </p>
      <style>{`
        @keyframes emojiPop {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
