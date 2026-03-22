'use client';

/**
 * @file index.ts
 * @input Tooltip component and hook
 * @output Exports all Tooltip module public API
 * @position Entry point for Tooltip module
 *
 * SYNC: When adding new Tooltip files, update exports here
 */

// Tooltip hook
export {useXDSTooltip} from './useXDSTooltip';
export type {
  TooltipFocusTrigger,
  XDSTooltipOptions,
  XDSTooltipReturn,
} from './useXDSTooltip';

// Tooltip component
export {XDSTooltip} from './XDSTooltip';
export type {XDSTooltipProps} from './XDSTooltip';
