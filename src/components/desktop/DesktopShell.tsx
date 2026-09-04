"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AboutApp } from "@/components/apps/AboutApp";
import { BrowserApp } from "@/components/apps/BrowserApp";
import { ContactApp } from "@/components/apps/ContactApp";
import { DinoGameApp } from "@/components/apps/DinoGameApp";
import { ExperienceApp } from "@/components/apps/ExperienceApp";
import { MinesweeperApp } from "@/components/apps/MinesweeperApp";
import { ProjectsApp } from "@/components/apps/ProjectsApp";
import { QRCodeApp } from "@/components/apps/QRCodeApp";
import { TrashApp } from "@/components/apps/TrashApp";
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

const appContent: Record<AppId, ReactNode> = {
  about: <AboutApp />,
  projects: <ProjectsApp />,
  experience: <ExperienceApp />,
  contact: <ContactApp />,
  browser: <BrowserApp />,
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
  const { focusedId, windows, closeApp } = useWindowManager();
  const focusedIdRef = useRef(focusedId);
  const windowsRef = useRef(windows);
  const closeAppRef = useRef(closeApp);

  focusedIdRef.current = focusedId;
  windowsRef.current = windows;
  closeAppRef.current = closeApp;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isW = e.code === "KeyW" || e.key.toLowerCase() === "w";
      if (!(e.ctrlKey || e.metaKey) || !isW || e.altKey || e.shiftKey) return;
      if (isEditableTarget(e.target)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const id = focusedIdRef.current;
      if (!id) return;
      const win = windowsRef.current[id];
      if (!win?.open || win.minimized) return;
      closeAppRef.current(id);
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
    </ThemeProvider>
  );
}
