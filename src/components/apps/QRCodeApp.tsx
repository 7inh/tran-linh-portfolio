"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { profile } from "@/data/portfolio";

export function QRCodeApp() {
  const [text, setText] = useState<string>(profile.contact.github);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      QRCode.toDataURL(trimmed, {
        width: 240,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      })
        .then((url) => {
          if (cancelled) return;
          setDataUrl(url);
          setError(null);
        })
        .catch(() => {
          if (cancelled) return;
          setDataUrl(null);
          setError("Text is too long for a QR code.");
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [text]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <label
          htmlFor="qr-input"
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
        >
          Text or URL
        </label>
        <input
          id="qr-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or a URL"
          className="w-full rounded-lg border border-glass-border/40 bg-glass/60 px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground dark:bg-glass/25"
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-glass-border/40 bg-glass/40 p-4 dark:bg-glass/20">
        {text.trim() && dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="Generated QR code"
            width={200}
            height={200}
            className="size-[200px] rounded-lg bg-white p-2 shadow-sm shadow-black/10"
          />
        ) : (
          <p className="text-center text-[12px] text-muted-foreground">
            {error ?? "Type something above to generate a QR code."}
          </p>
        )}
      </div>

      <a
        href={dataUrl ?? undefined}
        download="qrcode.png"
        aria-disabled={!text.trim() || !dataUrl}
        className="flex h-9 w-full items-center justify-center rounded-lg bg-primary text-[13px] font-medium text-primary-foreground transition hover:bg-primary/80 aria-disabled:pointer-events-none aria-disabled:opacity-40"
      >
        Download PNG
      </a>
    </div>
  );
}
