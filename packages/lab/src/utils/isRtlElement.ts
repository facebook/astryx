// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file isRtlElement.ts
 * @input A DOM element, or null
 * @output isRtlElement: whether it renders right to left
 * @position Lab's own reading of the writing direction, for drag and
 *   layout maths. Core has the same one-liner behind its package-private
 *   path, which Lab does not import: a consumer installing Lab from the
 *   registry cannot resolve core's internal modules.
 *
 * SSR-safe: false with no element and no DOM. Call it on the event, not
 * during render, so `getComputedStyle` runs only where the answer matters.
 */

/** Whether `element` renders right to left, per its computed `direction`. */
export function isRtlElement(element: HTMLElement | null): boolean {
  if (element == null || typeof window === 'undefined') {
    return false;
  }
  return window.getComputedStyle(element).direction === 'rtl';
}
