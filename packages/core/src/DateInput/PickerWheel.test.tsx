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
import {PickerWheel} from './PickerWheel';
import {WheelGroup, useWheelGroup} from './WheelGroup';
import type {WheelHandle, WheelOption, WheelProps} from './wheelOptions';
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
  /** The row as drawn on the drum (mounted only inside the window). */
  const row = (label: string): HTMLElement =>
    column.querySelector<HTMLElement>(
      `[data-wheel-drum] [data-label="${label}"]`,
    )!;
  return {...view, onChange, column, option, row};
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

describe('PickerWheel — at rest', () => {
  it('is a listbox with one option per row, each label once', () => {
    const {column} = renderWheel();
    expect(screen.getAllByRole('option')).toHaveLength(24);
    // The band's magnified copy is generated content, not text.
    expect(screen.getAllByText('10')).toHaveLength(1);
    expect(column).toHaveAttribute('tabindex', '0');
  });

  it('parks the committed row under the band, the others on the cylinder', () => {
    const {option, column, row} = renderWheel();
    expect(row('10').style.transform).toBe(rowTransform(0));
    expect(angleOf(row('11'))).toBeCloseTo(ROW / RADIUS, 4);
    expect(angleOf(row('09'))).toBeCloseTo(-ROW / RADIUS, 4);
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
    const {column, row, onChange} = renderWheel({value: 8});
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
    expect(row('08').style.transform).toBe(rowTransform(0));
  });

  it('shows a value set from outside without motion', () => {
    const {rerender, onChange, row} = renderWheel();
    rerender(
      <PickerWheel
        label="Hour"
        options={HOURS}
        value={14}
        onChange={onChange}
      />,
    );
    expect(row('14').style.transform).toBe(rowTransform(0));
  });
});

describe('PickerWheel — a finger', () => {
  it('turns text selection off while a finger holds it (spec:AST-094 FR41)', () => {
    // A held finger turns the wheel, so its pan takes the selection lock
    // (jsdom keeps only the standard property of the lock).
    const {column} = renderWheel();
    touch('touchstart', column, CENTRE);
    expect(column.style.getPropertyValue('user-select')).toBe('none');
    advance(300);
    touch('touchend', column, CENTRE);
    expect(column.style.getPropertyValue('user-select')).toBe('');
  });

  it('drags the rows with it, without committing until the wheel rests', () => {
    const {column, onChange, row} = renderWheel();
    touch('touchstart', column, 150);
    for (let i = 1; i <= 8; i++) {
      advance(16);
      touch('touchmove', column, 150 - i * 6);
    }
    // 48 px of travel, 10 of it the pan's hysteresis: 38 px up.
    expect(angleOf(row('10'))).toBeCloseTo(-38 / RADIUS, 3);
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
    const {column, onChange, row} = renderWheel();
    // Down 3 rows (+10 px of hysteresis): the wheel rests on 07, disabled.
    drag(column, 60, 60 + 10 + 3 * ROW, {steps: 30, interval: 40, hold: 300});
    advance(100);
    expect(onChange).not.toHaveBeenCalled();
    advance(2000);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(9);
    expect(row('09').style.transform).toBe(rowTransform(0));
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
    const {column, onChange, row} = renderWheel({value: 17});
    // Up far past hour 23.
    drag(column, 200, 20, {steps: 30, interval: 30, hold: 300});
    // Past the end, the last row has moved above the band by less than the
    // finger travelled.
    advance(3000);
    // It rests on 23 (disabled), then turns back onto 17.
    advance(2000);
    expect(onChange).not.toHaveBeenCalledWith(23);
    expect(row('17').style.transform).toBe(rowTransform(0));
  });

  it('is stopped where it is by a finger that lands on it, and commits nothing', () => {
    const {column, onChange, row} = renderWheel({
      options: MINUTES,
      value: 10,
      label: 'Minute',
    });
    drag(column, 180, 60, {steps: 6, interval: 16});
    advance(150);
    const caught = angleOf(row('10'));
    touch('touchstart', column, 100);
    advance(50);
    expect(angleOf(row('10'))).toBeCloseTo(caught, 1);
    touch('touchend', column, 100);
    // A catch is not a tap: no turn onto the touched row, only the snap.
    advance(1000);
    expect(onChange).toHaveBeenCalledTimes(1);
    const rested = onChange.mock.calls[0][0] as number;
    expect(Math.abs(angleOf(row(String(rested).padStart(2, '0'))))).toBe(0);
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
    const {column, onChange, row, rerender} = renderWheel();
    const props = {label: 'Hour', options: HOURS, value: 10, onChange};
    // A finger drags the rows two rows up; the wheel is hidden before it lifts.
    touch('touchstart', column, 150);
    for (let i = 1; i <= 6; i++) {
      advance(16);
      touch('touchmove', column, 150 - 12 * i);
    }
    expect(angleOf(row('10'))).not.toBeCloseTo(0, 2);
    rerender(<PickerWheel {...props} isActive={false} />);
    touch('touchend', column, 78);
    advance(1000);
    rerender(<PickerWheel {...props} isActive />);
    advance(100);
    expect(onChange).not.toHaveBeenCalled();
    expect(angleOf(row('10'))).toBeCloseTo(0, 4);
  });

  it('ignores fingers while hidden', () => {
    const {column, onChange, row} = renderWheel({isActive: false});
    const before = row('10').style.transform;
    drag(column, 150, 60, {steps: 10, interval: 16});
    advance(3000);
    expect(onChange).not.toHaveBeenCalled();
    expect(row('10').style.transform).toBe(before);
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

  it('coasts a fling as momentum, then commits it', () => {
    // design:reduced-motion DR2: the momentum that continues a throw is
    // direct movement, not a transition, so the cylinder coasts.
    const {column, onChange} = renderWheel({
      options: MINUTES,
      value: 10,
      label: 'Minute',
    });
    drag(column, 180, 60, {steps: 6, interval: 16});
    expect(animations.length).toBeGreaterThan(0);
    for (const {keyframes, options} of animations) {
      expect(options.duration).toBeGreaterThan(FADE_MS);
      expect(keyframes.some(frame => frame.transform != null)).toBe(true);
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

  it('fades for a tap, a key and a spin, whatever spin it is asked for', async () => {
    const ref = createRef<WheelHandle>();
    const {column, onChange} = renderWheel({ref});
    const below = CENTRE + RADIUS * Math.sin(ROW / RADIUS);
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
      void ref.current!.spinTo(15, {duration: 2}).then(value => {
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
    const {column, onChange, row} = renderWheel({
      options: MINUTES,
      value: 59,
      label: 'Minute',
      isLooping: true,
    });
    // Minute 00 is drawn just below 59.
    expect(angleOf(row('00'))).toBeCloseTo(ROW / RADIUS, 4);
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

describe('PickerWheel — a window of rows', () => {
  /** Years 1900-2099: a 200-row wheel. */
  const YEARS: WheelOption[] = Array.from({length: 200}, (_, i) => ({
    value: 1900 + i,
    label: String(1900 + i),
  }));
  /** Option indices drawn on the drum, and positions on the band strip. */
  const drumIndices = (column: HTMLElement) =>
    [...column.querySelectorAll<HTMLElement>('[data-wheel-drum] > *')].map(
      row => Number(row.dataset.index),
    );
  const stripLabels = (column: HTMLElement) =>
    [
      ...column.querySelectorAll<HTMLElement>(
        '[data-wheel-strip] [data-label]',
      ),
    ].map(label => label.dataset.label);

  it('draws only the rows around the band, and lists every option', () => {
    const {column} = renderWheel({options: YEARS, value: 2000, label: 'Year'});
    const drawn = drumIndices(column);
    // The cylinder's front half (5 rows each side) and a buffer of 2.
    expect(drawn).toHaveLength(15);
    expect(Math.min(...drawn)).toBe(93);
    expect(Math.max(...drawn)).toBe(107);
    // The band copy: the row under the band, one each side, and the buffer.
    expect(stripLabels(column)).toEqual([
      '1997',
      '1998',
      '1999',
      '2000',
      '2001',
      '2002',
      '2003',
    ]);
    expect(screen.getAllByRole('option')).toHaveLength(200);
    expect(column.getAttribute('aria-activedescendant')).toBe(
      screen.getByRole('option', {name: '2000'}).id,
    );
  });

  it('stops the window at the first and last rows', () => {
    const {column} = renderWheel({options: YEARS, value: 1900, label: 'Year'});
    expect(drumIndices(column)).toEqual(
      Array.from({length: 8}, (_, index) => index),
    );
  });

  it('draws every row a fling will pass before it plays, then settles back', () => {
    const {column, onChange} = renderWheel({
      options: YEARS,
      value: 2000,
      label: 'Year',
    });
    drag(column, 180, 60, {steps: 6, interval: 16});
    const during = drumIndices(column);
    expect(Math.max(...during)).toBeGreaterThan(107);
    advance(5000);
    const rest = onChange.mock.calls[0][0] - 1900;
    expect(rest).toBeGreaterThan(100);
    // Every row the coast shows was drawn for it: from the lift (about 104,
    // after the drag) to past the rest.
    expect(Math.min(...during)).toBeLessThanOrEqual(104 - 5);
    expect(Math.max(...during)).toBeGreaterThanOrEqual(rest + 5);
    const after = drumIndices(column);
    expect(after).toHaveLength(15);
    expect(Math.min(...after)).toBe(rest - 7);
  });

  it('moves the window ahead of a drag', () => {
    const {column} = renderWheel({options: YEARS, value: 2000, label: 'Year'});
    // A slow drag up 10 rows: the rows past the start's window are drawn
    // before the finger brings them into sight.
    touch('touchstart', column, 200);
    for (let i = 1; i <= 40; i++) {
      advance(40);
      touch('touchmove', column, 200 - i * 8);
    }
    expect(Math.max(...drumIndices(column))).toBeGreaterThanOrEqual(110 + 5);
    advance(40);
    touch('touchend', column, 200 - 320);
  });

  it('wraps a looping wheel window past its ends', () => {
    const {column} = renderWheel({
      options: MINUTES,
      value: 59,
      label: 'Minute',
      isLooping: true,
    });
    const drawn = drumIndices(column);
    // 59 ± 7, wrapping: 52-59, then 00-06.
    expect(drawn).toHaveLength(15);
    expect(drawn).toContain(0);
    expect(drawn).toContain(6);
    expect(drawn).toContain(52);
    expect(drawn).not.toContain(7);
    expect(drawn).not.toContain(51);
    // The band strip runs on past 59 into 00, 01…
    const labels = stripLabels(column);
    expect(labels.indexOf('00')).toBe(labels.indexOf('59') + 1);
  });

  it('reaches every option by keys, past the window', () => {
    const {column, onChange} = renderWheel({
      options: YEARS,
      value: 2000,
      label: 'Year',
    });
    fireEvent.keyDown(column, {key: 'End'});
    expect(onChange).toHaveBeenLastCalledWith(2099);
    advance(400);
    expect(drumIndices(column)).toContain(199);
  });
});

describe('PickerWheel — a short looping list', () => {
  /** A minute column every 15 minutes, and one every 30. */
  const QUARTERS: WheelOption[] = [0, 15, 30, 45].map(minute => ({
    value: minute,
    label: String(minute).padStart(2, '0'),
  }));
  const HALVES = QUARTERS.filter(option => option.value % 30 === 0);

  function drumRowsOf(column: HTMLElement): HTMLElement[] {
    return [
      ...column.querySelectorAll<HTMLElement>(
        '[data-wheel-drum] > [data-label]',
      ),
    ];
  }

  /** The labels on the front of the drum, top to bottom. */
  function frontLabels(column: HTMLElement): string[] {
    return drumRowsOf(column)
      .map(row => ({label: row.dataset.label!, angle: angleOf(row)}))
      .filter(({angle}) => Math.abs(angle) < Math.PI / 2 - 1e-6)
      .sort((a, b) => a.angle - b.angle)
      .map(({label}) => label);
  }

  /** The position of the copy under the band. */
  function bandPosition(column: HTMLElement): number {
    const row = drumRowsOf(column).find(
      element => Math.abs(angleOf(element)) < 1e-6,
    );
    return Number(row?.dataset.position);
  }

  it('fills the cylinder with copies, as UIPickerView’s looping table does', () => {
    const {column} = renderWheel({
      options: QUARTERS,
      value: 45,
      label: 'Minute',
      isLooping: true,
    });
    // UIKit at :45, top to bottom: 45 · 00 · 15 · 30 · 45 · 00 · 15 · 30 · 45.
    expect(frontLabels(column)).toEqual([
      '45',
      '00',
      '15',
      '30',
      '45',
      '00',
      '15',
      '30',
      '45',
    ]);
    // One option per value for assistive technology.
    expect(within(column).getAllByRole('option')).toHaveLength(4);
  });

  it('turns onto a tapped copy, and commits nothing when it holds the same value', () => {
    const {column, onChange} = renderWheel({
      options: HALVES,
      value: 30,
      label: 'Minute',
      isLooping: true,
    });
    expect(frontLabels(column)).toEqual([
      '30',
      '00',
      '30',
      '00',
      '30',
      '00',
      '30',
      '00',
      '30',
    ]);
    const start = bandPosition(column);
    // Two rows below the band: the next copy of 30.
    const twoBelow = CENTRE + RADIUS * Math.sin((2 * ROW) / RADIUS);
    touch('touchstart', column, twoBelow);
    advance(60);
    touch('touchend', column, twoBelow);
    advance(500);
    expect(bandPosition(column)).toBe(start + 2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('steps by key in the key’s direction across the seam', () => {
    const {column, onChange} = renderWheel({
      options: QUARTERS,
      value: 45,
      label: 'Minute',
      isLooping: true,
    });
    const start = bandPosition(column);
    fireEvent.keyDown(column, {key: 'ArrowDown'});
    expect(onChange).toHaveBeenLastCalledWith(0);
    advance(500);
    expect(bandPosition(column)).toBe(start + 1);
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
    const start = bandPosition(column);
    fireEvent.keyDown(column, {key: 'PageDown'});
    advance(1000);
    expect(bandPosition(column)).toBe(start);
    expect(onChange).not.toHaveBeenCalled();
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
    const start = bandPosition(column);
    fireEvent.keyDown(column, {key: 'ArrowDown'});
    advance(1000);
    expect(bandPosition(column)).toBe(start);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('flings on through the seam, its copies drawn all the way', () => {
    const {column, onChange} = renderWheel({
      options: QUARTERS,
      value: 0,
      label: 'Minute',
      isLooping: true,
    });
    // 120 px in 90 ms, UIKit's measured fling.
    drag(column, 180, 60, {steps: 6, interval: 15});
    advance(4000);
    // More than one turn of the list past the seam, and a full cylinder.
    expect(bandPosition(column)).toBeGreaterThan(4);
    expect(frontLabels(column)).toHaveLength(9);
    const rested = QUARTERS[((bandPosition(column) % 4) + 4) % 4].value;
    if (rested === 0) {
      expect(onChange).not.toHaveBeenCalled();
    } else {
      expect(onChange).toHaveBeenLastCalledWith(rested);
    }
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
    expect(frontLabels(column)).toEqual(['AM', 'PM']);
  });
});

describe('PickerWheel — in a group, and under a held finger', () => {
  it('hands its element to the wheels without keeping it in React state', () => {
    // The group draws its frame only in the iOS idiom: a coarse pointer in
    // WebKit on iOS.
    vi.stubGlobal('CSS', {
      supports: (condition: string) =>
        condition.includes('-webkit-touch-callout'),
    });
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query === '(pointer: coarse)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    try {
      let seen: ReturnType<typeof useWheelGroup> = null;
      function Probe() {
        seen = useWheelGroup();
        return null;
      }
      render(
        <WheelGroup>
          <Probe />
        </WheelGroup>,
      );
      expect(seen).not.toBeNull();
      // The element is reached through a ref; nothing in the context value
      // is a DOM node (react-component-runtime INV1).
      expect(
        Object.values(seen ?? {}).some(entry => entry instanceof Node),
      ).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('places its vanishing point at the group centre once the group mounts, without ResizeObserver', () => {
    const left: Record<string, number> = {Hour: 17, Minute: 140, 'AM/PM': 262};
    const spy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const label = this.getAttribute('aria-label');
        // The frame carries the band (its ::before); a column carries data-wheel.
        const isGroup =
          this.hasAttribute('data-wheel-band') &&
          !this.hasAttribute('data-wheel');
        const x = label != null && label in left ? left[label] : 0;
        const width = label != null && label in left ? 123 : isGroup ? 402 : 0;
        return {
          x,
          y: 0,
          left: x,
          top: 0,
          right: x + width,
          bottom: 216,
          width,
          height: 216,
          toJSON() {},
        };
      });
    // The group draws its frame (and hands its element over) only under a
    // finger: a coarse primary pointer.
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query === '(pointer: coarse)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    try {
      expect(typeof ResizeObserver).toBe('undefined');
      render(
        <WheelGroup>
          <PickerWheel
            label="Hour"
            options={HOURS}
            value={10}
            onChange={() => {}}
          />
          <PickerWheel
            label="Minute"
            options={MINUTES}
            value={0}
            onChange={() => {}}
          />
          <PickerWheel
            label="AM/PM"
            options={[
              {value: 0, label: 'AM'},
              {value: 1, label: 'PM'},
            ]}
            value={0}
            onChange={() => {}}
          />
        </WheelGroup>,
      );
      const origin = (label: string) =>
        screen
          .getByRole('listbox', {name: label})
          .querySelector<HTMLElement>('[data-wheel-drum]')!.style
          .perspectiveOrigin;
      // The group's centre is 201 px.
      expect(origin('Hour')).toBe('184px 50%');
      expect(origin('AM/PM')).toBe('-61px 50%');
    } finally {
      spy.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it('neither selects text nor opens the callout under a held finger', () => {
    const {column} = renderWheel();
    touch('touchstart', column, CENTRE);
    // The gesture host locks the column while the finger is down (jsdom
    // keeps no -webkit-touch-callout; the simulator check reads it).
    expect(column.style.getPropertyValue('user-select')).toBe('none');
    touch('touchend', column, CENTRE);
    expect(column.style.getPropertyValue('user-select')).toBe('');
  });
});

describe('PickerWheel — RTL', () => {
  it('leans each column toward the picker centre from where it is laid out, so RTL mirrors it', async () => {
    // An RTL row of three 123 px columns in a 402 px picker: AM/PM on the
    // left, Hour on the right.
    const left: Record<string, number> = {'AM/PM': 17, Minute: 140, Hour: 262};
    const spy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const label = this.getAttribute('aria-label');
        // The frame carries the band (its ::before); a column carries data-wheel.
        const isGroup =
          this.hasAttribute('data-wheel-band') &&
          !this.hasAttribute('data-wheel');
        const x = label != null && label in left ? left[label] : 0;
        const width = label != null && label in left ? 123 : isGroup ? 402 : 0;
        return {
          x,
          y: 0,
          left: x,
          top: 0,
          right: x + width,
          bottom: 216,
          width,
          height: 216,
          toJSON() {},
        };
      });
    // Browsers report each observed box once laid out; the wheels place
    // their vanishing point from that report, the group's box included.
    // The group draws its frame (and hands its box over) only under a
    // finger: a coarse primary pointer.
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query === '(pointer: coarse)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    const previousObserver = window.ResizeObserver;
    window.ResizeObserver = class {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe(target: Element) {
        queueMicrotask(() =>
          this.callback([{target} as ResizeObserverEntry], this),
        );
      }
      unobserve() {}
      disconnect() {}
    };
    try {
      const meridiem: WheelOption[] = [
        {value: 0, label: 'AM'},
        {value: 1, label: 'PM'},
      ];
      render(
        <div dir="rtl">
          <WheelGroup>
            <PickerWheel
              label="Hour"
              options={HOURS}
              value={10}
              onChange={() => {}}
            />
            <PickerWheel
              label="Minute"
              options={MINUTES}
              value={0}
              onChange={() => {}}
            />
            <PickerWheel
              label="AM/PM"
              options={meridiem}
              value={0}
              onChange={() => {}}
            />
          </WheelGroup>
        </div>,
      );
      await act(async () => {});
      const origin = (label: string) =>
        screen
          .getByRole('listbox', {name: label})
          .querySelector<HTMLElement>('[style*="perspective-origin"]')!.style
          .perspectiveOrigin;
      // The picker centre is 201 px: the left column draws toward its right,
      // the right column toward its left.
      expect(origin('AM/PM')).toBe('184px 50%');
      expect(origin('Hour')).toBe('-61px 50%');
    } finally {
      spy.mockRestore();
      window.ResizeObserver = previousObserver;
      vi.unstubAllGlobals();
    }
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
