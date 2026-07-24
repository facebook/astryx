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

// Menu-coordination context — public so consumers can build custom menu items
// that read the menu size / close the menu.
export {
  DropdownMenuContext,
  useDropdownMenuContext,
  type DropdownMenuContextValue,
  type DropdownMenuSize,
} from './DropdownMenuContext';
