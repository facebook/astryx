// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuContext.tsx
 * @input Layer-scoped React context
 * @output Exports context and hook for compound-component menu coordination
 * @position Internal; used by DropdownMenu, DropdownMenuItem and the
 *   drill-in stack (useMenuDrillIn, DropdownMenuSubMenu)
 *
 * Provides menu state (close callback, size) to compound children.
 * Keyboard navigation is handled by useListFocus on the menu container —
 * items don't need to register themselves.
 */

import {createContext, use} from 'react';
import {createLayerScopedContext} from '../Layer/layerScopedContext';

/** Menu size, derived from the trigger button size. */
export type DropdownMenuSize = 'sm' | 'md' | 'lg';

/**
 * The drill-in view stack a menu root keeps for its sub-menus.
 * On a phone a sub-menu row pushes its view and the root shows that view in
 * place of its own rows; Back, Escape and ArrowLeft pop it. Sibling rows and
 * dividers need no knowledge of it: they are simply hidden while a view shows.
 */
export interface DropdownMenuDrillIn {
  /**
   * Whether a coarse pointer (a finger) drove the menu open — decided once,
   * when the menu opened. An `adaptive` sub-menu drills in exactly then.
   */
  isCoarsePointer: boolean;
  /** The pushed view ids, outermost first; the last one is the view shown. */
  viewStack: ReadonlyArray<string>;
  /** The element a shown view renders its rows into (a portal target). */
  host: HTMLElement | null;
  /** Show a sub-menu's view in place of the current rows. */
  push: (viewId: string) => void;
  /** Return to the rows the shown view replaced. */
  pop: () => void;
}

export interface DropdownMenuContextValue {
  /** Close the menu; keyboard dismissal returns focus to the trigger. */
  closeMenu: () => void;
  /** Menu size derived from button size */
  menuSize: DropdownMenuSize;
  /** The drill-in view stack; absent in a menu that cannot drill in. */
  drillIn?: DropdownMenuDrillIn;
  /**
   * The name of this menu level, when known as text: a drilled-in view's Back
   * row reads "Back to <this>".
   */
  menuLabel?: string;
}

export const DropdownMenuContext =
  createLayerScopedContext<DropdownMenuContextValue | null>(null);
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
