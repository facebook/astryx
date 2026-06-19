// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input FieldStatus component source
 * @output Exports FieldStatus and related types
 * @position Entry point for @xds/core/FieldStatus subpath export
 */

export {FieldStatus} from './FieldStatus';
export type {
  FieldStatusProps,
  FieldStatusVariant,
  FieldStatusVariantMap,
} from './FieldStatus';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  FieldStatus as XDSFieldStatus,
} from '.';
export type {
  FieldStatusProps as XDSFieldStatusProps,
  FieldStatusVariant as XDSFieldStatusVariant,
  FieldStatusVariantMap as XDSFieldStatusVariantMap,
} from '.';
// <compat-aliases:end>
