// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useScrollLock.test.ts
 * @input Uses vitest, @testing-library/react, useScrollLock hook
 * @output Unit tests for body scroll locking and restoration
 * @position Testing; validates useScrollLock.ts implementation
 *
 * SYNC: When useScrollLock.ts changes, update tests to match new behavior
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useScrollLock} from './useScrollLock';

// jsdom's window.scrollTo is a stub that logs "Not implemented" noise; spy on
// it so we can assert the restore call without the console spam. The spy lives
// for the whole file (not per test) because testing-library's auto-cleanup
// unmounts — and therefore unlocks — after this file's afterEach has run.
let scrollTo: ReturnType<typeof vi.spyOn>;

// window.scrollX / scrollY are configurable accessors in jsdom (always 0).
// Save the real descriptors so each test can pin a scroll offset and put the
// window back afterwards.
const scrollXDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollX')!;
const scrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY')!;

function setScroll(x: number, y: number): void {
  Object.defineProperty(window, 'scrollX', {configurable: true, value: x});
  Object.defineProperty(window, 'scrollY', {configurable: true, value: y});
}

beforeAll(() => {
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

beforeEach(() => {
  scrollTo.mockClear();
});

afterEach(() => {
  Object.defineProperty(window, 'scrollX', scrollXDescriptor);
  Object.defineProperty(window, 'scrollY', scrollYDescriptor);
  document.body.removeAttribute('style');
});

afterAll(() => {
  scrollTo.mockRestore();
});

describe('useScrollLock', () => {
  it('leaves the body styles alone when not locked', () => {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'relative';

    renderHook(() => useScrollLock(false));

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.position).toBe('relative');
    expect(document.body.style.top).toBe('');
    expect(document.body.style.left).toBe('');
    expect(document.body.style.right).toBe('');
  });

  it('does not scroll the window on unmount when it never locked', () => {
    const {unmount} = renderHook(() => useScrollLock(false));
    unmount();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('pins the body with position fixed and hidden overflow when locked', () => {
    setScroll(0, 250);

    renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.left).toBe('0px');
    expect(document.body.style.right).toBe('0px');
  });

  it('offsets the pinned body upward by the current scroll position', () => {
    setScroll(0, 250);

    renderHook(() => useScrollLock(true));

    expect(document.body.style.top).toBe('-250px');
  });

  it('restores every style it saved when the lock is released', () => {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'relative';
    document.body.style.top = '10px';
    document.body.style.left = '5px';
    document.body.style.right = '3px';
    setScroll(0, 120);

    const {rerender} = renderHook(({locked}) => useScrollLock(locked), {
      initialProps: {locked: true},
    });
    expect(document.body.style.position).toBe('fixed');

    rerender({locked: false});

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.position).toBe('relative');
    expect(document.body.style.top).toBe('10px');
    expect(document.body.style.left).toBe('5px');
    expect(document.body.style.right).toBe('3px');
  });

  it('restores the body to its unstyled state after a lock/unlock cycle', () => {
    setScroll(0, 400);

    const {rerender} = renderHook(({locked}) => useScrollLock(locked), {
      initialProps: {locked: false},
    });

    rerender({locked: true});
    expect(document.body.style.top).toBe('-400px');

    rerender({locked: false});
    expect(document.body.getAttribute('style')).toBe('');
  });

  it('scrolls the window back to the position captured at lock time', () => {
    setScroll(30, 250);

    const {rerender} = renderHook(({locked}) => useScrollLock(locked), {
      initialProps: {locked: true},
    });

    // Pinning the body drops the document to the top in a real browser; the
    // hook must restore from the value it saved, not from the current one.
    setScroll(0, 0);
    rerender({locked: false});

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(30, 250);
  });

  it('restores the saved styles and scroll position on unmount', () => {
    document.body.style.overflow = 'auto';
    setScroll(15, 90);

    const {unmount} = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(scrollTo).toHaveBeenCalledWith(15, 90);
  });

  it('keeps the lock in place across rerenders with the same value', () => {
    setScroll(0, 250);

    const {rerender} = renderHook(({locked}) => useScrollLock(locked), {
      initialProps: {locked: true},
    });

    rerender({locked: true});
    rerender({locked: true});

    // Re-running the effect would tear the lock down and back up, restoring
    // scroll each time.
    expect(scrollTo).not.toHaveBeenCalled();
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-250px');
  });

  it('captures the new scroll position when locked a second time', () => {
    setScroll(0, 100);

    const {rerender} = renderHook(({locked}) => useScrollLock(locked), {
      initialProps: {locked: true},
    });
    expect(document.body.style.top).toBe('-100px');

    rerender({locked: false});
    setScroll(0, 300);
    rerender({locked: true});

    expect(document.body.style.top).toBe('-300px');

    rerender({locked: false});
    expect(scrollTo).toHaveBeenLastCalledWith(0, 300);
  });
});
