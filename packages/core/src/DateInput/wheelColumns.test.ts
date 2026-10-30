// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelColumns.test.ts
 * @input wheelColumns.ts
 * @output Proves each layout's columns follow each other across the group,
 *   each column's labels sit inside the part it takes, and the seconds layouts
 *   keep the measured spacing
 * @position Unit coverage for DateInput/wheelColumns.ts
 */

import {describe, expect, it} from 'vitest';
import {monthYearColumns, timeColumns, type WheelColumn} from './wheelColumns';

/** A two-digit label's half width on UIKit's 21 pt row, pt. */
const HALF_TWO_DIGITS = 10.8;

const layouts: Record<string, WheelColumn[]> = {
  '12-hour': Object.values(timeColumns('12h', false)),
  '24-hour': Object.values(timeColumns('24h', false)),
  '12-hour with seconds': Object.values(timeColumns('12h', true)),
  '24-hour with seconds': Object.values(timeColumns('24h', true)),
  'month and year': Object.values(monthYearColumns),
};

describe('wheel columns', () => {
  it.each(Object.entries(layouts))(
    'cover the group from edge to edge, each starting where the last ends (%s)',
    (_name, columns) => {
      expect(columns[0].span[0]).toBeNull();
      expect(columns.at(-1)?.span[1]).toBeNull();
      for (let i = 1; i < columns.length; i++) {
        expect(columns[i].span[0]).toBe(columns[i - 1].span[1]);
      }
    },
  );

  it.each(Object.entries(layouts))(
    'put each column\u2019s labels inside the part it takes (%s)',
    (_name, columns) => {
      for (const {align, offset, span} of columns) {
        const [from, to] = span;
        const reach =
          align === 'center' ? HALF_TWO_DIGITS : 2 * HALF_TWO_DIGITS;
        const left = align === 'start' ? offset : offset - reach;
        const right = align === 'end' ? offset : offset + reach;
        if (from != null) {
          expect(left).toBeGreaterThan(from);
        }
        if (to != null) {
          expect(right).toBeLessThan(to);
        }
      }
    },
  );

  it('keeps the measured columns of a 12-hour and a 24-hour clock', () => {
    // UIDatePicker, iOS 26.2: hours right-aligned on a 12-hour clock.
    expect(timeColumns('12h', false)).toEqual({
      hour: {align: 'end', offset: -63.8, span: [null, -39.7]},
      minute: {align: 'center', offset: -4.7, span: [-39.7, 26.1]},
      meridiem: {align: 'center', offset: 56.8, span: [26.1, null]},
    });
    expect(timeColumns('24h', false)).toEqual({
      hour: {align: 'center', offset: -41.7, span: [null, -4.7]},
      minute: {align: 'center', offset: 32.3, span: [-4.7, null]},
    });
  });

  it('spaces a second column as the minute follows the hour', () => {
    const centre = ({align, offset}: WheelColumn) =>
      align === 'end' ? offset - HALF_TWO_DIGITS : offset;
    const twelve = timeColumns('12h', true);
    expect(centre(twelve.minute) - centre(twelve.hour)).toBeCloseTo(69.9, 0);
    expect(
      twelve.second && centre(twelve.second) - centre(twelve.minute),
    ).toBeCloseTo(69.9, 0);
    const twentyFour = timeColumns('24h', true);
    expect(centre(twentyFour.minute) - centre(twentyFour.hour)).toBeCloseTo(
      74,
      0,
    );
    expect(
      twentyFour.second &&
        centre(twentyFour.second) - centre(twentyFour.minute),
    ).toBeCloseTo(74, 0);
  });
});
