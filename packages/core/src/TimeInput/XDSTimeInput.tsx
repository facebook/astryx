/**
 * @file XDSTimeInput.tsx
 * @input Uses React forwardRef, useId, useState, useEffect, useCallback, useRef, XDSField, XDSIcon
 * @output Exports XDSTimeInput component, XDSTimeInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSTimeInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TimeInput/README.md (props table, features, implementation notes)
 * - /packages/core/src/TimeInput/XDSTimeInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TimeInput/index.ts (exports if types change)
 * - /apps/storybook/stories/TimeInput.stories.tsx (storybook stories)
 */

import {
  forwardRef,
  useId,
  useState,
  useCallback,
  useRef,
  useMemo,
  useOptimistic,
  startTransition,
  type KeyboardEvent,
  type FocusEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {ClockIcon, XMarkIcon} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {XDSField, type XDSInputStatus, type XDSInputStatusType} from '../Field';
import {XDSIcon} from '../Icon';
import {
  type ISOTimeString,
  parseTimeInput,
  formatDisplayTime12h,
  formatDisplayTime24h,
  formatISOTime,
  adjustTime,
  isTimeInRange,
} from '../utils';

const styles = stylex.create({
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colorVars['--color-divider-emphasized'],
      ':hover': colorVars['--color-divider-high-contrast'],
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    transitionProperty: 'border-color, outline',
    transitionDuration: transitionVars['--transition-fast'],
    outline: {
      default: 'none',
      ':focus-within': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-within': '1px',
    },
  },
  wrapperDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-divider-emphasized'],
  },
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
    lineHeight: lineHeightVars['--leading-normal'],
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
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: 1,
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: 18,
  },
  md: {
    height: 26,
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

export type XDSTimeInputSize = keyof typeof sizeStyles;
export type XDSTimeInputHourFormat = '12h' | '24h';

// Re-export shared types for convenience
export type {
  XDSInputStatus as XDSTimeInputStatus,
  XDSInputStatusType as XDSTimeInputStatusType,
} from '../Field';

export interface XDSTimeInputProps {
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
   * Either onChange or onChangeAction must be provided.
   */
  onChange?: (value: ISOTimeString | undefined) => void;

  /**
   * Async action to perform on change. Wrapped in React transition.
   * Replaces onChange when provided - handle state updates inside this action.
   * Receives the same arguments as onChange.
   */
  onChangeAction?: (value: ISOTimeString | undefined) => void | Promise<void>;

  /**
   * Whether the input is in a loading state.
   * Shows disabled state during async operations.
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
}

/**
 * A time input component with text input and keyboard navigation.
 *
 * @example
 * ```tsx
 * <XDSTimeInput
 *   label="Start time"
 *   value={time}
 *   onChange={setTime}
 *   hourFormat="12h"
 *   hasClear
 * />
 * ```
 */
export const XDSTimeInput = forwardRef<HTMLInputElement, XDSTimeInputProps>(
  (
    {
      label,
      isLabelHidden = false,
      description,
      isOptional = false,
      isRequired = false,
      isDisabled = false,
      isLoading = false,
      value,
      onChange,
      onChangeAction,
      min,
      max,
      hasSeconds = false,
      hasClear = false,
      hourFormat = '12h',
      increment = 1,
      placeholder = 'Select a time',
      size = 'md',
      status,
    },
    ref,
  ) => {
    const id = useId();
    const descriptionID = useId();
    const statusMessageID = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Track optimistic value for async actions
    const [optimisticValue, setOptimisticValue] = useOptimistic(value);
    // isBusy is for visual feedback only (reduced opacity, aria-busy)
    const isBusy = isLoading || optimisticValue !== value;

    // Helper to handle value changes with action support
    const handleValueChange = useCallback(
      (newValue: ISOTimeString | undefined) => {
        if (onChangeAction) {
          // Use action - wraps in transition for async support
          startTransition(() => {
            setOptimisticValue(newValue);
            onChangeAction(newValue);
          });
        } else if (onChange) {
          onChange(newValue);
        }
      },
      [onChange, onChangeAction, setOptimisticValue],
    );

    // Status icon mapping
    const statusIconMap: Record<XDSInputStatusType, typeof XCircleIcon> = {
      warning: ExclamationTriangleIcon,
      error: XCircleIcon,
      success: CheckCircleIcon,
    };

    const statusIconColorMap: Record<
      XDSInputStatusType,
      'warning' | 'negative' | 'positive'
    > = {
      warning: 'warning',
      error: 'negative',
      success: 'positive',
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

    // Display value: pending input if typing, otherwise formatted value
    const displayValue = useMemo(() => {
      if (pendingInput !== null) {
        return pendingInput;
      }
      return value ? formatDisplayTime(value, hasSeconds) : '';
    }, [pendingInput, value, formatDisplayTime, hasSeconds]);

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
        const newValue = e.target.value;
        setPendingInput(newValue);

        // If the input is valid, update immediately (don't wait for blur)
        const parsed = parseTimeInput(newValue, hasSeconds);
        if (parsed && isTimeInRange(parsed, min, max) && parsed !== value) {
          handleValueChange(parsed);
        }
      },
      [hasSeconds, min, max, value, handleValueChange],
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
          if (value !== undefined) {
            handleValueChange(undefined);
          }
          setPendingInput(null);
          return;
        }

        const parsed = parseTimeInput(pendingInput, hasSeconds);
        if (parsed && isTimeInRange(parsed, min, max)) {
          // Valid time - update if different
          if (parsed !== value) {
            handleValueChange(parsed);
          }
        }
        // Clear pending input - display will revert to formatted value
        setPendingInput(null);
      },
      [pendingInput, value, handleValueChange, hasSeconds, min, max],
    );

    // Handle keyboard navigation on input
    const handleInputKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
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
            handleValueChange(newTime);
          }
        }
      },
      [value, hasSeconds, increment, min, max, handleValueChange],
    );

    // Handle clear button click
    const handleClear = useCallback(() => {
      handleValueChange(undefined);
      inputRef.current?.focus();
    }, [handleValueChange]);

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
        }>
        <div
          {...stylex.props(
            styles.wrapper,
            (isDisabled || isBusy) && styles.wrapperDisabled,
            status && statusBorderStyles[status.type],
          )}>
          <div {...stylex.props(styles.icon)}>
            <XDSIcon icon={ClockIcon} size="sm" color="secondary" />
          </div>
          <input
            ref={setRefs}
            id={id}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleInputKeyDown}
            placeholder={displayPlaceholder}
            disabled={isDisabled}
            aria-busy={isBusy || undefined}
            aria-describedby={ariaDescribedBy}
            aria-required={isRequired === true ? 'true' : undefined}
            aria-invalid={status?.type === 'error' ? 'true' : undefined}
            {...stylex.props(
              styles.input,
              sizeStyles[size],
              (isDisabled || isBusy) && styles.inputDisabled,
              !isInputValid && styles.inputInvalid,
            )}
          />
          {hasClear && value && !isDisabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear time"
              {...stylex.props(styles.clearButton)}>
              <XDSIcon icon={XMarkIcon} size="sm" color="secondary" />
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
  },
);

XDSTimeInput.displayName = 'XDSTimeInput';
