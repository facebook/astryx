'use client';

/**
 * @file XDSServerProvider.tsx
 * @input React, XDSServerContext
 * @output Exports XDSServerProvider component, XDSServerProviderProps
 * @position Root-level provider; place in server layout to pass viewport hint to XDS components
 *
 * Provides server-side viewport width to XDS components so they can
 * render the correct layout on the first server render — no hydration flash.
 *
 * Color scheme is handled separately by XDSTheme's `mode` prop.
 *
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js App Router — server component)
 * import { cookies } from 'next/headers';
 * import { XDSServerProvider } from '@xds/core/ServerProvider';
 *
 * export default function RootLayout({ children }) {
 *   const vp = cookies().get('app-vp')?.value;
 *   return (
 *     <XDSServerProvider
 *       viewport={{ value: Number(vp) || undefined, cookieName: 'app-vp' }}
 *     >
 *       {children}
 *     </XDSServerProvider>
 *   );
 * }
 * ```
 *
 * SYNC: When modified, update:
 * - /packages/core/src/ServerProvider/index.ts
 */

import {type ReactNode, useMemo} from 'react';
import {
  XDSServerContext,
  type XDSViewportHint,
} from './XDSServerContext';

export interface XDSServerProviderProps {
  /**
   * Viewport hint for SSR. Prevents mobile layout flash.
   * - `value` — viewport width from the server (e.g. read from a cookie)
   * - `cookieName` — Cookie name for client-side persistence. XDS writes the
   *   viewport width to this cookie when it changes.
   */
  viewport?: XDSViewportHint;
  children: ReactNode;
}

/**
 * Server-side viewport provider for XDS.
 *
 * Place in your root server layout to give XDS components access to
 * the client's viewport width during SSR. This prevents hydration
 * flashes — components render the correct responsive layout on the
 * first server render.
 *
 * Without this provider, XDS falls back to mobile-first on SSR
 * then corrects on the client via matchMedia.
 */
export function XDSServerProvider({
  viewport,
  children,
}: XDSServerProviderProps) {
  const value = useMemo(
    () => ({viewport}),
    [viewport?.value, viewport?.cookieName],
  );

  return (
    <XDSServerContext.Provider value={value}>
      {children}
    </XDSServerContext.Provider>
  );
}

XDSServerProvider.displayName = 'XDSServerProvider';
