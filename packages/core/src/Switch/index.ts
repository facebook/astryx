// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Switch component
 * @output Exports Switch component and related types
 * @position Entry point for Switch; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Switch/Switch.doc.mjs
 */

export {Switch} from './Switch';
export type {
  SwitchProps,
  SwitchLabelPosition,
  SwitchLabelSpacing,
} from './Switch';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Switch as XDSSwitch,
} from '.';
export type {
  SwitchLabelPosition as XDSSwitchLabelPosition,
  SwitchLabelSpacing as XDSSwitchLabelSpacing,
  SwitchProps as XDSSwitchProps,
} from '.';
// <compat-aliases:end>
