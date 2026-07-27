// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {Carousel} from './Carousel';

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
});
