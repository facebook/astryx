// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TimeInput.tsx
 * @input Uses React, useId, useState, useCallback, useRef, Field, Icon, InputGroupContext
 * @output Exports TimeInput component, TimeInputProps
 * @position Core implementation; consumed by index.ts, tested by TimeInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TimeInput/TimeInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/TimeInput/TimeInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TimeInput/index.ts (exports if types change)
 * - /apps/storybook/stories/TimeInput.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/TimeInput/ (showcase blocks)
 */

import {
  useId,
  useState,
  useCallback,
  useRef,
  useMemo,
  useOptimistic,
  useTransition,
  type KeyboardEvent,
  type FocusEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {IconName} from '../Icon';
import {
  colorVars,
  sizeVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {
  Field,
  type InputStatus,
  type InputStatusType,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {Icon} from '../Icon';
import {Spinner} from '../Spinner';
import {VisuallyHidden} from '../VisuallyHidden';
import {
  type ISOTimeString,
  parseTimeInput,
  formatDisplayTime12h,
  formatDisplayTime24h,
  formatISOTime,
  adjustTime,
  isTimeInRange,
  mergeProps,
  mergeRefs,
  getInputARIA,
} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {useSize} from '../SizeContext/SizeContext';
import {useInputContainer} from '../hooks/useInputContainer';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import {groupStyles} from '../InputGroup/groupStyles';
import {useTooltip} from '../Tooltip';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    display: 'block',
    flex: 1,
    minWidth: 0,
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
  inputInvalid: {
    color: colorVars['--color-text-secondary'],
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    outline: {
      default: 'none',
      ':focus-visible': `${borderVars['--border-width']} solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: 1,
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
    minWidth: 120,
  },
  md: {
    height: sizeVars['--size-element-md'],
    minWidth: 120,
  },
  lg: {
    height: sizeVars['--size-element-lg'],
    minWidth: 120,
  },
});

export type TimeInputSize = keyof typeof sizeStyles;

export type TimeInputHourFormat = '12h' | '24h';

// Re-export shared types for convenience

export type {
  InputStatus as TimeInputStatus,
  InputStatusType as TimeInputStatusType,
} from '../Field';

export interface TimeInputProps extends Omit<
  BaseProps,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLInputElement>;
  /**
   * Label text for the input (required for accessibility).
   */
  label: string;

  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;

  /**
   * Description text displayed between the label and input.
   */
  description?: string;

  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;

  /**
   * Whether the field is required. Mutually exclusive with isOptional.
   * @default false
   */
  isRequired?: boolean;

  /**
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Explains why the input is disabled. When set together with
   * `isDisabled`, the input shows a tooltip with this text on hover and
   * keyboard focus, and the field stays focusable (via `aria-disabled`)
   * so the reason is discoverable by keyboard and assistive technology.
   * Typing and arrow-key adjustment stay blocked.
   *
   * Use this instead of wrapping a disabled input in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <TimeInput
   *   label="Start time"
   *   value={time}
   *   onChange={setTime}
   *   isDisabled
   *   disabledMessage="You need the Editor role to change this"
   * />
   * ```
   */
  disabledMessage?: string;

  /**
   * The selected time in ISO format (HH:MM or HH:MM:SS).
   */
  value?: ISOTimeString;

  /**
   * Callback fired when the time changes.
   * Called with undefined when input is cleared.
   */
  onChange?: (value: ISOTimeString | undefined) => void;

  /**
   * Async action on change. Fires after onChange.
   */
  changeAction?: (value: ISOTimeString | undefined) => void | Promise<void>;

  /**
   * Whether the input is in a loading state.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Minimum selectable time in ISO format.
   */
  min?: ISOTimeString;

  /**
   * Maximum selectable time in ISO format.
   */
  max?: ISOTimeString;

  /**
   * Whether to include seconds in the time input.
   * @default false
   */
  hasSeconds?: boolean;

  /**
   * Whether to show a clear button when a value is set.
   * @default false
   */
  hasClear?: boolean;

  /**
   * Whether to automatically focus the input on mount.
   * @default false
   */
  hasAutoFocus?: boolean;

  /**
   * Hour format for display.
   * - '12h': Display as 12-hour with AM/PM (e.g., "2:30 PM")
   * - '24h': Display as 24-hour (e.g., "14:30")
   * @default '12h'
   */
  hourFormat?: TimeInputHourFormat;

  /**
   * Increment in minutes when using arrow keys.
   * @default 1
   */
  increment?: number;

  /**
   * Placeholder text shown when no time is selected.
   * @default "Select a time"
   */
  placeholder?: string;

  /**
   * The size of the input.
   * - 'sm': Compact size (18px height)
   * - 'md': Default size (26px height)
   * @default 'md'
   */
  size?: TimeInputSize;

  /**
   * Status indicator for the input.
   * When set, displays a colored border and status icon.
   * If message is provided, displays below the input.
   */
  status?: InputStatus;

  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
}

/**
 * A time input component with text input and keyboard navigation.
 *
 * @example
 * ```
 * <TimeInput
 *   label="Start time"
 *   value={time}
 *   onChange={setTime}
 *   hourFormat="12h"
 *   hasClear
 * />
 * ```
 */
export function TimeInput({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  disabledMessage,
  value,
  onChange,
  changeAction,
  isLoading = false,
  min,
  max,
  hasSeconds = false,
  hasClear = false,
  hasAutoFocus = false,
  hourFormat = '12h',
  increment = 1,
  placeholder = 'Select a time',
  size: sizeProp,
  status,
  labelTooltip,
  width,
  xstyle,
  className,
  style,
  ref,
}: TimeInputProps) {
  const size = useSize(sizeProp, 'md');

  const id = useId();
  const inputLabelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputGroup = useInputGroup();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  // Disabled-reason tooltip. Disabled controls swallow pointer events, so the
  // tooltip listeners attach to the input container (which already exists) and
  // the input stays perceivable via aria-disabled instead of the disabled
  // attribute. Typing is blocked with readOnly and value mutation guards.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The container div is not naturally focusable; focusin bubbles up from
    // the input, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  // Status icon mapping
  const statusIconMap: Record<InputStatusType, IconName> = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const statusIconColorMap: Record<
    InputStatusType,
    'warning' | 'error' | 'success'
  > = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelID,
    [
      description ? descriptionID : null,
      status?.message ? statusMessageID : null,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ],
    inputGroup,
  );

  // Pending input while user is typing (null = show formatted value)
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Format function based on hourFormat
  const formatDisplayTime =
    hourFormat === '12h' ? formatDisplayTime12h : formatDisplayTime24h;

  // Unified change handler that fires both onChange and changeAction
  const fireChange = useCallback(
    (newValue: ISOTimeString | undefined) => {
      onChange?.(newValue);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(newValue);
          await changeAction(newValue);
        });
      }
    },
    [onChange, changeAction, startTransition, setOptimisticValue],
  );

  // Display value: pending input if typing, otherwise formatted value
  const displayValue = useMemo(() => {
    if (pendingInput !== null) {
      return pendingInput;
    }
    return optimisticValue
      ? formatDisplayTime(optimisticValue, hasSeconds)
      : '';
  }, [pendingInput, optimisticValue, formatDisplayTime, hasSeconds]);

  // Check if current input is valid (for styling purposes)
  const isInputValid = useMemo(() => {
    // Only check pending input for validity styling
    if (pendingInput === null || !pendingInput.trim()) {
      return true;
    }
    const parsed = parseTimeInput(pendingInput, hasSeconds);
    if (!parsed) {
      return false;
    }
    // Also check min/max range
    return isTimeInRange(parsed, min, max);
  }, [pendingInput, hasSeconds, min, max]);

  // Placeholder that shows format hint when focused and empty
  const displayPlaceholder = useMemo(() => {
    if (isFocused && !displayValue) {
      return hourFormat === '12h' ? 'e.g., 2:30 PM' : 'e.g., 14:30';
    }
    return placeholder;
  }, [isFocused, displayValue, hourFormat, placeholder]);

  // Handle input text change - update immediately if valid
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // With a disabledMessage the input drops `disabled` for focusability, so
      // guard value mutation explicitly (readOnly also blocks typing).
      if (isDisabled) {
        return;
      }
      const newValue = e.target.value;
      setPendingInput(newValue);

      // If the input is valid, update immediately (don't wait for blur)
      const parsed = parseTimeInput(newValue, hasSeconds);
      if (parsed && isTimeInRange(parsed, min, max) && parsed !== value) {
        fireChange(parsed);
      }
    },
    [hasSeconds, min, max, value, fireChange, isDisabled],
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    // A disabled input stays focusable (via aria-disabled) so its reason is
    // discoverable, but it must not present editing affordances — keep the
    // static placeholder rather than swapping in the format hint.
    if (isDisabled) {
      return;
    }
    setIsFocused(true);
  }, [isDisabled]);

  // Handle blur - validate and clear pending input
  const handleBlur = useCallback(
    (_e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);

      if (pendingInput === null) {
        return;
      }

      if (!pendingInput.trim()) {
        // Empty input clears the value
        if (value !== undefined) {
          fireChange(undefined);
        }
        setPendingInput(null);
        return;
      }

      const parsed = parseTimeInput(pendingInput, hasSeconds);
      if (parsed && isTimeInRange(parsed, min, max)) {
        // Valid time - update if different
        if (parsed !== value) {
          fireChange(parsed);
        }
      }
      // Clear pending input - display will revert to formatted value
      setPendingInput(null);
    },
    [pendingInput, value, fireChange, hasSeconds, min, max],
  );

  // Handle keyboard navigation on input
  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // Arrow-key adjustment mutates the value; block it while showing a
      // disabled reason (the input keeps focusability via aria-disabled).
      if (isDisabled) {
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();

        // Get current time or default to now
        let currentTime = value;
        if (!currentTime) {
          const now = new Date();
          currentTime = formatISOTime(
            {
              hour: now.getHours(),
              minute: now.getMinutes(),
              second: now.getSeconds(),
            },
            hasSeconds,
          );
        }

        const delta = e.key === 'ArrowUp' ? increment : -increment;
        const newTime = adjustTime(currentTime, delta, hasSeconds);

        // Check if within range
        if (isTimeInRange(newTime, min, max)) {
          fireChange(newTime);
        }
      }
    },
    [value, hasSeconds, increment, min, max, fireChange, isDisabled],
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    fireChange(undefined);
    inputRef.current?.focus();
  }, [fireChange]);

  // Focus input when clicking anywhere on the wrapper (icons, padding, etc.)
  const {onClick: handleWrapperClick, onMouseUp: handleWrapperMouseUp} =
    useInputContainer({
      containerRef,
      inputRef,
      disabled: isDisabled,
    });

  const inputWrapper = (
    <div
      ref={el => {
        containerRef.current = el;
        // Anchor + hover/focus listeners for the disabled-message tooltip.
        // Handlers are gated internally by isEnabled, so attaching
        // unconditionally is safe.
        disabledMessageTooltip.ref(el);
      }}
      onClick={handleWrapperClick}
      onMouseUp={handleWrapperMouseUp}
      {...mergeProps(
        themeProps('time-input', {size, status: status?.type ?? null}),
        stylex.props(
          inputWrapperStyles.base,
          sizeStyles[size],
          isDisabled && inputWrapperStyles.disabled,
          status && inputStatusBorderStyles[status.type],
          status && inputStatusHoverShadowStyles[status.type],
          status && inputStatusFocusWithinStyles[status.type],
          inputGroup && groupStyles.inGroup,
          xstyle,
        ),
        className,
        style,
      )}>
      <div {...stylex.props(styles.icon)}>
        <Icon icon="clock" size="sm" color="secondary" />
      </div>
      {inputGroup && <VisuallyHidden id={inputLabelID}>{label}</VisuallyHidden>}
      {inputGroup && description && (
        <VisuallyHidden as="div" id={descriptionID}>
          {description}
        </VisuallyHidden>
      )}
      {inputGroup && status?.message && (
        <VisuallyHidden
          as="div"
          id={statusMessageID}
          role={status.type === 'error' ? 'alert' : 'status'}
          aria-live={status.type === 'error' ? 'assertive' : 'polite'}>
          {status.message}
        </VisuallyHidden>
      )}
      <input
        ref={mergeRefs(ref, inputRef)}
        id={id}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleInputKeyDown}
        placeholder={displayPlaceholder}
        // With a disabledMessage the input keeps focusability via
        // aria-disabled so the reason is focus-discoverable; typing and
        // arrow-key adjustment are blocked with readOnly and the guards.
        disabled={isDisabled && !showsDisabledMessage}
        aria-disabled={showsDisabledMessage ? 'true' : undefined}
        readOnly={showsDisabledMessage || undefined}
        autoFocus={hasAutoFocus}
        data-autofocus={hasAutoFocus || undefined}
        aria-describedby={ariaDescribedBy}
        aria-required={isRequired === true ? 'true' : undefined}
        aria-invalid={status?.type === 'error' ? 'true' : undefined}
        aria-busy={isBusy || undefined}
        aria-labelledby={ariaLabelledBy}
        {...stylex.props(
          styles.input,
          isDisabled && styles.inputDisabled,
          !isInputValid && styles.inputInvalid,
        )}
      />
      {isBusy && <Spinner size="sm" />}
      {hasClear && value && !isDisabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={`Clear ${label}`}
          {...stylex.props(styles.clearButton)}>
          <Icon icon="close" size="sm" color="secondary" />
        </button>
      )}
      {status && !inputGroup && (
        <Icon
          icon={statusIconMap[status.type]}
          size="md"
          color={statusIconColorMap[status.type]}
        />
      )}
    </div>
  );

  if (inputGroup) {
    return (
      <>
        {inputWrapper}
        {showsDisabledMessage &&
          disabledMessageTooltip.renderTooltip(disabledMessage)}
      </>
    );
  }

  return (
    <Field
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      labelTooltip={labelTooltip}
      width={width}>
      {inputWrapper}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </Field>
  );
}

TimeInput.displayName = 'TimeInput';
