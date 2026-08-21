"use client";

import Image from "next/image";
import { profile } from "@/data/portfolio";

export function AboutMeWidget({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open About Me"
      className="w-full rounded-3xl border border-white/50 bg-white/75 p-4 text-left shadow-[0_8px_28px_rgba(15,40,70,0.18)] backdrop-blur-xl transition active:scale-[0.98] dark:border-white/15 dark:bg-zinc-900/55 dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 dark:ring-white/20">
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
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
            About Me
          </p>
          <p className="truncate text-[17px] font-semibold leading-tight text-slate-900 dark:text-white">
            {profile.name}
          </p>
          <p className="mt-0.5 truncate text-[12px] font-medium text-teal-700 dark:text-teal-300">
            {profile.role}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-slate-700 dark:text-white/85">
        {profile.bio}
      </p>
    </button>
  );
}
