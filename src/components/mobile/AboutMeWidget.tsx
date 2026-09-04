"use client";

import Image from "next/image";
import { profile } from "@/data/portfolio";

export function AboutMeWidget({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open About Me"
      className="w-full rounded-3xl border border-glass-border/50 bg-glass/75 p-4 text-left shadow-[0_8px_28px_var(--glass-shadow)] backdrop-blur-xl transition active:scale-[0.98] dark:border-glass-border/15 dark:bg-glass/55"
    >
      <div className="flex items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border">
          <Image
            src="/brand/avatar-icon.png"
            alt=""
            width={56}
            height={56}
            className="size-full object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            About Me
          </p>
          <p className="truncate text-[17px] font-semibold leading-tight text-foreground">
            {profile.name}
          </p>
          <p className="mt-0.5 truncate text-[12px] font-medium text-primary">
            {profile.role}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-foreground/85">
        {profile.bio}
      </p>
    </button>
  );
}
