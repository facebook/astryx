// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuContext.tsx
 * @output Exports context and hook for compound-component menu coordination
 * @position Internal; used by DropdownMenu and DropdownMenuItem
 *
 * Provides menu state (close callback, size) to compound children.
 * Keyboard navigation is handled by useListFocus on the menu container —
 * items don't need to register themselves.
 */

import {createContext, use} from 'react';

/** Menu size, derived from the trigger button size. */
export type DropdownMenuSize = 'sm' | 'md' | 'lg';

export interface DropdownMenuContextValue {
  /** Close the menu and return focus to trigger */
  closeMenu: () => void;
  /** Menu size derived from button size */
  menuSize: DropdownMenuSize;
}

export const DropdownMenuContext =
  createContext<DropdownMenuContextValue | null>(null);
DropdownMenuContext.displayName = 'DropdownMenuContext';

/**
 * Hook for compound menu items to access menu state.
 * Returns null outside of a DropdownMenu.
 */
export function useDropdownMenuContext(): DropdownMenuContextValue | null {
  return use(DropdownMenuContext);
}
