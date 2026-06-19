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
export {useTooltip} from './useTooltip';
export type {
  TooltipFocusTrigger,
  TooltipOptions,
  TooltipReturn,
} from './useTooltip';

// Tooltip component
export {Tooltip} from './Tooltip';
export type {TooltipProps} from './Tooltip';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Tooltip as XDSTooltip,
  useTooltip as useXDSTooltip,
} from '.';
export type {
  TooltipFocusTrigger as XDSTooltipFocusTrigger,
  TooltipOptions as XDSTooltipOptions,
  TooltipProps as XDSTooltipProps,
  TooltipReturn as XDSTooltipReturn,
} from '.';
// <compat-aliases:end>
