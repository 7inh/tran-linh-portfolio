"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/portfolio";
import { apps } from "@/data/portfolio";
import { useWindowManager } from "@/components/window/WindowManagerContext";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const focusedApp = focusedId ? apps.find((a) => a.id === focusedId) : null;
  const focusedOpen =
    focusedId && windows[focusedId]?.open && !windows[focusedId]?.minimized;

  return (
    <header className="absolute inset-x-0 top-0 z-[100] flex h-7 items-center justify-between bg-white/35 px-3 text-[12px] text-slate-900 shadow-[0_0.5px_0_rgba(255,255,255,0.4)] backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <span className="font-[family-name:var(--font-display)] text-[13px] font-semibold tracking-tight">
          {profile.name}
        </span>
        <span
          className={cn(
            "truncate font-medium text-slate-700/90 transition-opacity",
            focusedOpen ? "opacity-100" : "opacity-0"
          )}
        >
          {focusedApp?.label}
        </span>
      </div>
      <time
        className="shrink-0 tabular-nums text-slate-800/90"
        dateTime={now?.toISOString()}
      >
        {now ? formatClock(now) : "\u00a0"}
      </time>
    </header>
  );
}
