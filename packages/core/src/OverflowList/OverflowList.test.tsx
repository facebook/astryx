// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file OverflowList.test.tsx
 * @input Uses vitest, @testing-library/react, OverflowList component
 * @output Characterization coverage for OverflowList's fit/overflow behavior
 * @position Testing; validates OverflowList.tsx
 *
 * jsdom reports every element as 0px wide and lacks ResizeObserver, so these
 * tests install a minimal ResizeObserver stub and drive layout math through a
 * `data-w` attribute read by a mocked `offsetWidth`. Each item declares its
 * pixel width via `data-w`; the visible container's available width is the
 * `data-w` passed straight through to it. This lets the real fit algorithm run
 * deterministically instead of collapsing to the trivial all-fit case.
 *
 * SYNC: When OverflowList.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, beforeAll, afterAll, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import {OverflowList} from './OverflowList';

const originalOffsetWidth = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'offsetWidth',
);
const originalResizeObserver = (
  globalThis as unknown as {ResizeObserver?: unknown}
).ResizeObserver;

/** No-op ResizeObserver — the shared observer fires its initial callback
 * synchronously on observe(), so the algorithm still measures on mount. */
class StubResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeAll(() => {
  (globalThis as unknown as {ResizeObserver: unknown}).ResizeObserver =
    StubResizeObserver;
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLElement): number {
      const own = this.getAttribute('data-w');
      if (own != null) {
        return Number(own);
      }
      // The overflow indicator is wrapped in a measurement <div>; read the
      // width off its child so the reserved indicator space is measurable.
      const child = this.firstElementChild;
      if (child) {
        return Number(child.getAttribute('data-w') ?? 0);
      }
      return 0;
    },
  });
});

afterAll(() => {
  if (originalOffsetWidth) {
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetWidth',
      originalOffsetWidth,
    );
  }
  (globalThis as unknown as {ResizeObserver?: unknown}).ResizeObserver =
    originalResizeObserver;
});

/** The visible (non-measurement) container, identified by its stable class. */
function visibleContainer(): HTMLElement {
  return screen.getByTestId('ov');
}

/** The hidden measurement container (the only inert element rendered). */
function measureContainer(): HTMLElement {
  return document.querySelector('[inert]') as HTMLElement;
}

const indicator =
  (label: string, width = 40) =>
  (items: {index: number}[]) => (
    <span data-w={width}>
      {label}
      {items.map(i => i.index).join(',')}
    </span>
  );

describe('OverflowList', () => {
  describe('when all items fit', () => {
    it('renders every item and no overflow indicator', () => {
      render(
        <OverflowList
          gap={0}
          data-w="1000"
          data-testid="ov"
          overflowRenderer={indicator('more:')}>
          <button type="button" data-w="40">
            A
          </button>
          <button type="button" data-w="40">
            B
          </button>
          <button type="button" data-w="40">
            C
          </button>
        </OverflowList>,
      );
      const vis = visibleContainer();
      expect(within(vis).getByText('A')).toBeInTheDocument();
      expect(within(vis).getByText('B')).toBeInTheDocument();
      expect(within(vis).getByText('C')).toBeInTheDocument();
      // No overflow indicator when nothing is hidden.
      expect(within(vis).queryByText(/^more:/)).not.toBeInTheDocument();
    });
  });

  describe('when items overflow (collapseFrom="end", default)', () => {
    it('hides trailing items and shows an indicator for them', () => {
      render(
        <OverflowList
          gap={0}
          data-w="100"
          data-testid="ov"
          overflowRenderer={indicator('more:')}>
          <button type="button" data-w="40">
            A
          </button>
          <button type="button" data-w="40">
            B
          </button>
          <button type="button" data-w="40">
            C
          </button>
        </OverflowList>,
      );
      const vis = visibleContainer();
      // 100px fits one 40px item once 40px is reserved for the indicator.
      expect(within(vis).getByText('A')).toBeInTheDocument();
      expect(within(vis).queryByText('B')).not.toBeInTheDocument();
      expect(within(vis).queryByText('C')).not.toBeInTheDocument();
      // Indicator lists the hidden items by their original index (1 and 2).
      expect(within(vis).getByText('more:1,2')).toBeInTheDocument();
    });

    it('fits more items as the available width grows', () => {
      render(
        <OverflowList
          gap={0}
          data-w="110"
          data-testid="ov"
          overflowRenderer={indicator('more:', 20)}>
          <button type="button" data-w="40">
            A
          </button>
          <button type="button" data-w="40">
            B
          </button>
          <button type="button" data-w="40">
            C
          </button>
        </OverflowList>,
      );
      const vis = visibleContainer();
      // 110px fits two 40px items plus the 20px indicator reservation (100px),
      // but not a third (120px) — so C collapses.
      expect(within(vis).getByText('A')).toBeInTheDocument();
      expect(within(vis).getByText('B')).toBeInTheDocument();
      expect(within(vis).queryByText('C')).not.toBeInTheDocument();
      expect(within(vis).getByText('more:2')).toBeInTheDocument();
    });

    it('places the indicator after the visible items', () => {
      render(
        <OverflowList
          gap={0}
          data-w="100"
          data-testid="ov"
          overflowRenderer={indicator('more:')}>
          <button type="button" data-w="40">
            A
          </button>
          <button type="button" data-w="40">
            B
          </button>
          <button type="button" data-w="40">
            C
          </button>
        </OverflowList>,
      );
      const vis = visibleContainer();
      expect(vis.textContent).toBe('Amore:1,2');
    });
  });

  describe('when items overflow (collapseFrom="start")', () => {
    it('hides leading items and renders the indicator first', () => {
      render(
        <OverflowList
          gap={0}
          collapseFrom="start"
          data-w="100"
          data-testid="ov"
          overflowRenderer={indicator('more:')}>
          <button type="button" data-w="40">
            A
          </button>
          <button type="button" data-w="40">
            B
          </button>
          <button type="button" data-w="40">
            C
          </button>
        </OverflowList>,
      );
      const vis = visibleContainer();
      // The trailing item stays; the leading two collapse.
      expect(within(vis).getByText('C')).toBeInTheDocument();
      expect(within(vis).queryByText('A')).not.toBeInTheDocument();
      expect(within(vis).queryByText('B')).not.toBeInTheDocument();
      // Indicator carries the hidden indices 0 and 1, and comes first.
      expect(within(vis).getByText('more:0,1')).toBeInTheDocument();
      expect(vis.textContent).toBe('more:0,1C');
    });
  });

  describe('minVisibleItems', () => {
    it('keeps at least the requested number of items visible', () => {
      render(
        <OverflowList
          gap={0}
          minVisibleItems={2}
          data-w="100"
          data-testid="ov"
          overflowRenderer={indicator('more:')}>
          <button type="button" data-w="40">
            A
          </button>
          <button type="button" data-w="40">
            B
          </button>
          <button type="button" data-w="40">
            C
          </button>
        </OverflowList>,
      );
      const vis = visibleContainer();
      // Without the floor only one item would fit; the floor forces two.
      expect(within(vis).getByText('A')).toBeInTheDocument();
      expect(within(vis).getByText('B')).toBeInTheDocument();
      expect(within(vis).queryByText('C')).not.toBeInTheDocument();
      expect(within(vis).getByText('more:2')).toBeInTheDocument();
    });
  });

  describe('without an overflow renderer', () => {
    it('drops overflowing items but renders no indicator', () => {
      render(
        <OverflowList gap={0} data-w="100" data-testid="ov">
          <button type="button" data-w="40">
            A
          </button>
          <button type="button" data-w="40">
            B
          </button>
          <button type="button" data-w="40">
            C
          </button>
        </OverflowList>,
      );
      const vis = visibleContainer();
      // With no indicator to reserve space for, two 40px items fit in 100px.
      expect(within(vis).getByText('A')).toBeInTheDocument();
      expect(within(vis).getByText('B')).toBeInTheDocument();
      expect(within(vis).queryByText('C')).not.toBeInTheDocument();
    });
  });

  describe('measurement container', () => {
    it('renders a hidden, inert measurement copy of all children', () => {
      render(
        <OverflowList
          gap={0}
          data-w="100"
          data-testid="ov"
          overflowRenderer={indicator('more:')}>
          <button type="button" data-w="40">
            A
          </button>
          <button type="button" data-w="40">
            B
          </button>
          <button type="button" data-w="40">
            C
          </button>
        </OverflowList>,
      );
      const measure = measureContainer();
      expect(measure).toHaveAttribute('aria-hidden', 'true');
      expect(measure).toHaveAttribute('inert');
      // Measures against every item, even the ones hidden from the visible row.
      expect(within(measure).getByText('A')).toBeInTheDocument();
      expect(within(measure).getByText('B')).toBeInTheDocument();
      expect(within(measure).getByText('C')).toBeInTheDocument();
    });

    it('measures the indicator against all items (max width)', () => {
      render(
        <OverflowList
          gap={0}
          data-w="100"
          data-testid="ov"
          overflowRenderer={indicator('more:')}>
          <button type="button" data-w="40">
            A
          </button>
          <button type="button" data-w="40">
            B
          </button>
          <button type="button" data-w="40">
            C
          </button>
        </OverflowList>,
      );
      // The measurement indicator reflects every index (0,1,2), reserving the
      // widest possible indicator; the visible one only lists hidden indices.
      const measure = measureContainer();
      expect(within(measure).getByText('more:0,1,2')).toBeInTheDocument();
    });
  });

  describe('rendering contract', () => {
    it('renders the stable astryx-overflow-list class on the visible container', () => {
      render(
        <OverflowList data-w="1000" data-testid="ov">
          <button type="button" data-w="10">
            A
          </button>
        </OverflowList>,
      );
      expect(visibleContainer()).toHaveClass('astryx-overflow-list');
    });

    it('forwards a ref to the visible container', () => {
      const ref = vi.fn();
      render(
        <OverflowList ref={ref} data-w="1000" data-testid="ov">
          <button type="button" data-w="10">
            A
          </button>
        </OverflowList>,
      );
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
      const el = ref.mock.calls[0][0] as HTMLElement;
      expect(el).toHaveClass('astryx-overflow-list');
    });

    it('applies a different gap class as the gap prop changes', () => {
      const {rerender} = render(
        <OverflowList gap={0} data-w="1000" data-testid="ov">
          <button type="button" data-w="10">
            A
          </button>
        </OverflowList>,
      );
      const gap0 = visibleContainer().getAttribute('class');

      rerender(
        <OverflowList gap={4} data-w="1000" data-testid="ov">
          <button type="button" data-w="10">
            A
          </button>
        </OverflowList>,
      );
      const gap4 = visibleContainer().getAttribute('class');
      expect(gap4).not.toEqual(gap0);
    });

    it('renders nothing extra for an empty child list', () => {
      render(
        <OverflowList
          data-w="1000"
          data-testid="ov"
          overflowRenderer={indicator('more:')}>
          {null}
        </OverflowList>,
      );
      const vis = visibleContainer();
      expect(vis).toBeInTheDocument();
      expect(vis).toBeEmptyDOMElement();
    });

    it('passes arbitrary DOM props through to the visible container', () => {
      render(
        <OverflowList
          data-w="1000"
          data-testid="ov"
          aria-label="Toolbar actions">
          <button type="button" data-w="10">
            A
          </button>
        </OverflowList>,
      );
      expect(visibleContainer()).toHaveAttribute(
        'aria-label',
        'Toolbar actions',
      );
    });

    it('exposes a displayName for devtools', () => {
      expect(OverflowList.displayName).toBe('OverflowList');
    });
  });
});
