"use client";

import dynamic from "next/dynamic";
import ThemeToggle from "@/components/ThemeToggle";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ background: "var(--bg)" }}>
      <span className="text-5xl animate-bounce">🌧️</span>
      <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
        Lagi nyiapin peta...
      </p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="w-screen h-screen flex flex-col" style={{ background: "var(--bg)" }}>

      <header style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/tanyalangit.png"
            alt="TanyaLangit Logo"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              objectFit: "cover"
            }}
          />
          <div>
            <div style={{
              fontWeight: 700,
              fontSize: "15px",
              color: "var(--text-primary)",
              lineHeight: 1,
            }}>
              TanyaLangit
            </div>
            <div style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "2px",
              lineHeight: 1,
            }}>
               Tanya cuaca ke manusia, bukan cuma satelit
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--onsite)",
            background: "var(--onsite-soft)",
            border: "1px solid var(--border)",
            padding: "5px 10px",
            borderRadius: "999px",
          }}>
            <span style={{
              width: "6px", height: "6px",
              borderRadius: "50%",
              background: "var(--onsite)",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }} />
            Live
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 relative">
        <Map />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </main>
  );
}
