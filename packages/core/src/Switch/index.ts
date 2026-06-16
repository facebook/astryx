// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSSwitch component
 * @output Exports XDSSwitch component and related types
 * @position Entry point for Switch; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Switch/Switch.doc.mjs
 */

export {XDSSwitch} from './XDSSwitch';
export type {
  XDSSwitchProps,
  XDSSwitchLabelPosition,
  XDSSwitchLabelSpacing,
} from './XDSSwitch';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSSwitch as Switch,
} from '.';
export type {
  XDSSwitchLabelPosition as SwitchLabelPosition,
  XDSSwitchLabelSpacing as SwitchLabelSpacing,
  XDSSwitchProps as SwitchProps,
} from '.';
// <compat-aliases:end>
