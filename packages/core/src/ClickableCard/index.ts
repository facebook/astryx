// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSClickableCard.tsx
 * @output Exports XDSClickableCard component and XDSClickableCardProps type
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update /packages/core/src/ClickableCard/ClickableCard.doc.mjs
 */

export {XDSClickableCard} from './XDSClickableCard';
export type {XDSClickableCardProps} from './XDSClickableCard';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSClickableCard as ClickableCard,
} from '.';
export type {
  XDSClickableCardProps as ClickableCardProps,
} from '.';
// <compat-aliases:end>
