'use client';

/**
 * @file XDSTopNavRenderContext.ts
 * @input React createContext, useContext
 * @output Exports XDSTopNavRenderContext and useXDSTopNavRenderMode hook
 * @position Internal context for controlling TopNav rendering mode
 *
 * When AppShell renders TopNav in multiple locations (top bar, mobile drawer),
 * this context tells TopNav and its children which parts to render:
 * - 'default': full top bar (desktop)
 * - 'mobile-bar': heading + endContent + toggle, hide nav items (mobile top bar)
 * - 'drawer': nav items as vertical list elements (mobile drawer)
 */

import {createContext, useContext} from 'react';

export type XDSTopNavRenderMode = 'default' | 'mobile-bar' | 'drawer';

export const XDSTopNavRenderContext =
  createContext<XDSTopNavRenderMode>('default');

/**
 * Read the current TopNav render mode from context.
 */
export function useXDSTopNavRenderMode(): XDSTopNavRenderMode {
  return useContext(XDSTopNavRenderContext);
}
