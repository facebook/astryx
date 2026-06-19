// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Badge component and types from Badge.tsx
 * @output Exports Badge, BadgeProps, BadgeVariant, BadgeVariantMap
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Badge/Badge.doc.mjs
 */

export {Badge} from './Badge';
export type {
  BadgeProps,
  BadgeVariant,
  BadgeVariantMap,
} from './Badge';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Badge as XDSBadge,
} from '.';
export type {
  BadgeProps as XDSBadgeProps,
  BadgeVariant as XDSBadgeVariant,
  BadgeVariantMap as XDSBadgeVariantMap,
} from '.';
// <compat-aliases:end>
