// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSItem.tsx
 * @output Exports XDSItem component and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSItem} from './XDSItem';
export type {XDSItemProps, XDSItemAlign, XDSItemDensity} from './XDSItem';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSItem as Item,
} from '.';
export type {
  XDSItemAlign as ItemAlign,
  XDSItemDensity as ItemDensity,
  XDSItemProps as ItemProps,
} from '.';
// <compat-aliases:end>
