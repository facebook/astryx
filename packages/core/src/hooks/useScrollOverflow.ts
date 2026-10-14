// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollOverflow.ts
 * @input Uses React useRef, useState, useCallback, useEffect
 * @output Exports useScrollOverflow hook for tracking scroll position edges
 * @position Core hook; used by Carousel and TabList for fade-edge and button
 *   state
 *
 * Observes a scroll container and reports whether content overflows at the
 * start, end, or both edges. Updates on scroll and resize, while the container
 * is rendered: a layout read on an element the browser is not rendering (an
 * ancestor with `display: none`, or a `content-visibility: hidden` subtree)
 * either answers zeros or makes the browser lay out that whole hidden subtree
 * for the answer, so the hook keeps its last state until the resize that
 * follows the reveal.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {useState, useCallback, useEffect, useRef} from 'react';
import {observeResize} from '../utils/sharedResizeObserver';

export interface ScrollOverflowState {
  /** Content overflows the start (left in LTR, right in RTL) */
  overflowStart: boolean;
  /** Content overflows the end (right in LTR, left in RTL) */
  overflowEnd: boolean;
  /** Whether the container has any overflow at all */
  hasOverflow: boolean;
}

/**
 * Whether the browser is rendering `el`, so a layout read on it answers for a
 * real box. `checkVisibility` is false under a `display: none` ancestor and
 * inside a `content-visibility: hidden` subtree (or a skipped
 * `content-visibility: auto` one, with the option), and it answers without
 * rendering that subtree. A browser without it measures as before.
 */
function isRendered(el: HTMLElement): boolean {
  return (
    typeof el.checkVisibility !== 'function' ||
    el.checkVisibility({contentVisibilityAuto: true})
  );
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
  const unobserveRef = useRef<(() => void) | null>(null);

  const [state, setState] = useState<ScrollOverflowState>({
    overflowStart: false,
    overflowEnd: false,
    hasOverflow: false,
  });

  const measure = useCallback(() => {
    const el = elRef.current;
    // A container the browser is not rendering has no edges to report, and
    // reading its layout would make the browser render the hidden subtree it
    // sits in. The resize observation that follows the reveal measures again.
    if (!el || !isRendered(el)) {
      return;
    }

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
        unobserveRef.current?.();
        unobserveRef.current = null;
        elRef.current.removeEventListener('scroll', measure);
      }

      elRef.current = el;

      if (el) {
        el.addEventListener('scroll', measure, {passive: true});
        unobserveRef.current = observeResize(el, measure);
      }
    },
    [measure],
  );

  useEffect(() => {
    return () => {
      if (elRef.current) {
        unobserveRef.current?.();
        unobserveRef.current = null;
        elRef.current.removeEventListener('scroll', measure);
      }
    };
  }, [measure]);

  return {
    scrollRef,
    ...state,
  };
}
