// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file hooks.ts
 * @output Hooks for XDSSelector
 * @position Internal hooks; used by XDSSelector.tsx
 */

import {useCallback, useRef, useState} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {RefObject} from 'react';
import type {XDSSelectorOptionData} from './types';

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

    // useXDSLayer positions the popover below the trigger. Apply a negative
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
  selectableItems: XDSSelectorOptionData[];
  value?: string;
  isDisabled?: boolean;
  isOpen: boolean;
  hasSearch?: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect?: (value: string) => void;
  listboxId: string;
}

interface UseComboboxResult {
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  getItemId: (index: number) => string;
  onTriggerClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onItemSelect: (item: XDSSelectorOptionData) => void;
  onItemMouseEnter: (item: XDSSelectorOptionData, index: number) => void;
}

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
  listboxId,
}: UseComboboxOptions): UseComboboxResult {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [typeahead, setTypeahead] = useState('');
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

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
    onClose();
  }, [onClose]);

  const selectItem = useCallback(
    (item: XDSSelectorOptionData) => {
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
    (item: XDSSelectorOptionData, index: number) => {
      if (!item.disabled) {
        setHighlightedIndex(index);
      }
    },
    [],
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

        default:
          if (!hasSearch && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            const newTypeahead = typeahead + e.key.toLowerCase();
            setTypeahead(newTypeahead);

            if (typeaheadTimeoutRef.current) {
              clearTimeout(typeaheadTimeoutRef.current);
            }
            typeaheadTimeoutRef.current = setTimeout(() => {
              setTypeahead('');
            }, 500);

            const matchIndex = selectableItems.findIndex(
              item =>
                !item.disabled &&
                item.label?.toLowerCase().startsWith(newTypeahead),
            );
            if (matchIndex >= 0) {
              if (!isOpen) {
                onOpen();
              }
              setHighlightedIndex(matchIndex);
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
      typeahead,
      hasSearch,
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
