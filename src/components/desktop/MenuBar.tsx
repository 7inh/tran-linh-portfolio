"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/portfolio";
import { apps } from "@/data/portfolio";
import { useWindowManager } from "@/components/window/WindowManagerContext";
import { ControlCenter } from "@/components/desktop/ControlCenter";
import { cn } from "@/lib/utils";

function ControlCenterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
      aria-hidden
    >
      <path d="M0 0h16v16H0z" fill="none" />
      <path
        fill="currentColor"
        d="M4.5 9a3.5 3.5 0 1 0 0 7h7a3.5 3.5 0 1 0 0-7zm7 6a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5m-7-14a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m2.45 0A3.5 3.5 0 0 1 8 3.5A3.5 3.5 0 0 1 6.95 6h4.55a2.5 2.5 0 0 0 0-5zM4.5 0h7a3.5 3.5 0 1 1 0 7h-7a3.5 3.5 0 1 1 0-7"
      />
    </svg>
  );
}

function formatClock(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MenuBar() {
  const { focusedId, windows } = useWindowManager();
  const [now, setNow] = useState<Date | null>(null);
  const [ccOpen, setCcOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const focusedApp = focusedId ? apps.find((a) => a.id === focusedId) : null;
  const focusedOpen =
    focusedId && windows[focusedId]?.open && !windows[focusedId]?.minimized;

  return (
    <header className="absolute inset-x-0 top-0 z-[100] flex h-7 items-center justify-between bg-white/35 px-3 text-[12px] text-slate-900 shadow-[0_0.5px_0_rgba(255,255,255,0.4)] backdrop-blur-xl dark:bg-black/45 dark:text-white dark:shadow-[0_0.5px_0_rgba(255,255,255,0.08)]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="font-[family-name:var(--font-display)] text-[13px] font-semibold tracking-tight">
          {profile.name}
        </span>
        <span
          className={cn(
            "truncate font-medium text-slate-700/90 transition-opacity dark:text-white/75",
            focusedOpen ? "opacity-100" : "opacity-0"
          )}
        >
          {focusedApp?.label}
        </span>
      </div>
      <div className="relative flex shrink-0 items-center gap-2">
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setCcOpen((v) => !v)}
          aria-expanded={ccOpen}
          aria-label="Control Center"
          className={cn(
            "flex items-center justify-center rounded-md px-1.5 py-0.5 transition",
            ccOpen
              ? "bg-black/10 dark:bg-white/15"
              : "hover:bg-black/5 dark:hover:bg-white/10"
          )}
        >
          <ControlCenterIcon className="size-3.5" />
        </button>
        <time
          className="tabular-nums text-slate-800/90 dark:text-white/85"
          dateTime={now?.toISOString()}
        >
          {now ? formatClock(now) : "\u00a0"}
        </time>
        <ControlCenter open={ccOpen} onClose={() => setCcOpen(false)} />
      </div>
    </header>
  );
}
