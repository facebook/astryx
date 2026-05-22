// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useListFocus.ts
 * @input Uses React useCallback, useRef
 * @output Exports useListFocus hook for linear list keyboard navigation
 * @position Core hook; used by XDSTabMenu for dropdown menu navigation, XDSToolbar for roving tabindex
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {useCallback, useRef} from 'react';

/**
 * Configuration for list focus behavior
 */
export interface UseListFocusOptions {
  /**
   * Selector for focusable items within the list.
   * @default '[role="menuitem"]'
   */
  itemSelector?: string;

  /**
   * Whether arrow navigation wraps around at the ends.
   * @default true
   */
  wrap?: boolean;

  /**
   * Callback when Escape key is pressed.
   */
  onEscape?: () => void;

  /**
   * Navigation orientation. 'horizontal' uses ArrowLeft/ArrowRight,
   * 'vertical' uses ArrowUp/ArrowDown.
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Return type for useListFocus hook
 */
export interface UseListFocusReturn<T extends HTMLElement = HTMLElement> {
  /**
   * Ref to attach to the list container element.
   */
  listRef: React.RefObject<T | null>;

  /**
   * Key down handler to attach to the list container.
   */
  handleKeyDown: (e: React.KeyboardEvent) => void;

  /**
   * Focus a specific item by index.
   */
  focusItem: (index: number) => void;

  /**
   * Focus the first focusable item.
   */
  focusFirst: () => void;

  /**
   * Focus the last focusable item.
   */
  focusLast: () => void;
}

/**
 * Hook for managing keyboard navigation within a linear list.
 *
 * Implements WAI-ARIA menu/listbox/toolbar pattern:
 * - ArrowDown/ArrowRight: Move to next item (wraps to first)
 * - ArrowUp/ArrowLeft: Move to previous item (wraps to last)
 * - Home: Move to first item
 * - End: Move to last item
 * - Escape: Custom callback (e.g., close menu)
 *
 * @example
 * ```
 * const {listRef, handleKeyDown} = useListFocus({
 *   onEscape: () => layer.hide(),
 * });
 *
 * <div ref={listRef} role="menu" onKeyDown={handleKeyDown}>
 *   {items.map(item => <div role="menuitem" tabIndex={0}>{item}</div>)}
 * </div>
 * ```
 */
export function useListFocus<T extends HTMLElement = HTMLElement>(
  options: UseListFocusOptions = {},
): UseListFocusReturn<T> {
  const {
    itemSelector = '[role="menuitem"]',
    wrap = true,
    onEscape,
    orientation = 'vertical',
  } = options;

  const listRef = useRef<T>(null);

  /**
   * Get all focusable items in the list.
   */
  const getItems = useCallback((): HTMLElement[] => {
    if (!listRef.current) {
      return [];
    }
    return Array.from(
      listRef.current.querySelectorAll<HTMLElement>(itemSelector),
    );
  }, [itemSelector]);

  /**
   * Get the currently focused item index.
   */
  const getCurrentIndex = useCallback((): number => {
    const items = getItems();
    const active = document.activeElement;
    return items.findIndex(
      item => item === active || item.contains(active as Node),
    );
  }, [getItems]);

  /**
   * Focus an item by index, clamping to valid range.
   */
  const focusItem = useCallback(
    (index: number) => {
      const items = getItems();
      if (items.length === 0) {
        return;
      }
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      items[clampedIndex]?.focus();
    },
    [getItems],
  );

  /**
   * Focus the first item.
   */
  const focusFirst = useCallback(() => {
    const items = getItems();
    items[0]?.focus();
  }, [getItems]);

  /**
   * Focus the last item.
   */
  const focusLast = useCallback(() => {
    const items = getItems();
    items[items.length - 1]?.focus();
  }, [getItems]);

  /**
   * Handle keyboard navigation.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = getCurrentIndex();
      const items = getItems();
      let handled = true;

      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

      switch (e.key) {
        case nextKey: {
          if (currentIndex === -1) {
            items[0]?.focus();
          } else if (currentIndex < items.length - 1) {
            items[currentIndex + 1]?.focus();
          } else if (wrap) {
            items[0]?.focus();
          }
          break;
        }
        case prevKey: {
          if (currentIndex === -1) {
            items[items.length - 1]?.focus();
          } else if (currentIndex > 0) {
            items[currentIndex - 1]?.focus();
          } else if (wrap) {
            items[items.length - 1]?.focus();
          }
          break;
        }
        case 'Home':
          focusFirst();
          break;
        case 'End':
          focusLast();
          break;
        case 'Escape':
          onEscape?.();
          break;
        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
      }
    },
    [
      getCurrentIndex,
      getItems,
      wrap,
      orientation,
      focusFirst,
      focusLast,
      onEscape,
    ],
  );

  return {
    listRef,
    handleKeyDown,
    focusItem,
    focusFirst,
    focusLast,
  };
}
