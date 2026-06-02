// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollSpy.ts
 * @input Uses React, IntersectionObserver, OutlineItem type
 * @output Exports internal useScrollSpy hook
 * @position Internal behavior hook; consumed by XDSOutline.tsx
 *
 * ## Scroll-spy strategy
 *
 * Preserves the existing IntersectionObserver "topmost visible heading"
 * algorithm. The observer tracks which headings are visible and the active
 * heading is the visible one closest to the top of the scroll root.
 *
 * Narrow additions layered on top of that proven behavior:
 * - `scrollContainerRef` / `offset` feed the observer's root and rootMargin
 *   instead of introducing a separate scroll-position engine.
 * - `isLockedRef` suppresses active-state updates during programmatic
 *   smooth-scroll (click-lock) to prevent jitter.
 * - Returns an object exposing `activeId`, `setActiveId`, and `scrollTo`.
 *
 * SYNC: When modified, update /packages/core/src/Outline/XDSOutline.tsx
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {OutlineItem} from './types';

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

export interface UseScrollSpyOptions {
  /** Target items to observe. */
  items: OutlineItem[];
  /** Controlled active ID. When provided, disables internal scroll tracking. */
  activeId?: string;
  /** Callback when the active ID changes. */
  onActiveIdChange?: (id: string) => void;
  /** Scroll container ref to scope tracking; defaults to viewport / nearest scrollable ancestor. */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Pixel offset from the top of the scroll root for the activation line. */
  offset?: number;
  /**
   * Ref that, when true, suppresses internal active-state updates from scroll
   * tracking. Used to prevent jitter during programmatic smooth scroll.
   */
  isLockedRef?: React.RefObject<boolean>;
}

export interface UseScrollSpyReturn {
  /** Currently active section ID. */
  activeId: string | undefined;
  /** Set the active ID manually. */
  setActiveId: (id: string) => void;
  /** Smooth-scroll a target element into view, accounting for offset. */
  scrollTo: (id: string) => void;
}

export function useScrollSpy(options: UseScrollSpyOptions): UseScrollSpyReturn {
  const {
    items,
    activeId,
    onActiveIdChange,
    scrollContainerRef,
    offset = 0,
    isLockedRef,
  } = options;

  const isControlled = activeId !== undefined;
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState<
    string | undefined
  >(items[0]?.id);
  const visibleHeadingIdsRef = useRef<Set<string>>(new Set());
  const headingTopRef = useRef<Map<string, number>>(new Map());
  const activeIdRef = useRef<string | undefined>(activeId);
  const onActiveChangeRef = useRef(onActiveIdChange);
  onActiveChangeRef.current = onActiveIdChange;

  const itemIds = items.map(item => item.id).join('\n');
  activeIdRef.current = isControlled ? activeId : uncontrolledActiveId;

  useEffect(() => {
    if (isControlled || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const headingElements = items
      .map(item => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element != null);

    if (headingElements.length === 0) {
      return;
    }

    const visibleHeadingIds = visibleHeadingIdsRef.current;
    const headingTop = headingTopRef.current;

    const setNextActiveId = (nextActiveId: string) => {
      // Click-lock: skip updates during programmatic scroll to avoid jitter.
      if (isLockedRef?.current) {
        return;
      }
      if (activeIdRef.current === nextActiveId) {
        return;
      }
      activeIdRef.current = nextActiveId;
      setUncontrolledActiveId(nextActiveId);
      onActiveChangeRef.current?.(nextActiveId);
    };

    const chooseActiveHeading = () => {
      let nextActiveId: string | undefined;
      let nextTop = Number.POSITIVE_INFINITY;

      for (const id of visibleHeadingIds) {
        const top = headingTop.get(id) ?? Number.POSITIVE_INFINITY;
        if (top < nextTop) {
          nextTop = top;
          nextActiveId = id;
        }
      }

      if (nextActiveId != null) {
        setNextActiveId(nextActiveId);
      }
    };

    const root =
      scrollContainerRef?.current ?? getScrollableAncestor(headingElements[0]);

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const id = entry.target.id;
          headingTop.set(id, entry.boundingClientRect.top);
          if (entry.isIntersecting) {
            visibleHeadingIds.add(id);
          } else {
            visibleHeadingIds.delete(id);
          }
        }
        chooseActiveHeading();
      },
      {
        root,
        rootMargin: offset ? `-${offset}px 0px 0px 0px` : undefined,
        threshold: 0,
      },
    );

    for (const headingElement of headingElements) {
      observer.observe(headingElement);
    }

    return () => {
      observer.disconnect();
      visibleHeadingIds.clear();
      headingTop.clear();
    };
  }, [isControlled, itemIds, items, scrollContainerRef, offset, isLockedRef]);

  const setActiveId = useCallback(
    (nextActiveId: string) => {
      if (!isControlled) {
        setUncontrolledActiveId(nextActiveId);
      }
      onActiveChangeRef.current?.(nextActiveId);
    },
    [isControlled],
  );

  const scrollTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el == null) {
        return;
      }

      const container = scrollContainerRef?.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const top =
          container.scrollTop + (elRect.top - containerRect.top) - offset;
        container.scrollTo({top, behavior: 'smooth'});
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({top, behavior: 'smooth'});
      }

      setActiveId(id);
    },
    [scrollContainerRef, offset, setActiveId],
  );

  return {
    activeId: isControlled ? activeId : uncontrolledActiveId,
    setActiveId,
    scrollTo,
  };
}
