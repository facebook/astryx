'use client';

/**
 * @file useScrollOverflow.ts
 * @input Uses React useRef, useState, useCallback, useEffect
 * @output Exports useScrollOverflow hook for tracking scroll position edges
 * @position Core hook; used by XDSCarousel for fade-edge and button state
 *
 * Observes a scroll container and reports whether content overflows at the
 * start, end, or both edges. Updates on scroll and resize.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {useState, useCallback, useEffect, useRef} from 'react';
import {observeResize, unobserveResize} from '../utils/sharedResizeObserver';

export interface ScrollOverflowState {
  /** Content overflows the start (left in LTR, right in RTL) */
  overflowStart: boolean;
  /** Content overflows the end (right in LTR, left in RTL) */
  overflowEnd: boolean;
  /** Whether the container has any overflow at all */
  hasOverflow: boolean;
}

/**
 * Tracks scroll overflow state for a horizontally scrollable container.
 *
 * Returns a ref callback to attach to the scroll container and a state
 * object that updates as the user scrolls or the container resizes.
 *
 * @example
 * ```
 * const { scrollRef, overflowStart, overflowEnd } = useScrollOverflow();
 * <div ref={scrollRef} style={{ overflowX: 'auto' }}>...</div>
 * ```
 */
export function useScrollOverflow() {
  const elRef = useRef<HTMLElement | null>(null);

  const [state, setState] = useState<ScrollOverflowState>({
    overflowStart: false,
    overflowEnd: false,
    hasOverflow: false,
  });

  const measure = useCallback(() => {
    const el = elRef.current;
    if (!el) return;

    const tolerance = 1;
    const {scrollLeft, scrollWidth, clientWidth} = el;
    const maxScroll = scrollWidth - clientWidth;

    const overflowStart = Math.abs(scrollLeft) > tolerance;
    const overflowEnd = Math.abs(scrollLeft) < maxScroll - tolerance;
    const hasOverflow = scrollWidth > clientWidth + tolerance;

    setState(prev => {
      if (
        prev.overflowStart === overflowStart &&
        prev.overflowEnd === overflowEnd &&
        prev.hasOverflow === hasOverflow
      ) {
        return prev;
      }
      return {overflowStart, overflowEnd, hasOverflow};
    });
  }, []);

  const scrollRef = useCallback(
    (el: HTMLElement | null) => {
      if (elRef.current) {
        unobserveResize(elRef.current);
        elRef.current.removeEventListener('scroll', measure);
      }

      elRef.current = el;

      if (el) {
        el.addEventListener('scroll', measure, {passive: true});
        observeResize(el, measure);
      }
    },
    [measure],
  );

  useEffect(() => {
    return () => {
      if (elRef.current) {
        unobserveResize(elRef.current);
        elRef.current.removeEventListener('scroll', measure);
      }
    };
  }, [measure]);

  return {
    scrollRef,
    ...state,
  };
}
