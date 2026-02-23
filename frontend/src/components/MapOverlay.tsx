"use client";

import { Report, WeatherCondition } from "@/types/report";

const CONDITIONS: { value: WeatherCondition; emoji: string; label: string }[] = [
  { value: "sunny", emoji: "☀️", label: "Cerah" },
  { value: "cloudy", emoji: "☁️", label: "Mendung" },
  { value: "drizzle", emoji: "🌦️", label: "Gerimis" },
  { value: "heavy_rain", emoji: "🌧️", label: "Ujan Lebat" },
  { value: "flood", emoji: "🌊", label: "Banjir" },
];

const cardStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  boxShadow: "var(--shadow)",
  padding: "14px 16px",
};

interface Props { reports: Report[] }

export default function MapOverlay({ reports }: Props) {
  const activeCount = reports.length;
  const onsiteCount = reports.filter((r) => r.is_onsite).length;
  const conditionCount = CONDITIONS
    .map((c) => ({ ...c, count: reports.filter((r) => r.condition === c.value).length }))
    .filter((c) => c.count > 0);

  return (
    <>
      {/* Stats — top right */}
      <div style={{ position: "absolute", top: "16px", right: "16px", zIndex: 1000, minWidth: "170px", ...cardStyle }}>

        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
          Laporan Aktif
        </p>

        <div style={{ display: "flex", gap: "20px", marginBottom: conditionCount.length ? "12px" : 0 }}>
          <div>
            <div style={{ fontSize: "26px", fontWeight: 800, lineHeight: 1, color: "var(--accent)" }}>
              {activeCount}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>total</div>
          </div>
          <div>
            <div style={{ fontSize: "26px", fontWeight: 800, lineHeight: 1, color: "var(--onsite)" }}>
              {onsiteCount}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>on-site</div>
          </div>
        </div>

        {conditionCount.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "7px" }}>
            {conditionCount.map((c) => (
              <div key={c.value} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {c.emoji} {c.label}
                </span>
                <span style={{
                  fontSize: "11px", fontWeight: 700,
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  padding: "1px 8px",
                  borderRadius: "999px",
                }}>
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confidence legend — bottom right, di atas attribution */}
      <div style={{ position: "absolute", bottom: "36px", right: "16px", zIndex: 1000, ...cardStyle }}>
        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}>
          Confidence
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { size: "18px", label: "1–2 laporan" },
            { size: "22px", label: "3–4 laporan" },
            { size: "27px", label: "5+ laporan" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: item.size, lineHeight: 1 }}>🌧️</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{item.label}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "8px", borderTop: "1px solid var(--border)", marginTop: "2px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid var(--onsite)", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>On-site reporter</span>
          </div>
        </div>
      </div>
    </>
  );
}
