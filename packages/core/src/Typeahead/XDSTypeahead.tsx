/**
 * @file XDSTypeahead.tsx
 * @input Uses React, XDSBaseTypeahead, XDSField, XDSToken
 * @output Exports XDSTypeahead styled typeahead component
 * @position Styled wrapper; composes XDSBaseTypeahead with XDSField
 *
 * Owns the input wrapper (border, padding, status styles), selected value
 * token with spacing compensation, and edit mode behavior. Delegates
 * search, keyboard navigation, and dropdown to XDSBaseTypeahead.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Typeahead/README.md
 * - /packages/core/src/Typeahead/index.ts
 * - /apps/storybook/stories/Typeahead.stories.tsx
 */

'use client';

import React, {useCallback, useId, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSBaseTypeahead} from './XDSBaseTypeahead';
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
import type {XDSSearchableItem, XDSSearchSource} from './types';
import type {ReactNode} from 'react';

export type {
  XDSInputStatus as XDSTypeaheadStatus,
  XDSInputStatusType as XDSTypeaheadStatusType,
} from '../Field';

export type XDSTypeaheadSize = 'sm' | 'md';

export interface XDSTypeaheadProps<T extends XDSSearchableItem> {
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
  /** Currently selected item (null = nothing selected). */
  value: T | null;
  /** Callback when selection changes. */
  onChange: (item: T | null) => void;
  /** Render function for dropdown items. Default: XDSTypeaheadItem. */
  renderItem?: (item: T) => ReactNode;
  /** Placeholder text. */
  placeholder?: string;
  /** Show results on focus before typing. @default false */
  hasEntriesOnFocus?: boolean;
  /** Max dropdown items. @default 10 */
  maxMenuItems?: number;
  /** Text shown when no results found. @default 'No results found' */
  emptySearchResultsText?: string;
  /** Whether the input is disabled. @default false */
  isDisabled?: boolean;
  /** Show clear button. @default true */
  hasClear?: boolean;
  /** Auto-focus on mount. @default false */
  hasAutoFocus?: boolean;
  /** Input size. @default 'md' */
  size?: XDSTypeaheadSize;
  /**
   * Debounce delay in ms before triggering search after typing.
   * Set to 0 for synchronous/local search sources that don't need debouncing.
   * @default 150
   */
  debounceMs?: number;
  /** Query change callback. */
  onChangeQuery?: (query: string) => void;
  /** Callback when dropdown opens/closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** StyleX overrides. */
  xstyle?: StyleXStyles;
  /** Test ID. */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-1'],
    // Standard padding minus border width to prevent height jump
    // when a token (28px) is added inside the input
    paddingBlock: `calc(${spacingVars['--spacing-1']} - 1px)`,
    cursor: 'text',
  },
  token: {
    // Offset token so it sits 3px from the inner edge (4px from outer edge
    // accounting for 1px border). Default inline padding is 8px, so
    // -(8px - 3px) = -5px positions token equidistant from left edge as top.
    margin: `calc(-1 * (${spacingVars['--spacing-2']} - ${spacingVars['--spacing-1']} + 1px))`,
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
  inputHidden: {
    width: 0,
    minWidth: 0,
    flex: '0 0 0',
    padding: 0,
    opacity: 0,
    position: 'absolute' as const,
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A search-as-you-type component for selecting an item from a search source.
 *
 * Wraps XDSBaseTypeahead with XDSField for label, description, and status.
 * Owns the input wrapper styling, selected value token, and edit mode.
 *
 * Edit mode: clicking the token or input area removes the token, populates
 * the input with the value's label, and selects all text. Blurring without
 * selecting restores the original token. Escape also restores.
 *
 * @example
 * ```
 * <XDSTypeahead
 *   label="Assignee"
 *   searchSource={userSource}
 *   value={assignee}
 *   onChange={setAssignee}
 *   placeholder="Search users..."
 * />
 * ```
 */
export function XDSTypeahead<T extends XDSSearchableItem>({
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
  placeholder,
  hasEntriesOnFocus,
  maxMenuItems,
  emptySearchResultsText,
  isDisabled = false,
  hasClear = true,
  hasAutoFocus,
  size = 'md',
  debounceMs,
  onChangeQuery,
  onOpenChange,
  xstyle,
  'data-testid': testId,
}: XDSTypeaheadProps<T>) {
  const inputId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLElement>(null);

  // Edit mode: when the user clicks the token to edit the selected value
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<T | null>(null);

  // Show token when value is selected and not in edit mode
  const showToken = value != null && !isEditing;

  // Enter edit mode: remove token visually, populate input with value label
  const handleEnterEditMode = useCallback(() => {
    if (isDisabled || !value) return;
    setEditingValue(value);
    setIsEditing(true);
    // The base will receive onChangeQuery with the value's label
    onChangeQuery?.(value.label);
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (input) {
        // Set the input value directly since the base manages its own query state
        // We trigger a synthetic change to sync the base's internal state
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )?.set;
        nativeInputValueSetter?.call(input, value.label);
        input.dispatchEvent(new Event('input', {bubbles: true}));
        input.focus();
        input.setSelectionRange(0, input.value.length);
      }
    });
  }, [isDisabled, value, onChangeQuery]);

  // Handle blur: restore token if editing and no selection was made
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // Don't restore if focus is moving within the wrapper (e.g. to dropdown)
      if (wrapperRef.current?.contains(e.relatedTarget as Node)) return;

      if (editingValue && isEditing) {
        setIsEditing(false);
        setEditingValue(null);
        // Value was never cleared from parent, so no onChange needed
      }
    },
    [editingValue, isEditing],
  );

  // Handle selection from dropdown — clears edit mode
  const handleChange = useCallback(
    (item: T | null) => {
      setIsEditing(false);
      setEditingValue(null);
      onChange(item);
      // After selection, focus the token so keyboard users stay in the component.
      // Use requestAnimationFrame because the token renders on the next cycle.
      if (item) {
        requestAnimationFrame(() => {
          const tokenEl = tokenRef.current;
          if (tokenEl) {
            // Focus the internal button inside the token
            const button = tokenEl.querySelector('button');
            (button ?? tokenEl).focus();
          }
        });
      }
    },
    [onChange],
  );

  // Handle clear (explicit X button on token)
  const handleClear = useCallback(() => {
    setIsEditing(false);
    setEditingValue(null);
    onChange(null);
    inputRef.current?.focus();
  }, [onChange]);

  // Handle Escape during edit mode — restore token
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' && editingValue) {
        e.preventDefault();
        setIsEditing(false);
        setEditingValue(null);
        inputRef.current?.blur();
      }
    },
    [editingValue],
  );

  // Click wrapper to focus input or enter edit mode
  const handleWrapperClick = useCallback(() => {
    if (isDisabled) return;
    if (showToken) {
      handleEnterEditMode();
    } else {
      inputRef.current?.focus();
    }
  }, [isDisabled, showToken, handleEnterEditMode]);

  const ariaDescribedBy =
    [
      description ? descriptionId : null,
      status?.message ? statusMessageId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const sizeStyle = size === 'sm' ? styles.sizeSmWrapper : styles.sizeMdWrapper;

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
      labelTooltip={labelTooltip}>
      <div
        ref={wrapperRef}
        data-testid={testId}
        onClick={handleWrapperClick}
        onBlur={handleBlur}
        {...stylex.props(
          inputWrapperStyles.base,
          styles.wrapper,
          sizeStyle,
          status && inputStatusBorderStyles[status.type],
          status && inputStatusHoverShadowStyles[status.type],
          status && inputStatusFocusWithinStyles[status.type],
          isDisabled && inputWrapperStyles.disabled,
          xstyle,
        )}>
        {showToken && (
          <XDSToken
            ref={tokenRef}
            label={value.label}
            size={size}
            onClick={handleEnterEditMode}
            onRemove={hasClear && !isDisabled ? handleClear : undefined}
            isDisabled={isDisabled}
            xstyle={styles.token}
          />
        )}
        <XDSBaseTypeahead
          ref={inputRef}
          searchSource={searchSource}
          value={value}
          onChange={handleChange}
          renderItem={renderItem}
          placeholder={showToken ? undefined : placeholder}
          hasEntriesOnFocus={hasEntriesOnFocus}
          maxMenuItems={maxMenuItems}
          emptySearchResultsText={emptySearchResultsText}
          isDisabled={isDisabled}
          hasAutoFocus={hasAutoFocus}
          inputId={inputId}
          ariaDescribedBy={ariaDescribedBy}
          onChangeQuery={onChangeQuery}
          onOpenChange={onOpenChange}
          debounceMs={debounceMs}
          anchorRef={wrapperRef}
          onKeyDown={handleKeyDown}
          inputXStyle={showToken ? styles.inputHidden : undefined}
        />
        {hasClear && value && !isDisabled && isEditing && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={e => {
              e.stopPropagation();
              handleClear();
            }}
            {...stylex.props(styles.clearButton)}>
            <XDSIcon icon="close" size="sm" />
          </button>
        )}
      </div>
    </XDSField>
  );
}

XDSTypeahead.displayName = 'XDSTypeahead';
