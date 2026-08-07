// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports DropdownMenu, DropdownMenuItem and related types
 * @position Public API entry point
 *
 * SYNC: The item components below are re-exported (aliased) by the other menu
 * surfaces that reuse the DropdownMenu item pipeline. When you add or remove an
 * item component here, mirror it in:
 * - /packages/core/src/ContextMenu/index.ts        (ContextMenu* aliases)
 * - /packages/core/src/Breadcrumbs/index.ts        (BreadcrumbMenu* aliases)
 * Those surfaces render menu items through the same renderDropdownItems +
 * DropdownMenuContext + useListFocus path, so a new item type (e.g. a submenu)
 * only shows up in their public API once it's aliased there too.
 */

export {
  DropdownMenu,
  type DropdownMenuProps,
  type DropdownMenuButtonProps,
  type DropdownMenuItemData,
  type DropdownMenuDivider,
  type DropdownMenuSection,
  type DropdownMenuOption,
} from './DropdownMenu';

export {DropdownMenuItem, type DropdownMenuItemProps} from './DropdownMenuItem';

// Selectable items — checkbox (independent) and radio (single-select group).
export {
  DropdownMenuCheckboxItem,
  type DropdownMenuCheckboxItemProps,
} from './DropdownMenuCheckboxItem';
export {
  DropdownMenuRadioGroup,
  type DropdownMenuRadioGroupProps,
} from './DropdownMenuRadioGroup';
export {
  DropdownMenuRadioItem,
  type DropdownMenuRadioItemProps,
} from './DropdownMenuRadioItem';

// Submenu — a single menu row that reveals a nested flyout of its own
// children/items. Data mode via DropdownMenuItemData.items.
export {
  DropdownMenuSubMenu,
  type DropdownMenuSubMenuProps,
} from './DropdownMenuSubMenu';

// Menu-coordination context — public so consumers can build custom menu items
// that read the menu size / close the menu.
export {
  DropdownMenuContext,
  useDropdownMenuContext,
  type DropdownMenuContextValue,
  type DropdownMenuSize,
} from './DropdownMenuContext';
