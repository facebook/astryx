// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Convenience re-export for XDSHeading
 * @position Subpath export so `@xds/core/Heading` resolves correctly
 *
 * XDSHeading lives in the Text directory (shared typography internals),
 * but agents and developers naturally expect `@xds/core/Heading` to work.
 */

export {
  XDSHeading,
  type XDSHeadingProps,
  type XDSHeadingLevel,
  type XDSHeadingType,
} from '../Text';
