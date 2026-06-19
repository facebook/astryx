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


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Heading as XDSHeading,
  Text as XDSText,
  useTruncation as useXDSTruncation,
} from '.';
export type {
  HeadingLevel as XDSHeadingLevel,
  HeadingProps as XDSHeadingProps,
  HeadingType as XDSHeadingType,
  ProseElement as XDSProseElement,
  TextColor as XDSTextColor,
  TextDisplay as XDSTextDisplay,
  TextJustify as XDSTextJustify,
  TextProps as XDSTextProps,
  TextSize as XDSTextSize,
  TextType as XDSTextType,
  TextWeight as XDSTextWeight,
  TextWrap as XDSTextWrap,
  TextXStyleAllowed as XDSTextXStyleAllowed,
  UseTruncationOptions as XDSUseTruncationOptions,
  UseTruncationReturn as XDSUseTruncationReturn,
  WordBreak as XDSWordBreak,
} from '.';
// <compat-aliases:end>
