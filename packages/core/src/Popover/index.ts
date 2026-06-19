// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Popover component and hook
 * @output Exports all Popover module public API
 * @position Entry point for Popover module
 *
 * SYNC: When adding new Popover files, update exports here
 */

// Popover hook
export {usePopover} from './usePopover';
export type {UsePopoverOptions, UsePopoverReturn} from './usePopover';

// Popover component
export {Popover} from './Popover';
export type {PopoverProps, PopoverTriggerRenderProps} from './Popover';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Popover as XDSPopover,
  usePopover as useXDSPopover,
} from '.';
export type {
  PopoverProps as XDSPopoverProps,
  PopoverTriggerRenderProps as XDSPopoverTriggerRenderProps,
  UsePopoverOptions as XDSUsePopoverOptions,
  UsePopoverReturn as XDSUsePopoverReturn,
} from '.';
// <compat-aliases:end>
