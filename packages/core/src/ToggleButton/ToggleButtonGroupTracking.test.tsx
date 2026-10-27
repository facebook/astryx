// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ToggleButtonGroupTracking.test.tsx
 * @input ToggleButtonGroup and ToggleButton, driven by synthetic touch, pen and
 *   mouse streams under a coarse or a fine primary pointer
 * @output Unit evidence that a toggle group tracks a held pointer across its
 *   toggles as one action group, and toggles only the one lifted on
 *   (`family:action-groups` FR1–FR5)
 * @position Beside the ToggleButtonGroup tests; the real-browser evidence is
 *   __tests__/ToggleButtonGroupTracking.interaction.browser.spec.ts
 */

import {act, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  coarsePrimaryPointer,
  pointerQuery,
} from '../gestures/__tests__/pointerQuery';
import {PRESS_GROUP_ITEM_ATTRIBUTE} from '../utils/pressFeedback';
import {Button} from '../Button';
import {ToggleButton} from './ToggleButton';
import {ToggleButtonGroup} from './ToggleButtonGroup';

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
  type = 'multiple',
  isDisabled = false,
}: {type?: 'single' | 'multiple'; isDisabled?: boolean} = {}) {
  const onChange = vi.fn();
  const view = render(
    type === 'single' ? (
      <ToggleButtonGroup
        type="single"
        label="Alignment"
        value={null}
        onChange={onChange}
        isDisabled={isDisabled}
        data-testid="group">
        <ToggleButton label="Left" value="left" data-testid="a" />
        <ToggleButton label="Center" value="center" data-testid="b" />
        <ToggleButton label="Right" value="right" data-testid="c" />
      </ToggleButtonGroup>
    ) : (
      <ToggleButtonGroup
        type="multiple"
        label="Formatting"
        value={[]}
        onChange={onChange}
        isDisabled={isDisabled}
        data-testid="group">
        <ToggleButton label="Bold" value="bold" data-testid="a" />
        <ToggleButton label="Italic" value="italic" data-testid="b" />
        <ToggleButton label="Underline" value="underline" data-testid="c" />
      </ToggleButtonGroup>
    ),
  );
  const group = view.getByTestId('group');
  const a = view.getByTestId('a');
  const b = view.getByTestId('b');
  const c = view.getByTestId('c');
  place(group, GROUP);
  place(a, A);
  place(b, B);
  place(c, C);
  act(() => {
    vi.advanceTimersToNextFrame();
  });
  return {...view, group, a, b, c, onChange};
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

function finePrimaryPointer(): void {
  restorePointer();
  restorePointer = pointerQuery(false).restore;
}

describe('ToggleButtonGroup tracks a held pointer across its toggles (family:action-groups)', () => {
  it('marks each toggle as a tracked action, and marks none while the group is disabled', () => {
    const {a, b, c, unmount} = mount();
    for (const toggle of [a, b, c]) {
      expect(toggle.hasAttribute(PRESS_GROUP_ITEM_ATTRIBUTE)).toBe(true);
    }
    unmount();
    const disabled = mount({isDisabled: true});
    for (const toggle of [disabled.a, disabled.b, disabled.c]) {
      expect(toggle.hasAttribute(PRESS_GROUP_ITEM_ATTRIBUTE)).toBe(false);
    }
  });

  it('a finger slid from Bold across Italic to Underline toggles only Underline (FR4)', () => {
    const {a, b, c, onChange} = mount();
    const f = finger();
    f.down(a, centerOf(A));
    f.move(a, centerOf(B));
    expect(paintOf(b)).toBe('on');
    f.move(a, centerOf(C));
    expect(paintOf(c)).toBe('on');
    f.up(a, centerOf(C));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(['underline']);
  });

  it('in a single-select group, the lifted toggle is the one selected (FR1, FR4)', () => {
    const {a, onChange} = mount({type: 'single'});
    const f = finger();
    f.down(a, centerOf(A));
    f.move(a, centerOf(B));
    f.up(a, centerOf(B));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith('center');
  });

  it('a lift outside the group toggles nothing (FR3)', () => {
    const {a, onChange} = mount();
    const f = finger();
    f.down(a, centerOf(A));
    f.move(a, {x: 120, y: 260});
    f.up(a, {x: 120, y: 260});
    expect(onChange).not.toHaveBeenCalled();
  });

  it("a mouse under a fine pointer: a press slid from Bold to Underline toggles Underline once, and the browser's own click toggles nothing more (FR5)", () => {
    finePrimaryPointer();
    const {group, a, c, onChange} = mount();
    pointer('mouse', 'pointerdown', a, centerOf(A));
    pointer('mouse', 'pointermove', a, centerOf(C));
    pointer('mouse', 'pointerup', c, centerOf(C));
    group.dispatchEvent(
      new MouseEvent('click', {bubbles: true, cancelable: true, detail: 1}),
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(['underline']);
  });

  it('leaves a member that is not a toggle its own click: the group does not take a press that lands on it', () => {
    const onMore = vi.fn();
    const onChange = vi.fn();
    const view = render(
      <ToggleButtonGroup
        type="multiple"
        label="Formatting"
        value={[]}
        onChange={onChange}
        data-testid="group">
        <ToggleButton label="Bold" value="bold" data-testid="a" />
        <Button label="More" onClick={onMore} data-testid="more" />
      </ToggleButtonGroup>,
    );
    const group = view.getByTestId('group');
    const more = view.getByTestId('more');
    place(group, {left: 0, top: 100, width: 160, height: 32});
    place(view.getByTestId('a'), A);
    place(more, B);
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    const f = finger();
    f.down(more, centerOf(B));
    f.up(more, centerOf(B));
    more.dispatchEvent(
      new MouseEvent('click', {bubbles: true, cancelable: true, detail: 1}),
    );
    expect(onMore).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('touching toggles take no area from each other: 28 px toggles at x = 0, 80 and 160, a finger at x = 82 toggles only the middle one, and 8 px below a toggle still counts for it', () => {
    const {group, a, b, c, onChange} = mount();
    place(group, {left: 0, top: 100, width: 240, height: 28});
    place(a, {left: 0, top: 100, width: 80, height: 28});
    place(b, {left: 80, top: 100, width: 80, height: 28});
    place(c, {left: 160, top: 100, width: 80, height: 28});
    const tapAt = (point: Point) => {
      const f = finger();
      f.down(group, point);
      f.up(group, point);
    };
    tapAt({x: 82, y: 114});
    expect(onChange).toHaveBeenLastCalledWith(['italic']);
    tapAt({x: 120, y: 136});
    expect(onChange).toHaveBeenCalledTimes(2);
    tapAt({x: 120, y: 137});
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('a finger just past a small toggle, inside its 44 px target, toggles it (FR5)', () => {
    const {group, onChange} = mount();
    const f = finger();
    f.down(group, {x: 40, y: 136});
    f.up(group, {x: 40, y: 136});
    expect(onChange).toHaveBeenLastCalledWith(['bold']);
  });
});
