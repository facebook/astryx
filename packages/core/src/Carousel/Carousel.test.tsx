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

    // jsdom has no layout, so fake an overflowing container whose scrollBy
    // moves scrollLeft and fires scroll, which is what drives the overflow
    // state the buttons and the focus hand-off both read. `land` decides where
    // the container comes to rest: the default clamps to the requested delta,
    // and the snap arm overrides it to model mandatory scroll-snap carrying the
    // container past what the press asked for.
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
      }) as HTMLElement['scrollBy'];
      fireEvent.scroll(el);
    }

    it('hands focus to the opposite button when the edge disables the one in use', async () => {
      const user = userEvent.setup();
      render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );
      // clientWidth 200 against a 200px step, so one press lands exactly on the
      // trailing edge and the trailing button disables.
      makeScrollable(getScroller(), 400);

      const next = screen.getByLabelText('Scroll right');
      await user.click(next);

      expect(next).toBeDisabled();
      expect(document.activeElement).toBe(screen.getByLabelText('Scroll left'));
      expect(document.activeElement).not.toBe(document.body);
    });

    it('hands off in the leading direction too', async () => {
      const user = userEvent.setup();
      render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );
      const scroller = getScroller();
      makeScrollable(scroller, 400);
      // Park at the far end so the leading button is the one that runs out.
      scroller.scrollLeft = 200;
      fireEvent.scroll(scroller);

      const previous = screen.getByLabelText('Scroll left');
      await user.click(previous);

      expect(previous).toBeDisabled();
      expect(document.activeElement).toBe(
        screen.getByLabelText('Scroll right'),
      );
    });

    it('hands off under RTL, where the scroll axis is inverted', async () => {
      const user = userEvent.setup();
      render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );
      const scroller = getScroller();
      // The component resolves direction with getComputedStyle, and jsdom does
      // not inherit `dir` down to it, so set it on the element itself. RTL then
      // scrolls negative, which the mock below mirrors.
      scroller.style.direction = 'rtl';
      const maxScroll = 200;
      Object.defineProperty(scroller, 'scrollWidth', {
        value: 400,
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
      scroller.scrollBy = ((options: ScrollToOptions) => {
        scroller.scrollLeft = Math.max(
          -maxScroll,
          Math.min(0, scroller.scrollLeft + (options.left ?? 0)),
        );
        fireEvent.scroll(scroller);
      }) as HTMLElement['scrollBy'];
      fireEvent.scroll(scroller);

      const next = screen.getByLabelText('Scroll right');
      await user.click(next);

      expect(next).toBeDisabled();
      expect(document.activeElement).toBe(screen.getByLabelText('Scroll left'));
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
      // landing position no press can predict.
      makeScrollable(getScroller(), 700, (_requested, maxScroll) => maxScroll);

      const next = screen.getByLabelText('Scroll right');
      await user.click(next);

      expect(next).toBeDisabled();
      expect(document.activeElement).toBe(screen.getByLabelText('Scroll left'));
    });

    it('falls back to the scroll container when the carousel stops overflowing', async () => {
      const user = userEvent.setup();
      render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      const scroller = getScroller();
      // The content shrinks to fit during the press, so BOTH buttons disable
      // and there is no opposite control left to receive focus.
      makeScrollable(scroller, 400, () => {
        Object.defineProperty(scroller, 'scrollWidth', {
          value: 200,
          configurable: true,
        });
        return 0;
      });

      await user.click(screen.getByLabelText('Scroll right'));

      expect(screen.getByLabelText('Scroll right')).toBeDisabled();
      expect(screen.getByLabelText('Scroll left')).toBeDisabled();
      expect(document.activeElement).toBe(scroller);
      expect(document.activeElement).not.toBe(document.body);
    });

    it('does not pull focus back after the person has left the button', () => {
      render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );
      const scroller = getScroller();
      makeScrollable(scroller, 400);

      // Touch an arrow, then leave it without pressing it. Landing on <body> is
      // the case that matters: focus somewhere else is already ignored, so a
      // stale tracker only bites when there is nothing else holding focus.
      const next = screen.getByLabelText('Scroll right');
      next.focus();
      next.blur();
      expect(document.activeElement).toBe(document.body);

      // The carousel reaches the edge on its own: a swipe, a resize, anything
      // that is not this person. Their focus is not the carousel's to take.
      scroller.scrollLeft = 200;
      fireEvent.scroll(scroller);

      expect(screen.getByLabelText('Scroll right')).toBeDisabled();
      expect(document.activeElement).toBe(document.body);
    });

    it('hands off on a press, with the blur handlers in place', async () => {
      const user = userEvent.setup();
      render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );
      makeScrollable(getScroller(), 400);

      // The Effect clears the tracker itself before focusing, so the commit's
      // own blur finds nothing left to clear and the guard is not what makes
      // this pass. It is here so that deleting the blur handlers outright --
      // rather than loosening the guard -- is caught.
      await user.click(screen.getByLabelText('Scroll right'));

      expect(document.activeElement).toBe(screen.getByLabelText('Scroll left'));
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
      makeScrollable(getScroller(), 600);

      const next = screen.getByLabelText('Scroll right');
      await user.click(next);

      expect(next).toBeEnabled();
      expect(document.activeElement).toBe(next);
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

      expect(next).toBeEnabled();
      expect(document.activeElement).toBe(next);
    });

    it('takes focus without scrolling the receiver into view', async () => {
      const user = userEvent.setup();
      render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>,
      );
      makeScrollable(getScroller(), 400);
      const previous = screen.getByLabelText('Scroll left');
      const focus = vi.spyOn(previous, 'focus');

      await user.click(screen.getByLabelText('Scroll right'));

      // A plain focus() scrolls its element into view, which on the scroll
      // container cancels the scroll the same press started.
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

    it('does not move focus a second time for one transition', async () => {
      const user = userEvent.setup();
      const {rerender} = render(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );
      makeScrollable(getScroller(), 400);
      await user.click(screen.getByLabelText('Scroll right'));

      const previous = screen.getByLabelText('Scroll left');
      expect(document.activeElement).toBe(previous);
      // Park focus outside and re-render: the transition is spent, so nothing
      // may pull focus back in.
      const outside = document.createElement('button');
      document.body.appendChild(outside);
      outside.focus();
      rerender(
        <Carousel aria-label="Gallery">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>,
      );

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
