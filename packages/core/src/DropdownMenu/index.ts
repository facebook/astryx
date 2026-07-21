// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports DropdownMenu, DropdownMenuItem and related types
 * @position Public API entry point
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

// Menu-coordination context — public so consumers (and @astryxdesign/lab)
// can build custom menu items that read the menu size / close the menu.
export {
  DropdownMenuContext,
  useDropdownMenuContext,
  type DropdownMenuContextValue,
  type DropdownMenuSize,
} from './DropdownMenuContext';
