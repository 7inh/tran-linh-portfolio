/**
 * Live weather for Tran Linh's own location, via Open-Meteo (no API key needed,
 * fetched directly from the browser).
 *
 * Fixed to Ho Chi Minh City rather than the visitor's geolocation — this is
 * "Linh's desktop," mirroring how real macOS shows the Mac owner's configured
 * city, and it avoids a permission prompt and a denied-permission fallback path.
 *
 * One fetch per time the sidebar is opened; no polling. A decorative-but-real
 * widget in a demo desktop doesn't need live updates during a single viewing.
 *
 * On any failure the state is `{status:"error"}`, never a fabricated reading —
 * the same principle `useBattery.ts` already established for this bar.
 */
"use client";

import { useEffect, useState } from "react";

const HCMC = {
  name: "Ho Chi Minh City",
  latitude: 10.7769,
  longitude: 106.7009,
} as const;

export interface WeatherReading {
  tempC: number;
  code: number;
  isDay: boolean;
  highC: number;
  lowC: number;
}

export type WeatherState =
  | { status: "loading" }
  | { status: "error" }
  | ({ status: "ready" } & WeatherReading);

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    is_day: 0 | 1;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(HCMC.latitude));
    url.searchParams.set("longitude", String(HCMC.longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,weather_code,is_day"
    );
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min"
    );
    url.searchParams.set("timezone", "Asia/Ho_Chi_Minh");

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`weather: ${res.status}`);
        return res.json() as Promise<OpenMeteoResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        const high = data.daily.temperature_2m_max[0];
        const low = data.daily.temperature_2m_min[0];
        if (
          !Number.isFinite(data.current.temperature_2m) ||
          !Number.isFinite(high) ||
          !Number.isFinite(low)
        ) {
          throw new Error("weather: malformed response");
        }
        setState({
          status: "ready",
          tempC: data.current.temperature_2m,
          code: data.current.weather_code,
          isDay: data.current.is_day === 1,
          highC: high,
          lowC: low,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export { HCMC };
