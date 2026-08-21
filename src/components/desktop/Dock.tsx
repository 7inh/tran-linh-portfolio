"use client";

import Image from "next/image";
import { apps, type AppId } from "@/data/portfolio";
import { useWindowManager } from "@/components/window/WindowManagerContext";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "size-10 rounded-[0.85rem]", px: 40 },
  md: { box: "size-12 rounded-xl", px: 48 },
  lg: { box: "size-14 rounded-[14px]", px: 56 },
} as const;

export function AppGlyph({
  id,
  size = "md",
}: {
  id: AppId;
  size?: keyof typeof sizeMap;
}) {
  const { box, px } = sizeMap[size];

  return (
    <div className={cn("relative shrink-0 overflow-hidden shadow-sm shadow-black/20", box)}>
      <Image
        src={`/icons/${id}.png`}
        alt=""
        width={px}
        height={px}
        className="block size-full object-cover"
        draggable={false}
        priority
        unoptimized
      />
    </div>
  );
}

export function Dock() {
  const { openApp, windows, bouncingId, focusedId } = useWindowManager();

  return (
    <nav
      aria-label="Dock"
      className="absolute bottom-3 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/50 bg-white/30 px-4 pb-5 pt-4 shadow-[0_8px_32px_rgba(20,50,80,0.25)] backdrop-blur-2xl"
    >
      {apps.map((app) => {
        const isOpen = windows[app.id].open;
        const isMin = windows[app.id].minimized;
        const isBounce = bouncingId === app.id;
        const isFocused = focusedId === app.id && isOpen && !isMin;

        return (
          <button
            key={app.id}
            type="button"
            onClick={() => openApp(app.id)}
            className={cn(
              "group relative flex size-14 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none outline-none",
              isBounce && "animate-dock-bounce"
            )}
            aria-label={`Open ${app.label}`}
          >
            <span className="block transition-transform duration-150 group-hover:-translate-y-1.5 group-active:scale-95">
              <AppGlyph id={app.id} size="lg" />
            </span>
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute left-1/2 top-full mt-1.5 size-1.5 -translate-x-1/2 rounded-full transition-colors",
                isOpen ? (isFocused ? "bg-slate-900" : "bg-slate-800/70") : "bg-transparent"
              )}
            />
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/85 px-2 py-0.5 text-[11px] leading-none text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              {app.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
