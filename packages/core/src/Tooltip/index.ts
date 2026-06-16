// Copyright (c) Meta Platforms, Inc. and affiliates.

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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSTooltip as Tooltip,
  useXDSTooltip as useTooltip,
} from '.';
export type {
  XDSTooltipOptions as TooltipOptions,
  XDSTooltipProps as TooltipProps,
  XDSTooltipReturn as TooltipReturn,
} from '.';
// <compat-aliases:end>
