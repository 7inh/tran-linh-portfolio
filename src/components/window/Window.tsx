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

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        fill="currentColor"
        d="M19 14V5h-9v2h7v7zM5 10v9h9v-2H7v-7z"
      />
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
      className="group/traffic flex items-center gap-1.5"
      onPointerDown={stop}
      onMouseDown={stop}
      onClick={stop}
      onDoubleClick={stop}
    >
      <button
        type="button"
        aria-label="Close"
        className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] text-black/70 shadow-sm transition hover:brightness-95"
        onPointerDown={stop}
        onMouseDown={stop}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X
          className="h-2 w-2 opacity-0 transition-opacity group-hover/traffic:opacity-100"
          strokeWidth={3}
        />
      </button>
      <button
        type="button"
        aria-label="Minimize"
        className="flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] text-black/70 shadow-sm transition hover:brightness-95 disabled:opacity-40"
        disabled={isMobile}
        onPointerDown={stop}
        onMouseDown={stop}
        onClick={(e) => {
          e.stopPropagation();
          onMinimize();
        }}
      >
        <Minus
          className="h-2 w-2 opacity-0 transition-opacity group-hover/traffic:opacity-100"
          strokeWidth={3}
        />
      </button>
      <button
        type="button"
        aria-label={maximized ? "Restore" : "Zoom"}
        className="flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] text-black/70 shadow-sm transition hover:brightness-95 disabled:opacity-40"
        disabled={isMobile}
        onPointerDown={stop}
        onMouseDown={stop}
        onClick={(e) => {
          e.stopPropagation();
          onZoom();
        }}
      >
        <ExpandIcon
          className={cn(
            "h-2 w-2 opacity-0 transition-opacity group-hover/traffic:opacity-100",
            maximized && "rotate-180"
          )}
        />
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
  const [dragging, setDragging] = useState(false);

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
      const menuBar = 28;
      const dock = 88;
      const maxX = Math.max(0, window.innerWidth - 120);
      const maxY = Math.max(menuBar, window.innerHeight - dock - 40);
      const x = Math.min(maxX, Math.max(0, dragRef.current.origX + dx));
      const y = Math.min(maxY, Math.max(menuBar, dragRef.current.origY + dy));
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

  if (!win.open) return null;

  const style: React.CSSProperties =
    win.maximized || isMobile
      ? {
          top: isMobile ? 28 : 36,
          left: isMobile ? 8 : 16,
          right: isMobile ? 8 : 16,
          bottom: isMobile ? 96 : 100,
          width: "auto",
          height: "auto",
          zIndex: win.zIndex,
        }
      : {
          top: win.position.y,
          left: win.position.x,
          width: meta.defaultSize.width,
          height: meta.defaultSize.height,
          maxWidth: "calc(100vw - 24px)",
          maxHeight: "calc(100dvh - 120px)",
          zIndex: win.zIndex,
        };

  return (
    <div
      role="dialog"
      aria-label={meta.title}
      aria-hidden={win.minimized}
      className={cn(
        "absolute flex flex-col overflow-hidden rounded-xl border border-white/50 bg-white/85 shadow-[0_18px_50px_rgba(15,40,70,0.28)] backdrop-blur-2xl",
        "transition-[opacity,transform] duration-200 ease-out",
        win.minimized
          ? "pointer-events-none scale-[0.2] opacity-0 origin-bottom"
          : "scale-100 opacity-100 animate-window-in",
        isFocused ? "ring-1 ring-black/5" : "opacity-95",
        dragging && "transition-none"
      )}
      style={style}
      onMouseDown={() => {
        if (!win.minimized) focusApp(id);
      }}
    >
      <div
        className={cn(
          "flex h-11 shrink-0 cursor-default items-center gap-3 border-b border-black/5 px-3 select-none",
          !isMobile && !win.maximized && "cursor-grab active:cursor-grabbing"
        )}
        onPointerDown={onPointerDownTitle}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest("[data-traffic]")) return;
          toggleMaximize(id);
        }}
      >
        <TrafficLights
          maximized={win.maximized}
          isMobile={isMobile}
          onClose={() => closeApp(id)}
          onMinimize={() => minimizeApp(id)}
          onZoom={() => toggleMaximize(id)}
        />
        <div
          className={cn(
            "flex-1 truncate text-center text-[13px] font-medium tracking-tight",
            isFocused ? "text-slate-800" : "text-slate-500"
          )}
        >
          {meta.title}
        </div>
        <div className="w-[52px]" aria-hidden />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
