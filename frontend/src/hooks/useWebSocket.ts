import { useEffect, useRef, useCallback } from "react";
import { Report } from "@/types/report";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
const MAX_BACKOFF = 30_000; // max 30 detik

export function useWebSocket(
  lat: number | null,
  lng: number | null,
  onNewReport: (report: Report) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!lat || !lng) return;

    const ws = new WebSocket(`${WS_URL}/ws?lat=${lat}&lng=${lng}`);
    wsRef.current = ws;

    ws.onopen = () => {
      retryRef.current = 0; // reset backoff kalau connect berhasil
    };

    ws.onmessage = (event) => {
      try {
        const report: Report = JSON.parse(event.data);
        onNewReport(report);
      } catch {}
    };

    ws.onclose = () => {
      // Exponential backoff: 1s, 2s, 4s, 8s, ... max 30s
      const backoff = Math.min(1000 * 2 ** retryRef.current, MAX_BACKOFF);
      retryRef.current += 1;
      timeoutRef.current = setTimeout(connect, backoff);
    };

    ws.onerror = () => ws.close();
  }, [lat, lng, onNewReport]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [connect]);
}
