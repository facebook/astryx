// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TimeWheels.tsx
 * @input A time of day, the hour format, the minute interval, the bounds and
 *   a commit callback
 * @output Exports TimeWheels — UIDatePicker's `.time` wheels as one picker:
 *   hour, minute, optional second and, in 12-hour time, AM/PM columns
 * @position Internal component; the wheels of the TimeInput sheet
 *   (TouchTimeField.tsx) and of DateTimeInput's time panel
 *   (TouchDateTimeField.tsx)
 *
 * The columns are Wheels in one WheelGroup; this component adds what
 * UIDatePicker adds on top of UIPickerView (motion/uikit/datePicker.ts
 * `wheels`, the rules in timeWheelRules.ts):
 *
 * - The hour and minute columns loop (the seconds too); AM/PM does not.
 * - The hour column moves the time by the hours it turned (the shorter way
 *   round, at most six rows: a Wheel reports only the row it rests on).
 * - The minute column steps by the minute interval, and a time off the
 *   interval shows rounded to it.
 * - In 12-hour time the AM/PM column follows the hour: an hour that comes to
 *   rest across 11 ↔ 12 turns the AM/PM column onto the other half.
 * - A time past the bounds commits as the bound, and every column whose row
 *   changes turns onto it (a column's own disabled rows are turned away from
 *   by the Wheel itself before it commits).
 * - Minutes do not carry into the hour.
 *
 * Each turn is the Wheel's spin (`spinTo`) on UIDatePicker's own turn
 * (`datePicker.wheels.columnTurn`: an animated `setContentOffset`, 0.3 s on
 * a sinusoid), started before the commit, so the new value arrives while the
 * column is already moving instead of making it jump. The value commits when
 * the column that moved comes to rest, as UIDatePicker's `valueChanged`
 * does; UIKit starts the AM/PM column about 35 ms earlier, as the hour
 * reaches its row, which the Wheel does not report.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TimeInput/TimeWheels.test.tsx
 * - /packages/core/src/TimeInput/timeWheelRules.ts
 * - /packages/core/src/TimeInput/TimeInput.doc.mjs
 * - /packages/core/src/DateTimeInput/DateTimeInput.doc.mjs
 */

import {useMemo, useRef} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {useTranslator} from '../i18n';
import {Wheel, type WheelHandle} from '../DateInput/Wheel';
import {datePicker} from '../motion/uikit/datePicker';
import {WheelGroup} from '../DateInput/WheelGroup';
import {parseISOTime, type ISOTimeString} from '../utils';
import {
  clampToBounds,
  columnValue,
  columnsToTurn,
  displayedTime,
  hourRows,
  meridiemOf,
  meridiemRows,
  minuteRows,
  secondRows,
  turnColumn,
  type TimeBounds,
  type TimeColumn,
  type TimeParts,
  type TimeRow,
} from './timeWheelRules';

export interface TimeWheelsProps {
  /** The time the wheels show (rounded to the minute interval for display). */
  time: TimeParts;
  /** 12-hour (with an AM/PM column) or 24-hour time. */
  hourFormat: '12h' | '24h';
  /** Whether a seconds column shows. */
  hasSeconds: boolean;
  /** Minutes between minute rows; from `minuteIntervalOf`. */
  minuteInterval: number;
  /** Earliest time that may commit. */
  min?: ISOTimeString;
  /** Latest time that may commit. */
  max?: ISOTimeString;
  /** False while the wheels are hidden. */
  isActive: boolean;
  /** Called with the committed time, already inside the bounds. */
  onCommit: (time: TimeParts) => void;
}

/** UIDatePicker's turn of a column it moves by itself. */
const COLUMN_TURN = {
  duration: datePicker.wheels.columnTurn.durationMs / 1000,
  curve: datePicker.wheels.columnTurn.curve,
};

function secondsOfISO(time: ISOTimeString | undefined): number | null {
  if (time == null) {
    return null;
  }
  const parsed = parseISOTime(time);
  return parsed == null
    ? null
    : parsed.hour * 3600 + parsed.minute * 60 + parsed.second;
}

function sameTime(a: TimeParts, b: TimeParts): boolean {
  return a.hour === b.hour && a.minute === b.minute && a.second === b.second;
}

/**
 * UIDatePicker's time wheels.
 *
 * @example
 * ```
 * <TimeWheels time={{hour: 11, minute: 58, second: 0}} hourFormat="12h"
 *   hasSeconds={false} minuteInterval={1} isActive onCommit={setTime} />
 * ```
 */
export function TimeWheels({
  time,
  hourFormat,
  hasSeconds,
  minuteInterval,
  min,
  max,
  isActive,
  onCommit,
}: TimeWheelsProps) {
  const t = useTranslator();
  const bounds = useMemo<TimeBounds>(
    () => ({min: secondsOfISO(min), max: secondsOfISO(max)}),
    [min, max],
  );
  const shown = displayedTime(time, minuteInterval, hasSeconds);

  const hourOptions = useMemo(
    () => hourRows(shown.hour, hourFormat, bounds),
    [shown.hour, hourFormat, bounds],
  );
  const minuteOptions = useMemo(
    () => minuteRows(shown.hour, minuteInterval, hasSeconds, bounds),
    [shown.hour, minuteInterval, hasSeconds, bounds],
  );
  const secondOptions = useMemo(
    () => secondRows(shown.hour, shown.minute, bounds),
    [shown.hour, shown.minute, bounds],
  );
  const meridiemOptions = useMemo(
    () =>
      meridiemRows(
        {
          am: t('@astryx.dateTimeInput.meridiemAM'),
          pm: t('@astryx.dateTimeInput.meridiemPM'),
        },
        bounds,
      ),
    [t, bounds],
  );

  const hourRef = useRef<WheelHandle | null>(null);
  const minuteRef = useRef<WheelHandle | null>(null);
  const secondRef = useRef<WheelHandle | null>(null);
  const meridiemRef = useRef<WheelHandle | null>(null);

  // Read at rest, not captured per render: a commit lands between renders.
  const rows: Record<TimeColumn, TimeRow[]> = {
    hour: hourOptions,
    minute: minuteOptions,
    second: secondOptions,
    meridiem: meridiemOptions,
  };
  const latestRef = useRef({
    shown,
    bounds,
    hourFormat,
    hasSeconds,
    onCommit,
    rows,
  });
  useIsomorphicLayoutEffect(() => {
    latestRef.current = {shown, bounds, hourFormat, hasSeconds, onCommit, rows};
  });

  const restOn = (column: TimeColumn) => (value: number) => {
    const current = latestRef.current;
    const from = current.shown;
    const next = clampToBounds(
      turnColumn(from, column, value, current.hourFormat),
      current.bounds,
    );
    const handles: Record<TimeColumn, WheelHandle | null> = {
      hour: hourRef.current,
      minute: minuteRef.current,
      second: secondRef.current,
      meridiem: meridiemRef.current,
    };
    // Turn the other columns first, so the commit's new value finds them
    // already moving (a Wheel never parks a moving column).
    for (const turn of columnsToTurn(from, column, value, next, {
      hourFormat: current.hourFormat,
      hasSeconds: current.hasSeconds,
    })) {
      const index = current.rows[turn.column].findIndex(
        row => row.value === turn.value,
      );
      if (index >= 0) {
        void handles[turn.column]?.spinTo(index, COLUMN_TURN);
      }
    }
    if (!sameTime(next, from)) {
      current.onCommit(next);
    }
  };

  return (
    <WheelGroup>
      <Wheel
        ref={hourRef}
        label={t('@astryx.dateTimeInput.hourWheel')}
        options={hourOptions}
        value={columnValue(shown, 'hour', hourFormat)}
        isLooping
        isActive={isActive}
        onChange={restOn('hour')}
      />
      <Wheel
        ref={minuteRef}
        label={t('@astryx.dateTimeInput.minuteWheel')}
        options={minuteOptions}
        value={shown.minute}
        isLooping
        isActive={isActive}
        onChange={restOn('minute')}
      />
      {hasSeconds && (
        <Wheel
          ref={secondRef}
          label={t('@astryx.dateTimeInput.secondWheel')}
          options={secondOptions}
          value={shown.second}
          isLooping
          isActive={isActive}
          onChange={restOn('second')}
        />
      )}
      {hourFormat === '12h' && (
        <Wheel
          ref={meridiemRef}
          label={t('@astryx.dateTimeInput.meridiemWheel')}
          options={meridiemOptions}
          value={meridiemOf(shown.hour)}
          isActive={isActive}
          onChange={restOn('meridiem')}
        />
      )}
    </WheelGroup>
  );
}

TimeWheels.displayName = 'TimeWheels';
