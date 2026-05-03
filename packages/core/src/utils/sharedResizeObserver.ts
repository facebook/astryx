'use client';

/**
 * @file sharedResizeObserver.ts
 * @input ResizeObserver API
 * @output Exports observeResize / unobserveResize for shared observation
 * @position Utility; consumed by useTruncation, useOverflow, and any component
 *   that needs resize observation without creating per-instance observers
 *
 * A single ResizeObserver can observe thousands of elements. Creating one
 * per component (e.g. per table cell) is wasteful — browsers batch
 * observations per observer instance, so a shared observer means one
 * callback dispatch per animation frame instead of N.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/utils/index.ts (exports)
 * - /packages/core/src/Text/useTruncation.ts (primary consumer)
 */

type ResizeCallback = (entry: ResizeObserverEntry) => void;

let observer: ResizeObserver | null = null;
const callbacks = new Map<Element, ResizeCallback>();

function getObserver(): ResizeObserver {
  if (!observer) {
    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cb = callbacks.get(entry.target);
        if (cb) cb(entry);
      }
    });
  }
  return observer;
}

/**
 * Observe an element's size via a shared ResizeObserver singleton.
 *
 * Call `unobserveResize` when the element unmounts or observation is
 * no longer needed. The shared observer is destroyed when the last
 * element is unobserved.
 *
 * @example
 * ```
 * // In a ref callback or effect:
 * observeResize(element, (entry) => {
 *   console.log(entry.contentRect.width);
 * });
 *
 * // Cleanup:
 * unobserveResize(element);
 * ```
 */
export function observeResize(
  element: Element,
  callback: ResizeCallback,
): void {
  callbacks.set(element, callback);
  getObserver().observe(element);
}

/**
 * Stop observing an element. If no elements remain, the shared
 * observer is disconnected and released for garbage collection.
 */
export function unobserveResize(element: Element): void {
  callbacks.delete(element);
  if (observer) {
    observer.unobserve(element);
    if (callbacks.size === 0) {
      observer.disconnect();
      observer = null;
    }
  }
}
