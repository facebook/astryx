/**
 * @file CommandPaletteContext.ts
 * @input Uses React createContext
 * @output Exports CommandPaletteContext and useCommandPaletteContext hook
 * @position Internal context; consumed by composable sub-components
 */

import {createContext, useContext} from 'react';
import type {CommandPaletteFilterFn} from './types';

export interface CommandPaletteContextValue {
  /** Current search query. */
  search: string;
  /** Update the search query. */
  setSearch: (search: string) => void;
  /** Currently selected value. */
  value: string;
  /** Update the selected value. */
  setValue: (value: string) => void;
  /** Filter function. */
  filter: CommandPaletteFilterFn;
  /** Whether built-in filtering is enabled. */
  isFiltered: boolean;
  /** Unique ID prefix for ARIA. */
  listId: string;
  /** Value of the currently highlighted item (empty string = none). */
  highlightedValue: string;
  /** Update highlighted value. */
  setHighlightedValue: (value: string) => void;
  /** All registered items in mount order. */
  items: Array<{value: string; isDisabled?: boolean}>;
  /** Register an item. Returns unregister function. */
  registerItem: (value: string, isDisabled?: boolean) => () => void;
  /** Select an item by value. */
  selectItem: (value: string) => void;
  /** Close the palette. */
  onClose: () => void;
  /** Whether the palette is open (for aria-expanded). */
  isOpen: boolean;
}

export const CommandPaletteContext =
  createContext<CommandPaletteContextValue | null>(null);

/**
 * Access the command palette context.
 * Returns null when used outside a CommandPalette (for standalone usage).
 */
export function useCommandPaletteContext(): CommandPaletteContextValue | null {
  return useContext(CommandPaletteContext);
}
