// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSSideNavCollapseContext.ts
 * @input React createContext, use
 * @output Exports XDSSideNavCollapseContext and useXDSSideNavCollapse hook
 * @position Internal context for sidenav collapse state
 *
 * Provides collapse state to XDSSideNavCollapseButton and other
 * sidenav children. Set by XDSSideNav when isCollapsible is true.
 * Also provides a small imperative handle for ref-based collapse buttons
 * rendered outside the XDSSideNav tree.
 */

import {createContext, use} from 'react';

export interface XDSSideNavCollapseState {
  /** Whether the sidenav is currently collapsed */
  isCollapsed: boolean;
  /** Toggle collapse state */
  toggle: () => void;
  /** Whether collapse is enabled */
  isCollapsible: boolean;
}

/**
 * @deprecated Use XDSSideNavCollapseState instead.
 */
export type SideNavCollapseState = XDSSideNavCollapseState;

export interface XDSSideNavImperativeCollapseHandle {
  getCollapseState: () => XDSSideNavCollapseState | null;
}

export const XDSSideNavCollapseContext = createContext<XDSSideNavCollapseState>(
  {
    isCollapsed: false,
    toggle: () => {},
    isCollapsible: false,
  },
);
XDSSideNavCollapseContext.displayName = 'XDSSideNavCollapseContext';

/**
 * Read the sidenav collapse state from context.
 * Returns { isCollapsed, toggle, isCollapsible }.
 * When used outside a sidenav with isCollapsible, isCollapsible is false.
 */
export function useXDSSideNavCollapse(): XDSSideNavCollapseState {
  return use(XDSSideNavCollapseContext);
}
