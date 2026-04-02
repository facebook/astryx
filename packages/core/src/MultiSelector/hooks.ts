'use client';

/**
 * @file hooks.ts
 * @input Uses React hooks, XDSMultiSelectorOptionData type
 * @output Exports useMultiCombobox hook
 * @position Internal hook; used by XDSMultiSelector.tsx
 *
 * SYNC: When modified, update:
 * - /packages/core/src/MultiSelector/index.ts
 */

import {useCallback, useRef, useState} from 'react';
import type {XDSMultiSelectorOptionData} from './types';

interface UseMultiComboboxOptions {
  selectableItems: XDSMultiSelectorOptionData[];
  isDisabled?: boolean;
  isOpen: boolean;
  hasSearch?: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: (itemValue: string) => void;
  listboxId: string;
}

interface UseMultiComboboxResult {
  highlightedValue: string | null;
  getItemId: (value: string) => string;
  onTriggerClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onItemMouseEnter: (item: XDSMultiSelectorOptionData) => void;
}

/**
 * Handles keyboard navigation and toggle logic for multi-select combobox.
 * Unlike useCombobox (single-select), toggling an item does NOT close the dropdown.
 *
 * Uses value-based highlighting (not positional indices) so that keyboard
 * navigation and selection are decoupled from render order.
 */
export function useMultiCombobox({
  selectableItems,
  isDisabled = false,
  isOpen,
  hasSearch = false,
  onOpen,
  onClose,
  onToggle,
  listboxId,
}: UseMultiComboboxOptions): UseMultiComboboxResult {
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
  const [typeahead, setTypeahead] = useState('');
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const getItemId = useCallback(
    (value: string) => `${listboxId}-item-${encodeURIComponent(value)}`,
    [listboxId],
  );

  const getEnabledItems = useCallback(() => {
    return selectableItems.filter(item => !item.disabled);
  }, [selectableItems]);

  // Find the position of the highlighted value in the current items list
  const getHighlightedPosition = useCallback(() => {
    if (highlightedValue == null) return -1;
    return selectableItems.findIndex(item => item.value === highlightedValue);
  }, [selectableItems, highlightedValue]);

  const closeAndReset = useCallback(() => {
    setHighlightedValue(null);
    onClose();
  }, [onClose]);

  const highlightFirstEnabled = useCallback(() => {
    const enabled = getEnabledItems();
    if (enabled.length > 0) {
      setHighlightedValue(enabled[0].value);
    }
  }, [getEnabledItems]);

  const highlightLastEnabled = useCallback(() => {
    const enabled = getEnabledItems();
    if (enabled.length > 0) {
      setHighlightedValue(enabled[enabled.length - 1].value);
    }
  }, [getEnabledItems]);

  const onTriggerClick = useCallback(() => {
    if (isDisabled) return;
    if (isOpen) {
      closeAndReset();
    } else {
      onOpen();
      // If search is present, don't highlight any item (focus goes to search)
      if (!hasSearch) {
        highlightFirstEnabled();
      }
    }
  }, [
    isDisabled,
    isOpen,
    onOpen,
    closeAndReset,
    hasSearch,
    highlightFirstEnabled,
  ]);

  const onItemMouseEnter = useCallback((item: XDSMultiSelectorOptionData) => {
    if (!item.disabled) {
      setHighlightedValue(item.value);
    }
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isDisabled) return;

      const enabledItems = getEnabledItems();

      // Build an ordered list of enabled values for navigation
      const enabledValues = enabledItems.map(item => item.value);

      // Find current position among enabled items
      const currentEnabledPos =
        highlightedValue != null ? enabledValues.indexOf(highlightedValue) : -1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
            highlightFirstEnabled();
          } else if (enabledValues.length > 0) {
            const nextPos = Math.min(
              currentEnabledPos + 1,
              enabledValues.length - 1,
            );
            setHighlightedValue(enabledValues[nextPos]);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
            highlightLastEnabled();
          } else if (enabledValues.length > 0) {
            const prevPos = Math.max(currentEnabledPos - 1, 0);
            setHighlightedValue(enabledValues[prevPos]);
          }
          break;

        case 'Enter':
        case ' ':
          // Don't intercept Space when search input is focused
          if (e.key === ' ' && hasSearch) {
            break;
          }
          e.preventDefault();
          if (isOpen && highlightedValue != null) {
            const item = selectableItems.find(
              i => i.value === highlightedValue,
            );
            if (item && !item.disabled) {
              onToggle(item.value);
            }
          } else if (!isOpen) {
            onOpen();
            if (!hasSearch) {
              highlightFirstEnabled();
            }
          }
          break;

        case 'Tab':
          // Close the combobox and let the browser move focus to the next element
          if (isOpen) {
            closeAndReset();
          }
          break;

        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            closeAndReset();
          }
          break;

        case 'Home':
          e.preventDefault();
          if (isOpen) {
            highlightFirstEnabled();
          }
          break;

        case 'End':
          e.preventDefault();
          if (isOpen) {
            highlightLastEnabled();
          }
          break;

        default:
          // Typeahead only when search is not present
          if (!hasSearch && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            const newTypeahead = typeahead + e.key.toLowerCase();
            setTypeahead(newTypeahead);

            if (typeaheadTimeoutRef.current) {
              clearTimeout(typeaheadTimeoutRef.current);
            }
            typeaheadTimeoutRef.current = setTimeout(() => {
              setTypeahead('');
            }, 500);

            const match = selectableItems.find(
              item =>
                !item.disabled &&
                item.label?.toLowerCase().startsWith(newTypeahead),
            );
            if (match) {
              if (!isOpen) {
                onOpen();
              }
              setHighlightedValue(match.value);
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
      highlightedValue,
      onToggle,
      getEnabledItems,
      highlightFirstEnabled,
      highlightLastEnabled,
      typeahead,
      hasSearch,
    ],
  );

  return {
    highlightedValue,
    getItemId,
    onTriggerClick,
    onKeyDown,
    onItemMouseEnter,
  };
}
