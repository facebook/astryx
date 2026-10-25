// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useCarouselPaging.ts
 * @input The carousel's scroller (the pager's viewport) and track elements,
 *   the slide count, whether it loops and whether the touch presentation is
 *   active; the shared pager
 * @output Exports `useCarouselPaging`: Carousel's paging touch presentation
 *   (the page on screen, page moves for the buttons, the handle and the
 *   keyboard, focus following, slide placement for looping)
 * @position Internal to Carousel (`hasPaging`)
 *
 * On a touch screen a paging carousel is a UIKit paging scroll view: the
 * shared pager moves its track (hooks/usePager.ts). The pager attaches only
 * while the touch presentation is active; otherwise the carousel scrolls
 * natively with one snap point per page.
 *
 * Looping places each slide at the copy of its index nearest the page on
 * screen (one `translate` per slide, written when a drag begins, before a
 * button or key moves the track, and at rest), so the next page is always
 * the next slide, forward or back. The current page and its neighbours get
 * their own layers so they are painted before they move in (in Mobile
 * Safari a busy main thread cannot paint them while the track moves).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Carousel/Carousel.tsx
 * - /packages/core/src/Carousel/Carousel.test.tsx
 */

import {useRef, useState, useSyncExternalStore, type RefObject} from 'react';
import {createPager, nearestLoopCopy, type Pager} from '../hooks/usePager';
import {isRtlElement} from '../hooks/isRtlElement';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';

export interface CarouselPagingOptions {
  /** The pager runs (paging carousel, touch presentation). */
  isEnabled: boolean;
  scrollElRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLElement | null>;
  count: number;
  loop: boolean;
  /** The carousel's `gap` prop: when it changes, the pager re-reads the track's gap. */
  gap?: unknown;
}

export interface CarouselPaging {
  /** The page on screen or heading there, in [0, count). */
  page: number;
  /** Move one page toward the end (+1) or the start (−1). */
  goBy(direction: -1 | 1): void;
  /** Move to a page. */
  goTo(index: number): void;
  canGoBack: boolean;
  canGoForward: boolean;
  /** Arrow keys, Home and End on the scroller. */
  onKeyDown(event: React.KeyboardEvent<HTMLElement>): void;
  /** Focus entering another slide brings that slide on screen. */
  onFocus(event: React.FocusEvent<HTMLElement>): void;
}

/** The slide element of `track` that contains `node`. */
function slideIndexOf(track: HTMLElement, node: Node | null): number {
  let child: Node | null = node;
  while (child != null && child.parentNode !== track) {
    child = child.parentNode;
  }
  return child == null
    ? -1
    : Array.prototype.indexOf.call(track.children, child);
}

export function useCarouselPaging({
  isEnabled,
  scrollElRef,
  trackRef,
  count,
  loop,
  gap: gapProp,
}: CarouselPagingOptions): CarouselPaging {
  // The page is the pager's: rendered through an external store that the
  // pager's reports (and the take-over below) notify.
  const [pageStore] = useState(() => {
    const listeners = new Set<() => void>();
    return {
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      notify: () => {
        for (const listener of listeners) {
          listener();
        }
      },
    };
  });
  const loops = loop && count > 1;
  const latestRef = useRef({count, loops});
  latestRef.current = {count, loops};

  const [pager] = useState<Pager>(() =>
    createPager({
      count: Math.max(1, count),
      loop: loops,
      onIndexChange: () => pageStore.notify(),
      onSettle: () => place(),
      shouldBeginPan: direction => {
        place(direction);
        return true;
      },
    }),
  );

  // Where each slide sits for looping, and which slides have layers.
  function geometry(): {stride: number; sign: number} | null {
    const viewport = scrollElRef.current;
    const track = trackRef.current;
    if (viewport == null || track == null) {
      return null;
    }
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    return {
      stride: viewport.clientWidth + gap,
      sign: isRtlElement(viewport) ? -1 : 1,
    };
  }

  /**
   * Places the slides around the page on screen (or the one a move heads
   * for): slide i at the copy of i nearest it, toward `direction` when there
   * are too few slides to fill both sides, and promotes the page on screen
   * and its neighbours.
   */
  function place(direction?: 'left' | 'right', center?: number): void {
    const track = trackRef.current;
    const g = geometry();
    if (track == null || g == null) {
      return;
    }
    const n = track.children.length;
    const {loops: isLooping} = latestRef.current;
    const position = center ?? Math.round(pager.presentation() / g.stride);
    // A finger moving left (in LTR) brings the next page in.
    const forward =
      direction == null ? true : (direction === 'left') === (g.sign === 1);
    const before = forward ? Math.floor((n - 1) / 2) : Math.ceil((n - 1) / 2);
    for (let i = 0; i < n; i++) {
      const slide = track.children[i] as HTMLElement;
      let virtual = i;
      if (isLooping) {
        const copy = Math.floor((position - before - i + n - 1) / n);
        virtual = i + copy * n;
        const offset = (virtual - i) * g.stride * g.sign;
        slide.style.setProperty(
          'translate',
          offset === 0 ? '' : `${offset}px 0`,
        );
      }
      slide.style.setProperty(
        'will-change',
        Math.abs(virtual - position) <= 1 ? 'transform' : '',
      );
    }
  }

  function clearPlacement(): void {
    const track = trackRef.current;
    if (track == null) {
      return;
    }
    for (const child of Array.from(track.children)) {
      const slide = child as HTMLElement;
      slide.style.removeProperty('translate');
      slide.style.removeProperty('will-change');
    }
  }

  // Synchronizes the pager (the track's animation) with the slide count and
  // looping. A clamp it makes is not reported; the page shown is derived from
  // the pager during render (`page` below).
  useIsomorphicLayoutEffect(() => {
    pager.setOptions({count: Math.max(1, count), loop: loops});
    if (isEnabled) {
      place();
    }
  }, [pager, count, loops, isEnabled]);

  // Synchronizes the pager's stride with the track's gap when `gap` changes.
  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (!isEnabled || track == null) {
      return;
    }
    pager.setOptions({
      gap: Number.parseFloat(getComputedStyle(track).columnGap) || 0,
    });
    place();
  }, [pager, isEnabled, gapProp]);

  useIsomorphicLayoutEffect(() => {
    const viewport = scrollElRef.current;
    const track = trackRef.current;
    if (!isEnabled || viewport == null || track == null) {
      return undefined;
    }
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    pager.setOptions({gap});
    // Take over from native scrolling on the page it showed.
    const start = Math.round(
      Math.abs(viewport.scrollLeft) / Math.max(1, viewport.clientWidth + gap),
    );
    viewport.scrollTo({left: 0, behavior: 'instant'});
    const detach = pager.attach(viewport, track);
    pager.goTo(start, {animated: false, reason: 'controlled'});
    place();
    // The page shown is the pager's: render it.
    pageStore.notify();
    return () => {
      const index = pager.index;
      detach();
      track.style.removeProperty('translate');
      clearPlacement();
      // Hand the page back to native scrolling.
      viewport.scrollTo({
        left:
          (isRtlElement(viewport) ? -1 : 1) *
          index *
          (viewport.clientWidth + gap),
        behavior: 'instant',
      });
    };
  }, [pager, isEnabled, scrollElRef, trackRef]);

  function goTo(index: number): void {
    const {loops: isLooping, count: n} = latestRef.current;
    if (isLooping) {
      // The copy of the page nearest the one on screen, by the pager's own
      // rule, so the slides wait where it goes; slides between here and there
      // sit on the way before the move.
      const from = pager.virtualIndex;
      const to = nearestLoopCopy(index, from, n);
      place(undefined, (from + to) / 2);
      pager.goTo(to);
      return;
    }
    pager.goTo(Math.max(0, Math.min(n - 1, index)));
  }

  function goBy(direction: -1 | 1): void {
    if (latestRef.current.loops) {
      place(undefined, pager.virtualIndex + direction / 2);
      pager.goTo(pager.virtualIndex + direction);
      return;
    }
    goTo(pager.index + direction);
  }

  // The pager's page, clamped or wrapped to this render's count (the pager
  // takes the new count in the layout effect above).
  const pagerIndex = useSyncExternalStore(
    pageStore.subscribe,
    () => pager.index,
    () => pager.index,
  );
  const n = Math.max(1, count);
  const page = loops
    ? ((pagerIndex % n) + n) % n
    : Math.min(Math.max(0, pagerIndex), n - 1);
  const canGoBack = loops || page > 0;
  const canGoForward = loops || page < count - 1;

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    const rtl = isRtlElement(event.currentTarget);
    switch (event.key) {
      case 'ArrowRight':
        goBy(rtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        goBy(rtl ? 1 : -1);
        break;
      case 'Home':
        goTo(0);
        break;
      case 'End':
        goTo(latestRef.current.count - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  function onFocus(event: React.FocusEvent<HTMLElement>): void {
    const track = trackRef.current;
    if (track == null || !track.contains(event.target)) {
      return;
    }
    const index = slideIndexOf(track, event.target);
    if (index >= 0 && index !== pager.index) {
      goTo(
        latestRef.current.loops
          ? pager.virtualIndex +
              ((((index - pager.index) % count) + count + count / 2) % count) -
              count / 2
          : index,
      );
    }
  }

  return {page, goBy, goTo, canGoBack, canGoForward, onKeyDown, onFocus};
}
