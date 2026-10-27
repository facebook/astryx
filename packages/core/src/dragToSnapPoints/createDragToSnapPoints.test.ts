// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file createDragToSnapPoints.test.ts
 * @input vitest (jsdom, fake clock), the release rule, the factory driven by
 *   touches through the document's gesture host, a recording stand-in for
 *   Element.animate
 * @output Checks `spec:AST-107` FR2 and FR6 for the factory: the nearest snap
 *   point after a slow release, the next one after a flick past
 *   `flickThreshold` and the default 1008 px/s, the starting one after a
 *   release moving back (`spec:AST-094` FR37) however far the drag went,
 *   `settleTo` from a key, `onSettle` once the element settles and never for
 *   an interrupted settle, bad snap points refused, and no listener left
 *   after `destroy`
 * @position Testing; validates createDragToSnapPoints.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {coarsePrimaryPointer} from '../gestures/__tests__/harness';
import {resolveSnapPoint} from '../motion/resolveSnapPoint';
import {
  createDragToSnapPoints,
  DEFAULT_FLICK_THRESHOLD,
} from './createDragToSnapPoints';

const POINTS = [0, 240, 480];

// The factory settles where Core's one release policy says, called with
// the drag's start: these are FR2's and FR37's cases through that call.
describe('the release policy the factory calls (FR2, AST-094 FR37)', () => {
  const at = (offset: number, velocity: number, startIndex = 0) =>
    resolveSnapPoint({
      points: POINTS,
      position: offset,
      velocity,
      flickThreshold: DEFAULT_FLICK_THRESHOLD,
      start: POINTS[startIndex],
    }).index;

  it('a slow release settles on the nearest snap point', () => {
    expect(at(100, 300)).toBe(0);
    expect(at(130, 300)).toBe(1);
    expect(at(400, 0, 1)).toBe(2);
  });

  it('a release past the default flick speed carries to the next snap point in its direction', () => {
    expect(DEFAULT_FLICK_THRESHOLD).toBe(1008);
    expect(at(30, 1009)).toBe(1);
    expect(at(30, 1007)).toBe(0);
    expect(at(260, -1500, 2)).toBe(1);
  });

  it('flickThreshold changes the speed that carries', () => {
    expect(
      resolveSnapPoint({
        points: POINTS,
        position: 30,
        velocity: 600,
        flickThreshold: 500,
        start: 0,
      }).index,
    ).toBe(1);
  });

  it('a release moving back toward the start returns to the snap point it started from, however far it went', () => {
    expect(at(200, -50)).toBe(0);
    expect(at(470, -3000)).toBe(0);
    expect(at(10, 2000, 2)).toBe(2);
  });

  it('a flick past the last snap point stays on the last', () => {
    expect(at(500, 2000, 1)).toBe(2);
    expect(at(-20, -2000, 1)).toBe(0);
  });
});

interface Recorded {
  startTime: number | null;
  cancelled: boolean;
  readonly playState: string;
  ready: Promise<unknown>;
  finish(): void;
  cancel(): void;
}

let restorePointer: () => void = () => {};
const recorded: Recorded[] = [];

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'performance',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
  });
  restorePointer = coarsePrimaryPointer();
  HTMLElement.prototype.animate = function () {
    let start: number | null = null;
    const animation: Recorded = {
      get startTime() {
        return start;
      },
      set startTime(value) {
        start = value;
      },
      cancelled: false,
      get playState() {
        return this.cancelled ? 'idle' : 'running';
      },
      ready: new Promise(() => {}),
      finish() {},
      cancel() {
        this.cancelled = true;
      },
    };
    requestAnimationFrame(() => {
      if (start == null) {
        start = performance.now();
      }
    });
    recorded.push(animation);
    return animation as unknown as Animation;
  };
});

afterEach(() => {
  restorePointer();
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
  vi.useRealTimers();
  document.body.replaceChildren();
});

function touch(
  type: string,
  target: EventTarget,
  contact: {x: number; y: number},
  time: number,
  isLift = false,
): void {
  const event = new Event(type, {bubbles: true, cancelable: true});
  const entry = {identifier: 1, clientX: contact.x, clientY: contact.y, target};
  Object.defineProperty(event, 'changedTouches', {value: [entry]});
  Object.defineProperty(event, 'touches', {value: isLift ? [] : [entry]});
  Object.defineProperty(event, 'timeStamp', {value: time});
  target.dispatchEvent(event);
}

// The document's host outlives a test, so event times only move forward.
let clock = 1_000_000;

/** A finger dragging down by `dy` in `steps` steps of `ms`, then lifting. */
function dragY(target: Element, dy: number, steps = 4, ms = 16): void {
  clock += 10_000;
  const start = clock;
  touch('touchstart', target, {x: 10, y: 10}, start);
  for (let step = 1; step <= steps; step++) {
    touch(
      'touchmove',
      target,
      {x: 10, y: 10 + (dy * step) / steps},
      start + step * ms,
    );
  }
  touch('touchend', target, {x: 10, y: 10 + dy}, start + steps * ms + 4, true);
}

function sheet(): HTMLElement {
  const element = document.createElement('div');
  document.body.append(element);
  return element;
}

describe('createDragToSnapPoints', () => {
  it('a slow drag settles on the nearest snap point and reports it once settled', async () => {
    const element = sheet();
    const onSettle = vi.fn();
    const snap = createDragToSnapPoints(element, {
      axis: 'y',
      snapPoints: POINTS,
      onSettle,
    });
    // 300 px over a second: slow, nearer 240 than 480.
    dragY(element, 300, 20, 50);
    expect(onSettle).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(3000);
    expect(onSettle).toHaveBeenCalledTimes(1);
    expect(onSettle).toHaveBeenCalledWith(1);
    snap.destroy();
  });

  it('a quick flick carries to the next snap point', async () => {
    const element = sheet();
    const onSettle = vi.fn();
    const snap = createDragToSnapPoints(element, {
      axis: 'y',
      snapPoints: POINTS,
      onSettle,
    });
    // 100 px in 64 ms: about 1500 px/s, past 1008, yet nearer 0 than 240.
    dragY(element, 100);
    await vi.advanceTimersByTimeAsync(3000);
    expect(onSettle).toHaveBeenCalledWith(1);
    snap.destroy();
  });

  it('settleTo settles without a drag, the keyboard path', async () => {
    const element = sheet();
    const onSettle = vi.fn();
    const snap = createDragToSnapPoints(element, {
      axis: 'y',
      snapPoints: POINTS,
      onSettle,
    });
    snap.settleTo(2);
    await vi.advanceTimersByTimeAsync(3000);
    expect(onSettle).toHaveBeenCalledWith(2);
    snap.settleTo(9);
    await vi.advanceTimersByTimeAsync(3000);
    expect(onSettle).toHaveBeenLastCalledWith(2);
    snap.destroy();
  });

  it('a settle interrupted by another reports only the last', async () => {
    const element = sheet();
    const onSettle = vi.fn();
    const snap = createDragToSnapPoints(element, {
      axis: 'y',
      snapPoints: POINTS,
      onSettle,
    });
    snap.settleTo(2);
    await vi.advanceTimersByTimeAsync(50);
    snap.settleTo(1);
    await vi.advanceTimersByTimeAsync(3000);
    expect(onSettle.mock.calls).toEqual([[1]]);
    snap.destroy();
  });

  it('refuses snap points that are empty, not numbers or out of order', () => {
    const element = sheet();
    const onSettle = () => {};
    for (const snapPoints of [[], [0, Number.NaN], [0, 240, 120]]) {
      expect(() =>
        createDragToSnapPoints(element, {axis: 'y', snapPoints, onSettle}),
      ).toThrow(/snapPoints/);
    }
  });

  it('after destroy no drag moves the element and nothing reports', async () => {
    const element = sheet();
    const onSettle = vi.fn();
    const snap = createDragToSnapPoints(element, {
      axis: 'y',
      snapPoints: POINTS,
      onSettle,
    });
    snap.destroy();
    dragY(element, 300, 20, 50);
    snap.settleTo(2);
    await vi.advanceTimersByTimeAsync(3000);
    expect(onSettle).not.toHaveBeenCalled();
    expect(element.style.translate).toBe('');
  });
});
