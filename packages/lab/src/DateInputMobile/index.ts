// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DateInputMobile component barrel export
 */

export {DateInputMobile, MOBILE_PICKER_QUERY} from './DateInputMobile';
export type {
  DateInputMobileProps,
  DateInputMobileSize,
  DateInputMobileFormat,
  DateInputMobileStatus,
  DateInputMobileStatusType,
} from './DateInputMobile';

/**
 * The touch surface, unconditionally — no media query, no desktop fallback.
 *
 * `DateInputMobile` is the one to reach for: it picks the right surface for
 * the device. This is for the two cases where the choice is already made — a
 * mobile-only app that never wants the desktop control, and a story or test
 * that has to render the picker on a desktop browser.
 */
export {MobileDateField} from './MobileDateField';

export {dateInputMobileVars} from './tokens.stylex';
