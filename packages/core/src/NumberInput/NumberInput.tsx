// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NumberInput.tsx
 * @input Uses React, useId, useState, useMemo, useCallback, Field, Icon, InputGroupContext
 * @output Exports NumberInput component, NumberInputProps
 * @position Core implementation; consumed by index.ts, tested by NumberInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/NumberInput/NumberInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/NumberInput/NumberInput.test.tsx (tests for new/changed behavior)
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
import {Icon, renderIconSlot, type IconType} from '../Icon';
import {VisuallyHidden} from '../VisuallyHidden';
import {useTooltip} from '../Tooltip';
import {getInputARIA} from '../utils';
import {useSize} from '../SizeContext/SizeContext';
import {useInputContainer} from '../hooks/useInputContainer';
import {useInputGroup} from '../InputGroup/InputGroupContext';

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

export type NumberInputSize = keyof typeof sizeStyles;

import {groupStyles} from '../InputGroup/groupStyles';

// Re-export shared types for convenience

export type {
  InputStatus as NumberInputStatus,
  InputStatusType as NumberInputStatusType,
} from '../Field';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';

interface NumberInputPropsBase extends Omit<
  BaseProps,
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
   * Explains why the input is disabled. When set together with `isDisabled`,
   * the input shows a tooltip with this text on hover and keyboard focus, and
   * stays focusable (via `aria-disabled`) so the reason is discoverable by
   * keyboard and assistive technology. The field cannot be edited (it becomes
   * read-only) while disabled.
   *
   * Use this instead of wrapping a disabled input in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <NumberInput
   *   label="Quantity"
   *   value={quantity}
   *   isDisabled
   *   disabledMessage="Editing is locked while the order is processing"
   * />
   * ```
   */
  disabledMessage?: string;
  /**
   * Icon to display at the start of the input.
   * Accepts a ReactNode (e.g. `<Icon icon={SearchIcon} />`) or an SVG icon component directly.
   */
  startIcon?: ReactNode | IconType;
  /**
   * Icon to display before the label text.
   */
  labelIcon?: ReactNode | IconType;
  /**
   * Status indicator for the input.
   * When set, displays a colored border and status icon.
   * If message is provided, displays a floating message box below the input.
   */
  status?: InputStatus;
  /**
   * The size of the input.
   * - 'sm': Compact size (28px height)
   * - 'md': Default size (32px height)
   * - 'lg': Large size (36px height)
   * @default 'md'
   */
  size?: NumberInputSize;
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
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
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
type NumberInputPropsNonClearable = NumberInputPropsBase & {
  hasClear?: false;
  onChange: (value: number) => void;
};

type NumberInputPropsClearable = NumberInputPropsBase & {
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

export type NumberInputProps =
  | NumberInputPropsNonClearable
  | NumberInputPropsClearable;

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
 * <NumberInput label="Quantity" value={quantity} onChange={setQuantity} />
 * <NumberInput label="Price" value={price} onChange={setPrice} min={0} step={0.01} />
 * ```
 */
export function NumberInput({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  disabledMessage,
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
  width,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: NumberInputProps) {
  const size = useSize(sizeProp, 'md');
  const id = useId();
  const inputLabelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputGroup = useInputGroup();

  // Pending input while user is typing (null = show formatted value)
  const [pendingInput, setPendingInput] = useState<string | null>(null);

  // Disabled-reason tooltip. Disabled controls swallow pointer events, so the
  // tooltip listeners attach to the input container (which already exists) and
  // the input stays perceivable via aria-disabled instead of the native
  // disabled attribute. The field is made read-only so it can't be typed into,
  // and value mutation is blocked by the isDisabled guard in the handlers.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The container div is not naturally focusable; focusin bubbles up from
    // the input, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

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
      // Value can't change while showing a disabled message (the field is
      // read-only and non-native-disabled), but guard the handler too so the
      // pending value and onChange never fire.
      if (isDisabled) {
        return;
      }
      const newValue = e.target.value;
      setPendingInput(newValue);

      // If the input is valid, update immediately
      const parsed = parseNumberInput(newValue, {min, max, isIntegerOnly});
      if (parsed !== null && parsed !== value) {
        onChange(parsed);
      }
    },
    [value, onChange, min, max, isIntegerOnly, isDisabled],
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
        if (hasClear && pendingInput.trim() === '') {
          // Keyboard clearing honors the clearable contract: an emptied
          // input commits null instead of silently reverting on blur.
          if (value != null) {
            onChange(null);
          }
        } else {
          const parsed = parseNumberInput(pendingInput, {
            min,
            max,
            isIntegerOnly,
          });
          if (parsed !== null && parsed !== value) {
            onChange(parsed);
          }
        }
      }

      // Clear pending input - display will revert to formatted value
      setPendingInput(null);
      onBlur?.(e);
    },
    [pendingInput, value, onChange, min, max, isIntegerOnly, onBlur, hasClear],
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        // Validate and commit on Enter
        if (pendingInput !== null) {
          if (hasClear && pendingInput.trim() === '') {
            // Same clearable contract as blur: Enter on an emptied input
            // commits null instead of reverting.
            if (value != null) {
              onChange(null);
            }
          } else {
            const parsed = parseNumberInput(pendingInput, {
              min,
              max,
              isIntegerOnly,
            });
            if (parsed !== null && parsed !== value) {
              onChange(parsed);
            }
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
      hasClear,
    ],
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    if (hasClear) {
      onChange(null);
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
      ref={el => {
        containerRef.current = el;
        // Anchor + hover/focus listeners for the disabled-message tooltip.
        // Handlers are gated internally by isEnabled, and anchor names
        // compose, so attaching unconditionally is safe.
        disabledMessageTooltip.ref(el);
      }}
      onClick={handleWrapperClick}
      onMouseUp={handleWrapperMouseUp}
      {...mergeProps(
        themeProps('number-input', {size, status: status?.type ?? null}),
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
      {inputGroup && <VisuallyHidden id={inputLabelID}>{label}</VisuallyHidden>}
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
        // With a disabledMessage the input keeps focusability via aria-disabled
        // so the reason is focus-discoverable; readOnly + the handler guards
        // keep the value from changing.
        disabled={isDisabled && !showsDisabledMessage}
        aria-disabled={showsDisabledMessage ? 'true' : undefined}
        readOnly={showsDisabledMessage || undefined}
        autoFocus={hasAutoFocus}
        data-autofocus={hasAutoFocus || undefined}
        min={min ?? undefined}
        max={max ?? undefined}
        step={step ?? undefined}
        aria-describedby={ariaDescribedBy}
        aria-required={isRequired === true ? 'true' : undefined}
        aria-invalid={
          status?.type === 'error' || !isInputValid ? 'true' : undefined
        }
        aria-labelledby={ariaLabelledBy}
        {...stylex.props(
          styles.input,
          isDisabled && styles.inputDisabled,
          !isInputValid && styles.inputInvalid,
        )}
      />
      {units && <span {...stylex.props(styles.units)}>{units}</span>}
      {/*
        Live region announcing invalid typed input to assistive technology.
        The value silently reverts on blur, so without this a screen-reader
        user would get no feedback that their entry was rejected (WCAG 3.3.1).
      */}
      <VisuallyHidden as="div" role="alert" aria-live="assertive">
        {!isInputValid ? 'Invalid number' : ''}
      </VisuallyHidden>
      {hasClear && value != null && !isDisabled && (
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
      labelTooltip={labelTooltip}
      width={width}>
      {inputWrapper}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </Field>
  );
}

NumberInput.displayName = 'NumberInput';
