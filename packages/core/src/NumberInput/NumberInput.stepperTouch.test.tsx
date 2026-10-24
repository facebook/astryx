// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInput.stepperTouch.test.tsx
 * @input vitest + Testing Library, NumberInput with steppers, touch and pen
 *   events with timestamps on the page clock, and laid-out stepper rects
 * @output The steppers under a finger or a pen, through the gesture system:
 *   a tap steps once at the lift and its click adds nothing; a hold repeats on
 *   UIStepper's cadence; the touched half paints at once and clears at once;
 *   a slide moves the paint and the repeat; leaving the column stops it; a
 *   mouse keeps the click; disabled, read-only and bound halves do nothing;
 *   steppers shown after the field mounts, or shown again, track a finger;
 *   a click with no pointer after a touch the engine sent no click for steps;
 *   no shared press feedback: the tracker paints
 * @position jsdom tests of the steppers' touch layer, NumberInputTouch.tsx (the
 *   rules themselves: stepperTracking.test.ts; real engines:
 *   NumberInput.stepperHold.interaction.browser.spec.ts)
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {useState} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NumberInput} from './NumberInput';

// The column sits at x 200–224; + is its top half (y 0–16), − the bottom.
const RECTS: Record<string, {top: number; bottom: number}> = {
  column: {top: 0, bottom: 32},
  increment: {top: 0, bottom: 16},
  decrement: {top: 16, bottom: 32},
};
const INCREMENT = {x: 212, y: 8};
const DECREMENT = {x: 212, y: 24};

function rectOf(element: Element): DOMRect {
  const name =
    element.getAttribute('aria-label')?.startsWith('Increment') === true
      ? 'increment'
      : element.getAttribute('aria-label')?.startsWith('Decrement') === true
        ? 'decrement'
        : element.querySelector('[aria-label^="Increment"]') != null &&
            element.querySelector('input') == null
          ? 'column'
          : null;
  const rect = name == null ? {top: 0, bottom: 0} : RECTS[name];
  const left = name == null ? 0 : 200;
  const right = name == null ? 0 : 224;
  return {
    x: left,
    y: rect.top,
    top: rect.top,
    bottom: rect.bottom,
    left,
    right,
    width: right - left,
    height: rect.bottom - rect.top,
    toJSON: () => ({}),
  };
}

let finger = 1;

function touch(
  type: 'touchstart' | 'touchmove' | 'touchend',
  target: EventTarget,
  at: {x: number; y: number},
  id: number,
): void {
  const event = new Event(type, {bubbles: true, cancelable: true});
  const entry = {identifier: id, clientX: at.x, clientY: at.y, target};
  Object.defineProperty(event, 'changedTouches', {value: [entry]});
  Object.defineProperty(event, 'touches', {
    value: type === 'touchend' ? [] : [entry],
  });
  Object.defineProperty(event, 'timeStamp', {value: performance.now()});
  act(() => {
    target.dispatchEvent(event);
  });
}

/** A finger down on `target`, as a browser sends it: pointerdown, then touchstart. */
function fingerDown(target: Element, at: {x: number; y: number}): number {
  const id = finger++;
  fireEvent.pointerDown(target, {
    pointerType: 'touch',
    pointerId: id,
    clientX: at.x,
    clientY: at.y,
  });
  touch('touchstart', target, at, id);
  return id;
}

/**
 * A click as Chrome and Firefox dispatch one: a pointer event that names its
 * pointer ('' for a click no pointer sent). Chrome on Android sends a tap's
 * click with detail 0.
 */
function clickNaming(pointerType: string): MouseEvent {
  const click = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    detail: 0,
  });
  Object.defineProperty(click, 'pointerType', {value: pointerType});
  return click;
}

/**
 * Moves the page clock `ms`, in slices shorter than the fastest repeat: act()
 * renders only when its callback returns, and a browser renders between two
 * timer tasks, so each step must see the value the one before it produced.
 */
function wait(ms: number): void {
  for (let left = ms; left > 0; left -= 10) {
    act(() => {
      vi.advanceTimersByTime(Math.min(10, left));
    });
  }
}

function Controlled({
  initial = 5,
  onChange,
  ...props
}: {
  initial?: number;
  onChange?: (value: number | null) => void;
  max?: number;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  hasNumberSteppers?: boolean;
}) {
  const [value, setValue] = useState<number | null>(initial);
  return (
    <NumberInput
      label="Quantity"
      value={value}
      onChange={next => {
        onChange?.(next);
        setValue(next);
      }}
      hasNumberSteppers
      {...props}
    />
  );
}

function setup(props: Parameters<typeof Controlled>[0] = {}) {
  const onChange = vi.fn<(value: number | null) => void>();
  render(<Controlled onChange={onChange} {...props} />);
  return {
    onChange,
    input: screen.getByRole('spinbutton'),
    increment: screen.getByRole('button', {name: 'Increment Quantity'}),
    decrement: screen.getByRole('button', {name: 'Decrement Quantity'}),
  };
}

const press = (element: Element) => element.getAttribute('data-astryx-press');

// The document's gesture host outlives a test and keeps event times
// monotonic, while each fake clock starts at 0: every test starts later than
// the one before it ended.
let epoch = 0;

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'performance', 'Date'],
  });
  epoch += 100_000;
  vi.advanceTimersByTime(epoch);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      return rectOf(this);
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('NumberInput steppers under a finger', () => {
  it('a tap steps once, at the lift, and the click after it adds nothing', () => {
    const {onChange, input, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(60);
    expect(onChange).not.toHaveBeenCalled();
    touch('touchend', increment, INCREMENT, id);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(6);
    fireEvent.click(increment, {detail: 1});
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).not.toHaveFocus();
  });

  it('a hold steps at 0.5 s and keeps stepping on UIStepper’s cadence', () => {
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(499);
    expect(onChange).not.toHaveBeenCalled();
    wait(1);
    expect(onChange).toHaveBeenLastCalledWith(6);
    wait(2500);
    // Six steps by 3 s, then every 100 ms.
    expect(onChange).toHaveBeenCalledTimes(6);
    wait(300);
    expect(onChange).toHaveBeenCalledTimes(9);
    expect(onChange).toHaveBeenLastCalledWith(14);
    touch('touchend', increment, INCREMENT, id);
    fireEvent.click(increment, {detail: 1});
    // The lift and its click add nothing after a repeat.
    expect(onChange).toHaveBeenCalledTimes(9);
  });

  it('paints the touched half at once and clears it at once', () => {
    const {increment, decrement} = setup();
    const id = fingerDown(increment, INCREMENT);
    expect(press(increment)).toBe('on');
    expect(press(decrement)).toBeNull();
    touch('touchend', increment, INCREMENT, id);
    // No release fade: UIStepper's fill returns in the first frame.
    expect(press(increment)).toBeNull();
  });

  it('a slide onto the other half moves the paint and the repeat', () => {
    const {onChange, increment, decrement} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(500);
    expect(onChange).toHaveBeenLastCalledWith(6);
    touch('touchmove', increment, DECREMENT, id);
    expect(press(increment)).toBeNull();
    expect(press(decrement)).toBe('on');
    // The cadence runs on: the next beat, at 1 s, steps −.
    wait(500);
    expect(onChange).toHaveBeenLastCalledWith(5);
    touch('touchend', increment, DECREMENT, id);
    expect(press(decrement)).toBeNull();
  });

  it('a finger that slid from − onto + before any repeat steps + at the lift', () => {
    const {onChange, decrement} = setup();
    const id = fingerDown(decrement, DECREMENT);
    wait(200);
    touch('touchmove', decrement, INCREMENT, id);
    wait(150);
    touch('touchend', decrement, INCREMENT, id);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(6);
  });

  it('leaving the column stops the repeat and coming back steps at once', () => {
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(1000);
    expect(onChange).toHaveBeenCalledTimes(2);
    // 1 pt above the top edge: outside, with no tracking margin.
    touch('touchmove', increment, {x: 212, y: -1}, id);
    expect(press(increment)).toBeNull();
    wait(2000);
    expect(onChange).toHaveBeenCalledTimes(2);
    touch('touchmove', increment, INCREMENT, id);
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(press(increment)).toBe('on');
    touch('touchend', increment, INCREMENT, id);
  });

  it('a lift outside the column steps nothing', () => {
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(60);
    touch('touchmove', increment, {x: 212, y: -4}, id);
    touch('touchend', increment, {x: 212, y: -4}, id);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('the click an engine sends after a lift outside adds nothing', () => {
    // iOS Safari still sends the button its click after a short slide off it.
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(60);
    touch('touchmove', increment, {x: 212, y: -4}, id);
    touch('touchend', increment, {x: 212, y: -4}, id);
    fireEvent.click(increment, {detail: 1});
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a click with no pointer after a touch that ended without one still steps', () => {
    // An engine may send no click after a touch (a long press, a slide off, a
    // scroll). A screen reader's activation or a programmatic click() that
    // comes later has detail 0 and no pointerdown: it is a press of its own.
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    touch('touchend', increment, INCREMENT, id);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([6]);
    fireEvent.click(increment, {detail: 0});
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([6, 7]);
  });

  it('a tap whose click names a touch and has detail 0 steps once, as Chrome on Android sends it', () => {
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    touch('touchend', increment, INCREMENT, id);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([6]);
    act(() => {
      increment.dispatchEvent(clickNaming('touch'));
    });
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([6]);
  });

  it('a click that names no pointer steps, even right after a tracked touch', () => {
    // A screen reader's activation, a key or a programmatic click(): Chrome
    // names no pointer for it.
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    touch('touchend', increment, INCREMENT, id);
    act(() => {
      increment.dispatchEvent(clickNaming(''));
    });
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([6, 7]);
  });

  it('a press delivered under a finger keeps its touch: the page cannot pan it away', () => {
    // UIScrollView never cancels a tracking UIControl; the host cancels the
    // browser's pan for this finger once the press is delivered (keepsTouch).
    const {increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    const move = new Event('touchmove', {bubbles: true, cancelable: true});
    const entry = {
      identifier: id,
      clientX: INCREMENT.x,
      clientY: INCREMENT.y + 12,
      target: increment,
    };
    Object.defineProperty(move, 'changedTouches', {value: [entry]});
    Object.defineProperty(move, 'touches', {value: [entry]});
    Object.defineProperty(move, 'timeStamp', {value: performance.now()});
    act(() => {
      increment.dispatchEvent(move);
    });
    expect(move.defaultPrevented).toBe(true);
    touch('touchend', increment, INCREMENT, id);
  });

  it.each([
    ['disabled', {isDisabled: true}],
    ['read-only', {isReadOnly: true}],
  ] as const)(
    'a field turned %s mid-hold lets go of the press at once',
    (_, blocked) => {
      // PressTracker reads isEnabled only when a touch begins, so the touch
      // layer itself must let go: no pressed paint beside aria-disabled, and
      // no repeat timer left running behind the refused steps.
      const onChange = vi.fn<(value: number | null) => void>();
      const {rerender} = render(<Controlled onChange={onChange} />);
      const increment = screen.getByRole('button', {
        name: 'Increment Quantity',
      });
      const id = fingerDown(increment, INCREMENT);
      wait(600);
      expect(onChange.mock.calls.map(([value]) => value)).toEqual([6]);
      expect(press(increment)).toBe('on');
      rerender(<Controlled onChange={onChange} {...blocked} />);
      expect(press(increment)).toBeNull();
      wait(1000);
      // Turned back on with the finger still down: the press stays let go
      // until a new touch, so nothing resumes and nothing repaints.
      rerender(<Controlled onChange={onChange} />);
      wait(1000);
      expect(onChange.mock.calls.map(([value]) => value)).toEqual([6]);
      expect(press(increment)).toBeNull();
      touch('touchend', increment, INCREMENT, id);
      expect(onChange.mock.calls.map(([value]) => value)).toEqual([6]);
      expect(press(increment)).toBeNull();
    },
  );

  it('steppers turned on after mount follow a finger', () => {
    const onChange = vi.fn<(value: number | null) => void>();
    const {rerender} = render(
      <Controlled onChange={onChange} hasNumberSteppers={false} />,
    );
    expect(
      screen.queryByRole('button', {name: 'Increment Quantity'}),
    ).toBeNull();
    rerender(<Controlled onChange={onChange} hasNumberSteppers />);
    const increment = screen.getByRole('button', {name: 'Increment Quantity'});
    const id = fingerDown(increment, INCREMENT);
    wait(600);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([6]);
    touch('touchend', increment, INCREMENT, id);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([6]);
  });

  it('steppers removed and shown again follow a finger, once', () => {
    const onChange = vi.fn<(value: number | null) => void>();
    const {rerender} = render(<Controlled onChange={onChange} />);
    rerender(<Controlled onChange={onChange} hasNumberSteppers={false} />);
    rerender(<Controlled onChange={onChange} hasNumberSteppers />);
    const increment = screen.getByRole('button', {name: 'Increment Quantity'});
    const id = fingerDown(increment, INCREMENT);
    wait(1100);
    // 0.5 s and 1 s: one tracker, not one per column the field ever had.
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([6, 7]);
    touch('touchend', increment, INCREMENT, id);
  });

  it('a hold stops at the bound', () => {
    const {onChange, increment} = setup({initial: 8, max: 10});
    const id = fingerDown(increment, INCREMENT);
    wait(2600);
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([9, 10]);
    touch('touchend', increment, INCREMENT, id);
  });

  it('does nothing while disabled or read-only', () => {
    for (const props of [{isDisabled: true}, {isReadOnly: true}]) {
      const {onChange, increment} = setup(props);
      const id = fingerDown(increment, INCREMENT);
      expect(press(increment)).toBeNull();
      wait(1200);
      touch('touchend', increment, INCREMENT, id);
      fireEvent.click(increment, {detail: 1});
      expect(onChange).not.toHaveBeenCalled();
      document.body.innerHTML = '';
    }
  });
});

describe('NumberInput steppers under a pen and a mouse', () => {
  it('a pen tap steps once, at the lift, without focusing the field', () => {
    // A fine pointer: this test's context has no coarse pointer.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const {onChange, input, increment} = setup();
    const pointer = {pointerType: 'pen', pointerId: 40, isPrimary: true};
    fireEvent.pointerDown(increment, {...pointer, clientX: 212, clientY: 8});
    expect(press(increment)).toBe('on');
    wait(80);
    fireEvent.pointerUp(increment, {...pointer, clientX: 212, clientY: 8});
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(6);
    fireEvent.click(increment, {detail: 1});
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).not.toHaveFocus();
  });

  it('a mouse keeps the click: no press paint, and the click steps and focuses', () => {
    // A fine pointer: this test's context has no coarse pointer.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const {onChange, input, increment} = setup();
    const pointer = {pointerType: 'mouse', pointerId: 1, isPrimary: true};
    fireEvent.pointerDown(increment, {...pointer, clientX: 212, clientY: 8});
    expect(press(increment)).toBeNull();
    wait(1200);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(increment, {...pointer, clientX: 212, clientY: 8});
    fireEvent.click(increment, {detail: 1});
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveFocus();
  });
});

describe('NumberInput steppers on every touch device', () => {
  it('carry no shared press feedback: the press tracker paints them', () => {
    const {increment, decrement} = setup();
    expect(increment).not.toHaveAttribute('data-astryx-pressable');
    expect(decrement).not.toHaveAttribute('data-astryx-pressable');
  });
});
