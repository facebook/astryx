// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BaseTypeahead.tsx
 * @input Uses React, StyleX, usePopover, TypeaheadItem
 * @output Exports BaseTypeahead combobox engine component
 * @position Core implementation; used by Typeahead and Tokenizer
 *
 * Pure combobox engine: input, search, keyboard navigation, dropdown.
 * No wrapper div, no border styling, no token rendering.
 * Consumers provide their own wrapper and pass anchorRef for dropdown positioning.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Typeahead/index.ts
 * - /packages/cli/templates/blocks/components/Typeahead/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {usePopover} from '../Popover/usePopover';
import {useAnnounce} from '../hooks/useAnnounce';
import {TypeaheadItem} from './TypeaheadItem';
import {Icon} from '../Icon';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  fontWeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {getKey, mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SearchableItem, SearchSource} from './types';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

// =============================================================================
// Types
// =============================================================================

export interface BaseTypeaheadProps<T extends SearchableItem> extends Omit<
  BaseProps<HTMLElement>,
  'onChange'
> {
  ref?: React.Ref<HTMLInputElement>;
  /**
   * Search source providing items.
   */
  searchSource: SearchSource<T>;

  /**
   * Currently selected item (null = nothing selected).
   */
  value: T | null;

  /**
   * Callback when selection changes.
   */
  onChange: (item: T | null) => void;

  /**
   * Render function for dropdown items. Default: TypeaheadItem.
   */
  renderItem?: (item: T) => ReactNode;

  /**
   * Placeholder text.
   */
  placeholder?: string;

  /**
   * Show results on focus before typing.
   * @default false
   */
  hasEntriesOnFocus?: boolean;

  /**
   * Max dropdown items to display.
   * @default 10
   */
  maxMenuItems?: number;

  /**
   * Text shown when no results found.
   * @default 'No results found'
   */
  emptySearchResultsText?: string;

  /**
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * When disabled with a reason, keeps the input focusable via `aria-disabled`
   * (instead of the native `disabled` attribute) and `readOnly` so an
   * associated disabled-reason tooltip stays discoverable by keyboard and
   * assistive technology. Value mutation is still blocked by the `isDisabled`
   * guards. Consumers (Typeahead) own the tooltip and wrapper.
   * @default false
   */
  isFocusableDisabled?: boolean;

  /**
   * Auto-focus on mount.
   * @default false
   */
  hasAutoFocus?: boolean;

  /**
   * Query change callback (for logging/external use).
   */
  onChangeQuery?: (query: string) => void;

  /**
   * Callback when dropdown opens/closes.
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Debounce delay in ms before triggering search after typing.
   * Set to 0 for synchronous/local search sources that don't need debouncing.
   * @default 150
   */
  debounceMs?: number;

  /**
   * ID for the input element (for label association).
   */
  inputId?: string;

  /**
   * Additional aria-describedby IDs.
   */
  ariaDescribedBy?: string;

  /**
   * Additional aria-labelledby IDs.
   */
  ariaLabelledBy?: string;

  /**
   * Additional StyleX styles for the input element.
   */
  inputXStyle?: StyleXStyles;

  /**
   * Ref to the anchor element for dropdown positioning.
   * The dropdown will be positioned relative to this element.
   * If not provided, the input itself is used as the anchor.
   */
  anchorRef?: RefObject<HTMLElement | null>;

  /**
   * Additional keydown handler called before internal keyboard navigation.
   * If the handler calls `e.preventDefault()`, internal handling is skipped.
   */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  /**
   * Size of the typeahead, used to scale dropdown item padding.
   * When 'sm', items get compact padding to match the trigger size.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  input: {
    display: 'block',
    flex: 1,
    minWidth: '60px',
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
  dropdown: {
    boxSizing: 'border-box',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
  },
  popover: {
    minWidth: 'anchor-size(width)',
  },
  popoverGap: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  item: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    cursor: 'pointer',
    outline: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
  },
  itemHighlighted: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  itemSelected: {
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  itemContent: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
  },
  emptyState: {
    padding: spacingVars['--spacing-3'],
    textAlign: 'center',
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
  loadingSpinner: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingVars['--spacing-1'],
  },
});

/**
 * Size-specific overrides for dropdown list items.
 * Matches the pattern used by DropdownMenuItem / Selector so that
 * an `sm` typeahead renders compact list items.
 */
const itemSizeStyles = stylex.create({
  sm: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
  },
  md: {
    paddingBlock: spacingVars['--spacing-1-5'],
  },
  lg: {
    paddingBlock: spacingVars['--spacing-2'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Combobox engine: input, search, keyboard navigation, and dropdown.
 *
 * Renders only the `<input>` and the dropdown popover. No wrapper div,
 * no border styling, no token rendering. Consumers (Typeahead,
 * Tokenizer) provide their own wrapper and pass `anchorRef` for
 * dropdown positioning.
 *
 * @example
 * ```
 * <BaseTypeahead
 *   searchSource={source}
 *   value={selected}
 *   onChange={setSelected}
 *   anchorRef={wrapperRef}
 *   placeholder="Search..."
 * />
 * ```
 */
export const BaseTypeahead = function BaseTypeahead<T extends SearchableItem>({
  searchSource,
  value,
  onChange,
  renderItem,
  placeholder = 'Search...',
  hasEntriesOnFocus = false,
  maxMenuItems = 10,
  emptySearchResultsText: emptySearchResultsTextFromProps,
  isDisabled = false,
  isFocusableDisabled = false,
  hasAutoFocus = false,
  onChangeQuery,
  onOpenChange,
  inputId: externalInputId,
  ariaDescribedBy,
  ariaLabelledBy,
  inputXStyle,
  anchorRef,
  onKeyDown: externalOnKeyDown,
  debounceMs = 150,
  size = 'md',
  ref,
}: BaseTypeaheadProps<T>) {
  const t = useTranslator();
  const emptySearchResultsText =
    emptySearchResultsTextFromProps ??
    t('@astryx.typeahead.emptySearchResults');
  const generatedId = useId();
  const inputId = externalInputId ?? generatedId;
  const listboxId = useId();

  const inputRef = useRef<HTMLInputElement>(null);
  const fallbackAnchorRef = useRef<HTMLInputElement>(null);

  // Announce result counts / "no results" to screen readers via a persistent
  // live region (comboboxes-6). The combobox's own popup carries no working
  // live region, so highlight/result changes were previously silent.
  const announce = useAnnounce();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Track active pointer to defer popover.show() past click events.
  // With popover="auto", showing the popover between pointerdown and
  // pointerup/click causes the browser's light-dismiss to immediately
  // close it (the click is seen as "outside" the newly-opened popover).
  const pointerActiveRef = useRef(false);

  // Debounce ref
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Monotonic counter incremented on selection and query-clear. Async
  // searches that resolve after a selection compare their captured
  // generation to the current value and discard stale results.
  const searchGenRef = useRef(0);
  // The generation at which results were last populated. handleFocus
  // compares this to searchGenRef — if they differ, the cached results
  // in the closure are stale (a selection cleared them) and shouldn't
  // be re-shown.
  const resultsGenRef = useRef(0);

  // Layer for dropdown
  const handleLayerShow = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handleLayerHide = useCallback(() => {
    onOpenChange?.(false);
    setHighlightedIndex(-1);
    searchSource.cancel?.();
  }, [onOpenChange, searchSource]);

  const popover = usePopover({
    onShow: handleLayerShow,
    onHide: handleLayerHide,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
    // The popup's own role="listbox" is the exposed semantics; the input keeps
    // DOM focus, so wrapping it in a modal dialog would misrepresent it.
    role: 'none',
  });

  // Show the layer, deferring past the active click if a pointer is down.
  // Without this, popover="auto" light-dismiss immediately closes the
  // dropdown when it opens between pointerdown and pointerup/click.
  const showLayer = useCallback(() => {
    if (pointerActiveRef.current) {
      document.addEventListener(
        'click',
        () => requestAnimationFrame(() => popover.show()),
        {once: true},
      );
    } else {
      popover.show();
    }
  }, [popover]);

  // Set up anchor on the provided anchorRef or fall back to the input itself
  useEffect(() => {
    const el = anchorRef?.current ?? fallbackAnchorRef.current;
    if (el) {
      popover.triggerRef(el);
    }
    return () => {
      popover.triggerRef(null);
    };
  }, [popover, anchorRef]);

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      searchSource.cancel?.();
      // Claim a new generation so overlapping searches can't race: an
      // in-flight response for an older query fails the gen check below
      // instead of overwriting the newer results.
      const gen = ++searchGenRef.current;
      setIsLoading(true);
      setHasSearched(true);
      try {
        const searchResults = await searchSource.search(searchQuery);
        if (searchGenRef.current !== gen) {
          return;
        }
        resultsGenRef.current = gen;
        const shown = searchResults.slice(0, maxMenuItems);
        setResults(shown);
        setHighlightedIndex(searchResults.length > 0 ? 0 : -1);
        if (searchResults.length > 0 || searchQuery.length > 0) {
          showLayer();
        }
        // Announce the outcome only for an active query (not the initial
        // focus-open), so screen-reader users hear result counts / no-results.
        if (searchQuery.length > 0) {
          announce(
            shown.length === 0
              ? emptySearchResultsText
              : `${shown.length} ${shown.length === 1 ? 'result' : 'results'}`,
          );
        }
      } catch {
        if (searchGenRef.current !== gen) {
          return;
        }
        setResults([]);
        setHighlightedIndex(-1);
      } finally {
        if (searchGenRef.current === gen) {
          setIsLoading(false);
        }
      }
    },
    [searchSource, maxMenuItems, showLayer, announce, emptySearchResultsText],
  );

  // Perform bootstrap
  const performBootstrap = useCallback(async () => {
    const gen = ++searchGenRef.current;
    setIsLoading(true);
    try {
      const bootstrapResults = await searchSource.bootstrap();
      if (searchGenRef.current !== gen) {
        return;
      }
      resultsGenRef.current = gen;
      setResults(bootstrapResults.slice(0, maxMenuItems));
      setHighlightedIndex(bootstrapResults.length > 0 ? 0 : -1);
      if (bootstrapResults.length > 0) {
        showLayer();
      }
    } catch {
      if (searchGenRef.current !== gen) {
        return;
      }
      setResults([]);
    } finally {
      if (searchGenRef.current === gen) {
        setIsLoading(false);
      }
    }
  }, [searchSource, maxMenuItems, showLayer]);

  // Handle query change
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      onChangeQuery?.(newQuery);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (newQuery.length === 0 && !hasEntriesOnFocus) {
        searchGenRef.current++;
        searchSource.cancel?.();
        setResults([]);
        setHasSearched(false);
        // Clear any lingering result-count / no-results announcement.
        announce('');
        popover.hide();
        return;
      }

      const triggerSearch = () => {
        if (newQuery.length > 0) {
          void performSearch(newQuery);
        } else if (hasEntriesOnFocus) {
          void performBootstrap();
        }
      };

      if (debounceMs <= 0) {
        triggerSearch();
      } else {
        searchTimeoutRef.current = setTimeout(triggerSearch, debounceMs);
      }
    },
    [
      onChangeQuery,
      hasEntriesOnFocus,
      performSearch,
      performBootstrap,
      popover,
      debounceMs,
      searchSource,
      announce,
    ],
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleQueryChange(e.target.value);
    },
    [handleQueryChange],
  );

  // Handle item selection
  const handleSelect = useCallback(
    (item: T) => {
      // Bump generation to invalidate any in-flight async searches
      searchGenRef.current++;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      searchSource.cancel?.();
      onChange(item);
      setQuery('');
      setResults([]);
      setHasSearched(false);
      popover.hide();
      inputRef.current?.focus();
    },
    [onChange, popover, searchSource],
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    if (isDisabled) {
      return;
    }
    if (hasEntriesOnFocus && results.length === 0 && query.length === 0) {
      void performBootstrap();
    } else if (
      results.length > 0 &&
      (query.length > 0 || hasEntriesOnFocus) &&
      // Only re-show cached results if they haven't been invalidated by
      // a selection. Refs are always current, so this check isn't affected
      // by React's closure staleness the way results.length is.
      resultsGenRef.current === searchGenRef.current
    ) {
      showLayer();
    }
  }, [
    isDisabled,
    hasEntriesOnFocus,
    results.length,
    query.length,
    performBootstrap,
    showLayer,
  ]);

  // Handle blur — close the dropdown when focus leaves the input for an
  // element that is neither inside the field wrapper (anchor) nor inside the
  // dropdown popover. The native popover="auto" light-dismiss only fires on
  // outside pointer clicks and Escape; it does not close when focus moves away
  // via the keyboard (Tab) or programmatically, which would otherwise leave an
  // orphaned open menu. Clicking a result moves focus onto the option (it is
  // tabIndex={-1}, so it lives inside the popover) and selection re-focuses the
  // input, so this only closes on a genuine focus-out of the whole field.
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (!popover.isOpen) {
        return;
      }
      const next = e.relatedTarget as Node | null;
      if (next) {
        const anchorEl = anchorRef?.current ?? fallbackAnchorRef.current;
        const popoverEl = document.getElementById(popover.id);
        if (anchorEl?.contains(next) || popoverEl?.contains(next)) {
          return;
        }
      }
      popover.hide();
    },
    [popover, anchorRef],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      externalOnKeyDown?.(e);
      if (e.defaultPrevented) {
        return;
      }

      if (!popover.isOpen) {
        if (e.key === 'ArrowDown' && (hasEntriesOnFocus || query.length > 0)) {
          e.preventDefault();
          if (results.length > 0) {
            popover.show();
            setHighlightedIndex(0);
          } else if (hasEntriesOnFocus) {
            void performBootstrap();
          }
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < results.length - 1 ? prev + 1 : 0,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : results.length - 1,
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < results.length) {
            handleSelect(results[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          popover.hide();
          break;
        case 'Home':
          if (popover.isOpen) {
            e.preventDefault();
            setHighlightedIndex(0);
          }
          break;
        case 'End':
          if (popover.isOpen) {
            e.preventDefault();
            setHighlightedIndex(results.length - 1);
          }
          break;
      }
    },
    [
      popover,
      results,
      highlightedIndex,
      handleSelect,
      hasEntriesOnFocus,
      query.length,
      performBootstrap,
      externalOnKeyDown,
    ],
  );

  // Generate item ID for accessibility
  const getItemId = useCallback(
    (index: number) => `${listboxId}-option-${index}`,
    [listboxId],
  );

  // Keep the highlighted option visible during keyboard navigation. The
  // listbox is a fixed-height scroll container, so without this the virtual
  // cursor walks off-screen once navigation passes the visible window. Mirrors
  // CommandPaletteItem's scrollIntoView({block: 'nearest'}) behavior.
  useEffect(() => {
    if (!popover.isOpen || highlightedIndex < 0) {
      return;
    }
    document
      .getElementById(getItemId(highlightedIndex))
      ?.scrollIntoView?.({block: 'nearest'});
  }, [popover.isOpen, highlightedIndex, getItemId]);

  const selectedKey =
    value == null ? null : getKey(value.id, () => results.indexOf(value));

  // Cleanup timeout and cancel in-flight searches on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchSource.cancel?.();
    };
  }, [searchSource]);

  return (
    <>
      <input
        ref={mergeRefs(ref, inputRef, fallbackAnchorRef)}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={popover.isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          popover.isOpen && highlightedIndex >= 0
            ? getItemId(highlightedIndex)
            : undefined
        }
        aria-autocomplete="list"
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabelledBy}
        aria-disabled={isFocusableDisabled ? 'true' : undefined}
        value={query}
        onChange={handleInputChange}
        onPointerDown={() => {
          pointerActiveRef.current = true;
          document.addEventListener(
            'click',
            () => {
              pointerActiveRef.current = false;
            },
            {once: true},
          );
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        // When a disabled-reason tooltip is shown the input keeps focusability
        // via aria-disabled + readOnly instead of the native disabled
        // attribute; value mutation stays blocked by the isDisabled guards.
        disabled={isDisabled && !isFocusableDisabled}
        readOnly={isFocusableDisabled || undefined}
        autoFocus={hasAutoFocus}
        data-autofocus={hasAutoFocus || undefined}
        autoComplete="off"
        {...stylex.props(
          styles.input,
          isDisabled && styles.inputDisabled,
          inputXStyle,
        )}
      />
      {isLoading && (
        <span
          role="status"
          aria-label={t('@astryx.typeahead.loading')}
          {...stylex.props(styles.loadingSpinner)}>
          <Icon icon="clock" size="sm" color="secondary" />
        </span>
      )}

      {popover.render(
        <div
          id={listboxId}
          role="listbox"
          aria-label={t('@astryx.typeahead.searchResults')}
          {...mergeProps(
            themeProps('typeahead-dropdown'),
            stylex.props(styles.dropdown),
          )}>
          {results.length === 0 && hasSearched ? (
            <div {...stylex.props(styles.emptyState)}>
              {emptySearchResultsText}
            </div>
          ) : (
            results.map((item, index) => {
              const itemKey = getKey(item.id, index);
              const isSelected = itemKey === selectedKey;
              return (
                <div
                  key={itemKey}
                  id={getItemId(index)}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  {...stylex.props(
                    styles.item,
                    itemSizeStyles[size],
                    index === highlightedIndex && styles.itemHighlighted,
                    isSelected && styles.itemSelected,
                  )}>
                  <span {...stylex.props(styles.itemContent)}>
                    {renderItem ? (
                      renderItem(item)
                    ) : (
                      <TypeaheadItem item={item} />
                    )}
                  </span>
                  {isSelected && (
                    <Icon icon="check" size="sm" color="primary" />
                  )}
                </div>
              );
            })
          )}
        </div>,
        {
          placement: 'below',
          alignment: 'start',
          xstyle: [styles.popover, styles.popoverGap],
        },
      )}
    </>
  );
} as <T extends SearchableItem>(
  props: BaseTypeaheadProps<T>,
) => React.ReactElement;

(BaseTypeahead as {displayName?: string}).displayName = 'BaseTypeahead';
