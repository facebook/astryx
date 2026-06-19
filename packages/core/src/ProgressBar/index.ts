// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ProgressBar component barrel export
 */

export {ProgressBar} from './ProgressBar';
export type {
  ProgressBarProps,
  ProgressBarVariant,
  ProgressBarVariantMap,
} from './ProgressBar';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  ProgressBar as XDSProgressBar,
} from '.';
export type {
  ProgressBarProps as XDSProgressBarProps,
  ProgressBarVariant as XDSProgressBarVariant,
  ProgressBarVariantMap as XDSProgressBarVariantMap,
} from '.';
// <compat-aliases:end>
