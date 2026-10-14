// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useScrollOverflow.test.tsx
 * @input Uses vitest, @testing-library/react, useScrollOverflow
 * @output Unit tests for the hook's measurement and its rendered-only gate
 * @position Testing; jsdom lays nothing out, so the scroll box is faked and
 *   `checkVisibility` is stubbed per element.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {useScrollOverflow} from './useScrollOverflow';

// jsdom has no ResizeObserver. This one hands the test the shared observer's
// callback so a resize can be delivered on demand; the registration-time
// measurement comes from `observeResize` itself.
let deliverResize: ((entries: ResizeObserverEntry[]) => void) | null = null;

class FakeResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    deliverResize = entries => callback(entries, this);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// The shared observer reads only `target` off an entry.
function resizeEntry(target: Element): ResizeObserverEntry {
  return {target} as unknown as ResizeObserverEntry;
}

type Reads = {scrollWidth: number; clientWidth: number; scrollLeft: number};

// Fakes an overflowing scroll box and counts every layout read on it.
function fakeScrollBox(
  el: HTMLElement,
  box: {scrollWidth: number; clientWidth: number; scrollLeft?: number},
): Reads {
  const reads: Reads = {scrollWidth: 0, clientWidth: 0, scrollLeft: 0};
  const values: Reads = {scrollLeft: 0, ...box};
  for (const name of Object.keys(reads) as (keyof Reads)[]) {
    Object.defineProperty(el, name, {
      configurable: true,
      get() {
        reads[name] += 1;
        return values[name];
      },
    });
  }
  return reads;
}

function totalReads(reads: Reads): number {
  return reads.scrollWidth + reads.clientWidth + reads.scrollLeft;
}

function stubRendered(el: HTMLElement, rendered: boolean | undefined) {
  Object.defineProperty(el, 'checkVisibility', {
    configurable: true,
    value: rendered === undefined ? undefined : () => rendered,
  });
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  deliverResize = null;
});

describe('useScrollOverflow', () => {
  it('measures a rendered container when the ref attaches', () => {
    const el = document.createElement('div');
    const reads = fakeScrollBox(el, {scrollWidth: 600, clientWidth: 300});
    stubRendered(el, true);
    const {result, unmount} = renderHook(() => useScrollOverflow());

    act(() => {
      result.current.scrollRef(el);
    });

    expect(result.current.hasOverflow).toBe(true);
    expect(result.current.overflowStart).toBe(false);
    expect(result.current.overflowEnd).toBe(true);
    expect(totalReads(reads)).toBeGreaterThan(0);
    unmount();
  });

  it('reads no layout while the container is not rendered', () => {
    const el = document.createElement('div');
    const reads = fakeScrollBox(el, {scrollWidth: 600, clientWidth: 300});
    stubRendered(el, false);
    const {result, unmount} = renderHook(() => useScrollOverflow());

    act(() => {
      result.current.scrollRef(el);
    });
    // A resize delivered for the hidden box (a `display: none` or a
    // `content-visibility: hidden` ancestor reports a zero box) is skipped too.
    act(() => {
      deliverResize?.([resizeEntry(el)]);
    });

    expect(totalReads(reads)).toBe(0);
    expect(result.current.hasOverflow).toBe(false);
    expect(result.current.overflowEnd).toBe(false);
    unmount();
  });

  it('keeps the last state while hidden and measures again on the reveal', () => {
    const el = document.createElement('div');
    const reads = fakeScrollBox(el, {
      scrollWidth: 600,
      clientWidth: 300,
      scrollLeft: 150,
    });
    stubRendered(el, true);
    const {result, unmount} = renderHook(() => useScrollOverflow());

    act(() => {
      result.current.scrollRef(el);
    });
    expect(result.current.overflowStart).toBe(true);
    expect(result.current.overflowEnd).toBe(true);

    stubRendered(el, false);
    const readsBeforeHide = totalReads(reads);
    act(() => {
      deliverResize?.([resizeEntry(el)]);
    });
    expect(totalReads(reads)).toBe(readsBeforeHide);
    expect(result.current.overflowStart).toBe(true);
    expect(result.current.overflowEnd).toBe(true);

    // Revealed at the end edge: the resize that follows the reveal measures.
    stubRendered(el, true);
    fakeScrollBox(el, {scrollWidth: 600, clientWidth: 300, scrollLeft: 300});
    act(() => {
      deliverResize?.([resizeEntry(el)]);
    });
    expect(result.current.overflowStart).toBe(true);
    expect(result.current.overflowEnd).toBe(false);
    unmount();
  });

  it('measures in a browser without checkVisibility', () => {
    const el = document.createElement('div');
    const reads = fakeScrollBox(el, {scrollWidth: 600, clientWidth: 300});
    stubRendered(el, undefined);
    const {result, unmount} = renderHook(() => useScrollOverflow());

    act(() => {
      result.current.scrollRef(el);
    });

    expect(result.current.hasOverflow).toBe(true);
    expect(totalReads(reads)).toBeGreaterThan(0);
    unmount();
  });

  it('follows a scroll on a rendered container', () => {
    const el = document.createElement('div');
    fakeScrollBox(el, {scrollWidth: 600, clientWidth: 300});
    stubRendered(el, true);
    const {result, unmount} = renderHook(() => useScrollOverflow());

    act(() => {
      result.current.scrollRef(el);
    });
    expect(result.current.overflowStart).toBe(false);

    fakeScrollBox(el, {scrollWidth: 600, clientWidth: 300, scrollLeft: 300});
    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.overflowStart).toBe(true);
    expect(result.current.overflowEnd).toBe(false);
    unmount();
  });
});
