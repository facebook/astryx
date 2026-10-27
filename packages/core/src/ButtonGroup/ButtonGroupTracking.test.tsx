// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ButtonGroupTracking.test.tsx
 * @input ButtonGroup and Button, driven by synthetic touch, pen and mouse
 *   streams under a coarse or a fine primary pointer
 * @output Unit evidence that a button group tracks a held pointer across its
 *   buttons as one action group (`family:action-groups` FR1–FR5)
 * @position Beside ButtonGroup.test.tsx; the real-browser evidence is
 *   __tests__/ButtonGroupTracking.interaction.browser.spec.ts
 */

import {act, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  coarsePrimaryPointer,
  pointerQuery,
} from '../gestures/__tests__/pointerQuery';
import {PRESS_GROUP_ITEM_ATTRIBUTE} from '../utils/pressFeedback';
import {Button} from '../Button';
import {ButtonGroup} from './ButtonGroup';

interface Point {
  x: number;
  y: number;
}

let time = 1000;
let nextTouchId = 1;

/** Dispatch one touch event for a single finger. */
function touch(
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  target: EventTarget,
  id: number,
  point: Point,
): void {
  time += 16;
  const event = new Event(type, {bubbles: true, cancelable: true});
  const entry = {identifier: id, clientX: point.x, clientY: point.y, target};
  const isLift = type === 'touchend' || type === 'touchcancel';
  Object.defineProperty(event, 'changedTouches', {value: [entry]});
  Object.defineProperty(event, 'touches', {value: isLift ? [] : [entry]});
  Object.defineProperty(event, 'timeStamp', {value: time});
  target.dispatchEvent(event);
}

/** A finger, with a fresh id. */
function finger() {
  const id = nextTouchId++;
  return {
    down: (target: Element, point: Point) => {
      time += 1000;
      touch('touchstart', target, id, point);
    },
    move: (target: Element, point: Point) =>
      touch('touchmove', target, id, point),
    up: (target: Element, point: Point) => touch('touchend', target, id, point),
  };
}

/** Dispatch a pointer event of one kind (a pen or a mouse). */
function pointer(
  kind: 'pen' | 'mouse',
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  target: Element,
  point: Point,
): void {
  time += 16;
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: kind === 'pen' ? 41 : 1,
    pointerType: kind,
    isPrimary: true,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
    clientX: point.x,
    clientY: point.y,
  });
  Object.defineProperty(event, 'timeStamp', {value: time});
  target.dispatchEvent(event);
}

/** Stub an element's layout box (jsdom lays nothing out). */
function place(
  element: Element,
  box: {left: number; top: number; width: number; height: number},
): void {
  const rect = DOMRect.fromRect({
    x: box.left,
    y: box.top,
    width: box.width,
    height: box.height,
  });
  element.getBoundingClientRect = () => rect;
}

// Three connected 32 px buttons, the way a small horizontal group lays out.
const A = {left: 0, top: 100, width: 80, height: 32};
const B = {left: 80, top: 100, width: 80, height: 32};
const C = {left: 160, top: 100, width: 80, height: 32};
const GROUP = {left: 0, top: 100, width: 240, height: 32};
const centerOf = (box: typeof A): Point => ({
  x: box.left + box.width / 2,
  y: box.top + box.height / 2,
});

const paintOf = (element: Element) => element.getAttribute('data-astryx-press');

function mount({
  isDisabled = false,
  isBDisabled = false,
  isCMenuTrigger = false,
}: {
  isDisabled?: boolean;
  isBDisabled?: boolean;
  isCMenuTrigger?: boolean;
} = {}) {
  const onA = vi.fn();
  const onB = vi.fn();
  const onC = vi.fn();
  const view = render(
    <ButtonGroup label="Edit" isDisabled={isDisabled} data-testid="group">
      <Button label="Cut" onClick={onA} data-testid="a" />
      <Button
        label="Copy"
        onClick={onB}
        isDisabled={isBDisabled}
        data-testid="b"
      />
      <Button
        label="More"
        onClick={onC}
        data-testid="c"
        {...(isCMenuTrigger ? {'aria-haspopup': 'menu' as const} : {})}
      />
    </ButtonGroup>,
  );
  const group = view.getByTestId('group');
  const a = view.getByTestId('a');
  const b = view.getByTestId('b');
  const c = view.getByTestId('c');
  place(group, GROUP);
  place(a, A);
  place(b, B);
  place(c, C);
  // The gesture host styles what it attached in the next frame.
  act(() => {
    vi.advanceTimersToNextFrame();
  });
  return {...view, group, a, b, c, onA, onB, onC};
}

let restorePointer: () => void = () => {};

beforeEach(() => {
  vi.useFakeTimers();
  restorePointer = coarsePrimaryPointer();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  restorePointer();
});

/** Switch the primary pointer to a mouse (fine) for one case. */
function finePrimaryPointer(): void {
  restorePointer();
  restorePointer = pointerQuery(false).restore;
}

describe('ButtonGroup tracks a held pointer across its buttons (family:action-groups)', () => {
  it('marks each button as a tracked action, and marks none while the group is disabled', () => {
    const {a, b, c, unmount} = mount();
    for (const button of [a, b, c]) {
      expect(button.hasAttribute(PRESS_GROUP_ITEM_ATTRIBUTE)).toBe(true);
    }
    unmount();
    const disabled = mount({isDisabled: true});
    for (const button of [disabled.a, disabled.b, disabled.c]) {
      expect(button.hasAttribute(PRESS_GROUP_ITEM_ATTRIBUTE)).toBe(false);
    }
  });

  it('runs the button a finger lifts on, once, through its own click, after sliding there from another (FR1, FR2)', () => {
    const {a, b, c, onA, onB, onC} = mount();
    const f = finger();
    f.down(a, centerOf(A));
    expect(paintOf(a)).toBe('on');
    f.move(a, centerOf(B));
    expect(paintOf(a)).toBeNull();
    expect(paintOf(b)).toBe('on');
    f.move(a, centerOf(C));
    expect(paintOf(b)).toBeNull();
    expect(paintOf(c)).toBe('on');
    f.up(a, centerOf(C));
    expect(onC).toHaveBeenCalledTimes(1);
    expect(onA).not.toHaveBeenCalled();
    expect(onB).not.toHaveBeenCalled();
  });

  it('runs nothing for a lift outside the group, and the highlight goes as the finger leaves (FR3)', () => {
    const {a, b, c, onA, onB, onC} = mount();
    const f = finger();
    f.down(a, centerOf(A));
    f.move(a, {x: 120, y: 260});
    expect([paintOf(a), paintOf(b), paintOf(c)]).toEqual([null, null, null]);
    f.up(a, {x: 120, y: 260});
    expect(onA).not.toHaveBeenCalled();
    expect(onB).not.toHaveBeenCalled();
    expect(onC).not.toHaveBeenCalled();
  });

  it('tracks a pen like a finger (FR5)', () => {
    const {a, b, onA, onB} = mount();
    pointer('pen', 'pointerdown', a, centerOf(A));
    expect(paintOf(a)).toBe('on');
    pointer('pen', 'pointermove', a, centerOf(B));
    expect(paintOf(b)).toBe('on');
    pointer('pen', 'pointerup', b, centerOf(B));
    expect(onB).toHaveBeenCalledTimes(1);
    expect(onA).not.toHaveBeenCalled();
  });

  it("tracks a mouse under a fine pointer: a press slid from Cut to More runs More once, and the browser's own click runs nothing more (FR5)", () => {
    finePrimaryPointer();
    const {group, a, c, onA, onC} = mount();
    pointer('mouse', 'pointerdown', a, centerOf(A));
    expect(paintOf(a)).toBe('on');
    pointer('mouse', 'pointermove', a, centerOf(C));
    expect(paintOf(a)).toBeNull();
    expect(paintOf(c)).toBe('on');
    pointer('mouse', 'pointerup', c, centerOf(C));
    expect(onC).toHaveBeenCalledTimes(1);
    // The browser's own click for that press lands on the buttons' common
    // parent, where the press began and ended apart.
    group.dispatchEvent(
      new MouseEvent('click', {bubbles: true, cancelable: true, detail: 1}),
    );
    expect(onC).toHaveBeenCalledTimes(1);
    expect(onA).not.toHaveBeenCalled();
  });

  it('skips a disabled button: no highlight, and a lift on it runs nothing (FR2)', () => {
    const {a, b, onB} = mount({isBDisabled: true});
    const f = finger();
    f.down(a, centerOf(A));
    f.move(a, centerOf(B));
    expect(paintOf(b)).toBeNull();
    expect(paintOf(a)).toBeNull();
    f.up(a, centerOf(B));
    expect(onB).not.toHaveBeenCalled();
  });

  it('leaves a menu trigger in the group untracked: it carries no marker, as a menu keeps its own opening (spec:AST-094 FR29)', () => {
    const {a, c} = mount({isCMenuTrigger: true});
    expect(a.hasAttribute(PRESS_GROUP_ITEM_ATTRIBUTE)).toBe(true);
    expect(c.hasAttribute(PRESS_GROUP_ITEM_ATTRIBUTE)).toBe(false);
  });

  it('leaves a menu trigger its own click: the group does not take a press that lands on it (spec:AST-094 FR29)', () => {
    const {c, onC} = mount({isCMenuTrigger: true});
    const f = finger();
    f.down(c, centerOf(C));
    f.up(c, centerOf(C));
    // The browser's own click for that tap reaches the trigger.
    c.dispatchEvent(
      new MouseEvent('click', {bubbles: true, cancelable: true, detail: 1}),
    );
    expect(onC).toHaveBeenCalledTimes(1);
  });

  it("leaves a menu trigger a mouse's click too", () => {
    finePrimaryPointer();
    const {c, onC} = mount({isCMenuTrigger: true});
    pointer('mouse', 'pointerdown', c, centerOf(C));
    pointer('mouse', 'pointerup', c, centerOf(C));
    c.dispatchEvent(
      new MouseEvent('click', {bubbles: true, cancelable: true, detail: 1}),
    );
    expect(onC).toHaveBeenCalledTimes(1);
  });

  describe('touching buttons take no area from each other (FR5)', () => {
    // 28 px buttons side by side at x = 0, 80 and 160: a finger's target
    // grows 8 px above and below each, and none grows into a neighbour.
    const TALL = 28;
    function mountTouching() {
      const view = mount();
      place(view.group, {left: 0, top: 100, width: 240, height: TALL});
      place(view.a, {left: 0, top: 100, width: 80, height: TALL});
      place(view.b, {left: 80, top: 100, width: 80, height: TALL});
      place(view.c, {left: 160, top: 100, width: 80, height: TALL});
      return view;
    }
    const tapAt = (target: Element, point: Point) => {
      const f = finger();
      f.down(target, point);
      f.up(target, point);
    };

    it('a finger at x = 82 runs only the middle button, and at x = 78 only the first', () => {
      const {group, onA, onB, onC} = mountTouching();
      tapAt(group, {x: 82, y: 114});
      expect([onA, onB, onC].map(fn => fn.mock.calls.length)).toEqual([
        0, 1, 0,
      ]);
      tapAt(group, {x: 78, y: 114});
      expect([onA, onB, onC].map(fn => fn.mock.calls.length)).toEqual([
        1, 1, 0,
      ]);
    });

    it('a finger 8 px below a button still counts for that button, and 9 px below for none', () => {
      const {group, onA, onB, onC} = mountTouching();
      tapAt(group, {x: 120, y: 100 + TALL + 8});
      expect([onA, onB, onC].map(fn => fn.mock.calls.length)).toEqual([
        0, 1, 0,
      ]);
      tapAt(group, {x: 120, y: 100 + TALL + 9});
      expect([onA, onB, onC].map(fn => fn.mock.calls.length)).toEqual([
        0, 1, 0,
      ]);
    });
  });

  describe('the 44 px touch target (FR5)', () => {
    // 4 px below Cut: outside its 32 px box, inside the 44 px it grows to.
    const BELOW_A = {x: 40, y: 136};

    it('a finger just past a small button, inside its 44 px target, presses that button', () => {
      const {group, a, onA} = mount();
      const f = finger();
      f.down(group, BELOW_A);
      expect(paintOf(a)).toBe('on');
      f.up(group, BELOW_A);
      expect(onA).toHaveBeenCalledTimes(1);
    });

    it('a finger past the 44 px target presses nothing', () => {
      const {group, a, onA} = mount();
      const f = finger();
      f.down(group, {x: 40, y: 140});
      expect(paintOf(a)).toBeNull();
      f.up(group, {x: 40, y: 140});
      expect(onA).not.toHaveBeenCalled();
    });

    it('a mouse under a fine pointer gets no growth: the same point presses nothing', () => {
      finePrimaryPointer();
      const {group, a, onA} = mount();
      pointer('mouse', 'pointerdown', group, BELOW_A);
      expect(paintOf(a)).toBeNull();
      pointer('mouse', 'pointerup', group, BELOW_A);
      expect(onA).not.toHaveBeenCalled();
    });
  });
});
