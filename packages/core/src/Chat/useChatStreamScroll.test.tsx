// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, render} from '@testing-library/react';
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

let rafQueue: FrameRequestCallback[] = [];

function flushRaf() {
  // One flush = one frame: callbacks scheduled during a flush run next flush.
  const frame = rafQueue;
  rafQueue = [];
  act(() => {
    for (const cb of frame) {
      cb(performance.now());
    }
  });
}

beforeEach(() => {
  rafQueue = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

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
  return <div ref={scrollRef} data-testid="scroller" />;
}

function renderHook(options?: Partial<UseChatStreamScrollOptions>) {
  const api: {current: UseChatStreamScrollReturn | null} = {current: null};
  const utils = render(<Harness options={options} api={api} />);
  const el = utils.getByTestId('scroller');
  return {api, el, ...utils};
}

describe('useChatStreamScroll — initial positioning', () => {
  it('default: jumps to the bottom on mount when content is scrollable', () => {
    const {el} = renderHook();
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();
    expect(el.scrollTop).toBe(600);
  });

  it("initial: 'instant' positions the first async fill in one synchronous step", () => {
    const {api, el} = renderHook({initial: 'instant'});
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

  it("initial: 'instant' consumes the pending fill via the mount jump too", () => {
    const {api, el} = renderHook({initial: 'instant'});
    // Content already present at mount.
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();
    expect(el.scrollTop).toBe(600);

    // Growth after the mount jump is streaming — spring path, not instant.
    setGeometry(el, {scrollHeight: 1400, clientHeight: 400});
    act(() => api.current!.scrollIfLocked());
    expect(el.scrollTop).toBe(600);
  });

  it('initial: false starts unlocked at the top and never auto-scrolls', () => {
    const {api, el} = renderHook({initial: false});
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();
    expect(el.scrollTop).toBe(0);
    expect(api.current!.isLocked).toBe(false);

    // Content growth does nothing while unlocked.
    setGeometry(el, {scrollHeight: 1600, clientHeight: 400});
    act(() => api.current!.scrollIfLocked());
    flushRaf();
    expect(el.scrollTop).toBe(0);
  });

  it('default: starts locked', () => {
    const {api} = renderHook();
    expect(api.current!.isLocked).toBe(true);
  });
});

describe('useChatStreamScroll — scrollToBottom({instant})', () => {
  it('jumps synchronously without scheduling animation frames', () => {
    const {api, el} = renderHook();
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf(); // consume the mount jump
    el.scrollTop = 100; // user scrolled up

    rafQueue = [];
    act(() => api.current!.scrollToBottom({instant: true}));
    expect(el.scrollTop).toBe(600);
    expect(rafQueue).toHaveLength(0);
  });

  it('re-locks after an instant jump', () => {
    const {api, el} = renderHook();
    setGeometry(el, {scrollHeight: 1000, clientHeight: 400});
    flushRaf();
    act(() => api.current!.unlock());
    expect(api.current!.isLocked).toBe(false);

    act(() => api.current!.scrollToBottom({instant: true}));
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
