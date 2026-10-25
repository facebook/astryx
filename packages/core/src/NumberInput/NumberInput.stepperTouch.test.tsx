// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInput.stepperTouch.test.tsx
 * @input vitest + Testing Library, NumberInput with steppers, touch, pen and
 *   mouse events with timestamps on the page clock, and laid-out stepper rects
 * @output The steppers under any pointer, through the gesture system: a tap
 *   steps once at the lift and the click each engine sends after it (Chrome
 *   on Android, Safari on iOS) adds nothing, a tap trembling on the edge too;
 *   a hold shows each step in the field and commits once, at the release,
 *   and the parent's value wins after it; the touched half paints at once and
 *   clears at once; a slide moves the paint and the repeat; edge tremble adds
 *   nothing; leaving the column pauses the repeat and coming back resumes it;
 *   a mouse holds like a finger and focuses the field; disabled, read-only and
 *   bound halves do nothing; a press cancelled under a blocked field commits
 *   nothing; steppers shown after the field mounts, or shown again, track a
 *   finger; a click no pointer sent always steps; no shared press feedback
 * @position jsdom tests of the steppers' touch layer, NumberInputTouch.tsx (the
 *   rules themselves: stepperTracking.test.ts; real engines:
 *   NumberInput.stepperHold.interaction.browser.spec.ts)
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {useRef, useState} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {usePressTracker} from '../gestures';
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
 * click as 'touch' with detail 0; Safari on iOS as 'mouse' with detail 1.
 */
function clickNaming(pointerType: string, detail = 0): MouseEvent {
  const click = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    detail,
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
  /** Whether the parent takes the value onChange hands it. */
  isAccepting?: boolean;
}) {
  const {isAccepting = true, ...rest} = props;
  const [value, setValue] = useState<number | null>(initial);
  return (
    <NumberInput
      label="Quantity"
      value={value}
      onChange={next => {
        onChange?.(next);
        if (isAccepting) {
          setValue(next);
        }
      }}
      hasNumberSteppers
      {...rest}
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
const shown = (input: HTMLElement) => (input as HTMLInputElement).value;
const committed = (onChange: {mock: {calls: [number | null][]}}) =>
  onChange.mock.calls.map(([value]) => value);
// Above the column, past the control profile's 70 pt tracking area.
const FAR_ABOVE = {x: 212, y: -80};

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
    expect(committed(onChange)).toEqual([6]);
    fireEvent.click(increment, {detail: 1});
    expect(committed(onChange)).toEqual([6]);
    expect(input).not.toHaveFocus();
  });

  it('the click Safari on iOS sends after a tap (named mouse, detail 1) adds nothing', () => {
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    touch('touchend', increment, INCREMENT, id);
    act(() => {
      increment.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([6]);
  });

  it('the click Chrome on Android sends after a tap (named touch, detail 0) adds nothing', () => {
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    touch('touchend', increment, INCREMENT, id);
    act(() => {
      increment.dispatchEvent(clickNaming('touch'));
    });
    expect(committed(onChange)).toEqual([6]);
  });

  it('a light tap trembling on the top edge steps exactly once', () => {
    const {onChange, increment} = setup();
    const id = fingerDown(increment, {x: 212, y: 1});
    for (const y of [-2, 1, -3, 0, -2]) {
      touch('touchmove', increment, {x: 212, y}, id);
    }
    wait(70);
    touch('touchend', increment, {x: 212, y: -2}, id);
    act(() => {
      increment.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([6]);
  });

  it('a hold shows each step in the field and commits once, at the release', () => {
    const {onChange, input, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(499);
    expect(shown(input)).toBe('5');
    wait(1);
    expect(shown(input)).toBe('6');
    // 250 ms, then 225 ms, then 202.5 ms: one steady ramp.
    wait(250);
    expect(shown(input)).toBe('7');
    wait(225);
    expect(shown(input)).toBe('8');
    wait(205);
    expect(shown(input)).toBe('9');
    // Nothing is committed, or told to assistive technology, mid-hold.
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-valuenow', '5');
    touch('touchend', increment, INCREMENT, id);
    fireEvent.click(increment, {detail: 1});
    expect(committed(onChange)).toEqual([9]);
    expect(shown(input)).toBe('9');
    expect(input).toHaveAttribute('aria-valuenow', '9');
  });

  it('after the release the field shows the value the parent passes back', () => {
    const {onChange, input, increment} = setup({isAccepting: false});
    const id = fingerDown(increment, INCREMENT);
    wait(800);
    expect(shown(input)).toBe('7');
    touch('touchend', increment, INCREMENT, id);
    // The parent rejected 7: its 5 wins.
    expect(committed(onChange)).toEqual([7]);
    expect(shown(input)).toBe('5');
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
    const {onChange, input, increment, decrement} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(800);
    expect(shown(input)).toBe('7');
    touch('touchmove', increment, DECREMENT, id);
    expect(press(increment)).toBeNull();
    expect(press(decrement)).toBe('on');
    // The cadence runs on: the next beat, at 975 ms, steps −.
    wait(175);
    expect(shown(input)).toBe('6');
    touch('touchend', increment, DECREMENT, id);
    expect(press(decrement)).toBeNull();
    expect(committed(onChange)).toEqual([6]);
  });

  it('a finger that slid from − onto + before any repeat steps + at the lift', () => {
    const {onChange, decrement} = setup();
    const id = fingerDown(decrement, DECREMENT);
    wait(200);
    touch('touchmove', decrement, INCREMENT, id);
    wait(150);
    touch('touchend', decrement, INCREMENT, id);
    expect(committed(onChange)).toEqual([6]);
  });

  it('a finger trembling over the edge during a hold adds no step', () => {
    const steady = setup();
    const a = fingerDown(steady.increment, INCREMENT);
    wait(1200);
    touch('touchend', steady.increment, INCREMENT, a);
    document.body.innerHTML = '';

    const trembling = setup();
    const b = fingerDown(trembling.increment, INCREMENT);
    wait(800);
    // Back and forth across the top edge, within the tracking area.
    for (const y of [-6, 2, -9, 1, -4, 3, -7, 2]) {
      touch('touchmove', trembling.increment, {x: 212, y}, b);
      wait(10);
    }
    expect(press(trembling.increment)).toBe('on');
    wait(320);
    touch('touchend', trembling.increment, {x: 212, y: 2}, b);
    expect(committed(trembling.onChange)).toEqual(committed(steady.onChange));
  });

  it('leaving the column pauses the repeat and coming back resumes it, with no step at once', () => {
    const {onChange, input, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(800);
    expect(shown(input)).toBe('7');
    touch('touchmove', increment, FAR_ABOVE, id);
    expect(press(increment)).toBeNull();
    wait(2000);
    expect(shown(input)).toBe('7');
    touch('touchmove', increment, INCREMENT, id);
    expect(shown(input)).toBe('7');
    expect(press(increment)).toBe('on');
    // The rest of the 975 ms beat (175 ms) runs, then the next step.
    wait(170);
    expect(shown(input)).toBe('7');
    wait(10);
    expect(shown(input)).toBe('8');
    touch('touchend', increment, INCREMENT, id);
    expect(committed(onChange)).toEqual([8]);
  });

  it('a tap in the column’s reach past the halves steps once and focuses nothing', () => {
    // The touch target reaches past the halves; a tap there is the column's,
    // and its click must not reach the field's click-to-focus (no keyboard).
    const {onChange, input, increment} = setup();
    const column = increment.parentElement as HTMLElement;
    const above = {x: 212, y: -6};
    const id = fingerDown(column, above);
    touch('touchend', column, above, id);
    act(() => {
      column.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([6]);
    expect(input).not.toHaveFocus();
  });

  it('a press in the reach keeps an editing field focused, as one on a half does', () => {
    const {input, increment} = setup();
    act(() => {
      input.focus();
    });
    const column = increment.parentElement as HTMLElement;
    const notCancelled = fireEvent.pointerDown(column, {
      pointerType: 'touch',
      pointerId: 9,
      clientX: 212,
      clientY: -6,
    });
    // Default-prevented, so the browser moves no focus off the field.
    expect(notCancelled).toBe(false);
    expect(input).toHaveFocus();
  });

  it('a lift outside the column steps nothing', () => {
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(60);
    touch('touchmove', increment, FAR_ABOVE, id);
    touch('touchend', increment, FAR_ABOVE, id);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('the click an engine sends after a lift outside adds nothing', () => {
    // iOS Safari still sends the button its click after a short slide off it.
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(60);
    touch('touchmove', increment, FAR_ABOVE, id);
    touch('touchend', increment, FAR_ABOVE, id);
    fireEvent.click(increment, {detail: 1});
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a click no pointer sent steps, even right after a tracked touch', () => {
    // A screen reader's activation, a key or a programmatic click(): detail
    // 0, and where clicks name their pointer, none ('').
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    touch('touchend', increment, INCREMENT, id);
    fireEvent.click(increment, {detail: 0});
    expect(committed(onChange)).toEqual([6, 7]);
    act(() => {
      increment.dispatchEvent(clickNaming(''));
    });
    expect(committed(onChange)).toEqual([6, 7, 8]);
  });

  it('a pointer click long after a hold the engine sent no click for is a press of its own', () => {
    // Safari on iOS sends no click after a hold; an activation that comes a
    // second or more later is not the hold's.
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(600);
    touch('touchend', increment, INCREMENT, id);
    expect(committed(onChange)).toEqual([6]);
    wait(1500);
    act(() => {
      increment.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([6, 7]);
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
    'a field turned %s mid-hold lets go of the press and commits nothing',
    (_, blocked) => {
      // PressTracker reads isEnabled only when a touch begins, so the press
      // layer itself must let go: no pressed paint beside aria-disabled, no
      // repeat timer behind the refused steps, and no commit at the lift.
      const onChange = vi.fn<(value: number | null) => void>();
      const {rerender} = render(<Controlled onChange={onChange} />);
      const input = screen.getByRole('spinbutton');
      const increment = screen.getByRole('button', {
        name: 'Increment Quantity',
      });
      const id = fingerDown(increment, INCREMENT);
      wait(600);
      expect(shown(input)).toBe('6');
      expect(press(increment)).toBe('on');
      rerender(<Controlled onChange={onChange} {...blocked} />);
      expect(press(increment)).toBeNull();
      expect(shown(input)).toBe('5');
      wait(1000);
      // Turned back on with the finger still down: the press stays let go
      // until a new touch, so nothing resumes and nothing repaints.
      rerender(<Controlled onChange={onChange} />);
      wait(1000);
      expect(shown(input)).toBe('5');
      expect(press(increment)).toBeNull();
      touch('touchend', increment, INCREMENT, id);
      expect(onChange).not.toHaveBeenCalled();
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
    expect(shown(screen.getByRole('spinbutton'))).toBe('6');
    touch('touchend', increment, INCREMENT, id);
    expect(committed(onChange)).toEqual([6]);
  });

  it('steppers removed and shown again follow a finger, once', () => {
    const onChange = vi.fn<(value: number | null) => void>();
    const {rerender} = render(<Controlled onChange={onChange} />);
    rerender(<Controlled onChange={onChange} hasNumberSteppers={false} />);
    rerender(<Controlled onChange={onChange} hasNumberSteppers />);
    const increment = screen.getByRole('button', {name: 'Increment Quantity'});
    const id = fingerDown(increment, INCREMENT);
    wait(800);
    // 500 and 750 ms: one tracker, not one per column the field ever had.
    expect(shown(screen.getByRole('spinbutton'))).toBe('7');
    touch('touchend', increment, INCREMENT, id);
    expect(committed(onChange)).toEqual([7]);
  });

  it('a hold stops at the bound, and the bound shows on the half as it is reached', () => {
    const {onChange, input, increment} = setup({initial: 8, max: 10});
    const id = fingerDown(increment, INCREMENT);
    wait(2600);
    expect(shown(input)).toBe('10');
    expect(increment).toHaveAttribute('aria-disabled', 'true');
    touch('touchend', increment, INCREMENT, id);
    expect(committed(onChange)).toEqual([10]);
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
    expect(committed(onChange)).toEqual([6]);
    fireEvent.click(increment, {detail: 1});
    expect(committed(onChange)).toEqual([6]);
    expect(input).not.toHaveFocus();
  });

  it('a mouse click steps once and focuses the field', () => {
    // A fine pointer: this test's context has no coarse pointer.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const {onChange, input, increment} = setup();
    const pointer = {pointerType: 'mouse', pointerId: 1, isPrimary: true};
    fireEvent.pointerDown(increment, {...pointer, clientX: 212, clientY: 8});
    wait(80);
    fireEvent.pointerUp(increment, {...pointer, clientX: 212, clientY: 8});
    act(() => {
      increment.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([6]);
    expect(input).toHaveFocus();
  });

  it('a mouse held on a stepper repeats like a finger and commits once, at the release', () => {
    // A fine pointer: this test's context has no coarse pointer.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const {onChange, input, increment} = setup();
    const pointer = {pointerType: 'mouse', pointerId: 1, isPrimary: true};
    fireEvent.pointerDown(increment, {...pointer, clientX: 212, clientY: 8});
    expect(press(increment)).toBe('on');
    wait(1200);
    expect(shown(input)).toBe('9');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(increment, {...pointer, clientX: 212, clientY: 8});
    act(() => {
      increment.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([9]);
    expect(press(increment)).toBeNull();
    expect(input).toHaveFocus();
  });
});

/** A bare press tracker, opted into reading each event's pointer or not. */
function Tracker({
  label,
  perEventPointer,
  onEvent,
}: {
  label: string;
  perEventPointer?: boolean;
  onEvent: (event: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  usePressTracker(ref, {perEventPointer, onControlEvent: onEvent});
  return <div ref={ref} aria-label={label} />;
}

describe('NumberInput steppers where the primary pointer is fine', () => {
  it('the stepper alone attaches, with no warning, while a plain press tracker beside it stays inactive', () => {
    // A fine pointer: this test's context has no coarse pointer.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onChange = vi.fn<(value: number | null) => void>();
    const {unmount} = render(<Controlled onChange={onChange} />);
    // The stepper reads each event's pointer: nothing to warn about.
    expect(warn).not.toHaveBeenCalled();
    const increment = screen.getByRole('button', {name: 'Increment Quantity'});
    const pointer = {pointerType: 'mouse', pointerId: 1, isPrimary: true};
    fireEvent.pointerDown(increment, {...pointer, clientX: 212, clientY: 8});
    expect(press(increment)).toBe('on');
    fireEvent.pointerUp(increment, {...pointer, clientX: 212, clientY: 8});
    expect(committed(onChange)).toEqual([6]);
    unmount();
    // A plain tracker gets nothing here; one that opted in, the same press.
    const plain: string[] = [];
    const optedIn: string[] = [];
    render(
      <>
        <Tracker label="Plain" onEvent={event => plain.push(event)} />
        <Tracker
          label="Opted in"
          perEventPointer
          onEvent={event => optedIn.push(event)}
        />
      </>,
    );
    for (const label of ['Plain', 'Opted in']) {
      const element = screen.getByLabelText(label);
      const mouse = {pointerType: 'mouse', pointerId: 3, isPrimary: true};
      fireEvent.pointerDown(element, mouse);
      fireEvent.pointerUp(element, mouse);
    }
    expect(plain).toEqual([]);
    expect(
      screen.getByLabelText('Plain').style.getPropertyValue('touch-action'),
    ).toBe('');
    expect(optedIn[0]).toBe('touchDown');
  });
});

describe('NumberInput steppers on every touch device', () => {
  it('carry no shared press feedback: the press tracker paints them', () => {
    const {increment, decrement} = setup();
    expect(increment).not.toHaveAttribute('data-astryx-pressable');
    expect(decrement).not.toHaveAttribute('data-astryx-pressable');
  });
});
