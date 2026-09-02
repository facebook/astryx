// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Typeahead.tsx
 * @input Uses React, BaseTypeahead, Field, Token, InputGroupContext
 * @output Exports Typeahead styled typeahead component
 * @position Styled wrapper; composes BaseTypeahead with Field or InputGroup
 *
 * Owns the input wrapper (border, padding, status styles), selected value
 * token with spacing compensation, and edit mode behavior. Delegates
 * search, keyboard navigation, and dropdown to BaseTypeahead.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Typeahead/index.ts
 * - /apps/storybook/stories/Typeahead.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Typeahead/ (showcase blocks)
 */

import React, {
  useCallback,
  useId,
  useRef,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {BusyIndicatorLaneProvider} from './busyIndicatorLane';
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
  type FieldStatusVariant,
} from '../Field';
import {Token} from '../Token';
import {useTooltip} from '../Tooltip';
import {renderIconSlot, type IconType} from '../Icon';
import {VisuallyHidden} from '../VisuallyHidden';
import {Spinner} from '../Spinner';
import {spacingVars, sizeVars} from '../theme/tokens.stylex';
import {groupStyles} from '../InputGroup/groupStyles';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import {getInputARIA, isImeKeyEvent, mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import type {SearchableItem, SearchSource} from './types';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

import {useMergedRefs} from '../hooks/useMergedRefs';
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
   * How the status message is placed relative to the input.
   * - 'attached': message overlaps directly below the input (bordered treatment)
   * - 'detached': message floats below as a separate element with spacing
   * @default 'attached'
   */
  statusVariant?: FieldStatusVariant;
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
  /**
   * Minimum query length before the search source is queried. Below it no
   * search runs and the menu stays closed — useful for remote sources where
   * one or two characters match too much to be worth fetching.
   * @default 1
   */
  minQueryLength?: number;
  /** Text shown when no results found. @default 'No results found' */
  emptySearchResultsText?: string;
  /** Whether the input is disabled. @default false */
  isDisabled?: boolean;
  /**
   * Explains why the input is disabled. When set together with `isDisabled`,
   * the input shows a tooltip with this text on hover and keyboard focus, and
   * the field stays focusable (via `aria-disabled`) so the reason is
   * discoverable by keyboard and assistive technology. Editing and selection
   * stay blocked.
   *
   * Use this instead of wrapping a disabled input in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <Typeahead
   *   label="Assignee"
   *   searchSource={userSource}
   *   value={assignee}
   *   onChange={setAssignee}
   *   isDisabled
   *   disabledMessage="You need the Editor role to change this"
   * />
   * ```
   */
  disabledMessage?: string;
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
    // No `flexWrap`. The shared field base does not wrap and neither does
    // TextInput; this field only ever holds one token, so there is no second
    // row to wrap to. It also cannot wrap and keep its end controls in flow:
    // flex moves an item to a new line rather than shrinking it, so a long
    // value put the clear button and spinner on a row of their own (a 280px
    // field grew to 46px tall). Unwrapped, the token ellipsizes instead.
    gap: spacingVars['--spacing-1'],
    // Standard padding minus border width to prevent height jump
    // when a token (28px) is added inside the input
    paddingBlock: `calc(${spacingVars['--spacing-1']} - 1px)`,
    cursor: {
      default: 'text',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  token: {
    // Offset token so it sits 3px from the inner edge (4px from outer edge
    // accounting for 1px border). Default inline padding is 8px, so
    // -(8px - 3px) = -5px positions token equidistant from left edge as top.
    margin: `calc(-1 * (${spacingVars['--spacing-2']} - ${spacingVars['--spacing-1']} + 1px))`,
  },
  // The busy indicator and the clear button, at the field's inline end.
  //
  // In flow, as a flex child — an in-flow box takes up room, so the input
  // cannot run underneath it and nothing has to be measured. That is
  // TextInput's arrangement for the same two controls.
  //
  // The `auto` margin is what TextInput does not need. Its input is always
  // present and `flex: 1`, so it absorbs the free space and pushes these to
  // the end on its own. This field collapses its input to nothing while a
  // token shows (`inputHidden`), which leaves no flexible item in the row —
  // so without the margin the controls sit against the token, mid-field,
  // instead of in the corner where they belong. `auto` gives the free space
  // to the margin instead of to a sibling, which needs no sibling to exist.
  endLane: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    marginInlineStart: 'auto',
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
  statusVariant = 'attached',
  startIcon,
  labelTooltip,
  searchSource,
  value,
  onChange,
  renderItem,
  placeholder,
  hasEntriesOnFocus,
  maxMenuItems,
  minQueryLength,
  emptySearchResultsText,
  isDisabled = false,
  disabledMessage,
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
  const t = useTranslator();
  const size = useSize(sizeProp, 'md');
  const inputId = useId();
  const inputLabelId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();
  const inputGroup = useInputGroup();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLElement>(null);

  // Disabled-reason tooltip. Disabled controls swallow pointer events, so the
  // tooltip listeners attach to the input wrapper (which already exists) and
  // the input stays perceivable via aria-disabled + readOnly instead of the
  // disabled attribute. Editing and selection stay blocked by the isDisabled
  // guards (handleWrapperClick, handleEnterEditMode, and BaseTypeahead's own
  // focus/change guards).
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The wrapper div is not naturally focusable; focusin bubbles up from the
    // input, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  // Edit mode: when the user clicks the token to edit the selected value
  // Reported by BaseTypeahead so the indicator can live in this field's own
  // end lane, beside the clear button, rather than in the engine's row.
  const [isLoading, setIsLoading] = useState(false);
  const busyLane = useMemo(() => ({onBusyChange: setIsLoading}), []);
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
      // BaseTypeahead invokes this external handler *before* its own IME
      // guard, so we must guard here too: an IME candidate window uses Escape
      // to cancel the pending composition, and that composing Escape fires
      // before compositionend. Without this, a Korean/Japanese/Chinese user
      // cancelling a candidate would instead exit edit mode and blur the
      // field. See utils/ime.ts.
      if (isImeKeyEvent(e.nativeEvent)) {
        return;
      }
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

  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelId,
    [
      description ? descriptionId : null,
      status?.message ? statusMessageId : null,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ],
    inputGroup,
  );

  const sizeStyle = wrapperSizeStyles[size];

  const typeaheadContent = (
    <>
      <div
        ref={useMergedRefs(
          wrapperRef,
          disabledMessageTooltip.ref,
          inputGroup ? ref : undefined,
        )}
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
            status && !isDisabled && inputStatusHoverShadowStyles[status.type],
            status && inputStatusFocusWithinStyles[status.type],
            isDisabled && inputWrapperStyles.disabled,
            inputGroup && groupStyles.inGroup,
            inputGroup && xstyle,
          ),
          inputGroup ? className : undefined,
          inputGroup ? style : undefined,
        )}>
        {startIcon &&
          renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
        {inputGroup && (
          <VisuallyHidden id={inputLabelId}>{label}</VisuallyHidden>
        )}
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
        {/* The base reports its busy state through this lane, so the
            indicator lands in the end controls below beside the clear
            button rather than as a second one inside the base. */}
        <BusyIndicatorLaneProvider value={busyLane}>
          <BaseTypeahead
            ref={inputRef}
            searchSource={searchSource}
            value={value}
            onChange={handleChange}
            renderItem={renderItem}
            placeholder={showToken ? undefined : placeholder}
            hasEntriesOnFocus={hasEntriesOnFocus}
            maxMenuItems={maxMenuItems}
            minQueryLength={minQueryLength}
            emptySearchResultsText={emptySearchResultsText}
            isDisabled={isDisabled}
            hasAutoFocus={hasAutoFocus}
            isFocusableDisabled={showsDisabledMessage}
            inputId={inputId}
            ariaDescribedBy={ariaDescribedBy}
            ariaLabelledBy={ariaLabelledBy}
            onChangeQuery={onChangeQuery}
            onOpenChange={onOpenChange}
            debounceMs={debounceMs}
            anchorRef={wrapperRef}
            onKeyDown={handleKeyDown}
            inputXStyle={showToken ? styles.inputHidden : undefined}
            // While the token is shown the input is collapsed (width 0 /
            // opacity 0) — take it out of the Tab order so keyboard users
            // don't hit an invisible stop (WCAG 2.4.3 / 2.4.7). It stays
            // programmatically focusable: entering edit mode and clearing
            // both refocus it after it uncollapses.
            inputTabIndex={showToken ? -1 : undefined}
            size={size}
          />
        </BusyIndicatorLaneProvider>
        {(isLoading || (hasClear && value && !isDisabled)) && (
          <div {...stylex.props(styles.endLane)}>
            {isLoading && (
              <Spinner size="sm" aria-label={t('@astryx.typeahead.loading')} />
            )}
            {hasClear && value && !isDisabled && (
              <InputClearButton
                label={t('@astryx.typeahead.clearSelection')}
                onClick={e => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
          </div>
        )}
      </div>
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </>
  );

  if (inputGroup) {
    return typeaheadContent;
  }

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
      statusVariant={statusVariant}
      labelTooltip={labelTooltip}
      width={width}
      xstyle={xstyle}
      className={className}
      style={style}>
      {typeaheadContent}
    </Field>
  );
}

Typeahead.displayName = 'Typeahead';
