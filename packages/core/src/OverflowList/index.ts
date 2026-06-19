// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file OverflowList component barrel export
 */

export {OverflowList} from './OverflowList';
export type {OverflowListProps, OverflowItem} from './OverflowList';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  OverflowList as XDSOverflowList,
} from '.';
export type {
  OverflowItem as XDSOverflowItem,
  OverflowListProps as XDSOverflowListProps,
} from '.';
// <compat-aliases:end>
