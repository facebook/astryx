/**
 * @file XDSTokenizer.tsx
 * @input Uses React, XDSBaseTypeahead, XDSField, XDSToken
 * @output Exports XDSTokenizer multi-select typeahead component
 * @position Composed component; uses XDSBaseTypeahead for search + XDSToken for chips
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Tokenizer/README.md
 * - /packages/core/src/Tokenizer/index.ts
 * - /apps/storybook/stories/Tokenizer.stories.tsx
 */

'use client';

import React, {
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSBaseTypeahead} from '../Typeahead/XDSBaseTypeahead';
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
import {
  colorVars,
  spacingVars,
  radiusVars,
  sizeVars,
} from '../theme/tokens.stylex';
import type {XDSSearchableItem, XDSSearchSource} from '../Typeahead/types';

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
  | {item: T; type: 'remove'}
  | {type: 'reorder'};

export type XDSTokenizerSize = 'sm' | 'md';

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
  /** Auto-focus on mount. @default false */
  hasAutoFocus?: boolean;
  /** Input size. @default 'md' */
  size?: XDSTokenizerSize;
  /**
   * Debounce delay in ms before triggering search after typing.
   * Set to 0 for synchronous/local search sources that don't need debouncing.
   * @default 150
   */
  debounceMs?: number;
  /** Query change callback. */
  onChangeQuery?: (query: string) => void;
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
    // (radius-content: 4px) sits concentric with wrapper border-radius
    // (radius-element: 8px) when inset = radius-element - radius-content - border
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
    borderRadius: radiusVars['--radius-rounded'],
    color: colorVars['--color-text-secondary'],
    opacity: {
      default: 0.7,
      ':hover': {
        '@media (hover: hover)': 1,
      },
    },
    marginInlineStart: 'auto',
    flexShrink: 0,
  },
  sizeSm: {
    minHeight: sizeVars['--size-sm'],
  },
  sizeMd: {
    minHeight: sizeVars['--size-md'],
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
});

// =============================================================================
// Component
// =============================================================================

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
  hasAutoFocus,
  size = 'md',
  debounceMs,
  onChangeQuery,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSTokenizerProps<T>) {
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

  const isAtMax = maxEntries != null && value.length >= maxEntries;

  // Filter out already-selected items from search results
  const selectedIds = useMemo(
    () => new Set(value.map(item => item.id)),
    [value],
  );

  const filteredSource: XDSSearchSource<T> = useMemo(
    () => ({
      search: async (query: string) => {
        const results = await searchSource.search(query);
        return results.filter(item => !selectedIds.has(item.id));
      },
      bootstrap: async () => {
        const results = await searchSource.bootstrap();
        return results.filter(item => !selectedIds.has(item.id));
      },
    }),
    [searchSource, selectedIds],
  );

  const emptySource: XDSSearchSource<T> = useMemo(
    () => ({
      search: async () => [],
      bootstrap: async () => [],
    }),
    [],
  );

  // Handle adding an item
  const handleAdd = useCallback(
    (item: T | null) => {
      if (!item) return;
      if (isAtMax) return;
      if (selectedIds.has(item.id)) return;

      const newItems = [...value, item];
      onChange(newItems, {item, type: 'add'});
    },
    [value, onChange, isAtMax, selectedIds],
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
      inputRef.current?.focus();
    }
  }, [isDisabled]);

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
      <div
        ref={wrapperRef}
        role="group"
        aria-label={label}
        onClick={handleWrapperClick}
        data-testid={testId}
        {...stylex.props(
          inputWrapperStyles.base,
          styles.wrapper,
          value.length > 0 && styles.wrapperWithTokens,
          sizeStyle,
          isDisabled && inputWrapperStyles.disabled,
          status && inputStatusBorderStyles[status.type],
          status && inputStatusHoverShadowStyles[status.type],
          status && inputStatusFocusWithinStyles[status.type],
        )}>
        {tokens}
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
          onChangeQuery={onChangeQuery}
          debounceMs={debounceMs}
          onKeyDown={handleKeyDown}
          anchorRef={wrapperRef}
          inputXStyle={
            isAtMax
              ? styles.inputAtMax
              : value.length > 0
                ? styles.inputCompact
                : undefined
          }
        />
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
    </XDSField>
  );
}

XDSTokenizer.displayName = 'XDSTokenizer';
