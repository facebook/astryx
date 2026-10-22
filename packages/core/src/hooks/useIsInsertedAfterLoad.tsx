// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIsInsertedAfterLoad.tsx
 * @input Uses React, useIsHydrating, useAnnounce, renderedText
 * @output Exports useIsInsertedAfterLoad and AnnounceOnInsert
 * @position Internal utility for content that appears after the page loads;
 *   read by useEntryAnimation and EmptyState. SYNC: deliberately NOT exported
 *   from hooks/index.ts, so it ships no public API (`spec:AST-002`).
 */

import {useEffect, useRef, useState, type HTMLAttributes} from 'react';
import {useAnnounce} from './useAnnounce';
import {renderedText} from './useAnnounceRenderedText';
import {useIsHydrating} from './useIsHydrating';

// Whether the page's first paint has happened. Server-rendered elements are
// covered by useIsHydrating instead: hydration can run after this turns true.
let initialPaintComplete = false;
if (typeof window !== 'undefined') {
  requestAnimationFrame(() => {
    initialPaintComplete = true;
  });
}

/**
 * Whether the caller mounted after the page loaded, rather than with it
 * (before the first paint, or while hydrating server HTML; spec:AST-013 FR9,
 * FR13). Captured once, so a hydrated element never turns `true` when React
 * re-renders it with the client snapshot.
 */
export function useIsInsertedAfterLoad(): boolean {
  const isHydrating = useIsHydrating();
  const [isInserted] = useState(() => !isHydrating && initialPaintComplete);
  return isInserted;
}

/**
 * A `div` that, when inserted after the page loaded, announces its rendered
 * text once through the shared polite live region (`spec:AST-086` FR2); one
 * rendered with the page announces nothing. Later changes are not announced.
 * Each child element is read as its own block, so a heading and the text
 * below it are not run together.
 */
export function AnnounceOnInsert({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const announce = useAnnounce();
  const isInserted = useIsInsertedAfterLoad();
  // Survives StrictMode's replayed effects, so one mount speaks once.
  const hasSpokenRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!isInserted || hasSpokenRef.current || !element) {
      return;
    }
    const text = Array.from(element.children)
      .filter(child => child.getAttribute('aria-hidden') !== 'true')
      .map(child => renderedText(child as HTMLElement))
      .filter(part => part !== '')
      .join(' ');
    if (text !== '') {
      hasSpokenRef.current = true;
      announce(text);
    }
  }, [announce, isInserted]);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}
