/**
 * Reusable folder component for dock (Games/Utilities)
 * Manages dropdown menu and running indicators
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { type AppId } from "@/data/portfolio";
import { useWindowManager } from "@/components/window/WindowManagerContext";
import { cn } from "@/lib/utils";
import { AppGlyph } from "@/components/desktop/Dock";
import {
  dockBtnClass,
  dockIconMotion,
  dockIconSettle,
  dockSlotSettle,
  dockTooltipClass,
  dockGlassPanel,
  runningIndicatorClass,
} from "./DockConfig";
import { DOCK_ICON_SIZE, type DockMagnifyTransform } from "./useDockMagnification";

interface DockApp {
  id: AppId | string;
  label: string;
}

export function DockFolder({
  label,
  icon,
  apps,
  openApp,
  transform,
  settling,
}: {
  label: string;
  icon: ReactNode;
  apps: DockApp[];
  openApp: (id: AppId) => void;
  transform?: DockMagnifyTransform;
  settling?: boolean;
}) {
  const scale = transform?.scale ?? 1;
  const [isOpen, setIsOpen] = useState(false);
  const { windows, focusedId, bouncingId } = useWindowManager();
  const menuRef = useRef<HTMLDivElement>(null);

  const anyOpen = apps.some((app) => windows[app.id as AppId]?.open);
  const anyFocused = apps.some(
    (app) =>
      focusedId === app.id && windows[app.id as AppId]?.open && !windows[app.id as AppId]?.minimized
  );
  const anyBounce = apps.some((app) => bouncingId === app.id);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(dockBtnClass, settling && dockSlotSettle)}
        aria-label={label}
        aria-expanded={isOpen}
        style={{ width: DOCK_ICON_SIZE * scale }}
      >
        <div
          className={cn(
            dockIconMotion,
            settling && dockIconSettle,
            anyBounce && "animate-dock-bounce"
          )}
          style={{ transform: `scale(${scale})` }}
        >
          {icon}
        </div>

        {/* Running indicator dot */}
        <span
          className={cn(
            runningIndicatorClass,
            anyOpen
              ? anyFocused
                ? "bg-foreground"
                : "bg-foreground/70 dark:bg-foreground/50"
              : "bg-transparent"
          )}
        />

        {/* Tooltip — cleared above the magnified icon's top edge */}
        {!isOpen && (
          <span
            className={dockTooltipClass}
            style={{ bottom: DOCK_ICON_SIZE * scale + 12 }}
          >
            {label}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "absolute bottom-[calc(100%+14px)] left-1/2 z-40 min-w-[200px] -translate-x-1/2 animate-window-in rounded-[22px] p-3",
            dockGlassPanel
          )}
          role="menu"
        >
          <div className="grid grid-cols-3 gap-1">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  setIsOpen(false);
                  openApp(app.id as AppId);
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl p-2.5 outline-none transition-colors hover:bg-white/40 dark:hover:bg-white/10"
                role="menuitem"
              >
                <AppGlyph id={app.id as AppId} size="sm" />
                <span className="text-[10px] font-medium text-foreground/75 line-clamp-2 w-12 text-center">
                  {app.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
