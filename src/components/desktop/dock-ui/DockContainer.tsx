/**
 * Main dock container logic
 */
"use client";

import { apps, GAME_APP_IDS, UTILITY_APP_IDS, type AppId } from "@/data/portfolio";
import { useWindowManager } from "@/components/window/WindowManagerContext";
import { cn } from "@/lib/utils";
import { GamesGlyph, UtilitiesGlyph } from "@/components/desktop/Dock";
import { dockGlassPanel } from "./DockConfig";
import { DockItem } from "./DockItem";
import { DockFolder } from "./DockFolder";

export function DockContainer() {
  const { windows, focusedId, bouncingId, openApp } = useWindowManager();

  // Filter apps into categories
  const mainApps = apps.filter(
    (app) =>
      !GAME_APP_IDS.includes(app.id as AppId) && !UTILITY_APP_IDS.includes(app.id as AppId)
  );
  const gameApps = apps.filter((app) => GAME_APP_IDS.includes(app.id as AppId));
  const utilityApps = apps.filter((app) => UTILITY_APP_IDS.includes(app.id as AppId));
  const trashApp = apps.find((app) => app.id === "trash");

  return (
    <div
      className={cn(
        "fixed bottom-3 left-1/2 z-[90] flex h-14 -translate-x-1/2 items-end gap-3 rounded-2xl px-4 pb-5 pt-8",
        dockGlassPanel
      )}
    >
      {/* Main apps */}
      {mainApps.map((app) => (
        <DockItem
          key={app.id}
          id={app.id as AppId}
          label={app.label}
          isOpen={windows[app.id as AppId]?.open || false}
          isFocused={focusedId === app.id && windows[app.id as AppId]?.open && !windows[app.id as AppId]?.minimized}
          isBounce={bouncingId === app.id}
          onClick={() => openApp(app.id as AppId)}
        />
      ))}

      {/* Separator */}
      <div className="h-8 w-px bg-foreground/10" />

      {/* Games folder */}
      <DockFolder
        label="Games"
        icon={<GamesGlyph size="lg" className="size-full rounded-[14px]" />}
        apps={gameApps.map((app) => ({ id: app.id as AppId, label: app.label }))}
        openApp={openApp}
      />

      {/* Utilities folder */}
      <DockFolder
        label="Utilities"
        icon={<UtilitiesGlyph size="lg" className="size-full rounded-[14px]" />}
        apps={utilityApps.map((app) => ({ id: app.id as AppId, label: app.label }))}
        openApp={openApp}
      />

      {/* Separator */}
      <div className="h-8 w-px bg-foreground/10" />

      {/* Trash */}
      {trashApp && (
        <DockItem
          id={trashApp.id as AppId}
          label={trashApp.label}
          isOpen={windows[trashApp.id as AppId]?.open || false}
          isFocused={focusedId === trashApp.id && windows[trashApp.id as AppId]?.open && !windows[trashApp.id as AppId]?.minimized}
          isBounce={bouncingId === trashApp.id}
          onClick={() => openApp(trashApp.id as AppId)}
        />
      )}
    </div>
  );
}
