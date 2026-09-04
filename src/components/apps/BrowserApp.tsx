"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Home,
  Lock,
  RotateCw,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const URL_LIKE = /^https?:\/\//i;
const DOMAIN_LIKE = /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/\S*)?$/i;

/** Bare domain -> https://, plain phrase -> DuckDuckGo (Google/Bing block iframe embedding). */
function normalizeInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (URL_LIKE.test(trimmed)) return trimmed;
  if (!trimmed.includes(" ") && DOMAIN_LIKE.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`;
}

const bookmarks = [
  { label: "Print Photo Service", href: "https://app.noirolab.com/" },
  { label: "Chat Mockup", href: "https://chat-mockup-henna.vercel.app/" },
  {
    label: "Polite Message Rewriter",
    href: "https://polite-message-rewriter.vercel.app/",
  },
  { label: "Cau Truyen", href: "https://cautruyen.vercel.app/" },
  { label: "SubEz", href: "https://subez.vercel.app/" },
  { label: "Wikipedia", href: "https://en.wikipedia.org/wiki/Next.js" },
];

function iconButtonClass(disabled: boolean) {
  return cn(
    "flex size-6 shrink-0 items-center justify-center rounded-full text-foreground transition",
    disabled
      ? "pointer-events-none opacity-30"
      : "hover:bg-black/5 dark:hover:bg-white/10"
  );
}

function StartPage({ onNavigate }: { onNavigate: (target: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto px-6 py-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = normalizeInput(query);
          if (target) onNavigate(target);
        }}
        className="flex w-full max-w-sm items-center gap-2 rounded-full border border-glass-border/40 bg-glass/60 px-4 py-2.5 dark:bg-glass/25"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.25} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or enter address"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </form>

      <div className="mt-10 grid w-full max-w-sm grid-cols-3 gap-4">
        {bookmarks.map((bookmark) => (
          <button
            key={bookmark.href}
            type="button"
            onClick={() => onNavigate(bookmark.href)}
            className="flex flex-col items-center gap-1.5 rounded-lg p-1 text-center outline-none transition hover:opacity-80"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[0.85rem] bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm shadow-black/20">
              <Globe className="size-5" strokeWidth={2.25} />
            </span>
            <span className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground/85">
              {bookmark.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BrowserApp() {
  const [history, setHistory] = useState<(string | null)[]>([null]);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [slowHint, setSlowHint] = useState(false);
  const hintTimerRef = useRef<number | null>(null);

  const committedUrl = history[index];

  const clearHintTimer = () => {
    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  };

  const armHintTimer = () => {
    clearHintTimer();
    hintTimerRef.current = window.setTimeout(() => setSlowHint(true), 4000);
  };

  useEffect(() => clearHintTimer, []);

  const navigate = (target: string | null) => {
    setHistory((prev) => [...prev.slice(0, index + 1), target]);
    setIndex((i) => i + 1);
    setEditing(false);
    setSlowHint(false);
    if (target !== null) {
      setLoading(true);
      armHintTimer();
    }
  };

  const goBack = () => {
    if (index === 0) return;
    setIndex((i) => i - 1);
    setEditing(false);
    setSlowHint(false);
    clearHintTimer();
  };

  const goForward = () => {
    if (index === history.length - 1) return;
    setIndex((i) => i + 1);
    setEditing(false);
    setSlowHint(false);
    clearHintTimer();
  };

  const reload = () => {
    if (committedUrl === null) return;
    setReloadTick((t) => t + 1);
    setLoading(true);
    setSlowHint(false);
    armHintTimer();
  };

  const handleLoad = () => {
    setLoading(false);
    setSlowHint(false);
    clearHintTimer();
  };

  const submitAddress = () => {
    const target = normalizeInput(draft);
    navigate(target);
  };

  const displayUrl = editing ? draft : committedUrl ?? "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-8 shrink-0 items-center gap-1 border-b border-glass-border/40 bg-glass/50 px-2 dark:bg-glass/25">
        <button
          type="button"
          onClick={goBack}
          disabled={index === 0}
          aria-label="Back"
          className={iconButtonClass(index === 0)}
        >
          <ChevronLeft className="size-3.5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={goForward}
          disabled={index === history.length - 1}
          aria-label="Forward"
          className={iconButtonClass(index === history.length - 1)}
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
          onClick={() => navigate(null)}
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
            onFocus={() => {
              setEditing(true);
              setDraft(committedUrl ?? "");
            }}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitAddress();
                (e.target as HTMLInputElement).blur();
              } else if (e.key === "Escape") {
                setEditing(false);
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="Search or enter address"
            className="min-w-0 flex-1 truncate bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            committedUrl && window.open(committedUrl, "_blank", "noopener,noreferrer")
          }
          disabled={committedUrl === null}
          aria-label="Open in new tab"
          className={iconButtonClass(committedUrl === null)}
        >
          <ExternalLink className="size-3" strokeWidth={2.5} />
        </button>
      </div>

      {slowHint && committedUrl && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-glass-border/40 bg-glass/40 px-2.5 py-1 text-[11px] text-muted-foreground">
          <span>This page is taking a while — it may not allow embedding.</span>
          <button
            type="button"
            onClick={() => window.open(committedUrl, "_blank", "noopener,noreferrer")}
            className="shrink-0 font-medium text-primary hover:underline"
          >
            Open in new tab
          </button>
        </div>
      )}

      <div className="relative min-h-0 flex-1 bg-white dark:bg-zinc-950">
        {committedUrl === null ? (
          <StartPage onNavigate={navigate} />
        ) : (
          <iframe
            key={`${committedUrl}-${reloadTick}`}
            title={committedUrl}
            src={committedUrl}
            onLoad={handleLoad}
            className="absolute inset-0 h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            referrerPolicy="no-referrer"
            allow="clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
