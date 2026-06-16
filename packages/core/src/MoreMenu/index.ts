// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports XDSMoreMenu and related types
 * @position Public API entry point
 */

export {XDSMoreMenu, type XDSMoreMenuProps} from './XDSMoreMenu';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSMoreMenu as MoreMenu,
} from '.';
export type {
  XDSMoreMenuProps as MoreMenuProps,
} from '.';
// <compat-aliases:end>
