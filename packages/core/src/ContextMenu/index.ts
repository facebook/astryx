// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file index.ts
 * @output Exports XDSContextMenu, XDSContextMenuItem and related types
 * @position Public API entry point
 */

export {
  XDSContextMenu,
  type XDSContextMenuProps,
  type XDSContextMenuItemData,
  type XDSContextMenuDivider,
  type XDSContextMenuSection,
  type XDSContextMenuOption,
} from './XDSContextMenu';

export {
  XDSDropdownMenuItem as XDSContextMenuItem,
  type XDSDropdownMenuItemProps as XDSContextMenuItemProps,
} from '../DropdownMenu/XDSDropdownMenuItem';
