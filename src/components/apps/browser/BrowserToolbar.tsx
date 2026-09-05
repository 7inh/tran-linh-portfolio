/**
 * Back / forward / reload / home / address bar / open-in-new-tab.
 *
 * `inTitleBar` picks which shell it's dropped into:
 *  - desktop: embedded in the window's own title bar next to the traffic
 *    lights (Window.tsx's `titleBar` slot) — bare fragment, no height/border/
 *    padding of its own, since the title bar row already supplies all of that.
 *  - mobile (default): its own row above the content, exactly as this toolbar
 *    looked before the desktop split — own height, border, background, padding.
 *
 * `data-toolbar` on the wrapper matches the existing `data-traffic` pattern in
 * Window.tsx: its title-bar drag/maximize handlers skip elements under either,
 * so clicking Back doesn't also start dragging the window.
 */
"use client";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Home,
  Lock,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrowser } from "./BrowserContext";

function iconButtonClass(disabled: boolean) {
  return cn(
    "flex size-6 shrink-0 items-center justify-center rounded-full text-foreground transition",
    disabled
      ? "pointer-events-none opacity-30"
      : "hover:bg-black/5 dark:hover:bg-white/10"
  );
}

export function BrowserToolbar({ inTitleBar = false }: { inTitleBar?: boolean }) {
  const {
    committedUrl,
    displayUrl,
    loading,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    reload,
    goHome,
    startEditing,
    setDraft,
    stopEditing,
    submitDraft,
    openInNewTab,
  } = useBrowser();

  return (
    <div
      data-toolbar
      className={cn(
        "flex min-w-0 items-center gap-1",
        inTitleBar
          ? "flex-1"
          : "h-8 shrink-0 border-b border-glass-border/40 bg-glass/50 px-2 dark:bg-glass/25"
      )}
    >
      <button
        type="button"
        onClick={goBack}
        disabled={!canGoBack}
        aria-label="Back"
        className={iconButtonClass(!canGoBack)}
      >
        <ChevronLeft className="size-3.5" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={goForward}
        disabled={!canGoForward}
        aria-label="Forward"
        className={iconButtonClass(!canGoForward)}
      >
        <ChevronRight className="size-3.5" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={reload}
        disabled={committedUrl === null}
        aria-label="Reload"
        className={iconButtonClass(committedUrl === null)}
      >
        <RotateCw className={cn("size-3", loading && "animate-spin")} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={goHome}
        aria-label="Home"
        className={iconButtonClass(false)}
      >
        <Home className="size-3.5" strokeWidth={2.5} />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-glass-border/40 bg-glass/60 px-2.5 py-1 dark:bg-glass/25">
        {committedUrl?.startsWith("https://") ? (
          <Lock className="size-2.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
        ) : (
          <Globe className="size-2.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
        )}
        <input
          value={displayUrl}
          onFocus={startEditing}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={stopEditing}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submitDraft();
              (e.target as HTMLInputElement).blur();
            } else if (e.key === "Escape") {
              stopEditing();
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="Search or enter address"
          className="min-w-0 flex-1 truncate bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <button
        type="button"
        onClick={openInNewTab}
        disabled={committedUrl === null}
        aria-label="Open in new tab"
        className={iconButtonClass(committedUrl === null)}
      >
        <ExternalLink className="size-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}
