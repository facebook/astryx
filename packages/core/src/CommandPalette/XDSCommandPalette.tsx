/**
 * @file XDSCommandPalette.tsx
 * @input Uses React, StyleX, XDSDialog, CommandPaletteContext
 * @output Exports XDSCommandPalette root component and props
 * @position Core root component; wraps composable sub-components
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 */

'use client';

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSDialog} from '../Dialog';
import {CommandPaletteContext} from './CommandPaletteContext';
import {defaultFilter} from './filter';
import type {CommandPaletteFilterFn} from './types';

const styles = stylex.create({
  dialog: {
    // Override dialog defaults for command palette appearance
    overflow: 'hidden',
  },
});

export interface XDSCommandPaletteProps {
  /**
   * Whether the command palette is shown.
   * Matches XDSDialog convention.
   */
  isShown: boolean;

  /**
   * Callback fired when the command palette visibility changes.
   * Called with `false` when the palette requests to close.
   * Matches XDSDialog convention.
   */
  onOpenChange: (isOpen: boolean) => unknown;

  /**
   * Controlled selected value.
   */
  value?: string;

  /**
   * Called when the selected value changes.
   */
  onValueChange?: (value: string) => void;

  /**
   * Custom filter function. Return a score between 0 and 1.
   * When provided, replaces the built-in substring filter.
   */
  filter?: CommandPaletteFilterFn;

  /**
   * Disable built-in filtering entirely.
   * Useful when filtering is handled externally (e.g., server-side search).
   * @default true
   */
  isFiltered?: boolean;

  /**
   * Accessible label for the command palette.
   * @default "Command palette"
   */
  label?: string;

  /**
   * Width of the command palette dialog.
   * @default 640
   */
  width?: number | string;

  /**
   * Maximum height of the command palette dialog.
   * @default 480
   */
  maxHeight?: number | string;

  /**
   * StyleX overrides for the dialog container.
   */
  xstyle?: StyleXStyles;

  /**
   * Composable content: XDSCommandPaletteInput, XDSCommandPaletteList, etc.
   *
   * @example
   * ```
   * <XDSCommandPalette isShown={isShown} onOpenChange={(open) => setIsShown(open)}>
   *   <XDSCommandPaletteInput placeholder="Search commands..." />
   *   <XDSCommandPaletteList>
   *     <XDSCommandPaletteItem value="home" onSelect={() => navigate("/")}>
   *       Go Home
   *     </XDSCommandPaletteItem>
   *   </XDSCommandPaletteList>
   * </XDSCommandPalette>
   * ```
   */
  children: ReactNode;
}

/**
 * Command palette root component.
 *
 * Composes with XDSDialog for modal behavior and provides context
 * for composable sub-components (Input, List, Item, Group, etc.).
 *
 * Supports two usage patterns:
 * 1. Composable (Layer 1): Render sub-components directly as children
 * 2. Provider (Layer 2): Use XDSCommandPaletteProvider for distributed command registration
 */
export function XDSCommandPalette({
  isShown,
  onOpenChange,
  value: controlledValue,
  onValueChange,
  filter = defaultFilter,
  isFiltered = true,
  label = 'Command palette',
  width = 640,
  maxHeight = 480,
  xstyle,
  children,
}: XDSCommandPaletteProps) {
  const listId = useId();
  const [search, setSearch] = useState('');
  const [internalValue, setInternalValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const itemsRef = useRef<Array<{value: string; isDisabled?: boolean}>>([]);

  const value = controlledValue ?? internalValue;

  const setValue = useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [controlledValue, onValueChange],
  );

  const registerItem = useCallback(
    (itemValue: string, isDisabled?: boolean) => {
      itemsRef.current = [...itemsRef.current, {value: itemValue, isDisabled}];
      return () => {
        itemsRef.current = itemsRef.current.filter(
          item => item.value !== itemValue,
        );
      };
    },
    [],
  );

  const selectItem = useCallback(
    (itemValue: string) => {
      setValue(itemValue);
    },
    [setValue],
  );

  // Reset search and highlight when closing, then forward to consumer
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setSearch('');
        setHighlightedIndex(0);
      }
      onOpenChange(open);
    },
    [onOpenChange],
  );

  const contextValue = useMemo(
    () => ({
      search,
      setSearch,
      value,
      setValue,
      filter,
      isFiltered,
      listId,
      highlightedIndex,
      setHighlightedIndex,
      items: itemsRef.current,
      registerItem,
      selectItem,
      onClose: () => handleOpenChange(false),
    }),
    [
      search,
      value,
      setValue,
      filter,
      isFiltered,
      listId,
      highlightedIndex,
      registerItem,
      selectItem,
      handleOpenChange,
    ],
  );

  return (
    <XDSDialog
      isShown={isShown}
      onOpenChange={handleOpenChange}
      width={width}
      maxHeight={maxHeight}
      purpose="info"
      aria-label={label}
      {...stylex.props(styles.dialog, xstyle)}>
      <CommandPaletteContext.Provider value={contextValue}>
        {children}
      </CommandPaletteContext.Provider>
    </XDSDialog>
  );
}

XDSCommandPalette.displayName = 'XDSCommandPalette';
