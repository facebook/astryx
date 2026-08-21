// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input DateInput component exports
 * @output Re-exports DateInput and types
 * @position Package entry point for DateInput
 */

export {DateInput, TOUCH_POINTER_QUERY} from './DateInput';
export type {
  DateInputProps,
  DateInputSize,
  DateInputFormat,
  DateInputStatus,
  DateInputStatusType,
} from './DateInput';

/**
 * Layout variables for the touch surface — the day cell and wheel row sizes.
 * Only meaningful where the primary pointer is a finger; the pointer surface
 * is unaffected by them.
 */
export {dateInputTouchVars} from './tokens.stylex';
