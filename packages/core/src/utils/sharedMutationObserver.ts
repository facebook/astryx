// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file sharedMutationObserver.ts
 * @input MutationObserver API
 * @output Exports observeContent for shared content-change observation
 * @position Internal utility; consumed by useTruncation. The content-change
 *   counterpart of sharedResizeObserver: one observer for every element, so a
 *   repeated cell or row path does not create one observer per instance.
 */

type ContentCallback = () => void;

const OPTIONS: MutationObserverInit = {
  characterData: true,
  childList: true,
  subtree: true,
};

let observer: MutationObserver | null = null;
const callbacks = new Map<Node, Set<ContentCallback>>();

function dispatch(records: MutationRecord[]): void {
  // One call per callback per batch, however many records it received. A
  // record's target can be any descendant, so walk up to the observed roots.
  const pending = new Set<ContentCallback>();
  for (const record of records) {
    for (let node: Node | null = record.target; node; node = node.parentNode) {
      callbacks.get(node)?.forEach(callback => pending.add(callback));
    }
  }
  pending.forEach(callback => callback());
}

/**
 * Call `callback` when the element's text or children change (including
 * descendants). Returns an unsubscribe that removes only this registration.
 *
 * MutationObserver has no per-target unobserve, so a released element stays
 * registered with the shared observer until no element remains; its records
 * match no callback and are ignored. The observer disconnects and is released
 * when the last registration goes.
 */
export function observeContent(
  element: Element,
  callback: ContentCallback,
): () => void {
  if (typeof MutationObserver === 'undefined') {
    return () => {};
  }
  observer ??= new MutationObserver(dispatch);
  const existing = callbacks.get(element);
  if (existing) {
    existing.add(callback);
  } else {
    callbacks.set(element, new Set([callback]));
    observer.observe(element, OPTIONS);
  }

  let isSubscribed = true;
  return () => {
    if (!isSubscribed) {
      return;
    }
    isSubscribed = false;
    const targetCallbacks = callbacks.get(element);
    targetCallbacks?.delete(callback);
    if (targetCallbacks?.size === 0) {
      callbacks.delete(element);
    }
    if (callbacks.size === 0 && observer) {
      observer.disconnect();
      observer = null;
    }
  };
}
