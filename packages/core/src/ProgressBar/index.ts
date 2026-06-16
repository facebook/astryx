// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ProgressBar component barrel export
 */

export {XDSProgressBar} from './XDSProgressBar';
export type {
  XDSProgressBarProps,
  XDSProgressBarVariant,
  XDSProgressBarVariantMap,
} from './XDSProgressBar';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSProgressBar as ProgressBar,
} from '.';
export type {
  XDSProgressBarProps as ProgressBarProps,
  XDSProgressBarVariant as ProgressBarVariant,
  XDSProgressBarVariantMap as ProgressBarVariantMap,
} from '.';
// <compat-aliases:end>
