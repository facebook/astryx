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
export type {XDSPopoverProps} from './XDSPopover';
