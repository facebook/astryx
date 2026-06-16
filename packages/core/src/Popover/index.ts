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
export {useXDSPopover} from './useXDSPopover';
export type {UseXDSPopoverOptions, UseXDSPopoverReturn} from './useXDSPopover';

// Popover component
export {XDSPopover} from './XDSPopover';
export type {XDSPopoverProps, PopoverTriggerRenderProps} from './XDSPopover';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSPopover as Popover,
  useXDSPopover as usePopover,
} from '.';
export type {
  XDSPopoverProps as PopoverProps,
} from '.';
// <compat-aliases:end>
