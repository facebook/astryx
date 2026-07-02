// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTreeFocus.ts
 * @input Uses React useCallback, useRef
 * @output Exports useTreeFocus hook for WAI-ARIA tree keyboard navigation
 * @position Core hook; used by TreeList for roving tabindex + APG tree keyboard model
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/hooks/useTreeFocus.doc.mjs
 * - /packages/core/src/hooks/useTreeFocus.test.tsx
 */

import {useCallback, useRef} from 'react';

/** Keys handled by the tree keyboard model (used to gate typeahead). */
const NAVIGATION_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'ArrowRight',
  'ArrowLeft',
  'Home',
  'End',
  'Enter',
  ' ',
]);

/** Default reset delay for the typeahead buffer. */
const DEFAULT_TYPEAHEAD_RESET_MS = 500;

/**
 * Configuration for tree focus behavior.
 *
 * The tree keyboard model differs from a linear list (useListFocus): while
 * ArrowUp/ArrowDown/Home/End roam linearly over the *visible* treeitems,
 * ArrowRight/ArrowLeft carry tree semantics (expand/collapse, move to
 * first-child / parent). The hook stays generic by taking callbacks for the
 * tree-specific bits (expansion toggling, activation) — mirroring how
 * useGridFocus takes `isCellFocusable` rather than hardcoding disabled logic.
 */
export interface UseTreeFocusOptions {
  /**
   * Selector for treeitems within the tree. Matches ALL visible treeitems in
   * DOM order (collapsed subtrees are not rendered, so they are naturally
   * excluded). Disabled treeitems are still matched and then skipped via
   * {@link UseTreeFocusOptions.isItemDisabled}.
   * @default '[role="treeitem"]'
   */
  itemSelector?: string;

  /**
   * Predicate determining whether a treeitem matched by `itemSelector` is
   * disabled and must be skipped during arrow/Home/End navigation. A `.focus()`
   * on a disabled item silently no-ops, so navigation would otherwise stall.
   *
   * @default reads `data-tree-disabled` (present ⇒ disabled)
   */
  isItemDisabled?: (item: HTMLElement) => boolean;

  /**
   * Reads the nesting level (aria-level style, 1-based) of a treeitem. Used to
   * resolve first-child (ArrowRight) and parent (ArrowLeft) targets from the
   * flat visible-item list.
   *
   * @default reads the `aria-level` attribute (falling back to `1`)
   */
  getLevel?: (item: HTMLElement) => number;

  /**
   * Whether a treeitem is an expanded parent. Read DOM-side (aria-expanded)
   * by default so it reflects the rendered tree without prop plumbing.
   *
   * @default `aria-expanded === 'true'`
   */
  isExpanded?: (item: HTMLElement) => boolean;

  /**
   * Whether a treeitem is a collapsed parent (has children but is closed).
   *
   * @default `aria-expanded === 'false'`
   */
  isCollapsed?: (item: HTMLElement) => boolean;

  /**
   * Resolve the stable id for a treeitem, passed to `onToggleExpand` /
   * `onActivate`. Returns `undefined` when the element carries no id.
   *
   * @default reads the `data-tree-id` attribute
   */
  getItemId?: (item: HTMLElement) => string | undefined;

  /**
   * Called to expand/collapse the treeitem with the given id (ArrowRight on a
   * collapsed parent, ArrowLeft on an expanded parent, and Enter/Space on a
   * parent that has no inner action).
   */
  onToggleExpand?: (id: string) => void;

  /**
   * Called when Enter/Space activates a treeitem. Return `true` if the
   * activation was handled (e.g. an inner link/button was clicked); return
   * `false`/`undefined` to let the hook fall back to toggling expansion for a
   * parent. When omitted, the hook falls straight through to expansion
   * toggling for parents.
   *
   * @param item The focused treeitem element.
   * @param id The treeitem's id (per `getItemId`), if any.
   */
  onActivate?: (item: HTMLElement, id: string | undefined) => boolean | undefined;

  /**
   * Whether typeahead (jump to next item whose text starts with the typed
   * characters) is enabled.
   * @default true
   */
  typeahead?: boolean;

  /** Reset delay for the typeahead buffer, in ms. @default 500 */
  typeaheadResetMs?: number;

  /**
   * Notified whenever the hook moves focus to a treeitem, with its id (if any).
   * TreeList uses this to move its single roving tab stop.
   */
  onActiveChange?: (id: string | undefined) => void;
}

/**
 * Return type for useTreeFocus hook.
 */
export interface UseTreeFocusReturn<T extends HTMLElement = HTMLElement> {
  /** Ref to attach to the tree container element (role="tree"). */
  treeRef: React.RefObject<T | null>;

  /** Key down handler to attach to the tree container. */
  handleKeyDown: (e: React.KeyboardEvent) => void;

  /** Focus the first enabled visible treeitem. */
  focusFirst: () => void;

  /** Focus the last enabled visible treeitem. */
  focusLast: () => void;
}

/**
 * Hook for managing roving-tabindex focus + the WAI-ARIA tree keyboard model.
 *
 * A tree is not a linear list: ArrowUp/ArrowDown/Home/End roam linearly over
 * the *visible* treeitems (skipping disabled ones), but ArrowRight/ArrowLeft
 * carry tree semantics. This is why a tree needs its own hook rather than
 * reusing `useListFocus` — the same reason 2D grids get `useGridFocus`.
 *
 * - ArrowDown / ArrowUp: move to next/previous visible treeitem (skip disabled)
 * - ArrowRight: collapsed parent → expand; expanded parent → first child;
 *   leaf → no-op
 * - ArrowLeft: expanded parent → collapse; otherwise → move to parent treeitem
 * - Home / End: first / last visible treeitem
 * - Enter / Space: activate (`onActivate`), falling back to expansion toggle
 * - Printable characters: typeahead to the next matching treeitem
 *
 * The hook is DOM-query based (reads aria-expanded/aria-level and data-*
 * attributes) and stays generic via option callbacks for the tree-specific
 * bits (`onToggleExpand`, `onActivate`, `getLevel`, `isItemDisabled`, …).
 *
 * @example
 * ```
 * const {treeRef, handleKeyDown} = useTreeFocus<HTMLUListElement>({
 *   onToggleExpand: id => toggle(id),
 *   onActiveChange: id => setActiveId(id),
 * });
 *
 * <ul ref={treeRef} role="tree" onKeyDown={handleKeyDown}>
 *   {items.map(item => <li role="treeitem" tabIndex={-1}>{item.label}</li>)}
 * </ul>
 * ```
 */
export function useTreeFocus<T extends HTMLElement = HTMLElement>(
  options: UseTreeFocusOptions = {},
): UseTreeFocusReturn<T> {
  const {
    itemSelector = '[role="treeitem"]',
    isItemDisabled,
    getLevel,
    isExpanded,
    isCollapsed,
    getItemId,
    onToggleExpand,
    onActivate,
    typeahead = true,
    typeaheadResetMs = DEFAULT_TYPEAHEAD_RESET_MS,
    onActiveChange,
  } = options;

  const treeRef = useRef<T>(null);

  const typeaheadRef = useRef<{buffer: string; timer: number | null}>({
    buffer: '',
    timer: null,
  });

  /** Visible treeitems in DOM order (collapsed subtrees are not rendered). */
  const getItems = useCallback((): HTMLElement[] => {
    const root = treeRef.current;
    if (root == null) {
      return [];
    }
    return Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
  }, [itemSelector]);

  const itemDisabled = useCallback(
    (el: HTMLElement): boolean =>
      isItemDisabled
        ? isItemDisabled(el)
        : el.dataset.treeDisabled != null ||
          el.getAttribute('aria-disabled') === 'true',
    [isItemDisabled],
  );

  const levelOf = useCallback(
    (el: HTMLElement): number =>
      getLevel ? getLevel(el) : Number(el.getAttribute('aria-level') ?? '1'),
    [getLevel],
  );

  const expandedOf = useCallback(
    (el: HTMLElement): boolean =>
      isExpanded ? isExpanded(el) : el.getAttribute('aria-expanded') === 'true',
    [isExpanded],
  );

  const collapsedOf = useCallback(
    (el: HTMLElement): boolean =>
      isCollapsed
        ? isCollapsed(el)
        : el.getAttribute('aria-expanded') === 'false',
    [isCollapsed],
  );

  const idOf = useCallback(
    (el: HTMLElement): string | undefined =>
      getItemId ? getItemId(el) : el.dataset.treeId,
    [getItemId],
  );

  /** Move focus to a treeitem and notify the active-change listener. */
  const focusItem = useCallback(
    (el: HTMLElement | undefined) => {
      if (el == null) {
        return;
      }
      onActiveChange?.(idOf(el));
      el.focus();
    },
    [idOf, onActiveChange],
  );

  /**
   * Focus the first enabled treeitem from `start`, moving by `dir`. No wrap —
   * a tree's linear roam clamps at the ends.
   */
  const focusEnabledFrom = useCallback(
    (items: HTMLElement[], start: number, dir: 1 | -1) => {
      for (let i = start; i >= 0 && i < items.length; i += dir) {
        const candidate = items[i];
        if (candidate != null && !itemDisabled(candidate)) {
          focusItem(candidate);
          return;
        }
      }
    },
    [itemDisabled, focusItem],
  );

  const focusFirst = useCallback(() => {
    focusEnabledFrom(getItems(), 0, 1);
  }, [getItems, focusEnabledFrom]);

  const focusLast = useCallback(() => {
    const items = getItems();
    focusEnabledFrom(items, items.length - 1, -1);
  }, [getItems, focusEnabledFrom]);

  const runTypeahead = useCallback(
    (
      e: React.KeyboardEvent,
      items: HTMLElement[],
      currentIndex: number,
    ): void => {
      const state = typeaheadRef.current;
      if (state.timer != null) {
        clearTimeout(state.timer);
      }
      state.buffer += e.key.toLowerCase();
      state.timer = setTimeout(() => {
        typeaheadRef.current.buffer = '';
      }, typeaheadResetMs) as unknown as number;

      const query = state.buffer;
      const start = currentIndex < 0 ? 0 : currentIndex;
      const ordered = [...items.slice(start + 1), ...items.slice(0, start + 1)];
      const match = ordered.find(
        item =>
          !itemDisabled(item) &&
          (item.textContent ?? '').trim().toLowerCase().startsWith(query),
      );
      if (match != null) {
        e.preventDefault();
        focusItem(match);
      }
    },
    [typeaheadResetMs, itemDisabled, focusItem],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = getItems();
      if (items.length === 0) {
        return;
      }

      const active = document.activeElement;
      // Resolve the treeitem that owns focus: the nearest treeitem ancestor of
      // the active element (never an outer treeitem that merely contains it).
      const activeItem =
        active instanceof Element ? active.closest('[role="treeitem"]') : null;
      const currentIndex = items.findIndex(item => item === activeItem);
      const current = currentIndex >= 0 ? items[currentIndex] : undefined;

      // Typeahead: printable single characters jump to the next matching item.
      if (
        typeahead &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        NAVIGATION_KEYS.has(e.key) === false
      ) {
        runTypeahead(e, items, currentIndex);
        return;
      }

      if (!NAVIGATION_KEYS.has(e.key)) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          focusEnabledFrom(items, currentIndex < 0 ? 0 : currentIndex + 1, 1);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          focusEnabledFrom(
            items,
            currentIndex < 0 ? items.length - 1 : currentIndex - 1,
            -1,
          );
          break;
        }
        case 'ArrowRight': {
          if (current == null) {
            break;
          }
          e.preventDefault();
          if (collapsedOf(current)) {
            // Collapsed parent → expand.
            const id = idOf(current);
            if (id != null) {
              onToggleExpand?.(id);
            }
          } else if (expandedOf(current)) {
            // Expanded parent → move to first child.
            const next = items[currentIndex + 1];
            if (next != null && levelOf(next) > levelOf(current)) {
              focusItem(next);
            }
          }
          // Leaf → no-op.
          break;
        }
        case 'ArrowLeft': {
          if (current == null) {
            break;
          }
          e.preventDefault();
          if (expandedOf(current)) {
            // Expanded parent → collapse.
            const id = idOf(current);
            if (id != null) {
              onToggleExpand?.(id);
            }
          } else {
            // Otherwise → move to parent treeitem (nearest shallower item
            // scanning upward in visible order).
            const currentLevel = levelOf(current);
            for (let i = currentIndex - 1; i >= 0; i--) {
              const candidate = items[i];
              if (candidate != null && levelOf(candidate) < currentLevel) {
                focusItem(candidate);
                break;
              }
            }
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          focusEnabledFrom(items, 0, 1);
          break;
        }
        case 'End': {
          e.preventDefault();
          focusEnabledFrom(items, items.length - 1, -1);
          break;
        }
        case 'Enter':
        case ' ': {
          if (current == null || itemDisabled(current)) {
            break;
          }
          e.preventDefault();
          const id = idOf(current);
          // Activate the item: prefer the consumer's onActivate (e.g. click an
          // inner link/button). Fall back to toggling expansion for a parent
          // without its own action.
          const handled = onActivate ? onActivate(current, id) === true : false;
          if (!handled && current.getAttribute('aria-expanded') != null) {
            if (id != null) {
              onToggleExpand?.(id);
            }
          }
          break;
        }
        default:
          break;
      }
    },
    [
      getItems,
      typeahead,
      runTypeahead,
      focusEnabledFrom,
      focusItem,
      collapsedOf,
      expandedOf,
      idOf,
      levelOf,
      itemDisabled,
      onToggleExpand,
      onActivate,
    ],
  );

  return {
    treeRef,
    handleKeyDown,
    focusFirst,
    focusLast,
  };
}
