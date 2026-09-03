// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, fireEvent, render} from '@testing-library/react';
import {useRef} from 'react';
import {
  useChatStreamScroll,
  type UseChatStreamScrollOptions,
  type UseChatStreamScrollReturn,
} from './useChatStreamScroll';

// ---------------------------------------------------------------------------
// Test infrastructure
//
// jsdom has no layout engine, so these tests cover only the SYNCHRONOUS
// scroll paths (instant positioning, lock state, rAF scheduling decisions).
// The spring physics itself (frame-by-frame integration, scrollend re-lock,
// user-scroll detection) is layout/browser-dependent and is verified
// manually via Storybook — mocking it here would only test the mock.
// ---------------------------------------------------------------------------

let rafQueue: {id: number; cb: FrameRequestCallback}[] = [];
let nextRafId = 1;

function flushRaf() {
  // One flush = one frame: callbacks scheduled during a flush run next flush.
  const frame = rafQueue;
  rafQueue = [];
  act(() => {
    for (const {cb} of frame) {
      cb(performance.now());
    }
  });
}

beforeEach(() => {
  rafQueue = [];
  nextRafId = 1;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextRafId++;
    rafQueue.push({id, cb});
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    rafQueue = rafQueue.filter(frame => frame.id !== id);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// The global test setup polyfills matchMedia with a never-matching stub;
// this override makes only the reduced-motion query match, mirroring the
// pattern in useStreamingText.test.ts. Undone by afterEach's
// unstubAllGlobals.
function stubReducedMotion() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

function setGeometry(
  el: HTMLElement,
  {scrollHeight, clientHeight}: {scrollHeight: number; clientHeight: number},
) {
  Object.defineProperty(el, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(el, 'clientHeight', {
    value: clientHeight,
    configurable: true,
  });
  Object.defineProperty(el, 'offsetHeight', {
    value: clientHeight,
    configurable: true,
  });
}

function Harness({
  options,
  api,
}: {
  options?: Partial<UseChatStreamScrollOptions>;
  api: {current: UseChatStreamScrollReturn | null};
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  api.current = useChatStreamScroll({scrollRef, ...options});
  // A vertically scrollable child — a code block, a table — whose gestures
  // bubble to the scroller.
  return (
    <div ref={scrollRef} data-testid="scroller">
      <div data-testid="nested" style={{overflowY: 'auto'}} />
    </div>
  );
}

function renderHook(options?: Partial<UseChatStreamScrollOptions>) {
  const api: {current: UseChatStreamScrollReturn | null} = {current: null};
  const utils = render(<Harness options={options} api={api} />);
  const el = utils.getByTestId('scroller');
  const nested = utils.getByTestId('nested');
  setGeometry(nested, {scrollHeight: 600, clientHeight: 200});
  return {api, el, nested, ...utils};
}

describe('useChatStreamScroll — initial positioning', () => {
  it('default: jumps to the bottom on mount when content is scrollable', () => {
    const {el} = renderHook();
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();
    expect(el.scrollTop).toBe(600);
  });

  it('positions the first async fill in one synchronous step', () => {
    const {api, el} = renderHook();
    // Mount while loading — nothing scrollable yet.
    setGeometry(el, {scrollHeight: 400, clientHeight: 400});
    flushRaf();
    expect(el.scrollTop).toBe(0);

    // Async content lands; the layout's ResizeObserver calls scrollIfLocked.
    setGeometry(el, {scrollHeight: 1200, clientHeight: 400});
    act(() => api.current!.scrollIfLocked());
    // Positioned synchronously — no animation frames needed.
    expect(el.scrollTop).toBe(800);

    // Subsequent growth (streaming) goes back to the spring: nothing moves
    // until animation frames run.
    setGeometry(el, {scrollHeight: 1600, clientHeight: 400});
    act(() => api.current!.scrollIfLocked());
    expect(el.scrollTop).toBe(800);
  });

  it('consumes the pending first fill via the mount jump too', () => {
    const {api, el} = renderHook();
    // Content already present at mount.
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();
    expect(el.scrollTop).toBe(600);

    // Growth after the mount jump is streaming — spring path, not instant.
    setGeometry(el, {scrollHeight: 1400, clientHeight: 400});
    act(() => api.current!.scrollIfLocked());
    expect(el.scrollTop).toBe(600);
  });

  it('default: starts locked', () => {
    const {api} = renderHook();
    expect(api.current!.isLocked).toBe(true);
  });
});

describe("useChatStreamScroll — scrollToBottom({behavior: 'instant'})", () => {
  it('jumps synchronously without scheduling animation frames', () => {
    const {api, el} = renderHook();
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf(); // consume the mount jump
    el.scrollTop = 100; // user scrolled up

    rafQueue = [];
    act(() => api.current!.scrollToBottom({behavior: 'instant'}));
    expect(el.scrollTop).toBe(600);
    expect(rafQueue).toHaveLength(0);
  });

  it('re-locks after an instant jump', () => {
    const {api, el} = renderHook();
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();
    act(() => api.current!.unlock());
    expect(api.current!.isLocked).toBe(false);

    act(() => api.current!.scrollToBottom({behavior: 'instant'}));
    expect(api.current!.isLocked).toBe(true);
    expect(el.scrollTop).toBe(600);
  });

  it('default scrollToBottom animates instead of jumping', () => {
    const {api, el} = renderHook();
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();
    el.scrollTop = 100;

    act(() => api.current!.scrollToBottom());
    // Spring path: position is untouched until animation frames run.
    expect(el.scrollTop).toBe(100);
    expect(rafQueue.length).toBeGreaterThan(0);
  });
});

describe('useChatStreamScroll — prefers-reduced-motion', () => {
  it('streaming growth jumps synchronously instead of springing', () => {
    stubReducedMotion();
    const {api, el} = renderHook();
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf(); // consume the mount jump
    expect(el.scrollTop).toBe(600);

    // Post-first-fill growth would normally take the spring path; under
    // reduced motion it must land in the same synchronous step.
    setGeometry(el, {scrollHeight: 1400, clientHeight: 400});
    rafQueue = [];
    act(() => api.current!.scrollIfLocked());
    expect(el.scrollTop).toBe(1000);
    expect(rafQueue).toHaveLength(0);
  });

  it('default scrollToBottom falls back to an instant jump', () => {
    stubReducedMotion();
    const {api, el} = renderHook();
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();
    el.scrollTop = 100; // user scrolled up

    rafQueue = [];
    act(() => api.current!.scrollToBottom());
    expect(el.scrollTop).toBe(600);
    expect(rafQueue).toHaveLength(0);
    expect(api.current!.isLocked).toBe(true);
  });
});

describe('useChatStreamScroll — reader gestures', () => {
  // Mount with content present: the initial jump lands at the bottom, and one
  // scroll event syncs the tracked geometry so later events are judged
  // against it rather than against the empty container.
  function settleAtBottom(el: HTMLElement) {
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();
    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });
  }

  function wheelUp(target: HTMLElement) {
    act(() => {
      target.dispatchEvent(
        new WheelEvent('wheel', {deltaY: -120, bubbles: true}),
      );
    });
  }

  // A finger lands and moves down — the drag that scrolls content up.
  function dragDown(target: HTMLElement) {
    act(() => {
      fireEvent.touchStart(target, {touches: [{clientX: 0, clientY: 100}]});
      fireEvent.touchMove(target, {touches: [{clientX: 0, clientY: 140}]});
    });
  }

  // The reader's scroll arrives in the same event that carries new content —
  // the shape every scroll event has while a turn is streaming.
  function scrollUpDuringGrowth(el: HTMLElement) {
    setGeometry(el, {scrollHeight: 1400, clientHeight: 400});
    el.scrollTop = 300;
    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });
  }

  it('releases follow when a wheel vouched for the scroll', () => {
    const {api, el} = renderHook();
    settleAtBottom(el);
    expect(api.current!.isLocked).toBe(true);

    wheelUp(el);
    scrollUpDuringGrowth(el);

    expect(api.current!.isLocked).toBe(false);
  });

  it('releases follow under prefers-reduced-motion too', () => {
    stubReducedMotion();
    const {api, el} = renderHook();
    settleAtBottom(el);

    wheelUp(el);
    scrollUpDuringGrowth(el);

    expect(api.current!.isLocked).toBe(false);
  });

  it('keeps following when the gesture produced no scroll of its own', () => {
    // A wheel a nested scrollable child consumed still reaches this handler;
    // the only scroll that follows is the content growing.
    const {api, el} = renderHook();
    settleAtBottom(el);

    wheelUp(el);
    setGeometry(el, {scrollHeight: 1400, clientHeight: 400});
    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });

    expect(api.current!.isLocked).toBe(true);
  });

  it('expires the waiver, so a later resize clamp cannot release follow', () => {
    const {api, el} = renderHook();
    settleAtBottom(el);

    wheelUp(el);
    flushRaf();
    flushRaf();

    // Content shrinks — a collapsed tool call — and the browser clamps the
    // position up. Without the expiry this reads as the reader scrolling.
    setGeometry(el, {scrollHeight: 800, clientHeight: 400});
    el.scrollTop = 400;
    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });

    expect(api.current!.isLocked).toBe(true);
  });

  it('a drag vouches for the whole gesture, not just its first frames', () => {
    const {api, el} = renderHook();
    settleAtBottom(el);

    dragDown(el);
    flushRaf();
    flushRaf();
    scrollUpDuringGrowth(el);

    expect(api.current!.isLocked).toBe(false);
  });

  it('a resting finger is not a gesture: a shift under it stays synthetic', () => {
    // The spring is trailing a fast stream when a block above the viewport
    // collapses; scroll anchoring moves scrollTop up by its height. The
    // finger never moved, so nothing here was the reader.
    const {api, el} = renderHook();
    settleAtBottom(el);
    setGeometry(el, {scrollHeight: 2320, clientHeight: 400});
    el.scrollTop = 1344;
    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });

    act(() => {
      fireEvent.touchStart(el, {touches: [{clientX: 0, clientY: 100}]});
    });
    setGeometry(el, {scrollHeight: 2220, clientHeight: 400});
    el.scrollTop = 1244;
    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });

    expect(api.current!.isLocked).toBe(true);
  });

  it('a drag a nested scroller consumes does not vouch for our scroll', () => {
    const {api, el, nested} = renderHook();
    settleAtBottom(el);

    nested.scrollTop = 50;
    dragDown(nested);
    scrollUpDuringGrowth(el);

    expect(api.current!.isLocked).toBe(true);
  });

  it('a nested scroller at its top hands the drag to us', () => {
    const {api, el, nested} = renderHook();
    settleAtBottom(el);

    nested.scrollTop = 0;
    dragDown(nested);
    scrollUpDuringGrowth(el);

    expect(api.current!.isLocked).toBe(false);
  });

  it('a wheel a nested scroller consumes does not vouch for our scroll', () => {
    const {api, el, nested} = renderHook();
    settleAtBottom(el);

    nested.scrollTop = 50;
    wheelUp(nested);
    scrollUpDuringGrowth(el);

    expect(api.current!.isLocked).toBe(true);
  });

  it('a drag we consumed does not let a resize clamp release', () => {
    // The finger is on us but nothing scrolls (overscroll at the bottom);
    // a block above collapses and the clamp lands on the new bottom. That
    // is not the reader scrolling up.
    const {api, el} = renderHook();
    settleAtBottom(el);

    dragDown(el);
    setGeometry(el, {scrollHeight: 800, clientHeight: 400});
    el.scrollTop = 400;
    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });

    expect(api.current!.isLocked).toBe(true);
  });

  it('stops vouching once the drag ends', () => {
    const {api, el} = renderHook();
    settleAtBottom(el);

    dragDown(el);
    act(() => {
      fireEvent.touchEnd(el);
    });
    scrollUpDuringGrowth(el);

    expect(api.current!.isLocked).toBe(true);
  });
});

describe('useChatStreamScroll — spring cancellation', () => {
  it('an instant jump leaves at most one live animation loop', () => {
    const {api, el} = renderHook();
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();

    // Streaming growth starts a spring.
    setGeometry(el, {scrollHeight: 1400, clientHeight: 400});
    act(() => api.current!.scrollIfLocked());
    flushRaf();
    expect(rafQueue).toHaveLength(1);

    // A programmatic jump lands mid-spring, and content grows again before
    // the superseded loop's next tick — so startAnimation opens a second one.
    act(() => api.current!.scrollToBottom({behavior: 'instant'}));
    setGeometry(el, {scrollHeight: 1800, clientHeight: 400});
    act(() => api.current!.scrollIfLocked());
    flushRaf();

    // Only the live loop rescheduled itself.
    expect(rafQueue).toHaveLength(1);
  });
});
