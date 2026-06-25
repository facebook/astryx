// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollSpy.ts
 * @input Uses React, scroll position of heading elements, OutlineItem type
 * @output Exports internal useScrollSpy hook
 * @position Internal behavior hook; consumed by Outline.tsx
 *
 * Drives the active outline item from scroll position. On each scroll
 * (rAF-throttled) it reads live heading positions and marks the last heading
 * whose top has passed its activation line (its own scroll-margin-top, i.e.
 * where it lands when navigated to). This is stable — it never compares stale
 * cached positions — so the indicator moves monotonically instead of jumping.
 * Defaults to the first item at the top and the last item at the bottom so
 * short final sections still activate.
 *
 * SYNC: When modified, update /packages/core/src/Outline/Outline.tsx
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {OutlineItem} from './types';

/** Keys that scroll the viewport — used to detect a manual scroll intent. */
const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
  'Spacebar',
]);

function getScrollableAncestor(
  element: HTMLElement | null,
): HTMLElement | null {
  let current = element?.parentElement ?? null;

  while (current != null) {
    const computedStyle = window.getComputedStyle(current);
    const overflowY = computedStyle.overflowY;
    const isScrollable =
      (overflowY === 'auto' ||
        overflowY === 'scroll' ||
        overflowY === 'overlay') &&
      current.scrollHeight > current.clientHeight;

    if (isScrollable) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

/**
 * Resolve the active heading id from current scroll position.
 *
 * A heading is "passed" once its top reaches its activation line — the scroll
 * root's top plus the heading's own scroll-margin-top. The active heading is
 * the last passed one (headings are in document order). When none have passed
 * (scrolled above the first), the first item is active; at the bottom, the
 * last item is active.
 */
function resolveActiveId(
  items: OutlineItem[],
  scrollRoot: HTMLElement | null,
): string | undefined {
  if (items.length === 0) {
    return undefined;
  }

  const rootTop =
    scrollRoot != null ? scrollRoot.getBoundingClientRect().top : 0;

  const atBottom =
    scrollRoot != null
      ? scrollRoot.scrollTop + scrollRoot.clientHeight >=
        scrollRoot.scrollHeight - 2
      : window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
  if (atBottom) {
    return items[items.length - 1].id;
  }

  let activeId = items[0].id;
  for (const item of items) {
    const element = document.getElementById(item.id);
    if (element == null) {
      continue;
    }
    const top = element.getBoundingClientRect().top;
    const marginTop =
      Number.parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0;

    if (top <= rootTop + marginTop + 1) {
      activeId = item.id;
    } else {
      break;
    }
  }
  return activeId;
}

interface UseScrollSpyOptions {
  activeId?: string;
  items: OutlineItem[];
  onActiveIdChange?: (id: string) => void;
  rootRef: React.RefObject<HTMLElement | null>;
}

interface UseScrollSpyResult {
  activeId: string | undefined;
  /** Set the active id (notifies onActiveIdChange). For controlled consumers. */
  setActiveId: (id: string) => void;
  /**
   * Handle a click on the outline item with id `id`. Delays moving the
   * indicator: scroll-spy is suppressed during the programmatic smooth scroll
   * so the indicator doesn't chase it, then the indicator moves once to the
   * clicked item when the scroll settles. If the user scrolls manually mid-way,
   * scroll-position tracking resumes immediately instead.
   */
  lockActiveId: (id: string) => void;
}

export function useScrollSpy({
  activeId,
  items,
  onActiveIdChange,
  rootRef,
}: UseScrollSpyOptions): UseScrollSpyResult {
  const isControlled = activeId !== undefined;
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState<
    string | undefined
  >(items[0]?.id);
  const activeIdRef = useRef<string | undefined>(activeId);
  // While true, scroll-spy ignores scroll updates because a click is driving a
  // programmatic scroll. Released when that scroll settles or the user scrolls.
  const suppressRef = useRef(false);
  const releaseSuppressionRef = useRef<(() => void) | null>(null);
  // Latest scroll-position resolver, so the click handler can resume tracking
  // when the user scrolls during a programmatic scroll.
  const syncRef = useRef<(() => void) | null>(null);
  // Keep latest items/callback in refs so the scroll listener effect doesn't
  // re-subscribe on every render (items is a fresh array each render).
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onActiveIdChangeRef = useRef(onActiveIdChange);
  onActiveIdChangeRef.current = onActiveIdChange;
  const itemIds = items.map(item => item.id).join('\n');
  activeIdRef.current = isControlled ? activeId : uncontrolledActiveId;

  useEffect(() => {
    if (isControlled || typeof window === 'undefined') {
      return;
    }

    const scrollRoot = getScrollableAncestor(rootRef.current);
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (suppressRef.current) {
        return;
      }
      const nextActiveId = resolveActiveId(itemsRef.current, scrollRoot);
      if (nextActiveId != null && nextActiveId !== activeIdRef.current) {
        activeIdRef.current = nextActiveId;
        setUncontrolledActiveId(nextActiveId);
        onActiveIdChangeRef.current?.(nextActiveId);
      }
    };
    const onScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(update);
      }
    };

    syncRef.current = update;
    update();
    scrollTarget.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});

    return () => {
      syncRef.current = null;
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, [isControlled, itemIds, rootRef]);

  // Tear down any pending suppression listeners when the Outline unmounts.
  useEffect(() => {
    return () => {
      releaseSuppressionRef.current?.();
    };
  }, []);

  const setActiveId = (nextActiveId: string) => {
    if (!isControlled) {
      setUncontrolledActiveId(nextActiveId);
    }
    onActiveIdChange?.(nextActiveId);
  };

  const lockActiveId = useCallback((clickedId: string) => {
    if (typeof window === 'undefined') {
      setUncontrolledActiveId(clickedId);
      activeIdRef.current = clickedId;
      onActiveIdChangeRef.current?.(clickedId);
      return;
    }

    // Freeze the indicator during the programmatic smooth scroll instead of
    // moving it immediately — it lands on the clicked item once the scroll
    // settles, so it doesn't chase the scroll through intervening sections.
    suppressRef.current = true;
    // Replace any in-flight handlers from a previous click.
    releaseSuppressionRef.current?.();

    let settleTimer = 0;
    const cleanup = () => {
      window.removeEventListener('scrollend', onSettle);
      window.removeEventListener('wheel', onManual);
      window.removeEventListener('touchmove', onManual);
      window.removeEventListener('keydown', onKeyDown);
      if (settleTimer !== 0) {
        clearTimeout(settleTimer);
        settleTimer = 0;
      }
      releaseSuppressionRef.current = null;
    };
    // Programmatic scroll finished: move the indicator to the clicked item.
    const onSettle = () => {
      cleanup();
      suppressRef.current = false;
      setUncontrolledActiveId(clickedId);
      activeIdRef.current = clickedId;
      onActiveIdChangeRef.current?.(clickedId);
    };
    // User scrolled mid-flight: hand control back to scroll-position tracking.
    const onManual = () => {
      cleanup();
      suppressRef.current = false;
      syncRef.current?.();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) {
        onManual();
      }
    };

    window.addEventListener('scrollend', onSettle, {once: true});
    window.addEventListener('wheel', onManual, {passive: true});
    window.addEventListener('touchmove', onManual, {passive: true});
    window.addEventListener('keydown', onKeyDown);
    // Fallback when scrollend is unsupported or no scroll is needed.
    settleTimer = window.setTimeout(onSettle, 1200);
    releaseSuppressionRef.current = cleanup;
  }, []);

  return {
    activeId: isControlled ? activeId : uncontrolledActiveId,
    setActiveId,
    lockActiveId,
  };
}
