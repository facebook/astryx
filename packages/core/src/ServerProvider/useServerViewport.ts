/**
 * @file useServerViewport.ts
 * @input React hooks, XDSServerContext
 * @output Exports useServerViewport hook
 * @position Hook; consumed by XDSAppShell for responsive breakpoint detection
 *
 * SSR-safe viewport detection. On the server, uses the width hint from
 * either a direct prop or XDSServerProvider context. On the client,
 * uses matchMedia and syncs a cookie for the next server render.
 */

'use client';

import {useState, useEffect, useCallback} from 'react';
import {useXDSServer} from './XDSServerContext';

/**
 * Set a cookie on the client.
 */
function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value};path=/;expires=${expires};SameSite=Lax`;
}

/**
 * SSR-safe viewport breakpoint detection.
 *
 * Priority for initial value:
 * 1. `directHint` (prop on the component — e.g. viewportHint on AppShell)
 * 2. XDSServerProvider context (viewport.value)
 * 3. `defaultValue` (true = mobile-first)
 *
 * On the client, hands off to matchMedia. If a cookie name is configured
 * (via XDSServerProvider), writes the viewport width for next SSR.
 *
 * @param breakpointPx - The breakpoint width in pixels (e.g. 768 for "md")
 * @param directHint - Direct width hint (takes precedence over provider)
 * @param defaultValue - SSR default when no hint is available. `true` = mobile-first.
 * @returns Whether the viewport is below the breakpoint
 */
export function useServerViewport(
  breakpointPx: number,
  directHint?: number,
  defaultValue = true,
): boolean {
  const server = useXDSServer();
  const viewportHint = server?.viewport;

  // Compute initial value: direct prop > provider > default
  const hintWidth = directHint ?? viewportHint?.value;
  const serverIsBelowBreakpoint =
    hintWidth != null ? hintWidth <= breakpointPx : defaultValue;

  const [isBelowBreakpoint, setIsBelowBreakpoint] = useState(
    serverIsBelowBreakpoint,
  );

  // Sync cookie when viewport changes
  const cookieName = viewportHint?.cookieName;
  const syncCookie = useCallback(
    (width: number) => {
      if (cookieName) {
        setCookie(cookieName, String(width));
      }
    },
    [cookieName],
  );

  useEffect(() => {
    if (breakpointPx === 0) return; // breakpoint: 'none'

    const mql = window.matchMedia(`(max-width: ${breakpointPx}px)`);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : false;
      setIsBelowBreakpoint(matches);
      syncCookie(window.innerWidth);
    };

    // Check initial state (may differ from server hint)
    handleChange(mql);
    syncCookie(window.innerWidth);

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [breakpointPx, syncCookie]);

  return isBelowBreakpoint;
}
