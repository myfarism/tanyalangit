"use client";

import { useEffect, useState, useMemo } from "react";
import { Report } from "@/types/report";

interface Props {
  reports: Report[];
}

interface Drop {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
}

export default function RainEffect({ reports }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasHeavyRain = reports.some(
    (r) => r.condition === "heavy_rain" || r.condition === "flood"
  );
  const hasLight = reports.some((r) => r.condition === "drizzle");

  const intensity = hasHeavyRain ? "heavy" : hasLight ? "light" : null;

  const drops = useMemo<Drop[]>(() => {
    if (!intensity) return [];
    const count = intensity === "heavy" ? 40 : 18;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: intensity === "heavy"
        ? 0.6 + Math.random() * 0.4
        : 1.2 + Math.random() * 0.8,
      delay: Math.random() * 3,
      size: intensity === "heavy"
        ? 1.5 + Math.random()
        : 1 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.4,
    }));
  }, [intensity]);

  if (!mounted || !intensity) return null;

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      zIndex: 500,
      pointerEvents: "none",
      overflow: "hidden",
    }}>
      {drops.map((drop) => (
        <div
          key={drop.id}
          style={{
            position: "absolute",
            left: `${drop.left}%`,
            top: 0,
            width: `${drop.size}px`,
            height: `${intensity === "heavy" ? 18 : 12}px`,
            background: `linear-gradient(to bottom, transparent, rgba(147, 197, 253, ${drop.opacity}))`,
            borderRadius: "0 0 2px 2px",
            animation: `rain-fall ${drop.duration}s linear ${drop.delay}s infinite`,
          }}
        />
      ))}

      {/* Subtle overlay tint */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: intensity === "heavy"
          ? "rgba(30, 58, 138, 0.06)"
          : "rgba(147, 197, 253, 0.04)",
        transition: "background 1s ease",
      }} />
    </div>
  );
}
