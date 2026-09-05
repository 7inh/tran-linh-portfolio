/**
 * One menu in the bar: a title plus its dropdown.
 *
 * Built on Base UI's Menu (already this project's primitive layer — see
 * `src/components/ui/*`). Inside a `Menubar` this gives the macOS behaviour for
 * free: click a title to open, then hovering another title switches straight to
 * it, plus arrow-key navigation, typeahead, and Escape / outside-click
 * dismissal. None of that is hand-rolled here.
 */
"use client";

import type { ReactNode } from "react";
import { Menu } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";
import {
  menuCheckColumnClass,
  menuItemClass,
  menuPopupClass,
  menuSeparatorClass,
  menuShortcutClass,
  menuTitleClass,
} from "./MenuBarConfig";

export function MenuBarMenu({
  title,
  bold,
  children,
  className,
}: {
  /** Rendered in the bar. A node so the banana can occupy the same slot. */
  title: ReactNode;
  bold?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(menuTitleClass, bold && "font-semibold", className)}
      >
        {title}
      </Menu.Trigger>
      <Menu.Portal>
        {/* Above the bar (z-100) and Control Center (z-120). */}
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={3}
          alignOffset={-6}
          className="z-[130]"
        >
          <Menu.Popup className={menuPopupClass}>{children}</Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function MenuBarItem({
  children,
  shortcut,
  disabled,
  onClick,
  /** Renders a tick column; `undefined` means this row has no tick. */
  checked,
}: {
  children: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  checked?: boolean;
}) {
  return (
    <Menu.Item
      className={menuItemClass}
      disabled={disabled}
      onClick={onClick}
    >
      {checked !== undefined && (
        <span className={menuCheckColumnClass}>{checked ? "✓" : ""}</span>
      )}
      <span className="truncate">{children}</span>
      {shortcut && <span className={menuShortcutClass}>{shortcut}</span>}
    </Menu.Item>
  );
}

export function MenuBarCheckboxItem({
  children,
  checked,
  onCheckedChange,
}: {
  children: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Menu.CheckboxItem
      className={menuItemClass}
      checked={checked}
      onCheckedChange={onCheckedChange}
    >
      <span className={menuCheckColumnClass}>
        <Menu.CheckboxItemIndicator>✓</Menu.CheckboxItemIndicator>
      </span>
      <span className="truncate">{children}</span>
    </Menu.CheckboxItem>
  );
}

export function MenuBarSeparator() {
  return <Menu.Separator className={menuSeparatorClass} />;
}
