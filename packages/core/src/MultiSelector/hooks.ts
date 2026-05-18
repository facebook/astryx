// Copyright (c) Meta Platforms, Inc. and affiliates.

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
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  getItemId: (index: number) => string;
  onTriggerClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onItemMouseEnter: (item: XDSMultiSelectorOptionData, index: number) => void;
}

/**
 * Handles keyboard navigation and toggle logic for multi-select combobox.
 * Works like useCombobox (index-based) but toggling does NOT close the dropdown.
 *
 * The caller must ensure selectableItems is in the same order as the rendered DOM.
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

  const closeAndReset = useCallback(() => {
    setHighlightedIndex(-1);
    onClose();
  }, [onClose]);

  const onTriggerClick = useCallback(() => {
    if (isDisabled) return;
    if (isOpen) {
      closeAndReset();
    } else {
      onOpen();
      if (!hasSearch) {
        setHighlightedIndex(0);
      }
    }
  }, [isDisabled, isOpen, onOpen, closeAndReset, hasSearch]);

  const onItemMouseEnter = useCallback(
    (item: XDSMultiSelectorOptionData, index: number) => {
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
          // Don't intercept Space when search input is focused
          if (e.key === ' ' && hasSearch) {
            break;
          }
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const item = selectableItems[highlightedIndex];
            if (item && !item.disabled) {
              onToggle(item.value);
            }
          } else if (!isOpen) {
            onOpen();
            if (!hasSearch) {
              setHighlightedIndex(0);
            }
          }
          break;

        case 'Tab':
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
      onToggle,
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
    onItemMouseEnter,
  };
}
