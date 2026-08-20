// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DateInputNext component barrel export
 */

export {DateInputNext, MOBILE_PICKER_QUERY} from './DateInputNext';
export type {
  DateInputNextProps,
  DateInputNextSize,
  DateInputNextFormat,
  DateInputNextStatus,
  DateInputNextStatusType,
} from './DateInputNext';

/**
 * The touch surface, unconditionally — no media query, no desktop fallback.
 *
 * `DateInputNext` is the one to reach for: it picks the right surface for
 * the device. This is for the two cases where the choice is already made — a
 * mobile-only app that never wants the desktop control, and a story or test
 * that has to render the picker on a desktop browser.
 */
export {MobileDateField} from './MobileDateField';

export {dateInputNextVars} from './tokens.stylex';
