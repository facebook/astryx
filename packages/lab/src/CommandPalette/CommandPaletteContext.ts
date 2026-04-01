/**
 * @file CommandPaletteContext.ts
 * @input Uses React createContext
 * @output Exports CommandPaletteContext and useCommandPaletteContext hook
 * @position Internal context; consumed by composable sub-components
 */

import {createContext, useContext} from 'react';

export interface CommandPaletteContextValue {
  /** Current search query. */
  search: string;
  /** Update the search query. */
  setSearch: (search: string) => void;
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
  /** Close the palette. */
  onClose: () => void;
  /** Whether the palette is open (for aria-expanded). */
  isOpen: boolean;
  /** Whether an async search is in flight. */
  isBusy: boolean;
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
