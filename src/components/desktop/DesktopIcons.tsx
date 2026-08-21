"use client";

import { apps } from "@/data/portfolio";
import { useWindowManager } from "@/components/window/WindowManagerContext";
import { AppGlyph } from "./Dock";

export function DesktopIcons() {
  const { openApp } = useWindowManager();

  return (
    <div
      className="absolute top-10 right-3 z-20 flex flex-col items-end gap-4 sm:right-6 sm:top-12 sm:gap-5"
      aria-label="Desktop icons"
    >
      {apps.map((app) => (
        <button
          key={app.id}
          type="button"
          className="group flex w-[76px] cursor-pointer flex-col items-center gap-1.5 rounded-lg p-1.5 text-center outline-none transition hover:bg-white/20 focus-visible:bg-white/25 active:bg-white/30"
          onClick={() => openApp(app.id)}
          aria-label={`Open ${app.label}`}
        >
          <AppGlyph id={app.id} size="md" />
          <span className="max-w-full truncate rounded px-1 text-[11px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,40,60,0.55)]">
            {app.label}
          </span>
        </button>
      ))}
    </div>
  );
}
