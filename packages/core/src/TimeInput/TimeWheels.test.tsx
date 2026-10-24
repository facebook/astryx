// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TimeWheels.test.tsx
 * @input vitest, @testing-library/react, TimeWheels
 * @output Checks UIDatePicker's time wheels as one picker: the AM/PM column
 *   follows the hour and turns (never jumps) onto its new row, the hour and
 *   minute columns loop, minutes do not carry, the minute interval, and a
 *   time past a bound commits as the bound with the other columns turning
 *   onto it
 * @position Testing; the pure rules are timeWheelRules.test.ts
 */

import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {useState} from 'react';
import {afterAll, afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import type {ISOTimeString} from '../utils';
import {TimeWheels} from './TimeWheels';
import {minuteIntervalOf, type TimeParts} from './timeWheelRules';

// One fake clock for the whole file, as the Wheel's own tests: the gesture
// system keeps one timeline per document.
beforeAll(() => {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'performance',
      'Date',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
  });
});

afterEach(() => {
  vi.advanceTimersByTime(10_000);
});

afterAll(() => {
  vi.useRealTimers();
});

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function Harness({
  initial,
  hourFormat = '12h',
  increment,
  min,
  max,
  onCommit,
}: {
  initial: TimeParts;
  hourFormat?: '12h' | '24h';
  increment?: number;
  min?: ISOTimeString;
  max?: ISOTimeString;
  onCommit: (time: TimeParts) => void;
}) {
  const [time, setTime] = useState(initial);
  return (
    <TimeWheels
      time={time}
      hourFormat={hourFormat}
      hasSeconds={false}
      minuteInterval={minuteIntervalOf(increment)}
      min={min}
      max={max}
      isActive
      onCommit={next => {
        onCommit(next);
        setTime(next);
      }}
    />
  );
}

function renderWheels(props: Omit<Parameters<typeof Harness>[0], 'onCommit'>) {
  const onCommit = vi.fn();
  render(<Harness {...props} onCommit={onCommit} />);
  return {onCommit};
}

const column = (name: string) => screen.getByRole('listbox', {name});

/** The label of the row at rest under the band. */
function restingLabel(name: string): string | null {
  const list = column(name);
  const id = list.getAttribute('aria-activedescendant');
  return id == null ? null : (document.getElementById(id)?.textContent ?? null);
}

const at = (hour: number, minute: number): TimeParts => ({
  hour,
  minute,
  second: 0,
});

describe('TimeWheels — the AM/PM column follows the hour', () => {
  it('turns AM to PM when the hour goes from 11 to 12, turning the AM/PM column', () => {
    const {onCommit} = renderWheels({initial: at(11, 58)});
    fireEvent.keyDown(column('Hour'), {key: 'ArrowDown'});
    expect(onCommit).toHaveBeenLastCalledWith(at(12, 58));
    // Mid-turn the AM/PM column has not arrived yet: it turns, never jumps.
    advance(150);
    expect(restingLabel('AM/PM')).toBe('AM');
    advance(400);
    expect(restingLabel('AM/PM')).toBe('PM');
    expect(
      within(column('AM/PM')).getByRole('option', {name: 'PM'}),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('turns PM back to AM from 12 to 11', () => {
    const {onCommit} = renderWheels({initial: at(12, 58)});
    fireEvent.keyDown(column('Hour'), {key: 'ArrowUp'});
    expect(onCommit).toHaveBeenLastCalledWith(at(11, 58));
    advance(550);
    expect(restingLabel('AM/PM')).toBe('AM');
  });

  it('keeps the half of the day from 12 to 1', () => {
    const {onCommit} = renderWheels({initial: at(12, 58)});
    fireEvent.keyDown(column('Hour'), {key: 'ArrowDown'});
    expect(onCommit).toHaveBeenLastCalledWith(at(13, 58));
    advance(550);
    expect(restingLabel('AM/PM')).toBe('PM');
  });

  it('loops the hour: 11 PM, one row on, is 12 AM', () => {
    const {onCommit} = renderWheels({initial: at(23, 15)});
    fireEvent.keyDown(column('Hour'), {key: 'ArrowDown'});
    expect(onCommit).toHaveBeenLastCalledWith(at(0, 15));
    advance(550);
    expect(restingLabel('Hour')).toBe('12');
    expect(restingLabel('AM/PM')).toBe('AM');
  });

  it('leaves the hour on its row when the AM/PM column turns', () => {
    const {onCommit} = renderWheels({initial: at(9, 30)});
    fireEvent.keyDown(column('AM/PM'), {key: 'ArrowDown'});
    expect(onCommit).toHaveBeenLastCalledWith(at(21, 30));
    advance(550);
    expect(restingLabel('Hour')).toBe('9');
  });
});

describe('TimeWheels — minutes', () => {
  it('loop without carrying into the hour', () => {
    const {onCommit} = renderWheels({initial: at(12, 58)});
    for (let i = 0; i < 4; i++) {
      fireEvent.keyDown(column('Minute'), {key: 'ArrowDown'});
    }
    expect(onCommit).toHaveBeenLastCalledWith(at(12, 2));
    advance(550);
    expect(restingLabel('Hour')).toBe('12');
  });

  it('step by the minute interval', () => {
    renderWheels({initial: at(10, 0), increment: 15});
    expect(
      within(column('Minute'))
        .getAllByRole('option')
        .map(option => option.textContent),
    ).toEqual(['00', '15', '30', '45']);
  });

  it('show a time off the interval rounded to it, without committing it', () => {
    const {onCommit} = renderWheels({initial: at(10, 58), increment: 15});
    expect(restingLabel('Hour')).toBe('11');
    expect(restingLabel('Minute')).toBe('00');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('ignore an interval that does not divide 60', () => {
    renderWheels({initial: at(10, 0), increment: 7});
    expect(within(column('Minute')).getAllByRole('option')).toHaveLength(60);
  });
});

describe('TimeWheels — bounds', () => {
  it('commit a time past a bound as the bound, turning the other columns onto it', () => {
    const {onCommit} = renderWheels({
      initial: at(10, 15),
      min: '09:30' as ISOTimeString,
    });
    fireEvent.keyDown(column('Hour'), {key: 'ArrowUp'});
    expect(onCommit).toHaveBeenLastCalledWith(at(9, 30));
    // The commit re-disables minutes 00-29 mid-turn: the column keeps turning.
    advance(150);
    expect(restingLabel('Minute')).toBe('15');
    advance(400);
    expect(restingLabel('Hour')).toBe('9');
    expect(restingLabel('Minute')).toBe('30');
  });

  it('bring an AM/PM turn past the maximum back onto it', () => {
    const {onCommit} = renderWheels({
      initial: at(11, 30),
      min: '09:00' as ISOTimeString,
      max: '17:00' as ISOTimeString,
    });
    fireEvent.keyDown(column('AM/PM'), {key: 'ArrowDown'});
    expect(onCommit).toHaveBeenLastCalledWith(at(17, 0));
    advance(550);
    expect(restingLabel('Hour')).toBe('5');
    expect(restingLabel('Minute')).toBe('00');
    expect(restingLabel('AM/PM')).toBe('PM');
  });
});
