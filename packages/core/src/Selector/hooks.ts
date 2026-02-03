/**
 * @file hooks.ts
 * @output Hooks for XDSSelector
 * @position Internal hooks; used by XDSSelector.tsx
 */

import {useCallback, useLayoutEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {XDSSelectorItemData} from './types';

// =============================================================================
// useSelectedItemOffset - Position dropdown to center selected item over trigger
// =============================================================================

interface UseSelectedItemOffsetOptions {
  isOpen: boolean;
  selectedItemIndex: number;
  listboxId: string;
  listboxRef: RefObject<HTMLDivElement>;
  triggerRef: RefObject<HTMLButtonElement>;
}

interface UseSelectedItemOffsetResult {
  offset: number;
  isPositioned: boolean;
}

/**
 * Calculates the offset needed to position the dropdown so that the selected
 * item appears centered over the trigger button (macOS-style selector).
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

  useLayoutEffect(() => {
    if (!isOpen) {
      // Reset offset when closed
      setOffset(0);
      setIsPositioned(false);
      return;
    }

    if (!listboxRef.current || !triggerRef.current) {
      setIsPositioned(true);
      return;
    }

    // Find the target item: selected item or first item
    const targetIndex = selectedItemIndex >= 0 ? selectedItemIndex : 0;
    const targetItemId = `${listboxId}-item-${targetIndex}`;
    // Use getElementById - works with special characters without escaping
    const targetItem = document.getElementById(targetItemId);

    if (!targetItem) {
      setOffset(0);
      setIsPositioned(true);
      return;
    }

    // Get positions
    const listboxRect = listboxRef.current.getBoundingClientRect();
    const itemRect = targetItem.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();

    // Calculate offset to center the item over the trigger
    // The listbox is positioned below the trigger by anchor positioning (top of listbox at bottom of trigger)
    // We need to move it UP so the selected item's center aligns with trigger's center
    //
    // Item center relative to listbox top:
    const itemCenterInListbox =
      itemRect.top - listboxRect.top + itemRect.height / 2;
    //
    // To center item over trigger, we need to move up by:
    // (item center in listbox) + (half trigger height to reach trigger's center from its bottom edge)
    const calculatedOffset = itemCenterInListbox + triggerRect.height / 2;

    setOffset(calculatedOffset);
    setIsPositioned(true);
  }, [isOpen, selectedItemIndex, listboxId, listboxRef, triggerRef]);

  return {offset, isPositioned};
}

// =============================================================================
// useCombobox - Keyboard navigation, typeahead, and selection
// =============================================================================

interface UseComboboxOptions {
  selectableItems: XDSSelectorItemData[];
  value?: string;
  isDisabled?: boolean;
  isOpen: boolean;
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
  onItemSelect: (item: XDSSelectorItemData) => void;
  onItemMouseEnter: (item: XDSSelectorItemData, index: number) => void;
}

/**
 * Handles keyboard navigation, typeahead search, and selection for combobox/listbox patterns.
 */
export function useCombobox({
  selectableItems,
  value,
  isDisabled = false,
  isOpen,
  onOpen,
  onClose,
  onSelect,
  listboxId,
}: UseComboboxOptions): UseComboboxResult {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [typeahead, setTypeahead] = useState('');
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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
    (item: XDSSelectorItemData) => {
      if (item.disabled) return;
      onSelect?.(item.value);
      closeAndReset();
    },
    [onSelect, closeAndReset],
  );

  const onTriggerClick = useCallback(() => {
    if (isDisabled) return;
    if (isOpen) {
      closeAndReset();
    } else {
      onOpen();
      const selectedIndex = findSelectedIndex();
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isDisabled, isOpen, onOpen, closeAndReset, findSelectedIndex]);

  const onItemMouseEnter = useCallback(
    (item: XDSSelectorItemData, index: number) => {
      if (!item.disabled) {
        setHighlightedIndex(index);
      }
    },
    [],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isDisabled) return;

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

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const item = selectableItems[highlightedIndex];
            if (item && !item.disabled) {
              selectItem(item);
            }
          } else if (!isOpen) {
            onOpen();
            const selectedIndex = findSelectedIndex();
            setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
          }
          break;

        case 'Escape':
          e.preventDefault();
          closeAndReset();
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
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
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
