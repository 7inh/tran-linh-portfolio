/**
 * Live battery level via the Battery Status API.
 *
 * Deliberately reports nothing rather than guessing. State stays `null` until a
 * real reading arrives, which covers three cases with one shape: before mount,
 * on browsers without the API (Safari, Firefox), and when the promise rejects.
 * The bar renders a dimmed glyph with no percentage in that case — showing a
 * full battery would be inventing a value we do not have.
 *
 * Nothing is read from `navigator` during render and no state is set
 * synchronously in the effect, so the server markup and the first client paint
 * agree (this bar has a history of hydration mismatches) and no cascading
 * render is introduced.
 */
"use client";

import { useEffect, useState } from "react";

export interface BatteryReading {
  /** 0..1 */
  level: number;
  charging: boolean;
}

/** `getBattery` is not in the DOM lib typings. */
type BatteryManager = EventTarget & BatteryReading;
type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryManager>;
};

export function useBattery(): BatteryReading | null {
  const [reading, setReading] = useState<BatteryReading | null>(null);

  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery !== "function") return;

    let manager: BatteryManager | null = null;
    let cancelled = false;
    const sync = () => {
      if (manager) {
        setReading({ level: manager.level, charging: manager.charging });
      }
    };

    nav
      .getBattery()
      .then((b) => {
        if (cancelled) return;
        manager = b;
        sync();
        b.addEventListener("levelchange", sync);
        b.addEventListener("chargingchange", sync);
      })
      .catch(() => {
        /* Unsupported or blocked: stay null and render the dimmed glyph. */
      });

    return () => {
      cancelled = true;
      manager?.removeEventListener("levelchange", sync);
      manager?.removeEventListener("chargingchange", sync);
    };
  }, []);

  return reading;
}
