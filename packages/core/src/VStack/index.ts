// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input XDSVStack component source
 * @output Exports XDSVStack and its props type
 * @position Entry point for @xds/core/VStack subpath export
 */

export {XDSVStack, type XDSVStackProps} from './XDSVStack';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSVStack as VStack,
} from '.';
export type {
  XDSVStackProps as VStackProps,
} from '.';
// <compat-aliases:end>
