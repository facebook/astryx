/**
 * @file XDSCommandPalette.tsx
 * @input Uses React, XDSDialog, XDSLayout, CommandPaletteContext
 * @output Exports XDSCommandPalette root component and props
 * @position Core root component; dialog shell with slot-based layout
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/CommandPalette/README.md
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
import {XDSDialog} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {CommandPaletteContext} from './CommandPaletteContext';
import {defaultFilter} from './filter';
import type {CommandPaletteFilterFn} from './types';

export interface XDSCommandPaletteProps {
  /** Whether the command palette is open. */
  isOpen: boolean;

  /**
   * Called when the command palette visibility changes.
   * Called with `false` when the palette requests to close
   * (via Escape key or backdrop click).
   */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * The search input slot. Pass XDSCommandPaletteInput here.
   * Rendered in a header position with a divider below.
   */
  input: ReactNode;

  /**
   * The results list content. Typically XDSCommandPaletteList containing
   * XDSCommandPaletteItem and/or XDSCommandPaletteGroup children.
   */
  children: ReactNode;

  /**
   * The footer slot. Pass XDSCommandPaletteFooter here.
   * Rendered in a footer position with a divider above.
   * When omitted, no footer is rendered.
   */
  footer?: ReactNode;

  /** Controlled selected value. */
  value?: string;

  /** Called when the selected value changes. */
  onValueChange?: (value: string) => void;

  /**
   * Custom filter function. Return a score between 0 and 1.
   * When provided, replaces the built-in substring filter.
   */
  filter?: CommandPaletteFilterFn;

  /**
   * Whether built-in filtering is enabled.
   * Set to false when filtering is handled externally (e.g., server-side).
   * @default true
   */
  isFiltered?: boolean;

  /**
   * Accessible label for the command palette dialog.
   * @default 'Command palette'
   */
  label?: string;

  /**
   * Width of the command palette dialog.
   * Numbers are treated as pixels, strings are used as-is.
   * @default 640
   */
  width?: number | string;

  /**
   * Maximum height of the command palette dialog.
   * Numbers are treated as pixels, strings are used as-is.
   * @default 480
   */
  maxHeight?: number | string;
}

/**
 * Command palette root component.
 *
 * Uses a slot-based API: `input` and `footer` are named slots rendered
 * in fixed layout positions with automatic dividers. The list content
 * goes in `children`.
 *
 * Wraps XDSDialog + XDSLayout and provides context for state management
 * (search, filtering, keyboard navigation, selection).
 *
 * @compositionHint
 *   - `input` slot: XDSCommandPaletteInput
 *   - `children`: XDSCommandPaletteList (with XDSCommandPaletteItem / XDSCommandPaletteGroup)
 *   - `footer` slot: XDSCommandPaletteFooter
 *
 * @example
 * ```
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <XDSCommandPalette
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   input={<XDSCommandPaletteInput placeholder="Type a command..." />}
 *   footer={<XDSCommandPaletteFooter />}>
 *   <XDSCommandPaletteList>
 *     <XDSCommandPaletteItem value="home" onSelect={() => navigate('/')}>
 *       Go Home
 *     </XDSCommandPaletteItem>
 *   </XDSCommandPaletteList>
 * </XDSCommandPalette>
 * ```
 */
export function XDSCommandPalette({
  isOpen,
  onOpenChange,
  input,
  children,
  footer,
  value: controlledValue,
  onValueChange,
  filter = defaultFilter,
  isFiltered = true,
  label = 'Command palette',
  width = 640,
  maxHeight = 480,
}: XDSCommandPaletteProps) {
  const listId = useId();
  const [search, setSearch] = useState('');
  const [internalValue, setInternalValue] = useState('');
  const [highlightedValue, setHighlightedValue] = useState('');
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

  const handleClose = useCallback(() => {
    setSearch('');
    setHighlightedValue('');
    onOpenChange(false);
  }, [onOpenChange]);

  const contextValue = useMemo(
    () => ({
      search,
      setSearch,
      value,
      setValue,
      filter,
      isFiltered,
      listId,
      highlightedValue,
      setHighlightedValue,
      items: itemsRef.current,
      registerItem,
      selectItem,
      onClose: handleClose,
      isOpen,
    }),
    [
      search,
      value,
      setValue,
      filter,
      isFiltered,
      listId,
      highlightedValue,
      registerItem,
      selectItem,
      handleClose,
      isOpen,
    ],
  );

  return (
    <XDSDialog
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
        else onOpenChange(true);
      }}
      width={width}
      maxHeight={maxHeight}
      purpose="info"
      aria-label={label}>
      <CommandPaletteContext.Provider value={contextValue}>
        <XDSLayout
          defaultHasDividers
          header={
            <XDSLayoutHeader hasDivider padding={0}>
              {input}
            </XDSLayoutHeader>
          }
          content={
            <XDSLayoutContent padding={0}>{children}</XDSLayoutContent>
          }
          footer={
            footer != null ? (
              <XDSLayoutFooter hasDivider padding={0}>
                {footer}
              </XDSLayoutFooter>
            ) : undefined
          }
        />
      </CommandPaletteContext.Provider>
    </XDSDialog>
  );
}

XDSCommandPalette.displayName = 'XDSCommandPalette';
