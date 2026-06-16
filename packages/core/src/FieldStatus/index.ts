// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input XDSFieldStatus component source
 * @output Exports XDSFieldStatus and related types
 * @position Entry point for @xds/core/FieldStatus subpath export
 */

export {XDSFieldStatus} from './XDSFieldStatus';
export type {
  XDSFieldStatusProps,
  XDSFieldStatusVariant,
  XDSFieldStatusVariantMap,
} from './XDSFieldStatus';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSFieldStatus as FieldStatus,
} from '.';
export type {
  XDSFieldStatusProps as FieldStatusProps,
  XDSFieldStatusVariant as FieldStatusVariant,
  XDSFieldStatusVariantMap as FieldStatusVariantMap,
} from '.';
// <compat-aliases:end>
