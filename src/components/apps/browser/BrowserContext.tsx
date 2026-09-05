/**
 * Shared navigation state for the Browser app.
 *
 * Split out so the same state can back two separate pieces of UI at once: the
 * toolbar (rendered inside the window's own title bar on desktop, or inline
 * above the content on mobile — see BrowserToolbar.tsx) and the content itself
 * (BrowserApp.tsx, the start page / iframe). Context is what lets both share
 * one instance without threading state through the generic `Window` shell,
 * mirroring the ThemeProvider/MediaPlayerContext pattern already used
 * elsewhere in this app.
 */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

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

interface BrowserContextValue {
  committedUrl: string | null;
  displayUrl: string;
  editing: boolean;
  loading: boolean;
  reloadTick: number;
  slowHint: boolean;
  draft: string;
  setDraft: (value: string) => void;
  startEditing: () => void;
  stopEditing: () => void;
  submitDraft: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  goHome: () => void;
  /** Normalizes `raw` and navigates — the one entry point bookmarks, the
   * address bar, and the start page's search box all funnel through. */
  go: (raw: string) => void;
  openInNewTab: () => void;
  handleLoad: () => void;
}

const BrowserContext = createContext<BrowserContextValue | null>(null);

export function BrowserProvider({ children }: { children: ReactNode }) {
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

  const value: BrowserContextValue = {
    committedUrl,
    displayUrl: editing ? draft : (committedUrl ?? ""),
    editing,
    loading,
    reloadTick,
    slowHint,
    draft,
    setDraft,
    startEditing: () => {
      setEditing(true);
      setDraft(committedUrl ?? "");
    },
    stopEditing: () => setEditing(false),
    submitDraft: () => {
      const target = normalizeInput(draft);
      navigate(target);
    },
    canGoBack: index > 0,
    canGoForward: index < history.length - 1,
    goBack: () => {
      if (index === 0) return;
      setIndex((i) => i - 1);
      setEditing(false);
      setSlowHint(false);
      clearHintTimer();
    },
    goForward: () => {
      if (index === history.length - 1) return;
      setIndex((i) => i + 1);
      setEditing(false);
      setSlowHint(false);
      clearHintTimer();
    },
    reload: () => {
      if (committedUrl === null) return;
      setReloadTick((t) => t + 1);
      setLoading(true);
      setSlowHint(false);
      armHintTimer();
    },
    goHome: () => navigate(null),
    go: (raw: string) => navigate(normalizeInput(raw)),
    openInNewTab: () => {
      if (committedUrl) window.open(committedUrl, "_blank", "noopener,noreferrer");
    },
    handleLoad: () => {
      setLoading(false);
      setSlowHint(false);
      clearHintTimer();
    },
  };

  // Re-created every render deliberately: this context updates on nearly
  // every field on nearly every navigation, so memoizing the object buys
  // little while hiding the real dependency list.
  return (
    <BrowserContext.Provider value={value}>{children}</BrowserContext.Provider>
  );
}

export function useBrowser() {
  const ctx = useContext(BrowserContext);
  if (!ctx) throw new Error("useBrowser must be used within BrowserProvider");
  return ctx;
}
