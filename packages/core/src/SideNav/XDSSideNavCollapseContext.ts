'use client';

/**
 * @file XDSSideNavCollapseContext.ts
 * @input React createContext, useContext
 * @output Exports XDSSideNavCollapseContext and useXDSSideNavCollapse hook
 * @position Internal context for sidenav collapse state
 *
 * Provides collapse state to XDSSideNavCollapseButton and other
 * sidenav children. Set by XDSSideNav when isCollapsible is true.
 */

import {createContext, useContext} from 'react';

export interface SideNavCollapseState {
  /** Whether the sidenav is currently collapsed */
  isCollapsed: boolean;
  /** Toggle collapse state */
  toggle: () => void;
  /** Whether collapse is enabled */
  isCollapsible: boolean;
}

export const XDSSideNavCollapseContext = createContext<SideNavCollapseState>({
  isCollapsed: false,
  toggle: () => {},
  isCollapsible: false,
});

/**
 * Read the sidenav collapse state from context.
 * Returns { isCollapsed, toggle, isCollapsible }.
 * When used outside a sidenav with isCollapsible, isCollapsible is false.
 */
export function useXDSSideNavCollapse(): SideNavCollapseState {
  return useContext(XDSSideNavCollapseContext);
}
