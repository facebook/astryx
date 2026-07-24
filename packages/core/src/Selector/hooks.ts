// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file hooks.ts
 * @output Hooks for Selector
 * @position Internal hooks; used by Selector.tsx
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {RefObject} from 'react';
import type {SelectorOptionData} from './types';

// =============================================================================
// useSelectedItemOffset - Position dropdown to center selected item over trigger
// =============================================================================

interface UseSelectedItemOffsetOptions {
  isOpen: boolean;
  selectedItemIndex: number;
  listboxId: string;
  listboxRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

interface UseSelectedItemOffsetResult {
  offset: number;
  isPositioned: boolean;
}

/**
 * Calculates the offset needed to position the dropdown so that the selected
 * item appears centered over the trigger button (macOS-style selector).
 *
 * The desired dropdown top is calculated directly from the trigger center and
 * selected-item center, then clamped to the viewport. This preserves the
 * default "selected item over trigger" behavior while letting the menu slide
 * upward near the bottom edge or downward near the top edge instead of being
 * clipped off-screen.
 */
export function useSelectedItemOffset({
  isOpen,
  selectedItemIndex,
  listboxId,
  listboxRef,
  triggerRef,
}: UseSelectedItemOffsetOptions): UseSelectedItemOffsetResult {
  const [offset, setOffset] = useState(0);
  const [isPositioned, setIsPositioned] = useState(false);

  const commitPosition = useCallback(
    (nextOffset: number, nextIsPositioned: boolean) => {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- selector popover position is derived from DOM layout
      setOffset(nextOffset);
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- selector popover position is derived from DOM layout
      setIsPositioned(nextIsPositioned);
    },
    [],
  );

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      // Reset offset when closed
      commitPosition(0, false);
      return;
    }

    if (!listboxRef.current || !triggerRef.current) {
      commitPosition(0, true);
      return;
    }

    // Find the target item: selected item or first item
    const targetIndex = selectedItemIndex >= 0 ? selectedItemIndex : 0;
    const targetItemId = `${listboxId}-item-${targetIndex}`;
    // Use getElementById - works with special characters without escaping
    const targetItem = document.getElementById(targetItemId);

    if (!targetItem) {
      commitPosition(0, true);
      return;
    }

    // Get positions. JSDOM returns zero rects by default, but browsers provide
    // real dimensions before paint via layout effect.
    const listboxRect = listboxRef.current.getBoundingClientRect();
    const itemRect = targetItem.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();

    const listboxHeight = listboxRect.height;
    if (listboxHeight <= 0) {
      commitPosition(0, true);
      return;
    }

    // Item center relative to listbox top. This remains stable even as the
    // popover's top changes between measurements.
    const itemCenterInListbox =
      itemRect.top - listboxRect.top + itemRect.height / 2;
    const triggerCenter = triggerRect.top + triggerRect.height / 2;

    // Desired top aligns the selected item's center with trigger center.
    const desiredTop = triggerCenter - itemCenterInListbox;
    const viewportHeight = window.innerHeight;
    const maxTop = Math.max(0, viewportHeight - listboxHeight);
    const clampedTop = Math.min(Math.max(desiredTop, 0), maxTop);

    // useLayer positions the popover below the trigger. Apply a negative
    // block-start margin to the layer container so the listbox top moves from
    // triggerRect.bottom to clampedTop.
    const clampedOffset = Math.max(0, triggerRect.bottom - clampedTop);

    commitPosition(clampedOffset, true);
  }, [
    isOpen,
    selectedItemIndex,
    listboxId,
    listboxRef,
    triggerRef,
    commitPosition,
  ]);

  return {offset, isPositioned};
}

// =============================================================================
// useCombobox - Keyboard navigation, typeahead, and selection
// =============================================================================

interface UseComboboxOptions {
  selectableItems: SelectorOptionData[];
  value?: string;
  isDisabled?: boolean;
  isOpen: boolean;
  hasSearch?: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect?: (value: string) => void;
  /**
   * Clear the current value. When provided, pressing Delete or Backspace on the
   * closed trigger clears the selection — a keyboard equivalent of the clear
   * button, so clearing is not mouse-only. No-op when the popup is open (arrow
   * navigation owns those keys there) or when there is no value.
   */
  onClear?: () => void;
  /**
   * With `hasSearch`, printable characters typed on the trigger are appended to
   * the search query (opening the popup if needed), so type-to-find works
   * without a separate open step. Characters keep arriving here until focus
   * lands in the search input, which then owns its own typing.
   */
  onSearchSeed?: (char: string) => void;
  /**
   * Whether printable characters drive typeahead matching.
   *
   * Consumers whose own text input already filters the items (CommandPalette)
   * must pass `false`: that input forwards every keystroke here, and a prefix
   * search chasing the same text drags the highlight — and therefore what Enter
   * commits — onto an item the user never picked.
   *
   * @default true
   */
  hasTypeahead?: boolean;
  listboxId: string;
}

interface UseComboboxResult {
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  getItemId: (index: number) => string;
  onTriggerClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onItemSelect: (item: SelectorOptionData) => void;
  onItemMouseEnter: (item: SelectorOptionData, index: number) => void;
}

/**
 * How long the accumulated typeahead buffer survives between keystrokes
 * before resetting, matching typical native `<select>` behavior.
 */
const TYPEAHEAD_RESET_MS = 500;

/**
 * Handles keyboard navigation, typeahead search, and selection for combobox/listbox patterns.
 */
export function useCombobox({
  selectableItems,
  value,
  isDisabled = false,
  isOpen,
  hasSearch = false,
  onOpen,
  onClose,
  onSelect,
  onClear,
  onSearchSeed,
  hasTypeahead = true,
  listboxId,
}: UseComboboxOptions): UseComboboxResult {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  // The typeahead buffer lives in a ref: it never drives rendering, and a ref
  // keeps rapid keystrokes coherent regardless of render timing.
  const typeaheadRef = useRef('');
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Drop the buffer at every interaction boundary — committing, closing, and
  // clearing all end the "word" being typed. Without this, a stale prefix
  // survives for up to TYPEAHEAD_RESET_MS and poisons the next keystroke:
  // selecting Dog then typing "c" would search for "dc" and match nothing.
  const resetTypeahead = useCallback(() => {
    typeaheadRef.current = '';
    if (typeaheadTimeoutRef.current) {
      clearTimeout(typeaheadTimeoutRef.current);
      typeaheadTimeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => resetTypeahead, [resetTypeahead]);

  const getItemId = useCallback(
    (index: number) => `${listboxId}-item-${index}`,
    [listboxId],
  );

  const getEnabledIndices = useCallback(() => {
    return selectableItems
      .map((item, i) => (!item.disabled ? i : -1))
      .filter(i => i >= 0);
  }, [selectableItems]);

  const findSelectedIndex = useCallback(() => {
    return selectableItems.findIndex(item => item.value === value);
  }, [selectableItems, value]);

  const closeAndReset = useCallback(() => {
    setHighlightedIndex(-1);
    resetTypeahead();
    onClose();
  }, [onClose, resetTypeahead]);

  const selectItem = useCallback(
    (item: SelectorOptionData) => {
      if (item.disabled) {
        return;
      }
      onSelect?.(item.value);
      closeAndReset();
    },
    [onSelect, closeAndReset],
  );

  const onTriggerClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    if (isOpen) {
      closeAndReset();
    } else {
      onOpen();
      if (!hasSearch) {
        const selectedIndex = findSelectedIndex();
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
    }
  }, [isDisabled, isOpen, onOpen, closeAndReset, findSelectedIndex, hasSearch]);

  const onItemMouseEnter = useCallback(
    (item: SelectorOptionData, index: number) => {
      if (!item.disabled) {
        setHighlightedIndex(index);
      }
    },
    [],
  );

  /**
   * Find the option matching the typeahead buffer, searching from the item
   * after `anchorIndex` and wrapping so the anchor itself is considered last.
   * Falls back to first-letter matching when the buffer is one character
   * repeated ("c", "cc", …), so holding a letter cycles through its matches
   * the way a native `<select>` does (APG getIndexByLetter).
   */
  const findTypeaheadMatch = useCallback(
    (buffer: string, anchorIndex: number) => {
      const count = selectableItems.length;
      const start = anchorIndex >= 0 ? anchorIndex + 1 : 0;
      const findByPrefix = (prefix: string) => {
        for (let i = 0; i < count; i++) {
          const index = (start + i) % count;
          const item = selectableItems[index];
          if (
            !item.disabled &&
            (item.label ?? item.value).toLowerCase().startsWith(prefix)
          ) {
            return index;
          }
        }
        return -1;
      };

      const fullMatch = findByPrefix(buffer);
      if (fullMatch >= 0) {
        return fullMatch;
      }
      const isRepeatedChar =
        buffer.length > 1 && buffer.split('').every(ch => ch === buffer[0]);
      return isRepeatedChar ? findByPrefix(buffer[0]) : -1;
    },
    [selectableItems],
  );

  const handleTypeahead = useCallback(
    (key: string) => {
      typeaheadRef.current += key.toLowerCase();
      if (typeaheadTimeoutRef.current) {
        clearTimeout(typeaheadTimeoutRef.current);
      }
      typeaheadTimeoutRef.current = setTimeout(() => {
        typeaheadRef.current = '';
      }, TYPEAHEAD_RESET_MS);

      // Cycle onward from the highlight when open, or from the current
      // selection when closed.
      const anchorIndex = isOpen ? highlightedIndex : findSelectedIndex();
      const matchIndex = findTypeaheadMatch(typeaheadRef.current, anchorIndex);
      if (matchIndex < 0) {
        return;
      }
      if (isOpen) {
        setHighlightedIndex(matchIndex);
      } else {
        // Native select parity: typing on the closed trigger commits the
        // matched value directly without opening the menu.
        const item = selectableItems[matchIndex];
        if (item.value !== value) {
          onSelect?.(item.value);
        }
      }
    },
    [
      isOpen,
      highlightedIndex,
      findSelectedIndex,
      findTypeaheadMatch,
      selectableItems,
      value,
      onSelect,
    ],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isDisabled) {
        return;
      }

      const enabledIndices = getEnabledIndices();

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
            setHighlightedIndex(0);
          } else {
            const currentEnabledPos = enabledIndices.indexOf(highlightedIndex);
            const nextPos = Math.min(
              currentEnabledPos + 1,
              enabledIndices.length - 1,
            );
            setHighlightedIndex(enabledIndices[nextPos] ?? highlightedIndex);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
            setHighlightedIndex(selectableItems.length - 1);
          } else {
            const currentEnabledPos = enabledIndices.indexOf(highlightedIndex);
            const prevPos = Math.max(currentEnabledPos - 1, 0);
            setHighlightedIndex(enabledIndices[prevPos] ?? highlightedIndex);
          }
          break;

        case ' ':
          if (hasSearch) {
            break;
          }
          // A space while a typeahead buffer is live is part of the match
          // ("new y" → "New York"), not an open/select command.
          if (hasTypeahead && typeaheadRef.current.length > 0) {
            e.preventDefault();
            handleTypeahead(' ');
            break;
          }
        // falls through
        case 'Enter':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const item = selectableItems[highlightedIndex];
            if (item && !item.disabled) {
              selectItem(item);
            }
          } else if (!isOpen) {
            onOpen();
            if (!hasSearch) {
              const selectedIndex = findSelectedIndex();
              setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
            }
          }
          break;

        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            closeAndReset();
          }
          break;

        case 'Tab':
          if (isOpen) {
            closeAndReset();
          }
          break;

        case 'Home':
          e.preventDefault();
          if (isOpen && enabledIndices.length > 0) {
            setHighlightedIndex(enabledIndices[0]);
          }
          break;

        case 'End':
          e.preventDefault();
          if (isOpen && enabledIndices.length > 0) {
            setHighlightedIndex(enabledIndices[enabledIndices.length - 1]);
          }
          break;

        // PageUp/PageDown mirror Home/End. In search mode Home/End stay on
        // the input for caret movement (APG editable combobox), so these are
        // the sanctioned substitute for jumping to the first/last option.
        case 'PageUp':
          e.preventDefault();
          if (isOpen && enabledIndices.length > 0) {
            setHighlightedIndex(enabledIndices[0]);
          }
          break;

        case 'PageDown':
          e.preventDefault();
          if (isOpen && enabledIndices.length > 0) {
            setHighlightedIndex(enabledIndices[enabledIndices.length - 1]);
          }
          break;

        case 'Delete':
        case 'Backspace':
          // Keyboard equivalent of the clear button (comboboxes-2): clear the
          // value from the closed trigger so clearing is not mouse-only. When
          // hasSearch is active these keys must edit the search text instead,
          // and when the popup is open arrow navigation owns interaction, so
          // only handle the closed non-search case with a clearable value.
          if (!hasSearch && !isOpen && onClear != null && value != null) {
            e.preventDefault();
            resetTypeahead();
            onClear();
          }
          break;

        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            if (hasSearch) {
              // Keys land here only while the trigger holds focus — once the
              // search input takes over it handles its own typing — so they
              // belong in the query, including the ones racing the open.
              if (onSearchSeed) {
                if (!isOpen) {
                  onOpen();
                }
                onSearchSeed(e.key);
              }
            } else if (hasTypeahead) {
              handleTypeahead(e.key);
            }
          }
          break;
      }
    },
    [
      isDisabled,
      isOpen,
      onOpen,
      closeAndReset,
      selectableItems,
      highlightedIndex,
      selectItem,
      findSelectedIndex,
      getEnabledIndices,
      handleTypeahead,
      resetTypeahead,
      hasSearch,
      hasTypeahead,
      onClear,
      onSearchSeed,
      value,
    ],
  );

  return {
    highlightedIndex,
    setHighlightedIndex,
    getItemId,
    onTriggerClick,
    onKeyDown,
    onItemSelect: selectItem,
    onItemMouseEnter,
  };
}
