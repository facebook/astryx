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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSContextMenu as ContextMenu,
  XDSContextMenuItem as ContextMenuItem,
} from '.';
export type {
  XDSContextMenuDivider as ContextMenuDivider,
  XDSContextMenuItemData as ContextMenuItemData,
  XDSContextMenuItemProps as ContextMenuItemProps,
  XDSContextMenuOption as ContextMenuOption,
  XDSContextMenuProps as ContextMenuProps,
  XDSContextMenuSection as ContextMenuSection,
} from '.';
// <compat-aliases:end>
