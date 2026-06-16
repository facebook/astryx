// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSBadge component and types from XDSBadge.tsx
 * @output Exports XDSBadge, XDSBadgeProps, XDSBadgeVariant, XDSBadgeVariantMap
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Badge/Badge.doc.mjs
 */

export {XDSBadge} from './XDSBadge';
export type {
  XDSBadgeProps,
  XDSBadgeVariant,
  XDSBadgeVariantMap,
} from './XDSBadge';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSBadge as Badge,
} from '.';
export type {
  XDSBadgeProps as BadgeProps,
  XDSBadgeVariant as BadgeVariant,
  XDSBadgeVariantMap as BadgeVariantMap,
} from '.';
// <compat-aliases:end>
