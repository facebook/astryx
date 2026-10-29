// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PickerWheel.test.tsx
 * @input Uses Vitest, Testing Library, the touch picker column and touch events
 *   dispatched through the gesture system with a fake clock
 * @output Proves what a wheel commits and when: a drag, a release onto a row,
 *   past the bounds, a fling, a tap, a finger catching a moving wheel, the
 *   keyboard, a click, a programmatic spin, looping, a custom rest rule
 * @position Unit coverage for PickerWheel.tsx (the Wheel under a finger;
 *   Wheel.test.tsx covers the switch and today's column); the curves themselves are proven in
 *   wheelPhysics.test.ts and wheelDrum.test.ts, and on screen by the browser
 *   specs
 */

import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {Profiler, createRef} from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {timing} from '../motion/uikit';
import {colorVars, fontWeightVars} from '../theme/tokens.stylex';
import {PickerWheel} from './PickerWheel';
import type {WheelHandle, WheelOption, WheelProps} from './wheelOptions';
import {WHEEL_ROW_PITCH, todayLook} from './wheelLook';

const ROW = WHEEL_ROW_PITCH;
/** The column is laid out 216 px tall, its band's centre 108 px down. */
const CENTRE = 108;
/** The row resting on the band, as today's look draws it in that column. */
const AT_BAND = `translateY(0px) ${todayLook(2 * CENTRE).rowFrame(0).transform}`;

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

// The touch column draws only where the primary pointer is coarse, and only
// there does the gesture host take input (spec:AST-094 FR19): every case runs
// under a coarse primary pointer, as on a phone or a tablet.
beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(pointer: coarse)',
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

afterEach(() => {
  // Let every motion and gesture timer of the test run out.
  vi.advanceTimersByTime(10_000);
  vi.unstubAllGlobals();
});

afterAll(() => {
  vi.useRealTimers();
});

function renderWheel(
  props: Partial<WheelProps> & {ref?: WheelProps['ref']} = {},
) {
  const onChange = vi.fn();
  const view = render(
    <PickerWheel
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

/**
 * How far below the band's centre a row is drawn: its place along the
 * strip, the strip's translation, and any whole cycles a looping row moves.
 */
function distanceOf(element: Element): number {
  const row = element as HTMLElement;
  const strip = row.parentElement!;
  const index = Array.prototype.indexOf.call(strip.children, row);
  const translateY = (transform: string) =>
    Number(/translateY\((-?[\d.]+)px\)/.exec(transform)?.[1] ?? 0);
  return (
    index * ROW +
    translateY(strip.style.transform) +
    translateY(row.style.transform)
  );
}

describe('PickerWheel — at rest', () => {
  it('is a listbox with one option per row, each label once', () => {
    const {column} = renderWheel();
    expect(screen.getAllByRole('option')).toHaveLength(24);
    // Each option is drawn once, as its own row.
    expect(screen.getAllByText('10')).toHaveLength(1);
    expect(column).toHaveAttribute('tabindex', '0');
  });

  it('parks the committed row under the band, the others on the cylinder', () => {
    const {option, column} = renderWheel();
    expect(option('10').style.transform).toBe(AT_BAND);
    expect(distanceOf(option('11'))).toBeCloseTo(ROW, 2);
    expect(distanceOf(option('09'))).toBeCloseTo(-ROW, 2);
    expect(column.getAttribute('aria-activedescendant')).toBe(option('10').id);
  });

  it('points the active row at a value set from outside in the same commit', () => {
    // One entry per commit: the active descendant the listbox shows then.
    const commits: (string | null)[] = [];
    const onRender = () => {
      commits.push(
        screen
          .getByRole('listbox', {name: 'Hour'})
          .getAttribute('aria-activedescendant'),
      );
    };
    const wheel = (value: number) => (
      <Profiler id="wheel" onRender={onRender}>
        <PickerWheel
          label="Hour"
          options={HOURS}
          value={value}
          onChange={() => {}}
        />
      </Profiler>
    );
    const {rerender} = render(wheel(10));
    commits.length = 0;
    rerender(wheel(12));
    expect(commits).toEqual([screen.getByRole('option', {name: '12'}).id]);
  });

  it('opening on a value outside the bounds commits nothing', () => {
    const {onChange, column, option} = renderWheel({value: 8});
    advance(2000);
    expect(onChange).not.toHaveBeenCalled();
    expect(column.getAttribute('aria-activedescendant')).toBe(option('08').id);
  });

  it('rests back on a committed value outside the bounds and commits nothing', () => {
    // component:DateInput FR13: a wheel resting on its committed row commits
    // nothing, even outside the bounds, as the scrolling column keeps it.
    const {column, option, onChange} = renderWheel({value: 8});
    advance(2000);
    // One gesture: up a row onto 09 (enabled), back down onto 08, held
    // still, lifted.
    const away = 10 + ROW;
    touch('touchstart', column, 100);
    for (let i = 1; i <= 15; i++) {
      advance(40);
      touch('touchmove', column, 100 - (away * i) / 15);
    }
    for (let i = 1; i <= 15; i++) {
      advance(40);
      touch('touchmove', column, 100 - away + (away * i) / 15);
    }
    advance(300);
    touch('touchend', column, 100);
    advance(2000);
    expect(onChange).not.toHaveBeenCalled();
    expect(option('08').style.transform).toBe(AT_BAND);
    // Back on the row it left, the band's mark is back on it too.
    expect(isMarked(option('08'))).toBe(true);
  });

  it('turns onto a value set from outside while it is shown, as a bound clamping the time (component:DateInput FR13)', () => {
    // jsdom runs no Web Animations: record what the wheel asks of its strip.
    const strips: Keyframe[][] = [];
    Element.prototype.animate = vi.fn(function animate(
      this: Element,
      keyframes: Keyframe[],
    ) {
      if (this.hasAttribute('data-wheel-strip')) {
        strips.push(keyframes);
      }
      return {cancel: () => {}} as unknown as Animation;
    });
    try {
      const {rerender, option, onChange} = renderWheel();
      rerender(
        <PickerWheel
          label="Hour"
          options={HOURS}
          value={14}
          onChange={onChange}
        />,
      );
      // From 10 onto 14 through the rows between: a turn, never a jump.
      expect(strips).toHaveLength(1);
      const ys = strips[0].map(frame =>
        Number(/translateY\((-?[\d.]+)px\)/.exec(String(frame.transform))?.[1]),
      );
      expect(ys[0]).toBeCloseTo(-10 * ROW, 1);
      expect(ys[ys.length - 1]).toBeCloseTo(-14 * ROW, 1);
      expect(
        ys.filter(y => y < -10 * ROW - 1 && y > -14 * ROW + 1).length,
      ).toBeGreaterThanOrEqual(4);
      advance(2000);
      expect(option('14').style.transform).toBe(AT_BAND);
      expect(isMarked(option('14'))).toBe(true);
      expect(onChange).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(Element.prototype, 'animate');
    }
  });

  it('parks a value set while it is hidden at once when it is shown again', () => {
    const {rerender, option, onChange} = renderWheel();
    const wheel = (value: number, isActive: boolean) => (
      <PickerWheel
        label="Hour"
        options={HOURS}
        value={value}
        onChange={onChange}
        isActive={isActive}
      />
    );
    rerender(wheel(10, false));
    rerender(wheel(14, false));
    rerender(wheel(14, true));
    expect(option('14').style.transform).toBe(AT_BAND);
  });
});

/** Whether a row carries the band's mark: painted, or styled in render and not overridden. */
function isMarked(row: HTMLElement): boolean {
  if (row.style.fontWeight !== '') {
    return row.style.fontWeight === fontWeightVars['--font-weight-semibold'];
  }
  return row.className.includes('rowActive');
}

describe('PickerWheel — a finger', () => {
  it('turns text selection off while a finger holds it (spec:AST-094 FR41)', () => {
    // A held finger turns the wheel, so its pan takes the selection lock.
    // Outside iOS WebKit (jsdom here) the lock refuses a selection that
    // starts under the finger by cancelling `selectstart`, and writes no
    // style.
    const {column, option} = renderWheel();
    const refuses = () => {
      const event = new Event('selectstart', {bubbles: true, cancelable: true});
      option('10').dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(refuses()).toBe(false);
    touch('touchstart', column, CENTRE);
    expect(refuses()).toBe(true);
    expect(column.style.getPropertyValue('user-select')).toBe('');
    advance(300);
    touch('touchend', column, CENTRE);
    expect(refuses()).toBe(false);
  });

  it('marks no row while a fling coasts, then the row it rests on', () => {
    const {column, onChange} = renderWheel({
      options: MINUTES,
      value: 10,
      label: 'Minute',
    });
    const marked = () =>
      screen
        .getAllByRole('option')
        .filter(isMarked)
        .map(row => row.textContent);
    expect(marked()).toEqual(['10']);
    drag(column, 180, 60, {steps: 6, interval: 16});
    // The coast plays (jsdom shows its end inline, but no row is marked).
    expect(marked()).toEqual([]);
    advance(4000);
    expect(onChange).toHaveBeenCalledTimes(1);
    const rested = String(onChange.mock.calls[0][0]).padStart(2, '0');
    expect(marked()).toEqual([rested]);
  });

  it('drags the rows with it, without committing until the wheel rests', () => {
    const {column, option, onChange} = renderWheel();
    touch('touchstart', column, 150);
    for (let i = 1; i <= 8; i++) {
      advance(16);
      touch('touchmove', column, 150 - i * 6);
    }
    // 48 px of travel, 10 of it the pan's hysteresis: 38 px up.
    expect(distanceOf(option('10'))).toBeCloseTo(-38, 1);
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

  it('keeps the band’s mark on the committed row after a nudge that eases back onto it', () => {
    const {column, option, onChange} = renderWheel();
    expect(isMarked(option('10'))).toBe(true);
    // 10 px of hysteresis + a third of a row, held still, lifted.
    drag(column, 150, 150 - (10 + ROW / 3), {
      steps: 10,
      interval: 40,
      hold: 300,
    });
    advance(2000);
    expect(onChange).not.toHaveBeenCalled();
    expect(option('10').style.transform).toBe(AT_BAND);
    expect(isMarked(option('10'))).toBe(true);
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
    expect(option('09').style.transform).toBe(AT_BAND);
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
    expect(option('17').style.transform).toBe(AT_BAND);
  });

  it('is stopped where it is by a finger that lands on it, and commits nothing', () => {
    const {column, option, onChange} = renderWheel({
      options: MINUTES,
      value: 10,
      label: 'Minute',
    });
    drag(column, 180, 60, {steps: 6, interval: 16});
    advance(150);
    // jsdom runs no animations: a motion shows its end inline.
    const heading = distanceOf(option('10'));
    touch('touchstart', column, 100);
    const caught = distanceOf(option('10'));
    // Stopped where it was on screen, well short of where it was heading,
    // and held there.
    expect(Math.abs(caught - heading)).toBeGreaterThan(ROW);
    advance(50);
    expect(Math.abs(distanceOf(option('10')) - caught)).toBeLessThan(1);
    touch('touchend', column, 100);
    // A catch is not a tap: no turn onto the touched row, only the snap.
    advance(1000);
    expect(onChange).toHaveBeenCalledTimes(1);
    const rested = onChange.mock.calls[0][0] as number;
    expect(Math.abs(distanceOf(option(String(rested).padStart(2, '0'))))).toBe(
      0,
    );
  });

  it('turns onto a tapped row and commits it on arrival', () => {
    const {column, onChange} = renderWheel();
    const below = CENTRE + ROW;
    touch('touchstart', column, below);
    advance(60);
    touch('touchend', column, below);
    expect(onChange).not.toHaveBeenCalled();
    advance(310);
    expect(onChange).toHaveBeenCalledWith(11);
  });

  it('a finger’s tap turns once: its lift is cancelled, so the browser sends no click', () => {
    // spec:AST-094 FR19: the tap recognizer owns a finger's tap, and the
    // row's click handler is left to keys, assistive technology and a mouse.
    const {column, onChange} = renderWheel();
    const below = CENTRE + ROW;
    touch('touchstart', column, below);
    advance(60);
    const lift = new Event('touchend', {bubbles: true, cancelable: true});
    const entry = {
      identifier: finger,
      clientX: 60,
      clientY: below,
      target: column,
    };
    Object.defineProperty(lift, 'changedTouches', {value: [entry]});
    Object.defineProperty(lift, 'touches', {value: []});
    Object.defineProperty(lift, 'timeStamp', {value: performance.now()});
    act(() => {
      column.dispatchEvent(lift);
    });
    expect(lift.defaultPrevented).toBe(true);
    advance(310);
    expect(onChange).toHaveBeenCalledTimes(1);
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

  it('drops a drag it is hidden in, and parks the committed row when shown again', () => {
    const {column, onChange, option, rerender} = renderWheel();
    const props = {label: 'Hour', options: HOURS, value: 10, onChange};
    // A finger drags the rows two rows up; the wheel is hidden before it lifts.
    touch('touchstart', column, 150);
    for (let i = 1; i <= 6; i++) {
      advance(16);
      touch('touchmove', column, 150 - 12 * i);
    }
    expect(distanceOf(option('10'))).not.toBeCloseTo(0, 2);
    rerender(<PickerWheel {...props} isActive={false} />);
    touch('touchend', column, 78);
    advance(1000);
    rerender(<PickerWheel {...props} isActive />);
    advance(100);
    expect(onChange).not.toHaveBeenCalled();
    expect(distanceOf(option('10'))).toBeCloseTo(0, 4);
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

describe('PickerWheel — keyboard and clicks', () => {
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

  it('keeps the band’s mark on the last row when a key has nowhere further to go', () => {
    const {column, option, onChange} = renderWheel({
      options: MINUTES,
      value: 59,
      label: 'Minute',
    });
    fireEvent.keyDown(column, {key: 'ArrowDown'});
    advance(1000);
    expect(onChange).not.toHaveBeenCalled();
    expect(option('59').style.transform).toBe(AT_BAND);
    expect(isMarked(option('59'))).toBe(true);
  });

  it('never steps the long way round a loop onto the far side of a disabled stretch', () => {
    // A year of months, looping, with only January and February enabled:
    // up from January is December, and the nearest enabled row to it is
    // January again, so the key stays where it is rather than turning
    // eleven rows round to February.
    const MONTHS: WheelOption[] = Array.from({length: 12}, (_, month) => ({
      value: month,
      label: `M${String(month + 1).padStart(2, '0')}`,
      isDisabled: month > 1,
    }));
    const {column, option, onChange} = renderWheel({
      options: MONTHS,
      value: 0,
      label: 'Month',
      isLooping: true,
    });
    fireEvent.keyDown(column, {key: 'ArrowUp'});
    advance(1000);
    expect(onChange).not.toHaveBeenCalled();
    expect(distanceOf(option('M01'))).toBeCloseTo(0, 1);
    fireEvent.keyDown(column, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('takes Home and End to the first and last enabled rows, even mid-coast', () => {
    const {column, onChange} = renderWheel({
      options: MINUTES,
      value: 10,
      label: 'Minute',
    });
    drag(column, 180, 60, {steps: 6, interval: 16});
    advance(200);
    // Still coasting, towards a row well past 10.
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(column, {key: 'Home'});
    expect(onChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(column, {key: 'End'});
    expect(onChange).toHaveBeenLastCalledWith(59);
  });

  it('commits a clicked row at once and never a disabled one', () => {
    const {option, onChange} = renderWheel();
    fireEvent.click(option('07'));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(option('13'));
    expect(onChange).toHaveBeenCalledWith(13);
  });
});

describe('PickerWheel — a mouse', () => {
  /** One mouse pointer event at the fake clock's time. */
  function mouse(
    type: 'pointerdown' | 'pointermove' | 'pointerup',
    target: Element,
    y: number,
    {button = 0, buttons = 1}: {button?: number; buttons?: number} = {},
  ) {
    const event = new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 41,
      pointerType: 'mouse',
      isPrimary: true,
      clientX: 60,
      clientY: y,
      button,
      buttons,
    });
    Object.defineProperty(event, 'timeStamp', {value: performance.now()});
    act(() => {
      target.dispatchEvent(event);
    });
  }

  /**
   * A slow drag up by `distance` px with `button` held (well under the
   * release velocity floor, so the wheel rests where it is let go), then a
   * release.
   */
  function mouseDrag(target: Element, distance: number, button = 0) {
    const buttons = button === 0 ? 1 : 2;
    mouse('pointerdown', target, 150, {button, buttons});
    for (let i = 1; i <= 25; i++) {
      advance(40);
      mouse('pointermove', target, 150 - (distance * i) / 25, {
        button: -1,
        buttons,
      });
    }
    advance(300);
    mouse('pointerup', target, 150 - distance, {button, buttons: 0});
  }

  it('turns with a primary-button drag and commits where it rests', () => {
    // A mouse on a touch device (a tablet's trackpad): the primary pointer
    // stays coarse.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(true);
    const {column, onChange} = renderWheel();
    // 10 px of hysteresis + 40 px: 1.25 rows.
    mouseDrag(column, 50);
    advance(1000);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(11);
  });

  it('does nothing for a secondary-button drag', () => {
    // A mouse on a touch device (a tablet's trackpad): the primary pointer
    // stays coarse.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(true);
    const {column, onChange} = renderWheel();
    mouseDrag(column, 50, 2);
    advance(2000);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('PickerWheel — a scroll wheel', () => {
  /** One wheel event over the column; returns whether it was cancelled. */
  function wheel(target: Element, deltaY: number, ctrlKey = false): boolean {
    const event = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY,
      ctrlKey,
    });
    act(() => {
      target.dispatchEvent(event);
    });
    return event.defaultPrevented;
  }

  it('turns with a scroll and rests on a row', () => {
    const {column, onChange} = renderWheel();
    // Two rows down.
    expect(wheel(column, 64)).toBe(true);
    advance(1000);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(12);
  });

  it('leaves a ctrl-wheel, a trackpad pinch, to the page (spec:AST-094 FR10, FR43)', () => {
    const {column, onChange} = renderWheel();
    expect(wheel(column, 64, true)).toBe(false);
    advance(1000);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('PickerWheel — under reduced motion', () => {
  const FADE_MS = timing.reducedMotionCrossFadeMs;
  /** Every animation the wheel started, with its keyframes and timing. */
  let animations: {keyframes: Keyframe[]; options: KeyframeAnimationOptions}[];

  beforeEach(() => {
    animations = [];
    vi.stubGlobal('matchMedia', (query: string) => ({
      // The touch column draws under a coarse primary pointer.
      matches:
        query === '(prefers-reduced-motion: reduce)' ||
        query === '(pointer: coarse)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    // jsdom runs no Web Animations: record what the wheel asks for.
    Element.prototype.animate = vi.fn(function animate(
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
    ) {
      animations.push({keyframes, options});
      return {cancel: () => {}} as unknown as Animation;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(Element.prototype, 'animate');
  });

  /**
   * Nothing travels, on the Reduce Motion fade (design:reduced-motion DR2):
   * the drawing's opacity dips out and back in, and the rows and the strip
   * hold where they are until the fade's midpoint, then step onto their
   * rows, on the compositor.
   */
  function expectFadesOnly() {
    let fades = 0;
    for (const {keyframes, options} of animations) {
      const properties = new Set(
        keyframes.flatMap(frame =>
          Object.keys(frame).filter(
            key => key !== 'offset' && key !== 'easing',
          ),
        ),
      );
      if (!properties.has('transform')) {
        expect([...properties]).toEqual(['opacity']);
        expect(options.duration).toBe(FADE_MS);
        fades += 1;
        continue;
      }
      // A landing: the origin held, then the destination, stepping at the
      // fade's midpoint.
      expect(keyframes).toHaveLength(4);
      const [origin, held, landed, end] = keyframes;
      expect(origin.offset).toBe(0);
      expect(held).toEqual({...origin, offset: held.offset});
      expect(landed.offset).toBe(held.offset);
      expect(end).toEqual({...landed, offset: 1});
      expect(Number(held.offset) * Number(options.duration)).toBeCloseTo(
        FADE_MS / 2,
        6,
      );
    }
    expect(fades).toBeGreaterThan(0);
  }

  it('coasts a fling as momentum, its rows flat, then commits it', () => {
    // design:reduced-motion DR2: the momentum that continues a throw is
    // direct movement, not a transition, so it plays; only the rows' tip
    // gives way to their fade.
    const {column, onChange} = renderWheel({
      options: MINUTES,
      value: 10,
      label: 'Minute',
    });
    drag(column, 180, 60, {steps: 6, interval: 16});
    expect(animations.length).toBeGreaterThan(0);
    for (const {keyframes, options} of animations) {
      expect(options.duration).toBeGreaterThan(FADE_MS);
      for (const frame of keyframes) {
        // The strip travels; the rows stay upright and full size.
        expect(String(frame.transform)).not.toMatch(
          /rotateX\((?!0deg)|scale\((?!1\))/,
        );
      }
    }
    expect(onChange).not.toHaveBeenCalled();
    advance(4000);
    expect(onChange).toHaveBeenCalledTimes(1);
    // The row the fling projects, as without the preference.
    expect(onChange.mock.calls[0][0]).toBeGreaterThan(15);
  });

  it('fades a slow release onto its row', () => {
    // A release that snaps is a transition the wheel starts: it cross-fades.
    const {column, onChange} = renderWheel();
    drag(column, 60, 60 + 10 + 1.4 * ROW, {steps: 20, interval: 40, hold: 300});
    expectFadesOnly();
    advance(FADE_MS);
    expect(onChange).toHaveBeenLastCalledWith(9);
  });

  it('fades for a tap, a key and a spin', async () => {
    const ref = createRef<WheelHandle>();
    const {column, onChange} = renderWheel({ref});
    const below = CENTRE + ROW;
    touch('touchstart', column, below);
    advance(60);
    touch('touchend', column, below);
    advance(FADE_MS);
    expect(onChange).toHaveBeenLastCalledWith(11);
    // A key steps from the row the wheel rests on (the tap's 11).
    fireEvent.keyDown(column, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith(12);
    advance(FADE_MS);
    let arrived: boolean | undefined;
    act(() => {
      void ref.current!.spinTo(15).then(value => {
        arrived = value;
      });
    });
    advance(FADE_MS);
    await act(async () => {});
    expect(arrived).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(15);
    expectFadesOnly();
  });
});

describe('PickerWheel — mechanics for its owners', () => {
  it('keeps a finger that lands on it from an enclosing sheet', () => {
    // A sheet arms its pull-down on its body's pointerdown.
    const onPointerDown = vi.fn();
    const onChange = vi.fn();
    render(
      <div onPointerDown={onPointerDown}>
        <PickerWheel
          label="Minute"
          options={MINUTES}
          value={10}
          onChange={onChange}
        />
      </div>,
    );
    const column = screen.getByRole('listbox', {name: 'Minute'});
    fireEvent.pointerDown(column, {
      pointerId: 7,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
    });
    expect(onPointerDown).not.toHaveBeenCalled();
  });

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

  it('turns nothing and reports false for a spin onto a row a rest would not keep', async () => {
    // As the scrolling column answers: a disabled row, an index outside the
    // rows, and a row the owner's rest moves off.
    const ref = createRef<WheelHandle>();
    const {option, onChange} = renderWheel({
      ref,
      resolveRest: index => (index % 2 === 0 ? index : index + 1),
    });
    for (const index of [3, 24, -1, 11]) {
      let arrived: boolean | undefined;
      act(() => {
        void ref.current!.spinTo(index).then(value => {
          arrived = value;
        });
      });
      await act(async () => {});
      expect(arrived, `spinTo(${index})`).toBe(false);
    }
    advance(1000);
    expect(onChange).not.toHaveBeenCalled();
    expect(option('10').style.transform).toBe(AT_BAND);
  });

  it('reports false for a spin still turning when the wheel goes away', async () => {
    const ref = createRef<WheelHandle>();
    const {unmount} = renderWheel({ref});
    const spin = ref.current!.spinTo(15);
    advance(100);
    unmount();
    await expect(spin).resolves.toBe(false);
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
    expect(distanceOf(option('00'))).toBeCloseTo(ROW, 2);
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
      <PickerWheel
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
      <PickerWheel
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

describe('PickerWheel — a short looping list', () => {
  /** A minute column every 15 minutes, and one every 30. */
  const QUARTERS: WheelOption[] = [0, 15, 30, 45].map(minute => ({
    value: minute,
    label: String(minute).padStart(2, '0'),
  }));
  const HALVES = QUARTERS.filter(option => option.value % 30 === 0);

  /** Every row the strip draws, its options' copies included. */
  function stripRowsOf(column: HTMLElement): HTMLElement[] {
    return [
      ...column.querySelectorAll<HTMLElement>(
        '[data-wheel-strip] > [data-label]',
      ),
    ];
  }

  /** The labels in sight, top to bottom. */
  function shownLabels(column: HTMLElement): string[] {
    return stripRowsOf(column)
      .filter(row => Number(row.style.opacity) > 0)
      .map(row => ({label: row.dataset.label!, distance: distanceOf(row)}))
      .sort((a, b) => a.distance - b.distance)
      .map(({label}) => label);
  }

  /** The row drawn on the band, by its place among the strip's rows. */
  function bandRow(column: HTMLElement): number {
    return stripRowsOf(column).findIndex(
      row => Math.abs(distanceOf(row)) < 1e-6,
    );
  }

  it('fills the column with copies, as UIPickerView’s looping table does', () => {
    const {column} = renderWheel({
      options: QUARTERS,
      value: 45,
      label: 'Minute',
      isLooping: true,
    });
    // At :45 the list runs on both ways down today's column, eleven rows in
    // sight (UIKit's cylinder shows the same run, nine rows).
    expect(shownLabels(column)).toEqual([
      '30',
      '45',
      '00',
      '15',
      '30',
      '45',
      '00',
      '15',
      '30',
      '45',
      '00',
    ]);
    // One option per value for assistive technology; the copies are hidden.
    expect(within(column).getAllByRole('option')).toHaveLength(4);
    for (const copy of column.querySelectorAll('[data-wheel-copy]')) {
      expect(copy).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('turns onto a tapped copy, and commits nothing when it holds the same value', () => {
    const {column, onChange} = renderWheel({
      options: HALVES,
      value: 30,
      label: 'Minute',
      isLooping: true,
    });
    expect(shownLabels(column)).toEqual([
      '00',
      '30',
      '00',
      '30',
      '00',
      '30',
      '00',
      '30',
      '00',
      '30',
      '00',
    ]);
    const rows = stripRowsOf(column).length;
    const start = bandRow(column);
    // Two rows below the band: the next copy of 30.
    const twoBelow = CENTRE + 2 * ROW;
    touch('touchstart', column, twoBelow);
    advance(60);
    touch('touchend', column, twoBelow);
    advance(500);
    expect((bandRow(column) - start + rows) % rows).toBe(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('steps by key in the key’s direction across the seam', () => {
    const {column, onChange} = renderWheel({
      options: QUARTERS,
      value: 45,
      label: 'Minute',
      isLooping: true,
    });
    const rows = stripRowsOf(column).length;
    const start = bandRow(column);
    fireEvent.keyDown(column, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith(0);
    advance(500);
    expect((bandRow(column) - start + rows) % rows).toBe(1);
  });

  it('stays put when a key would turn onto a copy of its own row', () => {
    // PageDown moves ten rows: on a two-row loop that is a copy of the row
    // under the band, so nothing turns and nothing commits.
    const {column, onChange} = renderWheel({
      options: HALVES,
      value: 30,
      label: 'Minute',
      isLooping: true,
    });
    const start = bandRow(column);
    fireEvent.keyDown(column, {key: 'PageDown'});
    advance(1000);
    expect(bandRow(column)).toBe(start);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('turns the shorter way round from a rest beside the seam onto the nearest enabled row', () => {
    // :00 and :15 disabled. One row on from :45 rests on :00, across the
    // seam: :45 is one row back, :30 two rows on, so it turns back to :45
    // and commits nothing.
    const {column, onChange} = renderWheel({
      options: QUARTERS.map(option => ({
        ...option,
        isDisabled: option.value === 0 || option.value === 15,
      })),
      value: 45,
      label: 'Minute',
      isLooping: true,
    });
    const rows = stripRowsOf(column).length;
    const start = bandRow(column);
    // 10 px of hysteresis + a row, held still, lifted.
    drag(column, 150, 150 - (10 + ROW), {steps: 25, interval: 40, hold: 300});
    advance(2000);
    expect((bandRow(column) - start + rows) % rows).toBe(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('repaints the band’s row in its new colour when the bounds change under it', () => {
    const {column, rerender, onChange} = renderWheel({
      options: QUARTERS,
      value: 15,
      label: 'Minute',
      isLooping: true,
    });
    const band = () => stripRowsOf(column)[bandRow(column)];
    expect(band().style.color).toBe(colorVars['--color-text-accent']);
    rerender(
      <PickerWheel
        label="Minute"
        options={QUARTERS.map(option => ({
          ...option,
          isDisabled: option.value === 15,
        }))}
        value={15}
        onChange={onChange}
        isLooping
      />,
    );
    expect(band().style.color).toBe(colorVars['--color-text-disabled']);
  });

  it('never turns a whole revolution when no other row is enabled', () => {
    // Only :15 is enabled, so an arrow key has nowhere to go.
    const {column, onChange} = renderWheel({
      options: QUARTERS.map(option => ({
        ...option,
        isDisabled: option.value !== 15,
      })),
      value: 15,
      label: 'Minute',
      isLooping: true,
    });
    const start = bandRow(column);
    fireEvent.keyDown(column, {key: 'ArrowDown'});
    advance(1000);
    expect(bandRow(column)).toBe(start);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('flings on through the seam, its copies drawn all the way', () => {
    const {column, onChange} = renderWheel({
      options: QUARTERS,
      value: 0,
      label: 'Minute',
      isLooping: true,
    });
    // 120 px in 90 ms, UIKit's measured fling: several turns of the list.
    drag(column, 180, 60, {steps: 6, interval: 15});
    advance(4000);
    // A full column at rest, and the value on the band committed.
    expect(shownLabels(column)).toHaveLength(11);
    const rested = Number(stripRowsOf(column)[bandRow(column)].dataset.label);
    if (rested === 0) {
      expect(onChange).not.toHaveBeenCalled();
    } else {
      expect(onChange).toHaveBeenLastCalledWith(rested);
    }
  });

  it('marks the copy on the band, wherever it is', () => {
    const {column} = renderWheel({
      options: QUARTERS,
      value: 45,
      label: 'Minute',
      isLooping: true,
    });
    const onBand = stripRowsOf(column)[bandRow(column)];
    expect(onBand.dataset.label).toBe('45');
    expect(onBand.style.fontWeight).not.toBe('');
    // The other copies of 45 in sight, the option itself among them, carry
    // no mark.
    const others = stripRowsOf(column).filter(
      row => row !== onBand && row.dataset.label === '45',
    );
    expect(others.length).toBeGreaterThan(1);
    for (const row of others) {
      expect(row.style.fontWeight).not.toBe(onBand.style.fontWeight);
    }
  });

  it('marks the band’s row when a short loop opens on its first row', () => {
    // Offset 0: parking moves nothing, so no new row is reported.
    const {column} = renderWheel({
      options: QUARTERS,
      value: 0,
      label: 'Minute',
      isLooping: true,
    });
    const onBand = stripRowsOf(column)[bandRow(column)];
    expect(onBand.dataset.label).toBe('00');
    expect(onBand.style.fontWeight).toBe(
      fontWeightVars['--font-weight-semibold'],
    );
  });

  it('keeps a disabled minute’s colour on a copy under the band', () => {
    const options = QUARTERS.map(option =>
      option.value === 30 ? {...option, isDisabled: true} : option,
    );
    const {column} = renderWheel({
      options,
      value: 45,
      label: 'Minute',
      isLooping: true,
    });
    // A finger holds the wheel a row back: the copy of 30 before the band's
    // 45 (itself a copy) reaches the band.
    touch('touchstart', column, CENTRE);
    advance(16);
    touch('touchmove', column, CENTRE + 20);
    advance(16);
    touch('touchmove', column, CENTRE + 20 + ROW);
    const near = [...stripRowsOf(column)].sort(
      (a, b) => Math.abs(distanceOf(a)) - Math.abs(distanceOf(b)),
    )[0];
    expect(near.dataset.label).toBe('30');
    expect(near.hasAttribute('data-wheel-copy')).toBe(true);
    expect(near.style.color).toBe(colorVars['--color-text-disabled']);
    touch('touchend', column, CENTRE + 20 + ROW);
  });

  it('keeps a two-row list that does not loop to its two rows (AM/PM)', () => {
    const {column} = renderWheel({
      options: [
        {value: 0, label: 'AM'},
        {value: 1, label: 'PM'},
      ],
      value: 0,
      label: 'AM/PM',
    });
    expect(shownLabels(column)).toEqual(['AM', 'PM']);
    expect(column.querySelectorAll('[data-wheel-copy]')).toHaveLength(0);
  });
});

describe('PickerWheel — markup', () => {
  // Written before the listbox wiring moved into useWheelListbox: the
  // snapshot holds the touch column to its markup.
  it('keeps the touch column’s markup', () => {
    const {column} = renderWheel();
    // React's generated ids depend on how many renders ran before.
    expect(
      column.parentElement?.innerHTML.replace(/_r_[0-9a-z]+_/g, '_r_id_'),
    ).toMatchSnapshot();
  });
});
