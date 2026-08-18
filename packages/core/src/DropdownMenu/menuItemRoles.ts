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
