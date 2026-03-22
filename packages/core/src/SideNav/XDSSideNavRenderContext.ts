'use client';

/**
 * @file XDSSideNavRenderContext.ts
 * @input React createContext, useContext
 * @output Exports XDSSideNavRenderContext and useXDSSideNavRenderMode hook
 * @position Internal context for controlling SideNav rendering mode
 *
 * When AppShell renders the SideNav in multiple locations (inline, top bar,
 * mobile drawer), this context tells SideNav which parts to render:
 * - 'default': full sidebar (desktop inline)
 * - 'topbar': heading + footerIcons only, laid out horizontally (mobile top bar)
 * - 'drawer': children only, skip heading + footerIcons (mobile drawer)
 */

import {createContext, useContext} from 'react';

export type XDSSideNavRenderMode =
  | 'default'
  | 'topbar'
  | 'drawer'
  | 'drawer-content';

export const XDSSideNavRenderContext =
  createContext<XDSSideNavRenderMode>('default');

/**
 * Read the current SideNav render mode from context.
 */
export function useXDSSideNavRenderMode(): XDSSideNavRenderMode {
  return useContext(XDSSideNavRenderContext);
}
