"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { Battery, Signal, Wifi, X } from "lucide-react";
import { AboutApp } from "@/components/apps/AboutApp";
import { BrowserApp } from "@/components/apps/BrowserApp";
import { BrowserProvider } from "@/components/apps/browser/BrowserContext";
import { BrowserToolbar } from "@/components/apps/browser/BrowserToolbar";
import { ContactApp } from "@/components/apps/ContactApp";
import { DinoGameApp } from "@/components/apps/DinoGameApp";
import { ExperienceApp } from "@/components/apps/ExperienceApp";
import { MinesweeperApp } from "@/components/apps/MinesweeperApp";
import { NotesApp } from "@/components/apps/NotesApp";
import { ProjectsApp } from "@/components/apps/ProjectsApp";
import { QRCodeApp } from "@/components/apps/QRCodeApp";
import { TrashApp } from "@/components/apps/TrashApp";
import { AppGlyph, squircleClip } from "@/components/desktop/Dock";
import { ControlCenter } from "@/components/desktop/ControlCenter";
import { Wallpaper } from "@/components/desktop/Wallpaper";
import { AboutMeWidget } from "@/components/mobile/AboutMeWidget";
import { Window } from "@/components/window/Window";
import { useWindowManager } from "@/components/window/WindowManagerContext";
import {
  apps,
  GAME_APP_IDS,
  UTILITY_APP_IDS,
  type AppId,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";

// "browser" is deliberately absent — its toolbar and content need to share a
// BrowserProvider, so it's rendered as its own block rather than through this
// generic per-id map (see the JSX below).
const appContent: Partial<Record<AppId, ReactNode>> = {
  about: <AboutApp />,
  projects: <ProjectsApp />,
  experience: <ExperienceApp />,
  contact: <ContactApp />,
  notes: <NotesApp />,
  qrcode: <QRCodeApp />,
  dino: <DinoGameApp />,
  minesweeper: <MinesweeperApp />,
  trash: <TrashApp />,
};

const DOCK_APP_IDS: AppId[] = ["about", "projects", "experience", "contact"];
const GRID_APP_IDS: AppId[] = ["trash", "browser", "notes"];

type FolderId = "games" | "utilities" | null;

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function FolderGlyph({ src, label }: { src: string; label: string }) {
  return (
    <div
      className={cn(
        "relative size-[3.75rem] overflow-hidden shadow-sm shadow-black/25",
        squircleClip
      )}
    >
      <Image
        src={src}
        alt=""
        width={60}
        height={60}
        className="size-full object-cover"
        draggable={false}
        unoptimized
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

function HomeIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl p-1 text-center outline-none transition active:scale-95"
      aria-label={label}
    >
      {children}
      <span className="max-w-[4.5rem] truncate text-[11px] font-medium leading-tight text-white drop-shadow-sm">
        {label}
      </span>
    </button>
  );
}

function DockIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center rounded-2xl p-1 outline-none transition active:scale-90"
      aria-label={label}
    >
      {children}
    </button>
  );
}

export function MobileShell() {
  const { openApp, closeApp, focusedId, windows } = useWindowManager();
  const [now, setNow] = useState<Date | null>(null);
  const [ccOpen, setCcOpen] = useState(false);
  const [folder, setFolder] = useState<FolderId>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const activeAppId =
    focusedId &&
    windows[focusedId]?.open &&
    !windows[focusedId]?.minimized
      ? focusedId
      : (Object.keys(windows) as AppId[]).find(
          (id) => windows[id]?.open && !windows[id]?.minimized
        ) ?? null;

  const appOpen = Boolean(activeAppId);
  const gameApps = apps.filter((a) => GAME_APP_IDS.includes(a.id));
  const utilityApps = apps.filter((a) => UTILITY_APP_IDS.includes(a.id));

  const goHome = () => {
    setFolder(null);
    setCcOpen(false);
    if (activeAppId) closeApp(activeAppId);
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden select-none">
      <Wallpaper />

      {/* Status bar */}
      <header className="absolute inset-x-0 top-0 z-[100] flex h-11 items-center justify-between px-4 pt-[env(safe-area-inset-top)] text-[13px] font-semibold text-white">
        <time
          className="min-w-[3.5rem] tabular-nums drop-shadow-sm"
          dateTime={now?.toISOString()}
        >
          {now ? formatTime(now) : "\u00a0"}
        </time>
        <div className="relative flex items-center gap-1.5 drop-shadow-sm">
          <Signal className="size-3.5" aria-hidden />
          <Wifi className="size-3.5" aria-hidden />
          <Battery className="size-3.5" aria-hidden />
          <button
            type="button"
            onClick={() => setCcOpen((v) => !v)}
            aria-expanded={ccOpen}
            aria-label="Control Center"
            className={cn(
              "ml-1 flex size-7 items-center justify-center rounded-full transition",
              ccOpen ? "bg-white/25" : "bg-white/10 active:bg-white/20"
            )}
          >
            <span className="grid size-3.5 grid-cols-2 gap-0.5">
              <span className="rounded-[1px] bg-white" />
              <span className="rounded-[1px] bg-white" />
              <span className="rounded-[1px] bg-white" />
              <span className="rounded-[1px] bg-white" />
            </span>
          </button>
          <ControlCenter
            open={ccOpen}
            onClose={() => setCcOpen(false)}
            className="right-0 top-10"
          />
        </div>
      </header>

      {/* Home screen */}
      {!appOpen && (
        <>
          <div className="absolute inset-0 z-10 flex flex-col px-5 pb-36 pt-14">
            <div className="shrink-0 py-2">
              <AboutMeWidget onOpen={() => openApp("about")} />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-x-3 gap-y-5 overflow-y-auto py-2">
              <HomeIconButton label="Games" onClick={() => setFolder("games")}>
                <FolderGlyph src="/icons/games.svg" label="Games" />
              </HomeIconButton>
              <HomeIconButton
                label="Utilities"
                onClick={() => setFolder("utilities")}
              >
                <FolderGlyph src="/icons/utilities.svg" label="Utilities" />
              </HomeIconButton>
              {GRID_APP_IDS.map((id) => {
                const app = apps.find((a) => a.id === id)!;
                return (
                  <HomeIconButton
                    key={id}
                    label={app.label}
                    onClick={() => openApp(id)}
                  >
                    <AppGlyph
                      id={id}
                      size="xl"
                      className="size-[3.75rem] rounded-[1.1rem]"
                    />
                  </HomeIconButton>
                );
              })}
            </div>
          </div>

          {/* iOS-style dock */}
          <nav
            aria-label="Dock"
            className="absolute inset-x-3 bottom-8 z-20 mx-auto max-w-md"
          >
            <div className="flex items-center gap-1 rounded-[1.75rem] border border-white/30 bg-white/25 px-2 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-white/15 dark:bg-white/15">
              {DOCK_APP_IDS.map((id) => {
                const app = apps.find((a) => a.id === id)!;
                return (
                  <DockIconButton
                    key={id}
                    label={app.label}
                    onClick={() => openApp(id)}
                  >
                    <AppGlyph
                      id={id}
                      size="xl"
                      className="size-[3.75rem] rounded-[1.1rem]"
                    />
                  </DockIconButton>
                );
              })}
            </div>
          </nav>
        </>
      )}

      {/* Folder overlay */}
      {folder && !appOpen && (
        <div
          className="absolute inset-0 z-40 flex flex-col bg-black/45 px-4 pb-10 pt-16 backdrop-blur-md"
          role="dialog"
          aria-label={folder === "games" ? "Games" : "Utilities"}
          onClick={() => setFolder(null)}
        >
          <div
            className="mx-auto w-full max-w-sm rounded-3xl border border-glass-border/25 bg-glass/20 p-4 shadow-xl backdrop-blur-2xl dark:bg-glass/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-white">
                {folder === "games" ? "Games" : "Utilities"}
              </h2>
              <button
                type="button"
                onClick={() => setFolder(null)}
                className="flex size-7 items-center justify-center rounded-full bg-white/15 text-white"
                aria-label="Close folder"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {folder === "games" &&
                gameApps.map((app) => (
                  <HomeIconButton
                    key={app.id}
                    label={app.label}
                    onClick={() => {
                      setFolder(null);
                      openApp(app.id);
                    }}
                  >
                    <AppGlyph
                      id={app.id}
                      size="xl"
                      className="size-[3.75rem] rounded-[1.1rem]"
                    />
                  </HomeIconButton>
                ))}
              {folder === "utilities" &&
                utilityApps.map((app) => (
                  <HomeIconButton
                    key={app.id}
                    label={app.label}
                    onClick={() => {
                      setFolder(null);
                      openApp(app.id);
                    }}
                  >
                    <AppGlyph
                      id={app.id}
                      size="xl"
                      className="size-[3.75rem] rounded-[1.1rem]"
                    />
                  </HomeIconButton>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Apps */}
      {(Object.keys(appContent) as AppId[]).map((id) => (
        <Window key={id} id={id}>
          {appContent[id]}
        </Window>
      ))}
      <BrowserProvider>
        <Window id="browser">
          <div className="flex h-full min-h-0 flex-col">
            <BrowserToolbar />
            {/* BrowserApp's own root is h-full, so it needs a sized flex-1
                parent slot here — Window's content wrapper already gives it
                one when there's no sibling toolbar to share space with, but
                that's not the case on this, the mobile, layout. */}
            <div className="min-h-0 flex-1">
              <BrowserApp />
            </div>
          </div>
        </Window>
      </BrowserProvider>

      {/* Home indicator — only when an app is open */}
      {appOpen && (
        <button
          type="button"
          onClick={goHome}
          aria-label="Go home"
          className="absolute inset-x-0 bottom-0 z-[110] flex h-8 items-end justify-center pb-2"
        >
          <span className="h-1 w-28 rounded-full bg-white/80 shadow-sm dark:bg-white/70" />
        </button>
      )}
    </div>
  );
}
