/**
 * Weather card for the calendar sidebar — Ho Chi Minh City, live from
 * Open-Meteo via `useWeather`. See that file for why the location is fixed and
 * why there's no polling.
 *
 * Rendered as its own solid-ish card sitting on the sidebar's translucent
 * shell, reusing the same "glass shell, opaque inner card" convention
 * ControlCenter.tsx already established for its Dark Mode row and media-player
 * card (`rounded-2xl border bg-white dark:bg-glass/80 p-3`) — a new card
 * following an existing pattern, not a new visual language.
 */
"use client";

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";
import { useWeather, HCMC } from "./useWeather";

const ICON_CLASS = "size-8 shrink-0 text-primary";

/**
 * WMO weather-code → icon, verified against Open-Meteo's own docs. Returns an
 * already-built element rather than a component reference — binding a
 * component to a local variable and using it as a tag is flagged by the React
 * Compiler lint rule ("cannot create components during render"). Unlisted
 * codes fall back to a plain cloud rather than throwing — this stays a pure
 * lookup with no exhaustiveness burden as Open-Meteo's code set grows.
 */
function weatherIcon(code: number, isDay: boolean) {
  if (code === 0) return isDay ? <Sun className={ICON_CLASS} /> : <Moon className={ICON_CLASS} />;
  if (code === 1 || code === 2)
    return isDay ? <CloudSun className={ICON_CLASS} /> : <CloudMoon className={ICON_CLASS} />;
  if (code === 3) return <Cloud className={ICON_CLASS} />;
  if (code === 45 || code === 48) return <CloudFog className={ICON_CLASS} />;
  if ([51, 53, 55, 56, 57].includes(code)) return <CloudDrizzle className={ICON_CLASS} />;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className={ICON_CLASS} />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow className={ICON_CLASS} />;
  if ([95, 96, 99].includes(code)) return <CloudLightning className={ICON_CLASS} />;
  return <Cloud className={ICON_CLASS} />;
}

function labelFor(code: number): string {
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([80, 81, 82].includes(code)) return "Rain Showers";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([85, 86].includes(code)) return "Snow Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Cloudy";
}

const cardClass =
  "rounded-2xl border border-border bg-white p-3 text-foreground dark:border-glass-border/10 dark:bg-glass/80";

export function WeatherWidget() {
  const weather = useWeather();

  if (weather.status === "loading") {
    return (
      <div className={cardClass}>
        <p className="text-[13px] font-semibold">{HCMC.name}</p>
        <p className="mt-1 text-[12px] opacity-60">Loading weather…</p>
      </div>
    );
  }

  if (weather.status === "error") {
    return (
      <div className={cardClass}>
        <p className="text-[13px] font-semibold">{HCMC.name}</p>
        <p className="mt-1 text-[12px] opacity-60">Weather unavailable</p>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <p className="text-[13px] font-semibold">{HCMC.name}</p>
      <div className="mt-1 flex items-center gap-2">
        {weatherIcon(weather.code, weather.isDay)}
        <span className="text-[28px] font-semibold leading-none tabular-nums">
          {Math.round(weather.tempC)}°
        </span>
      </div>
      <p className="mt-1 text-[12px] opacity-70">{labelFor(weather.code)}</p>
      <p className="mt-0.5 text-[11px] tabular-nums opacity-60">
        H:{Math.round(weather.highC)}° L:{Math.round(weather.lowC)}°
      </p>
    </div>
  );
}
