/**
 * @file XDSCommandPalette.tsx
 * @input Uses React, StyleX, XDSDialog, CommandPaletteContext
 * @output Exports XDSCommandPalette root component and props
 * @position Core root component; dialog shell with optional state management
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
import {XDSDialog} from '@xds/core/Dialog';
import type {XDSBaseProps} from '@xds/core/XDSBaseProps';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import {CommandPaletteContext} from './CommandPaletteContext';
import {defaultFilter} from './filter';
import type {CommandPaletteFilterFn} from './types';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
});

// =============================================================================
// Module Augmentation - Register CommandPalette's style surfaces
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    commandPalette?: {
      root?: import('../theme/types').StyleXStyles;
    };
  }
}

export interface XDSCommandPaletteProps extends XDSBaseProps<HTMLDivElement> {
  /**
   * Ref forwarded to the root wrapper element inside the dialog.
   */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Whether the command palette is open.
   */
  isOpen: boolean;

  /**
   * Called when the command palette visibility changes.
   * Called with `false` when the palette requests to close
   * (via Escape key or backdrop click).
   */
  onOpenChange: (isOpen: boolean) => void;

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

  /**
   * Composable content slots.
   * Typically includes XDSCommandPaletteInput, XDSCommandPaletteList, and XDSCommandPaletteFooter.
   *
   * @example
   * ```
   * <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
   *   <XDSCommandPaletteInput placeholder="Search commands..." />
   *   <XDSCommandPaletteList>
   *     <XDSCommandPaletteItem value="home">Go Home</XDSCommandPaletteItem>
   *   </XDSCommandPaletteList>
   *   <XDSCommandPaletteFooter />
   * </XDSCommandPalette>
   * ```
   */
  children: ReactNode;
}

/**
 * Command palette root component.
 *
 * Wraps XDSDialog with command palette defaults and provides context
 * for state management (search, filtering, keyboard navigation, selection).
 *
 * Sub-components (Input, List, Item, Group, Footer) can be used as
 * controlled components via props, or they can consume the context
 * for automatic state wiring.
 *
 * @compositionHint Compose with XDSCommandPaletteInput (search),
 *   XDSCommandPaletteList (scrollable items), and XDSCommandPaletteFooter
 *   (keyboard hints) as children.
 *
 * @example
 * ```
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
 *   <XDSCommandPaletteInput placeholder="Type a command..." />
 *   <XDSCommandPaletteList>
 *     <XDSCommandPaletteItem value="home" onSelect={() => navigate('/')}>
 *       Go Home
 *     </XDSCommandPaletteItem>
 *   </XDSCommandPaletteList>
 *   <XDSCommandPaletteFooter />
 * </XDSCommandPalette>
 * ```
 */
export function XDSCommandPalette({
  isOpen,
  onOpenChange,
  value: controlledValue,
  onValueChange,
  filter = defaultFilter,
  isFiltered = true,
  label = 'Command palette',
  width = 640,
  maxHeight = 480,
  children,
  ref,
  xstyle,
  className,
  style,
  ...props
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

  // Reset search and highlight when closing
  const handleClose = useCallback(() => {
    setSearch('');
    setHighlightedIndex(0);
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
      highlightedIndex,
      setHighlightedIndex,
      items: itemsRef.current,
      registerItem,
      selectItem,
      onClose: handleClose,
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
      handleClose,
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
        <div
          ref={ref}
          {...mergeProps(
            xdsClassName('command-palette'),
            stylex.props(styles.wrapper, xstyle),
            className,
            style,
          )}
          {...props}>
          {children}
        </div>
      </CommandPaletteContext.Provider>
    </XDSDialog>
  );
}

XDSCommandPalette.displayName = 'XDSCommandPalette';
