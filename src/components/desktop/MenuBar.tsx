"use client";

import { useEffect, useState } from "react";
import { Wifi } from "lucide-react";
import { apps, profile, type AppId } from "@/data/portfolio";
import { useWindowManager } from "@/components/window/WindowManagerContext";
import { useTheme } from "@/components/desktop/ThemeProvider";
import { ControlCenter } from "@/components/desktop/ControlCenter";
import { BananaGlyph } from "@/components/desktop/menu-bar/BananaGlyph";
import { BatteryGlyph } from "@/components/desktop/menu-bar/BatteryGlyph";
import { CalendarPopover } from "@/components/desktop/menu-bar/CalendarPopover";
import {
  MenuBarCheckboxItem,
  MenuBarItem,
  MenuBarMenu,
  MenuBarSeparator,
} from "@/components/desktop/menu-bar/MenuBarMenu";
import { statusItemClass } from "@/components/desktop/menu-bar/MenuBarConfig";
import { useBattery } from "@/components/desktop/menu-bar/useBattery";
import { Menubar } from "@base-ui/react/menubar";
import { cn } from "@/lib/utils";

function ControlCenterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
      aria-hidden
    >
      <path d="M0 0h16v16H0z" fill="none" />
      <path
        fill="currentColor"
        d="M4.5 9a3.5 3.5 0 1 0 0 7h7a3.5 3.5 0 1 0 0-7zm7 6a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5m-7-14a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m2.45 0A3.5 3.5 0 0 1 8 3.5A3.5 3.5 0 0 1 6.95 6h4.55a2.5 2.5 0 0 0 0-5zM4.5 0h7a3.5 3.5 0 1 1 0 7h-7a3.5 3.5 0 1 1 0-7"
      />
    </svg>
  );
}

function formatClock(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MenuBar() {
  const {
    focusedId,
    windows,
    openApp,
    closeApp,
    minimizeApp,
    toggleMaximize,
    focusApp,
  } = useWindowManager();
  const { dark, toggleDark } = useTheme();
  const battery = useBattery();
  const [now, setNow] = useState<Date | null>(null);
  const [ccOpen, setCcOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const focusedApp = focusedId ? apps.find((a) => a.id === focusedId) : null;
  const focusedLive = Boolean(
    focusedId && windows[focusedId]?.open && !windows[focusedId]?.minimized
  );
  // macOS puts the frontmost app here; with nothing focused this is the
  // Finder slot, which is where the portfolio's own name belongs.
  const barTitle = focusedLive && focusedApp ? focusedApp.label : profile.name;
  const noWindow = !focusedLive || !focusedId;
  const openWindows = apps.filter((a) => windows[a.id as AppId]?.open);

  const act = (fn: (id: AppId) => void) => () => {
    if (focusedId && focusedLive) fn(focusedId);
  };

  return (
    <header className="absolute inset-x-0 top-0 z-[100] flex h-6 items-center justify-between bg-white/35 px-2 text-[13px] text-foreground shadow-[0_0.5px_0_rgba(255,255,255,0.4)] backdrop-blur-xl dark:bg-black/45 dark:shadow-[0_0.5px_0_rgba(255,255,255,0.08)]">
      <Menubar className="flex min-w-0 items-center gap-0.5">
        <MenuBarMenu
          title={<BananaGlyph />}
          className="px-1.5"
        >
          <MenuBarItem onClick={() => openApp("about")}>
            About This Portfolio
          </MenuBarItem>
          <MenuBarSeparator />
          <MenuBarCheckboxItem checked={dark} onCheckedChange={toggleDark}>
            Dark Mode
          </MenuBarCheckboxItem>
          <MenuBarSeparator />
          <MenuBarItem disabled>Sleep</MenuBarItem>
          <MenuBarItem disabled>Restart…</MenuBarItem>
          <MenuBarItem disabled>Shut Down…</MenuBarItem>
        </MenuBarMenu>

        <MenuBarMenu title={barTitle} bold>
          <MenuBarItem onClick={() => openApp("about")}>
            About {barTitle}
          </MenuBarItem>
          <MenuBarSeparator />
          <MenuBarItem disabled>Settings…</MenuBarItem>
          <MenuBarSeparator />
          <MenuBarItem
            disabled={noWindow}
            shortcut="⌘W"
            onClick={act(closeApp)}
          >
            Close {focusedLive ? barTitle : "Window"}
          </MenuBarItem>
        </MenuBarMenu>

        <MenuBarMenu title="File">
          <MenuBarItem onClick={() => openApp("notes")}>New Note</MenuBarItem>
          <MenuBarItem onClick={() => openApp("projects")}>
            Open Projects
          </MenuBarItem>
          <MenuBarItem onClick={() => openApp("browser")}>
            Open Browser
          </MenuBarItem>
          <MenuBarSeparator />
          <MenuBarItem
            disabled={noWindow}
            shortcut="⌘W"
            onClick={act(closeApp)}
          >
            Close Window
          </MenuBarItem>
        </MenuBarMenu>

        <MenuBarMenu title="Edit">
          <MenuBarItem disabled shortcut="⌘Z">
            Undo
          </MenuBarItem>
          <MenuBarItem disabled shortcut="⇧⌘Z">
            Redo
          </MenuBarItem>
          <MenuBarSeparator />
          <MenuBarItem disabled shortcut="⌘X">
            Cut
          </MenuBarItem>
          <MenuBarItem disabled shortcut="⌘C">
            Copy
          </MenuBarItem>
          <MenuBarItem disabled shortcut="⌘V">
            Paste
          </MenuBarItem>
          <MenuBarItem disabled shortcut="⌘A">
            Select All
          </MenuBarItem>
        </MenuBarMenu>

        <MenuBarMenu title="View">
          <MenuBarItem disabled={noWindow} onClick={act(toggleMaximize)}>
            Enter Full Screen
          </MenuBarItem>
          <MenuBarSeparator />
          <MenuBarCheckboxItem checked={dark} onCheckedChange={toggleDark}>
            Dark Appearance
          </MenuBarCheckboxItem>
        </MenuBarMenu>

        <MenuBarMenu title="Window">
          <MenuBarItem
            disabled={noWindow}
            shortcut="⌘M"
            onClick={act(minimizeApp)}
          >
            Minimize
          </MenuBarItem>
          <MenuBarItem disabled={noWindow} onClick={act(toggleMaximize)}>
            Zoom
          </MenuBarItem>
          <MenuBarSeparator />
          {openWindows.length === 0 ? (
            <MenuBarItem disabled>No Open Windows</MenuBarItem>
          ) : (
            openWindows.map((a) => (
              <MenuBarItem
                key={a.id}
                checked={focusedLive && focusedId === a.id}
                onClick={() => {
                  if (windows[a.id as AppId]?.minimized) openApp(a.id as AppId);
                  else focusApp(a.id as AppId);
                }}
              >
                {a.label}
              </MenuBarItem>
            ))
          )}
        </MenuBarMenu>

        <MenuBarMenu title="Help">
          <MenuBarItem onClick={() => openApp("about")}>
            Portfolio Help
          </MenuBarItem>
          <MenuBarItem onClick={() => openApp("contact")}>
            Contact {profile.name}
          </MenuBarItem>
        </MenuBarMenu>
      </Menubar>

      <div className="relative flex shrink-0 items-center gap-1">
        <span className={cn(statusItemClass, "gap-1.5")}>
          <BatteryGlyph reading={battery} />
          {battery && (
            <span className="tabular-nums text-[12px] text-foreground/80">
              {Math.round(battery.level * 100)}%
            </span>
          )}
        </span>
        <span className={statusItemClass}>
          <Wifi className="size-[15px]" aria-label="Wi-Fi" />
        </span>
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => {
            setCalendarOpen(false);
            setCcOpen((v) => !v);
          }}
          aria-expanded={ccOpen}
          aria-label="Control Center"
          className={cn(
            statusItemClass,
            ccOpen && "bg-black/[0.14] dark:bg-white/[0.22]"
          )}
        >
          <ControlCenterIcon className="size-[15px]" />
        </button>
        <CalendarPopover
          now={now}
          open={calendarOpen}
          onOpenChange={(next) => {
            if (next) setCcOpen(false);
            setCalendarOpen(next);
          }}
          triggerClassName={cn(
            statusItemClass,
            "tabular-nums text-foreground/85",
            calendarOpen && "bg-black/[0.14] dark:bg-white/[0.22]"
          )}
        >
          <time dateTime={now?.toISOString()}>
            {now ? formatClock(now) : " "}
          </time>
        </CalendarPopover>
        <ControlCenter open={ccOpen} onClose={() => setCcOpen(false)} />
      </div>
    </header>
  );
}
