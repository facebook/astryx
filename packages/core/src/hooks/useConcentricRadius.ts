'use client';

import {useLayoutEffect, useRef, useCallback, useState} from 'react';

// =============================================================================
// Types
// =============================================================================

export interface UseConcentricRadiusOptions {
  /**
   * Which element is the source of truth for the radius relationship.
   *
   * - `'container'`: The container's border-radius defines the outer curve.
   *   The inner element's border-radius is computed as
   *   `max(0, containerCornerRadius - gap)` per corner.
   *
   * - `'inner'`: The inner element's shape defines the relationship.
   *   The container's border-radius is computed as
   *   `innerCornerRadius + gap` per corner. Handles pill-shaped elements
   *   by measuring `min(width, height) / 2` when radius >= 9999px.
   *
   * @default 'container'
   */
  reference?: 'container' | 'inner';

  /**
   * Whether to observe size changes and recompute.
   * Uses ResizeObserver when true.
   * @default true
   */
  observe?: boolean;
}

export interface UseConcentricRadiusReturn {
  /** Ref to attach to the outer container element */
  containerRef: React.RefCallback<HTMLElement>;
  /** Ref to attach to the inner element */
  innerRef: React.RefCallback<HTMLElement>;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Parse border-radius from computed style into per-corner values.
 * getComputedStyle always returns resolved px values in the form:
 * "12px" (uniform) or "12px 8px 8px 12px" (per-corner: TL TR BR BL)
 */
function parseCornerRadii(el: HTMLElement): [number, number, number, number] {
  const style = getComputedStyle(el);
  const tl = parseFloat(style.borderTopLeftRadius) || 0;
  const tr = parseFloat(style.borderTopRightRadius) || 0;
  const br = parseFloat(style.borderBottomRightRadius) || 0;
  const bl = parseFloat(style.borderBottomLeftRadius) || 0;
  return [tl, tr, br, bl];
}

/**
 * Check if an element has pill-shaped radius (9999px or very large).
 */
function isPillShaped(radii: [number, number, number, number]): boolean {
  return radii.some(r => r >= 9999);
}

/**
 * Get the effective radius of a pill-shaped element.
 * For pills, the actual visual radius is min(width, height) / 2.
 */
function getPillRadius(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  return Math.min(rect.width, rect.height) / 2;
}

/**
 * Compute the per-corner gap between container and inner element.
 * Returns [topLeft, topRight, bottomRight, bottomLeft] gaps.
 * Each corner gap is the max of the two edge distances meeting at that corner.
 */
function computeCornerGaps(
  cRect: DOMRect,
  iRect: DOMRect,
): [number, number, number, number] {
  const gapTop = iRect.top - cRect.top;
  const gapRight = cRect.right - iRect.right;
  const gapBottom = cRect.bottom - iRect.bottom;
  const gapLeft = iRect.left - cRect.left;

  return [
    Math.max(gapTop, gapLeft), // top-left
    Math.max(gapTop, gapRight), // top-right
    Math.max(gapBottom, gapRight), // bottom-right
    Math.max(gapBottom, gapLeft), // bottom-left
  ];
}

/**
 * Apply border-radius to an element, skipping if values haven't changed.
 */
function applyRadius(
  el: HTMLElement,
  radii: [number, number, number, number],
): void {
  const value = `${radii[0]}px ${radii[1]}px ${radii[2]}px ${radii[3]}px`;
  if (el.style.borderRadius !== value) {
    el.style.borderRadius = value;
  }
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Computes concentric border-radius between a container and inner element.
 *
 * Measures the position of both elements and computes per-corner radii
 * that maintain visual harmony between nested rounded rectangles.
 *
 * @example
 * ```tsx
 * // Container defines the radius, inner element adapts
 * const {containerRef, innerRef} = useConcentricRadius({reference: 'container'});
 *
 * <XDSCard ref={containerRef}>
 *   <div ref={innerRef} style={{background: 'var(--color-wash)'}}>
 *     Content with concentric corners
 *   </div>
 * </XDSCard>
 * ```
 *
 * @example
 * ```tsx
 * // Inner element defines the shape, container adapts
 * const {containerRef, innerRef} = useConcentricRadius({reference: 'inner'});
 *
 * <div ref={containerRef} style={{padding: 8, background: 'var(--color-wash)'}}>
 *   <XDSButton ref={innerRef}>Pill Button</XDSButton>
 * </div>
 * ```
 */
export function useConcentricRadius(
  options: UseConcentricRadiusOptions = {},
): UseConcentricRadiusReturn {
  const {reference = 'container', observe = true} = options;

  const containerElRef = useRef<HTMLElement | null>(null);
  const innerElRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const compute = useCallback(() => {
    const container = containerElRef.current;
    const inner = innerElRef.current;
    if (!container || !inner) return;

    const cRect = container.getBoundingClientRect();
    const iRect = inner.getBoundingClientRect();

    // Skip if either element has zero size (not yet laid out)
    if (cRect.width === 0 || iRect.width === 0) return;

    const gaps = computeCornerGaps(cRect, iRect);

    if (reference === 'container') {
      // Container is source of truth — compute inner radii
      const cRadii = parseCornerRadii(container);

      const innerRadii: [number, number, number, number] = [
        Math.max(0, cRadii[0] - gaps[0]),
        Math.max(0, cRadii[1] - gaps[1]),
        Math.max(0, cRadii[2] - gaps[2]),
        Math.max(0, cRadii[3] - gaps[3]),
      ];

      applyRadius(inner, innerRadii);
    } else {
      // Inner is source of truth — compute container radii
      let iRadii = parseCornerRadii(inner);

      // Handle pill-shaped elements
      if (isPillShaped(iRadii)) {
        const pillR = getPillRadius(inner);
        iRadii = [pillR, pillR, pillR, pillR];
      }

      const containerRadii: [number, number, number, number] = [
        iRadii[0] + gaps[0],
        iRadii[1] + gaps[1],
        iRadii[2] + gaps[2],
        iRadii[3] + gaps[3],
      ];

      applyRadius(container, containerRadii);
    }
  }, [reference]);

  // Set up ResizeObserver to recompute on size changes
  const setupObserver = useCallback(() => {
    if (!observe) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const container = containerElRef.current;
    const inner = innerElRef.current;
    if (!container || !inner) return;

    const observer = new ResizeObserver(() => {
      compute();
    });

    observer.observe(container);
    observer.observe(inner);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [compute, observe]);

  // Ref callbacks — compute immediately when both elements are available
  const containerRef = useCallback(
    (el: HTMLElement | null) => {
      containerElRef.current = el;
      if (el && innerElRef.current) {
        compute();
        setupObserver();
      }
    },
    [compute, setupObserver],
  );

  const innerRef = useCallback(
    (el: HTMLElement | null) => {
      innerElRef.current = el;
      if (el && containerElRef.current) {
        compute();
        setupObserver();
      }
    },
    [compute, setupObserver],
  );

  // Clean up observer on unmount
  useLayoutEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {containerRef, innerRef};
}
