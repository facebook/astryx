// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollSpy.ts
 * @input Uses React hooks, IntersectionObserver API, scroll events
 * @output Exports useScrollSpy hook — tracks which section is active based on scroll
 * @position Internal behavior hook; consumed by XDSOutline.tsx
 *
 * ## Scroll-spy strategy
 *
 * Uses a hybrid IntersectionObserver + scroll-position approach:
 *
 * 1. IntersectionObserver tracks when sections enter/leave the viewport.
 * 2. On each intersection change or scroll event, picks the "active" section
 *    using a position-based heuristic: the last section whose top edge is at or
 *    above the offset line.
 * 3. For the last-section edge case, detects when scrolled to bottom and
 *    activates the last item.
 * 4. Supports a click-lock ref to prevent jitter during programmatic scroll.
 *
 * SYNC: When modified, update /packages/core/src/Outline/XDSOutline.tsx
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {OutlineItem} from './types';

// =============================================================================
// Types
// =============================================================================

export interface UseScrollSpyOptions {
  /** Target items to observe */
  items: OutlineItem[];
  /** Currently controlled active ID (disables scroll tracking when set) */
  activeId?: string;
  /** Callback when active ID changes */
  onActiveIdChange?: (id: string) => void;
  /** Scroll container ref (defaults to nearest scrollable ancestor or viewport) */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Pixel offset from top for activation threshold */
  offset?: number;
  /**
   * Ref that, when true, suppresses all internal state updates from scroll tracking.
   * Used to prevent jitter during programmatic smooth scroll.
   */
  isLockedRef?: React.RefObject<boolean>;
}

export interface UseScrollSpyReturn {
  /** Currently active section ID */
  activeId: string | undefined;
  /** Set active ID manually */
  setActiveId: (id: string) => void;
  /** Scroll a target element into view */
  scrollTo: (id: string) => void;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for tracking which page section is currently in the viewport.
 *
 * Uses a hybrid approach: IntersectionObserver for visibility detection
 * combined with scroll-position heuristics for accurate active-section
 * determination. Handles edge cases like short final sections and
 * multiple visible sections.
 */
export function useScrollSpy(options: UseScrollSpyOptions): UseScrollSpyReturn {
  const {
    items,
    activeId: controlledActiveId,
    onActiveIdChange,
    scrollContainerRef,
    offset = 0,
    isLockedRef,
  } = options;

  const isControlled = controlledActiveId !== undefined;
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState<
    string | undefined
  >(items[0]?.id);
  const onActiveChangeRef = useRef(onActiveIdChange);
  onActiveChangeRef.current = onActiveIdChange;

  // Keep a stable reference to items for the scroll handler
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const ids = items.map(item => item.id);
  const idsRef = useRef(ids);
  idsRef.current = ids;

  useEffect(() => {
    if (isControlled || ids.length === 0) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const container = scrollContainerRef?.current ?? null;

    /**
     * Determine the active section based on scroll position.
     * Strategy: find the last section whose top edge is at or above the offset line.
     */
    function computeActiveId(): string | null {
      const currentIds = idsRef.current;
      if (currentIds.length === 0) {
        return null;
      }

      // Check if scrolled to bottom — activate last item
      const scrollTop = container ? container.scrollTop : window.scrollY;
      const scrollHeight = container
        ? container.scrollHeight
        : document.documentElement.scrollHeight;
      const clientHeight = container
        ? container.clientHeight
        : window.innerHeight;

      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
      if (isAtBottom) {
        return currentIds[currentIds.length - 1];
      }

      // Find the last section whose top is at or above the offset threshold
      let activeCandidate: string | null = currentIds[0];

      for (const id of currentIds) {
        const el = document.getElementById(id);
        if (!el) {
          continue;
        }

        let topRelative: number;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          topRelative = elRect.top - containerRect.top;
        } else {
          const elRect = el.getBoundingClientRect();
          topRelative = elRect.top;
        }

        // Section top is at or above the offset line — it's a candidate
        if (topRelative <= offset + 4) {
          activeCandidate = id;
        }
      }

      return activeCandidate;
    }

    function handleUpdate() {
      // Skip state updates when locked (during programmatic scroll)
      if (isLockedRef?.current) {
        return;
      }

      const newId = computeActiveId();
      if (newId != null) {
        setUncontrolledActiveId(prev => {
          if (prev !== newId) {
            onActiveChangeRef.current?.(newId);
            return newId;
          }
          return prev;
        });
      }
    }

    // Use IntersectionObserver as a trigger to re-evaluate
    const observer = new IntersectionObserver(
      () => {
        handleUpdate();
      },
      {
        root: container,
        rootMargin: `-${offset}px 0px -40% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    // Observe each target element
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    }

    // Also listen to scroll events for continuous tracking
    const scrollTarget = container ?? window;
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          handleUpdate();
          ticking = false;
        });
      }
    }

    scrollTarget.addEventListener('scroll', onScroll, {passive: true});

    // Initial computation
    handleUpdate();

    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener('scroll', onScroll);
    };
  }, [isControlled, ids, scrollContainerRef, offset, isLockedRef]);

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
      if (!el) {
        return;
      }

      const container = scrollContainerRef?.current;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const scrollTop =
          container.scrollTop + (elRect.top - containerRect.top) - offset;
        container.scrollTo({top: scrollTop, behavior: 'smooth'});
      } else {
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({top: y, behavior: 'smooth'});
      }

      // Immediately set the active ID for responsive feedback
      setActiveId(id);
    },
    [scrollContainerRef, offset, setActiveId],
  );

  return {
    activeId: isControlled ? controlledActiveId : uncontrolledActiveId,
    setActiveId,
    scrollTo,
  };
}
