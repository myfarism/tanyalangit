export type WeatherCondition =
  | "sunny"
  | "cloudy"
  | "drizzle"
  | "heavy_rain"
  | "flood";

export interface Report {
  id: string;
  condition: WeatherCondition;
  lat: number;
  lng: number;
  is_onsite: boolean;
  created_at: string;
  expires_at: string;
}

export interface CreateReportPayload {
  condition: WeatherCondition;
  lat: number;
  lng: number;
  is_onsite: boolean;
}

export interface LocationRequest {
  id: string;
  lat: number;
  lng: number;
  area_name: string;
  message: string;
  fulfilled_count: number;
  created_at: string;
  expires_at: string;
}

export interface CreateRequestPayload {
  lat: number;
  lng: number;
  area_name: string;
  message: string;
}
