/**
 * Dock configuration: constants, sizing, styling
 */

export const sizeMap = {
  sm: { box: "size-10", px: 40 },
  md: { box: "size-12", px: 48 },
  lg: { box: "size-14", px: 56 },
  xl: { box: "size-16", px: 64 },
} as const;

export const dockBtnClass =
  "group relative z-10 flex h-14 w-14 shrink-0 items-center justify-center overflow-visible border-0 bg-transparent p-0 leading-none outline-none transition-[width] duration-200 ease-out hover:w-[6.125rem] active:w-14";

export const dockIconMotion =
  "block size-14 origin-bottom transition-transform duration-200 ease-out will-change-transform group-hover:-translate-y-3 group-hover:scale-[1.75]";

export const dockTooltipClass =
  "pointer-events-none absolute -top-[6.5rem] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/85 px-3 py-1.5 text-[15px] font-medium leading-none text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-x-[6px] after:border-t-[6px] after:border-x-transparent after:border-t-slate-900/85 after:content-['']";

export const dockGlassPanel =
  "border-glass-border/50 bg-glass/80 shadow-[0_8px_32px_var(--glass-shadow)] backdrop-blur-2xl dark:border-glass-border/10 dark:bg-glass/85";

export const squircleClip = "[clip-path:url(#app-icon-squircle)]";

export const DOCK_BOUNCING_DURATION = 600;
export const DOCK_HEIGHT = 56; // h-14

export const runningIndicatorClass =
  "pointer-events-none absolute left-1/2 top-full mt-1.5 size-1.5 -translate-x-1/2 rounded-full transition-colors";
