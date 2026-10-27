// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInput.stepperTouch.test.tsx
 * @input vitest + Testing Library, NumberInput with steppers, touch, pen and
 *   mouse events with timestamps on the page clock, and laid-out stepper rects
 * @output The steppers under any pointer: under a finger (a coarse primary
 *   pointer) through the gesture system, a tap steps once, on the click each
 *   engine sends after it (Chrome on Android, Safari on iOS), a tap trembling
 *   on the edge too, and that click steps the half the press lifted on;
 *   a hold shows each step in the field and commits once, at the release,
 *   and the parent's value wins after it; the touched half paints at once and
 *   clears at once; a slide moves the paint and the repeat; edge tremble adds
 *   nothing; leaving the column pauses the repeat and coming back resumes it;
 *   a mouse holds like a finger on the column's own pointer events and
 *   focuses the field, and under a fine pointer nothing touch-only attaches;
 *   disabled, read-only and
 *   bound halves do nothing; a press cancelled under a blocked field commits
 *   nothing; steppers shown after the field mounts, or shown again, track a
 *   finger; a click no pointer sent always steps; no shared press feedback
 * @position jsdom tests of the steppers' touch layer, NumberInputTouch.tsx (the
 *   rules themselves: stepperTracking.test.ts; real engines:
 *   NumberInput.stepperHold.interaction.browser.spec.ts)
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {useState} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NumberInput} from './NumberInput';
import {pointerQuery} from '../gestures/__tests__/pointerQuery';

interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// The column sits at x 200–224; + is its top half (y 0–16), − the bottom.
const COLUMN: Record<string, Box> = {
  column: {top: 0, bottom: 32, left: 200, right: 224},
  increment: {top: 0, bottom: 16, left: 200, right: 224},
  decrement: {top: 16, bottom: 32, left: 200, right: 224},
};
// The touch control at md, left to right: a 94 x 32 capsule beside the
// field, − left, + right.
const CAPSULE: Record<string, Box> = {
  column: {top: 0, bottom: 32, left: 300, right: 394},
  decrement: {top: 0, bottom: 32, left: 300, right: 347},
  increment: {top: 0, bottom: 32, left: 347, right: 394},
};
let RECTS = COLUMN;
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
  const rect =
    name == null ? {top: 0, bottom: 0, left: 0, right: 0} : RECTS[name];
  const {left, right} = rect;
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
/** Whether a text selection starting on `target` is refused. */
function refusesSelection(target: Element): boolean {
  const event = new Event('selectstart', {bubbles: true, cancelable: true});
  target.dispatchEvent(event);
  return event.defaultPrevented;
}
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
  RECTS = COLUMN;
  vi.restoreAllMocks();
  vi.useRealTimers();
});

/**
 * The primary pointer is coarse (a phone, a tablet), as the press tracker
 * needs: jsdom's matchMedia models a desktop, where touch work stays off
 * (`spec:AST-094` FR19). Restored with the other mocks after each test.
 */
function coarsePrimaryPointer(): void {
  const matchMedia = window.matchMedia.bind(window);
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string): MediaQueryList => ({
      media: query,
      matches: query.includes('(pointer: coarse)') || matchMedia(query).matches,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  );
}

describe('NumberInput steppers under a finger', () => {
  beforeEach(() => {
    coarsePrimaryPointer();
  });

  it('a tap steps nothing at the lift and once on the click the browser sends after it', () => {
    // A control activates by the browser's click on a lift inside
    // (`spec:AST-094` FR11).
    const {onChange, input, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    wait(60);
    expect(onChange).not.toHaveBeenCalled();
    touch('touchend', increment, INCREMENT, id);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(increment, {detail: 1});
    expect(committed(onChange)).toEqual([6]);
    expect(input).not.toHaveFocus();
  });

  it('the click Safari on iOS sends after a tap (named mouse, detail 1) is its one step, with no focus', () => {
    const {onChange, input, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    touch('touchend', increment, INCREMENT, id);
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      increment.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([6]);
    expect(input).not.toHaveFocus();
  });

  it('the click Chrome on Android sends after a tap (named touch, detail 0) is its one step', () => {
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    touch('touchend', increment, INCREMENT, id);
    expect(onChange).not.toHaveBeenCalled();
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
    expect(onChange).not.toHaveBeenCalled();
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

  it('the column takes touch-action manipulation from the gesture host for its kept press (spec:AST-094 FR18)', async () => {
    // The document's host outlives a test: a frame read an earlier test
    // scheduled runs first, on a real frame.
    vi.useRealTimers();
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => resolve());
    });
    // The host reads an author's touch-action in the next frame and writes
    // its own then (FR18): fake the frame as well.
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
    vi.advanceTimersByTime(epoch);
    // jsdom drops touch-action, so the host's writes are observed.
    const writes: {style: CSSStyleDeclaration; value: string | null}[] = [];
    const setProperty = CSSStyleDeclaration.prototype.setProperty;
    vi.spyOn(CSSStyleDeclaration.prototype, 'setProperty').mockImplementation(
      function (
        this: CSSStyleDeclaration,
        name: string,
        value: string | null,
        priority?: string,
      ) {
        if (name === 'touch-action') {
          writes.push({style: this, value});
        }
        setProperty.call(this, name, value, priority);
      },
    );
    const {increment} = setup();
    wait(16);
    const column = increment.parentElement as HTMLElement;
    // The host may write it more than once (at attach and as it re-applies);
    // every write is manipulation.
    const columnWrites = writes
      .filter(({style}) => style === column.style)
      .map(w => w.value);
    expect(columnWrites).toContain('manipulation');
    expect(new Set(columnWrites)).toEqual(new Set(['manipulation']));
  });

  it('a held finger refuses text selection on the column for that press only, with no style write (spec:AST-094 FR41)', () => {
    const {increment} = setup();
    const column = increment.parentElement as HTMLElement;
    expect(refusesSelection(column)).toBe(false);
    const id = fingerDown(increment, INCREMENT);
    expect(refusesSelection(column)).toBe(true);
    wait(600);
    expect(refusesSelection(column)).toBe(true);
    // Away from iOS WebKit the lock cancels `selectstart`: nothing repaints.
    expect(column.style.getPropertyValue('user-select')).toBe('');
    touch('touchend', increment, INCREMENT, id);
    // Let go at the lift: the column's text is selectable again.
    expect(refusesSelection(column)).toBe(false);
  });

  it('where iOS WebKit runs, a held finger locks selection on the column with a style, for that press only (spec:AST-094 FR41)', () => {
    // iOS WebKit fires no `selectstart` for a long press: only the style
    // refuses it there.
    const css = globalThis.CSS;
    Object.defineProperty(globalThis, 'CSS', {
      configurable: true,
      value: {
        ...css,
        supports: (query: string) => query === '(-webkit-touch-callout: none)',
      },
    });
    try {
      const {increment} = setup();
      const column = increment.parentElement as HTMLElement;
      expect(column.style.getPropertyValue('user-select')).toBe('');
      const id = fingerDown(increment, INCREMENT);
      expect(column.style.getPropertyValue('user-select')).toBe('none');
      wait(600);
      expect(column.style.getPropertyValue('user-select')).toBe('none');
      touch('touchend', increment, INCREMENT, id);
      expect(column.style.getPropertyValue('user-select')).toBe('');
    } finally {
      Object.defineProperty(globalThis, 'CSS', {
        configurable: true,
        value: css,
      });
    }
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

  it('a finger that slid from − onto + before any repeat steps + on the click, whichever half it reaches', () => {
    // The click steps the half the press lifted on, even where the engine
    // sends it to the half the touch began on.
    const {onChange, decrement} = setup();
    const id = fingerDown(decrement, DECREMENT);
    wait(200);
    touch('touchmove', decrement, INCREMENT, id);
    wait(150);
    touch('touchend', decrement, INCREMENT, id);
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      decrement.dispatchEvent(clickNaming('mouse', 1));
    });
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

  it('a tap on the column itself (its border) steps once and focuses nothing', () => {
    // A tap on the column's border is the column's, and its click must not
    // reach the field's click-to-focus (no keyboard).
    const {onChange, input, increment} = setup();
    const column = increment.parentElement as HTMLElement;
    const border = {x: 200, y: 8};
    const id = fingerDown(column, border);
    touch('touchend', column, border, id);
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      column.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([6]);
    expect(input).not.toHaveFocus();
  });

  it('a press on the column itself keeps an editing field focused, as one on a half does', () => {
    const {input, increment} = setup();
    act(() => {
      input.focus();
    });
    const column = increment.parentElement as HTMLElement;
    const notCancelled = fireEvent.pointerDown(column, {
      pointerType: 'touch',
      pointerId: 9,
      clientX: 200,
      clientY: 8,
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

  it('a click no pointer sent steps its own half, even right after a tracked touch', () => {
    // A screen reader's activation, a key or a programmatic click(): detail
    // 0, and where clicks name their pointer, none ('').
    const {onChange, increment} = setup();
    const id = fingerDown(increment, INCREMENT);
    touch('touchend', increment, INCREMENT, id);
    fireEvent.click(increment, {detail: 0});
    expect(committed(onChange)).toEqual([6]);
    act(() => {
      increment.dispatchEvent(clickNaming(''));
    });
    expect(committed(onChange)).toEqual([6, 7]);
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
  it('a pen tap steps once, on its click, and focuses the field where the primary pointer is fine', () => {
    // A fine pointer: this test's context has no coarse pointer. No
    // on-screen keyboard comes up, so a pen focuses the field as a mouse
    // does (`component:NumberInput` FR5).
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const {onChange, input, increment} = setup();
    const pointer = {pointerType: 'pen', pointerId: 40, isPrimary: true};
    fireEvent.pointerDown(increment, {...pointer, clientX: 212, clientY: 8});
    expect(press(increment)).toBe('on');
    wait(80);
    fireEvent.pointerUp(increment, {...pointer, clientX: 212, clientY: 8});
    expect(onChange).not.toHaveBeenCalled();
    expect(press(increment)).toBeNull();
    fireEvent.click(increment, {detail: 1});
    expect(committed(onChange)).toEqual([6]);
    expect(input).toHaveFocus();
  });

  it('a pen press on the column itself (its border) steps once and focuses the field where the primary pointer is fine', () => {
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    const {onChange, input, increment} = setup();
    const column = increment.parentElement as HTMLElement;
    const pointer = {pointerType: 'pen', pointerId: 41, isPrimary: true};
    fireEvent.pointerDown(column, {...pointer, clientX: 200, clientY: 8});
    wait(80);
    fireEvent.pointerUp(column, {...pointer, clientX: 200, clientY: 8});
    act(() => {
      column.dispatchEvent(clickNaming('pen', 1));
    });
    expect(committed(onChange)).toEqual([6]);
    expect(input).toHaveFocus();
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

describe('NumberInput steppers under a mouse where the primary pointer is coarse', () => {
  beforeEach(() => {
    coarsePrimaryPointer();
  });

  // A pen, too, takes the press tracker here, and focusing the field would
  // bring up the on-screen keyboard (`component:NumberInput` FR5).
  it('a pen tap steps once, on its click, without focusing the field', () => {
    const {onChange, input, increment} = setup();
    const pointer = {pointerType: 'pen', pointerId: 42, isPrimary: true};
    fireEvent.pointerDown(increment, {...pointer, clientX: 212, clientY: 8});
    fireEvent.pointerUp(increment, {...pointer, clientX: 212, clientY: 8});
    act(() => {
      increment.dispatchEvent(clickNaming('pen', 1));
    });
    expect(committed(onChange)).toEqual([6]);
    expect(input).not.toHaveFocus();
  });

  // A touch device with a mouse or trackpad: the gesture host serves every
  // pointer there, so the press tracker is a mouse press's one feeder.
  it('a mouse click steps once', () => {
    const {onChange, increment} = setup();
    const pointer = {pointerType: 'mouse', pointerId: 1, isPrimary: true};
    fireEvent.pointerDown(increment, {...pointer, clientX: 212, clientY: 8});
    fireEvent.pointerUp(increment, {...pointer, clientX: 212, clientY: 8});
    act(() => {
      increment.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([6]);
  });

  it('a held mouse repeats like a finger and commits once, at the release', () => {
    const {onChange, input, increment} = setup();
    const pointer = {pointerType: 'mouse', pointerId: 1, isPrimary: true};
    fireEvent.pointerDown(increment, {...pointer, clientX: 212, clientY: 8});
    wait(1200);
    expect(shown(input)).toBe('9');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(increment, {...pointer, clientX: 212, clientY: 8});
    act(() => {
      increment.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([9]);
  });
});

describe('NumberInput steppers losing a held press', () => {
  // A press whose owner goes away mid-hold (the steppers unmounting, or the
  // primary pointer changing kind, which detaches the press tracker or the
  // column's own handlers) lets go at once, as a disabled field does.
  it('a hold lets go when the steppers go away: no further step, no commit', () => {
    coarsePrimaryPointer();
    const onChange = vi.fn<(value: number | null) => void>();
    const {rerender} = render(<Controlled onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    const increment = screen.getByRole('button', {name: 'Increment Quantity'});
    fingerDown(increment, INCREMENT);
    wait(700);
    expect(shown(input)).toBe('6');
    rerender(<Controlled onChange={onChange} hasNumberSteppers={false} />);
    wait(2000);
    expect(shown(input)).toBe('5');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a finger hold lets go when the primary pointer turns fine', () => {
    const pointer = pointerQuery(true);
    try {
      const {onChange, input, increment} = setup();
      fingerDown(increment, INCREMENT);
      wait(700);
      expect(shown(input)).toBe('6');
      act(() => {
        pointer.set(false);
      });
      wait(2000);
      expect(shown(input)).toBe('5');
      expect(onChange).not.toHaveBeenCalled();
    } finally {
      pointer.restore();
    }
  });

  it('a mouse hold lets go when the primary pointer turns coarse', () => {
    const pointer = pointerQuery(false);
    try {
      const {onChange, input, increment} = setup();
      const mouse = {pointerType: 'mouse', pointerId: 1, isPrimary: true};
      fireEvent.pointerDown(increment, {...mouse, clientX: 212, clientY: 8});
      wait(700);
      expect(shown(input)).toBe('6');
      act(() => {
        pointer.set(true);
      });
      wait(2000);
      expect(shown(input)).toBe('5');
      expect(onChange).not.toHaveBeenCalled();
    } finally {
      pointer.restore();
    }
  });
});

describe('NumberInput steppers where the primary pointer is fine', () => {
  it('nothing touch-only attaches: no press tracker, no touch listener, no warning', () => {
    // A fine pointer: this test's context has no coarse pointer.
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    // `spec:AST-094` FR19, FR24: where the primary pointer is fine no touch
    // listener is registered, at the document or on the field.
    const touchListeners: string[] = [];
    const addEventListener = EventTarget.prototype.addEventListener;
    vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(
      function (this: EventTarget, type, listener, options) {
        const isField =
          this instanceof Node &&
          screen.queryByRole('spinbutton')?.closest('div')?.contains(this) ===
            true;
        if (
          type.startsWith('touch') &&
          (this === document || this === window || isField)
        ) {
          touchListeners.push(type);
        }
        addEventListener.call(this, type, listener, options);
      },
    );
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {onChange, increment} = setup();
    const column = increment.parentElement as HTMLElement;
    expect(touchListeners).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
    // The host writes no touch-action of its own on the column.
    expect(column.style.getPropertyValue('touch-action')).toBe('');
    // A mouse still holds the stepper, on the column's own pointer events.
    const pointer = {pointerType: 'mouse', pointerId: 1, isPrimary: true};
    fireEvent.pointerDown(increment, {...pointer, clientX: 212, clientY: 8});
    wait(600);
    fireEvent.pointerUp(increment, {...pointer, clientX: 212, clientY: 8});
    expect(committed(onChange)).toEqual([6]);
    expect(touchListeners).toEqual([]);
  });
});

describe('NumberInput steppers on every touch device', () => {
  it('carry no shared press feedback: the press tracker paints them', () => {
    const {increment, decrement} = setup();
    expect(increment).not.toHaveAttribute('data-astryx-pressable');
    expect(decrement).not.toHaveAttribute('data-astryx-pressable');
  });
});

describe('NumberInput steppers as the touch control', () => {
  // The touch presentation lays the halves side by side; the half under a
  // finger is the nearer one, whatever the layout.
  const MINUS = {x: 312, y: 16};
  const PLUS = {x: 380, y: 16};

  beforeEach(() => {
    coarsePrimaryPointer();
    RECTS = CAPSULE;
  });

  it('a tap on the left half steps down, on the right half up', () => {
    const {onChange, increment, decrement} = setup();
    let id = fingerDown(decrement, MINUS);
    expect(press(decrement)).toBe('on');
    expect(press(increment)).toBeNull();
    touch('touchend', decrement, MINUS, id);
    // Each tap steps on the click its engine sends after the lift (FR11).
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      decrement.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(onChange).toHaveBeenLastCalledWith(4);
    id = fingerDown(increment, PLUS);
    touch('touchend', increment, PLUS, id);
    act(() => {
      increment.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('a slide across the divider carries the paint and the repeat', () => {
    const {onChange, input, increment, decrement} = setup();
    const id = fingerDown(decrement, MINUS);
    wait(800);
    expect(shown(input)).toBe('3');
    touch('touchmove', decrement, PLUS, id);
    expect(press(decrement)).toBeNull();
    expect(press(increment)).toBe('on');
    // The next beat, at 975 ms, steps +.
    wait(175);
    expect(shown(input)).toBe('4');
    touch('touchend', decrement, PLUS, id);
    expect(committed(onChange)).toEqual([4]);
  });

  it('a finger just past the capsule’s end stays on the press', () => {
    // The control profile's tracking area reaches past the capsule.
    const {onChange, increment} = setup();
    const id = fingerDown(increment, PLUS);
    wait(60);
    touch('touchmove', increment, {x: 395, y: 16}, id);
    expect(press(increment)).toBe('on');
    touch('touchend', increment, {x: 395, y: 16}, id);
    // The lift names +, so the click an engine sends within its tap slop
    // steps it.
    act(() => {
      increment.dispatchEvent(clickNaming('mouse', 1));
    });
    expect(committed(onChange)).toEqual([6]);
  });

  it('a finger past the tracking area beyond the capsule’s end is outside it', () => {
    const {onChange, increment} = setup();
    const id = fingerDown(increment, PLUS);
    wait(60);
    touch('touchmove', increment, {x: 480, y: 16}, id);
    touch('touchend', increment, {x: 480, y: 16}, id);
    expect(onChange).not.toHaveBeenCalled();
  });
});
