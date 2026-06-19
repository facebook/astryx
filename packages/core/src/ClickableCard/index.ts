// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from ClickableCard.tsx
 * @output Exports ClickableCard component and ClickableCardProps type
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update /packages/core/src/ClickableCard/ClickableCard.doc.mjs
 */

export {ClickableCard} from './ClickableCard';
export type {ClickableCardProps} from './ClickableCard';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  ClickableCard as XDSClickableCard,
} from '.';
export type {
  ClickableCardProps as XDSClickableCardProps,
} from '.';
// <compat-aliases:end>
