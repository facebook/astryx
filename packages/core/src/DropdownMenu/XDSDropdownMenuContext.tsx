// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSDropdownMenuContext.tsx
 * @output Exports context and hook for compound-component menu coordination
 * @position Internal; used by XDSDropdownMenu and XDSDropdownMenuItem
 *
 * Provides menu state (close callback, size) to compound children.
 * Keyboard navigation is handled by useListFocus on the menu container —
 * items don't need to register themselves.
 */

import {createContext, useContext} from 'react';

export interface XDSDropdownMenuContextValue {
  /** Close the menu and return focus to trigger */
  closeMenu: () => void;
  /** Menu size derived from button size */
  menuSize: 'sm' | 'md' | 'lg';
}

export const XDSDropdownMenuContext =
  createContext<XDSDropdownMenuContextValue | null>(null);

/**
 * Hook for compound menu items to access menu state.
 * Returns null outside of a DropdownMenu.
 */
export function useXDSDropdownMenuContext(): XDSDropdownMenuContextValue | null {
  return useContext(XDSDropdownMenuContext);
}
