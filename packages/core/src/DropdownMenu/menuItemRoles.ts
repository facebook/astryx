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
