// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file index.ts
 * @output Exports ContextMenu, ContextMenuItem and related types
 * @position Public API entry point
 */

export {
  ContextMenu,
  type ContextMenuProps,
  type ContextMenuItemData,
  type ContextMenuDivider,
  type ContextMenuSection,
  type ContextMenuOption,
} from './ContextMenu';

export {
  DropdownMenuItem as ContextMenuItem,
  type DropdownMenuItemProps as ContextMenuItemProps,
} from '../DropdownMenu/DropdownMenuItem';

// Selectable items work inside a ContextMenu too — re-exported under the
// ContextMenu name for a coherent API.
export {
  DropdownMenuCheckboxItem as ContextMenuCheckboxItem,
  type DropdownMenuCheckboxItemProps as ContextMenuCheckboxItemProps,
} from '../DropdownMenu/DropdownMenuCheckboxItem';
export {
  DropdownMenuRadioGroup as ContextMenuRadioGroup,
  type DropdownMenuRadioGroupProps as ContextMenuRadioGroupProps,
} from '../DropdownMenu/DropdownMenuRadioGroup';
export {
  DropdownMenuRadioItem as ContextMenuRadioItem,
  type DropdownMenuRadioItemProps as ContextMenuRadioItemProps,
} from '../DropdownMenu/DropdownMenuRadioItem';
