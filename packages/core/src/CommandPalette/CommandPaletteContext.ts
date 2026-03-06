/**
 * @file CommandPaletteContext.ts
 * @input Uses React createContext
 * @output Exports CommandPaletteContext for internal state sharing
 * @position Internal context; consumed by composable sub-components
 */

'use client';

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
  /** Index of the currently highlighted item. */
  highlightedIndex: number;
  /** Update highlighted index. */
  setHighlightedIndex: (index: number) => void;
  /** All registered item values (for keyboard navigation). */
  items: Array<{value: string; isDisabled?: boolean}>;
  /** Register an item. Returns unregister function. */
  registerItem: (value: string, isDisabled?: boolean) => () => void;
  /** Select an item by value. */
  selectItem: (value: string) => void;
  /** Close the palette. */
  onClose: () => void;
}

export const CommandPaletteContext =
  createContext<CommandPaletteContextValue | null>(null);

export function useCommandPaletteContext(): CommandPaletteContextValue {
  const context = useContext(CommandPaletteContext);
  if (context == null) {
    throw new Error(
      'CommandPalette compound components must be used within <XDSCommandPalette>',
    );
  }
  return context;
}
