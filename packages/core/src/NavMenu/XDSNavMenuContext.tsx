// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createContext, useContext} from 'react';

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

export function useXDSNavHeadingCloseContext(): XDSNavHeadingCloseContextValue | null {
  return useContext(XDSNavHeadingCloseContext);
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

export function useXDSNavHeadingMenuContext(): XDSNavHeadingMenuContextValue | null {
  return useContext(XDSNavHeadingMenuContext);
}
