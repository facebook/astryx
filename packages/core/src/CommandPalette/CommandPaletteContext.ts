// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
/**
 * @file CommandPaletteContext.ts
 * @input Uses React createContext
 * @output Exports CommandPaletteContext and useCommandPaletteContext hook
 * @position Internal context; consumed by composable sub-components
 */

import {createContext, use} from 'react';
import type {SearchableItem} from '../Typeahead';
import type {SelectorOptionData} from '../Selector';

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
  /**
   * Hover-aware highlight from useCombobox: highlights the item without
   * scrolling, so a stationary pointer cannot re-highlight and auto-scroll in
   * a runaway loop (#6077). Keyboard paths keep the raw setter inside
   * useCombobox, which owns scrollIntoView.
   */
  onItemMouseEnter: (item: SelectorOptionData, index: number) => void;
  /** Get the DOM id for an item by its flat index. */
  getItemId: (index: number) => string;
  /** Flat list of selectable items in DOM order (after grouping/filtering). */
  selectableItems: {value: string; label?: string; disabled?: boolean}[];
  /** The search result items (typed). */
  searchResults: SearchableItem[];
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
CommandPaletteContext.displayName = 'CommandPaletteContext';

/**
 * Access the command palette context.
 * Returns null when used outside a CommandPalette (for standalone usage).
 */
export function useCommandPaletteContext(): CommandPaletteContextValue | null {
  return use(CommandPaletteContext);
}
