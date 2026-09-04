/**
 * Dock configuration: constants, sizing, styling
 */

export const sizeMap = {
  sm: { box: "size-10", px: 40 },
  md: { box: "size-12", px: 48 },
  lg: { box: "size-14", px: 56 },
  xl: { box: "size-16", px: 64 },
} as const;

/**
 * Width is set inline per-frame by magnification, so no fixed w-* here.
 * Its transition must match dockIconMotion's exactly — the slot and the
 * icon inside it have to move as one, or the dock's width visibly lags
 * behind the icons and the whole row judders.
 */
export const dockBtnClass =
  "group relative z-10 flex h-14 shrink-0 items-end justify-center overflow-visible border-0 bg-transparent p-0 leading-none outline-none transition-[width] duration-150 ease-out will-change-[width]";

export const dockIconMotion =
  "block size-14 origin-bottom transition-transform duration-150 ease-out will-change-transform";

/** Sits above the magnified icon; `bottom` is set inline from the scale. */
export const dockTooltipClass =
  "pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-black/55 px-2.5 py-1 text-[12px] font-medium leading-none tracking-tight text-white opacity-0 shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[opacity,bottom] duration-150 ease-out group-hover:opacity-100";

export const dockGlassPanel =
  "isolate border border-white/50 bg-white/30 shadow-[0_14px_36px_-10px_rgba(15,23,42,0.5),inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-2xl dark:border-white/15 dark:bg-black/30 dark:shadow-[0_14px_36px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.12)]";

export const squircleClip = "[clip-path:url(#app-icon-squircle)]";

export const DOCK_BOUNCING_DURATION = 600;
export const DOCK_HEIGHT = 56; // h-14

export const runningIndicatorClass =
  "pointer-events-none absolute left-1/2 top-full mt-1.5 size-[5px] -translate-x-1/2 rounded-full transition-all duration-200";
