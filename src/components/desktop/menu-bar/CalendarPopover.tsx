/**
 * The calendar behind the menu bar clock — a Notification-Center-style sidebar
 * docked to the right edge of the screen, not a dropdown under the trigger.
 *
 * Built on Base UI's Dialog rather than Popover or Drawer:
 *  - Popover anchors its popup to the trigger via a Positioner. That's right for
 *    a dropdown under the clock, wrong for a panel docked to the screen's own
 *    edge regardless of where the clock sits.
 *  - Drawer looks like the obvious name match, but it's a mobile bottom-sheet
 *    primitive — swipe gestures, snap points as fractions of viewport height, a
 *    virtual-keyboard provider. Forcing a desktop right-edge panel through it
 *    fights its design for machinery this mouse-driven UI doesn't need.
 *  - Dialog fits: no trigger-anchoring, `modal={false}` keeps the desktop
 *    behind it interactive, and (confirmed by reading `dialog/root/
 *    useDialogRoot.mjs`) it uses the exact same `useDismiss` — outside-press and
 *    Escape — that Popover and Menu already use elsewhere in this bar. Its
 *    Popup also carries the same `data-starting-style`/`data-ending-style`
 *    attributes Popover exposes, which is what drives the slide below: a plain
 *    CSS transform transition, with Base UI keeping the popup mounted for the
 *    full duration of each phase, so no settling-flag bookkeeping is needed.
 *
 * The visible month is tracked as an *offset* from `now` rather than as its own
 * Date. That keeps a second `new Date()` out of the component (this bar has a
 * history of hydration mismatches), makes "Today" a reset to 0, and lets the
 * grid stay correct across midnight for free, since `now` already ticks.
 */
"use client";

import { useState, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calendarCellClass,
  calendarGridClass,
  calendarNavButtonClass,
  calendarTodayClass,
  calendarWeekdayClass,
  menuPopupClass,
} from "./MenuBarConfig";
import { WeatherWidget } from "./WeatherWidget";

/**
 * Weeks start on Sunday, matching macOS in its default (US) configuration.
 * `Intl.Locale.prototype.getWeekInfo()` would give the locale's real first day
 * but is still unevenly supported, so this is fixed rather than guessed at.
 */
const WEEK_START = 0;

/** Narrow weekday initials in the viewer's locale, ordered from WEEK_START. */
function weekdayInitials() {
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
  // 2023-01-01 was a Sunday, so this walks a known week.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(2023, 0, 1 + ((WEEK_START + i) % 7)))
  );
}

function buildMonth(year: number, month: number) {
  const leading = (new Date(year, month, 1).getDay() - WEEK_START + 7) % 7;
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(leading).fill(null);
  for (let d = 1; d <= dayCount; d += 1) cells.push(d);
  return cells;
}

function CalendarPanel({ now }: { now: Date }) {
  const [monthOffset, setMonthOffset] = useState(0);

  // Day 1 keeps the arithmetic safe: stepping from e.g. the 31st would skip
  // months that are shorter.
  const shown = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = shown.getFullYear();
  const month = shown.getMonth();
  const cells = buildMonth(year, month);
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-1 px-1">
        <button
          type="button"
          className={calendarNavButtonClass}
          onClick={() => setMonthOffset((o) => o - 1)}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setMonthOffset(0)}
          disabled={monthOffset === 0}
          className="rounded px-1.5 py-0.5 text-[13px] font-semibold tabular-nums disabled:cursor-default enabled:hover:bg-black/[0.08] dark:enabled:hover:bg-white/[0.14]"
          title={monthOffset === 0 ? undefined : "Back to today"}
        >
          {shown.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </button>
        <button
          type="button"
          className={calendarNavButtonClass}
          onClick={() => setMonthOffset((o) => o + 1)}
          aria-label="Next month"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      <div className={calendarGridClass} role="grid">
        {weekdayInitials().map((d, i) => (
          <span key={i} className={calendarWeekdayClass} aria-hidden>
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`b${i}`} />;
          const isToday = isCurrentMonth && day === now.getDate();
          return (
            <span
              key={day}
              className={cn(calendarCellClass, isToday && calendarTodayClass)}
              aria-current={isToday ? "date" : undefined}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarPopover({
  now,
  open,
  onOpenChange,
  children,
  triggerClassName,
}: {
  /** `null` until the clock mounts; the trigger stays inert until then. */
  now: Date | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  triggerClassName?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <Dialog.Trigger
        className={triggerClassName}
        aria-label="Show calendar"
        disabled={!now}
      >
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Popup
          className={cn(
            menuPopupClass,
            // Owns its own width/rounding/padding. Rounded on all four
            // corners — none of its edges are flush against the true screen
            // edge any more (see the inset below), same as Control Center.
            // Background opacity also matches Control Center's own glass
            // recipe (bg-white/30 dark:bg-black/30) rather than
            // menuPopupClass's ~80-85%, which reads as a solid card over a
            // full-height panel.
            "min-w-0 rounded-2xl bg-white/30 dark:bg-black/30",
            // Inset from the menu bar, the bottom of the viewport, and now
            // the right edge too, by the same gap Control Center uses
            // (top-7/right-2) rather than sitting flush against any of them.
            // Above the bar (z-100) and level with Control Center (z-120).
            "fixed top-7 right-2 bottom-2 z-[130] w-[300px] p-3",
            // Slides from the right edge; Base UI keeps the popup mounted for
            // both the entering and exiting phase, so a plain transition on
            // these two data-driven states is enough — no JS-timed settle.
            "transition-transform duration-300 ease-out",
            "data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full"
          )}
        >
          <div className="flex flex-col gap-3">
            {now && <CalendarPanel now={now} />}
            <WeatherWidget />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
