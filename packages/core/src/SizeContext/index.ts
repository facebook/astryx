// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input SizeContext.ts
 * @output Re-exports size context utilities
 * @position Public entry point for @xds/core/SizeContext
 */

export {
  SizeContext,
  SizeProvider,
  useSize,
  type ElementSize,
} from './SizeContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  SizeContext as XDSSizeContext,
  SizeProvider as XDSSizeProvider,
  useSize as useXDSSize,
} from '.';
export type {
  ElementSize as XDSElementSize,
} from '.';
// <compat-aliases:end>
