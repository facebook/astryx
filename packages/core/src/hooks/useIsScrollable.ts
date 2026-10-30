// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIsScrollable.ts
 * @input An element's ref, and whether to measure it
 * @output useIsScrollable: whether the element's content overflows its block
 *   axis
 * @position Internal hook for a touch-tracked surface whose content scroller
 *   keeps the browser's pan only where it overflows (AlertDialog, the action
 *   sheet card)
 *
 * Measured with the shared scroll geometry (scrollGeometry.ts: the block
 * axis under the element's writing mode, past the shared tolerance) when the
 * element or one of its children changes size (a rotation, a font that
 * finishes loading, a new message), through the shared resize observer.
 *
 * SYNC: When modified, update useIsScrollable.test.tsx
 */

import {useState, type RefObject} from 'react';
import {observeResize} from '../utils/sharedResizeObserver';
import {
  getLogicalAxisMapping,
  measureLogicalOverflowGeometry,
} from './scrollGeometry';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export function useIsScrollable(
  ref: RefObject<HTMLElement | null>,
  isEnabled = true,
): boolean {
  const [isScrollable, setIsScrollable] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!isEnabled || element == null) {
      return;
    }
    const measure = () => {
      const style = getComputedStyle(element);
      setIsScrollable(
        measureLogicalOverflowGeometry(
          element,
          'block',
          getLogicalAxisMapping(style.writingMode, style.direction),
        ) === true,
      );
    };
    const stops = [element, ...element.children].map(node =>
      observeResize(node, measure),
    );
    return () => {
      for (const stop of stops) {
        stop();
      }
    };
  }, [ref, isEnabled]);
  return isScrollable;
}
