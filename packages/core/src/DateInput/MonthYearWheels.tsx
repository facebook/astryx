// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MonthYearWheels.tsx
 * @input A month index, the reachable month bounds, a change callback
 * @output Exports MonthYearWheels — the month + year wheel pair
 * @position Internal component; consumed by TouchDateField.tsx
 *
 * The month and year wheels behind the calendar's title, as UIDatePicker's
 * inline calendar has them (motion/uikit/datePicker.ts
 * `calendar.monthYearWheels`): the month wheel loops (December is followed
 * by January, the year unchanged), and a year that lacks the month shown in
 * the range turns the month wheel onto the nearest reachable month, on the
 * picker's own column turn, instead of making it jump.
 *
 * It occupies exactly the same box as the month pager, so opening it never
 * changes the picker's height.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/TouchDateField.tsx
 * - /packages/core/src/DateTimeInput/TouchDateTimeField.tsx
 * - /packages/core/src/DateInput/DateInput.doc.mjs
 * - /packages/core/src/DateInput/DateInputTouch.test.tsx
 */

import {useMemo, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useLocale} from '../i18n';
import {DATE_FORMAT_MONTH_ONLY, plainDateFormat} from '../utils';
import {dateInputTouchGeometry} from './tokens.stylex';
import {datePicker} from '../motion/uikit/datePicker';
import {Wheel, type WheelHandle, type WheelOption} from './Wheel';
import {WheelGroup} from './WheelGroup';
import {fromMonthIndex, toMonthIndex} from './monthGeometry';

/** UIDatePicker's turn of a column it moves by itself. */
const COLUMN_TURN = {
  duration: datePicker.wheels.columnTurn.durationMs / 1000,
  curve: datePicker.wheels.columnTurn.curve,
};

const styles = stylex.create({
  // The picker (UIPickerView's 216 px) centred in the month pane.
  wheels: {
    display: 'flex',
    alignItems: 'center',
    blockSize: dateInputTouchGeometry.paneBlockSize,
  },
});

export interface MonthYearWheelsProps {
  /** The month the wheels currently show. */
  monthIndex: number;
  /** First reachable month. */
  minMonthIndex: number;
  /** Last reachable month. */
  maxMonthIndex: number;
  /** Fired when either wheel comes to rest on a new month. */
  onChange: (monthIndex: number) => void;
  /** Accessible name for the month wheel. */
  monthLabel: string;
  /** Accessible name for the year wheel. */
  yearLabel: string;
  /** False while the panel is hidden. */
  isActive?: boolean;
}

/**
 * Month and year wheels, bounded by the same range as the scroller.
 */
export function MonthYearWheels({
  monthIndex,
  minMonthIndex,
  maxMonthIndex,
  onChange,
  monthLabel,
  yearLabel,
  isActive = true,
}: MonthYearWheelsProps) {
  const locale = useLocale();
  const {year, month} = fromMonthIndex(monthIndex);
  const monthWheelRef = useRef<WheelHandle | null>(null);

  // Day 15 of a fixed year: no timezone can push it into an adjacent month
  // the way day 1 or day 31 can.
  //
  // `plainDateFormat` rather than a raw `Intl.DateTimeFormat`, which the
  // shared lint rule forbids and which would duplicate the format vocabulary
  // besides. Recompute when the provider locale changes so the wheel labels
  // stay in sync with the field and calendar.
  const monthNames = useMemo(
    () =>
      Array.from({length: 12}, (_, index) =>
        plainDateFormat(
          {year: 2021, month: index + 1, day: 15},
          DATE_FORMAT_MONTH_ONLY,
          locale,
        ),
      ),
    [locale],
  );

  // Months outside the range stay on the wheel rather than vanishing: a list
  // whose length changes with the year would jump under the finger.
  const monthOptions: WheelOption[] = useMemo(
    () =>
      monthNames.map((name, index) => {
        const candidate = toMonthIndex(year, index + 1);
        return {
          value: index + 1,
          label: name,
          isDisabled: candidate < minMonthIndex || candidate > maxMonthIndex,
        };
      }),
    [monthNames, year, minMonthIndex, maxMonthIndex],
  );

  const yearOptions: WheelOption[] = useMemo(() => {
    const first = fromMonthIndex(minMonthIndex).year;
    const last = fromMonthIndex(maxMonthIndex).year;
    const options: WheelOption[] = [];
    for (let candidate = first; candidate <= last; candidate++) {
      options.push({
        value: candidate,
        label: String(candidate),
        // A year is reachable when any of its months is.
        isDisabled:
          toMonthIndex(candidate, 12) < minMonthIndex ||
          toMonthIndex(candidate, 1) > maxMonthIndex,
      });
    }
    return options;
  }, [minMonthIndex, maxMonthIndex]);

  return (
    <div {...stylex.props(styles.wheels)}>
      <WheelGroup>
        <Wheel
          ref={monthWheelRef}
          label={monthLabel}
          options={monthOptions}
          value={month}
          isLooping={datePicker.calendar.monthYearWheels.monthLoops}
          isActive={isActive}
          onChange={nextMonth => onChange(toMonthIndex(year, nextMonth))}
        />
        <Wheel
          label={yearLabel}
          options={yearOptions}
          value={year}
          isActive={isActive}
          onChange={nextYear => {
            // A year change can land outside the range: clamp to it, and turn
            // the month wheel onto the clamped month rather than letting it
            // jump there (UIKit turns a column past a bound back onto it).
            const candidate = toMonthIndex(nextYear, month);
            const clamped = Math.min(
              Math.max(candidate, minMonthIndex),
              maxMonthIndex,
            );
            if (clamped !== candidate) {
              void monthWheelRef.current?.spinTo(
                fromMonthIndex(clamped).month - 1,
                COLUMN_TURN,
              );
            }
            onChange(clamped);
          }}
        />
      </WheelGroup>
    </div>
  );
}

MonthYearWheels.displayName = 'MonthYearWheels';
