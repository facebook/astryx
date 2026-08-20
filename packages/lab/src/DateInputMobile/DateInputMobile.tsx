// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DateInputMobile.tsx
 * @input Uses useMediaQuery, core's DateInput, MobileDateField
 * @output Exports DateInputMobile, DateInputMobileProps and the re-exported DateInput types
 * @position Lab component entry; consumed by index.ts, tested by DateInputMobile.test.tsx
 *
 * A drop-in `DateInput` that picks its own surface.
 *
 * The props are `DateInputProps` — the same type, not a copy — so this is a
 * one-word swap at the call site and the compiler enforces that it stays one.
 * On anything but a narrow touch screen it renders core's `DateInput`
 * unchanged; on a narrow touch screen it renders `MobileDateField`, a picker
 * built for a thumb.
 *
 * ## Why a runtime switch and not CSS
 *
 * The two surfaces are structurally different — a popover anchored to a text
 * field versus a full-width sheet holding a scroller — so "render both, hide
 * one" would double the DOM, double the tab stops, and mount two calendars.
 * The condition is not layout, either: it is *which interaction is faster*,
 * and that depends on the pointer, which CSS cannot hand to JS.
 *
 * ## Why narrow AND touch
 *
 * Both, because either alone is the wrong signal:
 * - Touch alone would catch a touchscreen laptop, where the keyboard is right
 *   there and typing a date beats scrolling to it.
 * - Narrow alone would catch a half-width desktop window, same story.
 *
 * A phone is the intersection, and the intersection is where a scroll-and-tap
 * picker actually wins. The width bound is 768px — AppShell's `md`, the same
 * line the rest of the system calls "mobile".
 *
 * ## Hydration
 *
 * `useMediaQuery` reports false during SSR, so server HTML is always the
 * desktop field, and the swap happens when the store is read after hydration.
 * That is deliberately unobservable: both surfaces render the SAME closed
 * field — a bordered input with a calendar icon and the formatted date — and
 * differ only in what opens. Nothing moves; the field just starts opening a
 * sheet instead of a popover.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/DateInputMobile/MobileDateField.tsx (the touch surface)
 * - /packages/lab/src/DateInputMobile/DateInputMobile.doc.mjs
 * - /packages/lab/src/DateInputMobile/DateInputMobile.test.tsx
 * - /packages/lab/src/DateInputMobile/index.ts
 * - /packages/lab/src/index.ts
 * - /apps/storybook/stories/DateInputMobile.stories.tsx
 */

import {DateInput, type DateInputProps} from '@astryxdesign/core/DateInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {MobileDateField} from './MobileDateField';

/**
 * Narrow *and* touch. A phone is the intersection; a touchscreen laptop and a
 * half-width desktop window each match only one half and keep the desktop
 * field. 768px is AppShell's `md` breakpoint.
 */
export const MOBILE_PICKER_QUERY = '(max-width: 768px) and (pointer: coarse)';

/**
 * Identical to {@link DateInputProps} — this component is a drop-in for
 * `DateInput`, and aliasing the type (rather than restating it) is what keeps
 * it one as `DateInput` grows.
 */
export type DateInputMobileProps = DateInputProps;

// Re-exported so a consumer swapping the import gets the whole vocabulary from
// one place.
export type {
  DateInputSize as DateInputMobileSize,
  DateInputFormat as DateInputMobileFormat,
  DateInputStatus as DateInputMobileStatus,
  DateInputStatusType as DateInputMobileStatusType,
} from '@astryxdesign/core/DateInput';

/**
 * A date input that picks its own surface: core's `DateInput` everywhere, and
 * a touch picker — continuous snap-paged months, with month and year wheels
 * behind the header title — on a narrow touch screen.
 *
 * Takes exactly `DateInput`'s props, so adopting it is a changed import.
 *
 * @example
 * ```
 * <DateInputMobile label="Event date" value={date} onChange={setDate} />
 * ```
 */
export function DateInputMobile(props: DateInputMobileProps) {
  const isMobile = useMediaQuery(MOBILE_PICKER_QUERY);

  // Two components, never one with a branch inside: the surfaces share no
  // state worth preserving across a swap, and separating them keeps each
  // one's hooks its own.
  return isMobile ? <MobileDateField {...props} /> : <DateInput {...props} />;
}

DateInputMobile.displayName = 'DateInputMobile';
