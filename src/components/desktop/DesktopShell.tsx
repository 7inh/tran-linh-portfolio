"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { BootScreen } from "@/components/desktop/BootScreen";
import { DockContainer } from "@/components/desktop/dock-ui";
import { MenuBar } from "@/components/desktop/MenuBar";
import { MediaPlayerProvider } from "@/components/desktop/MediaPlayerContext";
import { ThemeProvider } from "@/components/desktop/ThemeProvider";
import { Wallpaper } from "@/components/desktop/Wallpaper";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Window } from "@/components/window/Window";
import {
  WindowManagerProvider,
  useWindowManager,
} from "@/components/window/WindowManagerContext";
import type { AppId } from "@/data/portfolio";

// "browser" is deliberately absent — it needs a BrowserProvider wrapping both
// its window titleBar and its content, so it's rendered as its own block
// below rather than through this generic per-id map.
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

function useIsMobile(breakpoint = 768) {
  // Always start false so SSR and the first client paint match (avoids hydration mismatch).
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    setReady(true);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return { isMobile, ready };
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function DesktopCanvas() {
  const { focusedId, windows, closeApp, minimizeApp } = useWindowManager();
  const focusedIdRef = useRef(focusedId);
  const windowsRef = useRef(windows);
  const closeAppRef = useRef(closeApp);
  const minimizeAppRef = useRef(minimizeApp);

  // Kept fresh in an effect rather than during render: the shortcut handler is
  // bound once and only reads these from an event, which is always after the
  // latest commit.
  useEffect(() => {
    focusedIdRef.current = focusedId;
    windowsRef.current = windows;
    closeAppRef.current = closeApp;
    minimizeAppRef.current = minimizeApp;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // The menu bar advertises ⌘W and ⌘M, so both have to actually work.
      const key = e.key.toLowerCase();
      const isW = e.code === "KeyW" || key === "w";
      const isM = e.code === "KeyM" || key === "m";
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      if (!isW && !isM) return;
      if (isEditableTarget(e.target)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const id = focusedIdRef.current;
      if (!id) return;
      const win = windowsRef.current[id];
      if (!win?.open || win.minimized) return;
      if (isW) closeAppRef.current(id);
      else minimizeAppRef.current(id);
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden select-none">
      <Wallpaper />
      <MenuBar />
      {(Object.keys(appContent) as AppId[]).map((id) => (
        <Window key={id} id={id}>
          {appContent[id]}
        </Window>
      ))}
      <BrowserProvider>
        <Window id="browser" titleBar={<BrowserToolbar inTitleBar />}>
          <BrowserApp />
        </Window>
      </BrowserProvider>
      <DockContainer />
    </div>
  );
}

export function DesktopShell() {
  const { isMobile, ready } = useIsMobile();

  return (
    <ThemeProvider>
      <MediaPlayerProvider>
        <WindowManagerProvider isMobile={isMobile}>
          {!ready ? (
            <div className="relative h-dvh w-full overflow-hidden">
              <Wallpaper />
            </div>
          ) : isMobile ? (
            <MobileShell />
          ) : (
            <DesktopCanvas />
          )}
        </WindowManagerProvider>
      </MediaPlayerProvider>
      <BootScreen />
    </ThemeProvider>
  );
}
