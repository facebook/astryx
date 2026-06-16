// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Text component exports
 * @position Entry point for Text components
 */

export {
  XDSText,
  type XDSTextProps,
  type XDSTextType,
  type XDSTextSize,
} from './XDSText';
export {
  XDSHeading,
  type XDSHeadingProps,
  type XDSHeadingLevel,
  type XDSHeadingType,
} from '../Heading';

// Re-export shared types from theme for convenience
export type {
  XDSTextColor,
  XDSTextWeight,
  XDSTextDisplay,
  XDSTextJustify,
  XDSWordBreak,
  XDSTextWrap,
  XDSTextXStyleAllowed,
  ProseElement,
} from '../theme/types';

// Re-export useTruncation for advanced use cases
export {
  useTruncation,
  type UseTruncationOptions,
  type UseTruncationReturn,
} from './useTruncation';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSHeading as Heading,
  XDSText as Text,
} from '.';
export type {
  XDSHeadingProps as HeadingProps,
  XDSHeadingType as HeadingType,
  XDSTextColor as TextColor,
  XDSTextDisplay as TextDisplay,
  XDSTextJustify as TextJustify,
  XDSTextProps as TextProps,
  XDSTextSize as TextSize,
  XDSTextType as TextType,
  XDSTextWeight as TextWeight,
  XDSTextWrap as TextWrap,
  XDSTextXStyleAllowed as TextXStyleAllowed,
  XDSWordBreak as WordBreak,
} from '.';
// <compat-aliases:end>
