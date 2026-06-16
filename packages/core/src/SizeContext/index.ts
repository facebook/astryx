// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input XDSSizeContext.ts
 * @output Re-exports size context utilities
 * @position Public entry point for @xds/core/SizeContext
 */

export {
  XDSSizeContext,
  XDSSizeProvider,
  useXDSSize,
  type XDSElementSize,
} from './XDSSizeContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSSizeContext as SizeContext,
  XDSSizeProvider as SizeProvider,
  useXDSSize as useSize,
} from '.';
export type {
  XDSElementSize as ElementSize,
} from '.';
// <compat-aliases:end>
