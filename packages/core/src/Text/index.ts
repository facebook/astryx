// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Text component exports
 * @position Entry point for Text components
 */

export {
  Text,
  type TextProps,
  type TextType,
  type TextSize,
} from './Text';
export {
  Heading,
  type HeadingProps,
  type HeadingLevel,
  type HeadingType,
} from '../Heading';

// Re-export shared types from theme for convenience
export type {
  TextColor,
  TextWeight,
  TextDisplay,
  TextJustify,
  WordBreak,
  TextWrap,
  TextXStyleAllowed,
  ProseElement,
} from '../theme/types';

// Re-export useTruncation for advanced use cases
export {
  useTruncation,
  type UseTruncationOptions,
  type UseTruncationReturn,
} from './useTruncation';
