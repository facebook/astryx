// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {createRef} from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Carousel, type CarouselHandle} from './Carousel';

// Mock ResizeObserver (not available in jsdom)
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

describe('Carousel', () => {
  it('renders children', () => {
    render(
      <Carousel aria-label="Test carousel">
        <div data-testid="item-1">Item 1</div>
        <div data-testid="item-2">Item 2</div>
      </Carousel>,
    );
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
  });

  it('has carousel ARIA attributes', () => {
    render(
      <Carousel aria-label="Photos">
        <div>Item</div>
      </Carousel>,
    );
    const region = screen.getByRole('region', {name: 'Photos'});
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('makes the scroll container keyboard-focusable', () => {
    render(
      <Carousel aria-label="Photos">
        <div>Item</div>
      </Carousel>,
    );
    // The inner scroll container overflows, so it must be reachable by
    // keyboard (axe: scrollable-region-focusable).
    const region = screen.getByRole('region', {name: 'Photos'});
    const scroller = region.firstElementChild;
    expect(scroller).toHaveAttribute('tabindex', '0');
  });

  it('applies data-testid', () => {
    render(
      <Carousel data-testid="my-carousel">
        <div>Item</div>
      </Carousel>,
    );
    expect(screen.getByTestId('my-carousel')).toBeInTheDocument();
  });

  it('has correct astryx class name', () => {
    render(
      <Carousel data-testid="cls-test">
        <div>Item</div>
      </Carousel>,
    );
    const el = screen.getByTestId('cls-test');
    expect(el.className).toContain('astryx-carousel');
  });

  it('does not render button layer when hasButtons={false}', () => {
    render(
      <Carousel hasButtons={false} aria-label="No buttons">
        <div>Item 1</div>
        <div>Item 2</div>
      </Carousel>,
    );
    expect(screen.queryByLabelText('Scroll left')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Scroll right')).not.toBeInTheDocument();
  });

  it('renders buttons by default', () => {
    render(
      <Carousel aria-label="With buttons">
        <div>Item 1</div>
        <div>Item 2</div>
      </Carousel>,
    );
    expect(screen.getByLabelText('Scroll left')).toBeInTheDocument();
    expect(screen.getByLabelText('Scroll right')).toBeInTheDocument();
  });

  describe('slide semantics', () => {
    it('exposes each slide as a group with aria-roledescription="slide" and a positional name', () => {
      render(
        <Carousel aria-label="Photos">
          <div>One</div>
          <div>Two</div>
          <div>Three</div>
        </Carousel>,
      );
      // APG carousel pattern: each slide container is role=group with
      // aria-roledescription="slide" and an "N of M" accessible name.
      const slides = screen.getAllByRole('group');
      expect(slides).toHaveLength(3);
      slides.forEach((slide, i) => {
        expect(slide).toHaveAttribute('aria-roledescription', 'slide');
        expect(slide).toHaveAccessibleName(`Slide ${i + 1} of 3`);
      });
    });

    it('reflects the rendered child count, skipping null and boolean children', () => {
      render(
        <Carousel aria-label="Photos">
          <div>One</div>
          {null}
          {false}
          <div>Two</div>
        </Carousel>,
      );
      const slides = screen.getAllByRole('group');
      expect(slides).toHaveLength(2);
      expect(
        screen.getByRole('group', {name: 'Slide 1 of 2'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('group', {name: 'Slide 2 of 2'}),
      ).toBeInTheDocument();
    });

    it('keeps the container region semantics unchanged around labelled slides', () => {
      render(
        <Carousel aria-label="Gallery">
          <div>One</div>
          <div>Two</div>
        </Carousel>,
      );
      const region = screen.getByRole('region', {name: 'Gallery'});
      expect(region).toHaveAttribute('aria-roledescription', 'carousel');
      const slides = screen.getAllByRole('group');
      expect(slides).toHaveLength(2);
      slides.forEach(slide => expect(region).toContainElement(slide));
    });
  });

  it('disables edge scroll buttons instead of removing them from the tab order', () => {
    // In jsdom there is no measurable overflow, so both edges are at rest and
    // the scroll buttons are in their hidden/inert state. They must stay
    // mounted but be disabled — a disabled <button> is skipped by the tab
    // order and hidden from the a11y tree, so keyboard users don't focus an
    // invisible control (WCAG 2.4.7).
    render(
      <Carousel aria-label="Edge state">
        <div>Item 1</div>
        <div>Item 2</div>
      </Carousel>,
    );
    const left = screen.getByLabelText('Scroll left');
    const right = screen.getByLabelText('Scroll right');
    expect(left).toBeInTheDocument();
    expect(right).toBeInTheDocument();
    expect(left).toBeDisabled();
    expect(right).toBeDisabled();
  });

  describe('Shift + wheel horizontal scroll', () => {
    // jsdom doesn't lay out elements, so we fake an overflowing scroll
    // container and capture scrollBy calls.
    function getScroller() {
      const region = screen.getByRole('region');
      return region.firstElementChild as HTMLElement;
    }

    function makeOverflowing(el: HTMLElement) {
      Object.defineProperty(el, 'scrollWidth', {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(el, 'clientWidth', {
        value: 200,
        configurable: true,
      });
    }

    it('maps Shift + vertical wheel to horizontal scroll', () => {
      render(
        <Carousel aria-label="Wheel">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();
      makeOverflowing(scroller);
      const scrollBy = vi.fn();
      scroller.scrollBy = scrollBy;

      fireEvent.wheel(scroller, {shiftKey: true, deltaY: 120, deltaX: 0});

      expect(scrollBy).toHaveBeenCalledWith({left: 120, behavior: 'auto'});
    });

    it('does not translate wheel without Shift held', () => {
      render(
        <Carousel aria-label="Wheel">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();
      makeOverflowing(scroller);
      const scrollBy = vi.fn();
      scroller.scrollBy = scrollBy;

      fireEvent.wheel(scroller, {shiftKey: false, deltaY: 120, deltaX: 0});

      expect(scrollBy).not.toHaveBeenCalled();
    });

    it('leaves native horizontal wheel deltas alone', () => {
      // Trackpads emit deltaX directly — don't double-handle those.
      render(
        <Carousel aria-label="Wheel">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();
      makeOverflowing(scroller);
      const scrollBy = vi.fn();
      scroller.scrollBy = scrollBy;

      fireEvent.wheel(scroller, {shiftKey: true, deltaY: 120, deltaX: 40});

      expect(scrollBy).not.toHaveBeenCalled();
    });

    it('does not intercept when there is no horizontal overflow', () => {
      render(
        <Carousel aria-label="Wheel">
          <div>Item 1</div>
        </Carousel>,
      );
      const scroller = getScroller();
      Object.defineProperty(scroller, 'scrollWidth', {
        value: 200,
        configurable: true,
      });
      Object.defineProperty(scroller, 'clientWidth', {
        value: 200,
        configurable: true,
      });
      const scrollBy = vi.fn();
      scroller.scrollBy = scrollBy;

      fireEvent.wheel(scroller, {shiftKey: true, deltaY: 120, deltaX: 0});

      expect(scrollBy).not.toHaveBeenCalled();
    });
  });

  describe('hasLoop', () => {
    // jsdom doesn't lay out elements, so we fake an overflowing scroll
    // container, force it to rest at an edge, and capture scrollBy calls.
    function getScroller() {
      const region = screen.getByRole('region');
      return region.firstElementChild as HTMLElement;
    }

    function makeOverflowing(el: HTMLElement, scrollLeft: number) {
      Object.defineProperty(el, 'scrollWidth', {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(el, 'clientWidth', {
        value: 200,
        configurable: true,
      });
      Object.defineProperty(el, 'scrollLeft', {
        value: scrollLeft,
        writable: true,
        configurable: true,
      });
      // Drive the overflow hook's scroll listener so overflowStart/End settle.
      fireEvent.scroll(el);
    }

    it('keeps both navigation buttons enabled at the edges when looping', () => {
      render(
        <Carousel hasLoop aria-label="Looping">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();
      // At the start edge: without loop the left button would be disabled.
      makeOverflowing(scroller, 0);

      expect(screen.getByLabelText('Scroll left')).toBeEnabled();
      expect(screen.getByLabelText('Scroll right')).toBeEnabled();
    });

    it('wraps to the start when pressing next at the end', () => {
      render(
        <Carousel hasLoop aria-label="Looping">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();
      // At the end edge (scrolled fully right): overflowEnd is false.
      makeOverflowing(scroller, 300);
      const scrollBy = vi.fn();
      scroller.scrollBy = scrollBy;

      fireEvent.click(screen.getByLabelText('Scroll right'));

      // Overshoots toward the start by the full scroll width; the browser
      // clamps to scrollLeft 0.
      expect(scrollBy).toHaveBeenCalledWith({
        left: -500,
        behavior: 'smooth',
      });
    });

    it('wraps to the end when pressing prev at the start', () => {
      render(
        <Carousel hasLoop aria-label="Looping">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();
      makeOverflowing(scroller, 0);
      const scrollBy = vi.fn();
      scroller.scrollBy = scrollBy;

      fireEvent.click(screen.getByLabelText('Scroll left'));

      // Overshoots toward the end by the full scroll width.
      expect(scrollBy).toHaveBeenCalledWith({
        left: 500,
        behavior: 'smooth',
      });
    });

    it('does not wrap when content fits without overflowing', () => {
      render(
        <Carousel hasLoop aria-label="Looping">
          <div>Only item</div>
        </Carousel>,
      );
      const scroller = getScroller();
      Object.defineProperty(scroller, 'scrollWidth', {
        value: 200,
        configurable: true,
      });
      Object.defineProperty(scroller, 'clientWidth', {
        value: 200,
        configurable: true,
      });
      Object.defineProperty(scroller, 'scrollLeft', {
        value: 0,
        writable: true,
        configurable: true,
      });
      fireEvent.scroll(scroller);
      const scrollBy = vi.fn();
      scroller.scrollBy = scrollBy;

      // Buttons are hidden/disabled with no overflow; invoking scroll is a
      // no-op wrap-wise — a normal (non-wrap) scrollBy still runs, but there
      // is nothing to wrap to, so the overshoot branch must not fire.
      fireEvent.click(screen.getByLabelText('Scroll right'));

      // Either not called (button disabled) or called with a normal delta —
      // never the full-scrollWidth overshoot.
      if (scrollBy.mock.calls.length > 0) {
        expect(scrollBy).not.toHaveBeenCalledWith(
          expect.objectContaining({left: 500}),
        );
        expect(scrollBy).not.toHaveBeenCalledWith(
          expect.objectContaining({left: -500}),
        );
      }
    });
  });

  describe('handleRef', () => {
    function getScroller() {
      const region = screen.getByRole('region');
      return region.firstElementChild as HTMLElement;
    }

    function makeOverflowing(el: HTMLElement, scrollLeft: number) {
      Object.defineProperty(el, 'scrollWidth', {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(el, 'clientWidth', {
        value: 200,
        configurable: true,
      });
      Object.defineProperty(el, 'scrollLeft', {
        value: scrollLeft,
        writable: true,
        configurable: true,
      });
      fireEvent.scroll(el);
    }

    it('exposes scrollNext/scrollPrev that drive the scroll container', () => {
      const handle = createRef<CarouselHandle>();
      render(
        <Carousel handleRef={handle} aria-label="Handle">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();
      makeOverflowing(scroller, 100);
      const scrollBy = vi.fn();
      scroller.scrollBy = scrollBy;

      handle.current?.scrollNext();
      expect(scrollBy).toHaveBeenCalledTimes(1);
      expect(scrollBy.mock.calls[0][0].left).toBeGreaterThan(0);

      handle.current?.scrollPrev();
      expect(scrollBy).toHaveBeenCalledTimes(2);
      expect(scrollBy.mock.calls[1][0].left).toBeLessThan(0);
    });

    it('reports canScrollNext/canScrollPrev from live overflow state', () => {
      const handle = createRef<CarouselHandle>();
      render(
        <Carousel handleRef={handle} aria-label="Handle">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();

      // At the start: can scroll toward the end, not the start.
      makeOverflowing(scroller, 0);
      expect(handle.current?.canScrollPrev()).toBe(false);
      expect(handle.current?.canScrollNext()).toBe(true);

      // Scroll into the middle: both directions available.
      makeOverflowing(scroller, 150);
      expect(handle.current?.canScrollPrev()).toBe(true);
      expect(handle.current?.canScrollNext()).toBe(true);
    });

    it('reports both directions scrollable under hasLoop when overflowing', () => {
      const handle = createRef<CarouselHandle>();
      render(
        <Carousel handleRef={handle} hasLoop aria-label="Handle">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();
      // Rest at the start edge — normally canScrollPrev would be false.
      makeOverflowing(scroller, 0);

      expect(handle.current?.canScrollPrev()).toBe(true);
      expect(handle.current?.canScrollNext()).toBe(true);
    });

    it('scrollTo scrolls the container and clamps out-of-range indices', () => {
      const handle = createRef<CarouselHandle>();
      render(
        <Carousel handleRef={handle} aria-label="Handle">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );
      const scroller = getScroller();
      const scrollBy = vi.fn();
      scroller.scrollBy = scrollBy;

      // Out-of-range index is clamped to the last item — no throw, one call.
      expect(() => handle.current?.scrollTo(99)).not.toThrow();
      expect(scrollBy).toHaveBeenCalledTimes(1);
      // Uses scrollBy (contained to the carousel), never scrollIntoView.
      expect(scrollBy.mock.calls[0][0]).toHaveProperty('left');
    });
  });

  describe('keyboard focus at the edges', () => {
    function getScroller() {
      const region = screen.getByRole('region');
      return region.firstElementChild as HTMLElement;
    }

    // jsdom doesn't lay out elements, so fake an overflowing scroll container
    // whose scrollLeft actually moves when scrollBy is called. The component
    // predicts the edge from these numbers, which is what the hand-off uses.
    // jsdom has no layout and no scrollend, so fake an overflowing container
    // whose scrollBy moves scrollLeft and then settles, the way a browser does.
    // `land` decides where the container comes to rest: the default clamps to
    // the requested delta, and the snap arm overrides it to model mandatory
    // scroll-snap carrying the container past what the press asked for.
    function makeScrollable(
      el: HTMLElement,
      scrollWidth: number,
      land?: (requested: number, maxScroll: number) => number,
    ) {
      const clientWidth = 200;
      const maxScroll = scrollWidth - clientWidth;
      Object.defineProperty(el, 'scrollWidth', {
        value: scrollWidth,
        configurable: true,
      });
      Object.defineProperty(el, 'clientWidth', {
        value: clientWidth,
        configurable: true,
      });
      Object.defineProperty(el, 'scrollLeft', {
        value: 0,
        writable: true,
        configurable: true,
      });
      el.scrollBy = ((options: ScrollToOptions) => {
        const requested = Math.max(
          0,
          Math.min(maxScroll, el.scrollLeft + (options.left ?? 0)),
        );
        el.scrollLeft = land ? land(requested, maxScroll) : requested;
        fireEvent.scroll(el);
        el.dispatchEvent(new Event('scrollend'));
      }) as HTMLElement['scrollBy'];
      fireEvent.scroll(el);
    }

    it('keeps focus inside the carousel when a press disables the pressed button', async () => {
      const user = userEvent.setup();
      render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );
      // clientWidth 200 and a 200px step, so one press lands exactly on the
      // trailing edge and the trailing button disables.
      makeScrollable(getScroller(), 400);

      const next = screen.getByLabelText('Scroll right');
      await user.click(next);

      // The press ran the content to the end, so `next` is now disabled. It
      // must not be left holding focus, and focus must not fall to <body>.
      expect(next).toBeDisabled();
      expect(document.activeElement).toBe(getScroller());
      expect(document.activeElement).not.toBe(document.body);
    });

    it('does not move focus on a press that leaves the direction available', async () => {
      const user = userEvent.setup();
      render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );
      // 600 gives 400 of travel against a 200 step, so the press lands mid-run
      // with the trailing edge still two steps away. Tight on purpose: a loose
      // fixture hides a prediction that counts the step twice.
      makeScrollable(getScroller(), 600);

      const next = screen.getByLabelText('Scroll right');
      await user.click(next);

      expect(next).toBeEnabled();
      expect(document.activeElement).toBe(next);
    });

    it('hands off when scroll-snap carries the container past what the press asked for', async () => {
      const user = userEvent.setup();
      render(
        <Carousel hasSnap aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );
      // 700 gives 500 of travel against a 200 step, so the press alone lands
      // mid-run. Mandatory snapping then carries it to the end, which is the
      // case a press cannot predict.
      makeScrollable(getScroller(), 700, (_requested, maxScroll) => maxScroll);

      const next = screen.getByLabelText('Scroll right');
      await user.click(next);

      expect(next).toBeDisabled();
      expect(document.activeElement).toBe(getScroller());
      expect(document.activeElement).not.toBe(document.body);
    });

    it('does not move focus when hasLoop keeps both buttons enabled', async () => {
      const user = userEvent.setup();
      render(
        <Carousel hasLoop aria-label="Looping">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      makeScrollable(getScroller(), 400);

      const next = screen.getByLabelText('Scroll right');
      await user.click(next);

      // Looping never disables a button, so there is nothing to rescue from.
      expect(next).toBeEnabled();
      expect(document.activeElement).toBe(next);
    });

    it('takes focus without scrolling the container into view', async () => {
      const user = userEvent.setup();
      render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();
      makeScrollable(scroller, 400);
      const focus = vi.spyOn(scroller, 'focus');

      await user.click(screen.getByLabelText('Scroll right'));

      // A plain focus() scrolls the element into view, which cancels the smooth
      // scroll the same press just started.
      expect(focus).toHaveBeenCalledWith({preventScroll: true});
    });

    it('leaves focus alone when the imperative handle drives the scroll', () => {
      const handle = createRef<CarouselHandle>();
      render(
        <Carousel handleRef={handle} aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      makeScrollable(getScroller(), 400);
      const outside = document.createElement('button');
      document.body.appendChild(outside);
      outside.focus();

      handle.current?.scrollNext();

      expect(document.activeElement).toBe(outside);
      outside.remove();
    });

    it('reflects the scroll container as a theme target carrying its style-driving props', () => {
      render(
        <Carousel gap={2} padding={3} hasSnap aria-label="Gallery">
          <div>Item 1</div>
        </Carousel>,
      );
      const scroller = getScroller();
      expect(scroller).toHaveClass('astryx-carousel-scroller');
      expect(scroller).toHaveAttribute('data-gap', '2');
      expect(scroller).toHaveAttribute('data-padding', '3');
      expect(scroller).toHaveAttribute('data-snap', 'snap');
      expect(scroller).toHaveAttribute('data-edge-fade', 'edge-fade');
    });

    it('omits the opt-out attributes a theme should not see', () => {
      render(
        <Carousel hasEdgeFade={false} aria-label="Gallery">
          <div>Item 1</div>
        </Carousel>,
      );
      const scroller = getScroller();
      expect(scroller).not.toHaveAttribute('data-edge-fade');
      expect(scroller).not.toHaveAttribute('data-snap');
      expect(scroller).not.toHaveAttribute('data-padding');
    });
  });
});
