// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Heading component source
 * @output Exports Heading and its props/types
 * @position Entry point for @xds/core/Heading subpath export
 */

export {
  Heading,
  type HeadingProps,
  type HeadingLevel,
  type HeadingType,
} from './Heading';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Heading as XDSHeading,
} from '.';
export type {
  HeadingLevel as XDSHeadingLevel,
  HeadingProps as XDSHeadingProps,
  HeadingType as XDSHeadingType,
} from '.';
// <compat-aliases:end>
