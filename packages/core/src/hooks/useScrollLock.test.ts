// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useScrollLock.test.ts
 * @input Uses vitest, @testing-library/react, useScrollLock hook
 * @output Unit tests for single and concurrent useScrollLock instances: the
 *   root's overflow claim, the untouched scroll offset, the touch guard and the
 *   scrollbar gutter
 * @position Testing; validates useScrollLock.ts implementation
 *
 * SYNC: When useScrollLock.ts changes, update tests to match new behavior
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, renderHook} from '@testing-library/react';
import {useScrollLock} from './useScrollLock';
import {isScrollLockActive, subscribeScrollLock} from './rootScrollStyles';

/** A one-finger (or `fingers`-finger) touch event at (x, y) on `target`. */
function touch(
  target: EventTarget,
  type: 'touchstart' | 'touchmove',
  x: number,
  y: number,
  fingers = 1,
): Event {
  const event = new Event(type, {bubbles: true, cancelable: true});
  const point = {clientX: x, clientY: y, identifier: 0, target};
  Object.defineProperty(event, 'touches', {
    value: Array.from({length: fingers}, () => point),
  });
  target.dispatchEvent(event);
  return event;
}

/** A pan from (x, y0) to (x, y1), returning whether its move was cancelled. */
function pan(target: EventTarget, y0: number, y1: number, fingers = 1) {
  touch(target, 'touchstart', 100, y0, fingers);
  return touch(target, 'touchmove', 100, y1, fingers).defaultPrevented;
}

/** A vertical scroller with `overflow` px to scroll, scrolled to `top`. */
function scroller(
  overflow: number,
  top: number,
  overscrollBehaviorY = 'auto',
): HTMLElement {
  const element = document.createElement('div');
  element.style.overflowY = 'auto';
  element.style.overscrollBehaviorY = overscrollBehaviorY;
  Object.defineProperty(element, 'clientHeight', {value: 200});
  Object.defineProperty(element, 'scrollHeight', {value: 200 + overflow});
  element.scrollTop = top;
  document.body.append(element);
  return element;
}

describe('useScrollLock', () => {
  afterEach(() => {
    cleanup();
    document.body.style.cssText = '';
    document.body.replaceChildren();
    document.documentElement.style.cssText = '';
    // @ts-expect-error -- drop the viewport stub so jsdom's own value comes back
    delete document.documentElement.clientWidth;
    vi.restoreAllMocks();
  });

  it('hides the page overflow while locked and gives the page its own value back', () => {
    document.documentElement.style.overflow = 'auto';

    const lock = renderHook(() => useScrollLock(true));
    expect(document.documentElement.style.overflow).toBe('hidden');

    lock.unmount();
    expect(document.documentElement.style.overflow).toBe('auto');
  });

  it('never moves the page: no body pinning, no scroll restore', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(480);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const lock = renderHook(() => useScrollLock(true));
    expect(document.body.style.cssText).toBe('');

    lock.unmount();
    expect(document.body.style.cssText).toBe('');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('leaves the page alone when it is not locked', () => {
    const lock = renderHook(() => useScrollLock(false));

    expect(document.documentElement.style.overflow).toBe('');
    expect(isScrollLockActive()).toBe(false);
    lock.unmount();
  });

  it('keeps one lock in place across rerenders with the same value', () => {
    const changes = vi.fn();
    const unsubscribe = subscribeScrollLock(changes);
    const lock = renderHook(({locked}) => useScrollLock(locked), {
      initialProps: {locked: true},
    });

    lock.rerender({locked: true});
    lock.rerender({locked: true});

    expect(changes).toHaveBeenCalledTimes(1);
    expect(isScrollLockActive()).toBe(true);
    lock.unmount();
    unsubscribe();
  });

  it('stays locked while a second overlay is still open, even if the first closes out of order', () => {
    const first = renderHook(() => useScrollLock(true));
    const second = renderHook(() => useScrollLock(true));

    first.unmount();

    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(isScrollLockActive()).toBe(true);

    second.unmount();

    expect(document.documentElement.style.overflow).toBe('');
    expect(isScrollLockActive()).toBe(false);
  });

  it('reports the page becoming locked and free', () => {
    const states: boolean[] = [];
    const unsubscribe = subscribeScrollLock(() =>
      states.push(isScrollLockActive()),
    );

    const lock = renderHook(({locked}) => useScrollLock(locked), {
      initialProps: {locked: true},
    });
    lock.rerender({locked: false});

    expect(states).toEqual([true, false]);
    unsubscribe();
  });

  describe('touch guard', () => {
    it('cancels a one-finger pan that no scroller under the finger can take', () => {
      const scrim = document.createElement('div');
      document.body.append(scrim);
      renderHook(() => useScrollLock(true));

      expect(pan(scrim, 300, 200)).toBe(true);
    });

    it('lets a pan through when a scroller under the finger can move that way', () => {
      const list = scroller(400, 100);
      const row = document.createElement('div');
      list.append(row);
      renderHook(() => useScrollLock(true));

      expect(pan(row, 300, 200)).toBe(false);
      expect(pan(row, 200, 300)).toBe(false);
    });

    it('cancels a pan on a scroller whose content fits', () => {
      const body = scroller(0, 0);
      renderHook(() => useScrollLock(true));

      expect(pan(body, 300, 200)).toBe(true);
    });

    it('cancels a pan past a scroller edge that would chain to the page', () => {
      const list = scroller(400, 0);
      renderHook(() => useScrollLock(true));

      // At the top, a finger moving down has nothing left to scroll in the list.
      expect(pan(list, 200, 300)).toBe(true);
    });

    it('lets a pan through at an edge when the scroller keeps its own overscroll', () => {
      const list = scroller(400, 0, 'contain');
      renderHook(() => useScrollLock(true));

      expect(pan(list, 200, 300)).toBe(false);
    });

    it('never cancels a two-finger gesture, so pinch-zoom keeps working', () => {
      const scrim = document.createElement('div');
      document.body.append(scrim);
      renderHook(() => useScrollLock(true));

      expect(pan(scrim, 300, 200, 2)).toBe(false);
    });

    it('decides once per touch, as the browser picks its scroller once', () => {
      const list = scroller(400, 100);
      renderHook(() => useScrollLock(true));

      touch(list, 'touchstart', 100, 300);
      expect(touch(list, 'touchmove', 100, 250).defaultPrevented).toBe(false);
      // The list reaching its end mid-gesture does not flip the verdict.
      list.scrollTop = 400;
      expect(touch(list, 'touchmove', 100, 200).defaultPrevented).toBe(false);
    });

    it('is gone once the last lock is released', () => {
      const scrim = document.createElement('div');
      document.body.append(scrim);
      const first = renderHook(() => useScrollLock(true));
      const second = renderHook(() => useScrollLock(true));

      first.unmount();
      expect(pan(scrim, 300, 200)).toBe(true);

      second.unmount();
      expect(pan(scrim, 300, 200)).toBe(false);
    });
  });

  it('holds the page still across the scrollbar it hides', () => {
    // A 1024px window over a 1009px layout viewport = a 15px classic
    // scrollbar. Hiding the page overflow hides it, which would widen the page
    // by those 15px and reflow everything sideways.
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1009,
      configurable: true,
    });

    const lock = renderHook(() => useScrollLock(true));

    expect(document.documentElement.style.scrollbarGutter).toBe('stable');

    lock.unmount();

    expect(document.documentElement.style.scrollbarGutter).toBe('');
  });

  it('leaves the page alone when the scrollbar is an overlay one', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1024,
      configurable: true,
    });

    const lock = renderHook(() => useScrollLock(true));

    expect(document.documentElement.style.scrollbarGutter).toBe('');
    expect(document.documentElement.style.paddingRight).toBe('');

    lock.unmount();
  });

  it('holds the gutter for the outermost overlay only, and gives it back once', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1009,
      configurable: true,
    });

    const first = renderHook(() => useScrollLock(true));
    const second = renderHook(() => useScrollLock(true));

    expect(document.documentElement.style.scrollbarGutter).toBe('stable');

    first.unmount();

    expect(document.documentElement.style.scrollbarGutter).toBe('stable');

    second.unmount();

    expect(document.documentElement.style.scrollbarGutter).toBe('');
  });
});
