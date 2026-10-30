// Copyright (c) Meta Platforms, Inc. and affiliates.

import {act, render} from '@testing-library/react';
import {createRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {MonthScroller, type MonthScrollerHandle} from './MonthScroller';
import {SCROLL_QUIET_MS} from './useScrollSettle';

class FakeResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  observe() {
    this.callback([], this);
  }
  unobserve() {}
  disconnect() {}
}

const PANE = 300;

/**
 * The month scroller's settle, with the browser's scrolling played by hand:
 * `scrollTo` is recorded, and the offset is whatever the test sets.
 */
describe('MonthScroller settle', () => {
  const scrollTo = vi.fn();
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'Date',
        'performance',
      ],
    });
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(PANE);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(
      PANE,
    );
    Element.prototype.scrollTo = scrollTo;
    scrollTo.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function renderScroller() {
    const handleRef = createRef<MonthScrollerHandle>();
    const view = render(
      <MonthScroller
        handleRef={handleRef}
        minMonthIndex={0}
        maxMonthIndex={23}
        initialMonthIndex={9}
        onVisibleMonthChange={() => {}}
        selectedDate={null}
        today={{year: 2026, month: 10, day: 15}}
        isDateDisabled={() => false}
        weekStartsOn={0}
        onSelect={() => {}}
      />,
    );
    const scroller = view.container.querySelector<HTMLElement>(
      '[data-scroller="months"]',
    );
    if (scroller == null) {
      throw new Error('no month scroller');
    }
    scrollTo.mockClear();
    return {handleRef, scroller};
  }

  /** The browser moving the scroller to `left`, as a scroll event reports. */
  function scrollBy(scroller: HTMLElement, left: number) {
    scroller.scrollLeft = left;
    scroller.dispatchEvent(new Event('scroll'));
  }

  it('turns scroll snapping back on after re-centers that end on the month they began on', () => {
    const {handleRef, scroller} = renderScroller();
    // Two far jumps in one batch, out and back: each re-centers the mounted
    // months, pausing scroll snapping, and the second puts the center back
    // where it was, so the render that follows changes no center.
    act(() => {
      handleRef.current?.scrollToMonth(20);
      handleRef.current?.scrollToMonth(9);
    });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(scroller.style.scrollSnapType).toBe('');
  });

  it('finishes a steer the browser cut short instead of rounding it back', () => {
    const {handleRef, scroller} = renderScroller();
    // An arrow toward month 10, its scroll 95 % of the way there.
    act(() => handleRef.current?.scrollToMonth(10));
    act(() => scrollBy(scroller, 9 * PANE + 0.95 * PANE));
    // The other arrow, late in that scroll: back toward month 9.
    act(() => handleRef.current?.scrollToMonth(9));
    scrollTo.mockClear();
    // WebKit ends the retargeted scroll where the first one's time ran out,
    // near month 10, and the scroller goes quiet there.
    act(() => scrollBy(scroller, 9 * PANE + 0.95 * PANE));
    act(() => {
      vi.advanceTimersByTime(SCROLL_QUIET_MS + 50);
    });
    // The settle finishes the steer onto month 9, not the nearest pane (10).
    expect(
      scrollTo.mock.calls.map(([options]) => (options as ScrollToOptions).left),
    ).toEqual([9 * PANE]);
  });
});
