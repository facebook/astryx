// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useListFocus.ts
 * @input Uses React useCallback, useRef
 * @output Exports useListFocus hook for linear list keyboard navigation
 * @position Core hook; used by TabMenu for dropdown menu navigation, Toolbar for roving tabindex
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
   * @default '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]'
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
   * Navigation orientation. `'horizontal'` uses ArrowLeft/ArrowRight,
   * `'vertical'` uses ArrowUp/ArrowDown, `'both'` accepts all four arrows
   * (next = ArrowRight or ArrowDown, prev = ArrowLeft or ArrowUp; Home/End
   * still jump to the ends). Use `'both'` for widgets like tab strips where,
   * per the WAI-ARIA APG allowance, keyboard users navigate without knowing
   * the layout axis and `aria-orientation` is reported separately by the
   * caller.
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical' | 'both';
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
   * Whether an item is disabled and therefore cannot receive DOM focus.
   * A `.focus()` call on such an element silently no-ops, so navigation must
   * skip these to avoid freezing on a disabled item (menus-4, navigation-5).
   */
  const isItemDisabled = useCallback((el: HTMLElement): boolean => {
    return (
      el.getAttribute('aria-disabled') === 'true' ||
      (el as HTMLButtonElement).disabled === true ||
      el.hasAttribute('disabled')
    );
  }, []);

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
   * Find the next enabled item index from `start`, moving by `step`, optionally
   * wrapping. Returns -1 when no enabled item exists in range. Skipping
   * disabled items here (rather than relying on the selector) keeps navigation
   * from stalling on an item whose `.focus()` silently no-ops.
   */
  const findEnabledIndex = useCallback(
    (
      items: HTMLElement[],
      start: number,
      step: 1 | -1,
      shouldWrap: boolean,
    ): number => {
      const count = items.length;
      if (count === 0) {
        return -1;
      }
      let index = start;
      for (let i = 0; i < count; i++) {
        if (index < 0 || index >= count) {
          if (!shouldWrap) {
            return -1;
          }
          index = (index + count) % count;
        }
        const item = items[index];
        if (item && !isItemDisabled(item)) {
          return index;
        }
        index += step;
      }
      return -1;
    },
    [isItemDisabled],
  );

  /**
   * Get the currently focused item index.
   */
  const getCurrentIndex = useCallback((): number => {
    const items = getItems();
    const active = document.activeElement;
    return items.findIndex(item => item === active || item.contains(active));
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
   * Focus the first enabled item.
   */
  const focusFirst = useCallback(() => {
    const items = getItems();
    const index = findEnabledIndex(items, 0, 1, false);
    if (index !== -1) {
      items[index]?.focus();
    }
  }, [getItems, findEnabledIndex]);

  /**
   * Focus the last enabled item.
   */
  const focusLast = useCallback(() => {
    const items = getItems();
    const index = findEnabledIndex(items, items.length - 1, -1, false);
    if (index !== -1) {
      items[index]?.focus();
    }
  }, [getItems, findEnabledIndex]);

  /**
   * Handle keyboard navigation.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = getCurrentIndex();
      const items = getItems();
      let handled = true;

      // `'both'` accepts either axis' arrows (tab-strip APG allowance);
      // otherwise navigation is strictly gated to the configured axis.
      const horizontal = orientation === 'horizontal' || orientation === 'both';
      const vertical = orientation === 'vertical' || orientation === 'both';
      const isNext =
        (horizontal && e.key === 'ArrowRight') ||
        (vertical && e.key === 'ArrowDown');
      const isPrev =
        (horizontal && e.key === 'ArrowLeft') ||
        (vertical && e.key === 'ArrowUp');

      if (isNext) {
        const from = currentIndex === -1 ? 0 : currentIndex + 1;
        const next = findEnabledIndex(items, from, 1, wrap);
        if (next !== -1) {
          items[next]?.focus();
        }
      } else if (isPrev) {
        const from = currentIndex === -1 ? items.length - 1 : currentIndex - 1;
        const prev = findEnabledIndex(items, from, -1, wrap);
        if (prev !== -1) {
          items[prev]?.focus();
        }
      } else if (e.key === 'Home') {
        focusFirst();
      } else if (e.key === 'End') {
        focusLast();
      } else if (e.key === 'Escape') {
        onEscape?.();
      } else {
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
      findEnabledIndex,
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
