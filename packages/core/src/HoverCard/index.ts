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
export {useXDSHoverCard} from './useXDSHoverCard';
export type {
  HoverCardFocusTrigger,
  XDSHoverCardOptions,
  XDSHoverCardReturn,
} from './useXDSHoverCard';

// HoverCard component
export {XDSHoverCard} from './XDSHoverCard';
export type {XDSHoverCardProps} from './XDSHoverCard';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSHoverCard as HoverCard,
  useXDSHoverCard as useHoverCard,
} from '.';
export type {
  XDSHoverCardOptions as HoverCardOptions,
  XDSHoverCardProps as HoverCardProps,
  XDSHoverCardReturn as HoverCardReturn,
} from '.';
// <compat-aliases:end>
