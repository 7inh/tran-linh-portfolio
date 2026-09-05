"use client";

import { useState } from "react";
import { Globe, Search } from "lucide-react";
import { useBrowser } from "@/components/apps/browser/BrowserContext";

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

function StartPage({ onNavigate }: { onNavigate: (target: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto px-6 py-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) onNavigate(query);
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
  const { committedUrl, reloadTick, slowHint, handleLoad, go, openInNewTab } =
    useBrowser();

  return (
    <div className="flex h-full min-h-0 flex-col">
      {slowHint && committedUrl && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-glass-border/40 bg-glass/40 px-2.5 py-1 text-[11px] text-muted-foreground">
          <span>This page is taking a while — it may not allow embedding.</span>
          <button
            type="button"
            onClick={openInNewTab}
            className="shrink-0 font-medium text-primary hover:underline"
          >
            Open in new tab
          </button>
        </div>
      )}

      <div className="relative min-h-0 flex-1 bg-white dark:bg-zinc-950">
        {committedUrl === null ? (
          <StartPage onNavigate={go} />
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
