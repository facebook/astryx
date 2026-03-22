'use client';

/**
 * @file XDSServerContext.ts
 * @input React createContext
 * @output Exports XDSServerContext, useXDSServer, XDSServerContextValue
 * @position Internal context; consumed by useServerViewport
 */

import {createContext, useContext} from 'react';

export interface XDSViewportHint {
  /** Viewport width from the server (e.g. from a cookie). */
  value?: number;
  /** Cookie name. XDS writes viewport width to this cookie on the client. */
  cookieName?: string;
}

export interface XDSServerContextValue {
  viewport?: XDSViewportHint;
}

export const XDSServerContext = createContext<XDSServerContextValue | null>(
  null,
);

/**
 * Read server hints from the nearest XDSServerProvider.
 * Returns null if no provider is present (client-only mode).
 */
export function useXDSServer(): XDSServerContextValue | null {
  return useContext(XDSServerContext);
}
