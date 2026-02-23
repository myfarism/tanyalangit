"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  message: string;
  emoji?: string;
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, emoji = "✅", visible, onHide }: Props) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [visible, onHide]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          initial={{ y: -20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -16, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          style={{
            position: "fixed",
            top: "72px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2000,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "999px",
            padding: "10px 20px",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "16px" }}>{emoji}</span>
          <span style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
