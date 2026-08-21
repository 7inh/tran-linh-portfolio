"use client";

import { useState } from "react";
import { ChevronLeft, Film, Globe, Trash2 } from "lucide-react";
import { trashItems, type TrashItem } from "@/data/portfolio";
import { cn } from "@/lib/utils";

function ItemIcon({
  item,
  selected,
}: {
  item: TrashItem;
  selected: boolean;
}) {
  const Icon = item.kind === "Movie" ? Film : Globe;
  return (
    <Icon
      className={cn(
        "size-3.5 shrink-0",
        selected ? "text-white/90" : "text-slate-500 dark:text-zinc-400"
      )}
      strokeWidth={2}
    />
  );
}

export function TrashApp() {
  const [selected, setSelected] = useState<string | null>(
    trashItems[0]?.name ?? null
  );
  const [opened, setOpened] = useState<TrashItem | null>(null);
  const isVideo = opened?.kind === "Movie";

  if (opened) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 flex-col pb-8",
          isVideo
            ? "bg-black text-white"
            : "bg-[#f5f5f7] text-slate-800 dark:bg-zinc-900 dark:text-zinc-100"
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center gap-2 border-b px-3 py-2",
            isVideo
              ? "border-white/10 bg-[#1c1c1e]"
              : "border-slate-200/90 bg-white/70 dark:border-white/10 dark:bg-zinc-800/80"
          )}
        >
          <button
            type="button"
            onClick={() => setOpened(null)}
            className={cn(
              "flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium transition",
              isVideo
                ? "text-[#007aff] hover:bg-white/10"
                : "text-[#007aff] hover:bg-slate-200/70 dark:hover:bg-white/10"
            )}
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
            Trash
          </button>
          <span
            className={cn(
              "min-w-0 truncate text-[12px] font-medium",
              isVideo
                ? "text-white/80"
                : "text-slate-600 dark:text-zinc-300"
            )}
          >
            {opened.name}
          </span>
        </div>
        <div
          className={cn(
            "relative min-h-0 flex-1",
            isVideo ? "bg-black" : "bg-white dark:bg-zinc-950"
          )}
        >
          <iframe
            title={opened.name}
            src={opened.embedUrl}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 bg-[#f5f5f7] text-slate-800 dark:bg-zinc-900 dark:text-zinc-100">
      <aside className="hidden w-40 shrink-0 flex-col border-r border-slate-200/90 bg-[#ececef] px-2 py-3 md:flex dark:border-white/10 dark:bg-zinc-800/90">
        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          Favorites
        </p>
        <div
          className="flex w-full items-center gap-2 rounded-md bg-[#007aff]/15 px-2 py-1.5 text-left text-[12px] font-medium text-slate-900 dark:bg-[#007aff]/25 dark:text-white"
          aria-current="page"
        >
          <Trash2
            className="size-3.5 text-slate-600 dark:text-zinc-300"
            strokeWidth={2}
          />
          Trash
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-8 md:pb-0">
        <div className="flex items-center gap-2 border-b border-slate-200/90 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-zinc-800/70">
          <span className="text-[12px] font-medium text-slate-600 dark:text-zinc-300">
            Trash
          </span>
          <span className="ml-auto text-[11px] tabular-nums text-slate-400 dark:text-zinc-500">
            {trashItems.length} {trashItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div
          className="hidden grid-cols-[minmax(0,1.4fr)_0.7fr_0.5fr_0.6fr] gap-2 border-b border-slate-200/80 bg-white/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 md:grid dark:border-white/10 dark:bg-zinc-800/40 dark:text-zinc-400"
          role="row"
        >
          <span>Name</span>
          <span>Date Deleted</span>
          <span>Size</span>
          <span>Kind</span>
        </div>

        <ul
          className="flex-1 overflow-auto p-1"
          role="listbox"
          aria-label="Trash contents"
        >
          {trashItems.map((item) => {
            const isSelected = selected === item.name;
            return (
              <li key={item.name}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelected(item.name);
                    setOpened(item);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer flex-col gap-0.5 rounded-md px-2 py-2 text-left text-[12px] outline-none transition md:grid md:grid-cols-[minmax(0,1.4fr)_0.7fr_0.5fr_0.6fr] md:gap-2 md:py-1.5",
                    isSelected
                      ? "bg-[#007aff] text-white"
                      : "text-slate-800 hover:bg-slate-200/70 dark:text-zinc-100 dark:hover:bg-white/10"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2 font-medium">
                    <ItemIcon item={item} selected={isSelected} />
                    <span className="min-w-0 truncate">{item.name}</span>
                  </span>
                  <span
                    className={cn(
                      "pl-[1.375rem] text-[11px] md:hidden",
                      isSelected
                        ? "text-white/80"
                        : "text-slate-500 dark:text-zinc-400"
                    )}
                  >
                    {item.kind}
                  </span>
                  <span
                    className={cn(
                      "hidden tabular-nums md:block",
                      isSelected
                        ? "text-white/85"
                        : "text-slate-600 dark:text-zinc-400"
                    )}
                  >
                    {item.dateDeleted}
                  </span>
                  <span
                    className={cn(
                      "hidden tabular-nums md:block",
                      isSelected
                        ? "text-white/85"
                        : "text-slate-600 dark:text-zinc-400"
                    )}
                  >
                    {item.size}
                  </span>
                  <span
                    className={cn(
                      "hidden truncate md:block",
                      isSelected
                        ? "text-white/85"
                        : "text-slate-600 dark:text-zinc-400"
                    )}
                  >
                    {item.kind}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
