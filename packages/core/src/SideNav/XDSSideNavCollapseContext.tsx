/**
 * @file XDSSideNavCollapseContext.tsx
 * @input React createContext, useContext
 * @output Exports XDSSideNavCollapseContext, XDSSideNavCollapseProvider, useXDSSideNavCollapse
 * @position Internal context for sidenav collapse state
 *
 * Provides collapse state to XDSSideNavCollapseButton, XDSSideNavItem,
 * and other sidenav children. Set by XDSSideNav when isCollapsible is true.
 */

'use client';

import {createContext, useContext, type ReactNode} from 'react';

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
 * Provides SideNav collapsed state to descendant items.
 *
 * Used internally by XDSSideNav when isCollapsible is true.
 * Also used by XDSSideNavItem to wrap popover children with
 * isCollapsed: false so nested items render in expanded form.
 */
export function XDSSideNavCollapseProvider({
  value,
  children,
}: {
  value: SideNavCollapseState;
  children: ReactNode;
}) {
  return (
    <XDSSideNavCollapseContext.Provider value={value}>
      {children}
    </XDSSideNavCollapseContext.Provider>
  );
}

XDSSideNavCollapseProvider.displayName = 'XDSSideNavCollapseProvider';

/**
 * Read the sidenav collapse state from context.
 * Returns { isCollapsed, toggle, isCollapsible }.
 * When used outside a sidenav with isCollapsible, isCollapsible is false.
 */
export function useXDSSideNavCollapse(): SideNavCollapseState {
  return useContext(XDSSideNavCollapseContext);
}
