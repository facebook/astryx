'use client';

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
import type {XDSInputStatus} from '../Field/types';
import {useXDSLayer} from '../Layer/useXDSLayer';
import {XDSTypeaheadItem} from './XDSTypeaheadItem';
import {XDSIcon} from '../Icon';
import {XDSSpinner} from '../Spinner';
import {
  colorVars,
  spacingVars,
  radiusVars,
  lineHeightVars,
  typographyVars,
  fontWeightVars,
  typeScaleVars,
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

  /**
   * Whether the field is required.
   * Sets aria-required on the combobox input.
   * @default false
   */
  isRequired?: boolean;
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
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: lineHeightVars['--leading-base'],
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
    borderRadius: radiusVars['--radius-2'],
    backgroundColor: colorVars['--color-surface'],
    boxShadow: `0 4px 12px ${colorVars['--color-shadow']}`,
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
    borderRadius: radiusVars['--radius-1'],
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
export const XDSBaseTypeahead = function XDSBaseTypeahead<
  T extends XDSSearchableItem,
>({
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
  isRequired = false,
  status,
  ref,
}: XDSBaseTypeaheadProps<T> & {
  status?: XDSInputStatus;
  ref?: React.Ref<HTMLInputElement>;
}) {
  const isInvalid = status?.type === 'error';
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

  // Track active pointer to defer layer.show() past click events.
  // With popover="auto", showing the popover between pointerdown and
  // pointerup/click causes the browser's light-dismiss to immediately
  // close it (the click is seen as "outside" the newly-opened popover).
  const pointerActiveRef = useRef(false);

  // Debounce ref
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generation counter to discard stale async results
  const searchIdRef = useRef(0);

  // Ref to latest searchSource so debounced callbacks never use a stale one
  const searchSourceRef = useRef(searchSource);
  searchSourceRef.current = searchSource;

  // Ref for the dropdown container to scrollIntoView highlighted items
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Layer for dropdown
  const handleLayerShow = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handleLayerHide = useCallback(() => {
    onOpenChange?.(false);
    setHighlightedIndex(-1);
    searchSourceRef.current.cancel?.();
  }, [onOpenChange]);

  const layer = useXDSLayer({
    mode: 'context',
    lightDismiss: true,
    onShow: handleLayerShow,
    onHide: handleLayerHide,
  });

  // Show the layer, deferring past the active click if a pointer is down.
  // Without this, popover="auto" light-dismiss immediately closes the
  // dropdown when it opens between pointerdown and pointerup/click.
  const showLayer = useCallback(() => {
    if (pointerActiveRef.current) {
      document.addEventListener(
        'click',
        () => requestAnimationFrame(() => layer.show()),
        {once: true},
      );
    } else {
      layer.show();
    }
  }, [layer]);

  // Merge refs: forward ref + internal ref + fallback anchor ref
  const setInputRef = useCallback(
    (el: HTMLInputElement | null) => {
      (inputRef as React.RefObject<HTMLInputElement | null>).current = el;
      (fallbackAnchorRef as React.RefObject<HTMLInputElement | null>).current =
        el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.RefObject<HTMLInputElement | null>).current = el;
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
      searchSourceRef.current.cancel?.();
      const id = ++searchIdRef.current;
      setIsLoading(true);
      setHasSearched(true);
      try {
        const searchResults = await searchSourceRef.current.search(searchQuery);
        if (id !== searchIdRef.current) return; // stale result
        setResults(searchResults.slice(0, maxMenuItems));
        setHighlightedIndex(searchResults.length > 0 ? 0 : -1);
        if (searchResults.length > 0 || searchQuery.length > 0) {
          showLayer();
        }
      } catch (error) {
        if (id !== searchIdRef.current) return; // stale error
        setResults([]);
        setHighlightedIndex(-1);
        console.error('XDSBaseTypeahead: search error', error);
      } finally {
        if (id === searchIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [maxMenuItems, showLayer],
  );

  // Perform bootstrap
  const performBootstrap = useCallback(async () => {
    const id = ++searchIdRef.current;
    setIsLoading(true);
    try {
      const bootstrapResults = await searchSourceRef.current.bootstrap();
      if (id !== searchIdRef.current) return; // stale result
      setResults(bootstrapResults.slice(0, maxMenuItems));
      setHighlightedIndex(bootstrapResults.length > 0 ? 0 : -1);
      if (bootstrapResults.length > 0) {
        showLayer();
      }
    } catch (error) {
      if (id !== searchIdRef.current) return; // stale error
      setResults([]);
      setHasSearched(true);
      console.error('XDSBaseTypeahead: bootstrap error', error);
    } finally {
      if (id === searchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [maxMenuItems, showLayer]);

  // Handle query change
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      onChangeQuery?.(newQuery);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (newQuery.length === 0 && !hasEntriesOnFocus) {
        searchSourceRef.current.cancel?.();
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
    } else if (results.length > 0 && (query.length > 0 || hasEntriesOnFocus)) {
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
          if (layer.isOpen && results.length > 0) {
            e.preventDefault();
            setHighlightedIndex(0);
          }
          break;
        case 'End':
          if (layer.isOpen && results.length > 0) {
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

  // Scroll highlighted item into view within the dropdown
  useEffect(() => {
    if (highlightedIndex < 0 || !layer.isOpen) return;
    const dropdown = dropdownRef.current;
    if (!dropdown) return;
    const item = dropdown.querySelector(`#${CSS.escape(getItemId(highlightedIndex))}`);
    if (item && typeof item.scrollIntoView === 'function') {
      item.scrollIntoView({block: 'nearest'});
    }
  }, [highlightedIndex, layer.isOpen, getItemId]);

  // Cleanup timeout and cancel in-flight searches on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchSourceRef.current.cancel?.();
    };
  }, []);

  return (
    <>
      <input
        ref={setInputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={layer.isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          layer.isOpen && highlightedIndex >= 0
            ? getItemId(highlightedIndex)
            : undefined
        }
        aria-autocomplete="list"
        aria-describedby={ariaDescribedBy}
        aria-required={isRequired || undefined}
        aria-invalid={isInvalid || undefined}
        aria-busy={isLoading || undefined}
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
        <span {...stylex.props(styles.loadingSpinner)}>
          <XDSSpinner size="sm" />
        </span>
      )}

      {results.length === 0 && hasSearched && (
        <div role="status" aria-live="polite" {...stylex.props(styles.emptyState)}>
          {emptySearchResultsText}
        </div>
      )}

      {layer.render(
        <div
          ref={dropdownRef}
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          {...stylex.props(styles.dropdown)}>
          {results.map((item, index) => (
            <div
              key={item.id}
              id={getItemId(index)}
              role="option"
              aria-selected={index === highlightedIndex}
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
          ))}
        </div>,
        {
          placement: 'below',
          alignment: 'start',
          xstyle: [styles.popover, styles.popoverGap],
        },
      )}
    </>
  );
} as <T extends XDSSearchableItem>(
  props: XDSBaseTypeaheadProps<T> & {ref?: React.Ref<HTMLInputElement>},
) => React.ReactElement;

(XDSBaseTypeahead as {displayName?: string}).displayName = 'XDSBaseTypeahead';
