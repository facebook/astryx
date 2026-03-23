/**
 * @file XDSTimeInput.tsx
 * @input Uses React, useId, useState, useEffect, useCallback, useRef, XDSField, XDSIcon
 * @output Exports XDSTimeInput component, XDSTimeInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSTimeInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TimeInput/TimeInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/TimeInput/XDSTimeInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TimeInput/index.ts (exports if types change)
 * - /apps/storybook/stories/TimeInput.stories.tsx (storybook stories)
 */

'use client';

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
import type {XDSIconName} from '../Icon';
import {
  colorVars,
  sizeVars,
  radiusVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {
  XDSField,
  type XDSInputStatus,
  type XDSInputStatusType,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {XDSIcon} from '../Icon';
import {XDSSpinner} from '../Spinner';
import {
  type ISOTimeString,
  parseTimeInput,
  parseISOTime,
  formatDisplayTime12h,
  formatDisplayTime24h,
  formatISOTime,
  adjustTime,
  isTimeInRange,
  clampTime,
  compareTime,
  xdsClassName,
  mergeProps,
} from '../utils';
import {XDSBaseProps} from '../XDSBaseProps';

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
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
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
    borderRadius: radiusVars['--radius-2'],
    outline: {
      default: 'none',
      ':focus-visible': `1px solid ${colorVars['--color-ring-focus']}`,
    },
    outlineOffset: 1,
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-sm'],
  },
  md: {
    height: sizeVars['--size-md'],
  },
  lg: {
    height: sizeVars['--size-lg'],
  },
});

export type XDSTimeInputSize = keyof typeof sizeStyles;

export type XDSTimeInputHourFormat = '12h' | '24h';

// Re-export shared types for convenience

export type {
  XDSInputStatus as XDSTimeInputStatus,
  XDSInputStatusType as XDSTimeInputStatusType,
} from '../Field';

export interface XDSTimeInputProps
  extends Omit<XDSBaseProps, 'onChange' | 'defaultValue'> {
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
  onChangeAction?: (value: ISOTimeString | undefined) => void | Promise<void>;

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
   * Hour format for display.
   * - '12h': Display as 12-hour with AM/PM (e.g., "2:30 PM")
   * - '24h': Display as 24-hour (e.g., "14:30")
   * @default '12h'
   */
  hourFormat?: XDSTimeInputHourFormat;

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
  size?: XDSTimeInputSize;

  /**
   * Status indicator for the input.
   * When set, displays a colored border and status icon.
   * If message is provided, displays below the input.
   */
  status?: XDSInputStatus;

  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
}

/**
 * A time input component with text input and keyboard navigation.
 *
 * The input uses `role="spinbutton"` for accessible arrow-key time
 * adjustment. Query with `getByRole('spinbutton')` in tests.
 *
 * @example
 * ```
 * <XDSTimeInput
 *   label="Start time"
 *   value={time}
 *   onChange={setTime}
 *   hourFormat="12h"
 *   hasClear
 * />
 * ```
 */
export function XDSTimeInput({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  value,
  onChange,
  onChangeAction,
  isLoading = false,
  min,
  max,
  hasSeconds = false,
  hasClear = false,
  hourFormat = '12h',
  increment = 1,
  placeholder = 'Select a time',
  size = 'md',
  status,
  labelTooltip,
  xstyle,
  className,
  style,
  ref,
}: XDSTimeInputProps) {
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  // Status icon mapping
  const statusIconMap: Record<XDSInputStatusType, XDSIconName> = {
    warning: 'warning',
    error: 'xCircle',
    success: 'checkCircle',
  };

  const statusIconColorMap: Record<
    XDSInputStatusType,
    'warning' | 'negative' | 'positive'
  > = {
    warning: 'warning',
    error: 'negative',
    success: 'positive',
  };

  // Warn on impossible min > max range
  if (process.env.NODE_ENV !== 'production' && min && max && compareTime(min, max) > 0) {
    console.warn(
      'XDSTimeInput: `min` ("%s") is greater than `max` ("%s"). The component will not accept any value.',
      min,
      max,
    );
  }

  // Normalize value to match hasSeconds format
  const normalizedValue = useMemo(() => {
    if (!optimisticValue) return optimisticValue;
    const parts = optimisticValue.split(':');
    if (hasSeconds && parts.length === 2) {
      return `${optimisticValue}:00` as ISOTimeString;
    }
    if (!hasSeconds && parts.length === 3) {
      return `${parts[0]}:${parts[1]}` as ISOTimeString;
    }
    return optimisticValue;
  }, [optimisticValue, hasSeconds]);

  // Convert time to total seconds for aria-valuenow/min/max
  const timeToSeconds = (t: ISOTimeString | undefined): number | undefined => {
    if (!t) return undefined;
    const parsed = parseISOTime(t);
    if (!parsed) return undefined;
    return parsed.hour * 3600 + parsed.minute * 60 + parsed.second;
  };

  const ariaDescribedBy =
    [
      description ? descriptionID : null,
      status?.message ? statusMessageID : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  // Pending input while user is typing (null = show formatted value)
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Format function based on hourFormat
  const formatDisplayTime =
    hourFormat === '12h' ? formatDisplayTime12h : formatDisplayTime24h;

  // Unified change handler that fires both onChange and onChangeAction
  const fireChange = useCallback(
    (newValue: ISOTimeString | undefined) => {
      onChange?.(newValue);
      if (onChangeAction) {
        startTransition(async () => {
          setOptimisticValue(newValue);
          await onChangeAction(newValue);
        });
      }
    },
    [onChange, onChangeAction, startTransition, setOptimisticValue],
  );

  // Display value: pending input if typing, otherwise formatted value
  const displayValue = useMemo(() => {
    if (pendingInput !== null) {
      return pendingInput;
    }
    return normalizedValue
      ? formatDisplayTime(normalizedValue, hasSeconds)
      : '';
  }, [pendingInput, normalizedValue, formatDisplayTime, hasSeconds]);

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
      if (hourFormat === '12h') {
        return hasSeconds ? 'e.g., 2:30:00 PM' : 'e.g., 2:30 PM';
      }
      return hasSeconds ? 'e.g., 14:30:00' : 'e.g., 14:30';
    }
    return placeholder;
  }, [isFocused, displayValue, hourFormat, hasSeconds, placeholder]);

  // Handle input text change - update immediately if valid
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setPendingInput(newValue);

      // If the input is valid, update immediately (don't wait for blur)
      const parsed = parseTimeInput(newValue, hasSeconds);
      if (parsed && isTimeInRange(parsed, min, max) && compareTime(parsed, normalizedValue) !== 0) {
        fireChange(parsed);
      }
    },
    [hasSeconds, min, max, normalizedValue, fireChange],
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle blur - validate and clear pending input
  const handleBlur = useCallback(
    (_e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);

      if (pendingInput === null) {
        return;
      }

      if (!pendingInput.trim()) {
        // Empty input clears the value
        if (normalizedValue !== undefined) {
          fireChange(undefined);
        }
        setPendingInput(null);
        return;
      }

      const parsed = parseTimeInput(pendingInput, hasSeconds);
      if (parsed && isTimeInRange(parsed, min, max)) {
        // Valid time - update if different
        if (compareTime(parsed, normalizedValue) !== 0) {
          fireChange(parsed);
        }
      }
      // Clear pending input - display will revert to formatted value
      setPendingInput(null);
    },
    [pendingInput, normalizedValue, fireChange, hasSeconds, min, max],
  );

  // Commit pending input (Enter) or revert (Escape)
  const commitPendingInput = useCallback(() => {
    if (pendingInput === null) return;

    if (!pendingInput.trim()) {
      if (normalizedValue !== undefined) {
        fireChange(undefined);
      }
      setPendingInput(null);
      return;
    }

    const parsed = parseTimeInput(pendingInput, hasSeconds);
    if (parsed && isTimeInRange(parsed, min, max)) {
      if (compareTime(parsed, normalizedValue) !== 0) {
        fireChange(parsed);
      }
    }
    setPendingInput(null);
  }, [pendingInput, normalizedValue, fireChange, hasSeconds, min, max]);

  // Handle keyboard navigation on input
  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitPendingInput();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setPendingInput(null);
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();

        // Get current time or default to midnight
        let currentTime = normalizedValue;
        if (!currentTime) {
          currentTime = formatISOTime(
            {hour: 0, minute: 0, second: 0},
            hasSeconds,
          );
        }

        const delta = e.key === 'ArrowUp' ? increment : -increment;
        const newTime = adjustTime(currentTime, delta, hasSeconds);

        // Clamp to range instead of silently doing nothing
        const clamped = clampTime(newTime, min, max, hasSeconds);
        if (clamped !== normalizedValue) {
          setPendingInput(null);
          fireChange(clamped);
        }
      }
    },
    [normalizedValue, hasSeconds, increment, min, max, fireChange, commitPendingInput],
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    fireChange(undefined);
    inputRef.current?.focus();
  }, [fireChange]);

  // Combine refs
  const setRefs = useCallback(
    (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
    },
    [ref],
  );

  return (
    <XDSField
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      labelTooltip={labelTooltip}>
      <div
        {...mergeProps(
          xdsClassName('time-input', {size}),
          stylex.props(
            inputWrapperStyles.base,
            sizeStyles[size],
            isDisabled && inputWrapperStyles.disabled,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            status && inputStatusFocusWithinStyles[status.type],
            xstyle,
          ),
          className,
          style,
        )}>
        <div {...stylex.props(styles.icon)}>
          <XDSIcon icon="clock" size="sm" color="secondary" />
        </div>
        <input
          ref={setRefs}
          id={id}
          type="text"
          role="spinbutton"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={displayPlaceholder}
          disabled={isDisabled || isBusy}
          aria-describedby={ariaDescribedBy}
          aria-required={isRequired === true ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          aria-busy={isBusy || undefined}
          aria-valuenow={timeToSeconds(normalizedValue)}
          aria-valuemin={timeToSeconds(min)}
          aria-valuemax={timeToSeconds(max)}
          aria-valuetext={
            normalizedValue
              ? formatDisplayTime(normalizedValue, hasSeconds)
              : undefined
          }
          {...stylex.props(
            styles.input,
            isDisabled && styles.inputDisabled,
            !isInputValid && styles.inputInvalid,
          )}
        />
        {isBusy && <XDSSpinner size="sm" />}
        {hasClear && value && !isDisabled && !isBusy && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear time"
            {...stylex.props(styles.clearButton)}>
            <XDSIcon icon="close" size="sm" color="secondary" />
          </button>
        )}
        {status && (
          <XDSIcon
            icon={statusIconMap[status.type]}
            size="md"
            color={statusIconColorMap[status.type]}
          />
        )}
      </div>
    </XDSField>
  );
}

XDSTimeInput.displayName = 'XDSTimeInput';
