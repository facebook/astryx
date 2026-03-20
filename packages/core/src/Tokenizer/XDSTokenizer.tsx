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
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
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
import type {XDSIconType} from '../Icon';
import {
  colorVars,
  spacingVars,
  radiusVars,
  sizeVars,
} from '../theme/tokens.stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps} from '../utils';
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
  | {type: 'clear'}
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

export interface XDSTokenizerProps<T extends XDSSearchableItem>
  extends Omit<XDSBaseProps, 'onChange'> {
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
   * Pass an SVG icon component (e.g. from heroicons, lucide, etc.).
   */
  startIcon?: XDSIconType;
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
   * Debounce delay in ms before triggering search after typing.
   * Set to 0 for synchronous/local search sources that don't need debouncing.
   * @default 150
   */
  debounceMs?: number;
  /** Query change callback. */
  onChangeQuery?: (query: string) => void;
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
    borderRadius: radiusVars['--radius-rounded'],
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
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    borderWidth: 0,
    clipPath: 'inset(50%)',
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
  const [announcement, setAnnouncement] = useState('');

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

  // Announce changes for screen readers
  const announce = useCallback((message: string) => {
    // Clear first to ensure re-announcement of same message
    setAnnouncement('');
    requestAnimationFrame(() => setAnnouncement(message));
  }, []);

  // Handle adding an item
  const handleAdd = useCallback(
    (item: T | null) => {
      if (!item) return;
      if (isAtMax) return;
      if (selectedIds.has(item.id)) return;

      const newItems = [...value, item];
      onChange(newItems, {item, type: 'add'});
      announce(`Added ${item.label}, ${newItems.length} selected`);
    },
    [value, onChange, isAtMax, selectedIds, announce],
  );

  // Handle removing an item
  const handleRemove = useCallback(
    (item: T) => {
      const newItems = value.filter(v => v.id !== item.id);
      onChange(newItems, {item, type: 'remove'});
      announce(
        `Removed ${item.label}, ${newItems.length === 0 ? 'none' : newItems.length} selected`,
      );
      inputRef.current?.focus();
    },
    [value, onChange, announce],
  );

  // Handle clearing all items
  const handleClearAll = useCallback(() => {
    if (value.length === 0) return;
    onChange([], {type: 'clear'});
    announce('Cleared all selections');
    inputRef.current?.focus();
  }, [value, onChange, announce]);

  // Collect focusable token buttons inside the wrapper
  const getTokenButtons = useCallback((): HTMLElement[] => {
    if (!wrapperRef.current) return [];
    return Array.from(
      wrapperRef.current.querySelectorAll<HTMLElement>(
        'button[aria-label^="Remove "]',
      ),
    );
  }, []);

  // Handle keyboard navigation: backspace to remove last token, arrows to navigate tokens
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const inputEmpty = e.currentTarget.value === '';

      if (e.key === 'Backspace' && inputEmpty && value.length > 0) {
        e.preventDefault();
        const lastItem = value[value.length - 1];
        handleRemove(lastItem);
        return;
      }

      // ArrowLeft at start of empty input → focus last token's remove button
      if (e.key === 'ArrowLeft' && inputEmpty && value.length > 0) {
        e.preventDefault();
        const buttons = getTokenButtons();
        buttons[buttons.length - 1]?.focus();
      }
    },
    [value, handleRemove, getTokenButtons],
  );

  // Handle arrow key navigation within tokens
  const handleTokenKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      const buttons = getTokenButtons();
      // Find the focused button — may be e.target when event bubbles from child
      const target = (e.target as HTMLElement).closest?.(
        'button[aria-label^="Remove "]',
      ) as HTMLElement | null;
      if (!target) return;
      const idx = buttons.indexOf(target);
      if (idx === -1) return;

      e.preventDefault();

      if (e.key === 'ArrowLeft' && idx > 0) {
        buttons[idx - 1].focus();
      } else if (e.key === 'ArrowRight') {
        if (idx < buttons.length - 1) {
          buttons[idx + 1].focus();
        } else {
          // Past last token → focus input
          inputRef.current?.focus();
        }
      }
    },
    [getTokenButtons],
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

  // Render tokens — wrap each in a span with onKeyDown for arrow navigation
  const tokens = value.map(item => {
    const onRemoveItem = () => handleRemove(item);

    if (renderToken) {
      return (
        <span
          key={item.id}
          onKeyDown={handleTokenKeyDown}
          {...stylex.props(styles.token)}>
          {renderToken(item, onRemoveItem)}
        </span>
      );
    }

    return (
      <span key={item.id} onKeyDown={handleTokenKeyDown}>
        <XDSToken
          label={item.label}
          size={size}
          onRemove={isDisabled ? undefined : onRemoveItem}
          isDisabled={isDisabled}
          xstyle={styles.token}
        />
      </span>
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
        {...mergeProps(
          xdsClassName('tokenizer', {size}),
          stylex.props(
            inputWrapperStyles.base,
            styles.wrapper,
            value.length > 0 && styles.wrapperWithTokens,
            sizeStyle,
            isDisabled && inputWrapperStyles.disabled,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            status && inputStatusFocusWithinStyles[status.type],
          ),
        )}>
        {startIcon && <XDSIcon icon={startIcon} size="sm" color="primary" />}
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
          isAriaRequired={isRequired}
          isAriaInvalid={status?.type === 'error'}
          isAriaHidden={isAtMax}
          tabIndex={isAtMax ? -1 : undefined}
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
      <span aria-live="polite" role="status" {...stylex.props(styles.srOnly)}>
        {announcement}
      </span>
    </XDSField>
  );
}

XDSTokenizer.displayName = 'XDSTokenizer';
