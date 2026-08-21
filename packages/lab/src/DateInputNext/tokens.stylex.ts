// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokens.stylex.ts
 * @input StyleX variable and constant definitions
 * @output Exports DateInputNext layout variables and derived geometry
 * @position Lab component tokens consumed by DateInputNext.tsx, MonthScroller.tsx, Wheel.tsx, MonthYearWheels.tsx
 *
 * The picker's whole geometry derives from two numbers, which is what makes
 * the fixed height and the scroll snapping exact:
 *
 *   pane height = weeks x day size            (one month, always 6 rows)
 *   body height = pane height                 (calendar body AND wheel body)
 *   wheel pad   = (body height - item) / 2    (so row 0 can rest centered)
 *
 * Every month pane is the same height as the scrollport, so `scroll-snap-align:
 * start` produces a paged scroller with no partial rest positions, and the
 * wheel overlay swaps in without the component changing size.
 *
 * The derived values are `defineConsts`, not plain exported strings: StyleX
 * inlines a constant at build time only through `defineVars`/`defineConsts`
 * from a `.stylex.ts` file. A plain `export const` fails the build with
 * "a style value can only contain an array, string or number".
 *
 * SYNC: When modified, update DateInputNext.doc.mjs (Theming section).
 */

import * as stylex from '@stylexjs/stylex';

/**
 * Week rows per month pane. Fixed at 6 — the most any month needs — so every
 * pane is identical in height and no snap offset ever shifts. Not a themeable
 * variable: it is a fact about the Gregorian calendar, and `repeat()` cannot
 * take a custom property as its count.
 */
export const WEEKS_PER_PANE = 6;

/** Layout variables exposed for theme-level DateInputNext tuning. */
export const dateInputNextVars = stylex.defineVars({
  /**
   * Height of one day row, and the minimum touch target of a day. 44px is the
   * comfortable minimum tap target on both iOS and Android.
   */
  '--date-input-next-day-size': '44px',
  /**
   * Height of one wheel option row, and so the spacing between options and
   * the height of the selection band.
   *
   * 28px against a day's 44px: a wheel row is scroll-first — a value is
   * chosen by bringing it under the band, and tapping one is a shortcut
   * rather than the mechanism — so it does not carry a day cell's tap-target
   * duty, and a mis-tap costs nothing, because the neighbouring rows are the
   * same control and the result is visible immediately.
   *
   * The row is deliberately close to the text it holds (17px), the way a
   * platform picker packs them: the list should read as one continuous
   * column of values, not as a stack of buttons with air between them. At
   * this height ~9 options are on screen.
   */
  '--date-input-next-wheel-item-size': '28px',
});

const DAY_SIZE = dateInputNextVars['--date-input-next-day-size'];
const WHEEL_ITEM_SIZE = dateInputNextVars['--date-input-next-wheel-item-size'];

/** Geometry derived from the variables above, shared across the component. */
export const dateInputNextGeometry = stylex.defineConsts({
  /** One month pane — and therefore the scrollport, and the wheel body. */
  paneBlockSize: `calc(${WEEKS_PER_PANE} * ${DAY_SIZE})`,
  /** The six equal week rows inside a pane. */
  paneRows: `repeat(${WEEKS_PER_PANE}, 1fr)`,
  /**
   * Padding above the first and below the last wheel option, so either end
   * can come to rest under the centered selection band.
   */
  wheelEdgePadding: `calc((${WEEKS_PER_PANE} * ${DAY_SIZE} - ${WHEEL_ITEM_SIZE}) / 2)`,
});
