// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSNumberInput.tsx
 * @input Uses React, useId, useState, useMemo, useCallback, XDSField, XDSIcon
 * @output Exports XDSNumberInput component, XDSNumberInputProps
 * @position Core implementation; consumed by index.ts, tested by XDSNumberInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/NumberInput/NumberInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/NumberInput/XDSNumberInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/NumberInput/index.ts (exports if types change)
 * - /apps/storybook/stories/NumberInput.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/NumberInput/ (showcase blocks)
 */

import {
  useId,
  useState,
  useMemo,
  useCallback,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSIconName} from '../Icon';
import {
  colorVars,
  sizeVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
  borderVars,
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
import {XDSIcon, renderIconSlot, type XDSIconType} from '../Icon';
import {useXDSSize} from '../SizeContext/XDSSizeContext';
import {useInputContainer} from '../hooks/useInputContainer';
import {useXDSInputGroup} from '../InputGroup/XDSInputGroupContext';

const styles = stylex.create({
  wrapper: {
    zIndex: 1,
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
  units: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-secondary'],
    flexShrink: 0,
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
  },
  md: {
    height: sizeVars['--size-element-md'],
  },
  lg: {
    height: sizeVars['--size-element-lg'],
  },
});

export type XDSNumberInputSize = keyof typeof sizeStyles;

import {groupStyles} from '../InputGroup/groupStyles';

// Re-export shared types for convenience

export type {
  XDSInputStatus as XDSNumberInputStatus,
  XDSInputStatusType as XDSNumberInputStatusType,
} from '../Field';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';
import {XDSBaseProps} from '../XDSBaseProps';

interface XDSNumberInputPropsBase extends Omit<
  XDSBaseProps,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLInputElement>;
  /**
   * Label text for the input (always rendered for accessibility).
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
   * Icon to display at the start of the input.
   * Accepts a ReactNode (e.g. `<XDSIcon icon={SearchIcon} />`) or an SVG icon component directly.
   */
  startIcon?: ReactNode | XDSIconType;
  /**
   * Icon to display before the label text.
   */
  labelIcon?: ReactNode | XDSIconType;
  /**
   * Status indicator for the input.
   * When set, displays a colored border and status icon.
   * If message is provided, displays a floating message box below the input.
   */
  status?: XDSInputStatus;
  /**
   * The size of the input.
   * - 'sm': Compact size (28px height)
   * - 'md': Default size (32px height)
   * - 'lg': Large size (36px height)
   * @default 'md'
   */
  size?: XDSNumberInputSize;
  // onChange and hasClear defined in discriminated union below
  /**
   * The current value of the input.
   * Use null or undefined to represent an empty/unset value.
   */
  value: number | null | undefined;
  /**
   * Placeholder text shown when the input is empty.
   */
  placeholder?: string;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * Whether to automatically focus the input on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * The HTML name attribute for the input.
   * Useful for form submissions.
   */
  htmlName?: string;
  /**
   * The HTML autocomplete attribute for the input.
   */
  autoComplete?: string;
  /**
   * The minimum value allowed.
   */
  min?: number | null;
  /**
   * The maximum value allowed.
   */
  max?: number | null;
  /**
   * The step increment for the input.
   * @default 1
   */
  step?: number | null;
  /**
   * Units text to display at the end of the input (e.g., "%" or "GB").
   */
  units?: string | null;
  /**
   * Whether to only allow integer values (no floating point).
   * @default false
   */
  isIntegerOnly?: boolean;
  /**
   * Callback fired when the input receives focus.
   */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the input loses focus.
   */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the user presses the Enter key.
   */
  onEnter?: () => void;
  /**
   * Callback fired on keydown events on the input.
   */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Without `hasClear`, onChange only receives valid numbers.
 * With `hasClear`, onChange also receives `null` when the user clears the input.
 */
type XDSNumberInputPropsNonClearable = XDSNumberInputPropsBase & {
  hasClear?: false;
  onChange: (value: number) => void;
};

type XDSNumberInputPropsClearable = XDSNumberInputPropsBase & {
  /**
   * Whether to show a clear button when a value is set.
   * When clicked, resets the value to null and returns focus to the input.
   *
   * When enabled, the `onChange` callback type widens to also accept `null`,
   * signaling that the user cleared the input.
   */
  hasClear: true;
  onChange: (value: number | null) => void;
};

export type XDSNumberInputProps =
  | XDSNumberInputPropsNonClearable
  | XDSNumberInputPropsClearable;

/**
 * Parse and validate a string input as a number.
 * Returns null if the input is not a valid number or fails validation.
 */
function parseNumberInput(
  input: string,
  options: {
    min?: number | null;
    max?: number | null;
    isIntegerOnly?: boolean;
  },
): number | null {
  const trimmed = input.trim();
  if (trimmed === '' || trimmed === '-') {
    return null;
  }

  const num = Number(trimmed);
  if (!Number.isFinite(num)) {
    return null;
  }

  // Check integer constraint
  if (options.isIntegerOnly && !Number.isInteger(num)) {
    return null;
  }

  // Check min constraint
  if (options.min != null && num < options.min) {
    return null;
  }

  // Check max constraint
  if (options.max != null && num > options.max) {
    return null;
  }

  return num;
}

/**
 * A number input component for collecting numeric user input.
 * Only calls onChange when the entered value passes validation.
 *
 * @example
 * ```
 * <XDSNumberInput label="Quantity" value={quantity} onChange={setQuantity} />
 * <XDSNumberInput label="Price" value={price} onChange={setPrice} min={0} step={0.01} />
 * ```
 */
export function XDSNumberInput({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  startIcon,
  labelIcon,
  status,
  size: sizeProp,
  onChange,
  value,
  placeholder,
  labelTooltip,
  hasAutoFocus = false,
  htmlName,
  autoComplete,
  min,
  max,
  step,
  units,
  isIntegerOnly = false,
  onFocus,
  onBlur,
  hasClear,
  onEnter,
  onKeyDown,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: XDSNumberInputProps) {
  const size = useXDSSize(sizeProp, 'md');
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputGroup = useXDSInputGroup();

  // Pending input while user is typing (null = show formatted value)
  const [pendingInput, setPendingInput] = useState<string | null>(null);

  const statusIconMap: Record<XDSInputStatusType, XDSIconName> = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const statusIconColorMap: Record<
    XDSInputStatusType,
    'warning' | 'error' | 'success'
  > = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const ariaDescribedBy =
    [
      description ? descriptionID : null,
      status?.message ? statusMessageID : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  // Display value: pending input if typing, otherwise the raw value
  // Note: With type="number", we can't use formatted display values
  const displayValue = useMemo(() => {
    if (pendingInput !== null) {
      return pendingInput;
    }
    if (value == null) {
      return '';
    }
    return String(value);
  }, [pendingInput, value]);

  // Check if current pending input is valid (for styling purposes)
  const isInputValid = useMemo(() => {
    if (pendingInput === null || !pendingInput.trim()) {
      return true;
    }
    return parseNumberInput(pendingInput, {min, max, isIntegerOnly}) !== null;
  }, [pendingInput, min, max, isIntegerOnly]);

  // Handle input text change - update immediately if valid
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setPendingInput(newValue);

      // If the input is valid, update immediately
      const parsed = parseNumberInput(newValue, {min, max, isIntegerOnly});
      if (parsed !== null && parsed !== value) {
        onChange(parsed);
      }
    },
    [value, onChange, min, max, isIntegerOnly],
  );

  // Handle focus
  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      onFocus?.(e);
    },
    [onFocus],
  );

  // Handle blur - validate and clear pending input
  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (pendingInput !== null) {
        const parsed = parseNumberInput(pendingInput, {
          min,
          max,
          isIntegerOnly,
        });
        if (parsed !== null && parsed !== value) {
          onChange(parsed);
        }
      }

      // Clear pending input - display will revert to formatted value
      setPendingInput(null);
      onBlur?.(e);
    },
    [pendingInput, value, onChange, min, max, isIntegerOnly, onBlur],
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        // Validate and commit on Enter
        if (pendingInput !== null) {
          const parsed = parseNumberInput(pendingInput, {
            min,
            max,
            isIntegerOnly,
          });
          if (parsed !== null && parsed !== value) {
            onChange(parsed);
          }
        }
        onEnter?.();
      }
      onKeyDown?.(e);
    },
    [
      pendingInput,
      value,
      onChange,
      min,
      max,
      isIntegerOnly,
      onEnter,
      onKeyDown,
    ],
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    if (hasClear) {
      (onChange as (value: number | null) => void)(null);
    }
    setPendingInput(null);
    inputRef.current?.focus();
  }, [hasClear, onChange]);

  // Focus input when clicking anywhere on the wrapper (icons, padding, etc.)
  const {onClick: handleWrapperClick, onMouseUp: handleWrapperMouseUp} =
    useInputContainer({
      containerRef,
      inputRef,
      disabled: isDisabled,
    });

  const inputWrapper = (
    <div
      ref={containerRef}
      onClick={handleWrapperClick}
      onMouseUp={handleWrapperMouseUp}
      {...mergeProps(
        xdsClassName('number-input', {size, status: status?.type ?? null}),
        stylex.props(
          inputWrapperStyles.base,
          styles.wrapper,
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
      {startIcon && renderIconSlot(startIcon, {size: 'sm', color: 'secondary'})}
      <input
        {...rest}
        ref={mergeRefs(ref, inputRef)}
        id={id}
        name={htmlName}
        type="number"
        autoComplete={autoComplete}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        autoFocus={hasAutoFocus}
        data-autofocus={hasAutoFocus || undefined}
        min={min ?? undefined}
        max={max ?? undefined}
        step={step ?? undefined}
        aria-describedby={ariaDescribedBy}
        aria-required={isRequired === true ? 'true' : undefined}
        aria-invalid={status?.type === 'error' ? 'true' : undefined}
        aria-label={inputGroup ? label : undefined}
        {...stylex.props(
          styles.input,
          isDisabled && styles.inputDisabled,
          !isInputValid && styles.inputInvalid,
        )}
      />
      {units && <span {...stylex.props(styles.units)}>{units}</span>}
      {hasClear && value != null && !isDisabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={`Clear ${label}`}
          {...stylex.props(styles.clearButton)}>
          <XDSIcon icon="close" size="sm" color="secondary" />
        </button>
      )}
      {status && !inputGroup && (
        <XDSIcon
          icon={statusIconMap[status.type]}
          size="md"
          color={statusIconColorMap[status.type]}
        />
      )}
    </div>
  );

  if (inputGroup) {
    return inputWrapper;
  }

  return (
    <XDSField
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      labelIcon={labelIcon}
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
      {inputWrapper}
    </XDSField>
  );
}

XDSNumberInput.displayName = 'XDSNumberInput';
