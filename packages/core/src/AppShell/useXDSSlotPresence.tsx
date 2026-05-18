// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useXDSSlotPresence.tsx
 * @input Uses React useCallback, useEffect, useRef, useState
 * @output Exports useXDSSlotPresence hook
 * @position Internal hook for detecting whether slot containers have rendered content.
 *
 * Solves the "empty component" problem: when a framework (e.g. Next.js parallel
 * routes) passes a React element to a slot but the component renders null, prop
 * checks like `sideNav != null` are true even though nothing rendered.
 *
 * AppShell wraps each slot render in a `display:contents` div with a ref from
 * this hook. The hook checks `childNodes` to determine whether the slot actually
 * produced DOM output. Multiple elements can share the same ref (via callback
 * ref) — only one mounts at a time, and the hook observes whichever is active.
 */

import {useCallback, useEffect, useRef, useState} from 'react';

function hasChildContent(el: HTMLElement): boolean {
  for (let i = 0; i < el.childNodes.length; i++) {
    const node = el.childNodes[i];
    if (node.nodeType === Node.ELEMENT_NODE) return true;
    if (
      node.nodeType === Node.TEXT_NODE &&
      node.textContent &&
      node.textContent.trim() !== ''
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Hook that detects whether a DOM container has rendered children.
 *
 * Returns a callback ref to attach to `display:contents` wrapper divs.
 * Multiple wrappers can share the same ref — only one is active at a time
 * (e.g. sideNav renders inline OR in the mobile drawer, not both).
 *
 * @param initialValue - Initial assumption before the first DOM check.
 *   Pass `prop != null` to assume content exists until proven otherwise.
 */
export function useXDSSlotPresence(initialValue = false) {
  const [hasContent, setHasContent] = useState(initialValue);
  const observerRef = useRef<MutationObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const check = useCallback(() => {
    const el = elementRef.current;
    setHasContent(el ? hasChildContent(el) : false);
  }, []);

  // Callback ref — called when elements mount/unmount
  const ref = useCallback((node: HTMLDivElement | null) => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    elementRef.current = node;

    if (!node) {
      setHasContent(false);
      return;
    }

    if (node) {
      // Check immediately
      setHasContent(hasChildContent(node));

      // Observe for changes
      const observer = new MutationObserver(() => {
        setHasContent(hasChildContent(node));
      });
      observer.observe(node, {childList: true, subtree: true});
      observerRef.current = observer;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {ref, hasContent};
}
