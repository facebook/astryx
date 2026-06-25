// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Typeahead.tsx
 * @input Uses React, BaseTypeahead, Field, Token
 * @output Exports Typeahead styled typeahead component
 * @position Styled wrapper; composes BaseTypeahead with Field
 *
 * Owns the input wrapper (border, padding, status styles), selected value
 * token with spacing compensation, and edit mode behavior. Delegates
 * search, keyboard navigation, and dropdown to BaseTypeahead.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Typeahead/index.ts
 * - /apps/storybook/stories/Typeahead.stories.tsx
 * - /packages/cli/templates/blocks/components/Typeahead/ (showcase blocks)
 */

import React, {
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {BaseTypeahead} from './BaseTypeahead';
import {useSize} from '../SizeContext/SizeContext';
import {
  Field,
  InputClearButton,
  type InputStatus,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {Token} from '../Token';
import {renderIconSlot, type IconType} from '../Icon';
import {spacingVars, sizeVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import type {SearchableItem, SearchSource} from './types';
import {themeProps} from '../utils/themeProps';

export type {
  InputStatus as TypeaheadStatus,
  InputStatusType as TypeaheadStatusType,
} from '../Field';

export type TypeaheadSize = 'sm' | 'md' | 'lg';

export interface TypeaheadProps<T extends SearchableItem> extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  ref?: React.Ref<HTMLDivElement>;
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
  status?: InputStatus;
  /**
   * Icon to display at the start of the input.
   * Accepts a ReactNode (e.g. `<Icon icon={SearchIcon} />`) or an SVG icon component directly.
   */
  startIcon?: ReactNode | IconType;
  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /** Label tooltip. */
  labelTooltip?: string;
  /** Search source providing items. */
  searchSource: SearchSource<T>;
  /** Currently selected item (null = nothing selected). */
  value: T | null;
  /** Callback when selection changes. */
  onChange: (item: T | null) => void;
  /** Render function for dropdown items. Default: TypeaheadItem. */
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
  size?: TypeaheadSize;
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
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    position: 'relative',
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
    position: 'absolute',
    top: `calc((${sizeVars['--size-element-md']} - 20px) / 2 - 1px)`,
    insetInlineEnd: `calc((${sizeVars['--size-element-md']} - 20px) / 2 - 1px)`,
    height: '20px',
  },
  clearButtonSm: {
    top: `calc((${sizeVars['--size-element-sm']} - 20px) / 2 - 1px)`,
    insetInlineEnd: `calc((${sizeVars['--size-element-sm']} - 20px) / 2 - 1px)`,
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

const wrapperSizeStyles = stylex.create({
  sm: {minHeight: sizeVars['--size-element-sm']},
  md: {minHeight: sizeVars['--size-element-md']},
  lg: {minHeight: sizeVars['--size-element-lg']},
});

// =============================================================================
// Component
// =============================================================================

/**
 * A search-as-you-type component for selecting an item from a search source.
 *
 * Wraps BaseTypeahead with Field for label, description, and status.
 * Owns the input wrapper styling, selected value token, and edit mode.
 *
 * Edit mode: clicking the token or input area removes the token, populates
 * the input with the value's label, and selects all text. Blurring without
 * selecting restores the original token. Escape also restores.
 *
 * @example
 * ```
 * <Typeahead
 *   label="Assignee"
 *   searchSource={userSource}
 *   value={assignee}
 *   onChange={setAssignee}
 *   placeholder="Search users..."
 * />
 * ```
 */
export function Typeahead<T extends SearchableItem>({
  ref,
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
  placeholder,
  hasEntriesOnFocus,
  maxMenuItems,
  emptySearchResultsText,
  isDisabled = false,
  hasClear = true,
  hasAutoFocus,
  size: sizeProp,
  debounceMs,
  onChangeQuery,
  onOpenChange,
  width,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: TypeaheadProps<T>) {
  const size = useSize(sizeProp, 'md');
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
    if (isDisabled || !value) {
      return;
    }
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
      if (wrapperRef.current?.contains(e.relatedTarget)) {
        return;
      }

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
    if (isDisabled) {
      return;
    }
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

  const sizeStyle = wrapperSizeStyles[size];

  return (
    <Field
      ref={ref}
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
      width={width}
      xstyle={xstyle}
      className={className}
      style={style}>
      <div
        ref={wrapperRef}
        data-testid={testId}
        onClick={handleWrapperClick}
        onBlur={handleBlur}
        {...mergeProps(
          themeProps('typeahead', {size, status: status?.type}),
          stylex.props(
            inputWrapperStyles.base,
            styles.wrapper,
            sizeStyle,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            status && inputStatusFocusWithinStyles[status.type],
            isDisabled && inputWrapperStyles.disabled,
          ),
        )}>
        {startIcon &&
          renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
        {showToken && (
          <Token
            ref={tokenRef}
            label={value.label}
            size={size}
            onClick={handleEnterEditMode}
            isDisabled={isDisabled}
            xstyle={styles.token}
          />
        )}
        <BaseTypeahead
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
          size={size}
        />
        {hasClear && value && !isDisabled && (
          <InputClearButton
            label="Clear selection"
            onClick={e => {
              e.stopPropagation();
              handleClear();
            }}
            xstyle={[styles.clearButton, size === 'sm' && styles.clearButtonSm]}
          />
        )}
      </div>
    </Field>
  );
}

Typeahead.displayName = 'Typeahead';
