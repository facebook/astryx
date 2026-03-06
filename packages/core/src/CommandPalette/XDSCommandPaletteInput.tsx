/**
 * @file XDSCommandPaletteInput.tsx
 * @input Uses React, StyleX, CommandPaletteContext, XDSIcon
 * @output Exports XDSCommandPaletteInput component
 * @position Sub-component; renders the search input inside XDSCommandPalette
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 */

'use client';

import {useCallback, useRef, useEffect, type KeyboardEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import {useCommandPaletteContext} from './CommandPaletteContext';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-divider'],
  },
  icon: {
    flexShrink: 0,
    color: colorVars['--color-text-secondary'],
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    padding: 0,
    '::placeholder': {
      color: colorVars['--color-text-placeholder'],
    },
  },
});

export interface XDSCommandPaletteInputProps {
  /**
   * Placeholder text for the search input.
   * @default "Search..."
   */
  placeholder?: string;

  /**
   * StyleX overrides for the input wrapper.
   */
  xstyle?: StyleXStyles;
}

/**
 * Search input for the command palette.
 * Handles keyboard navigation (arrow keys, enter, escape).
 *
 * @example
 * ```
 * <XDSCommandPalette isOpen={isOpen} onOpenChange={onOpenChange}>
 *   <XDSCommandPaletteInput placeholder="Search commands..." />
 *   <XDSCommandPaletteList>...</XDSCommandPaletteList>
 * </XDSCommandPalette>
 * ```
 */
export function XDSCommandPaletteInput({
  placeholder = 'Search...',
  xstyle,
}: XDSCommandPaletteInputProps) {
  const {
    search,
    setSearch,
    listId,
    highlightedIndex,
    setHighlightedIndex,
    items,
    selectItem,
    onClose,
  } = useCommandPaletteContext();

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when mounted
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation is handled here rather than via useListFocus because
  // filtering causes items to appear/disappear dynamically. useListFocus is
  // designed for static lists and doesn't account for items being filtered out
  // mid-navigation. The combobox pattern (input + listbox) also requires the
  // input to own focus while aria-activedescendant tracks the highlighted item.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          // Find next enabled item
          let next = highlightedIndex + 1;
          while (next < items.length && items[next]?.isDisabled) {
            next++;
          }
          if (next < items.length) {
            setHighlightedIndex(next);
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          let prev = highlightedIndex - 1;
          while (prev >= 0 && items[prev]?.isDisabled) {
            prev--;
          }
          if (prev >= 0) {
            setHighlightedIndex(prev);
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          let first = 0;
          while (first < items.length && items[first]?.isDisabled) {
            first++;
          }
          if (first < items.length) {
            setHighlightedIndex(first);
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          let last = items.length - 1;
          while (last >= 0 && items[last]?.isDisabled) {
            last--;
          }
          if (last >= 0) {
            setHighlightedIndex(last);
          }
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < items.length) {
            const item = items[highlightedIndex];
            if (item && !item.isDisabled) {
              selectItem(item.value);
            }
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          onClose();
          break;
        }
      }
    },
    [highlightedIndex, items, setHighlightedIndex, selectItem, onClose],
  );

  const activeDescendant =
    highlightedIndex >= 0 ? `${listId}-item-${highlightedIndex}` : undefined;

  return (
    <div {...stylex.props(styles.wrapper, xstyle)}>
      <div {...stylex.props(styles.icon)}>
        <XDSIcon icon="search" size="sm" color="secondary" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setHighlightedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={true}
        aria-controls={listId}
        aria-activedescendant={activeDescendant}
        aria-autocomplete="list"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        {...stylex.props(styles.input)}
      />
    </div>
  );
}

XDSCommandPaletteInput.displayName = 'XDSCommandPaletteInput';
