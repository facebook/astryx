'use client';

/**
 * @file useOverflow.ts
 * @input Uses React useState, useLayoutEffect, useCallback, useRef
 * @output Exports useOverflow hook for measuring and managing horizontal overflow
 * @position Core hook; used by XDSOverflowList and consumers for overflow patterns
 *
 * Measures children rendered in a hidden container to determine how many fit
 * in the available width, without flickering. Uses ResizeObserver to react
 * to container size changes.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */


import {useState, useLayoutEffect, useCallback, useRef} from 'react';

export interface UseOverflowOptions {
  /**
   * Gap between items in pixels. Used in width calculations.
   * @default 0
   */
  gap?: number;

  /**
   * Minimum number of items to always show, even if they don't fit.
   * @default 0
   */
  minVisibleItems?: number;

  /**
   * Which end to collapse items from.
   * @default 'end'
   */
  collapseFrom?: 'start' | 'end';

  /**
   * Which element to observe for overflow calculations.
   * - `'observeSelf'`: uses the container's own width (default)
   * - `'observeParent'`: observes the container's parent element for
   *   resize and uses the parent's content width. This allows the
   *   visible container to remain content-sized while still detecting
   *   available space for grow-back. Siblings that don't fit alongside
   *   the items can wrap and be clipped by the parent's overflow.
   * @default 'observeSelf'
   */
  behavior?: 'observeParent' | 'observeSelf';
}

export interface UseOverflowReturn {
  /** Ref to attach to the visible container element */
  containerRef: React.RefCallback<HTMLElement>;
  /** Ref to attach to the hidden measurement container */
  measureRef: React.RefCallback<HTMLElement>;
  /** Number of items that fit in the visible container */
  visibleCount: number;
  /** Whether any items are overflowing */
  hasOverflow: boolean;
}

/**
 * Hook for managing horizontal overflow of a list of items.
 *
 * Renders all items into a hidden measurement container, then calculates
 * how many fit in the visible container's width. Uses ResizeObserver to
 * recalculate when the container resizes.
 *
 * The measurement container should contain all items followed by the
 * overflow indicator element (if any). The indicator is identified by
 * a `data-overflow-indicator` attribute.
 *
 * @example
 * ```
 * const { containerRef, measureRef, visibleCount, hasOverflow } = useOverflow(5, {
 *   gap: 8,
 * });
 * ```
 */
export function useOverflow(
  itemCount: number,
  options: UseOverflowOptions = {},
): UseOverflowReturn {
  const {
    gap = 0,
    minVisibleItems = 0,
    collapseFrom = 'end',
    behavior = 'observeSelf',
  } = options;

  const observeParent = behavior === 'observeParent';

  const [visibleCount, setVisibleCount] = useState(itemCount);
  const containerElRef = useRef<HTMLElement | null>(null);
  const measureElRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const calculate = useCallback(() => {
    const container = containerElRef.current;
    const measure = measureElRef.current;
    if (!container || !measure) return;

    let availableWidth: number;

    if (observeParent && container.parentElement) {
      const parent = container.parentElement;
      const parentStyle = getComputedStyle(parent);
      availableWidth =
        parent.clientWidth -
        parseFloat(parentStyle.paddingLeft) -
        parseFloat(parentStyle.paddingRight);
    } else {
      availableWidth = container.offsetWidth;
    }

    const allChildren = Array.from(measure.children) as HTMLElement[];

    // The measurement container holds itemCount items, plus optionally
    // an overflow indicator as the last child.
    const hasIndicator = allChildren.length > itemCount;
    const children = hasIndicator
      ? allChildren.slice(0, itemCount)
      : allChildren;
    const indicatorWidth = hasIndicator
      ? allChildren[allChildren.length - 1].offsetWidth
      : 0;

    if (children.length === 0) {
      setVisibleCount(0);
      return;
    }

    // Collect widths of all children
    const widths = children.map(child => child.offsetWidth);

    // Determine how many items fit
    let totalWidth = 0;
    let count = 0;

    const orderedWidths =
      collapseFrom === 'end' ? widths : [...widths].reverse();

    for (let i = 0; i < orderedWidths.length; i++) {
      const itemWidth = orderedWidths[i];
      const gapWidth = i > 0 ? gap : 0;
      const candidateWidth = totalWidth + itemWidth + gapWidth;

      // If this isn't the last item, we need to reserve space for the indicator
      const isLastItem = i === orderedWidths.length - 1;
      const reservedWidth = isLastItem
        ? 0
        : indicatorWidth + (count > 0 || indicatorWidth > 0 ? gap : 0);

      if (
        candidateWidth + reservedWidth > availableWidth &&
        count >= minVisibleItems
      ) {
        break;
      }

      totalWidth = candidateWidth;
      count++;
    }

    setVisibleCount(Math.max(Math.min(count, itemCount), minVisibleItems));
  }, [itemCount, gap, minVisibleItems, collapseFrom, observeParent]);

  const containerRef = useCallback(
    (el: HTMLElement | null) => {
      containerElRef.current = el;

      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (el) {
        const ro = new ResizeObserver(() => {
          calculate();
        });
        const target =
          observeParent && el.parentElement ? el.parentElement : el;
        ro.observe(target);
        observerRef.current = ro;
      }
    },
    [calculate, observeParent],
  );

  const measureRef = useCallback(
    (el: HTMLElement | null) => {
      measureElRef.current = el;
      if (el) {
        calculate();
      }
    },
    [calculate],
  );

  // Recalculate when itemCount changes
  useLayoutEffect(() => {
    calculate();
  }, [calculate]);

  const hasOverflow = visibleCount < itemCount;

  return {
    containerRef,
    measureRef,
    visibleCount,
    hasOverflow,
  };
}
