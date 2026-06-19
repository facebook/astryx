// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Divider.tsx
 * @output Exports Divider component and props type
 * @position Package entry point for Divider
 *
 * SYNC: When modified, update /packages/core/src/Divider/Divider.doc.mjs
 */

export {Divider} from './Divider';
export type {
  DividerProps,
  DividerVariant,
  DividerVariantMap,
} from './Divider';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Divider as XDSDivider,
} from '.';
export type {
  DividerProps as XDSDividerProps,
  DividerVariant as XDSDividerVariant,
  DividerVariantMap as XDSDividerVariantMap,
} from '.';
// <compat-aliases:end>
