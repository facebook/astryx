// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInput.stepperTouch.test.tsx
 * @input vitest + Testing Library, NumberInput with steppers, touch and pen
 *   events with timestamps on the page clock, and laid-out stepper rects
 * @output The steppers under a finger or a pen, through the gesture system:
 *   a tap steps once at the lift and its click adds nothing; a hold repeats on
 *   UIStepper's cadence; the touched half paints at once and clears at once;
 *   a slide moves the paint and the repeat; leaving the column stops it; a
 *   mouse keeps the click; disabled, read-only and bound halves do nothing
 * @position jsdom tests of the touch stepper glue in NumberInput.tsx (the
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
  const onChange = vi.fn();
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
