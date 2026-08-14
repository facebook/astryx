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

// =============================================================================
// Radio group coordination
// =============================================================================

export interface DropdownMenuRadioGroupContextValue {
  /** The currently selected value in the group. */
  value: string | undefined;
  /** Select a value. Called by a DropdownMenuRadioItem on activation. */
  onChange: (value: string) => void;
  /** Whether selecting an item should close the menu. @default true */
  hasCloseOnSelect: boolean;
}

export const DropdownMenuRadioGroupContext =
  createContext<DropdownMenuRadioGroupContextValue | null>(null);
DropdownMenuRadioGroupContext.displayName = 'DropdownMenuRadioGroupContext';

/**
 * Read the enclosing radio group's selection state.
 * Returns null when used outside a DropdownMenuRadioGroup.
 */
export function useDropdownMenuRadioGroupContext(): DropdownMenuRadioGroupContextValue | null {
  return use(DropdownMenuRadioGroupContext);
}
