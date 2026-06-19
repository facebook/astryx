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


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  ContextMenu as XDSContextMenu,
  ContextMenuItem as XDSContextMenuItem,
} from '.';
export type {
  ContextMenuDivider as XDSContextMenuDivider,
  ContextMenuItemData as XDSContextMenuItemData,
  ContextMenuItemProps as XDSContextMenuItemProps,
  ContextMenuOption as XDSContextMenuOption,
  ContextMenuProps as XDSContextMenuProps,
  ContextMenuSection as XDSContextMenuSection,
} from '.';
// <compat-aliases:end>
