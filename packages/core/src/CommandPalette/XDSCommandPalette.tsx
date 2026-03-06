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

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSDialog} from '../Dialog';
import {CommandPaletteContext} from './CommandPaletteContext';
import {defaultFilter} from './filter';
import type {CommandPaletteFilterFn} from './types';

const styles = stylex.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
  },
});

export interface XDSCommandPaletteProps {
  /**
   * Whether the command palette is shown.
   * Matches XDSDialog convention.
   */
  isShown: boolean;

  /**
   * Called when the palette requests to close.
   * Matches XDSDialog convention.
   */
  onHide: () => void;

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
   * Composable content: XDSCommandPaletteInput, XDSCommandPaletteList, etc.
   *
   * @example
   * ```
   * <XDSCommandPalette isShown={isShown} onHide={() => setIsShown(false)}>
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
 * Composes with XDSDialog for modal behavior (top layer, backdrop,
 * focus trapping, dismiss on Escape/backdrop click) and provides
 * context for composable sub-components (Input, List, Item, Group).
 *
 * Positioned at top-center of the viewport, matching the standard
 * command palette convention (Cmd+K in VS Code, Linear, etc.).
 */
export function XDSCommandPalette({
  isShown,
  onHide,
  value: controlledValue,
  onValueChange,
  filter = defaultFilter,
  isFiltered = true,
  label = 'Command palette',
  width = 640,
  maxHeight = 480,
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

  // Reset search and highlight when opening/closing
  const handleHide = useCallback(() => {
    setSearch('');
    setHighlightedIndex(0);
    onHide();
  }, [onHide]);

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
      onHide: handleHide,
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
      handleHide,
    ],
  );

  return (
    <XDSDialog
      isShown={isShown}
      onHide={handleHide}
      width={width}
      maxHeight={maxHeight}
      position={{top: '15vh'}}
      purpose="info"
      aria-label={label}>
      <CommandPaletteContext.Provider value={contextValue}>
        <div {...stylex.props(styles.content)}>{children}</div>
      </CommandPaletteContext.Provider>
    </XDSDialog>
  );
}

XDSCommandPalette.displayName = 'XDSCommandPalette';
