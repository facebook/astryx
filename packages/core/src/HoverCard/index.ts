// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input HoverCard component and hook
 * @output Exports all HoverCard module public API
 * @position Entry point for HoverCard module
 *
 * SYNC: When adding new HoverCard files, update exports here
 */

// HoverCard hook
export {useHoverCard} from './useHoverCard';
export type {
  HoverCardFocusTrigger,
  HoverCardOptions,
  HoverCardReturn,
} from './useHoverCard';

// HoverCard component
export {HoverCard} from './HoverCard';
export type {HoverCardProps} from './HoverCard';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  HoverCard as XDSHoverCard,
  useHoverCard as useXDSHoverCard,
} from '.';
export type {
  HoverCardFocusTrigger as XDSHoverCardFocusTrigger,
  HoverCardOptions as XDSHoverCardOptions,
  HoverCardProps as XDSHoverCardProps,
  HoverCardReturn as XDSHoverCardReturn,
} from '.';
// <compat-aliases:end>
