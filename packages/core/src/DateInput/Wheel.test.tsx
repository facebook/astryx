// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Wheel.test.tsx
 * @input Uses Vitest, Testing Library, the Wheel column and touch events
 *   dispatched through the gesture system with a fake clock
 * @output Proves what a wheel commits and when: a drag, a release onto a row,
 *   past the bounds, a fling, a tap, a finger catching a moving wheel, the
 *   keyboard, a click, a programmatic spin, looping, a custom rest rule
 * @position Unit coverage for Wheel.tsx; the curves themselves are proven in
 *   wheelPhysics.test.ts and wheelDrum.test.ts, and on screen by the browser
 *   specs
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {createRef} from 'react';
import {afterAll, afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {
  nearestEnabledIndex,
  Wheel,
  type WheelHandle,
  type WheelOption,
  type WheelProps,
} from './Wheel';
import {rowTransform} from './wheelDrum';

const ROW = 32;
const RADIUS = 97.2;
/** The column is laid out 216 px tall, its band's centre 108 px down. */
const CENTRE = 108;

/** Hours 0-23 with 09:00-17:00 bounds: 0-8 and 18-23 are disabled. */
const HOURS: WheelOption[] = Array.from({length: 24}, (_, hour) => ({
  value: hour,
  label: String(hour).padStart(2, '0'),
  isDisabled: hour < 9 || hour > 17,
}));

const MINUTES: WheelOption[] = Array.from({length: 60}, (_, minute) => ({
  value: minute,
  label: String(minute).padStart(2, '0'),
}));

describe('nearestEnabledIndex', () => {
  it('keeps an enabled row', () => {
    expect(nearestEnabledIndex(HOURS, 12, 10)).toBe(12);
  });

  it('goes to the bound on the side the wheel stopped on', () => {
    expect(nearestEnabledIndex(HOURS, 7, 10)).toBe(9);
    expect(nearestEnabledIndex(HOURS, 0, 10)).toBe(9);
    expect(nearestEnabledIndex(HOURS, 20, 10)).toBe(17);
    expect(nearestEnabledIndex(HOURS, 23, 10)).toBe(17);
  });

  it('breaks a tie toward the committed row', () => {
    const gap: WheelOption[] = [
      {value: 0, label: '0'},
      {value: 1, label: '1', isDisabled: true},
      {value: 2, label: '2'},
    ];
    expect(nearestEnabledIndex(gap, 1, 0)).toBe(0);
    expect(nearestEnabledIndex(gap, 1, 2)).toBe(2);
  });

  it('stays on the committed row when no row is enabled', () => {
    const none = HOURS.map(option => ({...option, isDisabled: true}));
    expect(nearestEnabledIndex(none, 3, 10)).toBe(10);
  });
});

// One fake clock for the whole file: the gesture system is one per document
// and keeps its own timeline, so time must never run backwards between tests.
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
  // Let every motion and gesture timer of the test run out.
  vi.advanceTimersByTime(10_000);
});

afterAll(() => {
  vi.useRealTimers();
});

function renderWheel(
  props: Partial<WheelProps> & {ref?: WheelProps['ref']} = {},
) {
  const onChange = vi.fn();
  const view = render(
    <Wheel
      label="Hour"
      options={HOURS}
      value={10}
      onChange={onChange}
      {...props}
    />,
  );
  const column = screen.getByRole('listbox', {name: props.label ?? 'Hour'});
  column.getBoundingClientRect = () => ({
    top: 0,
    bottom: 216,
    left: 0,
    right: 120,
    width: 120,
    height: 216,
    x: 0,
    y: 0,
    toJSON() {},
  });
  const option = (label: string): HTMLElement =>
    screen.getByRole('option', {name: label});
  return {...view, onChange, column, option};
}

/** Each finger gets its own identifier, as a new contact does. */
let nextFinger = 1;
let finger = 0;

/** One touch event at the fake clock's time. */
function touch(
  type: 'touchstart' | 'touchmove' | 'touchend',
  target: Element,
  y: number,
) {
  if (type === 'touchstart') {
    finger = nextFinger++;
  }
  const event = new Event(type, {bubbles: true, cancelable: true});
  const entry = {identifier: finger, clientX: 60, clientY: y, target};
  Object.defineProperty(event, 'changedTouches', {value: [entry]});
  Object.defineProperty(event, 'touches', {
    value: type === 'touchend' ? [] : [entry],
  });
  Object.defineProperty(event, 'timeStamp', {value: performance.now()});
  act(() => {
    target.dispatchEvent(event);
  });
}

/**
 * A finger that lands at `from`, moves to `to` in `steps` events `interval`
 * ms apart, optionally holds still, and lifts.
 */
function drag(
  target: Element,
  from: number,
  to: number,
  {steps = 10, interval = 16, hold = 0} = {},
) {
  touch('touchstart', target, from);
  for (let i = 1; i <= steps; i++) {
    act(() => {
      vi.advanceTimersByTime(interval);
    });
    touch('touchmove', target, from + ((to - from) * i) / steps);
  }
  if (hold > 0) {
    act(() => {
      vi.advanceTimersByTime(hold);
    });
  }
  touch('touchend', target, to);
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/** The angle a row is drawn at, from its inline transform. */
function angleOf(element: Element): number {
  const match = /rotateX\((-?[\d.]+)rad\)/.exec(
    (element as HTMLElement).style.transform,
  );
  return match ? -Number(match[1]) : NaN;
}

describe('Wheel — at rest', () => {
  it('is a listbox with one option per row, each label once', () => {
    const {column} = renderWheel();
    expect(screen.getAllByRole('option')).toHaveLength(24);
    // The band's magnified copy is generated content, not text.
    expect(screen.getAllByText('10')).toHaveLength(1);
    expect(column).toHaveAttribute('tabindex', '0');
  });

  it('parks the committed row under the band, the others on the cylinder', () => {
    const {option, column} = renderWheel();
    expect(option('10').style.transform).toBe(rowTransform(0));
    expect(angleOf(option('11'))).toBeCloseTo(ROW / RADIUS, 4);
    expect(angleOf(option('09'))).toBeCloseTo(-ROW / RADIUS, 4);
    expect(column.getAttribute('aria-activedescendant')).toBe(option('10').id);
  });

  it('shows a value set from outside without motion', () => {
    const {rerender, option, onChange} = renderWheel();
    rerender(
      <Wheel label="Hour" options={HOURS} value={14} onChange={onChange} />,
    );
    expect(option('14').style.transform).toBe(rowTransform(0));
  });
});

describe('Wheel — a finger', () => {
  it('drags the rows with it, without committing until the wheel rests', () => {
    const {column, option, onChange} = renderWheel();
    touch('touchstart', column, 150);
    for (let i = 1; i <= 8; i++) {
      advance(16);
      touch('touchmove', column, 150 - i * 6);
    }
    // 48 px of travel, 10 of it the pan's hysteresis: 38 px up.
    expect(angleOf(option('10'))).toBeCloseTo(-38 / RADIUS, 3);
    expect(onChange).not.toHaveBeenCalled();
    touch('touchend', column, 102);
    advance(2000);
  });

  it('eases onto the nearest row after a slow release and commits it there', () => {
    const {column, onChange} = renderWheel();
    // 10 px of hysteresis + 40 px: 1.25 rows, held still, lifted.
    drag(column, 150, 100, {steps: 25, interval: 40, hold: 300});
    expect(onChange).not.toHaveBeenCalled();
    advance(1000);
    expect(onChange).toHaveBeenCalledWith(11);
  });

  it('turns on to the minimum after resting below it, and commits that', () => {
    const {column, option, onChange} = renderWheel();
    // Down 3 rows (+10 px of hysteresis): the wheel rests on 07, disabled.
    drag(column, 60, 60 + 10 + 3 * ROW, {steps: 30, interval: 40, hold: 300});
    advance(100);
    expect(onChange).not.toHaveBeenCalled();
    advance(2000);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(9);
    expect(option('09').style.transform).toBe(rowTransform(0));
  });

  it('flings across several rows before committing', () => {
    const {column, onChange} = renderWheel({
      options: MINUTES,
      value: 10,
      label: 'Minute',
    });
    drag(column, 180, 60, {steps: 6, interval: 16});
    advance(200);
    expect(onChange).not.toHaveBeenCalled();
    advance(4000);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeGreaterThan(15);
  });

  it('rubber-bands past the last row and returns to it', () => {
    const {column, option, onChange} = renderWheel({value: 17});
    // Up far past hour 23.
    drag(column, 200, 20, {steps: 30, interval: 30, hold: 300});
    // Past the end, the last row has moved above the band by less than the
    // finger travelled.
    advance(3000);
    // It rests on 23 (disabled), then turns back onto 17.
    advance(2000);
    expect(onChange).not.toHaveBeenCalledWith(23);
    expect(option('17').style.transform).toBe(rowTransform(0));
  });

  it('is stopped where it is by a finger that lands on it, and commits nothing', () => {
    const {column, option, onChange} = renderWheel({
      options: MINUTES,
      value: 10,
      label: 'Minute',
    });
    drag(column, 180, 60, {steps: 6, interval: 16});
    advance(150);
    const caught = angleOf(option('10'));
    touch('touchstart', column, 100);
    advance(50);
    expect(angleOf(option('10'))).toBeCloseTo(caught, 1);
    touch('touchend', column, 100);
    // A catch is not a tap: no turn onto the touched row, only the snap.
    advance(1000);
    expect(onChange).toHaveBeenCalledTimes(1);
    const rested = onChange.mock.calls[0][0] as number;
    expect(Math.abs(angleOf(option(String(rested).padStart(2, '0'))))).toBe(0);
  });

  it('turns onto a tapped row and commits it on arrival', () => {
    const {column, onChange} = renderWheel();
    const below = CENTRE + RADIUS * Math.sin(ROW / RADIUS);
    touch('touchstart', column, below);
    advance(60);
    touch('touchend', column, below);
    expect(onChange).not.toHaveBeenCalled();
    advance(310);
    expect(onChange).toHaveBeenCalledWith(11);
  });

  it('does nothing for a tap on the band’s row', () => {
    const {column, onChange} = renderWheel();
    touch('touchstart', column, CENTRE);
    advance(60);
    touch('touchend', column, CENTRE);
    advance(500);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores fingers while hidden', () => {
    const {column, option, onChange} = renderWheel({isActive: false});
    const before = option('10').style.transform;
    drag(column, 150, 60, {steps: 10, interval: 16});
    advance(3000);
    expect(onChange).not.toHaveBeenCalled();
    expect(option('10').style.transform).toBe(before);
  });
});

describe('Wheel — keyboard and clicks', () => {
  it('commits each arrow key at once, stepping from the row it is heading to', () => {
    const {column, onChange} = renderWheel();
    fireEvent.keyDown(column, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith(11);
    fireEvent.keyDown(column, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith(12);
  });

  it('skips disabled rows and stops at the bounds', () => {
    const {column, onChange} = renderWheel({value: 9});
    fireEvent.keyDown(column, {key: 'ArrowUp'});
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(column, {key: 'End'});
    expect(onChange).toHaveBeenLastCalledWith(17);
  });

  it('commits a clicked row at once and never a disabled one', () => {
    const {option, onChange} = renderWheel();
    fireEvent.click(option('07'));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(option('13'));
    expect(onChange).toHaveBeenCalledWith(13);
  });
});

describe('Wheel — mechanics for its owners', () => {
  it('spins to a row on request and commits it there', async () => {
    const ref = createRef<WheelHandle>();
    const {onChange} = renderWheel({ref});
    let arrived: boolean | undefined;
    act(() => {
      void ref.current!.spinTo(15).then(value => {
        arrived = value;
      });
    });
    advance(310);
    await act(async () => {});
    expect(arrived).toBe(true);
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('reports a spin a finger interrupted', async () => {
    const ref = createRef<WheelHandle>();
    const {column} = renderWheel({ref});
    let arrived: boolean | undefined;
    act(() => {
      void ref.current!.spinTo(15).then(value => {
        arrived = value;
      });
    });
    advance(100);
    touch('touchstart', column, 100);
    await act(async () => {});
    expect(arrived).toBe(false);
  });

  it('loops: the first row follows the last', () => {
    const {column, option, onChange} = renderWheel({
      options: MINUTES,
      value: 59,
      label: 'Minute',
      isLooping: true,
    });
    // Minute 00 is drawn just below 59.
    expect(angleOf(option('00'))).toBeCloseTo(ROW / RADIUS, 4);
    fireEvent.keyDown(column, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('rests where its owner’s rule says', () => {
    // Only even hours: an odd rest moves on to the next even hour.
    const {column, onChange} = renderWheel({
      options: HOURS.map(option => ({...option, isDisabled: false})),
      resolveRest: index => (index % 2 === 0 ? index : index + 1),
    });
    drag(column, 150, 100, {steps: 25, interval: 40, hold: 300});
    advance(2000);
    expect(onChange).toHaveBeenLastCalledWith(12);
  });

  it('keeps a spin going when its owner re-renders the rows mid-turn', async () => {
    const ref = createRef<WheelHandle>();
    const {rerender, onChange} = renderWheel({
      ref,
      options: MINUTES,
      value: 15,
      label: 'Minute',
    });
    let arrived: boolean | undefined;
    act(() => {
      void ref.current!.spinTo(30).then(value => {
        arrived = value;
      });
    });
    advance(100);
    // The owner commits a time on its bound: the minutes before 30 are
    // disabled now. The same row nodes come back, so the turn goes on.
    rerender(
      <Wheel
        ref={ref}
        label="Minute"
        options={MINUTES.map(option => ({
          ...option,
          isDisabled: option.value < 30,
        }))}
        value={30}
        onChange={onChange}
      />,
    );
    advance(250);
    await act(async () => {});
    expect(arrived).toBe(true);
  });

  it('keeps coasting when its owner hands it a copy of the same rows', () => {
    const {column, rerender, onChange} = renderWheel({
      options: MINUTES,
      value: 10,
      label: 'Minute',
    });
    drag(column, 180, 60, {steps: 6, interval: 16});
    advance(200);
    rerender(
      <Wheel
        label="Minute"
        options={MINUTES.map(option => ({...option}))}
        value={10}
        onChange={onChange}
      />,
    );
    advance(4000);
    // It came to rest on a row and committed it, as without the re-render.
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeGreaterThan(15);
  });
});
