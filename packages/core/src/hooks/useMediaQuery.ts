/**
 * @file useMediaQuery.ts
 * @input Uses React useState, useEffect
 * @output Exports useMediaQuery hook for responsive breakpoint detection
 * @position Core hook; used by consumers for responsive patterns
 *
 * SSR-safe media query hook that subscribes to window.matchMedia changes.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {useState, useEffect} from 'react';

/**
 * SSR-safe media query hook.
 * Returns whether the given media query matches.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false); // Always false on first render (SSR-safe)

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches); // Sync on mount
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
