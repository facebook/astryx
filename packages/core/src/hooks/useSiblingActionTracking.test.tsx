// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSiblingActionTracking.test.tsx
 * @input useSiblingActionTracking through its members (Toolbar, Banner,
 *   Toast), synthetic touches through the gesture host
 * @output family:action-groups FR1–FR3 and FR5 for a row of sibling Buttons:
 *   the lift decides, the highlight follows the finger, a lift outside runs
 *   nothing, a field is skipped, one action alone is not tracked, and a
 *   coarse pointer reaches 44px
 * @position Unit tests of packages/core/src/hooks/useSiblingActionTracking.ts
 */

import {act, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Banner} from '../Banner';
import {Button} from '../Button';
import {TextInput} from '../TextInput';
import {Toolbar} from '../Toolbar';
import {coarsePrimaryPointer} from '../gestures/__tests__/pointerQuery';
import {
  COARSE_HIT_EXPANSION,
  SIBLING_ACTION_SELECTOR,
} from './useSiblingActionTracking';

interface Point {
  x: number;
  y: number;
}

let nextTouchId = 1;
let time = 1000;

function touch(
  type: 'touchstart' | 'touchmove' | 'touchend',
  target: EventTarget,
  id: number,
  point: Point,
): void {
  const event = new Event(type, {bubbles: true, cancelable: true});
  const entry = {identifier: id, clientX: point.x, clientY: point.y, target};
  Object.defineProperty(event, 'changedTouches', {value: [entry]});
  Object.defineProperty(event, 'touches', {
    value: type === 'touchend' ? [] : [entry],
  });
  Object.defineProperty(event, 'timeStamp', {value: time});
  target.dispatchEvent(event);
}

/** A finger whose events all target the element it landed on, as touches do. */
function finger(target: Element) {
  const id = nextTouchId++;
  return {
    down(point: Point) {
      time += 1000;
      touch('touchstart', target, id, point);
    },
    move(point: Point) {
      time += 16;
      touch('touchmove', target, id, point);
    },
    up(point: Point) {
      time += 16;
      touch('touchend', target, id, point);
    },
  };
}

/** Stub an element's layout box (jsdom lays nothing out). */
function place(element: Element, left: number, top = 0, size = 32): void {
  const rect = DOMRect.fromRect({x: left, y: top, width: size, height: size});
  element.getBoundingClientRect = () => rect;
}

const centerOf = (left: number, size = 32): Point => ({
  x: left + size / 2,
  y: size / 2,
});

const paintOf = (element: Element) => element.getAttribute('data-astryx-press');

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

function mountToolbar() {
  const onCut = vi.fn();
  const onCopy = vi.fn();
  const view = render(
    <Toolbar
      label="Edit"
      startContent={
        <>
          <Button label="Cut" variant="ghost" onClick={onCut} />
          <Button label="Copy" variant="ghost" onClick={onCopy} />
          <TextInput label="Find" isLabelHidden value="" onChange={() => {}} />
        </>
      }
    />,
  );
  act(() => {
    vi.advanceTimersToNextFrame();
  });
  const cut = view.getByRole('button', {name: 'Cut'});
  const copy = view.getByRole('button', {name: 'Copy'});
  const input = view.getByRole('textbox', {name: 'Find'});
  place(cut, 0);
  place(copy, 40);
  place(input, 80, 0, 120);
  return {...view, cut, copy, input, onCut, onCopy};
}

describe('useSiblingActionTracking', () => {
  it('lights the toolbar button under the finger, follows it, and runs the one it lifts on (FR1, FR2)', () => {
    const {cut, copy, onCut, onCopy} = mountToolbar();
    const f = finger(cut);
    f.down(centerOf(0));
    expect(paintOf(cut)).toBe('on');
    f.move(centerOf(40));
    expect(paintOf(cut)).toBeNull();
    expect(paintOf(copy)).toBe('on');
    f.up(centerOf(40));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onCut).not.toHaveBeenCalled();
  });

  it('runs nothing for a lift outside the row (FR3)', () => {
    const {cut, onCut, onCopy} = mountToolbar();
    const f = finger(cut);
    f.down(centerOf(0));
    f.move({x: 16, y: 120});
    expect(paintOf(cut)).toBeNull();
    f.up({x: 16, y: 120});
    expect(onCut).not.toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('skips a field in the toolbar: a press on it is not tracked, and its own buttons are not actions', () => {
    const {input, cut, copy, container} = mountToolbar();
    const f = finger(input);
    f.down({x: 100, y: 16});
    f.move(centerOf(0));
    expect(paintOf(cut)).toBeNull();
    f.up(centerOf(0));
    const toolbar = container.querySelector<HTMLElement>('[role="toolbar"]')!;
    expect([...toolbar.querySelectorAll(SIBLING_ACTION_SELECTOR)]).toEqual([
      cut,
      copy,
    ]);
  });

  it('reaches 44px under a coarse pointer: a press just outside a button lights it (FR5)', () => {
    const {cut, onCut} = mountToolbar();
    const f = finger(cut);
    const justOutside = {x: -COARSE_HIT_EXPANSION + 2, y: 16};
    f.down(justOutside);
    expect(paintOf(cut)).toBe('on');
    f.up(justOutside);
    expect(onCut).toHaveBeenCalledTimes(1);
  });

  it("tracks a Banner's end area only when it holds two or more actions", () => {
    const onRetry = vi.fn();
    const view = render(
      <Banner
        status="error"
        title="Upload failed"
        endContent={<Button label="Retry" variant="ghost" onClick={onRetry} />}
        isDismissable
        onDismiss={() => {}}
      />,
    );
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    const retry = view.getByRole('button', {name: 'Retry'});
    const dismiss = view.getAllByRole('button').find(b => b !== retry)!;
    place(retry, 0);
    place(dismiss, 40);
    const f = finger(retry);
    f.down(centerOf(0));
    expect(paintOf(retry)).toBe('on');
    f.up(centerOf(0));
    expect(onRetry).toHaveBeenCalledTimes(1);

    view.rerender(
      <Banner
        status="error"
        title="Upload failed"
        endContent={<Button label="Retry" variant="ghost" onClick={onRetry} />}
      />,
    );
    const alone = view.getByRole('button', {name: 'Retry'});
    place(alone, 0);
    finger(alone).down(centerOf(0));
    expect(paintOf(alone)).not.toBe('on');
  });
});
