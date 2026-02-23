"use client";

import { useState } from "react";
import { LocationRequest } from "@/types/report";
import { motion, AnimatePresence } from "framer-motion";


interface Props {
  request: LocationRequest;
  onClose: () => void;
}

export default function ShareModal({ request, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/?request=${request.id}`;

  const waText = encodeURIComponent(
    `Ada yang lagi di sekitar ${request.area_name || "area ini"}? ` +
    `${request.message ? request.message + " " : ""}` +
    `Tolong lapor cuaca di sini ya 🌧️\n${shareUrl}`
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
        <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: "fixed", inset: 0, zIndex: 3000,
                background: "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "20px",
                backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
        >
        <motion.div
            key="modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "24px",
            width: "100%",
            maxWidth: "360px",
            boxShadow: "var(--shadow-lg)",
            }}
        >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔗</div>
            <p style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>
                Request Berhasil Dibuat!
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Share link ini ke orang yang lagi di {request.area_name || "area itu"}
            </p>
            </div>

            {/* Link box */}
            <div style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "10px 12px",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            }}>
            <span style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}>
                {shareUrl}
            </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button onClick={handleCopy} style={{
                width: "100%", padding: "11px", borderRadius: "12px", border: "none",
                background: copied ? "var(--onsite)" : "var(--accent)",
                color: "#fff", fontWeight: 700, fontSize: "13px",
                cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
            }}>
                {copied ? "✓ Link Tersalin!" : "📋 Copy Link"}
            </button>

            <a
                href={`https://wa.me/?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                display: "block", width: "100%", padding: "11px",
                borderRadius: "12px",
                background: "#25D366",
                color: "#fff", fontWeight: 700, fontSize: "13px",
                textAlign: "center", textDecoration: "none",
                transition: "opacity 0.15s",
                }}
            >
                💬 Share ke WhatsApp
            </a>

            <button onClick={onClose} style={{
                width: "100%", padding: "10px", borderRadius: "12px",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px",
                cursor: "pointer", fontFamily: "inherit",
            }}>
                Tutup
            </button>
            </div>
        </motion.div>
        </motion.div>
    </AnimatePresence>
  );
}
