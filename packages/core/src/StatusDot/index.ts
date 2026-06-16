// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSStatusDot component
 * @output Exports XDSStatusDot component and related types
 * @position Entry point for StatusDot; re-exported by /packages/core/src/index.ts
 */

export {XDSStatusDot} from './XDSStatusDot';
export type {
  XDSStatusDotProps,
  XDSStatusDotVariant,
  XDSStatusDotVariantMap,
} from './XDSStatusDot';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSStatusDot as StatusDot,
} from '.';
export type {
  XDSStatusDotProps as StatusDotProps,
  XDSStatusDotVariant as StatusDotVariant,
  XDSStatusDotVariantMap as StatusDotVariantMap,
} from '.';
// <compat-aliases:end>
