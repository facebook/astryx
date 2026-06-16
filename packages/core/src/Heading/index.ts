// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input XDSHeading component source
 * @output Exports XDSHeading and its props/types
 * @position Entry point for @xds/core/Heading subpath export
 */

export {
  XDSHeading,
  type XDSHeadingProps,
  type XDSHeadingLevel,
  type XDSHeadingType,
} from './XDSHeading';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSHeading as Heading,
} from '.';
export type {
  XDSHeadingProps as HeadingProps,
  XDSHeadingType as HeadingType,
} from '.';
// <compat-aliases:end>
