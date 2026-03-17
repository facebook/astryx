/**
 * @file XDSSideNavCollapseContext.tsx
 * @input React createContext, useContext
 * @output Exports XDSSideNavCollapseContext, XDSSideNavCollapseProvider, useXDSSideNavCollapse
 * @position Internal context for sidenav collapse state
 *
 * Provides collapse state to XDSSideNavCollapseButton, XDSSideNavItem,
 * and other sidenav children. Set by XDSSideNav when isCollapsible is true.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SideNav/index.ts
 * - /packages/core/src/SideNav/XDSSideNavItem.tsx
 * - /packages/core/src/SideNav/XDSSideNavCollapseButton.tsx
 */

'use client';

import {createContext, useContext, type ReactNode} from 'react';

// =============================================================================
// Types
// =============================================================================

export interface SideNavCollapseState {
  /** Whether the sidenav is currently collapsed */
  isCollapsed: boolean;
  /** Toggle collapse state */
  toggle: () => void;
  /** Whether collapse is enabled */
  isCollapsible: boolean;
}

// =============================================================================
// Context
// =============================================================================

export const XDSSideNavCollapseContext = createContext<SideNavCollapseState>({
  isCollapsed: false,
  toggle: () => {},
  isCollapsible: false,
});

// =============================================================================
// Provider
// =============================================================================

interface XDSSideNavCollapseProviderProps {
  /**
   * Collapse state to provide to descendant items.
   */
  value: SideNavCollapseState;
  children: ReactNode;
}

/**
 * Provides SideNav collapsed state to descendant items.
 *
 * Used internally by XDSSideNav when isCollapsible is true.
 * Also used by XDSSideNavItem to wrap popover children with
 * isCollapsed: false so nested items render in expanded form.
 *
 * @example
 * ```
 * <XDSSideNavCollapseProvider value={{isCollapsed: false, toggle: () => {}, isCollapsible: false}}>
 *   {children}
 * </XDSSideNavCollapseProvider>
 * ```
 */
export function XDSSideNavCollapseProvider({
  value,
  children,
}: XDSSideNavCollapseProviderProps) {
  return (
    <XDSSideNavCollapseContext.Provider value={value}>
      {children}
    </XDSSideNavCollapseContext.Provider>
  );
}

XDSSideNavCollapseProvider.displayName = 'XDSSideNavCollapseProvider';

// =============================================================================
// Hook
// =============================================================================

/**
 * Read the sidenav collapse state from context.
 * Returns { isCollapsed, toggle, isCollapsible }.
 * When used outside a sidenav with isCollapsible, isCollapsible is false.
 */
export function useXDSSideNavCollapse(): SideNavCollapseState {
  return useContext(XDSSideNavCollapseContext);
}
