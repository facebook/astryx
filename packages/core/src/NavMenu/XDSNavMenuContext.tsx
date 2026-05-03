'use client';

import {createContext, useContext} from 'react';

export type XDSNavHeadingMenuSize = 'sm' | 'md' | 'lg';

/**
 * Close callback provided by the nav heading popover.
 * XDSNavHeadingMenu reads this to dismiss the popover on item selection
 * and on Escape.
 */
export interface XDSNavMenuCloseContextValue {
  closeMenu: () => void;
}

export const XDSNavMenuCloseContext =
  createContext<XDSNavMenuCloseContextValue | null>(null);

export function useXDSNavMenuCloseContext(): XDSNavMenuCloseContextValue | null {
  return useContext(XDSNavMenuCloseContext);
}

/**
 * Size context provided by XDSNavHeadingMenu to its children.
 * Items read this for consistent padding.
 */
export interface XDSNavMenuContextValue {
  size: XDSNavHeadingMenuSize;
  closeMenu: () => void;
}

export const XDSNavMenuContext = createContext<XDSNavMenuContextValue | null>(
  null,
);

export function useXDSNavMenuContext(): XDSNavMenuContextValue | null {
  return useContext(XDSNavMenuContext);
}
