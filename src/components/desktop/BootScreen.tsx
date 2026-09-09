"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CRITICAL_BOOT_ASSETS,
  preloadAssets,
} from "@/lib/preload-assets";
import { cn } from "@/lib/utils";

const BOOT_MS = 2400;
const FADE_MS = 600;
/** Cap so a hung network request cannot block the desktop forever. */
const SAFETY_MS = 8000;

/**
 * macOS-style boot sequence: logo over black with a determinate progress
 * bar, then a fade into the desktop. Rendered above everything else.
 * Fade starts only after the minimum boot time and critical assets are ready.
 */
export function BootScreen() {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Reduced-motion visitors get a duration of 0, which falls through the
    // same path and dismisses the screen as soon as assets (or safety) settle.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 0 : BOOT_MS;

    let raf = 0;
    let fadeTimer = 0;
    let safetyTimer = 0;
    let cancelled = false;
    let timerDone = false;
    let assetsDone = false;
    let faded = false;

    const startFade = () => {
      if (cancelled || faded || !timerDone || !assetsDone) return;
      faded = true;
      window.clearTimeout(safetyTimer);
      setFading(true);
      fadeTimer = window.setTimeout(() => setGone(true), FADE_MS);
    };

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = duration > 0 ? Math.min(1, elapsed / duration) : 1;
      // Ease out so the bar creeps near the end, like a real boot bar.
      setProgress(100 * (1 - Math.pow(1 - t, 1.8)));

      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      timerDone = true;
      startFade();
    };
    raf = requestAnimationFrame(tick);

    preloadAssets(CRITICAL_BOOT_ASSETS).then(() => {
      if (cancelled) return;
      assetsDone = true;
      startFade();
    });

    safetyTimer = window.setTimeout(() => {
      if (cancelled) return;
      assetsDone = true;
      timerDone = true;
      setProgress(100);
      startFade();
    }, SAFETY_MS);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(safetyTimer);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black transition-opacity ease-out",
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <Image
        src="/boot/banana.svg"
        alt=""
        width={128}
        height={128}
        priority
        unoptimized
        draggable={false}
        className="size-32 select-none"
      />
      <div className="mt-12 h-1 w-56 overflow-hidden rounded-full bg-white/25">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
