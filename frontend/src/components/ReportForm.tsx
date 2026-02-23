"use client";

import { useState } from "react";
import { WeatherCondition } from "@/types/report";

const CONDITIONS: { value: WeatherCondition; label: string; emoji: string }[] = [
  { value: "sunny",      label: "Cerah",     emoji: "☀️"  },
  { value: "cloudy",     label: "Mendung",   emoji: "☁️"  },
  { value: "drizzle",    label: "Gerimis",   emoji: "🌦️" },
  { value: "heavy_rain", label: "Ujan Lebat",emoji: "🌧️" },
  { value: "flood",      label: "Banjir",    emoji: "🌊"  },
];

interface Props {
  onSubmitReport: (condition: WeatherCondition, isOnsite: boolean) => void;
  onSubmitRequest: (areaName: string, message: string) => void;
  onDismiss: () => void;
  isSubmitting: boolean;
}

export default function ReportForm({ onSubmitReport, onSubmitRequest, onDismiss, isSubmitting }: Props) {
  const [mode, setMode] = useState<"report" | "request">("report");
  const [selected, setSelected] = useState<WeatherCondition | null>(null);
  const [isOnsite, setIsOnsite] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [message, setMessage] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1.5px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text-primary)",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "20px",
      padding: "20px",
      width: "100%",
      boxShadow: "var(--shadow-lg)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
          {mode === "report" ? "Cuaca di sini sekarang?" : "Minta laporan cuaca"}
        </p>
        <button onClick={onDismiss} style={{
          background: "var(--bg-hover)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          width: "28px", height: "28px",
          cursor: "pointer",
          fontSize: "14px",
          color: "var(--text-muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>✕</button>
      </div>

      {/* Mode Toggle */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "6px",
        marginBottom: "16px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "4px",
      }}>
        {[
          { value: "report", label: "🌧️ Laporkan" },
          { value: "request", label: "❓ Minta Info" },
        ].map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value as "report" | "request")}
            style={{
              padding: "8px",
              borderRadius: "9px",
              border: "none",
              background: mode === m.value ? "var(--bg-card)" : "transparent",
              color: mode === m.value ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: mode === m.value ? 700 : 500,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: mode === m.value ? "var(--shadow)" : "none",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* MODE: REPORT */}
      {mode === "report" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "12px" }}>
            {CONDITIONS.map((c) => {
              const isSelected = selected === c.value;
              return (
                <button key={c.value} onClick={() => setSelected(c.value)} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "4px",
                  padding: "10px 4px",
                  borderRadius: "12px",
                  border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                  background: isSelected ? "var(--accent-soft)" : "var(--bg)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  <span style={{ fontSize: "22px", lineHeight: 1 }}>{c.emoji}</span>
                  <span style={{
                    fontSize: "10px", fontWeight: 600,
                    color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                    textAlign: "center",
                  }}>{c.label}</span>
                </button>
              );
            })}
          </div>

          <button onClick={() => setIsOnsite(!isOnsite)} style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px",
            borderRadius: "12px",
            border: `1.5px solid ${isOnsite ? "var(--onsite)" : "var(--border)"}`,
            background: isOnsite ? "var(--onsite-soft)" : "var(--bg)",
            cursor: "pointer",
            marginBottom: "12px",
            transition: "all 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📍</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: isOnsite ? "var(--onsite)" : "var(--text-secondary)" }}>
                Saya lagi di sini sekarang
              </span>
            </div>
            <div style={{
              width: "34px", height: "18px", borderRadius: "999px",
              background: isOnsite ? "var(--onsite)" : "var(--border)",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: "2px",
                left: isOnsite ? "16px" : "2px",
                width: "14px", height: "14px",
                borderRadius: "50%", background: "white",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </div>
          </button>

          <button
            onClick={() => selected && onSubmitReport(selected, isOnsite)}
            disabled={!selected || isSubmitting}
            style={{
              width: "100%", padding: "11px", borderRadius: "12px", border: "none",
              background: selected ? "var(--accent)" : "var(--border)",
              color: selected ? "#fff" : "var(--text-muted)",
              fontWeight: 700, fontSize: "13px",
              cursor: selected ? "pointer" : "not-allowed",
              transition: "all 0.15s", fontFamily: "inherit",
            }}
          >
            {isSubmitting ? "Ngirim..." : "Laporkan ✓"}
          </button>
        </>
      )}

      {/* MODE: REQUEST */}
      {mode === "request" && (
        <>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px", lineHeight: 1.5 }}>
            Minta orang yang lagi di area ini untuk lapor cuaca. Kamu bisa share link-nya ke WhatsApp atau sosmed.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            <input
              placeholder="Nama area (contoh: Ciledug, Tanah Abang)"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              maxLength={100}
              style={inputStyle}
            />
            <textarea
              placeholder="Pesan opsional (contoh: mau ke sini nih, ujan gak?)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          <button
            onClick={() => onSubmitRequest(areaName, message)}
            disabled={!areaName.trim() || isSubmitting}
            style={{
              width: "100%", padding: "11px", borderRadius: "12px", border: "none",
              background: areaName.trim() ? "var(--accent)" : "var(--border)",
              color: areaName.trim() ? "#fff" : "var(--text-muted)",
              fontWeight: 700, fontSize: "13px",
              cursor: areaName.trim() ? "pointer" : "not-allowed",
              transition: "all 0.15s", fontFamily: "inherit",
            }}
          >
            {isSubmitting ? "Memproses..." : "Buat Request & Copy Link 🔗"}
          </button>
        </>
      )}
    </div>
  );
}
