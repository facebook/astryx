// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Card component
 * @output Exports Card component and types
 * @position Entry point for @xds/core/Card module
 *
 * SYNC: When modified, update /packages/core/src/Card/Card.doc.mjs
 */

export {Card} from './Card';
export type {CardProps, CardVariant, SizeValue} from './Card';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Card as XDSCard,
} from '.';
export type {
  CardProps as XDSCardProps,
  CardVariant as XDSCardVariant,
  SizeValue as XDSSizeValue,
} from '.';
// <compat-aliases:end>
