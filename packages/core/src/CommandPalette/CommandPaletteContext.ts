'use client';
/**
 * @file CommandPaletteContext.ts
 * @input Uses React createContext
 * @output Exports CommandPaletteContext and useCommandPaletteContext hook
 * @position Internal context; consumed by composable sub-components
 */

import {createContext, useContext} from 'react';
import type {XDSSearchableItem} from '../Typeahead';

export interface CommandPaletteContextValue {
  /** Current search query. */
  search: string;
  /** Update the search query. */
  setSearch: (search: string) => void;
  /** Currently selected value. */
  value: string;
  /** Update the selected value. */
  setValue: (value: string) => void;
  /** Unique ID prefix for ARIA (listbox id). */
  listId: string;
  /** Index-based highlight from useCombobox. -1 = none. */
  highlightedIndex: number;
  /** Update highlighted index. */
  setHighlightedIndex: (index: number) => void;
  /** Get the DOM id for an item by its flat index. */
  getItemId: (index: number) => string;
  /** Flat list of selectable items in DOM order (after grouping/filtering). */
  selectableItems: Array<{value: string; label?: string; disabled?: boolean}>;
  /** The search result items (typed). */
  searchResults: XDSSearchableItem[];
  /** Select an item by value and close. */
  selectItem: (value: string) => void;
  /** Keyboard handler from useCombobox — attach to the input. */
  onKeyDown: (e: React.KeyboardEvent) => void;
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
