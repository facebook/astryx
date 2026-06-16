// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSDivider.tsx
 * @output Exports XDSDivider component and props type
 * @position Package entry point for Divider
 *
 * SYNC: When modified, update /packages/core/src/Divider/Divider.doc.mjs
 */

export {XDSDivider} from './XDSDivider';
export type {
  XDSDividerProps,
  XDSDividerVariant,
  XDSDividerVariantMap,
} from './XDSDivider';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSDivider as Divider,
} from '.';
export type {
  XDSDividerProps as DividerProps,
  XDSDividerVariant as DividerVariant,
  XDSDividerVariantMap as DividerVariantMap,
} from '.';
// <compat-aliases:end>
