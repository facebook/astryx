/**
 * @file useListFocus.ts
 * @input Uses React useCallback, useRef
 * @output Exports useListFocus hook for linear list keyboard navigation
 * @position Core hook; used by XDSTabMenu for dropdown menu navigation
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

'use client';

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
}

/**
 * Return type for useListFocus hook
 */
export interface UseListFocusReturn {
  /**
   * Ref to attach to the list container element.
   */
  listRef: React.RefObject<HTMLElement | null>;

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
 * Implements WAI-ARIA menu/listbox pattern:
 * - ArrowDown: Move to next item (wraps to first)
 * - ArrowUp: Move to previous item (wraps to last)
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
export function useListFocus(
  options: UseListFocusOptions = {},
): UseListFocusReturn {
  const {itemSelector = '[role="menuitem"]', wrap = true, onEscape} = options;

  const listRef = useRef<HTMLElement>(null);

  /**
   * Get all focusable items in the list.
   */
  const getItems = useCallback((): HTMLElement[] => {
    if (!listRef.current) return [];
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
      if (items.length === 0) return;
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

      switch (e.key) {
        case 'ArrowDown': {
          if (currentIndex === -1) {
            items[0]?.focus();
          } else if (currentIndex < items.length - 1) {
            items[currentIndex + 1]?.focus();
          } else if (wrap) {
            items[0]?.focus();
          }
          break;
        }
        case 'ArrowUp': {
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
    [getCurrentIndex, getItems, wrap, focusFirst, focusLast, onEscape],
  );

  return {
    listRef,
    handleKeyDown,
    focusItem,
    focusFirst,
    focusLast,
  };
}
