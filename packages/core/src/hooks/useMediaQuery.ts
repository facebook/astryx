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

/**
 * SSR-safe media query hook.
 * Returns whether the given media query matches.
 *
 * @param query - CSS media query string
 * @param serverDefault - Value to return during SSR. Pass a server-side hint
 *   (e.g. derived from User-Agent or client hints) to avoid a layout flash.
 *
 * @example
 * ```
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isMobile = useMediaQuery('(max-width: 768px)', defaultIsMobile);
 * ```
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
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

  const getServerSnapshot = useCallback(() => serverDefault, [serverDefault]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
