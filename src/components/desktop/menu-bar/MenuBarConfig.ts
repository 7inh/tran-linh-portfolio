/**
 * Menu bar styling constants.
 *
 * The bar is 24px like macOS, which is tight: titles and items are sized to sit
 * on that baseline rather than the app-window scale used elsewhere.
 */

/** Menu title in the bar. Base UI puts `data-popup-open` on an open trigger. */
export const menuTitleClass =
  "flex h-[19px] shrink-0 cursor-default items-center rounded-[4px] px-2 leading-none outline-none select-none " +
  "hover:bg-black/[0.08] data-[popup-open]:bg-black/[0.14] " +
  "dark:hover:bg-white/[0.14] dark:data-[popup-open]:bg-white/[0.22]";

/**
 * Dropdown surface. Mirrors the dock's glass recipe but deliberately carries no
 * positioning class — Base UI's Positioner owns placement, and `twMerge` would
 * let a `relative`/`absolute` in here silently override it.
 */
export const menuPopupClass =
  "min-w-[220px] rounded-[8px] border border-white/50 bg-white/80 p-1 text-[13px] text-foreground " +
  "shadow-[0_12px_36px_-8px_rgba(15,23,42,0.45)] backdrop-blur-2xl " +
  "dark:border-white/12 dark:bg-[oklch(0.24_0.03_255)]/85 dark:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.7)]";

/** `group` so the shortcut can invert with the row. */
export const menuItemClass =
  "group flex cursor-default items-center gap-3 rounded-[5px] px-2 py-[5px] leading-none outline-none select-none " +
  "data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground " +
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40";

export const menuSeparatorClass = "mx-2 my-1 h-px border-0 bg-foreground/15";

export const menuShortcutClass =
  "ml-auto pl-6 text-foreground/45 group-data-[highlighted]:text-primary-foreground/75";

/** Fixed leading column so labels line up whether or not a row is ticked. */
export const menuCheckColumnClass =
  "flex w-3 shrink-0 justify-center text-[11px] leading-none";

/** Calendar popover: 7-column month grid. */
export const calendarGridClass =
  "grid grid-cols-7 gap-y-0.5 text-center text-[12px] tabular-nums";

export const calendarWeekdayClass =
  "pb-1 text-[11px] font-semibold text-foreground/45";

export const calendarCellClass =
  "mx-auto flex size-[26px] items-center justify-center rounded-full";

/** Today's disc — the accent already used for highlighted menu rows. */
export const calendarTodayClass = "bg-primary font-semibold text-primary-foreground";

export const calendarNavButtonClass =
  "flex size-6 shrink-0 items-center justify-center rounded text-foreground/70 " +
  "hover:bg-black/[0.08] hover:text-foreground dark:hover:bg-white/[0.14]";

/** Status icons and clock on the right. */
export const statusItemClass =
  "flex h-[19px] shrink-0 cursor-default items-center rounded-[4px] px-1.5 outline-none " +
  "hover:bg-black/[0.08] dark:hover:bg-white/[0.14]";
