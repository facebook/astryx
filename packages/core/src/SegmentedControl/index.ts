// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from SegmentedControl component files
 * @output Exports SegmentedControl, SegmentedControlItem and their types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/SegmentedControl/SegmentedControl.doc.mjs
 */

export {SegmentedControl} from './SegmentedControl';
export type {SegmentedControlProps} from './SegmentedControl';

export {SegmentedControlItem} from './SegmentedControlItem';
export type {SegmentedControlItemProps} from './SegmentedControlItem';

export type {
  SegmentedControlSize,
  SegmentedControlLayout,
} from './SegmentedControlContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  SegmentedControl as XDSSegmentedControl,
  SegmentedControlItem as XDSSegmentedControlItem,
} from '.';
export type {
  SegmentedControlItemProps as XDSSegmentedControlItemProps,
  SegmentedControlLayout as XDSSegmentedControlLayout,
  SegmentedControlProps as XDSSegmentedControlProps,
  SegmentedControlSize as XDSSegmentedControlSize,
} from '.';
// <compat-aliases:end>
