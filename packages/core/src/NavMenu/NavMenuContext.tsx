// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NavMenuContext.tsx
 * @input Uses React createContext/use
 * @output Exports NavHeadingCloseContext, NavHeadingMenuContext, and hooks
 * @position Context providers; consumed by NavHeadingMenu and NavHeadingMenuItem
 *
 * SYNC: When modified, update:
 * - /packages/core/src/NavMenu/index.ts
 */

import {createContext, use} from 'react';

export type NavHeadingMenuSize = 'sm' | 'md' | 'lg';

/**
 * Close callback provided by the nav heading popover.
 * NavHeadingMenu reads this to dismiss the popover on item selection
 * and on Escape.
 */
export interface NavHeadingCloseContextValue {
  closeMenu: () => void;
}

export const NavHeadingCloseContext =
  createContext<NavHeadingCloseContextValue | null>(null);
NavHeadingCloseContext.displayName = 'NavHeadingCloseContext';

export function useNavHeadingCloseContext(): NavHeadingCloseContextValue | null {
  return use(NavHeadingCloseContext);
}

/**
 * Size and close context provided by NavHeadingMenu to its children.
 * Items read this for consistent padding and dismiss-on-click.
 */
export interface NavHeadingMenuContextValue {
  size: NavHeadingMenuSize;
  closeMenu: () => void;
}

export const NavHeadingMenuContext =
  createContext<NavHeadingMenuContextValue | null>(null);
NavHeadingMenuContext.displayName = 'NavHeadingMenuContext';

export function useNavHeadingMenuContext(): NavHeadingMenuContextValue | null {
  return use(NavHeadingMenuContext);
}
