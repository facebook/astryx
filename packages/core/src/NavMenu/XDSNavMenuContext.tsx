// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createContext, use} from 'react';

export type XDSNavHeadingMenuSize = 'sm' | 'md' | 'lg';

/**
 * Close callback provided by the nav heading popover.
 * XDSNavHeadingMenu reads this to dismiss the popover on item selection
 * and on Escape.
 */
export interface XDSNavHeadingCloseContextValue {
  closeMenu: () => void;
}

export const XDSNavHeadingCloseContext =
  createContext<XDSNavHeadingCloseContextValue | null>(null);
XDSNavHeadingCloseContext.displayName = 'XDSNavHeadingCloseContext';

export function useXDSNavHeadingCloseContext(): XDSNavHeadingCloseContextValue | null {
  return use(XDSNavHeadingCloseContext);
}

/**
 * Size and close context provided by XDSNavHeadingMenu to its children.
 * Items read this for consistent padding and dismiss-on-click.
 */
export interface XDSNavHeadingMenuContextValue {
  size: XDSNavHeadingMenuSize;
  closeMenu: () => void;
}

export const XDSNavHeadingMenuContext =
  createContext<XDSNavHeadingMenuContextValue | null>(null);
XDSNavHeadingMenuContext.displayName = 'XDSNavHeadingMenuContext';

export function useXDSNavHeadingMenuContext(): XDSNavHeadingMenuContextValue | null {
  return use(XDSNavHeadingMenuContext);
}
