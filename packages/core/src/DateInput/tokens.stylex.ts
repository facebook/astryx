// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokens.stylex.ts
 * @input StyleX variable and constant definitions
 * @output Exports DateInput layout constants and derived geometry
 * @position Core touch-picker geometry consumed by the DateInput touch surface
 *   (TouchDateField, MonthScroller, Wheel, MonthYearWheels) and by the
 *   DateTimeInput and TimeInput touch fields
 *
 * The calendar's geometry derives from one number, which is what makes the
 * fixed height and the scroll snapping exact:
 *
 *   pane height = weeks x day size            (one month, always 6 rows)
 *
 * Every month pane is the same height as the scrollport, so `scroll-snap-align:
 * start` produces a paged scroller with no partial rest positions. The wheels
 * are UIPickerView's own size (`wheelGeometry`, the UIKit picker table in
 * motion/uikit/picker.ts), centred in the same pane, so the wheel overlay swaps
 * in without the component changing size.
 *
 * The derived values are `defineConsts`, not plain exported strings: StyleX
 * inlines a constant at build time only through `defineVars`/`defineConsts`
 * from a `.stylex.ts` file. A plain `export const` fails the build with
 * "a style value can only contain an array, string or number".
 *
 */

import * as stylex from '@stylexjs/stylex';

/**
 * Week rows per month pane. Fixed at 6 — the most any month needs — so every
 * pane is identical in height and no snap offset ever shifts. Not a themeable
 * variable: it is a fact about the Gregorian calendar, and `repeat()` cannot
 * take a custom property as its count.
 */
export const WEEKS_PER_PANE = 6;

/**
 * The calendar's size input.
 *
 * `defineConsts`, not `defineVars`: these are inlined at build time and emit
 * no CSS custom property, so they are internal geometry rather than public
 * theming API. That is deliberate.
 *
 * The day size is an accessibility floor — 44px is the comfortable minimum
 * tap target on iOS and Android, and every other target in the sheet is held
 * to it. Exposing it as a variable would let a theme quietly lower the floor,
 * which is not a knob a design system should hand out.
 *
 * If a real need to theme it appears, promoting a const to a var is an
 * additive change; removing a var that consumers have started setting is not.
 */
export const dateInputTouchSizes = stylex.defineConsts({
  /**
   * Height of one day row, and the minimum touch target of a day. 44px is the
   * comfortable minimum tap target on both iOS and Android.
   */
  daySize: '44px',
});

// Local aliases for the derived values below. StyleX resolves a `defineConsts`
// member through an import, so consumers read `dateInputTouchSizes.*` directly
// rather than a re-exported plain const, which its static analysis cannot
// follow across files.
const DAY_SIZE = dateInputTouchSizes.daySize;

/** Geometry derived from the sizes above, shared across the component. */
export const dateInputTouchGeometry = stylex.defineConsts({
  /** One month pane — and therefore the scrollport, and the wheel body. */
  paneBlockSize: `calc(${WEEKS_PER_PANE} * ${DAY_SIZE})`,
  /** The six equal week rows inside a pane. */
  paneRows: `repeat(${WEEKS_PER_PANE}, 1fr)`,
});

/**
 * UIPickerView's geometry in px, from the UIKit constants table
 * (motion/uikit/picker.ts, measured on the iOS 26.2 simulator). StyleX
 * inlines only literal constants, so the values are repeated here; a test
 * holds them to the table.
 */
export const wheelGeometry = stylex.defineConsts({
  /** The picker's height: picker.geometry.height. */
  pickerHeight: '216px',
  /** Row pitch: picker.geometry.rowHeight. */
  rowHeight: '32px',
  /** Half the row pitch, where a row's top sits above the band's centre. */
  rowHalfHeight: '16px',
  /** The cylinder's radius behind each row: −picker.geometry.cylinderRadius. */
  rowOriginDepth: '-97.2px',
  /** The dimmed copies' perspective: picker.geometry.perspective. */
  perspective: '900px',
  /** The band: picker.geometry.bandHeight and bandInset. */
  bandHeight: '34px',
  bandInset: '9px',
  /** The band copy's magnification: picker.geometry.bandMagnification. */
  bandMagnification: '1.119',
  /** The dimmed copies' opacity: picker.geometry.outerOpacity. */
  outerOpacity: '0.447',
});

/**
 * UIDatePicker's month/year toggle, from the UIKit constants table
 * (motion/uikit/datePicker.ts `calendar.monthYearToggle`, measured on the iOS
 * 26.2 simulator). StyleX inlines only literal constants, so the values are
 * repeated here; a test holds them to the table.
 */
export const monthYearToggleMotion = stylex.defineConsts({
  /** Every fade of the toggle and the chevron's turn: fadeMs. */
  duration: '250ms',
  /** `UIView.animate`'s default curve: timing.curves.easeInOut. */
  curve: 'cubic-bezier(0.42, 0, 0.58, 1)',
  /** The title chevron's quarter turn: chevronTurnDegrees. */
  chevronTurn: '90deg',
});
