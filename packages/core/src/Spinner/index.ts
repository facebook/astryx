// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSSpinner component
 * @output Exports XDSSpinner component and related types
 * @position Entry point for Spinner; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Spinner/Spinner.doc.mjs
 */

export {XDSSpinner} from './XDSSpinner';
export type {
  XDSSpinnerProps,
  XDSSpinnerSize,
  XDSSpinnerShade,
} from './XDSSpinner';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSSpinner as Spinner,
} from '.';
export type {
  XDSSpinnerProps as SpinnerProps,
  XDSSpinnerShade as SpinnerShade,
  XDSSpinnerSize as SpinnerSize,
} from '.';
// <compat-aliases:end>
