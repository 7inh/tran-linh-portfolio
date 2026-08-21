"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AboutApp } from "@/components/apps/AboutApp";
import { ContactApp } from "@/components/apps/ContactApp";
import { ExperienceApp } from "@/components/apps/ExperienceApp";
import { ProjectsApp } from "@/components/apps/ProjectsApp";
import { DesktopIcons } from "@/components/desktop/DesktopIcons";
import { Dock } from "@/components/desktop/Dock";
import { MenuBar } from "@/components/desktop/MenuBar";
import { Wallpaper } from "@/components/desktop/Wallpaper";
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
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
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

      // Consume immediately in capture phase so the browser does not close the tab.
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
      <DesktopIcons />
      {(Object.keys(appContent) as AppId[]).map((id) => (
        <Window key={id} id={id}>
          {appContent[id]}
        </Window>
      ))}
      <Dock />
    </div>
  );
}

export function DesktopShell() {
  const isMobile = useIsMobile();

  return (
    <WindowManagerProvider isMobile={isMobile}>
      <DesktopCanvas />
    </WindowManagerProvider>
  );
}
