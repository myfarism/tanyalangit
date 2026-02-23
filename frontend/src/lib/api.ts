import { CreateReportPayload, Report, LocationRequest, CreateRequestPayload } from "@/types/report";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function getNearbyReports(lat: number, lng: number, radius = 5): Promise<Report[]> {
  const res = await fetch(`${BASE_URL}/api/reports/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createReport(payload: CreateReportPayload): Promise<Report> {
  const res = await fetch(`${BASE_URL}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal kirim laporan");
  return res.json();
}

export async function getNearbyRequests(lat: number, lng: number, radius = 10): Promise<LocationRequest[]> {
  const res = await fetch(`${BASE_URL}/api/requests/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createLocationRequest(payload: CreateRequestPayload): Promise<LocationRequest> {
  const res = await fetch(`${BASE_URL}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal buat request");
  return res.json();
}

export async function getRequestByID(id: string): Promise<LocationRequest | null> {
  const res = await fetch(`${BASE_URL}/api/requests/${id}`);
  if (!res.ok) return null;
  return res.json();
}
