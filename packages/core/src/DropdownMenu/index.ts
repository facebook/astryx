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

export {
  DropdownMenuItem,
  type DropdownMenuItemProps,
} from './DropdownMenuItem';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  DropdownMenu as XDSDropdownMenu,
  DropdownMenuItem as XDSDropdownMenuItem,
} from '.';
export type {
  DropdownMenuButtonProps as XDSDropdownMenuButtonProps,
  DropdownMenuDivider as XDSDropdownMenuDivider,
  DropdownMenuItemData as XDSDropdownMenuItemData,
  DropdownMenuItemProps as XDSDropdownMenuItemProps,
  DropdownMenuOption as XDSDropdownMenuOption,
  DropdownMenuProps as XDSDropdownMenuProps,
  DropdownMenuSection as XDSDropdownMenuSection,
} from '.';
// <compat-aliases:end>
