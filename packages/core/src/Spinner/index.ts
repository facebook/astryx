// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Spinner component
 * @output Exports Spinner component and related types
 * @position Entry point for Spinner; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Spinner/Spinner.doc.mjs
 */

export {Spinner} from './Spinner';
export type {
  SpinnerProps,
  SpinnerSize,
  SpinnerShade,
} from './Spinner';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Spinner as XDSSpinner,
} from '.';
export type {
  SpinnerProps as XDSSpinnerProps,
  SpinnerShade as XDSSpinnerShade,
  SpinnerSize as XDSSpinnerSize,
} from '.';
// <compat-aliases:end>
