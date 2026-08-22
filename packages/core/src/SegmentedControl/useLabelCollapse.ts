// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useLabelCollapse.ts
 * @input Uses React state/refs, sharedResizeObserver, useIsomorphicLayoutEffect
 * @output Exports useLabelCollapse — fit-measured icon-only collapse
 * @position Internal hook; consumed by SegmentedControl.tsx
 *
 * The strip collapses on a measured fact — the labelled strip needs more room
 * than its container has — rather than on a breakpoint, so no width is baked
 * into the component and none has to be invented by the caller.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/SegmentedControl.tsx
 * - /packages/core/src/SegmentedControl/SegmentedControl.test.tsx
 */

import {useCallback, useRef, useState} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {observeResize, unobserveResize} from '../utils/sharedResizeObserver';
import type {SegmentedControlLayout} from './SegmentedControlContext';

/** Sub-pixel layout rounding must not read as an overflow. */
const FIT_TOLERANCE_PX = 1;

export interface UseLabelCollapseOptions {
  /** Whether collapsing is enabled at all. */
  isEnabled: boolean;
  /** Controlled state. When set, the strip never measures. */
  isCollapsed?: boolean;
  /** Fired when the measured decision changes. */
  onCollapsedChange?: (isCollapsed: boolean) => void;
  /** Layout mode of the strip — decides where the available width comes from. */
  layout: SegmentedControlLayout;
}

export interface UseLabelCollapseReturn {
  /** Attach to the strip element. */
  ref: (element: HTMLDivElement | null) => void;
  /** Whether labels should currently be collapsed to icons. */
  isCollapsed: boolean;
}

function contentWidth(element: HTMLElement): number {
  const {paddingLeft, paddingRight} = getComputedStyle(element);
  return (
    element.clientWidth -
    (parseFloat(paddingLeft) || 0) -
    (parseFloat(paddingRight) || 0)
  );
}

export function useLabelCollapse({
  isEnabled,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
  layout,
}: UseLabelCollapseOptions): UseLabelCollapseReturn {
  const isControlled = controlledCollapsed !== undefined;
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [measuredCollapsed, setMeasuredCollapsed] = useState(false);

  // Turning the feature off (or handing over to a controlled caller) drops the
  // measured verdict, so re-enabling starts from labels-up and measures again
  // rather than trusting a reading taken at some other size.
  const [wasMeasuring, setWasMeasuring] = useState(isEnabled && !isControlled);
  const isMeasuring = isEnabled && !isControlled;
  if (wasMeasuring !== isMeasuring) {
    setWasMeasuring(isMeasuring);
    setMeasuredCollapsed(false);
  }

  const isCollapsed = isControlled
    ? controlledCollapsed
    : isEnabled && measuredCollapsed;

  const isCollapsedRef = useRef(isCollapsed);
  isCollapsedRef.current = isCollapsed;
  const onCollapsedChangeRef = useRef(onCollapsedChange);
  onCollapsedChangeRef.current = onCollapsedChange;

  // The width the strip needs with its labels. Once collapsed that number is
  // no longer in the DOM to read, so it is remembered from the last measurement
  // taken while the labels were up — which is also what lets the strip grow
  // back when the room returns.
  const naturalWidthRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    if (!element) {
      return;
    }
    if (!isCollapsedRef.current) {
      naturalWidthRef.current = element.scrollWidth;
    }
    const naturalWidth = naturalWidthRef.current;
    if (naturalWidth == null) {
      return;
    }

    // 'fill' spans its container, so its own box still reports the available
    // width after the labels go. 'hug' shrinks to its content, so the question
    // has to be put to the parent instead.
    const parent = element.parentElement;
    const available =
      layout === 'fill' || parent == null
        ? element.clientWidth
        : contentWidth(parent);
    if (available <= 0) {
      return;
    }

    const next = naturalWidth > available + FIT_TOLERANCE_PX;
    if (next !== isCollapsedRef.current) {
      isCollapsedRef.current = next;
      setMeasuredCollapsed(next);
      onCollapsedChangeRef.current?.(next);
    }
  }, [element, layout]);

  useIsomorphicLayoutEffect(() => {
    if (!isMeasuring) {
      naturalWidthRef.current = null;
      return;
    }
    if (element == null || typeof ResizeObserver === 'undefined') {
      return;
    }
    const parent = element.parentElement;
    observeResize(element, measure);
    if (parent) {
      observeResize(parent, measure);
    }
    return () => {
      unobserveResize(element);
      if (parent) {
        unobserveResize(parent);
      }
    };
  }, [isMeasuring, element, measure]);

  return {ref: setElement, isCollapsed};
}
