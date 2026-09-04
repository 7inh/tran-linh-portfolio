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

export function DockItem({
  id,
  label,
  isOpen,
  isFocused,
  isBounce,
  onClick,
}: {
  id: AppId;
  label: string;
  isOpen: boolean;
  isFocused: boolean;
  isBounce: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={dockBtnClass}
      aria-label={label}
    >
      <div
        className={cn(
          dockIconMotion,
          isBounce && "animate-dock-bounce"
        )}
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

      {/* Tooltip */}
      <span className={dockTooltipClass}>{label}</span>
    </button>
  );
}
