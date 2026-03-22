'use client';

/**
 * @file XDSTopNavMobileContentContext.ts
 * @input React createContext, useContext
 * @output Exports XDSTopNavMobileContentContext and useXDSTopNavMobileContent
 * @position Internal context for passing additional drawer content to TopNav
 *
 * When both TopNav and SideNav exist, AppShell passes the SideNav content
 * to TopNav via this context. TopNav renders it below its own items in the
 * mobile drawer, producing a single combined drawer.
 */

import {createContext, useContext, type ReactNode} from 'react';

export const XDSTopNavMobileContentContext = createContext<ReactNode>(null);

/**
 * Read additional mobile drawer content provided by AppShell.
 * Returns null when no additional content is available.
 */
export function useXDSTopNavMobileContent(): ReactNode {
  return useContext(XDSTopNavMobileContentContext);
}
