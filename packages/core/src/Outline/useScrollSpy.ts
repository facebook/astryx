// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollSpy.ts
 * @input Uses React, IntersectionObserver, OutlineItem type
 * @output Exports internal useScrollSpy hook
 * @position Internal behavior hook; consumed by Outline.tsx
 *
 * SYNC: When modified, update /packages/core/src/Outline/Outline.tsx
 */

import {useEffect, useRef, useState} from 'react';
import type {OutlineItem} from './types';

function getScrollableAncestor(element: HTMLElement | null): Element | null {
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

interface UseScrollSpyOptions {
  activeId?: string;
  items: OutlineItem[];
  onActiveIdChange?: (id: string) => void;
  rootRef: React.RefObject<HTMLElement | null>;
}

export function useScrollSpy({
  activeId,
  items,
  onActiveIdChange,
  rootRef,
}: UseScrollSpyOptions): [string | undefined, (id: string) => void] {
  const isControlled = activeId !== undefined;
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState<
    string | undefined
  >(items[0]?.id);
  const visibleHeadingIdsRef = useRef<Set<string>>(new Set());
  const headingTopRef = useRef<Map<string, number>>(new Map());
  const activeIdRef = useRef<string | undefined>(activeId);
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
      if (activeIdRef.current === nextActiveId) {
        return;
      }
      activeIdRef.current = nextActiveId;
      setUncontrolledActiveId(nextActiveId);
      onActiveIdChange?.(nextActiveId);
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
        root: getScrollableAncestor(rootRef.current),
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
  }, [isControlled, itemIds, items, onActiveIdChange, rootRef]);

  const setActiveId = (nextActiveId: string) => {
    if (!isControlled) {
      setUncontrolledActiveId(nextActiveId);
    }
    onActiveIdChange?.(nextActiveId);
  };

  return [isControlled ? activeId : uncontrolledActiveId, setActiveId];
}
