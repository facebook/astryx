// Copyright (c) Meta Platforms, Inc. and affiliates.

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
// A SET per element. Two hooks observing the same node is ordinary — a
// resizable region's container is also what `useOverflow`, `useTruncation` or a
// `TabList` root watches — and a single-callback map silently dropped whichever
// registered first, so one of them just stopped receiving resizes.
const callbacks = new Map<Element, Set<ResizeCallback>>();

/**
 * The shared observer, or null where the API does not exist (jsdom, an old
 * browser). Callers still get the one-shot measurement `observeResize` fires
 * on registration; live resize updates are the part that needs the API.
 */
function getObserver(): ResizeObserver | null {
  if (typeof ResizeObserver === 'undefined') {
    return null;
  }
  if (!observer) {
    observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const targetCallbacks = callbacks.get(entry.target);
        if (targetCallbacks) {
          // Copied before iterating: a callback is allowed to unsubscribe, and
          // mutating the live set mid-iteration would skip its neighbour.
          for (const cb of [...targetCallbacks]) {
            cb(entry);
          }
        }
      }
    });
  }
  return observer;
}

/**
 * Observe an element's size via a shared ResizeObserver singleton.
 *
 * Fires the callback once synchronously on registration (with a
 * synthetic entry) so callers don't need separate initial-measurement
 * logic. Subsequent callbacks fire on actual resizes.
 *
 * Returns an unsubscribe function that removes only this registration, leaving
 * every other observer of the same element intact — prefer it over
 * `unobserveResize(element)`, which drops them all. The shared observer is
 * destroyed when the last element is unobserved.
 *
 * @example
 * ```
 * const unsubscribe = observeResize(element, (entry) => {
 *   console.log(entry.contentBoxSize);
 * });
 *
 * // Cleanup:
 * unsubscribe();
 * ```
 */
export function observeResize(
  element: Element,
  callback: ResizeCallback,
): () => void {
  const existing = callbacks.get(element);
  if (existing) {
    existing.add(callback);
  } else {
    callbacks.set(element, new Set([callback]));
  }
  getObserver()?.observe(element);

  // Fire once immediately so callers get an initial measurement
  // without duplicating their logic outside the observer path.
  const entry: Partial<ResizeObserverEntry> = {target: element};
  callback(entry as ResizeObserverEntry);

  return () => {
    unobserveResize(element, callback);
  };
}

/**
 * Stop observing an element.
 *
 * Pass the callback to remove only that registration — the unsubscribe returned
 * by `observeResize` does this for you. Omitting it removes EVERY callback on
 * the element, which silences peers that are still mounted, so it is only
 * correct for a caller that owns the element outright.
 *
 * If no elements remain, the shared observer is disconnected and released for
 * garbage collection.
 */
export function unobserveResize(
  element: Element,
  callback?: ResizeCallback,
): void {
  const targetCallbacks = callbacks.get(element);
  if (callback != null && targetCallbacks != null) {
    targetCallbacks.delete(callback);
    // Someone else is still listening: the element stays observed, or one
    // hook's unmount would blind every other hook on it.
    if (targetCallbacks.size > 0) {
      return;
    }
  }
  callbacks.delete(element);
  if (observer) {
    observer.unobserve(element);
    if (callbacks.size === 0) {
      observer.disconnect();
      observer = null;
    }
  }
}
