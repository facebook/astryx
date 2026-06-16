// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSCard component
 * @output Exports XDSCard component and types
 * @position Entry point for @xds/core/Card module
 *
 * SYNC: When modified, update /packages/core/src/Card/Card.doc.mjs
 */

export {XDSCard} from './XDSCard';
export type {XDSCardProps, XDSCardVariant, SizeValue} from './XDSCard';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCard as Card,
} from '.';
export type {
  XDSCardProps as CardProps,
  XDSCardVariant as CardVariant,
} from '.';
// <compat-aliases:end>
