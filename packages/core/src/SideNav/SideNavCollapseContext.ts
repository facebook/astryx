// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavCollapseContext.ts
 * @input React createContext, use
 * @output Exports SideNavCollapseContext and useSideNavCollapse hook
 * @position Internal context for sidenav collapse state
 *
 * Provides collapse state to SideNavCollapseButton and other
 * sidenav children. Set by SideNav when isCollapsible is true.
 * Also provides a small imperative handle for ref-based collapse buttons
 * rendered outside the SideNav tree.
 */

import {createContext, use} from 'react';

export interface SideNavCollapseState {
  /** Whether the sidenav is currently collapsed */
  isCollapsed: boolean;
  /** Toggle collapse state */
  toggle: () => void;
  /** Whether collapse is enabled */
  isCollapsible: boolean;
}


export interface SideNavImperativeCollapseHandle {
  getCollapseState: () => SideNavCollapseState | null;
}

export const SideNavCollapseContext = createContext<SideNavCollapseState>(
  {
    isCollapsed: false,
    toggle: () => {},
    isCollapsible: false,
  },
);
SideNavCollapseContext.displayName = 'SideNavCollapseContext';

/**
 * Read the sidenav collapse state from context.
 * Returns { isCollapsed, toggle, isCollapsible }.
 * When used outside a sidenav with isCollapsible, isCollapsible is false.
 */
export function useSideNavCollapse(): SideNavCollapseState {
  return use(SideNavCollapseContext);
}
