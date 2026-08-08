// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSheetGestures.test.ts
 * @input Uses vitest, @testing-library/react renderHook, useSheetGestures
 * @output Unit tests for useSheetGestures behavior
 * @position Testing; validates useSheetGestures.ts implementation
 *
 * SYNC: When useSheetGestures.ts changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {
  useSheetGestures,
  type UseSheetGesturesOptions,
} from './useSheetGestures';

const SHEET_HEIGHT = 400;

// A fake pointer event object good enough for the handlers, which only read
// pointerId, clientY, timeStamp, and currentTarget's capture + measure APIs.
function pointerEvent(
  clientY: number,
  timeStamp: number,
  target: HTMLElement,
  pointerId = 1,
) {
  return {
    pointerId,
    clientY,
    timeStamp,
    currentTarget: target,
  } as unknown as React.PointerEvent;
}

function makeTarget(): HTMLElement {
  const el = document.createElement('div');
  el.setPointerCapture = vi.fn();
  el.releasePointerCapture = vi.fn();
  el.getBoundingClientRect = () => ({height: SHEET_HEIGHT}) as DOMRect;
  return el;
}

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function setup(options: Partial<UseSheetGesturesOptions> = {}) {
  const onDismiss = vi.fn();
  const hook = renderHook(
    (props: UseSheetGesturesOptions) => useSheetGestures(props),
    {
      initialProps: {
        isOpen: true,
        onDismiss,
        ...options,
      } as UseSheetGesturesOptions,
    },
  );
  return {hook, onDismiss};
}

type Hook = {
  result: {current: ReturnType<typeof useSheetGestures>};
};

function down(hook: Hook, y: number, t: number, target: HTMLElement) {
  // Register the sheet element the way the component does on mount, so the
  // hook can measure its height (it no longer queries the DOM for it).
  act(() => hook.result.current.sheetRef(target));
  act(() =>
    hook.result.current.handleProps.onPointerDown(pointerEvent(y, t, target)),
  );
}
function move(hook: Hook, y: number, t: number, target: HTMLElement) {
  act(() =>
    hook.result.current.handleProps.onPointerMove(pointerEvent(y, t, target)),
  );
}
function up(hook: Hook, y: number, t: number, target: HTMLElement) {
  act(() =>
    hook.result.current.handleProps.onPointerUp(pointerEvent(y, t, target)),
  );
}

describe('useSheetGestures', () => {
  it('dismisses on a fast downward flick (swipe-to-close)', () => {
    const {hook, onDismiss} = setup({snapHeights: () => [200]});
    const t = makeTarget();
    down(hook, 0, 0, t);
    // 60px in 20ms = 3px/ms, and 60px > the flick distance floor.
    move(hook, 60, 20, t);
    up(hook, 60, 22, t);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('expands to the tallest detent on a fast upward flick', () => {
    const onSnap = vi.fn();
    const {hook, onDismiss} = setup({snapHeights: () => [200], onSnap});
    const t = makeTarget();
    // Start rested at a lower detent by first snapping there via a slow drag.
    down(hook, 0, 0, t);
    move(hook, 200, 400, t); // slow drag down toward the 200px detent
    up(hook, 200, 800, t);
    onSnap.mockClear();
    // Now flick up fast: 60px in 20ms = 3px/ms, over the distance floor.
    down(hook, 200, 1000, t);
    move(hook, 140, 1020, t);
    up(hook, 140, 1022, t);
    expect(onDismiss).not.toHaveBeenCalled();
    expect(onSnap).toHaveBeenLastCalledWith(SHEET_HEIGHT); // full height
    expect(hook.result.current.settledOffset).toBe(0);
  });

  it('does not flick-dismiss on a fast but short nudge', () => {
    const {hook, onDismiss} = setup({snapHeights: () => [200]});
    const t = makeTarget();
    // Fast (20px/10ms = 2px/ms) but only 20px of travel — under the distance
    // floor, so it settles rather than dismissing.
    down(hook, 0, 0, t);
    move(hook, 20, 10, t);
    up(hook, 20, 12, t);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('settles to the nearest detent on a slow drag', () => {
    const onSnap = vi.fn();
    const {hook, onDismiss} = setup({snapHeights: () => [200], onSnap});
    const t = makeTarget();
    // Detents: full=400 (offset 0) and 200 (offset 200). Drag slowly to ~180
    // offset -> nearest is the 200px detent (offset 200).
    down(hook, 0, 0, t);
    move(hook, 90, 300, t);
    move(hook, 180, 700, t);
    up(hook, 180, 1100, t);
    expect(onDismiss).not.toHaveBeenCalled();
    expect(onSnap).toHaveBeenLastCalledWith(200);
    expect(hook.result.current.settledOffset).toBe(200);
  });

  it('a downward drag from a middle detent never snaps back up past it', () => {
    // Three detents on a 600px sheet: full (offset 0), mid 360 (offset 240),
    // short 160 (offset 440). Rest at the mid detent, then drag DOWN a modest
    // amount that's still closer to mid than to short. It must not snap back
    // UP to full — only to mid (stay) or further down.
    const onSnap = vi.fn();
    const {hook} = setup({snapHeights: () => [160, 360], onSnap});
    const t = makeTarget();
    t.getBoundingClientRect = () => ({height: 600}) as DOMRect;
    // Drag to the mid detent (offset 240).
    down(hook, 0, 0, t);
    move(hook, 120, 300, t);
    move(hook, 240, 700, t);
    up(hook, 240, 1100, t);
    expect(hook.result.current.settledOffset).toBe(240);
    onSnap.mockClear();
    // Small slow drag DOWN from mid: offset 240 -> ~300.
    down(hook, 300, 2000, t);
    move(hook, 340, 2200, t);
    move(hook, 360, 2600, t);
    up(hook, 360, 3000, t);
    // Must not have jumped back up to full (offset 0).
    expect(hook.result.current.settledOffset).not.toBe(0);
    expect(hook.result.current.settledOffset).toBeGreaterThanOrEqual(240);
  });

  it('dismisses when dragged well below the shortest detent', () => {
    const {hook, onDismiss} = setup({snapHeights: () => [200]});
    const t = makeTarget();
    // Shortest detent offset = 200 (height 200). Drag slowly past it by
    // >40% of 200 -> offset ~320 dismisses.
    down(hook, 0, 0, t);
    move(hook, 160, 400, t);
    move(hook, 330, 900, t);
    up(hook, 330, 1400, t);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('fades the scrim from full toward the peek floor as it collapses onto the peek detent', () => {
    const onScrimOpacity = vi.fn();
    // Sheet 400, detents at 200 and 300 -> offsets [0, 100, 200]. The fade
    // spans the mid detent (offset 100) to the peek detent (offset 200):
    // full at/above 100, thinned to the peek floor (0.3) at/below 200.
    const {hook} = setup({snapHeights: () => [200, 300], onScrimOpacity});
    const t = makeTarget();
    down(hook, 0, 0, t);
    move(hook, 60, 200, t); // offset 60, above the mid detent -> full
    move(hook, 150, 600, t); // offset 150, halfway -> between 1 and 0.3 (~0.65)
    move(hook, 220, 1000, t); // offset 220, past the peek -> peek floor
    const values = onScrimOpacity.mock.calls.map(c => c[0]);
    expect(values[0]).toBe(1);
    expect(values[1]).toBeGreaterThan(0.55);
    expect(values[1]).toBeLessThan(0.75);
    expect(values[values.length - 1]).toBeCloseTo(0.3);
  });

  it('thins the scrim to the peek floor when settled at the peek detent (still modal)', () => {
    const onScrimOpacity = vi.fn();
    const {hook} = setup({snapHeights: () => [200, 300], onScrimOpacity});
    const t = makeTarget();
    // Slow drag down to the peek detent (offset 200).
    down(hook, 0, 0, t);
    move(hook, 100, 400, t);
    move(hook, 200, 900, t);
    up(hook, 200, 1400, t);
    expect(hook.result.current.settledOffset).toBe(200);
    // Last reported opacity (on settle) is the peek floor, not fully hidden —
    // the sheet is still modal, so the backdrop keeps a minimum dim.
    const values = onScrimOpacity.mock.calls.map(c => c[0]);
    expect(values[values.length - 1]).toBeCloseTo(0.3);
  });

  it('magnetically settles the live drag onto a nearby detent', () => {
    // Detents for a 400px sheet with snaps 300 and 200 -> visible-height snaps
    // become offsets [0, 100, 200]. Approaching the middle detent (offset 100)
    // from just below (raw ~90) — inside MAGNET_RANGE and BELOW the shortest
    // detent so the between-detents magnet applies — should ease toward 100.
    const {hook} = setup({snapHeights: () => [200, 300]});
    const t = makeTarget();
    down(hook, 0, 0, t);
    move(hook, 90, 100, t); // raw offset 90, 10px from the 100 detent
    const off = hook.result.current.dragOffset;
    expect(off).toBeGreaterThan(90); // pulled up toward 100
    expect(off).toBeLessThanOrEqual(100);
  });

  it('translates the surface live during a drag', () => {
    const {hook} = setup({snapHeights: () => [200]});
    const t = makeTarget();
    down(hook, 0, 0, t);
    move(hook, 50, 100, t);
    expect(hook.result.current.dragOffset).toBe(50);
    expect(hook.result.current.isDragging).toBe(true);
    expect(hook.result.current.contentProps.style.transform).toBe(
      'translateY(50px)',
    );
  });

  it('rubber-bands an upward drag past the fully-open position', () => {
    const {hook} = setup({snapHeights: () => [200]});
    const t = makeTarget();
    down(hook, 100, 0, t);
    move(hook, 20, 100, t); // drag up 80px past the top of a rested-at-top sheet
    // Overscroll is allowed but damped: a resisted fraction of the raw -80,
    // and negative (above the top), not the raw distance and not clamped to 0.
    const off = hook.result.current.dragOffset;
    expect(off).toBeLessThan(0);
    expect(off).toBeGreaterThan(-80); // resisted, so smaller in magnitude
  });

  it('dismisses a single-height sheet on a slow drag past the floor', () => {
    const {hook, onDismiss} = setup(); // no snapHeights
    const t = makeTarget();
    // Only detent is the full 400px height (offset 0). A slow drag past 40%
    // of it (>160px) with no detent to catch it dismisses.
    down(hook, 0, 0, t);
    move(hook, 120, 400, t);
    move(hook, 240, 900, t);
    up(hook, 240, 1400, t);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  describe('body overscroll', () => {
    // A scrollable body element nested inside the sheet, with a settable
    // scrollTop so we can simulate "at the top" vs "scrolled".
    function makeBody(scrollTop: number) {
      const body = document.createElement('div');
      Object.defineProperty(body, 'scrollTop', {
        value: scrollTop,
        writable: true,
      });
      body.setPointerCapture = vi.fn();
      body.releasePointerCapture = vi.fn();
      body.getBoundingClientRect = () => ({height: SHEET_HEIGHT}) as DOMRect;
      return body;
    }
    function bodyDown(hook: Hook, y: number, t: number, el: HTMLElement) {
      // Register a sheet element so the hook can measure height (it reads the
      // tracked node, not the DOM). The body stands in with the right height.
      act(() => hook.result.current.sheetRef(el));
      act(() =>
        hook.result.current.bodyProps.onPointerDown(pointerEvent(y, t, el)),
      );
    }
    function bodyMove(hook: Hook, y: number, t: number, el: HTMLElement) {
      act(() =>
        hook.result.current.bodyProps.onPointerMove(pointerEvent(y, t, el)),
      );
    }

    it('promotes a top-overscroll pull-down into a sheet drag', () => {
      const {hook} = setup({snapHeights: () => [200]});
      const body = makeBody(0); // at the top
      bodyDown(hook, 0, 0, body);
      bodyMove(hook, 40, 100, body); // pull down while at the top
      expect(hook.result.current.isDragging).toBe(true);
      expect(hook.result.current.dragOffset).toBe(40);
    });

    it('does not hijack scrolling when the body is scrolled down', () => {
      const {hook} = setup({snapHeights: () => [200]});
      const body = makeBody(120); // scrolled, not at the top
      bodyDown(hook, 0, 0, body);
      bodyMove(hook, 40, 100, body);
      expect(hook.result.current.isDragging).toBe(false);
    });

    it('does not start a drag on an upward move from the top', () => {
      const {hook} = setup({snapHeights: () => [200]});
      const body = makeBody(0);
      bodyDown(hook, 100, 0, body);
      bodyMove(hook, 60, 100, body); // moving up = scrolling intent
      expect(hook.result.current.isDragging).toBe(false);
    });
  });

  describe('body touch handoff', () => {
    // Attach a real DOM node via the body ref, then dispatch touch events. The
    // hook's non-passive touchmove listener is how the handoff works on touch
    // devices (pointer events get cancelled once native panning starts).
    function makeScroller(opts: {
      scrollTop: number;
      clientHeight: number;
      scrollHeight: number;
    }) {
      const sheet = makeTarget();
      const el = document.createElement('div');
      Object.defineProperty(el, 'scrollTop', {
        value: opts.scrollTop,
        writable: true,
      });
      Object.defineProperty(el, 'clientHeight', {value: opts.clientHeight});
      Object.defineProperty(el, 'scrollHeight', {value: opts.scrollHeight});
      el.getBoundingClientRect = () => ({height: SHEET_HEIGHT}) as DOMRect;
      sheet.appendChild(el);
      document.body.appendChild(sheet);
      return el;
    }
    function touch(el: HTMLElement, type: string, y: number, id = 1) {
      const ev = new Event(type, {bubbles: true, cancelable: true});
      // jsdom lacks TouchEvent; attach the fields the handler reads.
      Object.defineProperty(ev, 'changedTouches', {
        value: [{identifier: id, clientY: y}],
      });
      Object.defineProperty(ev, 'currentTarget', {value: el});
      el.dispatchEvent(ev);
      return ev;
    }

    it('promotes a top pull-down (touch) into a sheet drag', () => {
      const {hook} = setup({snapHeights: () => [200]});
      const el = makeScroller({
        scrollTop: 0,
        clientHeight: 200,
        scrollHeight: 800,
      });
      act(() => hook.result.current.sheetRef(el));
      act(() => hook.result.current.bodyProps.ref(el));
      act(() => {
        touch(el, 'touchstart', 0);
        touch(el, 'touchmove', 50);
      });
      expect(hook.result.current.isDragging).toBe(true);
    });

    it('promotes a bottom pull-up (touch) into a sheet drag', () => {
      const {hook} = setup({snapHeights: () => [200]});
      // scrolled to the bottom: scrollTop + clientHeight === scrollHeight
      const el = makeScroller({
        scrollTop: 600,
        clientHeight: 200,
        scrollHeight: 800,
      });
      act(() => hook.result.current.sheetRef(el));
      act(() => hook.result.current.bodyProps.ref(el));
      act(() => {
        touch(el, 'touchstart', 300);
        touch(el, 'touchmove', 250); // pull up
      });
      expect(hook.result.current.isDragging).toBe(true);
    });

    it('leaves native scrolling alone in the middle of the content', () => {
      const {hook} = setup({snapHeights: () => [200]});
      const el = makeScroller({
        scrollTop: 300,
        clientHeight: 200,
        scrollHeight: 800,
      });
      act(() => hook.result.current.sheetRef(el));
      act(() => hook.result.current.bodyProps.ref(el));
      act(() => {
        touch(el, 'touchstart', 300);
        touch(el, 'touchmove', 250);
      });
      expect(hook.result.current.isDragging).toBe(false);
    });
  });
});
