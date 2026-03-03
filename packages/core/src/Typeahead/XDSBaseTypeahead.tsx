/**
 * @file XDSBaseTypeahead.tsx
 * @input Uses React, StyleX, useXDSLayer, XDSTypeaheadItem
 * @output Exports XDSBaseTypeahead combobox engine component
 * @position Core implementation; used by XDSTypeahead and XDSTokenizer
 *
 * Pure combobox engine: input, search, keyboard navigation, dropdown.
 * No wrapper div, no border styling, no token rendering.
 * Consumers provide their own wrapper and pass anchorRef for dropdown positioning.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Typeahead/README.md
 * - /packages/core/src/Typeahead/index.ts
 */

import React, {
  forwardRef,
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
import {useXDSLayer} from '../Layer/useXDSLayer';
import {XDSTypeaheadItem} from './XDSTypeaheadItem';
import {XDSIcon} from '../Icon';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  lineHeightVars,
  typographyVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import type {XDSSearchableItem, XDSSearchSource} from './types';

// =============================================================================
// Types
// =============================================================================

export interface XDSBaseTypeaheadProps<T extends XDSSearchableItem> {
  /**
   * Search source providing items.
   */
  searchSource: XDSSearchSource<T>;

  /**
   * Currently selected item (null = nothing selected).
   */
  value: T | null;

  /**
   * Callback when selection changes.
   */
  onChange: (item: T | null) => void;

  /**
   * Render function for dropdown items. Default: XDSTypeaheadItem.
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
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
    '::placeholder': {
      color: colorVars['--color-text-placeholder'],
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
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    boxShadow: `0 4px 12px ${colorVars['--color-shadow-elevation']}`,
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
    borderRadius: radiusVars['--radius-content'],
    cursor: 'pointer',
    outline: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
  },
  itemHighlighted: {
    backgroundColor: colorVars['--color-hover-overlay'],
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
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-secondary'],
  },
  loadingSpinner: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingVars['--spacing-1'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Combobox engine: input, search, keyboard navigation, and dropdown.
 *
 * Renders only the `<input>` and the dropdown popover. No wrapper div,
 * no border styling, no token rendering. Consumers (XDSTypeahead,
 * XDSTokenizer) provide their own wrapper and pass `anchorRef` for
 * dropdown positioning.
 *
 * @example
 * ```
 * <XDSBaseTypeahead
 *   searchSource={source}
 *   value={selected}
 *   onChange={setSelected}
 *   anchorRef={wrapperRef}
 *   placeholder="Search..."
 * />
 * ```
 */
export const XDSBaseTypeahead = forwardRef(function XDSBaseTypeahead<
  T extends XDSSearchableItem,
>(
  {
    searchSource,
    value,
    onChange,
    renderItem,
    placeholder = 'Search...',
    hasEntriesOnFocus = false,
    maxMenuItems = 10,
    emptySearchResultsText = 'No results found',
    isDisabled = false,
    hasAutoFocus = false,
    onChangeQuery,
    onOpenChange,
    inputId: externalInputId,
    ariaDescribedBy,
    inputXStyle,
    anchorRef,
    onKeyDown: externalOnKeyDown,
    debounceMs = 150,
  }: XDSBaseTypeaheadProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const generatedId = useId();
  const inputId = externalInputId ?? generatedId;
  const listboxId = useId();

  const inputRef = useRef<HTMLInputElement>(null);
  const fallbackAnchorRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce ref
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Layer for dropdown
  const layer = useXDSLayer({
    mode: 'context',
    lightDismiss: true,
    onShow: () => onOpenChange?.(true),
    onHide: () => {
      onOpenChange?.(false);
      setHighlightedIndex(-1);
      searchSource.cancel?.();
    },
  });

  // Merge refs: forward ref + internal ref + fallback anchor ref
  const setInputRef = useCallback(
    (el: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
        el;
      (
        fallbackAnchorRef as React.MutableRefObject<HTMLInputElement | null>
      ).current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
      }
    },
    [ref],
  );

  // Set up anchor on the provided anchorRef or fall back to the input itself
  useEffect(() => {
    const el = anchorRef?.current ?? fallbackAnchorRef.current;
    if (el) {
      layer.ref(el);
    }
    return () => {
      layer.ref(null);
    };
  }, [layer, anchorRef]);

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      searchSource.cancel?.();
      setIsLoading(true);
      setHasSearched(true);
      try {
        const searchResults = await searchSource.search(searchQuery);
        setResults(searchResults.slice(0, maxMenuItems));
        setHighlightedIndex(searchResults.length > 0 ? 0 : -1);
        if (searchResults.length > 0 || searchQuery.length > 0) {
          layer.show();
        }
      } catch {
        setResults([]);
        setHighlightedIndex(-1);
      } finally {
        setIsLoading(false);
      }
    },
    [searchSource, maxMenuItems, layer],
  );

  // Perform bootstrap
  const performBootstrap = useCallback(async () => {
    setIsLoading(true);
    try {
      const bootstrapResults = await searchSource.bootstrap();
      setResults(bootstrapResults.slice(0, maxMenuItems));
      setHighlightedIndex(bootstrapResults.length > 0 ? 0 : -1);
      if (bootstrapResults.length > 0) {
        layer.show();
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchSource, maxMenuItems, layer]);

  // Handle query change
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      onChangeQuery?.(newQuery);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (newQuery.length === 0 && !hasEntriesOnFocus) {
        searchSource.cancel?.();
        setResults([]);
        layer.hide();
        return;
      }

      const triggerSearch = () => {
        if (newQuery.length > 0) {
          performSearch(newQuery);
        } else if (hasEntriesOnFocus) {
          performBootstrap();
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
      layer,
      debounceMs,
      searchSource,
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
      onChange(item);
      setQuery('');
      setResults([]);
      layer.hide();
      inputRef.current?.focus();
    },
    [onChange, layer],
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    if (isDisabled) return;
    if (hasEntriesOnFocus && results.length === 0 && query.length === 0) {
      performBootstrap();
    } else if (query.length > 0 && results.length > 0) {
      layer.show();
    }
  }, [
    isDisabled,
    hasEntriesOnFocus,
    results.length,
    query.length,
    performBootstrap,
    layer,
  ]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      externalOnKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (!layer.isOpen) {
        if (e.key === 'ArrowDown' && (hasEntriesOnFocus || query.length > 0)) {
          e.preventDefault();
          if (results.length > 0) {
            layer.show();
            setHighlightedIndex(0);
          } else if (hasEntriesOnFocus) {
            performBootstrap();
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
          layer.hide();
          break;
        case 'Home':
          if (layer.isOpen) {
            e.preventDefault();
            setHighlightedIndex(0);
          }
          break;
        case 'End':
          if (layer.isOpen) {
            e.preventDefault();
            setHighlightedIndex(results.length - 1);
          }
          break;
      }
    },
    [
      layer,
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
        ref={setInputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={layer.isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          layer.isOpen && highlightedIndex >= 0
            ? getItemId(highlightedIndex)
            : undefined
        }
        aria-autocomplete="list"
        aria-describedby={ariaDescribedBy}
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        autoFocus={hasAutoFocus}
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
          aria-label="Loading"
          {...stylex.props(styles.loadingSpinner)}>
          <XDSIcon icon="clock" size="sm" color="secondary" />
        </span>
      )}

      {layer.render(
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          {...stylex.props(styles.dropdown)}>
          {results.length === 0 && hasSearched ? (
            <div {...stylex.props(styles.emptyState)}>
              {emptySearchResultsText}
            </div>
          ) : (
            results.map((item, index) => (
              <div
                key={item.id}
                id={getItemId(index)}
                role="option"
                aria-selected={value?.id === item.id}
                tabIndex={-1}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                {...stylex.props(
                  styles.item,
                  index === highlightedIndex && styles.itemHighlighted,
                  value?.id === item.id && styles.itemSelected,
                )}>
                <span {...stylex.props(styles.itemContent)}>
                  {renderItem ? (
                    renderItem(item)
                  ) : (
                    <XDSTypeaheadItem item={item} />
                  )}
                </span>
                {value?.id === item.id && (
                  <XDSIcon icon="check" size="sm" color="accent" />
                )}
              </div>
            ))
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
}) as <T extends XDSSearchableItem>(
  props: XDSBaseTypeaheadProps<T> & {ref?: React.Ref<HTMLInputElement>},
) => React.ReactElement;

(XDSBaseTypeahead as {displayName?: string}).displayName = 'XDSBaseTypeahead';
