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
 * A coarse (finger) or fine primary pointer, on any engine (one touch model:
 * nothing asks for iOS); `reduced` turns Reduce Motion on.
 */
function stubPointer(coarse: boolean, {reduced = false} = {}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('pointer: coarse')
        ? coarse
        : reduced && query.includes('prefers-reduced-motion: reduce'),
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

  it('with a pointer under Reduce Motion, Next jumps at once (design:reduced-motion DR3)', () => {
    stubPointer(false, {reduced: true});
    const handle = renderPages();
    const scroller = getScroller();
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;
    const animate = vi.fn();
    scroller.animate = animate;
    act(() => handle.current?.scrollNext());
    expect(scrollBy).toHaveBeenCalledWith({left: WIDTH, behavior: 'auto'});
    expect(animate).not.toHaveBeenCalled();
  });

  it('under a finger and Reduce Motion, a scrolling carousel cross-fades in 200 ms and jumps while transparent (design:reduced-motion DR2)', async () => {
    stubPointer(true, {reduced: true});
    const handleRef = createRef<CarouselHandle>();
    render(
      <Carousel aria-label="Items" handleRef={handleRef}>
        <div>One</div>
        <div>Two</div>
        <div>Three</div>
      </Carousel>,
    );
    const scroller = getScroller();
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;
    const cancel = vi.fn();
    const animate = vi.fn(() => ({finished: Promise.resolve(), cancel}));
    scroller.animate = animate as unknown as HTMLElement['animate'];
    act(() => handleRef.current?.scrollNext());
    const easing = 'cubic-bezier(0.42, 0, 0.58, 1)';
    expect(animate).toHaveBeenCalledWith([{opacity: 1}, {opacity: 0}], {
      duration: 100,
      easing,
      fill: 'forwards',
    });
    expect(scrollBy).not.toHaveBeenCalled();
    await act(async () => Promise.resolve());
    expect(scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({behavior: 'auto'}),
    );
    expect(animate).toHaveBeenLastCalledWith([{opacity: 0}, {opacity: 1}], {
      duration: 100,
      easing,
    });
    expect(cancel).toHaveBeenCalled();
  });

  it('an Android finger pages like any other: one touch model, no platform idiom', () => {
    stubPointer(true);
    vi.stubGlobal('CSS', {supports: () => false});
    renderPages();
    const scroller = getScroller();
    // The pager owns the pans; nothing scrolls natively.
    expect(getComputedStyle(scroller).overflowX).toBe('clip');
    expect(getComputedStyle(scroller).scrollSnapType).not.toBe('x mandatory');
  });

  describe('under a finger (any touch device)', () => {
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

    it('a smaller count clamps the page shown, and growing back keeps the pager and the controls in step', () => {
      const handleRef = createRef<CarouselHandle>();
      const pages = (n: number) => (
        <Carousel aria-label="Pages" hasPaging handleRef={handleRef}>
          {Array.from({length: n}, (_, i) => (
            <div key={i}>Page {i + 1}</div>
          ))}
        </Carousel>
      );
      const view = render(pages(4));
      act(() => handleRef.current?.scrollTo(3));
      expect(trackX()).toBe(-3 * WIDTH);
      view.rerender(pages(2));
      expect(trackX()).toBe(-WIDTH);
      expect(handleRef.current?.canScrollNext()).toBe(false);
      view.rerender(pages(4));
      expect(trackX()).toBe(-WIDTH);
      expect(handleRef.current?.canScrollNext()).toBe(true);
      expect(handleRef.current?.canScrollPrev()).toBe(true);
    });

    it('a gap change reaches the pager: the page keeps its place', () => {
      let gap = 8;
      const real = window.getComputedStyle.bind(window);
      vi.spyOn(window, 'getComputedStyle').mockImplementation(
        (el: Element, pseudo?: string | null) => {
          const style = real(el, pseudo);
          const isTrack =
            el.parentElement?.parentElement?.getAttribute('role') === 'region';
          if (!isTrack) {
            return style;
          }
          // The track's style with jsdom's missing gap (CSS variables are
          // not resolved there).
          const withGap = Object.create(style) as CSSStyleDeclaration;
          Object.defineProperty(withGap, 'columnGap', {get: () => `${gap}px`});
          return withGap;
        },
      );
      const handleRef = createRef<CarouselHandle>();
      const pages = (g: 2 | 4) => (
        <Carousel aria-label="Pages" hasPaging gap={g} handleRef={handleRef}>
          <div>Page one</div>
          <div>Page two</div>
          <div>Page three</div>
          <div>Page four</div>
        </Carousel>
      );
      const view = render(pages(2));
      act(() => handleRef.current?.scrollTo(2));
      expect(trackX()).toBe(-2 * (WIDTH + 8));
      gap = 24;
      view.rerender(pages(4));
      expect(trackX()).toBe(-2 * (WIDTH + 24));
    });

    it('without the buttons it pages natively, so a single pointer can still page (WCAG 2.5.1)', () => {
      renderPages({hasButtons: false});
      const scroller = getScroller();
      expect(getComputedStyle(scroller).overflowX).not.toBe('clip');
      expect(getComputedStyle(scroller).scrollSnapType).toBe('x mandatory');
      expect(getTrack().style.translate).toBe('');
    });

    it('with hasLoop and two slides, Next goes forward with its slide waiting where the track goes', () => {
      // Moves stay in flight (this stub never starts them), so the slides keep
      // the places they took for the move.
      const moves: Keyframe[][] = [];
      HTMLElement.prototype.animate = function (keyframes) {
        moves.push(keyframes as Keyframe[]);
        const pending = new Promise(() => {});
        return {
          startTime: null,
          playState: 'running',
          ready: pending,
          cancel() {},
        } as unknown as Animation;
      };
      try {
        const handleRef = createRef<CarouselHandle>();
        render(
          <Carousel aria-label="Pages" hasPaging hasLoop handleRef={handleRef}>
            <div>Page one</div>
            <div>Page two</div>
          </Carousel>,
        );
        const slides = Array.from(getTrack().children) as HTMLElement[];
        /** Where the latest move takes the track, in pages. */
        const destination = () => {
          const last = moves[moves.length - 1];
          const frame = last[last.length - 1] as {translate?: string};
          return -Number.parseFloat(frame.translate ?? '0') / WIDTH;
        };
        /** Where slide `i` sits, in pages. */
        const placeOf = (i: number) => {
          const value = slides[i].style.translate;
          return i + (value === '' ? 0 : Number.parseFloat(value) / WIDTH);
        };
        act(() => handleRef.current?.scrollNext());
        // Forward, onto the second slide.
        expect(destination()).toBe(1);
        expect(placeOf(1)).toBe(1);
        expect(placeOf(0)).toBe(0);
      } finally {
        Reflect.deleteProperty(HTMLElement.prototype, 'animate');
      }
    });

    it('with hasLoop and two slides, a page by index has its slide waiting where the track goes', () => {
      const moves: Keyframe[][] = [];
      HTMLElement.prototype.animate = function (keyframes) {
        moves.push(keyframes as Keyframe[]);
        const pending = new Promise(() => {});
        return {
          startTime: null,
          playState: 'running',
          ready: pending,
          cancel() {},
        } as unknown as Animation;
      };
      try {
        const handleRef = createRef<CarouselHandle>();
        render(
          <Carousel aria-label="Pages" hasPaging hasLoop handleRef={handleRef}>
            <div>Page one</div>
            <div>Page two</div>
          </Carousel>,
        );
        const slides = Array.from(getTrack().children) as HTMLElement[];
        const last = () => moves[moves.length - 1];
        const destination = () => {
          const frames = last();
          const frame = frames[frames.length - 1] as {translate?: string};
          return -Number.parseFloat(frame.translate ?? '0') / WIDTH;
        };
        const placeOf = (i: number) => {
          const value = slides[i].style.translate;
          return i + (value === '' ? 0 : Number.parseFloat(value) / WIDTH);
        };
        act(() => handleRef.current?.scrollTo(1));
        // The two copies of page 1 are equally near; the slide waits at
        // whichever the track goes to.
        expect(placeOf(1)).toBe(destination());
      } finally {
        Reflect.deleteProperty(HTMLElement.prototype, 'animate');
      }
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
