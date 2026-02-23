import { Report, WeatherCondition } from "@/types/report";

export interface ClusteredReport {
  lat: number;
  lng: number;
  condition: WeatherCondition;
  count: number;
  hasOnsite: boolean;
  latestId: string;
  createdAt: string;
}

// Kelompokin reports yang berdekatan (radius ~500m)
export function clusterReports(reports: Report[]): ClusteredReport[] {
    if (!reports || !Array.isArray(reports)) return [];
  const clusters: ClusteredReport[] = [];
  const used = new Set<string>();

  for (const report of reports) {
    if (used.has(report.id)) continue;

    const nearby = reports.filter(
      (r) =>
        !used.has(r.id) &&
        r.condition === report.condition &&
        getDistanceKm(report.lat, report.lng, r.lat, r.lng) < 0.5
    );

    nearby.forEach((r) => used.add(r.id));

    clusters.push({
      lat: average(nearby.map((r) => r.lat)),
      lng: average(nearby.map((r) => r.lng)),
      condition: report.condition,
      count: nearby.length,
      hasOnsite: nearby.some((r) => r.is_onsite),
      latestId: report.id,
      createdAt: report.created_at,
    });
  }

  return clusters;
}

function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = dLat * dLat + dLng * dLng;
  return R * Math.sqrt(a);
}

function average(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// Ukuran icon makin gede kalau makin banyak laporan
export function getIconSize(count: number): number {
  if (count >= 5) return 44;
  if (count >= 3) return 36;
  return 28;
}
