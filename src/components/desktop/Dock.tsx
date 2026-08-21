"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Globe } from "lucide-react";
import { apps, GAME_APP_IDS, utilityLinks, type AppId } from "@/data/portfolio";
import { useWindowManager } from "@/components/window/WindowManagerContext";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "size-10 rounded-[0.85rem]", px: 40 },
  md: { box: "size-12 rounded-xl", px: 48 },
  lg: { box: "size-14 rounded-[14px]", px: 56 },
  xl: { box: "size-16 rounded-[16px]", px: 64 },
} as const;

const dockBtnClass =
  "group relative z-10 flex h-14 w-14 shrink-0 items-center justify-center overflow-visible border-0 bg-transparent p-0 leading-none outline-none transition-[width] duration-200 ease-out hover:w-[6.125rem] active:w-14";

const dockIconMotion =
  "block size-14 origin-bottom transition-transform duration-200 ease-out will-change-transform group-hover:-translate-y-3 group-hover:scale-[1.75]";

/** Clears 1.75× magnified icon (origin-bottom) + lift. */
const dockTooltipClass =
  "pointer-events-none absolute -top-[6.5rem] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/85 px-3 py-1.5 text-[15px] font-medium leading-none text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-x-[6px] after:border-t-[6px] after:border-x-transparent after:border-t-slate-900/85 after:content-['']";

export function AppGlyph({
  id,
  size = "md",
  className,
}: {
  id: AppId;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const { box, px } = sizeMap[size];
  const transparent = id === "trash";

  return (
    <div
      className={cn(
        "relative shrink-0",
        transparent
          ? "overflow-visible bg-transparent shadow-none"
          : "overflow-hidden shadow-sm shadow-black/20",
        className ?? box
      )}
    >
      <Image
        src={`/icons/${id}.png`}
        alt=""
        width={px}
        height={px}
        className={cn(
          "block size-full",
          transparent
            ? "origin-center scale-100 object-contain drop-shadow-sm"
            : "object-cover"
        )}
        draggable={false}
        priority
        unoptimized
      />
    </div>
  );
}

function GamesGlyph({
  size = "lg",
  className,
}: {
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const { box, px } = sizeMap[size];
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden shadow-sm shadow-black/20",
        className ?? box
      )}
    >
      <Image
        src="/icons/games.png"
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

function UtilitiesGlyph({
  size = "lg",
  className,
}: {
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const { box, px } = sizeMap[size];
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden shadow-sm shadow-black/20",
        className ?? box
      )}
    >
      <Image
        src="/icons/utilities.png"
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

function DockItem({ id }: { id: AppId }) {
  const { openApp, windows, bouncingId, focusedId } = useWindowManager();
  const app = apps.find((a) => a.id === id)!;
  const isOpen = windows[id].open;
  const isMin = windows[id].minimized;
  const isBounce = bouncingId === id;
  const isFocused = focusedId === id && isOpen && !isMin;

  return (
    <button
      type="button"
      onClick={() => openApp(id)}
      className={cn(dockBtnClass, isBounce && "animate-dock-bounce")}
      aria-label={`Open ${app.label}`}
    >
      <span className={dockIconMotion}>
        <AppGlyph id={id} size="lg" className="size-full rounded-[14px]" />
      </span>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-full mt-1.5 size-1.5 -translate-x-1/2 rounded-full transition-colors",
          isOpen ? (isFocused ? "bg-slate-900 dark:bg-white" : "bg-slate-800/70 dark:bg-white/50") : "bg-transparent"
        )}
      />
      <span className={dockTooltipClass}>{app.label}</span>
    </button>
  );
}

function GamesDockItem() {
  const { openApp, windows, bouncingId, focusedId } = useWindowManager();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const gameApps = apps.filter((a) => GAME_APP_IDS.includes(a.id));
  const anyOpen = GAME_APP_IDS.some((id) => windows[id]?.open);
  const anyFocused = GAME_APP_IDS.some(
    (id) => focusedId === id && windows[id]?.open && !windows[id]?.minimized
  );
  const anyBounce = GAME_APP_IDS.some((id) => bouncingId === id);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative overflow-visible">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(dockBtnClass, anyBounce && "animate-dock-bounce")}
        aria-label="Games"
      >
        <span className={dockIconMotion}>
          <GamesGlyph size="lg" className="size-full rounded-[14px]" />
        </span>
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-1/2 top-full mt-1.5 size-1.5 -translate-x-1/2 rounded-full transition-colors",
            anyOpen
              ? anyFocused
                ? "bg-slate-900 dark:bg-white"
                : "bg-slate-800/70 dark:bg-white/50"
              : "bg-transparent"
          )}
        />
        {!open && (
          <span className={dockTooltipClass}>Games</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Games"
          className="absolute bottom-[calc(100%+14px)] left-1/2 z-[100] min-w-[200px] -translate-x-1/2 rounded-xl border border-white/50 bg-white/80 p-1.5 shadow-[0_8px_32px_rgba(20,50,80,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/85"
        >
          {gameApps.map((app) => (
            <button
              key={app.id}
              type="button"
              role="menuitem"
              onClick={() => {
                openApp(app.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] font-medium text-slate-800 transition hover:bg-white/90 dark:text-white dark:hover:bg-white/10"
            >
              <AppGlyph id={app.id} size="sm" />
              <span>{app.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UtilitiesDockItem() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative overflow-visible">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={dockBtnClass}
        aria-label="Utilities"
      >
        <span className={dockIconMotion}>
          <UtilitiesGlyph size="lg" className="size-full rounded-[14px]" />
        </span>
        {!open && (
          <span className={dockTooltipClass}>Utilities</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Utilities"
          className="absolute bottom-[calc(100%+14px)] left-1/2 z-[100] min-w-[220px] -translate-x-1/2 rounded-xl border border-white/50 bg-white/80 p-1.5 shadow-[0_8px_32px_rgba(20,50,80,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/85"
        >
          {utilityLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              role="menuitem"
              onClick={() => {
                window.open(link.href, "_blank", "noopener,noreferrer");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] font-medium text-slate-800 transition hover:bg-white/90 dark:text-white dark:hover:bg-white/10"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[0.85rem] bg-gradient-to-br from-sky-400 to-teal-600 text-white shadow-sm shadow-black/20">
                <Globe className="size-5" strokeWidth={2.25} />
              </span>
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dock() {
  const mainApps = apps.filter(
    (app) => app.id !== "trash" && !GAME_APP_IDS.includes(app.id)
  );
  const trashApp = apps.find((app) => app.id === "trash");

  return (
    <nav
      aria-label="Dock"
      className="absolute bottom-3 left-1/2 z-[90] -translate-x-1/2 overflow-visible"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 top-4 rounded-2xl border border-white/50 bg-white/30 shadow-[0_8px_32px_rgba(20,50,80,0.25)] backdrop-blur-2xl dark:border-white/15 dark:bg-zinc-900/45 dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
      />
      <div className="relative flex items-end gap-3 overflow-visible px-4 pb-5 pt-8">
        {mainApps.map((app) => (
          <DockItem key={app.id} id={app.id} />
        ))}
        <GamesDockItem />
        <UtilitiesDockItem />
        {trashApp && (
          <>
            <span
              aria-hidden
              className="mx-0.5 mb-2 h-10 w-px shrink-0 self-end bg-slate-900/20 dark:bg-white/20"
            />
            <DockItem id="trash" />
          </>
        )}
      </div>
    </nav>
  );
}
