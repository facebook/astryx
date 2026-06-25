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
