/**
 * Single app icon in dock with running indicator and tooltip
 */
import { type AppId } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { AppGlyph } from "@/components/desktop/Dock";
import {
  dockBtnClass,
  dockIconMotion,
  dockTooltipClass,
  runningIndicatorClass,
} from "./DockConfig";
import { DOCK_ICON_SIZE, type DockMagnifyTransform } from "./useDockMagnification";

export function DockItem({
  id,
  label,
  isOpen,
  isFocused,
  isBounce,
  onClick,
  transform,
}: {
  id: AppId;
  label: string;
  isOpen: boolean;
  isFocused: boolean;
  isBounce: boolean;
  onClick: () => void;
  transform?: DockMagnifyTransform;
}) {
  const scale = transform?.scale ?? 1;

  return (
    <button
      type="button"
      onClick={onClick}
      className={dockBtnClass}
      aria-label={label}
      // The slot widens with the icon so neighbours are pushed aside
      // instead of being overlapped.
      style={{ width: DOCK_ICON_SIZE * scale }}
    >
      <div
        className={cn(
          dockIconMotion,
          isBounce && "animate-dock-bounce"
        )}
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <AppGlyph id={id} size="lg" className="size-full rounded-[14px]" />
      </div>

      {/* Running indicator dot */}
      <span
        className={cn(
          runningIndicatorClass,
          isOpen
            ? isFocused
              ? "bg-foreground"
              : "bg-foreground/70 dark:bg-foreground/50"
            : "bg-transparent"
        )}
      />

      {/* Tooltip — cleared above the magnified icon's top edge */}
      <span
        className={dockTooltipClass}
        style={{ bottom: DOCK_ICON_SIZE * scale + 12 }}
      >
        {label}
      </span>
    </button>
  );
}
