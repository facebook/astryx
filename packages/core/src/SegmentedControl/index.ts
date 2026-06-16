// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from SegmentedControl component files
 * @output Exports XDSSegmentedControl, XDSSegmentedControlItem and their types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/SegmentedControl/SegmentedControl.doc.mjs
 */

export {XDSSegmentedControl} from './XDSSegmentedControl';
export type {XDSSegmentedControlProps} from './XDSSegmentedControl';

export {XDSSegmentedControlItem} from './XDSSegmentedControlItem';
export type {XDSSegmentedControlItemProps} from './XDSSegmentedControlItem';

export type {
  XDSSegmentedControlSize,
  XDSSegmentedControlLayout,
} from './XDSSegmentedControlContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSSegmentedControl as SegmentedControl,
  XDSSegmentedControlItem as SegmentedControlItem,
} from '.';
export type {
  XDSSegmentedControlItemProps as SegmentedControlItemProps,
  XDSSegmentedControlLayout as SegmentedControlLayout,
  XDSSegmentedControlProps as SegmentedControlProps,
  XDSSegmentedControlSize as SegmentedControlSize,
} from '.';
// <compat-aliases:end>
