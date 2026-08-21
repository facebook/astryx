// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useNativeDatePicker.ts
 * @input Uses useMediaQuery
 * @output Exports DateInputNativePicker, NativeDatePickerState,
 *   useNativeDatePicker, supportsNativeDateInput
 * @position Internal helper for DateInput; consumed by DateInput.tsx and
 *   tested through DateInputNative.test.tsx
 *
 * Decides whether DateInput renders `<input type="date">` (so the browser/OS
 * shows its own date picker — the iOS wheel, the Android calendar dialog)
 * instead of the text field plus Calendar popover.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DateInput/DateInput.tsx (the `nativePicker` prop)
 * - /packages/core/src/DateInput/DateInput.doc.mjs (prop table)
 */

import {useMediaQuery} from '../hooks/useMediaQuery';

/**
 * When DateInput hands date picking to the browser/OS instead of its own
 * Calendar popover.
 *
 * - `'touch'`: native on touch devices (coarse pointer), the Calendar popover
 *   everywhere else
 * - `'always'`: native wherever the browser supports `<input type="date">`
 * - `'never'`: always the Calendar popover
 */
export type DateInputNativePicker = 'touch' | 'always' | 'never';

/**
 * Touch/stylus devices. Matches the media query the inputs already use to
 * bump their font size and hit areas, so the "is this a touch device?"
 * answer stays the same one in CSS and in JS.
 */
const COARSE_POINTER = '(pointer: coarse)';

/**
 * Feature-detects `<input type="date">`.
 *
 * A browser without date support falls back to `type="text"`, which keeps any
 * value verbatim; a browser with it runs the value sanitization algorithm and
 * blanks a value that is not a valid date string.
 *
 * @internal Exported for tests.
 */
export function supportsNativeDateInput(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  const probe = document.createElement('input');
  probe.setAttribute('type', 'date');
  probe.value = 'not-a-date';
  return probe.type === 'date' && probe.value === '';
}

/**
 * Whether DateInput should render the native date control, and whether that
 * control lets the user edit its date segments.
 */
export interface NativeDatePickerState {
  /** Render `<input type="date">` instead of the text field + Calendar. */
  isNative: boolean;
  /**
   * Whether the engine lets the user type into the control's segments.
   *
   * A fine-pointer date control is a row of individually editable fields; the
   * iOS wheel and the Android dialog are picker-only, and their field is a
   * single text run that is never typed into. WebKit builds the segmented
   * `DateTimeEditElement` only under `PLATFORM(MAC) || PLATFORM(GTK)`, and
   * Blink's `InputMultipleFieldsUI` is off on Android and iOS — so the
   * pointer is a good, not perfect, proxy. DateInput keeps a keydown backstop
   * for the hybrid devices it gets wrong (a Windows tablet reports a coarse
   * pointer while desktop Chrome still renders editable segments).
   */
  isSegmentEditable: boolean;
}

/**
 * Whether DateInput should render the native date control.
 *
 * SSR-safe: `useMediaQuery` reports `false` on the server and during
 * hydration, so the server always renders the text field and the swap (if
 * any) happens on the client's first committed render.
 *
 * `dateConstraints` forces the Calendar popover in `'touch'` mode: the native
 * control can only express a contiguous `min`/`max` range, so an arbitrary
 * per-date predicate would let the user pick a date the field then refuses.
 * `'always'` still goes native and rejects a constrained date on commit.
 */
export function useNativeDatePicker(
  mode: DateInputNativePicker,
  hasDateConstraints: boolean,
): NativeDatePickerState {
  const isTouch = useMediaQuery(COARSE_POINTER);

  const isNative =
    mode === 'never'
      ? false
      : mode === 'always'
        ? supportsNativeDateInput()
        : isTouch && !hasDateConstraints && supportsNativeDateInput();

  return {isNative, isSegmentEditable: isNative && !isTouch};
}
