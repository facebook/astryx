// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelColumns.ts
 * @input UIDatePicker's column layout (measured)
 * @output Exports WheelColumn (where a touch column's labels sit in its
 *   WheelGroup, and the part of the group it takes), timeColumns (hour,
 *   minute, an optional second and AM/PM) and monthYearColumns
 * @position Layout constants of the touch picker wheel: TouchTimeField.tsx,
 *   TouchDateTimeField.tsx and MonthYearWheels.tsx pass them to their Wheels,
 *   and PickerWheel.tsx applies them
 *
 * UIDatePicker sets its columns close together around the picker's centre
 * rather than across its whole width: each column's labels have one edge, or
 * their centre, at a fixed distance from the centre. Each column takes the
 * part of the picker nearest its labels, so a finger on a label turns that
 * label's column. Distances are pt at UIKit's 32 pt row, positive toward the
 * inline end, so a right-to-left picker mirrors them.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/wheelColumns.test.ts
 */

/** Where a column's labels sit in its WheelGroup, and the part it takes. */
export interface WheelColumn {
  /** The labels' inline start or end edge, or their centre, sits at `offset`. */
  readonly align: 'start' | 'center' | 'end';
  /** That point's distance from the group's centre (pt). */
  readonly offset: number;
  /**
   * The part of the group the column takes: its start and end as distances
   * from the group's centre (pt), `null` for the group's edge. One column's
   * end is the next one's start.
   */
  readonly span: readonly [number | null, number | null];
}

/** The time columns of a sheet, by role. */
export interface TimeColumns {
  readonly hour: WheelColumn;
  readonly minute: WheelColumn;
  readonly second?: WheelColumn;
  readonly meridiem?: WheelColumn;
}

/*
 * @source measured: Mobile Safari's native time and month pickers
 *   (UIDatePicker, `.wheels`), iPhone 17 Pro, iOS 26.2 simulator, en_US, Oct
 *   26 2026. Each label's box at the band, from the band's magnified copy
 *   (UIKit magnifies each label about its own centre, so the copy's centre is
 *   the label's), relative to the picker's centre. Hours on a 12-hour clock
 *   are right-aligned (a one-digit hour sits under the right digit of "12");
 *   the other columns' labels are centred, months left-aligned. A span ends
 *   halfway between two columns' labels.
 */
const TIME_12H: TimeColumns = {
  hour: {align: 'end', offset: -63.8, span: [null, -39.7]},
  minute: {align: 'center', offset: -4.7, span: [-39.7, 26.1]},
  meridiem: {align: 'center', offset: 56.8, span: [26.1, null]},
};

const TIME_24H: TimeColumns = {
  hour: {align: 'center', offset: -41.7, span: [null, -4.7]},
  minute: {align: 'center', offset: 32.3, span: [-4.7, null]},
};

/*
 * UIDatePicker has no seconds column. With seconds the second column follows
 * the minute at the measured hour-to-minute distance (69.9 pt on a 12-hour
 * clock, 74 pt on a 24-hour one), and the whole set is centred where the
 * measured set is.
 */
const TIME_12H_SECONDS: TimeColumns = {
  hour: {align: 'end', offset: -98.8, span: [null, -74.6]},
  minute: {align: 'center', offset: -39.7, span: [-74.6, -4.7]},
  second: {align: 'center', offset: 30.3, span: [-4.7, 61]},
  meridiem: {align: 'center', offset: 91.8, span: [61, null]},
};

const TIME_24H_SECONDS: TimeColumns = {
  hour: {align: 'center', offset: -78.7, span: [null, -41.7]},
  minute: {align: 'center', offset: -4.7, span: [-41.7, 32.3]},
  second: {align: 'center', offset: 69.3, span: [32.3, null]},
};

/** The time columns for a clock and whether seconds show. */
export function timeColumns(
  hourCycle: '12h' | '24h',
  hasSeconds: boolean,
): TimeColumns {
  if (hourCycle === '12h') {
    return hasSeconds ? TIME_12H_SECONDS : TIME_12H;
  }
  return hasSeconds ? TIME_24H_SECONDS : TIME_24H;
}

/** UIDatePicker's month and year columns (`.yearAndMonth`). */
export const monthYearColumns = {
  month: {align: 'start', offset: -100.5, span: [null, 22.4]},
  year: {align: 'center', offset: 69.8, span: [22.4, null]},
} as const satisfies Record<string, WheelColumn>;
