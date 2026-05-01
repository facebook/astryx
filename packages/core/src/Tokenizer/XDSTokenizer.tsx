'use client';

/**
 * @file XDSTokenizer.tsx
 * @input Uses React, XDSBaseTypeahead, XDSField, XDSToken
 * @output Exports XDSTokenizer multi-select typeahead component
 * @position Composed component; uses XDSBaseTypeahead for search + XDSToken for chips
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Tokenizer/index.ts
 * - /apps/storybook/stories/Tokenizer.stories.tsx
 * - /packages/cli/templates/blocks/components/Tokenizer/ (showcase blocks)
 */

import React, {
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSBaseTypeahead} from '../Typeahead/XDSBaseTypeahead';
import {useXDSSize} from '../SizeContext/XDSSizeContext';
import {
  XDSField,
  type XDSInputStatus,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {XDSToken} from '../Token';
import {XDSIcon} from '../Icon';
import {renderIconSlot, type XDSIconType} from '../Icon';
import {XDSOverflowList} from '../OverflowList';
import {useXDSLayer} from '../Layer/useXDSLayer';
import {
  colorVars,
  spacingVars,
  radiusVars,
  sizeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import type {XDSSearchableItem, XDSSearchSource} from '../Typeahead/types';
import {xdsClassName, mergeProps} from '../utils';

// Re-export status types for convenience
export type {
  XDSInputStatus as XDSTokenizerStatus,
  XDSInputStatusType as XDSTokenizerStatusType,
} from '../Field';

// =============================================================================
// Types
// =============================================================================

/**
 * Change metadata for onChange callback.
 */
export type XDSTokenizerChange<T extends XDSSearchableItem> =
  | {item: T; type: 'add'}
  | {item: T; type: 'create'}
  | {item: T; type: 'remove'}
  | {type: 'reorder'};

export type XDSTokenizerSize = 'sm' | 'md';

/**
 * Controls overflow behavior when tokens exceed the available width.
 * - `'none'`: All tokens wrap normally (default).
 * - `'unfocusedInline'`: Shows a single line with "+ N more" when unfocused, expands inline on focus.
 * - `'unfocusedLayer'`: Shows a single line with "+ N more" when unfocused, expands as an overlay on focus.
 */
export type XDSTokenizerOverflowBehavior =
  | 'none'
  | 'unfocusedInline'
  | 'unfocusedLayer';

/**
 * Imperative handle for XDSTokenizer.
 */
export interface XDSTokenizerHandle {
  /** Focus the typeahead input. */
  focus(): void;
  /** Blur the typeahead input. */
  blur(): void;
}

export interface XDSTokenizerProps<T extends XDSSearchableItem> {
  /** Accessible label (required). */
  label: string;
  /** Visually hide the label. @default false */
  isLabelHidden?: boolean;
  /** Helper text. */
  description?: string;
  /** Required field. @default false */
  isRequired?: boolean;
  /** Optional field. @default false */
  isOptional?: boolean;
  /** Validation status. */
  status?: XDSInputStatus;
  /**
   * Icon to display at the start of the input.
   * Accepts a ReactNode (e.g. `<XDSIcon icon={SearchIcon} />`) or an SVG icon component directly.
   */
  startIcon?: ReactNode | XDSIconType;
  /** Label tooltip. */
  labelTooltip?: string;
  /** Search source providing items. */
  searchSource: XDSSearchSource<T>;
  /** Currently selected items. */
  value: T[];
  /** Callback when selection changes. Includes change metadata. */
  onChange: (items: T[], change: XDSTokenizerChange<T>) => void;
  /** Render function for dropdown items. Default: XDSTypeaheadItem. */
  renderItem?: (item: T) => ReactNode;
  /** Render function for selected tokens. Default: XDSToken with label + onRemove. */
  renderToken?: (item: T, onRemove: () => void) => ReactNode;
  /** Max number of selections. */
  maxEntries?: number;
  /** Placeholder text (shown when no tokens selected). */
  placeholder?: string;
  /** Show results on focus before typing. @default false */
  hasEntriesOnFocus?: boolean;
  /** Max dropdown items. @default 10 */
  maxMenuItems?: number;
  /** Text shown when no results found. @default 'No results found' */
  emptySearchResultsText?: string;
  /** Whether the input is disabled. @default false */
  isDisabled?: boolean;
  /** Show clear button (clears all tokens). @default false */
  hasClear?: boolean;
  /**
   * Content to display at the end of the input row.
   * Useful for buttons, result counts, or other controls.
   */
  endContent?: ReactNode;
  /** Auto-focus on mount. @default false */
  hasAutoFocus?: boolean;
  /** Input size. @default 'md' */
  size?: XDSTokenizerSize;
  /**
   * Controls how tokens overflow when the container is too narrow.
   * - `'none'`: Tokens wrap to multiple lines (default).
   * - `'unfocusedInline'`: Single line with "+ N more" when unfocused; expands inline on focus.
   * - `'unfocusedLayer'`: Single line with "+ N more" when unfocused; expands as overlay on focus.
   * @default 'none'
   */
  tokenOverflowBehavior?: XDSTokenizerOverflowBehavior;
  /**
   * Debounce delay in ms before triggering search after typing.
   * Set to 0 for synchronous/local search sources that don't need debouncing.
   * @default 150
   */
  debounceMs?: number;
  /**
   * Allow users to create new tokens from free-text input.
   * When true, pressing Enter with text in the input commits the typed value
   * as a new token — even if the search source returned no results.
   * @default false
   */
  hasCreate?: boolean;
  /** Query change callback. */
  onChangeQuery?: (query: string) => void;
  /** Fires when focus enters the tokenizer from outside. */
  onFocus?: (e: React.FocusEvent) => void;
  /** Fires when focus leaves the tokenizer entirely. */
  onBlur?: (e: React.FocusEvent) => void;
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
  /** Test ID. */
  'data-testid'?: string;
  /** Imperative handle ref for focus/blur control. */
  ref?: React.Ref<XDSTokenizerHandle>;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-1'],
    cursor: 'text',
    height: 'auto',
  },
  wrapperWithTokens: {
    // Override padding for border concentricity: token border-radius
    // (radius-1: 4px) sits concentric with wrapper border-radius
    // (radius-2: 8px) when inset = radius-2 - radius-1 - border
    // = 8 - 4 - 1 = 3px.
    paddingBlock: `calc(${spacingVars['--spacing-1']} - 1px)`,
    paddingInline: `calc(${spacingVars['--spacing-1']} - 1px)`,
  },
  token: {
    flexShrink: 0,
  },
  clearAllButton: {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-full'],
    color: colorVars['--color-text-secondary'],
    opacity: {
      default: 0.7,
      ':hover': {
        '@media (hover: hover)': 1,
      },
    },
    flexShrink: 0,
  },
  endSection: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    marginInlineStart: 'auto',
    flexShrink: 0,
  },
  sizeSm: {
    minHeight: sizeVars['--size-element-sm'],
  },
  sizeMd: {
    minHeight: sizeVars['--size-element-md'],
  },
  inputAtMax: {
    width: 0,
    minWidth: 0,
    flex: '0 0 0',
    padding: 0,
    opacity: 0,
    position: 'absolute',
  },
  inputCompact: {
    minWidth: '40px',
    flex: '1 1 40px',
    width: 0,
    // Restore normal text inset when input follows tokens, since the
    // wrapper padding is reduced for border concentricity.
    paddingInlineStart: `calc(${spacingVars['--spacing-2']} - ${spacingVars['--spacing-1']} + 1px)`,
  },
  truncatedWrapper: {
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  truncatedSm: {
    height: sizeVars['--size-element-sm'],
  },
  truncatedMd: {
    height: sizeVars['--size-element-md'],
  },
  layerPlaceholderSm: {
    height: sizeVars['--size-element-sm'],
  },
  layerPlaceholderMd: {
    height: sizeVars['--size-element-md'],
  },
  layerPopover: {
    // Top-layer popover: match the anchor width exactly so the expanded
    // tokenizer looks like an in-place expansion, overlapping the
    // placeholder from its top edge.
    width: 'anchor-size(width)',
  },
  overflowText: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
    paddingInline: spacingVars['--spacing-1'],
  },
});

// =============================================================================
// Component
// =============================================================================

// Sentinel prefix for creatable items — used to distinguish
// "Create: X" suggestions from real search results.
const CREATABLE_ID_PREFIX = '__xds_create__';

/**
 * Multi-select input with token chips and typeahead search.
 *
 * Composes XDSBaseTypeahead for search and XDSToken for selected items.
 * Tokens render inline before the text input. Selecting an item adds a token
 * and clears the query. Backspace on empty input removes the last token.
 *
 * @example
 * ```
 * const [members, setMembers] = useState<UserItem[]>([]);
 * <XDSTokenizer
 *   label="Team members"
 *   searchSource={userSource}
 *   value={members}
 *   onChange={(items, change) => {
 *     setMembers(items);
 *     if (change.type === 'add') console.log('Added:', change.item.label);
 *   }}
 *   placeholder="Search people..."
 * />
 * <XDSTokenizer
 *   label="Tags"
 *   searchSource={tagSource}
 *   value={tags}
 *   onChange={(items) => setTags(items)}
 *   renderToken={(item, onRemove) => (
 *     <XDSToken
 *       label={item.label}
 *       color={item.auxiliaryData.color}
 *       onRemove={onRemove}
 *     />
 *   )}
 *   maxEntries={5}
 * />
 * ```
 */
export function XDSTokenizer<T extends XDSSearchableItem>({
  label,
  isLabelHidden = false,
  description,
  isRequired = false,
  isOptional = false,
  status,
  startIcon,
  labelTooltip,
  searchSource,
  value,
  onChange,
  renderItem,
  renderToken,
  maxEntries,
  placeholder,
  hasEntriesOnFocus,
  maxMenuItems,
  emptySearchResultsText,
  isDisabled = false,
  hasClear = false,
  endContent,
  hasAutoFocus,
  size: sizeProp,
  tokenOverflowBehavior = 'none',
  debounceMs,
  hasCreate = false,
  onChangeQuery,
  onFocus,
  onBlur,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSTokenizerProps<T>) {
  const size = useXDSSize(sizeProp, 'md') as XDSTokenizerSize;
  const inputId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
    blur() {
      inputRef.current?.blur();
    },
  }));

  // Focus-within state for overflow truncation
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const isTruncated =
    !isFocusedWithin && tokenOverflowBehavior !== 'none' && value.length > 0;

  // Layer for unfocusedLayer mode — promotes expanded content to the top layer
  // so it isn't clipped by ancestor overflow.
  const isLayerMode = tokenOverflowBehavior === 'unfocusedLayer';
  const layer = useXDSLayer({mode: 'context'});
  const layerContentRef = useRef<HTMLDivElement>(null);

  // Anchor the layer to the placeholder element
  const placeholderRef = useCallback(
    (el: HTMLElement | null) => {
      if (isLayerMode) {
        layer.ref(el);
      }
    },
    [isLayerMode, layer],
  );

  // For the layer variant, focus can be in either the placeholder or the
  // popover content. We track both to decide when focus has truly left.
  const isFocusInTokenizer = useCallback(
    (target: Node | null): boolean => {
      if (!target) return false;
      if (wrapperRef.current?.contains(target)) return true;
      if (layerContentRef.current?.contains(target)) return true;
      // Also check the popover element itself (the layer wrapper)
      const popoverEl = document.getElementById(layer.id);
      if (popoverEl?.contains(target)) return true;
      return false;
    },
    [layer.id],
  );

  const handleFocusCapture = useCallback(
    (e: React.FocusEvent) => {
      const comingFromOutside = !isFocusInTokenizer(e.relatedTarget as Node);
      setIsFocusedWithin(true);
      if (isLayerMode) {
        layer.show();
      }
      if (comingFromOutside) {
        onFocus?.(e);
        // Redirect to the input so the user doesn't have to tab through
        // every token remove button.
        if (e.target !== inputRef.current) {
          inputRef.current?.focus();
        }
      }
    },
    [isLayerMode, layer, isFocusInTokenizer, onFocus],
  );

  const handleBlurCapture = useCallback(
    (e: React.FocusEvent) => {
      if (!isFocusInTokenizer(e.relatedTarget as Node)) {
        setIsFocusedWithin(false);
        onBlur?.(e);
        if (isLayerMode) {
          layer.hide();
        }
      }
    },
    [isLayerMode, layer, isFocusInTokenizer, onBlur],
  );

  const isAtMax = maxEntries != null && value.length >= maxEntries;

  // Filter out already-selected items from search results
  const selectedIds = useMemo(
    () => new Set(value.map(item => item.id)),
    [value],
  );

  // Track the current query for creatable mode
  const [creatableQuery, setCreatableQuery] = useState('');

  const filteredSource: XDSSearchSource<T> = useMemo(
    () => ({
      search: async (query: string) => {
        const results = await searchSource.search(query);
        const filtered = results.filter(item => !selectedIds.has(item.id));

        // Append a "Create: X" synthetic item when hasCreate is true,
        // the user has typed something, and it doesn't exactly match an
        // existing result.
        if (hasCreate && query.trim()) {
          const trimmed = query.trim();
          const alreadyExists =
            selectedIds.has(trimmed) ||
            filtered.some(
              item => item.label.toLowerCase() === trimmed.toLowerCase(),
            );
          if (!alreadyExists) {
            const creatableItem = {
              id: `${CREATABLE_ID_PREFIX}${trimmed}`,
              label: `Create "${trimmed}"`,
              auxiliaryData: {__createdValue: trimmed},
            } as unknown as T;
            filtered.push(creatableItem);
          }
        }

        return filtered;
      },
      bootstrap: async () => {
        const results = await searchSource.bootstrap();
        return results.filter(item => !selectedIds.has(item.id));
      },
    }),
    [searchSource, selectedIds, hasCreate],
  );

  const emptySource: XDSSearchSource<T> = useMemo(
    () => ({
      search: async () => [],
      bootstrap: async () => [],
    }),
    [],
  );

  // Handle adding an item — detect creatable synthetic items
  const handleAdd = useCallback(
    (item: T | null) => {
      if (!item) return;
      if (isAtMax) return;

      // Detect "Create: X" synthetic items from the creatable source
      if (
        hasCreate &&
        typeof item.id === 'string' &&
        item.id.startsWith(CREATABLE_ID_PREFIX)
      ) {
        const createdValue = item.id.slice(CREATABLE_ID_PREFIX.length);
        if (selectedIds.has(createdValue)) return;
        const realItem = {id: createdValue, label: createdValue} as T;
        const newItems = [...value, realItem];
        onChange(newItems, {item: realItem, type: 'create'});
        return;
      }

      if (selectedIds.has(item.id)) return;
      const newItems = [...value, item];
      onChange(newItems, {item, type: 'add'});
    },
    [value, onChange, isAtMax, selectedIds, hasCreate],
  );

  // Handle removing an item
  const handleRemove = useCallback(
    (item: T) => {
      const newItems = value.filter(v => v.id !== item.id);
      onChange(newItems, {item, type: 'remove'});
      inputRef.current?.focus();
    },
    [value, onChange],
  );

  // Handle clearing all items
  const handleClearAll = useCallback(() => {
    if (value.length === 0) return;
    // Report the last item as removed (convention)
    const lastItem = value[value.length - 1];
    onChange([], {item: lastItem, type: 'remove'});
    inputRef.current?.focus();
  }, [value, onChange]);

  // Handle backspace on empty input — remove last token
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === 'Backspace' &&
        e.currentTarget.value === '' &&
        value.length > 0
      ) {
        e.preventDefault();
        const lastItem = value[value.length - 1];
        handleRemove(lastItem);
      }
    },
    [value, handleRemove],
  );

  // Click wrapper to focus input
  const handleWrapperClick = useCallback(() => {
    if (!isDisabled) {
      if (isLayerMode) {
        // The input always lives in the popover. Show it and focus.
        layer.show();
        setIsFocusedWithin(true);
        // The input is already mounted in the popover (not conditional),
        // so we can focus it directly.
        inputRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  }, [isDisabled, isLayerMode, layer]);

  const ariaDescribedBy =
    [
      description ? descriptionId : null,
      status?.message ? statusMessageId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeMd;

  // Render tokens
  const tokens = value.map(item => {
    const onRemoveItem = () => handleRemove(item);

    if (renderToken) {
      return (
        <span key={item.id} {...stylex.props(styles.token)}>
          {renderToken(item, onRemoveItem)}
        </span>
      );
    }

    return (
      <XDSToken
        key={item.id}
        label={item.label}
        size={size}
        onRemove={isDisabled ? undefined : onRemoveItem}
        isDisabled={isDisabled}
        xstyle={styles.token}
      />
    );
  });

  return (
    <XDSField
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={inputId}
      descriptionID={description ? descriptionId : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageId : undefined,
            }
          : undefined
      }
      labelTooltip={labelTooltip}
      xstyle={xstyle}
      className={className}
      style={style}>
      {(() => {
        const wrapperContent = (
          <div
            ref={wrapperRef}
            role="group"
            aria-label={label}
            onClick={handleWrapperClick}
            onFocusCapture={handleFocusCapture}
            onBlurCapture={handleBlurCapture}
            data-testid={testId}
            {...mergeProps(
              xdsClassName('tokenizer', {size}),
              stylex.props(
                inputWrapperStyles.base,
                styles.wrapper,
                value.length > 0 && styles.wrapperWithTokens,
                isTruncated
                  ? size === 'sm'
                    ? styles.truncatedSm
                    : styles.truncatedMd
                  : sizeStyle,
                isTruncated && styles.truncatedWrapper,
                isDisabled && inputWrapperStyles.disabled,
                status && inputStatusBorderStyles[status.type],
                status && inputStatusHoverShadowStyles[status.type],
                status && inputStatusFocusWithinStyles[status.type],
              ),
            )}>
            {startIcon &&
              renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
            {isTruncated ? (
              <XDSOverflowList
                gap={1}
                behavior="observeParent"
                overflowRenderer={items => (
                  <span {...stylex.props(styles.overflowText)}>
                    +{items.length} more
                  </span>
                )}>
                {tokens}
              </XDSOverflowList>
            ) : (
              tokens
            )}
            <XDSBaseTypeahead
              ref={inputRef}
              searchSource={isAtMax ? emptySource : filteredSource}
              value={null}
              onChange={handleAdd}
              renderItem={renderItem}
              placeholder={value.length === 0 ? placeholder : ''}
              hasEntriesOnFocus={isAtMax ? false : hasEntriesOnFocus}
              maxMenuItems={maxMenuItems}
              emptySearchResultsText={emptySearchResultsText}
              isDisabled={isDisabled}
              hasAutoFocus={hasAutoFocus}
              inputId={inputId}
              ariaDescribedBy={ariaDescribedBy}
              onChangeQuery={
                hasCreate
                  ? (q: string) => {
                      setCreatableQuery(q);
                      onChangeQuery?.(q);
                    }
                  : onChangeQuery
              }
              debounceMs={debounceMs}
              onKeyDown={handleKeyDown}
              anchorRef={wrapperRef}
              size={size}
              inputXStyle={
                isAtMax || isTruncated
                  ? styles.inputAtMax
                  : value.length > 0
                    ? styles.inputCompact
                    : undefined
              }
            />
            {(endContent || (hasClear && value.length > 0 && !isDisabled)) && (
              <div {...stylex.props(styles.endSection)}>
                {endContent}
                {hasClear && value.length > 0 && !isDisabled && (
                  <button
                    type="button"
                    aria-label="Clear all"
                    onClick={e => {
                      e.stopPropagation();
                      handleClearAll();
                    }}
                    {...stylex.props(styles.clearAllButton)}>
                    <XDSIcon icon="close" size="sm" />
                  </button>
                )}
              </div>
            )}
          </div>
        );

        if (isLayerMode) {
          const placeholderSizeStyle =
            size === 'sm'
              ? styles.layerPlaceholderSm
              : styles.layerPlaceholderMd;
          return (
            <>
              {/* Placeholder preserves layout height, acts as the CSS
                  anchor, and shows the collapsed overflow summary.
                  Clicking it opens the popover and focuses the input. */}
              <div
                ref={placeholderRef}
                onClick={handleWrapperClick}
                {...mergeProps(
                  xdsClassName('tokenizer', {size}),
                  stylex.props(
                    inputWrapperStyles.base,
                    styles.wrapper,
                    value.length > 0 && styles.wrapperWithTokens,
                    placeholderSizeStyle,
                    isTruncated && styles.truncatedWrapper,
                    isDisabled && inputWrapperStyles.disabled,
                    status && inputStatusBorderStyles[status.type],
                    status && inputStatusHoverShadowStyles[status.type],
                    status && inputStatusFocusWithinStyles[status.type],
                  ),
                )}>
                {isTruncated && (
                  <>
                    {startIcon &&
                      renderIconSlot(startIcon, {
                        size: 'sm',
                        color: 'secondary',
                      })}
                    <XDSOverflowList
                      gap={1}
                      behavior="observeParent"
                      overflowRenderer={items => (
                        <span {...stylex.props(styles.overflowText)}>
                          +{items.length} more
                        </span>
                      )}>
                      {tokens}
                    </XDSOverflowList>
                  </>
                )}
              </div>
              {/* Expanded content always lives in the top layer so the
                  input/tokens never unmount during the focus transition.
                  The popover is shown/hidden via layer.show()/hide(). */}
              {layer.render(
                <div
                  ref={layerContentRef}
                  onFocusCapture={handleFocusCapture}
                  onBlurCapture={handleBlurCapture}>
                  {wrapperContent}
                </div>,
                {
                  placement: 'below',
                  alignment: 'start',
                  xstyle: styles.layerPopover,
                  // Override position-area to overlap the anchor from its
                  // top edge rather than sitting below it.
                  style: {
                    positionArea: undefined,
                    positionTryFallbacks: undefined,
                    top: 'anchor(top)',
                    left: 'anchor(start)',
                  } as React.CSSProperties,
                },
              )}
            </>
          );
        }

        return wrapperContent;
      })()}
    </XDSField>
  );
}

XDSTokenizer.displayName = 'XDSTokenizer';
