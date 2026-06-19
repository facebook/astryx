// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Item.tsx
 * @output Exports Item component and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {Item} from './Item';
export type {ItemProps, ItemAlign, ItemDensity} from './Item';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Item as XDSItem,
} from '.';
export type {
  ItemAlign as XDSItemAlign,
  ItemDensity as XDSItemDensity,
  ItemProps as XDSItemProps,
} from '.';
// <compat-aliases:end>
