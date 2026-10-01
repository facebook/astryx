// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuItemRoles.ts
 * @output Shared menu-item role set + focus selector.
 * @position Internal; used by DropdownMenu and ContextMenu so their
 *   roving-focus, typeahead, and Enter/Space activation stay in sync.
 *
 * Includes the selectable items (menuitemradio/menuitemcheckbox) alongside
 * plain menuitem so checkbox/radio rows are reachable by arrow keys, typeahead,
 * and Enter/Space — not just role="menuitem".
 */

export const MENU_ITEM_ROLES: ReadonlySet<string> = new Set([
  'menuitem',
  'menuitemradio',
  'menuitemcheckbox',
]);

export const MENU_ITEM_SELECTOR: string = [...MENU_ITEM_ROLES]
  .map(role => `[role="${role}"]:not([aria-disabled="true"])`)
  .join(',');

/**
 * Boundary selector for a single menu level. A menu and its submenu flyouts
 * both use `role="menu"`, and flyouts render inline (native popover, not a
 * portal), so a nested menu's items and key events would otherwise be picked
 * up by the parent. Pass this as `useListFocus`'s `boundarySelector` so each
 * level scopes item collection and key handling to its own container.
 */
export const MENU_BOUNDARY_SELECTOR = '[role="menu"]';

/**
 * Marks the label element inside a menu row. Typeahead reads a row's label
 * from this element alone — never its description, shortcut or badge.
 * `Item` stamps it on its label; a custom row can stamp its own.
 */
export const MENU_ITEM_LABEL_ATTR = 'data-astryx-item-label';

/**
 * The text typeahead matches for a menu row: its marked label when it has
 * one, else the row's whole text.
 */
export function getMenuItemLabel(row: HTMLElement): string | null {
  const label = row.querySelector(`[${MENU_ITEM_LABEL_ATTR}]`);
  return (label ?? row).textContent;
}
