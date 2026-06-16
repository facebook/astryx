// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input XDSHStack component source
 * @output Exports XDSHStack and its props type
 * @position Entry point for @xds/core/HStack subpath export
 */

export {XDSHStack, type XDSHStackProps} from './XDSHStack';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSHStack as HStack,
} from '.';
export type {
  XDSHStackProps as HStackProps,
} from '.';
// <compat-aliases:end>
