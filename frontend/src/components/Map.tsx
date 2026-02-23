"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { Report, WeatherCondition, LocationRequest } from "@/types/report";
import { getNearbyReports, createReport, getNearbyRequests, createLocationRequest, getRequestByID } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { clusterReports, getIconSize } from "@/lib/utils";
import ReportForm from "./ReportForm";
import MapOverlay from "./MapOverlay";
import Toast from "./Toast";
import ShareModal from "./ShareModal";
import RainEffect from "./RainEffect";
import { AnimatePresence, motion } from "framer-motion";



delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const CONDITION_EMOJI: Record<WeatherCondition, string> = {
  sunny: "☀️", cloudy: "☁️", drizzle: "🌦️", heavy_rain: "🌧️", flood: "🌊",
};

function createWeatherIcon(
  condition: WeatherCondition,
  isOnsite: boolean,
  count: number,
  isNew = false
) {
  const size = getIconSize(count);
  const ring = isOnsite
    ? "outline: 2.5px solid var(--onsite, #2d7a4f); border-radius: 50%; padding: 2px;"
    : "";

  return L.divIcon({
    html: `
      <div class="${isNew ? "marker-animated" : ""}" style="position:relative;display:inline-block;">
        <div style="font-size:${size}px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.25));${ring}">
          ${CONDITION_EMOJI[condition]}
        </div>
        ${count > 1 ? `
          <div style="
            position:absolute;top:-4px;right:-6px;
            background:#c2692a;color:white;
            font-size:10px;font-weight:700;
            border-radius:999px;min-width:16px;height:16px;
            display:flex;align-items:center;justify-content:center;
            padding:0 3px;border:1.5px solid white;
          ">${count}</div>` : ""}
      </div>`,
    className: "",
    iconSize: [size + 10, size + 10],
    iconAnchor: [(size + 10) / 2, (size + 10) / 2],
  });
}

function createRequestIcon() {
  return L.divIcon({
    html: `
      <div style="position:relative;display:inline-block;width:36px;height:36px;">
        <div class="request-ripple"></div>
        <div class="request-ripple request-ripple-2"></div>
        <div class="request-marker" style="
          font-size:26px;
          filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3));
          position:relative;z-index:1;
          display:flex;align-items:center;justify-content:center;
          width:36px;height:36px;
        ">❓</div>
      </div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export default function Map() {
  const { theme } = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [requests, setRequests] = useState<LocationRequest[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [clickedLocation, setClickedLocation] = useState<[number, number] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsBlocked, setGpsBlocked] = useState(false);
  const [toast, setToast] = useState<{ message: string; emoji: string } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [shareModal, setShareModal] = useState<LocationRequest | null>(null);
  const [highlightRequestId, setHighlightRequestId] = useState<string | null>(null);
  const [newReportIds, setNewReportIds] = useState<Set<string>>(new Set());

  const defaultCenter: [number, number] = [-6.2088, 106.8456];

  const showToast = (message: string, emoji: string) => {
    setToast({ message, emoji });
    setToastVisible(true);
  };

  // GPS
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setGpsBlocked(true)
    );
  }, []);

  // Cek URL param ?request=id — untuk orang yang buka dari share link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get("request");
    if (requestId) {
      setHighlightRequestId(requestId);
      getRequestByID(requestId).then((req) => {
        if (req) {
          setClickedLocation([req.lat, req.lng]);
          showToast(`Ada yang minta laporan di ${req.area_name || "area ini"}!`, "❓");
        }
      });
    }
  }, []);

  // Fetch data awal
  useEffect(() => {
    const center = userLocation || defaultCenter;
    getNearbyReports(center[0], center[1], 10).then(setReports).catch(console.error);
    getNearbyRequests(center[0], center[1], 15).then(setRequests).catch(console.error);
  }, [userLocation]);

  // Auto cleanup expired
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setReports((prev) => prev.filter((r) => new Date(r.expires_at) > now));
      setRequests((prev) => prev.filter((r) => new Date(r.expires_at) > now));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleNewReport = useCallback((report: Report) => {
    setReports((prev) => {
      if (prev.some((r) => r.id === report.id)) return prev;
      return [report, ...prev];
    });
    setNewReportIds((prev) => new Set(prev).add(report.id));
    setTimeout(() => {
      setNewReportIds((prev) => {
        const next = new Set(prev);
        next.delete(report.id);
        return next;
      });
    }, 1000);
  }, []);

  useWebSocket(userLocation?.[0] ?? null, userLocation?.[1] ?? null, handleNewReport);

  const handleMapClick = (lat: number, lng: number) => {
    setClickedLocation([lat, lng]);
  };

  const handleSubmitReport = async (condition: WeatherCondition, isOnsite: boolean) => {
    if (!clickedLocation) return;
    setIsSubmitting(true);
    try {
      await createReport({
        condition, lat: clickedLocation[0], lng: clickedLocation[1], is_onsite: isOnsite,
      });
      setClickedLocation(null);
      showToast("Laporan terkirim!", "🌧️");
    } catch {
      showToast("Gagal kirim laporan", "❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRequest = async (areaName: string, message: string) => {
    if (!clickedLocation) return;
    setIsSubmitting(true);
    try {
      const result = await createLocationRequest({
        lat: clickedLocation[0], lng: clickedLocation[1],
        area_name: areaName, message,
      });
      setRequests((prev) => [result, ...prev]);
      setClickedLocation(null);
      setShareModal(result);
    } catch {
      showToast("Gagal buat request", "❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  const center = userLocation || defaultCenter;
  const isEmpty = reports.length === 0 && requests.length === 0;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapContainer center={center} zoom={13} style={{ width: "100%", height: "100%", zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={
            theme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        />
        <ClickHandler onMapClick={handleMapClick} />

        {/* Report markers */}
        {clusterReports(reports).map((cluster) => (
          <Marker
            key={cluster.latestId}
            position={[cluster.lat, cluster.lng]}
            icon={createWeatherIcon(cluster.condition, cluster.hasOnsite, cluster.count, newReportIds.has(cluster.latestId))}
          >
            <Popup>
              <div style={{ padding: "12px", minWidth: "150px" }}>
                <p style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px" }}>
                  {CONDITION_EMOJI[cluster.condition]} {cluster.condition.replace("_", " ")}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {cluster.count} orang melaporkan
                </p>
                {cluster.hasOnsite && (
                  <p style={{ fontSize: "11px", color: "var(--onsite)", marginTop: "4px" }}>
                    📍 Ada yang lagi di sini
                  </p>
                )}
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {new Date(cluster.createdAt).toLocaleTimeString("id-ID")}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Request markers */}
        {requests.map((req) => (
          <Marker
            key={req.id}
            position={[req.lat, req.lng]}
            icon={createRequestIcon()}
          >
            <Popup>
              <div style={{ padding: "12px", minWidth: "160px" }}>
                <p style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", marginBottom: "4px" }}>
                  ❓ Minta Laporan
                </p>
                {req.area_name && (
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    📍 {req.area_name}
                  </p>
                )}
                {req.message && (
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontStyle: "italic" }}>
                    "{req.message}"
                  </p>
                )}
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  {req.fulfilled_count} orang sudah lapor
                </p>
                <button
                  onClick={() => setClickedLocation([req.lat, req.lng])}
                  style={{
                    width: "100%", padding: "7px", borderRadius: "8px", border: "none",
                    background: "var(--accent)", color: "#fff",
                    fontWeight: 700, fontSize: "11px", cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Lapor Sekarang 🌧️
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <RainEffect reports={reports} />

      <MapOverlay reports={reports} />

      <Toast
        message={toast?.message ?? ""}
        emoji={toast?.emoji ?? ""}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      {shareModal && (
        <ShareModal request={shareModal} onClose={() => setShareModal(null)} />
      )}

      {gpsBlocked && (
        <div style={{
          position: "absolute", top: "16px", left: "50%",
          transform: "translateX(-50%)", zIndex: 1000,
          background: "var(--accent-soft)", border: "1px solid var(--accent)",
          borderRadius: "12px", padding: "10px 16px",
          fontSize: "12px", color: "var(--accent)", fontWeight: 600,
          boxShadow: "var(--shadow)", whiteSpace: "nowrap",
        }}>
          📍 GPS diblokir — peta default ke Jakarta
        </div>
      )}

      {isEmpty && !clickedLocation && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000, textAlign: "center", pointerEvents: "none",
        }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "20px", padding: "24px 32px", boxShadow: "var(--shadow-lg)",
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
            <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "6px" }}>
              Belum ada laporan di area ini
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Klik di peta untuk lapor atau minta info
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {clickedLocation && (
          <motion.div
            key="report-form"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="report-form-wrapper"
            style={{
              position: "absolute",
              bottom: "24px",
              left: "50%",
              x: "-50%",
              zIndex: 1000,
              padding: "0 16px",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <ReportForm
              onSubmitReport={handleSubmitReport}
              onSubmitRequest={handleSubmitRequest}
              onDismiss={() => setClickedLocation(null)}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!clickedLocation && (
        <div style={{
          position: "absolute", bottom: "24px", left: "50%",
          transform: "translateX(-50%)", zIndex: 1000,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "999px", padding: "8px 18px",
          fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)",
          boxShadow: "var(--shadow)", whiteSpace: "nowrap",
        }}>
          👆 Klik lokasi di peta untuk lapor atau minta info
        </div>
      )}
    </div>
  );
}
