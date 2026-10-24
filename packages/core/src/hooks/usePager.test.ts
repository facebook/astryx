// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file usePager.test.ts
 * @input vitest (jsdom), the gesture host on a manual clock, the animator on
 *   an injected clock with a recording Web Animations stub, and synthetic
 *   touches at explicit timestamps
 * @output Proves the pager's behaviour: 1:1 tracking with no layout read, the
 *   rubber band at the ends, UIKit's page choice and settle at the lift, the
 *   catch, goTo cancelling a drag, loop, RTL, axis lock, shouldBeginPan,
 *   resize and the callbacks' timing
 * @position Testing; the browser proofs are
 *   __tests__/usePager.interaction.browser.spec.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {GestureHost} from '../gestures/GestureHost';
import {ManualClock} from '../gestures/__tests__/harness';
import {createAnimator, type Animator} from '../motion/animator';
import {solveAnimatedPageScroll, solvePaging} from '../motion/paging';
import {rubberBand} from '../motion/rubberBand';
import {paging} from '../motion/uikit/paging';
import {createPager, type Pager, type PagerOptions} from './usePager';

const WIDTH = 400;

// --- A recording Web Animations stub (pending until a frame commits). ------

interface Recorded {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  startTime: number | null;
  cancelled: boolean;
  playState: string;
  ready: Promise<unknown>;
  cancel(): void;
  commit(at: number): void;
}

let now = 1000;
let recorded: Recorded[] = [];
let frameQueue: (() => void)[] = [];

beforeEach(() => {
  now = 1000;
  recorded = [];
  frameQueue = [];
  vi.useFakeTimers();
  HTMLElement.prototype.animate = function (keyframes, options) {
    let resolveReady: (value: unknown) => void = () => {};
    let rejectReady: (error: Error) => void = () => {};
    const ready = new Promise((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });
    ready.catch(() => {});
    let start: number | null = null;
    const animation: Recorded = {
      keyframes: keyframes as Keyframe[],
      options: options as KeyframeAnimationOptions,
      get startTime() {
        return start;
      },
      set startTime(value) {
        start = value;
        resolveReady(animation);
      },
      cancelled: false,
      get playState() {
        return this.cancelled ? 'idle' : 'running';
      },
      ready,
      cancel() {
        this.cancelled = true;
        rejectReady(new Error('AbortError'));
      },
      commit(at) {
        if (!this.cancelled && start == null) {
          start = at;
        }
        resolveReady(this);
      },
    };
    recorded.push(animation);
    return animation as unknown as Animation;
  };
});

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
  vi.useRealTimers();
  document.body.innerHTML = '';
});

/** Commits a frame, then moves both clocks forward by `ms`. */
async function advance(ms: number, clock?: ManualClock) {
  for (const animation of recorded) {
    if (animation.startTime == null && !animation.cancelled) {
      animation.commit(now);
    }
  }
  const frames = frameQueue;
  frameQueue = [];
  for (const callback of frames) {
    callback();
  }
  await Promise.resolve();
  await Promise.resolve();
  now += ms;
  if (clock != null) {
    clock.time = now;
  }
  await vi.advanceTimersByTimeAsync(ms);
}

// --- Touches ----------------------------------------------------------------

function touch(
  type: 'touchstart' | 'touchmove' | 'touchend',
  target: EventTarget,
  x: number,
  y: number,
  time: number,
): Event {
  const event = new Event(type, {bubbles: true, cancelable: true});
  const contact = {identifier: 1, clientX: x, clientY: y, target};
  const list = type === 'touchend' ? [] : [contact];
  Object.defineProperty(event, 'changedTouches', {value: [contact]});
  Object.defineProperty(event, 'touches', {value: list});
  Object.defineProperty(event, 'timeStamp', {value: time});
  target.dispatchEvent(event);
  return event;
}

interface Fixture {
  pager: Pager;
  viewport: HTMLElement;
  track: HTMLElement;
  page: HTMLElement;
  animator: Animator;
  clock: ManualClock;
  host: GestureHost;
  calls: string[];
  /** The track's x on screen now, from the animator. */
  x(): number;
}

function setup(options: Partial<PagerOptions> = {}, rtl = false): Fixture {
  const clock = new ManualClock();
  clock.time = now;
  const host = new GestureHost(document, {clock});
  const viewport = document.createElement('div');
  const track = document.createElement('div');
  const page = document.createElement('div');
  if (rtl) {
    viewport.style.direction = 'rtl';
  }
  track.appendChild(page);
  viewport.appendChild(track);
  document.body.appendChild(viewport);
  Object.defineProperty(viewport, 'clientWidth', {
    value: WIDTH,
    configurable: true,
  });
  const animator = createAnimator(track, {
    now: () => now,
    prefersReducedMotion: () => false,
    requestFrame: callback => {
      frameQueue.push(callback);
    },
  });
  const calls: string[] = [];
  const pager = createPager(
    {
      count: 5,
      onIndexChange: (index, reason) => calls.push(`index:${index}:${reason}`),
      onSettle: (index, previous) => calls.push(`settle:${index}:${previous}`),
      ...options,
    },
    {
      host,
      animator,
      requestFrame: callback => {
        frameQueue.push(callback);
      },
    },
  );
  pager.attach(viewport, track);
  return {
    pager,
    viewport,
    track,
    page,
    animator,
    clock,
    host,
    calls,
    x: () => animator.get('x', now),
  };
}

/**
 * A horizontal drag on the page: lands at `from`, moves `dx` in steps of
 * `step` px every `dt` ms, optionally holds still, then lifts. Returns the
 * lift time.
 */
async function drag(
  f: Fixture,
  {
    from = 200,
    dx,
    dy = 0,
    step = 4,
    dt = 8,
    hold = 0,
  }: {
    from?: number;
    dx: number;
    dy?: number;
    step?: number;
    dt?: number;
    hold?: number;
  },
): Promise<number> {
  const y = 100;
  touch('touchstart', f.page, from, y, now);
  const steps = Math.max(1, Math.round(Math.abs(dx) / step));
  for (let i = 1; i <= steps; i++) {
    await advance(dt, f.clock);
    touch(
      'touchmove',
      f.page,
      from + (dx * i) / steps,
      y + (dy * i) / steps,
      now,
    );
  }
  if (hold > 0) {
    await advance(hold, f.clock);
  }
  await advance(dt, f.clock);
  touch('touchend', f.page, from + dx, y + dy, now);
  return now;
}

/** Three display frames: a release's report waits for its settle to run. */
async function frames(f: Fixture, count = 3) {
  for (let i = 0; i < count; i++) {
    await advance(16, f.clock);
  }
}

async function settle(f: Fixture) {
  for (let i = 0; i < 80 && f.pager.isSettling; i++) {
    await advance(16, f.clock);
  }
  await advance(16, f.clock);
}

describe('createPager', () => {
  it('rests on the default page', () => {
    const f = setup({defaultIndex: 2});
    expect(f.pager.index).toBe(2);
    expect(f.x()).toBe(-2 * WIDTH);
  });

  it('tracks the finger 1:1 without reading layout while it moves', async () => {
    const f = setup({defaultIndex: 1});
    const width = vi.spyOn(f.viewport, 'clientWidth', 'get');
    touch('touchstart', f.page, 300, 100, now);
    for (let i = 1; i <= 10; i++) {
      await advance(8, f.clock);
      touch('touchmove', f.page, 300 - 6 * i, 100, now);
    }
    // The pan began at 10 px and dropped the threshold's travel (UIKit).
    expect(f.pager.isDragging).toBe(true);
    const shown = -f.x() - WIDTH;
    expect(shown).toBeGreaterThan(40);
    expect(shown).toBeLessThanOrEqual(60);
    const readsWhileMoving = width.mock.calls.length;
    for (let i = 11; i <= 20; i++) {
      await advance(8, f.clock);
      touch('touchmove', f.page, 300 - 6 * i, 100, now);
    }
    expect(width.mock.calls.length).toBe(readsWhileMoving);
    expect(-f.x() - WIDTH - shown).toBeCloseTo(60, 6);
  });

  it('released after a hold past half a page, settles on the next page from rest', async () => {
    const f = setup({defaultIndex: 1});
    // 240 px left at 0.5 px/ms, then still for 100 ms.
    await drag(f, {from: 300, dx: -250, step: 4, dt: 8, hold: 100});
    expect(f.pager.index).toBe(2);
    const position = -f.x();
    // The settle starts at rest (the hold) from the lift position.
    const curve = solvePaging({from: position, velocity: 0, to: 2 * WIDTH});
    await advance(16, f.clock);
    await advance(100, f.clock);
    expect(-f.x()).toBeCloseTo(curve.at(0.116), 0);
    await settle(f);
    expect(f.x()).toBe(-2 * WIDTH);
    expect(f.calls).toEqual(['index:2:drag', 'settle:2:1']);
  });

  it('reports the new page once the settle runs on the compositor, two frames after its first', async () => {
    const f = setup({defaultIndex: 1});
    await drag(f, {from: 300, dx: -250, step: 4, dt: 8, hold: 100});
    // Chosen at the lift (index), reported once the settle is moving.
    expect(f.pager.index).toBe(2);
    expect(f.calls).toEqual([]);
    await advance(16, f.clock);
    await advance(16, f.clock);
    expect(f.calls).toEqual([]);
    expect(recorded.some(a => a.startTime != null && !a.cancelled)).toBe(true);
    await advance(16, f.clock);
    expect(f.calls).toEqual(['index:2:drag']);
  });

  it('a drag that catches the settle before the report still reports the page', async () => {
    const f = setup({defaultIndex: 1});
    await drag(f, {from: 300, dx: -250, step: 4, dt: 8, hold: 100});
    touch('touchstart', f.page, 300, 100, now);
    await advance(8, f.clock);
    touch('touchmove', f.page, 288, 100, now);
    expect(f.pager.isDragging).toBe(true);
    expect(f.calls).toEqual(['index:2:drag']);
    touch('touchend', f.page, 288, 100, now + 200);
  });

  it('released slowly before half a page, returns to the page it started on', async () => {
    const f = setup({defaultIndex: 1});
    // 2 px every 16 ms (125 px/s), then still.
    await drag(f, {from: 300, dx: -150, step: 2, dt: 16, hold: 100});
    expect(f.calls).toEqual([]);
    await settle(f);
    expect(f.x()).toBe(-WIDTH);
    expect(f.calls).toEqual(['settle:1:1']);
  });

  it('a flick at the advance speed pages from a few percent', async () => {
    const f = setup({defaultIndex: 1});
    // 40 px in 4 events of 10 px every 16 ms: 625 px/s, no hold.
    await drag(f, {from: 300, dx: -50, step: 10, dt: 16});
    await frames(f);
    expect(f.calls).toEqual(['index:2:drag']);
    await settle(f);
    expect(f.x()).toBe(-2 * WIDTH);
  });

  it('a hold does not cancel a flick: the page choice keeps the last speed', async () => {
    const f = setup({defaultIndex: 1});
    // 625 px/s to 10 %, then still for 400 ms (UIKit: still pages).
    await drag(f, {from: 300, dx: -50, step: 10, dt: 16, hold: 400});
    await frames(f);
    expect(f.calls).toEqual(['index:2:drag']);
  });

  it('a slow drift does not page', async () => {
    const f = setup({defaultIndex: 1});
    // 2 px every 16 ms: 125 px/s, under the advance speed.
    await drag(f, {from: 300, dx: -60, step: 2, dt: 16});
    await frames(f);
    expect(f.calls).toEqual([]);
  });

  it('never travels more than one page from the page the drag started on', async () => {
    const f = setup({defaultIndex: 1});
    // 1.5 pages in one fast drag: still only the next page.
    await drag(f, {from: 390, dx: -380, step: 12, dt: 8});
    expect(f.pager.index).toBe(2);
    await frames(f);
    expect(f.calls).toEqual(['index:2:drag']);
  });

  it('rubber-bands past the first page with d = the page width', async () => {
    const f = setup({defaultIndex: 0});
    touch('touchstart', f.page, 100, 100, now);
    for (let i = 1; i <= 30; i++) {
      await advance(8, f.clock);
      touch('touchmove', f.page, 100 + 10 * i, 100, now);
    }
    // 300 px of finger, 10 px of it spent on the pan's threshold.
    const finger = 300 - 10;
    expect(f.x()).toBeCloseTo(rubberBand(finger, WIDTH), 1);
    await advance(8, f.clock);
    touch('touchend', f.page, 400, 100, now);
    await settle(f);
    expect(f.x()).toBe(0);
    expect(f.calls).toEqual(['settle:0:0']);
  });

  it('mirrors in RTL: a drag to the right goes forward', async () => {
    const f = setup({defaultIndex: 0}, true);
    expect(f.x()).toBe(0);
    await drag(f, {from: 100, dx: 250, hold: 100});
    expect(f.pager.index).toBe(1);
    await settle(f);
    expect(f.x()).toBe(WIDTH);
    expect(f.calls).toEqual(['index:1:drag', 'settle:1:0']);
  });

  it('leaves a vertical drag to the page: the pan fails', async () => {
    const f = setup({defaultIndex: 1});
    await drag(f, {from: 300, dx: -20, dy: 60});
    expect(f.pager.isDragging).toBe(false);
    expect(f.calls).toEqual([]);
    expect(f.x()).toBe(-WIDTH);
  });

  it('asks shouldBeginPan with the initial direction', async () => {
    const directions: string[] = [];
    const f = setup({
      defaultIndex: 1,
      shouldBeginPan: direction => {
        directions.push(direction);
        return direction === 'right';
      },
    });
    await drag(f, {from: 300, dx: -200, hold: 50});
    expect(directions).toEqual(['left']);
    expect(f.x()).toBe(-WIDTH);
    await drag(f, {from: 100, dx: 250, hold: 50});
    expect(directions).toEqual(['left', 'right']);
    await frames(f);
    expect(f.calls).toContain('index:0:drag');
  });

  it("goTo animates setContentOffset's curve, and fires the callbacks", async () => {
    const f = setup({defaultIndex: 0});
    f.pager.goTo(3);
    expect(f.calls).toEqual(['index:3:goTo']);
    await advance(0, f.clock);
    const curve = solveAnimatedPageScroll({from: 0, to: 3 * WIDTH});
    await advance(150, f.clock);
    expect(-f.x()).toBeCloseTo(curve.at(0.15), 0);
    await settle(f);
    expect(f.x()).toBe(-3 * WIDTH);
    expect(f.calls).toEqual(['index:3:goTo', 'settle:3:0']);
  });

  it('goTo without animation lands at once', () => {
    const f = setup({defaultIndex: 0});
    f.pager.goTo(4, {animated: false});
    expect(f.x()).toBe(-4 * WIDTH);
    expect(f.calls).toEqual(['index:4:goTo', 'settle:4:0']);
  });

  it('goTo during a drag cancels the drag and starts from what is on screen', async () => {
    const f = setup({defaultIndex: 1});
    touch('touchstart', f.page, 300, 100, now);
    for (let i = 1; i <= 10; i++) {
      await advance(8, f.clock);
      touch('touchmove', f.page, 300 - 8 * i, 100, now);
    }
    const onScreen = -f.x();
    f.pager.goTo(3);
    expect(f.pager.isDragging).toBe(false);
    expect(f.pager.pan.state).not.toBe('changed');
    await advance(0, f.clock);
    expect(-f.x()).toBeCloseTo(onScreen, 0);
    // The rest of the finger's travel no longer moves the track.
    await advance(8, f.clock);
    touch('touchmove', f.page, 100, 100, now);
    await settle(f);
    touch('touchend', f.page, 100, 100, now);
    expect(f.x()).toBe(-3 * WIDTH);
    expect(f.calls).toEqual(['index:3:goTo', 'settle:3:1']);
  });

  it('a drag catches a settling track at the value on screen', async () => {
    const f = setup({defaultIndex: 1});
    f.pager.goTo(2);
    await advance(0, f.clock);
    await advance(100, f.clock);
    const onScreen = -f.x();
    expect(onScreen).toBeGreaterThan(WIDTH);
    expect(onScreen).toBeLessThan(2 * WIDTH);
    touch('touchstart', f.page, 300, 100, now);
    await advance(8, f.clock);
    touch('touchmove', f.page, 289, 100, now);
    expect(f.pager.isDragging).toBe(true);
    expect(f.pager.isSettling).toBe(false);
    // From the caught position, 1 px past the threshold.
    expect(-f.x()).toBeCloseTo(-f.animator.get('x', now), 6);
    touch('touchend', f.page, 289, 100, now + 40);
  });

  it(`a still finger catches a settle ${paging.catchStopMs} ms after it lands, and the lift settles on the nearest page`, async () => {
    const f = setup({defaultIndex: 1});
    f.pager.goTo(2);
    await advance(0, f.clock);
    await advance(60, f.clock);
    touch('touchstart', f.page, 300, 100, now);
    await advance(40, f.clock);
    // Still moving 40 ms after the touch.
    expect(f.pager.isSettling).toBe(true);
    await advance(paging.catchStopMs, f.clock);
    expect(f.pager.isSettling).toBe(false);
    const held = -f.x();
    await advance(100, f.clock);
    expect(-f.x()).toBe(held);
    touch('touchend', f.page, 300, 100, now);
    await settle(f);
    expect(f.x()).toBe(-2 * WIDTH);
  });

  it('loops: past the last page goes forward to a virtual page, wrapped for callbacks', async () => {
    const f = setup({defaultIndex: 4, loop: true});
    await drag(f, {from: 300, dx: -250, hold: 50});
    expect(f.pager.virtualIndex).toBe(5);
    expect(f.pager.index).toBe(0);
    await frames(f);
    expect(f.calls).toEqual(['index:0:drag']);
    await settle(f);
    expect(f.x()).toBe(-5 * WIDTH);
    // goTo takes the nearest copy: from virtual 5 (page 0), page 4 is back one.
    f.pager.goTo(4, {animated: false});
    expect(f.pager.virtualIndex).toBe(4);
  });

  it('clamps goTo to the pages when not looping', () => {
    const f = setup({defaultIndex: 0});
    f.pager.goTo(9, {animated: false});
    expect(f.pager.index).toBe(4);
    f.pager.goTo(-3, {animated: false});
    expect(f.pager.index).toBe(0);
  });

  it('a resize mid-settle lands on the target page at its new offset', async () => {
    let onResize: ResizeObserverCallback | null = null;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          onResize = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const f = setup({defaultIndex: 0});
    f.pager.goTo(2);
    await advance(0, f.clock);
    await advance(100, f.clock);
    expect(f.pager.isSettling).toBe(true);
    Object.defineProperty(f.viewport, 'clientWidth', {
      value: 300,
      configurable: true,
    });
    expect(onResize).not.toBeNull();
    onResize!(
      [{target: f.viewport} as unknown as ResizeObserverEntry],
      {} as ResizeObserver,
    );
    expect(f.pager.isSettling).toBe(false);
    expect(f.x()).toBe(-600);
    expect(f.calls).toEqual(['index:2:goTo', 'settle:2:0']);
    vi.unstubAllGlobals();
  });

  it('a smaller count clamps the target page', () => {
    const f = setup({defaultIndex: 4});
    f.pager.setOptions({count: 2});
    expect(f.pager.index).toBe(1);
  });

  it('keeps its motion under Reduced Motion (UIKit keeps paging and setContentOffset)', async () => {
    const f = setup({defaultIndex: 0});
    const reduced = createAnimator(f.track, {
      now: () => now,
      prefersReducedMotion: () => true,
      requestFrame: callback => {
        frameQueue.push(callback);
      },
    });
    const pager = createPager({count: 3}, {host: f.host, animator: reduced});
    pager.attach(f.viewport, f.track);
    pager.goTo(1);
    await advance(0, f.clock);
    await advance(150, f.clock);
    const x = reduced.get('x', now);
    expect(x).toBeLessThan(-0.3 * WIDTH);
    expect(x).toBeGreaterThan(-0.7 * WIDTH);
  });
});
