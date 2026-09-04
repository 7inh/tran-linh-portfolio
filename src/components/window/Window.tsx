"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Minus, X } from "lucide-react";
import { apps, type AppId } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { useWindowManager } from "./WindowManagerContext";

type WindowProps = {
  id: AppId;
  children: ReactNode;
};

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;
const MENU_BAR = 28;
const DOCK = 88;
const SIDE_PAD = 8;

const RESIZE_HANDLES: {
  edge: ResizeEdge;
  className: string;
  cursor: string;
}[] = [
  { edge: "n", className: "left-2 right-2 top-0 h-2", cursor: "ns-resize" },
  { edge: "s", className: "left-2 right-2 bottom-0 h-2", cursor: "ns-resize" },
  { edge: "e", className: "top-2 bottom-2 right-0 w-2", cursor: "ew-resize" },
  { edge: "w", className: "top-2 bottom-2 left-0 w-2", cursor: "ew-resize" },
  { edge: "ne", className: "right-0 top-0 size-3", cursor: "nesw-resize" },
  { edge: "nw", className: "left-0 top-0 size-3", cursor: "nwse-resize" },
  { edge: "se", className: "right-0 bottom-0 size-3", cursor: "nwse-resize" },
  { edge: "sw", className: "left-0 bottom-0 size-3", cursor: "nesw-resize" },
];

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <g transform="rotate(45 12 12)">
        <path fill="currentColor" d="m10 6l-6 6l6 6zm4 12l6-6l-6-6z" />
      </g>
    </svg>
  );
}

function CollapseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <g transform="rotate(45 12 12)">
        <path fill="currentColor" d="m4 6l6 6l-6 6zm16 12l-6-6l6-6z" />
      </g>
    </svg>
  );
}

function TrafficLights({
  maximized,
  isMobile,
  onClose,
  onMinimize,
  onZoom,
}: {
  maximized: boolean;
  isMobile: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onZoom: () => void;
}) {
  const stop = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      data-traffic
      className="group/traffic flex items-center gap-2"
      onPointerDown={stop}
      onMouseDown={stop}
      onClick={stop}
      onDoubleClick={stop}
    >
      <button
        type="button"
        aria-label="Close"
        className="flex size-3.5 items-center justify-center rounded-full bg-[#ff5f57] text-black/70 shadow-sm transition hover:brightness-95"
        onPointerDown={stop}
        onMouseDown={stop}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X
          className="size-3 opacity-0 transition-opacity group-hover/traffic:opacity-100"
          strokeWidth={3}
        />
      </button>
      <button
        type="button"
        aria-label="Minimize"
        className="flex size-3.5 items-center justify-center rounded-full bg-[#febc2e] text-black/70 shadow-sm transition hover:brightness-95 disabled:opacity-40"
        disabled={isMobile}
        onPointerDown={stop}
        onMouseDown={stop}
        onClick={(e) => {
          e.stopPropagation();
          onMinimize();
        }}
      >
        <Minus
          className="size-3 opacity-0 transition-opacity group-hover/traffic:opacity-100"
          strokeWidth={3}
        />
      </button>
      <button
        type="button"
        aria-label={maximized ? "Restore" : "Zoom"}
        className="flex size-3.5 items-center justify-center rounded-full bg-[#28c840] text-black/70 shadow-sm transition hover:brightness-95 disabled:opacity-40"
        disabled={isMobile}
        onPointerDown={stop}
        onMouseDown={stop}
        onClick={(e) => {
          e.stopPropagation();
          onZoom();
        }}
      >
        {maximized ? (
          <CollapseIcon className="size-3 opacity-0 transition-opacity group-hover/traffic:opacity-100" />
        ) : (
          <ExpandIcon className="size-3 opacity-0 transition-opacity group-hover/traffic:opacity-100" />
        )}
      </button>
    </div>
  );
}

export function Window({ id, children }: WindowProps) {
  const {
    windows,
    focusedId,
    closeApp,
    minimizeApp,
    toggleMaximize,
    focusApp,
    moveApp,
    resizeApp,
    isMobile,
  } = useWindowManager();

  const win = windows[id];
  const meta = apps.find((a) => a.id === id)!;
  const isFocused = focusedId === id;
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const resizeRef = useRef<{
    edge: ResizeEdge;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const onPointerDownTitle = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile || win.maximized) return;
      if ((e.target as HTMLElement).closest("[data-traffic]")) return;
      focusApp(id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: win.position.x,
        origY: win.position.y,
      };
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [focusApp, id, isMobile, win.maximized, win.position.x, win.position.y]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const maxX = Math.max(0, window.innerWidth - 120);
      const maxY = Math.max(MENU_BAR, window.innerHeight - DOCK - 40);
      const x = Math.min(maxX, Math.max(0, dragRef.current.origX + dx));
      const y = Math.min(maxY, Math.max(MENU_BAR, dragRef.current.origY + dy));
      moveApp(id, { x, y });
    },
    [id, moveApp]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const onResizePointerDown = useCallback(
    (edge: ResizeEdge) => (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      focusApp(id);
      resizeRef.current = {
        edge,
        startX: e.clientX,
        startY: e.clientY,
        origX: win.position.x,
        origY: win.position.y,
        origW: win.size.width,
        origH: win.size.height,
      };
      setResizing(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [focusApp, id, win.position.x, win.position.y, win.size.height, win.size.width]
  );

  const onResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const active = resizeRef.current;
      if (!active) return;

      const dx = e.clientX - active.startX;
      const dy = e.clientY - active.startY;
      const { edge, origX, origY, origW, origH } = active;

      const maxW = Math.max(MIN_WIDTH, window.innerWidth - SIDE_PAD * 2);
      const maxH = Math.max(
        MIN_HEIGHT,
        window.innerHeight - MENU_BAR - DOCK - SIDE_PAD
      );

      let x = origX;
      let y = origY;
      let w = origW;
      let h = origH;

      if (edge.includes("e")) {
        w = Math.min(maxW, Math.max(MIN_WIDTH, origW + dx));
        w = Math.min(w, window.innerWidth - SIDE_PAD - origX);
      }
      if (edge.includes("s")) {
        h = Math.min(maxH, Math.max(MIN_HEIGHT, origH + dy));
        h = Math.min(h, window.innerHeight - DOCK - SIDE_PAD - origY);
      }
      if (edge.includes("w")) {
        const nextW = Math.min(maxW, Math.max(MIN_WIDTH, origW - dx));
        const right = origX + origW;
        x = Math.min(right - MIN_WIDTH, Math.max(SIDE_PAD, right - nextW));
        w = right - x;
      }
      if (edge.includes("n")) {
        const nextH = Math.min(maxH, Math.max(MIN_HEIGHT, origH - dy));
        const bottom = origY + origH;
        y = Math.min(
          bottom - MIN_HEIGHT,
          Math.max(MENU_BAR, bottom - nextH)
        );
        h = bottom - y;
      }

      const needsPosition =
        edge.includes("w") || edge.includes("n");
      resizeApp(
        id,
        { width: Math.round(w), height: Math.round(h) },
        needsPosition ? { x: Math.round(x), y: Math.round(y) } : undefined
      );
    },
    [id, resizeApp]
  );

  const onResizePointerUp = useCallback((e: React.PointerEvent) => {
    resizeRef.current = null;
    setResizing(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  if (!win.open) return null;

  const style: React.CSSProperties =
    win.maximized || isMobile
      ? isMobile
        ? {
            top: 44,
            left: 0,
            right: 0,
            bottom: 0,
            width: "auto",
            height: "auto",
            zIndex: win.zIndex,
            borderRadius: 0,
          }
        : {
            top: 36,
            left: 16,
            right: 16,
            bottom: 100,
            width: "auto",
            height: "auto",
            zIndex: win.zIndex,
          }
      : {
          top: win.position.y,
          left: win.position.x,
          width: win.size.width,
          height: win.size.height,
          maxWidth: "calc(100vw - 24px)",
          maxHeight: "calc(100dvh - 120px)",
          zIndex: win.zIndex,
        };

  const showResize =
    !isMobile && !win.maximized && !win.minimized;

  return (
    <div
      role="dialog"
      aria-label={meta.title}
      aria-hidden={win.minimized}
      className={cn(
        "absolute flex flex-col overflow-hidden border border-glass-border/50 bg-glass/85 shadow-[0_18px_50px_var(--glass-shadow)] backdrop-blur-2xl dark:border-glass-border/10 dark:bg-glass/90",
        isMobile ? "rounded-none border-x-0 border-t-0" : "rounded-xl",
        "transition-[opacity,transform] duration-200 ease-out",
        win.minimized
          ? "pointer-events-none scale-[0.2] opacity-0 origin-bottom"
          : cn(
              "scale-100 opacity-100 animate-window-in",
              isFocused
                ? "ring-1 ring-black/5 dark:ring-white/10"
                : "opacity-95"
            ),
        (dragging || resizing) && "transition-none"
      )}
      style={style}
      onMouseDown={() => {
        if (!win.minimized) focusApp(id);
      }}
    >
      <div
        className={cn(
          "flex h-11 shrink-0 cursor-default items-center gap-3 border-b border-black/5 px-3 select-none dark:border-white/10",
          !isMobile && !win.maximized && "cursor-grab active:cursor-grabbing"
        )}
        onPointerDown={onPointerDownTitle}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={(e) => {
          if (isMobile) return;
          if ((e.target as HTMLElement).closest("[data-traffic]")) return;
          toggleMaximize(id);
        }}
      >
        {isMobile ? (
          <button
            type="button"
            aria-label="Close"
            className="flex h-7 items-center rounded-full bg-black/5 px-2.5 text-[12px] font-medium text-foreground/90 dark:bg-white/10"
            onClick={() => closeApp(id)}
          >
            Done
          </button>
        ) : (
          <TrafficLights
            maximized={win.maximized}
            isMobile={isMobile}
            onClose={() => closeApp(id)}
            onMinimize={() => minimizeApp(id)}
            onZoom={() => toggleMaximize(id)}
          />
        )}
        <div
          className={cn(
            "flex-1 truncate text-center text-[13px] font-medium tracking-tight",
            isFocused
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {meta.title}
        </div>
        <div className={cn(isMobile ? "w-[52px]" : "w-[58px]")} aria-hidden />
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden bg-transparent dark:bg-glass/40",
          isMobile && "pb-8"
        )}
      >
        {children}
      </div>

      {showResize &&
        RESIZE_HANDLES.map(({ edge, className, cursor }) => (
          <div
            key={edge}
            role="separator"
            aria-orientation={
              edge === "n" || edge === "s"
                ? "horizontal"
                : edge === "e" || edge === "w"
                  ? "vertical"
                  : undefined
            }
            aria-label={`Resize ${edge}`}
            className={cn("absolute z-20", className)}
            style={{ cursor }}
            onPointerDown={onResizePointerDown(edge)}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
          />
        ))}
    </div>
  );
}
