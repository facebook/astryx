// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input VStack component source
 * @output Exports VStack and its props type
 * @position Entry point for @xds/core/VStack subpath export
 */

export {VStack, type VStackProps} from './VStack';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  VStack as XDSVStack,
} from '.';
export type {
  VStackProps as XDSVStackProps,
} from '.';
// <compat-aliases:end>
