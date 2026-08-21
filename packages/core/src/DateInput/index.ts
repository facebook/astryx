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
 * The touch surface on its own, with the pointer test skipped.
 *
 * Reach for `DateInput` instead — it chooses. This is for the two cases that
 * cannot: a Storybook story or a test that has to show the touch picker on a
 * desktop browser, and an app that only ever runs on a handset. It takes
 * `DateInputProps`, so it is the same contract either way.
 */
export {TouchDateField as DateInputTouchSurface} from './TouchDateField';

/**
 * Layout variables for the touch surface — the day cell and wheel row sizes.
 * Only meaningful where the primary pointer is a finger; the pointer surface
 * is unaffected by them.
 */
export {dateInputTouchVars} from './tokens.stylex';
