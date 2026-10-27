// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useActionGroupTracking.test.tsx
 * @input A component using useActionGroupTracking over two actions and a
 *   message, laid out with stubbed rects, and touch, pointer and click events
 *   dispatched on it with explicit timestamps
 * @output The group tracking contract: the action under the finger is
 *   painted in the touch-down event; the paint follows the finger and is cut,
 *   not faded, when it leaves; the lift runs only the action under the
 *   finger, once; a touch on the message or a cancel runs nothing; a disabled
 *   action is skipped; a second finger or the window losing focus cancels;
 *   inside a scroller a flick is left to the scroller; a mouse under a fine
 *   pointer is tracked like a finger; the shared tracker does the tracking;
 *   no render per move
 * @position jsdom tests of packages/core/src/hooks/useActionGroupTracking.ts
 */

import {act, render} from '@testing-library/react';
import {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {GestureHost} from '../gestures/GestureHost';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {lockSelection} from '../gestures/selectionLock';
import {
  coarsePrimaryPointer,
  pointerQuery,
} from '../gestures/__tests__/pointerQuery';
import {UIKIT_PRESS} from '../motion/uikit/gestures';
import {PRESS_FADE_MS} from '../utils/pressGesture';
import {createActionGroupTracker} from './actionGroupTracker';
import type * as ActionGroupTrackerModule from './actionGroupTracker';
import {
  useActionGroupTracking,
  type ActionGroupTrackingOptions,
} from './useActionGroupTracking';

// The shared tracker, spied on as it runs (family:action-groups: one module).
vi.mock('./actionGroupTracker', async importOriginal => {
  const actual = await importOriginal<typeof ActionGroupTrackerModule>();
  return {
    ...actual,
    createActionGroupTracker: vi.fn(actual.createActionGroupTracker),
  };
});

interface Contact {
  id: number;
  x: number;
  y: number;
}

/**
 * Dispatch a touch event for `contact`. `others` are the fingers that stay
 * on the glass through it (the event's `touches` lists them too).
 */
function touch(
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  target: EventTarget,
  contact: Contact,
  time: number,
  others: ReadonlyArray<Contact> = [],
): Event {
  const event = new Event(type, {bubbles: true, cancelable: true});
  const toEntry = (finger: Contact) => ({
    identifier: finger.id,
    clientX: finger.x,
    clientY: finger.y,
    target,
  });
  const isLift = type === 'touchend' || type === 'touchcancel';
  const entry = toEntry(contact);
  Object.defineProperty(event, 'changedTouches', {value: [entry]});
  Object.defineProperty(event, 'touches', {
    value: [...others.map(toEntry), ...(isLift ? [] : [entry])],
  });
  Object.defineProperty(event, 'timeStamp', {value: time});
  target.dispatchEvent(event);
  return event;
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

// Cancel and Delete side by side with an 8 px gap, under a message, the way
// an alert lays out two actions.
const MESSAGE = {left: 0, top: 0, width: 208, height: 90};
const CANCEL = {left: 0, top: 100, width: 100, height: 48};
const DELETE = {left: 108, top: 100, width: 100, height: 48};
const centerOf = (box: typeof CANCEL) => ({
  x: box.left + box.width / 2,
  y: box.top + box.height / 2,
});

let renders = 0;
let nextTouchId = 1;
let time = 1000;

/** A finger, with fresh ids and a clock that only moves forward. */
function finger() {
  const id = nextTouchId++;
  return {
    down(target: Element, point: {x: number; y: number}) {
      time += 1000;
      return touch('touchstart', target, {id, ...point}, time);
    },
    move(target: Element, point: {x: number; y: number}, after = 16) {
      time += after;
      return touch('touchmove', target, {id, ...point}, time);
    },
    up(target: Element, point: {x: number; y: number}, after = 16) {
      time += after;
      return touch('touchend', target, {id, ...point}, time);
    },
    cancel(target: Element, point: {x: number; y: number}) {
      time += 16;
      return touch('touchcancel', target, {id, ...point}, time);
    },
  };
}

const NO_OPTIONS: Partial<ActionGroupTrackingOptions> = {};

function Group({
  onCancel,
  onDelete,
  isDeleteDisabled = false,
  options = NO_OPTIONS,
}: {
  onCancel: () => void;
  onDelete: () => void;
  isDeleteDisabled?: boolean;
  options?: Partial<ActionGroupTrackingOptions>;
}) {
  renders += 1;
  const ref = useRef<HTMLDivElement>(null);
  useActionGroupTracking(ref, {
    itemSelector: '[data-action]',
    highlightOnsetMs: 0,
    highlightExpansion: 0,
    ...options,
  });
  return (
    <div ref={ref} data-testid="group">
      <p data-testid="message">Delete this item?</p>
      <button type="button" data-action data-testid="cancel" onClick={onCancel}>
        Cancel
      </button>
      <button
        type="button"
        data-action
        data-testid="delete"
        aria-disabled={isDeleteDisabled || undefined}
        onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}

/** Runs the frame in which the gesture host styles what it just attached. */
function runAttachFrame(): void {
  act(() => {
    vi.advanceTimersToNextFrame();
  });
}

function mount(props: Partial<Parameters<typeof Group>[0]> = {}) {
  const onCancel = vi.fn();
  const onDelete = vi.fn();
  const view = render(
    <Group onCancel={onCancel} onDelete={onDelete} {...props} />,
  );
  const message = view.getByTestId('message');
  const cancel = view.getByTestId('cancel');
  const del = view.getByTestId('delete');
  place(message, MESSAGE);
  place(cancel, CANCEL);
  place(del, DELETE);
  return {...view, onCancel, onDelete, message, cancel, del};
}

const paintOf = (element: Element) => element.getAttribute('data-astryx-press');

// A phone: the gesture host attaches nothing where the primary pointer is
// fine (`spec:AST-094` FR19).
let restorePointer: () => void = () => {};

beforeEach(() => {
  vi.useFakeTimers();
  restorePointer = coarsePrimaryPointer();
  renders = 0;
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  restorePointer();
});

describe('useActionGroupTracking', () => {
  it('paints the touched action in the touch-down event and runs it once at the lift', () => {
    const {cancel, del, onCancel, onDelete} = mount();
    const f = finger();
    f.down(cancel, centerOf(CANCEL));
    expect(paintOf(cancel)).toBe('on');
    expect(paintOf(del)).toBeNull();
    expect(onCancel).not.toHaveBeenCalled();
    f.up(cancel, centerOf(CANCEL), 80);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
    expect(paintOf(cancel)).toBe('fading');
    vi.advanceTimersByTime(PRESS_FADE_MS);
    expect(paintOf(cancel)).toBeNull();
  });

  it('moves the highlight with the finger and runs the action it lifts on', () => {
    const {cancel, del, onCancel, onDelete} = mount();
    const f = finger();
    f.down(del, centerOf(DELETE));
    expect(paintOf(del)).toBe('on');
    // Into the gap between the actions: nothing is highlighted, and the
    // action the finger left is cut, not faded.
    f.move(del, {x: 104, y: 124});
    expect(paintOf(del)).toBeNull();
    expect(paintOf(cancel)).toBeNull();
    f.move(del, centerOf(CANCEL));
    expect(paintOf(cancel)).toBe('on');
    expect(paintOf(del)).toBeNull();
    f.up(del, centerOf(CANCEL));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('keeps no margin around an action: 1 px outside clears it and a lift there runs nothing', () => {
    const {del, onCancel, onDelete} = mount();
    const f = finger();
    f.down(del, centerOf(DELETE));
    f.move(del, {x: 150, y: DELETE.top + DELETE.height});
    expect(paintOf(del)).toBe('on');
    f.move(del, {x: 150, y: DELETE.top + DELETE.height + 1});
    expect(paintOf(del)).toBeNull();
    f.up(del, {x: 150, y: DELETE.top + DELETE.height + 1});
    expect(onCancel).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
    expect(paintOf(del)).toBeNull();
  });

  it('picks the action up again when the finger comes back', () => {
    const {cancel, del, onCancel, onDelete} = mount();
    const f = finger();
    f.down(del, centerOf(DELETE));
    f.move(del, {x: 150, y: 260});
    f.move(del, centerOf(CANCEL));
    expect(paintOf(cancel)).toBe('on');
    f.up(del, centerOf(CANCEL));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('tracks a touch that lands on the message: nothing until it slides onto an action', () => {
    const {message, cancel, onCancel} = mount();
    const f = finger();
    f.down(message, {x: 50, y: 40});
    expect(paintOf(cancel)).toBeNull();
    f.move(message, centerOf(CANCEL));
    expect(paintOf(cancel)).toBe('on');
    f.up(message, centerOf(CANCEL));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('runs nothing for a tap on the message', () => {
    const {message, onCancel, onDelete} = mount();
    const f = finger();
    f.down(message, {x: 50, y: 40});
    f.up(message, {x: 50, y: 40}, 80);
    expect(onCancel).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('cuts the highlight and runs nothing when the touch is cancelled', () => {
    const {cancel, onCancel} = mount();
    const f = finger();
    f.down(cancel, centerOf(CANCEL));
    f.cancel(cancel, centerOf(CANCEL));
    expect(paintOf(cancel)).toBeNull();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('skips a disabled action: no highlight, and a lift on it runs nothing', () => {
    const {cancel, del, onCancel, onDelete} = mount({isDeleteDisabled: true});
    const f = finger();
    f.down(cancel, centerOf(CANCEL));
    f.move(cancel, centerOf(DELETE));
    expect(paintOf(del)).toBeNull();
    expect(paintOf(cancel)).toBeNull();
    f.up(cancel, centerOf(DELETE));
    expect(onDelete).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('ends the gesture with nothing acting when a second finger lands (family:action-groups FR3)', () => {
    const {cancel, del, onCancel, onDelete} = mount();
    const first = {id: nextTouchId++, ...centerOf(CANCEL)};
    const second = {id: nextTouchId++, ...centerOf(DELETE)};
    time += 1000;
    touch('touchstart', cancel, first, time);
    expect(paintOf(cancel)).toBe('on');
    time += 30;
    touch('touchstart', del, second, time, [first]);
    // The second finger ends the gesture: its highlight is cut.
    expect(paintOf(cancel)).toBeNull();
    expect(paintOf(del)).toBeNull();
    time += 16;
    touch('touchend', del, second, time, [first]);
    time += 16;
    touch('touchend', cancel, first, time);
    expect(onCancel).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('ends the gesture with nothing acting when the window loses focus (family:action-groups FR3)', () => {
    const {cancel, onCancel} = mount();
    const f = finger();
    f.down(cancel, centerOf(CANCEL));
    expect(paintOf(cancel)).toBe('on');
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(paintOf(cancel)).toBeNull();
    f.up(cancel, centerOf(CANCEL));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('tracks through the shared action-group tracker', () => {
    vi.mocked(createActionGroupTracker).mockClear();
    const {cancel, onCancel} = mount();
    expect(createActionGroupTracker).toHaveBeenCalledTimes(1);
    const f = finger();
    f.down(cancel, centerOf(CANCEL));
    f.up(cancel, centerOf(CANCEL));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(createActionGroupTracker).toHaveBeenCalledTimes(1);
  });

  it("tracks a mouse under a fine pointer: a press on Delete slid to Cancel runs Cancel once, and the browser's own click runs nothing more (family:action-groups FR5)", () => {
    restorePointer();
    const fine = pointerQuery(false);
    restorePointer = fine.restore;
    const {cancel, del, onCancel, onDelete} = mount();
    runAttachFrame();
    const mouse = (
      target: Element,
      type: string,
      point: {x: number; y: number},
    ) => {
      time += 16;
      const event = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        clientX: point.x,
        clientY: point.y,
      });
      Object.defineProperty(event, 'timeStamp', {value: time});
      target.dispatchEvent(event);
    };
    mouse(del, 'pointerdown', centerOf(DELETE));
    expect(paintOf(del)).toBe('on');
    mouse(del, 'pointermove', centerOf(CANCEL));
    expect(paintOf(del)).toBeNull();
    expect(paintOf(cancel)).toBe('on');
    mouse(cancel, 'pointerup', centerOf(CANCEL));
    expect(onCancel).toHaveBeenCalledTimes(1);
    // The browser's own click for that press (on the buttons' common
    // parent, where the press began and ended apart) runs nothing more.
    cancel.parentElement?.dispatchEvent(
      new MouseEvent('click', {bubbles: true, cancelable: true, detail: 1}),
    );
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('tracks a pen like a finger: a slide from Delete to Cancel runs Cancel', () => {
    const {cancel, del, onCancel, onDelete} = mount();
    const pen = (type: string, point: {x: number; y: number}) => {
      time += 16;
      const event = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 41,
        pointerType: 'pen',
        isPrimary: true,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        clientX: point.x,
        clientY: point.y,
      });
      Object.defineProperty(event, 'timeStamp', {value: time});
      del.dispatchEvent(event);
    };
    pen('pointerdown', centerOf(DELETE));
    expect(paintOf(del)).toBe('on');
    pen('pointermove', centerOf(CANCEL));
    expect(paintOf(del)).toBeNull();
    expect(paintOf(cancel)).toBe('on');
    pen('pointerup', centerOf(CANCEL));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('runs nothing for a pen lifted off both actions', () => {
    const {del, onCancel, onDelete} = mount();
    const pen = (type: string, point: {x: number; y: number}) => {
      time += 16;
      const event = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 42,
        pointerType: 'pen',
        isPrimary: true,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        clientX: point.x,
        clientY: point.y,
      });
      Object.defineProperty(event, 'timeStamp', {value: time});
      del.dispatchEvent(event);
    };
    pen('pointerdown', centerOf(DELETE));
    pen('pointermove', {x: centerOf(DELETE).x, y: 260});
    expect(paintOf(del)).toBeNull();
    pen('pointerup', {x: centerOf(DELETE).x, y: 260});
    expect(onCancel).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('leaves no fade behind when tracking turns off or the group unmounts', () => {
    const view = mount();
    const {cancel} = view;
    // The gesture host reads the surface's touch-action in the frame after it
    // attaches (spec:AST-094 FR18): that frame runs first. Only the fade's
    // own timer is counted below: other timers a lift may arm outlive the
    // group on purpose (a click guard must still swallow the lift's click
    // after the alert closes), so each check counts the timers that go.
    runAttachFrame();
    const f = finger();
    const beforeFade = vi.getTimerCount();
    f.down(cancel, centerOf(CANCEL));
    f.up(cancel, centerOf(CANCEL));
    expect(paintOf(cancel)).toBe('fading');
    const fading = vi.getTimerCount();
    // The fade's timer is running.
    expect(fading).toBeGreaterThan(beforeFade);
    // The lift closed the alert: tracking stops before the fade ends, and
    // the fade's timer goes with it.
    view.rerender(
      <Group
        onCancel={view.onCancel}
        onDelete={view.onDelete}
        options={{isEnabled: false}}
      />,
    );
    expect(paintOf(cancel)).toBeNull();
    expect(vi.getTimerCount()).toBe(fading - 1);
    view.rerender(<Group onCancel={view.onCancel} onDelete={view.onDelete} />);
    runAttachFrame();
    const g = finger();
    g.down(cancel, centerOf(CANCEL));
    g.up(cancel, centerOf(CANCEL));
    expect(paintOf(cancel)).toBe('fading');
    const fadingAgain = vi.getTimerCount();
    view.unmount();
    expect(paintOf(cancel)).toBeNull();
    expect(vi.getTimerCount()).toBe(fadingAgain - 1);
  });

  it('drops its highlight when tracking turns off mid-touch, and the lift runs nothing', () => {
    const view = mount();
    const {cancel} = view;
    const f = finger();
    f.down(cancel, centerOf(CANCEL));
    expect(paintOf(cancel)).toBe('on');
    // The alert closes by other means while the finger rests on Cancel.
    view.rerender(
      <Group
        onCancel={view.onCancel}
        onDelete={view.onDelete}
        options={{isEnabled: false}}
      />,
    );
    expect(paintOf(cancel)).toBeNull();
    f.up(cancel, centerOf(CANCEL));
    expect(view.onCancel).not.toHaveBeenCalled();
    // Turned back on, it starts clean.
    view.rerender(<Group onCancel={view.onCancel} onDelete={view.onDelete} />);
    const g = finger();
    g.down(cancel, centerOf(CANCEL));
    g.up(cancel, centerOf(CANCEL));
    expect(view.onCancel).toHaveBeenCalledTimes(1);
  });

  it('suppresses text selection under a held finger: the group’s hold does something (spec:AST-094 FR41)', () => {
    const attach = vi.spyOn(GestureHost.prototype, 'attach');
    mount();
    const recognizer = attach.mock.calls[0]?.[1];
    expect(recognizer).toBeInstanceOf(LongPressGestureRecognizer);
    expect(recognizer?.selectionLock).toBe(lockSelection);
    attach.mockRestore();
  });

  it('attaches nothing while tracking is off, and attaches when it turns on', () => {
    const attach = vi.spyOn(GestureHost.prototype, 'attach');
    const view = mount({options: {isEnabled: false}});
    expect(attach).not.toHaveBeenCalled();
    view.rerender(<Group onCancel={view.onCancel} onDelete={view.onDelete} />);
    expect(attach).toHaveBeenCalledTimes(1);
    attach.mockRestore();
  });

  it('tracks nothing while disabled', () => {
    const {cancel, del, onCancel, onDelete} = mount({
      options: {isEnabled: false},
    });
    const f = finger();
    f.down(del, centerOf(DELETE));
    expect(paintOf(del)).toBeNull();
    f.move(del, centerOf(CANCEL));
    f.up(del, centerOf(CANCEL));
    expect(onCancel).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
    expect(paintOf(cancel)).toBeNull();
  });

  it('does not render per move', () => {
    const {cancel, del} = mount();
    const before = renders;
    const f = finger();
    f.down(del, centerOf(DELETE));
    for (let x = 150; x >= 50; x -= 10) {
      f.move(del, {x, y: 124});
    }
    f.up(cancel, centerOf(CANCEL));
    expect(renders).toBe(before);
  });

  it('leaves a touch the caller rejects to the browser', () => {
    const {cancel, message, onCancel} = mount({
      options: {shouldTrack: target => target !== message},
    });
    const f = finger();
    f.down(message, {x: 50, y: 40});
    f.move(message, centerOf(CANCEL));
    expect(paintOf(cancel)).toBeNull();
    f.up(message, centerOf(CANCEL));
    expect(onCancel).not.toHaveBeenCalled();
  });

  describe('inside a scroller', () => {
    function mountInScroller() {
      const mounted = mount();
      const group = mounted.getByTestId('group');
      // The message scrolls: a scroller under the touch that has room.
      group.style.overflowY = 'auto';
      Object.defineProperty(group, 'scrollHeight', {value: 400});
      Object.defineProperty(group, 'clientHeight', {value: 200});
      return mounted;
    }

    it('leaves a flick to the scroller: travel past the slop before the delay tracks nothing', () => {
      const {message, cancel, onCancel} = mountInScroller();
      const f = finger();
      f.down(message, {x: 50, y: 40});
      f.move(message, {x: 50, y: 40 + UIKIT_PRESS.slop.value + 2}, 30);
      f.move(message, centerOf(CANCEL), 30);
      expect(paintOf(cancel)).toBeNull();
      f.up(message, centerOf(CANCEL));
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('tracks once the finger has rested for the content-touch delay', () => {
      const {message, cancel, onCancel} = mountInScroller();
      const f = finger();
      f.down(message, {x: 50, y: 40});
      f.move(
        message,
        centerOf(CANCEL),
        UIKIT_PRESS.contentTouchDelay.value + 10,
      );
      expect(paintOf(cancel)).toBe('on');
      f.up(message, centerOf(CANCEL));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
