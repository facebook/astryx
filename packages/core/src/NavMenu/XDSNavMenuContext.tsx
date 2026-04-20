'use client';

/**
 * @file XDSNavMenuContext.tsx
 * @output Exports context and hook for nav heading menu coordination
 * @position Internal; used by nav heading components and XDSNavMenuItem
 *
 * Provides a close callback so menu items can dismiss the popover on click.
 */

import {createContext, useContext} from 'react';

export interface XDSNavMenuContextValue {
  /** Close the menu popover */
  closeMenu: () => void;
}

export const XDSNavMenuContext =
  createContext<XDSNavMenuContextValue | null>(null);

/**
 * Hook for nav menu items to access menu state.
 * Returns null outside of a nav heading menu.
 */
export function useXDSNavMenuContext(): XDSNavMenuContextValue | null {
  return useContext(XDSNavMenuContext);
}
