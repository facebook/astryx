// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CarouselPaging.test.tsx
 * @input vitest (jsdom), Testing Library, Carousel with `hasPaging`, a stubbed
 *   `(pointer: coarse)` media query for the touch presentation
 * @output Proves the paging carousel's DOM and wiring: a track of full-width
 *   pages; native per-page snapping with a pointer; on a touch screen the
 *   shared pager (touch-action, keyboard, buttons, handle, focus following,
 *   looping slide placement, neighbour layers); no edge fade
 * @position Testing; the real-touch proofs are
 *   __tests__/CarouselPaging.interaction.browser.spec.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createRef} from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {Carousel, type CarouselHandle} from './Carousel';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const WIDTH = 300;

/**
 * A coarse (finger) or fine primary pointer; `ios` also makes the engine
 * answer like WebKit on iOS (`-webkit-touch-callout`), the iOS idiom.
 */
function stubPointer(coarse: boolean, ios = coarse) {
  vi.stubGlobal('CSS', {
    supports: (query: string) =>
      ios && query.replace(/\s/g, '') === '(-webkit-touch-callout:none)',
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('pointer: coarse') ? coarse : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(WIDTH);
  if (typeof HTMLElement.prototype.scrollTo !== 'function') {
    HTMLElement.prototype.scrollTo = function () {};
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function getScroller() {
  return screen.getByRole('region').firstElementChild as HTMLElement;
}

function getTrack() {
  return getScroller().firstElementChild as HTMLElement;
}

function trackX() {
  const value = getTrack().style.translate;
  return value === '' ? 0 : Number.parseFloat(value);
}

function renderPages(
  props: Partial<React.ComponentProps<typeof Carousel>> = {},
) {
  const handleRef = createRef<CarouselHandle>();
  render(
    <Carousel aria-label="Pages" hasPaging handleRef={handleRef} {...props}>
      <div>Page one</div>
      <div>Page two</div>
      <div>
        Page three <button type="button">Inside three</button>
      </div>
      <div>Page four</div>
    </Carousel>,
  );
  return handleRef;
}

describe('Carousel hasPaging', () => {
  it('renders the slides in a track, each a page, with no edge fade', () => {
    stubPointer(false);
    renderPages({hasEdgeFade: true});
    const track = getTrack();
    expect(track.children).toHaveLength(4);
    for (const slide of Array.from(track.children)) {
      expect(slide).toHaveAttribute('aria-roledescription', 'slide');
      expect(getComputedStyle(slide).flexBasis).toBe('100%');
    }
    expect(getComputedStyle(getScroller()).maskImage).toBe('none');
  });

  it('with a pointer, snaps natively one page at a time', () => {
    stubPointer(false);
    renderPages();
    const scroller = getScroller();
    expect(getComputedStyle(scroller).scrollSnapType).toBe('x mandatory');
    const slide = getTrack().firstElementChild as HTMLElement;
    expect(getComputedStyle(slide).scrollSnapStop).toBe('always');
    expect(getComputedStyle(slide).scrollSnapAlign).toBe('start');
    // The pager is not attached: keys scroll natively, the track stays.
    fireEvent.keyDown(scroller, {key: 'ArrowRight'});
    expect(getTrack().style.translate).toBe('');
  });

  it('with a pointer, Next scrolls exactly one page', () => {
    stubPointer(false);
    const handle = renderPages();
    const scroller = getScroller();
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;
    act(() => handle.current?.scrollNext());
    expect(scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({left: WIDTH}),
    );
  });

  describe('under a finger outside iOS (Android)', () => {
    beforeEach(() => stubPointer(true, false));

    it('snaps natively one page at a time, on the platform scroll physics', () => {
      renderPages();
      const scroller = getScroller();
      expect(getComputedStyle(scroller).overflowX).not.toBe('clip');
      expect(getComputedStyle(scroller).scrollSnapType).toBe('x mandatory');
      // No pager: the pages stay in the scroller's flow, not in a moving track.
      const track = scroller.firstElementChild as HTMLElement;
      expect(track.style.translate).toBe('');
    });
  });

  describe('under a finger on iOS', () => {
    beforeEach(() => stubPointer(true));

    it('moves the track instead of scrolling: nothing scrolls natively', () => {
      renderPages();
      const scroller = getScroller();
      // jsdom drops touch-action; the browser proofs check 'pan-y pinch-zoom'.
      expect(getComputedStyle(scroller).overflowX).toBe('clip');
      expect(getComputedStyle(scroller).overflowY).toBe('clip');
      expect(getComputedStyle(scroller).scrollSnapType).not.toBe('x mandatory');
    });

    it('arrow keys, Home and End move one page or to the ends', () => {
      renderPages();
      const scroller = getScroller();
      act(() => scroller.focus());
      fireEvent.keyDown(scroller, {key: 'ArrowRight'});
      expect(trackX()).toBe(-WIDTH);
      fireEvent.keyDown(scroller, {key: 'End'});
      expect(trackX()).toBe(-3 * WIDTH);
      fireEvent.keyDown(scroller, {key: 'ArrowRight'});
      expect(trackX()).toBe(-3 * WIDTH);
      fireEvent.keyDown(scroller, {key: 'Home'});
      expect(trackX()).toBe(0);
      fireEvent.keyDown(scroller, {key: 'ArrowLeft'});
      expect(trackX()).toBe(0);
    });

    it('the buttons and the handle page, and know the ends', () => {
      const handle = renderPages();
      const previous = screen.getByRole('button', {name: 'Scroll left'});
      const next = screen.getByRole('button', {name: 'Scroll right'});
      expect(previous).toBeDisabled();
      expect(handle.current?.canScrollPrev()).toBe(false);
      fireEvent.click(next);
      expect(trackX()).toBe(-WIDTH);
      expect(previous).not.toBeDisabled();
      act(() => handle.current?.scrollTo(3));
      expect(trackX()).toBe(-3 * WIDTH);
      expect(next).toBeDisabled();
      expect(handle.current?.canScrollNext()).toBe(false);
      act(() => handle.current?.scrollPrev());
      expect(trackX()).toBe(-2 * WIDTH);
    });

    it('focus moving into another page brings it on screen', () => {
      renderPages();
      act(() => screen.getByRole('button', {name: 'Inside three'}).focus());
      expect(trackX()).toBe(-2 * WIDTH);
    });

    it('gives the page on screen and its neighbours their own layers', () => {
      renderPages();
      const slides = Array.from(getTrack().children) as HTMLElement[];
      expect(slides.map(slide => slide.style.willChange)).toEqual([
        'transform',
        'transform',
        '',
        '',
      ]);
    });

    it('with hasLoop, keeps going forward past the last page', () => {
      const handle = renderPages({hasLoop: true});
      const slides = Array.from(getTrack().children) as HTMLElement[];
      // At page 0 the last slide waits one page back.
      expect(slides[3].style.translate).toBe(`${-4 * WIDTH}px 0`);
      act(() => handle.current?.scrollTo(3));
      // The nearest copy of page 3 is one page back, not three forward.
      expect(trackX()).toBe(WIDTH);
      act(() => handle.current?.scrollNext());
      expect(trackX()).toBe(0);
      expect(handle.current?.canScrollPrev()).toBe(true);
      expect(handle.current?.canScrollNext()).toBe(true);
    });
  });
});
