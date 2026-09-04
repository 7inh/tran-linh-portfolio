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
import { DOCK_ICON_SIZE, useDockMagnification } from "./useDockMagnification";

/** 1px rule plus its mx-1 margins, i.e. the footprint it actually occupies. */
const SEPARATOR_WIDTH = 9;

export function DockContainer() {
  const { windows, focusedId, bouncingId, openApp } = useWindowManager();

  // Filter apps into categories
  const mainApps = apps.filter(
    (app) =>
      app.id !== "trash" &&
      !GAME_APP_IDS.includes(app.id as AppId) &&
      !UTILITY_APP_IDS.includes(app.id as AppId)
  );
  const gameApps = apps.filter((app) => GAME_APP_IDS.includes(app.id as AppId));
  const utilityApps = apps.filter((app) => UTILITY_APP_IDS.includes(app.id as AppId));
  const trashApp = apps.find((app) => app.id === "trash");

  // Slot order: main apps, separator, Games, Utilities, separator, Trash.
  // Separators occupy a slot so resting centres line up with what's rendered.
  const slotWidths = [
    ...mainApps.map(() => DOCK_ICON_SIZE),
    SEPARATOR_WIDTH,
    DOCK_ICON_SIZE,
    DOCK_ICON_SIZE,
    SEPARATOR_WIDTH,
    ...(trashApp ? [DOCK_ICON_SIZE] : []),
  ];
  const gamesIndex = mainApps.length + 1;
  const utilitiesIndex = gamesIndex + 1;
  const trashIndex = utilitiesIndex + 2;

  const { onMouseEnter, onMouseMove, onMouseLeave, getTransform, settling } =
    useDockMagnification(slotWidths);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        "fixed bottom-2 left-1/2 z-[90] flex -translate-x-1/2 items-end gap-1.5 rounded-[22px] px-2 pb-3.5 pt-2",
        dockGlassPanel
      )}
    >
      {/* Main apps */}
      {mainApps.map((app, index) => (
        <DockItem
          key={app.id}
          id={app.id as AppId}
          label={app.label}
          isOpen={windows[app.id as AppId]?.open || false}
          isFocused={focusedId === app.id && windows[app.id as AppId]?.open && !windows[app.id as AppId]?.minimized}
          isBounce={bouncingId === app.id}
          onClick={() => openApp(app.id as AppId)}
          transform={getTransform(index)}
          settling={settling}
        />
      ))}

      {/* Separator */}
      <div className="mx-1 mb-1 h-11 w-px shrink-0 self-end bg-gradient-to-b from-transparent via-foreground/20 to-transparent" />

      {/* Games folder */}
      <DockFolder
        label="Games"
        icon={<GamesGlyph size="lg" className="size-full rounded-[14px]" />}
        apps={gameApps.map((app) => ({ id: app.id as AppId, label: app.label }))}
        openApp={openApp}
        transform={getTransform(gamesIndex)}
        settling={settling}
      />

      {/* Utilities folder */}
      <DockFolder
        label="Utilities"
        icon={<UtilitiesGlyph size="lg" className="size-full rounded-[14px]" />}
        apps={utilityApps.map((app) => ({ id: app.id as AppId, label: app.label }))}
        openApp={openApp}
        transform={getTransform(utilitiesIndex)}
        settling={settling}
      />

      {/* Separator */}
      <div className="mx-1 mb-1 h-11 w-px shrink-0 self-end bg-gradient-to-b from-transparent via-foreground/20 to-transparent" />

      {/* Trash */}
      {trashApp && (
        <DockItem
          id={trashApp.id as AppId}
          label={trashApp.label}
          isOpen={windows[trashApp.id as AppId]?.open || false}
          isFocused={focusedId === trashApp.id && windows[trashApp.id as AppId]?.open && !windows[trashApp.id as AppId]?.minimized}
          isBounce={bouncingId === trashApp.id}
          onClick={() => openApp(trashApp.id as AppId)}
          transform={getTransform(trashIndex)}
          settling={settling}
        />
      )}
    </div>
  );
}
