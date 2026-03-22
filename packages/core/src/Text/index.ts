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
} from './XDSHeading';

// Re-export shared types from theme for convenience
export type {
  XDSTextColor,
  XDSTextWeight,
  XDSTextDisplay,
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
