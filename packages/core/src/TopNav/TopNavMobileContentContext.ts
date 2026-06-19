// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavMobileContentContext.ts
 * @input React createContext, use
 * @output Exports TopNavMobileContentContext and useTopNavMobileContent
 * @position Internal context for passing additional drawer content to TopNav
 *
 * When both TopNav and SideNav exist, AppShell passes the SideNav content
 * to TopNav via this context. TopNav renders it below its own items in the
 * mobile drawer, producing a single combined drawer.
 */

import {createContext, use, type ReactNode} from 'react';

export const TopNavMobileContentContext = createContext<ReactNode>(null);
TopNavMobileContentContext.displayName = 'TopNavMobileContentContext';

/**
 * Read additional mobile drawer content provided by AppShell.
 * Returns null when no additional content is available.
 */
export function useTopNavMobileContent(): ReactNode {
  return use(TopNavMobileContentContext);
}
