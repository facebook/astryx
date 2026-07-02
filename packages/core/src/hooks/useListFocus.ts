// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useListFocus.ts
 * @input Uses React useCallback, useRef, useIsomorphicLayoutEffect
 * @output Exports useListFocus hook for linear list keyboard navigation
 * @position Core hook; used by TabMenu for dropdown menu navigation, Toolbar
 *   for roving tabindex, ButtonGroup, ContextMenu, NavHeadingMenu, and more.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {useCallback, useRef} from 'react';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

/**
 * Navigation orientation for a linear list.
 * - `'horizontal'`: ArrowLeft/ArrowRight move between items.
 * - `'vertical'`: ArrowUp/ArrowDown move between items.
 * - `'both'`: all four arrows move between items (in linear DOM order).
 */
export type ListFocusOrientation = 'horizontal' | 'vertical' | 'both';

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
   * Navigation orientation. `'horizontal'` uses ArrowLeft/ArrowRight,
   * `'vertical'` uses ArrowUp/ArrowDown, `'both'` accepts all four arrows.
   * @default 'vertical'
   */
  orientation?: ListFocusOrientation;

  /**
   * Whether Home/End jump to the first/last enabled item.
   * @default true
   */
  enableHomeEnd?: boolean;

  /**
   * Whether the list is in a right-to-left context. When true, ArrowLeft and
   * ArrowRight are swapped so horizontal navigation follows visual direction.
   * Only affects horizontal (`'horizontal'`/`'both'`) navigation.
   * @default false
   */
  isRtl?: boolean;

  /**
   * Roving-tabindex ownership. When true, the hook manages a single tab stop
   * across the items: exactly one enabled item carries `tabindex="0"` and the
   * rest `tabindex="-1"`. The tab stop is stamped on mount and repaired
   * whenever items mount/unmount or toggle disabled, and moves with arrow
   * navigation. Attach the returned {@link UseListFocusReturn.handleFocus} to
   * the container's `onFocus` to keep the stop in sync after clicks or
   * programmatic focus.
   *
   * When false (the default), the hook only *moves* focus (`.focus()`) and
   * never touches `tabindex` — the caller owns tab-stop management.
   * @default false
   */
  rovingTabIndex?: boolean;

  /**
   * When true, arrow keys are not stolen from a nested text input/textarea
   * whose caret is not at the boundary in the direction of travel (or that has
   * a non-collapsed selection). This preserves normal caret movement while the
   * user is editing inline within the list (e.g. a toolbar search field).
   * @default false
   */
  deferToCaret?: boolean;
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
   * Focus handler to attach to the container's `onFocus`. Keeps the roving tab
   * stop in sync when `rovingTabIndex` is enabled; a no-op otherwise, so it is
   * always safe to attach.
   */
  handleFocus: (e: React.FocusEvent) => void;

  /**
   * Focus a specific item by index.
   */
  focusItem: (index: number) => void;

  /**
   * Focus the first enabled item. Returns true when an item was focused.
   */
  focusFirst: () => boolean;

  /**
   * Focus the last enabled item. Returns true when an item was focused.
   */
  focusLast: () => boolean;
}

// Text-editing inputs whose caret must not be hijacked by arrow navigation.
const TEXT_INPUT_TYPES = new Set([
  'text',
  'search',
  'url',
  'tel',
  'email',
  'password',
  'number',
]);

/**
 * Whether an arrow/Home/End key should be left to the browser because the
 * event target is a text input/textarea whose caret is not yet at the boundary
 * in the direction of travel (or a selection is present). Returns true when the
 * list should NOT steal the key.
 */
function shouldDeferToCaret(target: EventTarget | null, key: string): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const isTextarea = target.tagName === 'TEXTAREA';
  const isTextInput =
    target.tagName === 'INPUT' &&
    TEXT_INPUT_TYPES.has((target as HTMLInputElement).type);
  if (!isTextarea && !isTextInput) {
    return false;
  }
  const input = target as HTMLInputElement | HTMLTextAreaElement;
  const {selectionStart, selectionEnd, value} = input;
  // A non-collapsed selection means the user is selecting text — never steal.
  if (selectionStart !== selectionEnd) {
    return true;
  }
  // number inputs report null selection; treat as "always defer" for caret keys.
  if (selectionStart == null) {
    return true;
  }
  if (key === 'ArrowLeft' || key === 'ArrowUp' || key === 'Home') {
    // Defer unless the caret is at the very start.
    return selectionStart > 0;
  }
  if (key === 'ArrowRight' || key === 'ArrowDown' || key === 'End') {
    // Defer unless the caret is at the very end.
    return selectionStart < value.length;
  }
  return false;
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
 * By default the hook only *moves* focus and leaves `tabindex` management to
 * the caller. Opt into {@link UseListFocusOptions.rovingTabIndex} for a hook
 * that owns a single tab stop (roving tabindex) across the items — stamping and
 * repairing it as items mount/unmount or toggle disabled — for toolbars,
 * segmented controls, tab strips, and similar composite widgets.
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
 *
 * Roving-tabindex composite (e.g. a toolbar):
 *
 * @example
 * ```
 * const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLDivElement>({
 *   itemSelector: 'button, input, [tabindex]',
 *   orientation: 'horizontal',
 *   rovingTabIndex: true,
 *   deferToCaret: true,
 * });
 *
 * <div ref={listRef} role="toolbar" onKeyDown={handleKeyDown} onFocus={handleFocus}>
 *   {children}
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
    enableHomeEnd = true,
    isRtl = false,
    rovingTabIndex = false,
    deferToCaret = false,
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

  // --- Roving tabindex ownership (opt-in via `rovingTabIndex`) -------------

  /**
   * Set `tabindex` on an item, but only when it differs (avoids redundant DOM
   * writes). Uses setAttribute so the value reflects even for elements (like
   * `<button>`) whose default tabIndex is already 0.
   */
  const setTabIndex = useCallback((el: HTMLElement, value: 0 | -1) => {
    if (el.getAttribute('tabindex') !== String(value)) {
      el.setAttribute('tabindex', String(value));
    }
  }, []);

  /**
   * Stamp the roving tab stop: exactly one enabled item is tabbable (0), the
   * rest are -1. Prefer keeping the currently-tabbable item if it is still
   * enabled; otherwise promote the first enabled item (tab-stop repair).
   */
  const syncTabStops = useCallback(() => {
    const items = getItems();
    const enabled = items.filter(el => !isItemDisabled(el));
    if (enabled.length === 0) {
      return;
    }
    const current = enabled.find(el => el.getAttribute('tabindex') === '0');
    const tabbable = current ?? enabled[0];
    for (const el of items) {
      setTabIndex(el, el === tabbable ? 0 : -1);
    }
  }, [getItems, isItemDisabled, setTabIndex]);

  // Keep the tab stop valid across renders (items added/removed, disabled
  // toggled). Runs after every commit but only when roving tabindex is on.
  useIsomorphicLayoutEffect(() => {
    if (rovingTabIndex) {
      syncTabStops();
    }
  });

  /**
   * Move focus to `items[index]`. When roving tabindex is enabled, also move
   * the tab stop so `index` becomes the sole tabbable item.
   */
  const focusIndex = useCallback(
    (items: HTMLElement[], index: number) => {
      const target = items[index];
      if (!target) {
        return;
      }
      if (rovingTabIndex) {
        for (const el of items) {
          setTabIndex(el, el === target ? 0 : -1);
        }
      }
      target.focus();
    },
    [rovingTabIndex, setTabIndex],
  );

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
      focusIndex(items, clampedIndex);
    },
    [getItems, focusIndex],
  );

  /**
   * Focus the first enabled item. Returns true when an item was focused.
   */
  const focusFirst = useCallback((): boolean => {
    const items = getItems();
    const index = findEnabledIndex(items, 0, 1, false);
    if (index !== -1) {
      focusIndex(items, index);
      return true;
    }
    return false;
  }, [getItems, findEnabledIndex, focusIndex]);

  /**
   * Focus the last enabled item. Returns true when an item was focused.
   */
  const focusLast = useCallback((): boolean => {
    const items = getItems();
    const index = findEnabledIndex(items, items.length - 1, -1, false);
    if (index !== -1) {
      focusIndex(items, index);
      return true;
    }
    return false;
  }, [getItems, findEnabledIndex, focusIndex]);

  /**
   * Keep the roving stop pointing at whatever ended up focused (e.g. a click
   * or programmatic focus) so the next Tab behaves correctly. No-op unless
   * roving tabindex is enabled.
   */
  const handleFocus = useCallback(() => {
    if (rovingTabIndex) {
      syncTabStops();
    }
  }, [rovingTabIndex, syncTabStops]);

  /**
   * Handle keyboard navigation.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Let browser/OS shortcut chords (Ctrl/Cmd/Alt + key) through untouched.
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Escape is handled regardless of orientation. Preserve the historical
      // behavior of always consuming Escape here (preventDefault) so consumers
      // that relied on it are unaffected.
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape?.();
        return;
      }

      const horizontal = orientation === 'horizontal' || orientation === 'both';
      const vertical = orientation === 'vertical' || orientation === 'both';

      // Resolve which keys advance vs retreat, honoring RTL for horizontal.
      const nextKeys: string[] = [];
      const prevKeys: string[] = [];
      if (horizontal) {
        nextKeys.push(isRtl ? 'ArrowLeft' : 'ArrowRight');
        prevKeys.push(isRtl ? 'ArrowRight' : 'ArrowLeft');
      }
      if (vertical) {
        nextKeys.push('ArrowDown');
        prevKeys.push('ArrowUp');
      }

      const isNext = nextKeys.includes(e.key);
      const isPrev = prevKeys.includes(e.key);
      const isHome = enableHomeEnd && e.key === 'Home';
      const isEnd = enableHomeEnd && e.key === 'End';

      if (!isNext && !isPrev && !isHome && !isEnd) {
        return;
      }

      // Never hijack a caret key from a nested text input mid-line. Check both
      // the React event target and the actual focused element (events may
      // bubble up to the container).
      if (
        deferToCaret &&
        (shouldDeferToCaret(e.target, e.key) ||
          shouldDeferToCaret(document.activeElement, e.key))
      ) {
        return;
      }

      const currentIndex = getCurrentIndex();
      const items = getItems();

      if (isNext) {
        const from = currentIndex === -1 ? 0 : currentIndex + 1;
        const next = findEnabledIndex(items, from, 1, wrap);
        if (next !== -1) {
          focusIndex(items, next);
        }
      } else if (isPrev) {
        const from = currentIndex === -1 ? items.length - 1 : currentIndex - 1;
        const prev = findEnabledIndex(items, from, -1, wrap);
        if (prev !== -1) {
          focusIndex(items, prev);
        }
      } else if (isHome) {
        focusFirst();
      } else if (isEnd) {
        focusLast();
      }

      e.preventDefault();
    },
    [
      getCurrentIndex,
      getItems,
      wrap,
      orientation,
      isRtl,
      enableHomeEnd,
      deferToCaret,
      findEnabledIndex,
      focusIndex,
      focusFirst,
      focusLast,
      onEscape,
    ],
  );

  return {
    listRef,
    handleKeyDown,
    handleFocus,
    focusItem,
    focusFirst,
    focusLast,
  };
}
