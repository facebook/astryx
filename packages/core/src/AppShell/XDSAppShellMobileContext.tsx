'use client';

/**
 * @file XDSAppShellMobileContext.tsx
 * @input Uses React createContext, useContext
 * @output Exports XDSAppShellMobileContext, useXDSAppShellMobile
 * @position Internal context for mobile nav state; consumed by XDSMobileNavToggle, XDSTopNav (future)
 *
 * Provides mobile navigation state to any component in the AppShell tree.
 * Used by XDSMobileNavToggle to open/close the drawer and by TopNav (future)
 * to adapt rendering based on mobile context.
 */


import {createContext, useContext} from 'react';

export interface XDSAppShellMobileContextValue {
  /** Whether the viewport is below the mobile breakpoint */
  isMobile: boolean;
  /** Whether the mobile nav drawer is currently open */
  isMobileNavOpen: boolean;
  /** Toggle the mobile nav drawer open/closed */
  toggleMobileNav: () => void;
  /** Open the mobile nav drawer */
  openMobileNav: () => void;
  /** Close the mobile nav drawer */
  closeMobileNav: () => void;
  /** Whether mobile nav is enabled at all */
  isMobileNavEnabled: boolean;
}

const defaultValue: XDSAppShellMobileContextValue = {
  isMobile: false,
  isMobileNavOpen: false,
  toggleMobileNav: () => {},
  openMobileNav: () => {},
  closeMobileNav: () => {},
  isMobileNavEnabled: false,
};

export const XDSAppShellMobileContext =
  createContext<XDSAppShellMobileContextValue>(defaultValue);

/**
 * Hook to access mobile nav state from anywhere in the AppShell tree.
 */
export function useXDSAppShellMobile(): XDSAppShellMobileContextValue {
  return useContext(XDSAppShellMobileContext);
}
