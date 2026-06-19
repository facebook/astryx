// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input HStack component source
 * @output Exports HStack and its props type
 * @position Entry point for @xds/core/HStack subpath export
 */

export {HStack, type HStackProps} from './HStack';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  HStack as XDSHStack,
} from '.';
export type {
  HStackProps as XDSHStackProps,
} from '.';
// <compat-aliases:end>
