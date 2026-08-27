// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file hooks.ts
 * @input Uses untransformed DOM layout geometry from the Selector's outer
 *   anchor, listbox, and selected option
 * @output Hooks for Selector
 * @position Internal hooks; used by Selector.tsx
 */

import {useCallback, useState} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {RefObject} from 'react';
import type {SelectorOptionData} from './types';

// The selected row renders one optical pixel below the closed trigger label at
// the same mathematical center, so compensate before viewport clamping.
const SELECTED_ITEM_OPTICAL_OFFSET = 1;

/**
 * Return an element's document-relative layout top without CSS transforms.
 * getBoundingClientRect includes the popover's entry scale, which would make
 * the measured error grow with each option's distance from the menu top.
 */
function getLayoutTop(element: HTMLElement): number {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

// =============================================================================
// useSelectedItemOffset - Position dropdown to center selected item over trigger
// =============================================================================

interface UseSelectedItemOffsetOptions {
  isOpen: boolean;
  selectedItemIndex: number;
  listboxId: string;
  listboxRef: RefObject<HTMLDivElement | null>;
  anchorRef: RefObject<HTMLElement | null>;
}

interface UseSelectedItemOffsetResult {
  offset: number;
  isPositioned: boolean;
}

/**
 * Calculates the offset needed to position the dropdown so that the selected
 * item appears centered over the outer selector control (macOS-style selector).
 *
 * The desired dropdown top is calculated directly from the anchor center and
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
  anchorRef,
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

    if (!listboxRef.current || !anchorRef.current) {
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

    const listbox = listboxRef.current;
    const anchorRect = anchorRef.current.getBoundingClientRect();

    // offset* metrics intentionally exclude the popover's entry transform.
    const listboxHeight = listbox.offsetHeight;
    if (listboxHeight <= 0) {
      commitPosition(0, true);
      return;
    }

    // Item center relative to listbox top. This remains stable even as the
    // popover animates between scale values. scrollTop keeps the calculation
    // correct when a previously scrolled listbox is reopened.
    const itemCenterInListbox =
      getLayoutTop(targetItem) -
      getLayoutTop(listbox) -
      listbox.scrollTop +
      targetItem.offsetHeight / 2;
    const anchorCenter = anchorRect.top + anchorRect.height / 2;

    // Desired top aligns the selected item's center with the anchor center.
    const desiredTop =
      anchorCenter - itemCenterInListbox - SELECTED_ITEM_OPTICAL_OFFSET;
    const viewportHeight = window.innerHeight;
    const maxTop = Math.max(0, viewportHeight - listboxHeight);
    const clampedTop = Math.min(Math.max(desiredTop, 0), maxTop);

    // useLayer positions the popover below the outer anchor. Apply a negative
    // block-start margin to the layer container so the listbox top moves from
    // anchorRect.bottom to clampedTop.
    const clampedOffset = Math.max(0, anchorRect.bottom - clampedTop);

    commitPosition(clampedOffset, true);
  }, [
    isOpen,
    selectedItemIndex,
    listboxId,
    listboxRef,
    anchorRef,
    commitPosition,
  ]);

  return {offset, isPositioned};
}

// =============================================================================
// useCombobox - Keyboard navigation and selection
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
   * Whether the browser's light dismiss just closed the popup. The trigger
   * click that follows belongs to that same press, so acting on it would
   * reopen the popup the user just closed.
   */
  wasJustDismissed?: () => boolean;
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
 * Handles keyboard navigation and selection for combobox/listbox patterns.
 *
 * Type-to-select is not handled here: callers that want it compose the shared
 * `useTypeahead` hook and run it ahead of this handler (see Selector). That
 * keeps matching consistent with the other collections and leaves consumers
 * whose own input already filters the items (CommandPalette) untouched.
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
  wasJustDismissed,
  listboxId,
}: UseComboboxOptions): UseComboboxResult {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

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
    if (isDisabled || wasJustDismissed?.()) {
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
  }, [
    isDisabled,
    wasJustDismissed,
    isOpen,
    onOpen,
    closeAndReset,
    findSelectedIndex,
    hasSearch,
  ]);

  const onItemMouseEnter = useCallback(
    (item: SelectorOptionData, index: number) => {
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
        // A space mid-typeahead extends the query instead of activating; the
        // caller's useTypeahead claims it before this handler ever runs.
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
            onClear();
          }
          break;

        default:
          // Keys land here only while the trigger holds focus — once the search
          // input takes over it handles its own typing — so they belong in the
          // query, including the ones racing the open.
          if (
            hasSearch &&
            onSearchSeed &&
            e.key.length === 1 &&
            !e.ctrlKey &&
            !e.metaKey
          ) {
            if (!isOpen) {
              onOpen();
            }
            onSearchSeed(e.key);
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
      hasSearch,
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
