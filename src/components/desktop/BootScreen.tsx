"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const BOOT_MS = 2400;
const FADE_MS = 600;

/**
 * macOS-style boot sequence: logo over black with a determinate progress
 * bar, then a fade into the desktop. Rendered above everything else.
 */
export function BootScreen() {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Reduced-motion visitors get a duration of 0, which falls through the
    // same path and dismisses the screen immediately.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 0 : BOOT_MS;

    let raf = 0;
    let fadeTimer = 0;
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
      setFading(true);
      fadeTimer = window.setTimeout(() => setGone(true), FADE_MS);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fadeTimer);
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
