// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports XDSDropdownMenu, XDSDropdownMenuItem and related types
 * @position Public API entry point
 */

export {
  XDSDropdownMenu,
  type XDSDropdownMenuProps,
  type XDSDropdownMenuButtonProps,
  type XDSDropdownMenuItemData,
  type XDSDropdownMenuDivider,
  type XDSDropdownMenuSection,
  type XDSDropdownMenuOption,
} from './XDSDropdownMenu';

export {
  XDSDropdownMenuItem,
  type XDSDropdownMenuItemProps,
} from './XDSDropdownMenuItem';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSDropdownMenu as DropdownMenu,
  XDSDropdownMenuItem as DropdownMenuItem,
} from '.';
export type {
  XDSDropdownMenuButtonProps as DropdownMenuButtonProps,
  XDSDropdownMenuDivider as DropdownMenuDivider,
  XDSDropdownMenuItemData as DropdownMenuItemData,
  XDSDropdownMenuItemProps as DropdownMenuItemProps,
  XDSDropdownMenuOption as DropdownMenuOption,
  XDSDropdownMenuProps as DropdownMenuProps,
  XDSDropdownMenuSection as DropdownMenuSection,
} from '.';
// <compat-aliases:end>
