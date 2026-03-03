/**
 * @file XDSBaseTypeahead.tsx
 * @input Uses React, StyleX, useXDSLayer, XDSTypeaheadItem
 * @output Exports XDSBaseTypeahead unstyled typeahead component
 * @position Core implementation; used by XDSTypeahead and XDSTokenizer
 *
 * Handles search, keyboard navigation, selection, and dropdown positioning.
 * No field wrapper, no styling — just the combobox behavior.
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
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {useXDSLayer} from '../Layer/useXDSLayer';
import {XDSTypeaheadItem} from './XDSTypeaheadItem';
import {XDSIcon} from '../Icon';
import {XDSToken} from '../Token';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  lineHeightVars,
  typographyVars,
  fontWeightVars,
  sizeVars,
  transitionVars,
  elevationVars,
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
   * Show clear button when a value is selected.
   * @default true
   */
  hasClear?: boolean;

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
   * The size of the input.
   * @default 'md'
   */
  size?: 'sm' | 'md';

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
   * Additional StyleX styles for the input wrapper.
   */
  wrapperXStyle?: StyleXStyles;

  /**
   * Additional StyleX styles for the input element.
   */
  inputXStyle?: StyleXStyles;

  /**
   * Content rendered before the input (e.g., tokens in Tokenizer).
   */
  startContent?: ReactNode;

  /**
   * Whether the input should visually appear as part of a group.
   * When true, some wrapper styles are suppressed.
   * @default false
   */
  isEmbedded?: boolean;

  /**
   * Additional keydown handler called before internal keyboard navigation.
   * If the handler calls `e.preventDefault()`, internal handling is skipped.
   */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  /**
   * Validation status type for border styling.
   */
  statusType?: 'warning' | 'error' | 'success';

  /**
   * Test ID.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-1'],
    // Standard padding minus border width to prevent height jump
    // when a token (28px) is added inside the input
    paddingBlock: `calc(${spacingVars['--spacing-1']} - 1px)`,
    paddingInline: spacingVars['--spacing-2'],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: {
      default: colorVars['--color-divider-emphasized'],
      ':hover': {
        '@media (hover: hover)': colorVars['--color-divider-high-contrast'],
      },
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    transitionProperty: 'border-color, outline, box-shadow',
    transitionDuration: transitionVars['--transition-fast'],
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': elevationVars['--elevation-input-hover'],
      },
    },
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: '0',
  },
  wrapperDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-divider-emphasized'],
  },
  wrapperEmbedded: {
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    outline: 'none',
  },
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
  inputUnselected: {
    color: colorVars['--color-text-secondary'],
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
  itemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
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
  clearButton: {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-rounded'],
    color: colorVars['--color-text-secondary'],
    opacity: {
      default: 0.7,
      ':hover': {
        '@media (hover: hover)': 1,
      },
    },
  },
  sizeSmWrapper: {
    minHeight: sizeVars['--size-sm'],
  },
  sizeMdWrapper: {
    minHeight: sizeVars['--size-md'],
  },
  tokenContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    // Offset token so it sits 3px from the inner edge (4px from outer edge
    // accounting for 1px border). Default inline padding is 8px, so
    // -(8px - 3px) = -5px positions token equidistant from left edge as top.
    margin: `calc(-1 * (${spacingVars['--spacing-2']} - ${spacingVars['--spacing-1']} + 1px))`,
    cursor: 'pointer',
  },
  loadingSpinner: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingVars['--spacing-1'],
  },
});

const statusBorderStyles = stylex.create({
  warning: {
    borderColor: colorVars['--color-warning'],
  },
  error: {
    borderColor: colorVars['--color-negative'],
  },
  success: {
    borderColor: colorVars['--color-positive'],
  },
});

const statusHoverShadowStyles = stylex.create({
  warning: {
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)':
          elevationVars['--elevation-input-hover-warning'],
      },
    },
  },
  error: {
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': elevationVars['--elevation-input-hover-error'],
      },
    },
  },
  success: {
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)':
          elevationVars['--elevation-input-hover-success'],
      },
    },
  },
});

const statusFocusStyles = stylex.create({
  warning: {
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline-warning']}`,
    },
  },
  error: {
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline-error']}`,
    },
  },
  success: {
    outline: {
      default: 'none',
      ':focus-within': `1px solid ${colorVars['--color-focus-outline-success']}`,
    },
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Unstyled typeahead/combobox component.
 *
 * Handles search, keyboard navigation, selection, and dropdown positioning.
 * Used internally by XDSTypeahead (styled) and XDSTokenizer (multi-select).
 *
 * @example
 * ```tsx
 * <XDSBaseTypeahead
 *   searchSource={source}
 *   value={selected}
 *   onChange={setSelected}
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
    hasClear = true,
    hasAutoFocus = false,
    onChangeQuery,
    onOpenChange,
    size = 'md',
    inputId: externalInputId,
    ariaDescribedBy,
    wrapperXStyle,
    inputXStyle,
    startContent,
    isEmbedded = false,
    onKeyDown: externalOnKeyDown,
    statusType,
    debounceMs = 150,
    'data-testid': testId,
  }: XDSBaseTypeaheadProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const generatedId = useId();
  const inputId = externalInputId ?? generatedId;
  const listboxId = useId();

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Track the value being edited so we can restore on blur without action
  const [editingValue, setEditingValue] = useState<T | null>(null);

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
      // If we were editing an existing value and the dropdown closes,
      // restore the token (handled by handleBlur, but also reset here for safety)
      if (editingValue) {
        setIsEditing(false);
        setQuery('');
        setEditingValue(null);
      } else {
        setIsEditing(false);
      }
      searchSource.cancel?.();
    },
  });

  // Merge refs
  const setInputRef = useCallback(
    (el: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
        el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
      }
    },
    [ref],
  );

  // Set up anchor on wrapper
  useEffect(() => {
    const el = wrapperRef.current;
    if (el) {
      layer.ref(el);
    }
    return () => {
      layer.ref(null);
    };
  }, [layer]);

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      // Cancel any in-flight search before starting a new one
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

      // Cancel pending debounce
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

      // Skip debounce when delay is 0 (e.g., local/synchronous sources)
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
      setIsEditing(true);
      handleQueryChange(e.target.value);
    },
    [handleQueryChange],
  );

  // Handle item selection
  const handleSelect = useCallback(
    (item: T) => {
      setIsEditing(false);
      setEditingValue(null);
      onChange(item);
      setQuery('');
      setResults([]);
      layer.hide();
      inputRef.current?.focus();
    },
    [onChange, layer],
  );

  // Handle clear
  const handleClear = useCallback(() => {
    setIsEditing(false);
    setEditingValue(null);
    onChange(null);
    setQuery('');
    setResults([]);
    layer.hide();
    inputRef.current?.focus();
  }, [onChange, layer]);

  // Enter edit mode: remove token, populate input with the value's label
  const handleEnterEditMode = useCallback(() => {
    if (isDisabled || !value) return;
    setEditingValue(value);
    setIsEditing(true);
    setQuery(value.label);
    onChangeQuery?.(value.label);
    // Don't call onChange(null) — the value stays until blur or selection
    // We just visually switch from token to input
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (input) {
        input.focus();
        input.setSelectionRange(0, input.value.length);
      }
    });
  }, [isDisabled, value, onChangeQuery]);

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

  // Handle blur: if editing a value and no new selection was made, restore
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // Don't restore if focus is moving within the wrapper (e.g. to dropdown)
      if (wrapperRef.current?.contains(e.relatedTarget as Node)) return;

      if (editingValue && isEditing) {
        // Restore the original value — user blurred without selecting
        setIsEditing(false);
        setQuery('');
        setEditingValue(null);
        // Value was never cleared from parent, so no onChange needed
      }
    },
    [editingValue, isEditing],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Call external handler first
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
          if (editingValue) {
            // Restore the original value and exit edit mode
            setIsEditing(false);
            setQuery('');
            setEditingValue(null);
            setResults([]);
            inputRef.current?.blur();
          }
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
      editingValue,
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

  // Display value: when editing (including edit-mode for existing value) show query,
  // when value selected and not editing show empty (token is shown instead),
  // otherwise show query (which may be empty)
  const showToken = value != null && !isEditing;
  const displayValue = isEditing ? query : value ? '' : query;

  const sizeStyle = size === 'sm' ? styles.sizeSmWrapper : styles.sizeMdWrapper;

  const wrapperStyles = isEmbedded
    ? [styles.wrapperEmbedded, wrapperXStyle]
    : [
        styles.wrapper,
        sizeStyle,
        statusType && statusBorderStyles[statusType],
        statusType && statusHoverShadowStyles[statusType],
        statusType && statusFocusStyles[statusType],
        wrapperXStyle,
      ];

  return (
    <>
      <div
        ref={wrapperRef}
        data-testid={testId}
        onBlur={handleBlur}
        {...stylex.props(
          ...wrapperStyles,
          isDisabled && styles.wrapperDisabled,
        )}>
        {startContent}
        {showToken && (
          <div
            onClick={!isEmbedded ? handleEnterEditMode : undefined}
            {...stylex.props(!isEmbedded && styles.tokenContainer)}>
            <XDSToken
              label={value.label}
              size={size}
              onRemove={hasClear && !isDisabled ? handleClear : undefined}
              isDisabled={isDisabled}
            />
          </div>
        )}
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
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={showToken && !isEmbedded ? handleEnterEditMode : undefined}
          onKeyDown={handleKeyDown}
          placeholder={showToken ? undefined : value ? undefined : placeholder}
          disabled={isDisabled}
          autoFocus={hasAutoFocus}
          autoComplete="off"
          {...stylex.props(
            styles.input,
            isDisabled && styles.inputDisabled,
            isEditing && query.length > 0 && !value && styles.inputUnselected,
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
        {hasClear && value && !isDisabled && isEditing && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={handleClear}
            {...stylex.props(styles.clearButton)}>
            <XDSIcon icon="close" size="sm" />
          </button>
        )}
      </div>

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
