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
