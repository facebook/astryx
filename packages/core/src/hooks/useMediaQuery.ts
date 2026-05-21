// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMediaQuery.ts
 * @input Uses React useSyncExternalStore, useCallback
 * @output Exports useMediaQuery hook for responsive breakpoint detection
 * @position Core hook; used by consumers for responsive patterns
 *
 * SSR-safe media query hook that subscribes to window.matchMedia changes
 * via useSyncExternalStore — the canonical React pattern for external
 * browser state.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {useCallback, useSyncExternalStore} from 'react';

function getServerSnapshot(): boolean {
  return false;
}

/**
 * SSR-safe media query hook.
 * Returns whether the given media query matches.
 *
 * @example
 * ```
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
