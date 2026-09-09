"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apps, type AppId } from "@/data/portfolio";

export type WindowState = {
  id: AppId;
  open: boolean;
  /** True only during the close animation's run-out — `open` itself stays
   * true until the timeout below actually unmounts it, so the exit
   * transition has something to animate instead of vanishing instantly. */
  closing: boolean;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
};

/** Kept in sync with the closing-state transition duration in Window.tsx. */
export const CLOSE_ANIMATION_MS = 180;

type WindowManagerContextValue = {
  windows: Record<AppId, WindowState>;
  focusedId: AppId | null;
  bouncingId: AppId | null;
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  moveApp: (id: AppId, position: { x: number; y: number }) => void;
  resizeApp: (
    id: AppId,
    size: { width: number; height: number },
    position?: { x: number; y: number }
  ) => void;
  isMobile: boolean;
};

const WindowManagerContext = createContext<WindowManagerContextValue | null>(
  null
);

function defaultPosition(id: AppId, index: number) {
  const baseX = 80 + index * 36;
  const baseY = 56 + index * 28;
  return { x: baseX, y: baseY };
}

function createInitialWindows(): Record<AppId, WindowState> {
  const record = {} as Record<AppId, WindowState>;
  apps.forEach((app, index) => {
    record[app.id] = {
      id: app.id,
      open: app.id === "about",
      closing: false,
      minimized: false,
      maximized: app.id === "browser",
      zIndex: app.id === "about" ? 30 : 10 + index,
      position: defaultPosition(app.id, index),
      size: { ...app.defaultSize },
    };
  });
  return record;
}

export function WindowManagerProvider({
  children,
  isMobile,
}: {
  children: ReactNode;
  isMobile: boolean;
}) {
  const [windows, setWindows] = useState(createInitialWindows);
  const [focusedId, setFocusedId] = useState<AppId | null>("about");
  const [bouncingId, setBouncingId] = useState<AppId | null>(null);
  const topZRef = useRef(30);
  const didResetMobileHome = useRef(false);
  // Pending "actually unmount" timeouts from closeApp, keyed by id, so a
  // reopen mid-close-animation can cancel the stale one instead of racing it.
  const closeTimeoutsRef = useRef<
    Partial<Record<AppId, ReturnType<typeof setTimeout>>>
  >({});

  useEffect(() => {
    const timeouts = closeTimeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach((t) => t && clearTimeout(t));
    };
  }, []);

  // Mobile OS starts on the home screen (no pre-opened About window).
  useEffect(() => {
    if (!isMobile) {
      didResetMobileHome.current = false;
      return;
    }
    if (didResetMobileHome.current) return;
    didResetMobileHome.current = true;
    setWindows((prev) => {
      const next = { ...prev };
      (Object.keys(next) as AppId[]).forEach((key) => {
        next[key] = {
          ...next[key],
          open: false,
          minimized: false,
          maximized: true,
        };
      });
      return next;
    });
    setFocusedId(null);
  }, [isMobile]);

  const focusApp = useCallback((id: AppId) => {
    topZRef.current += 1;
    const next = topZRef.current;
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], zIndex: next },
    }));
    setFocusedId(id);
  }, []);

  const openApp = useCallback(
    (id: AppId) => {
      // A reopen mid-close-animation should cancel the pending unmount, not
      // race it — otherwise the timeout below can flip a freshly-reopened
      // window back to `open: false` out from under it.
      const pendingClose = closeTimeoutsRef.current[id];
      if (pendingClose) {
        clearTimeout(pendingClose);
        delete closeTimeoutsRef.current[id];
      }

      setWindows((prev) => {
        const current = prev[id];
        const wasClosedOrMin = !current.open || current.minimized;

        if (wasClosedOrMin) {
          queueMicrotask(() => {
            setBouncingId(id);
            window.setTimeout(() => setBouncingId(null), 600);
          });
        }

        const next = { ...prev };
        if (isMobile) {
          (Object.keys(next) as AppId[]).forEach((key) => {
            if (key !== id && next[key].open) {
              next[key] = { ...next[key], minimized: true };
            }
          });
        }

        next[id] = {
          ...next[id],
          open: true,
          closing: false,
          minimized: false,
          maximized: isMobile ? true : next[id].maximized,
        };
        return next;
      });

      topZRef.current += 1;
      const z = topZRef.current;
      setWindows((prev) => ({
        ...prev,
        [id]: { ...prev[id], zIndex: z, minimized: false, open: true },
      }));
      setFocusedId(id);
    },
    [isMobile]
  );

  const closeApp = useCallback((id: AppId) => {
    // Already mid-close — bail rather than stack a second timeout (e.g. a
    // repeated Cmd+W, or the close button double-clicked).
    if (closeTimeoutsRef.current[id]) return;

    // `open` stays true through the animation — Window.tsx only unmounts
    // once it flips to false below — so the exit transition has a mounted
    // node to animate instead of the window vanishing on the same frame.
    setWindows((prev) => {
      if (!prev[id].open || prev[id].closing) return prev;
      return { ...prev, [id]: { ...prev[id], closing: true } };
    });
    setFocusedId((current) => (current === id ? null : current));

    const index = apps.findIndex((a) => a.id === id);
    const app = apps[index];
    const timeout = setTimeout(() => {
      setWindows((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          open: false,
          closing: false,
          minimized: false,
          maximized: false,
          position: defaultPosition(id, index),
          size: { ...app.defaultSize },
        },
      }));
      delete closeTimeoutsRef.current[id];
    }, CLOSE_ANIMATION_MS);
    closeTimeoutsRef.current[id] = timeout;
  }, []);

  const minimizeApp = useCallback((id: AppId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], minimized: true },
    }));
    setFocusedId((current) => (current === id ? null : current));
  }, []);

  const toggleMaximize = useCallback(
    (id: AppId) => {
      if (isMobile) return;
      topZRef.current += 1;
      const z = topZRef.current;
      setWindows((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          maximized: !prev[id].maximized,
          minimized: false,
          zIndex: z,
        },
      }));
      setFocusedId(id);
    },
    [isMobile]
  );

  const moveApp = useCallback((id: AppId, position: { x: number; y: number }) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], position },
    }));
  }, []);

  const resizeApp = useCallback(
    (
      id: AppId,
      size: { width: number; height: number },
      position?: { x: number; y: number }
    ) => {
      setWindows((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          size,
          ...(position ? { position } : {}),
        },
      }));
    },
    []
  );

  const value = useMemo(
    () => ({
      windows,
      focusedId,
      bouncingId,
      openApp,
      closeApp,
      minimizeApp,
      toggleMaximize,
      focusApp,
      moveApp,
      resizeApp,
      isMobile,
    }),
    [
      windows,
      focusedId,
      bouncingId,
      openApp,
      closeApp,
      minimizeApp,
      toggleMaximize,
      focusApp,
      moveApp,
      resizeApp,
      isMobile,
    ]
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) {
    throw new Error("useWindowManager must be used within WindowManagerProvider");
  }
  return ctx;
}
