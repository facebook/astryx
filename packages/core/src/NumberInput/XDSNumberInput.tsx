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
 */


import {
  useId,
  useState,
  useMemo,
  useCallback,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSIconName} from '../Icon';
import {
  colorVars,
  sizeVars,
  typographyVars,
  lineHeightVars,
  typeScaleVars,
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
import {XDSIcon, type XDSIconType} from '../Icon';

const styles = stylex.create({
  wrapper: {
    zIndex: 1,
  },
  input: {
    display: 'block',
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    fontFamily: typographyVars['--font-body'],
    fontSize: typeScaleVars['--text-body-size'],
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
  units: {
    fontFamily: typographyVars['--font-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-secondary'],
    flexShrink: 0,
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

export type XDSNumberInputSize = keyof typeof sizeStyles;

// Re-export shared types for convenience

export type {
  XDSInputStatus as XDSNumberInputStatus,
  XDSInputStatusType as XDSNumberInputStatusType,
} from '../Field';
import {xdsClassName, mergeProps} from '../utils';
import {XDSBaseProps} from '../XDSBaseProps';

export interface XDSNumberInputProps extends Omit<
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
   * Pass an SVG icon component (e.g. from heroicons, lucide, etc.).
   */
  startIcon?: XDSIconType;
  /**
   * Icon to display before the label text.
   */
  labelIcon?: XDSIconType;
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
  /**
   * Callback fired when the input value changes to a valid number.
   * Only called when the entered value passes validation.
   */
  onChange: (value: number) => void;
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
}

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
  size = 'md',
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
  onEnter,
  xstyle,
  className,
  style,
  ref,
}: XDSNumberInputProps) {
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Pending input while user is typing (null = show formatted value)
  const [pendingInput, setPendingInput] = useState<string | null>(null);

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
    },
    [pendingInput, value, onChange, min, max, isIntegerOnly, onEnter],
  );

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
      <div
        {...mergeProps(
          xdsClassName('number-input', {size}),
          stylex.props(
            inputWrapperStyles.base,
            styles.wrapper,
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
        {startIcon && <XDSIcon icon={startIcon} size="sm" color="primary" />}
        <input
          ref={setRefs}
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
          min={min ?? undefined}
          max={max ?? undefined}
          step={step ?? undefined}
          aria-describedby={ariaDescribedBy}
          aria-required={isRequired === true ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          {...stylex.props(
            styles.input,
            isDisabled && styles.inputDisabled,
            !isInputValid && styles.inputInvalid,
          )}
        />
        {units && <span {...stylex.props(styles.units)}>{units}</span>}
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

XDSNumberInput.displayName = 'XDSNumberInput';
