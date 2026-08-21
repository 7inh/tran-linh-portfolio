"use client";

import { useEffect, useRef } from "react";
import {
  Moon,
  Pause,
  Play,
  Sun,
  Volume2,
} from "lucide-react";
import { useTheme } from "@/components/desktop/ThemeProvider";
import { useMediaPlayer } from "@/components/desktop/MediaPlayerContext";
import { cn } from "@/lib/utils";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ControlCenter({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { dark, toggleDark } = useTheme();
  const {
    playing,
    currentTime,
    duration,
    volume,
    track,
    toggle,
    seek,
    setVolume,
  } = useMediaPlayer();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Control Center"
      className="absolute right-2 top-9 z-[120] w-[320px] rounded-2xl border border-white/40 bg-white/55 p-3 shadow-[0_12px_40px_rgba(15,40,70,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/70"
    >
      <button
        type="button"
        onClick={toggleDark}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border border-white/40 px-3 py-3 text-left transition",
          dark
            ? "bg-zinc-800/90 text-white dark:border-white/10"
            : "bg-white/70 text-slate-900"
        )}
        aria-pressed={dark}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            dark ? "bg-indigo-500 text-white" : "bg-amber-400 text-white"
          )}
        >
          {dark ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </span>
        <span className="flex flex-col">
          <span className="text-[13px] font-semibold">Dark Mode</span>
          <span className="text-[11px] opacity-70">{dark ? "On" : "Off"}</span>
        </span>
      </button>

      <div className="mt-2 rounded-2xl border border-white/40 bg-white/70 p-3 dark:border-white/10 dark:bg-zinc-800/80 dark:text-white">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-sky-400 text-[11px] font-semibold text-white shadow-sm">
            ♪
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{track.title}</p>
            <p className="truncate text-[11px] opacity-60">{track.artist}</p>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
          </button>
        </div>

        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-300/80 accent-slate-900 dark:bg-zinc-600 dark:accent-white"
            aria-label="Seek"
            style={{
              background: `linear-gradient(to right, currentColor ${progress}%, rgba(148,163,184,0.45) ${progress}%)`,
            }}
          />
          <div className="mt-1 flex justify-between text-[10px] tabular-nums opacity-60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Volume2 className="size-3.5 shrink-0 opacity-70" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-300/80 accent-slate-900 dark:bg-zinc-600 dark:accent-white"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
