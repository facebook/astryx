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
 * - /packages/cli/assets/templates/blocks/components/NumberInput/ (showcase blocks)
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
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
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
import {Icon, renderIconSlot, type IconType} from '../Icon';
import {VisuallyHidden} from '../VisuallyHidden';
import {useTooltip} from '../Tooltip';
import {getInputARIA} from '../utils';
import {useSize} from '../SizeContext/SizeContext';
import {useInputContainer} from '../hooks/useInputContainer';
import {useInputStatusIcon} from '../hooks/useInputStatusIcon';
import {useInputGroup} from '../InputGroup/InputGroupContext';

const styles = stylex.create({
  wrapper: {
    zIndex: 1,
  },
  wrapperWithNumberSteppers: {
    paddingInlineEnd: 0,
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
  numberSteppers: {
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    width: spacingVars['--spacing-4'],
    marginBlock: `calc(-1 * ${spacingVars['--spacing-1']})`,
    borderInlineStartWidth: borderVars['--border-width'],
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border-emphasized'],
    overflow: 'hidden',
    borderStartEndRadius: radiusVars['--radius-element'],
    borderEndEndRadius: radiusVars['--radius-element'],
  },
  numberStepperButton: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 0,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    color: colorVars['--color-icon-secondary'],
    backgroundColor: colorVars['--color-background-surface'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`,
    },
    cursor: 'pointer',
    outline: 'none',
  },
  numberStepperButtonDisabled: {
    color: colorVars['--color-icon-disabled'],
    cursor: 'not-allowed',
    backgroundImage: 'none',
  },
  decrementButton: {
    borderBlockStartWidth: borderVars['--border-width'],
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border-emphasized'],
  },
  incrementIcon: {
    transform: 'rotate(180deg)',
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
import {isImeKeyEvent, mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

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
   * Whether the input is read-only.
   * The value is shown at full opacity and still submits with the form, but
   * cannot be edited. Unlike `isDisabled`, a read-only input is not dimmed and
   * stays in the tab order — use it for a value the user should see and send
   * but not change. Stepping is off in every form while read-only: arrow keys,
   * the wheel, and the number steppers. `isDisabled` takes precedence when both
   * are set.
   * @default false
   */
  isReadOnly?: boolean;
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
   * How the status message is placed relative to the input.
   * - 'attached': message overlaps directly below the input (bordered treatment)
   * - 'detached': message floats below as a separate element with spacing
   * - 'tooltip': no message box; the status icon becomes a focusable info-tip button that reveals the message on hover, keyboard focus, or tap
   * @default 'attached'
   */
  statusVariant?: FieldStatusVariant;
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
   * Formats the committed value while the input is not being edited.
   * The raw numeric value is shown on focus so it remains editable.
   */
  formatValue?: (value: number) => string;
  /**
   * Whether scrolling the wheel over a focused input steps the value.
   * @default true
   */
  isWheelEnabled?: boolean;
  /**
   * Whether to show increment and decrement buttons at the end of the input.
   * @default false
   */
  hasNumberSteppers?: boolean;
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
  NumberInputPropsNonClearable | NumberInputPropsClearable;

/**
 * Parse and validate a string input as a number.
 * Returns null if the input is not a valid number or fails validation.
 */
/** `'０'.charCodeAt(0) - '0'.charCodeAt(0)` — the full-width digit offset. */
const FULL_WIDTH_DIGIT_OFFSET = 0xff10 - 0x30;

/**
 * Fold the characters a number can be *written* with onto the ASCII ones this
 * field parses, mirroring what the native `type="number"` control accepts:
 * full-width digits and signs (produced by CJK IMEs and pasted from East Asian
 * documents), and the whitespace and thousands separators that ride along with
 * a value copied out of a spreadsheet.
 *
 * Locale note: like the native control, this treats `,` as a *grouping*
 * separator and drops it, because {@link parseNumberInput} reads ASCII decimals
 * only — `1,234` is 1234, not 1.234. Locale-aware decimal separators would mean
 * parsing through `Intl.NumberFormat`, which is a larger change than this one.
 */
function normalizeNumericText(text: string): string {
  return (
    text
      .replace(/[\uFF10-\uFF19]/g, digit =>
        String.fromCharCode(digit.charCodeAt(0) - FULL_WIDTH_DIGIT_OFFSET),
      )
      // Full-width and ideographic forms of the signs and the decimal point.
      .replace(/[\uFF0E\u3002]/g, '.')
      .replace(/[\uFF0D\u2212]/g, '-')
      .replace(/\uFF0B/g, '+')
      // Whitespace (incl. the NBSP spreadsheets emit) and grouping separators.
      .replace(/[\s\u00A0]/g, '')
      .replace(/,/g, '')
  );
}

/**
 * Whether every character in a string belongs to a number.
 *
 * Deliberately a *character-set* gate rather than a grammar: it accepts states
 * that are in-progress (`-`, `1.`, `.5`, `1e-`) and states that are malformed
 * but still numeric text (`--1`, `1.2.3`). Malformed input is not blocked here
 * because the field already has a path for it — {@link parseNumberInput}
 * returns null, the value stays as pending input, and the control renders
 * `aria-invalid` with an "Invalid number" alert. That is the same split the
 * native control makes: it refuses the keystroke for a letter, but lets you
 * type `--1` and reports it through `validity.badInput`.
 *
 * Constraint checks (min/max/integer-only) are likewise not applied: a value
 * that merely violates a constraint is still a number, and stays pending so it
 * can be surfaced as invalid.
 */
function isNumericDraft(text: string): boolean {
  return /^[0-9.eE+-]*$/.test(text);
}

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

type StepDirection = -1 | 1;

function getDecimalPlaces(value: number): number {
  const [coefficient, exponentText] = String(value).toLowerCase().split('e');
  const fractionLength = coefficient.split('.')[1]?.length ?? 0;
  const exponent = exponentText == null ? 0 : Number(exponentText);
  return Math.max(0, fractionLength - exponent);
}

function getEffectiveStep(
  step: number | null | undefined,
  isIntegerOnly: boolean,
): number {
  if (
    step == null ||
    !Number.isFinite(step) ||
    step <= 0 ||
    (isIntegerOnly && !Number.isInteger(step))
  ) {
    return 1;
  }
  return step;
}

function getSteppedValue({
  currentValue,
  direction,
  min,
  max,
  step,
  isIntegerOnly,
}: {
  currentValue: number | null;
  direction: StepDirection;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  isIntegerOnly: boolean;
}): number | null {
  const effectiveStep = getEffectiveStep(step, isIntegerOnly);
  const stepBase =
    min != null && (!isIntegerOnly || Number.isInteger(min)) ? min : 0;

  let nextValue: number;
  if (currentValue == null) {
    nextValue = direction === 1 ? (min ?? 0) : (max ?? 0);
    if (isIntegerOnly) {
      nextValue =
        direction === 1 ? Math.ceil(nextValue) : Math.floor(nextValue);
    }
  } else {
    const stepPosition = (currentValue - stepBase) / effectiveStep;
    const tolerance = Number.EPSILON * Math.max(1, Math.abs(stepPosition)) * 4;
    const nextStepPosition =
      direction === 1
        ? Math.floor(stepPosition + tolerance) + 1
        : Math.ceil(stepPosition - tolerance) - 1;
    nextValue = stepBase + nextStepPosition * effectiveStep;
  }

  if (min != null) {
    nextValue = Math.max(min, nextValue);
  }
  if (max != null) {
    nextValue = Math.min(max, nextValue);
  }

  if (!Number.isFinite(nextValue)) {
    return currentValue;
  }

  const precision = Math.min(
    12,
    Math.max(getDecimalPlaces(effectiveStep), getDecimalPlaces(stepBase)),
  );
  const roundedValue = Number(nextValue.toFixed(precision));
  if (isIntegerOnly && !Number.isInteger(roundedValue)) {
    return currentValue;
  }
  return Object.is(roundedValue, -0) ? 0 : roundedValue;
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
  isReadOnly = false,
  disabledMessage,
  startIcon,
  labelIcon,
  status,
  statusVariant = 'attached',
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
  formatValue,
  isWheelEnabled = true,
  hasNumberSteppers = false,
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
  const t = useTranslator();
  const size = useSize(sizeProp, 'md');
  const id = useId();
  const inputLabelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const unitsID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputGroup = useInputGroup();

  // Pending input while user is typing (null = show formatted value)
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

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

  const {statusIcon, describedBy: statusTooltipDescribedBy} =
    useInputStatusIcon({
      status,
      statusVariant,
      isInGroup: !!inputGroup,
    });

  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelID,
    [
      description ? descriptionID : null,
      // The status message element is rendered by Field, which is skipped
      // inside an InputGroup — only reference it when it actually exists.
      !inputGroup && statusVariant !== 'tooltip' && status?.message
        ? statusMessageID
        : null,
      // The tooltip variant renders no message box; describe the input by the
      // tooltip's content instead so the status is still announced.
      statusTooltipDescribedBy,
      units ? unitsID : null,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ],
    inputGroup,
  );

  const formattedValue = useMemo(() => {
    if (value == null) {
      return '';
    }
    return formatValue?.(value) ?? String(value);
  }, [formatValue, value]);

  // Preserve pending text while editing. Otherwise show the formatted value
  // at rest and the raw numeric value while focused so it remains editable.
  const displayValue = useMemo(() => {
    if (pendingInput !== null) {
      return pendingInput;
    }
    if (value == null) {
      return '';
    }
    return isFocused ? String(value) : formattedValue;
  }, [formattedValue, isFocused, pendingInput, value]);

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
      if (isDisabled || isReadOnly) {
        return;
      }
      const newValue = normalizeNumericText(e.target.value);

      // Non-numeric text is refused at `beforeinput`, before the browser edits
      // the field (see beforeInputListenerRef). This is the fallback for the
      // paths that never raise a cancelable `beforeinput` — a programmatic
      // `value` assignment in a test, or an engine without the event.
      if (!isNumericDraft(newValue)) {
        return;
      }

      setPendingInput(newValue);

      // If the input is valid, update immediately
      const parsed = parseNumberInput(newValue, {min, max, isIntegerOnly});
      if (parsed !== null && parsed !== value) {
        onChange(parsed);
      }
    },
    [value, onChange, min, max, isIntegerOnly, isDisabled, isReadOnly],
  );

  // Handle focus
  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
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
      setIsFocused(false);
      onBlur?.(e);
    },
    [pendingInput, value, onChange, min, max, isIntegerOnly, onBlur, hasClear],
  );

  const valueForStepping = useMemo(() => {
    if (pendingInput === null) {
      return value ?? null;
    }
    if (pendingInput.trim() === '') {
      return null;
    }
    return (
      parseNumberInput(pendingInput, {min, max, isIntegerOnly}) ?? value ?? null
    );
  }, [isIntegerOnly, max, min, pendingInput, value]);

  const getNextValue = useCallback(
    (direction: StepDirection) =>
      getSteppedValue({
        currentValue: valueForStepping,
        direction,
        min,
        max,
        step,
        isIntegerOnly,
      }),
    [isIntegerOnly, max, min, step, valueForStepping],
  );

  const stepValue = useCallback(
    (direction: StepDirection) => {
      // A read-only field is not steppable by any route: keyboard, wheel, or
      // the stepper buttons all land here.
      if (isDisabled || isReadOnly) {
        return;
      }
      const nextValue = getNextValue(direction);
      if (nextValue == null) {
        return;
      }
      setPendingInput(null);
      if (nextValue !== value) {
        onChange(nextValue);
      }
    },
    [getNextValue, isDisabled, isReadOnly, onChange, value],
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // The field is type="text" for formatted display, so an IME can compose
      // into it: Enter commits the candidate and the arrows walk the candidate
      // window. The composing keydown fires before compositionend, so without
      // this guard those keystrokes would commit or step the value instead.
      // See utils/ime.ts.
      if (isImeKeyEvent(e.nativeEvent)) {
        return;
      }
      const hasModifier = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;
      if (!hasModifier && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        onKeyDown?.(e);
        if (e.defaultPrevented) {
          return;
        }
        e.preventDefault();
        stepValue(e.key === 'ArrowUp' ? 1 : -1);
        return;
      }
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
      stepValue,
    ],
  );

  // React's delegated wheel listener can be passive, so use a native,
  // explicitly non-passive listener to prevent page scrolling only when this
  // focused input is intentionally consuming the gesture to step its value.
  const wheelListenerRef = useCallback(
    (input: HTMLInputElement | null) => {
      if (input == null || !isWheelEnabled) {
        return;
      }

      const handleWheel = (event: WheelEvent) => {
        // Bail before preventDefault so a read-only input never swallows the
        // page scroll it cannot act on.
        if (
          document.activeElement !== input ||
          isDisabled ||
          isReadOnly ||
          event.deltaY === 0 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        ) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        stepValue(event.deltaY < 0 ? 1 : -1);
      };

      input.addEventListener('wheel', handleWheel, {passive: false});
      return () => input.removeEventListener('wheel', handleWheel);
    },
    [isDisabled, isReadOnly, isWheelEnabled, stepValue],
  );

  // Refuse a non-numeric edit at `beforeinput`, the way the native
  // `type="number"` control does. This has to run *before* the browser applies
  // the edit: rejecting afterwards (from `onChange`) means the character has
  // already been inserted and the caret has already moved past it, so putting
  // the value back leaves the caret at the end and the next digit lands in the
  // wrong place. Cancelling the event instead means the edit never happens —
  // the field, the caret and the undo stack are untouched.
  //
  // React's `onBeforeInput` is a synthetic approximation that does not fire for
  // every native `beforeinput`, so this attaches the real event.
  const beforeInputListenerRef = useCallback(
    (input: HTMLInputElement | null) => {
      if (input == null) {
        return;
      }

      const handleBeforeInput = (event: InputEvent) => {
        if (isDisabled || isReadOnly) {
          return;
        }
        // An IME writes through `insertCompositionText`, which is not
        // cancelable — the composition is still incomplete, and half a CJK
        // syllable is not meant to parse. The committed text arrives as a
        // normal insert afterwards and is checked then. See utils/ime.ts.
        if (event.isComposing || event.inputType.endsWith('CompositionText')) {
          return;
        }
        // Deletions, history and line breaks can only remove characters or
        // submit; neither can introduce a non-numeric one.
        if (!event.inputType.startsWith('insert')) {
          return;
        }
        if (
          event.inputType === 'insertLineBreak' ||
          event.inputType === 'insertParagraph'
        ) {
          return;
        }

        // `data` carries typed text; a paste or drag-drop carries it on
        // `dataTransfer` instead.
        const inserted =
          event.data ?? event.dataTransfer?.getData('text/plain') ?? null;
        if (inserted == null) {
          return;
        }

        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? start;
        const next = normalizeNumericText(
          input.value.slice(0, start) + inserted + input.value.slice(end),
        );

        // Reject an edit that would put a non-numeric character in the field,
        // and one that normalizes away to nothing (a lone separator or space),
        // which would otherwise flash into the field and vanish on re-render.
        if (!isNumericDraft(next) || normalizeNumericText(inserted) === '') {
          event.preventDefault();
        }
      };

      input.addEventListener('beforeinput', handleBeforeInput);
      return () => input.removeEventListener('beforeinput', handleBeforeInput);
    },
    [isDisabled, isReadOnly],
  );

  const mergedInputRef = useMemo(
    () => mergeRefs(ref, inputRef, wheelListenerRef, beforeInputListenerRef),
    [ref, wheelListenerRef, beforeInputListenerRef],
  );

  const canIncrement = getNextValue(1) !== valueForStepping;
  const canDecrement = getNextValue(-1) !== valueForStepping;

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
        themeProps('number-input', {
          size,
          status: status?.type ?? null,
          disabled: isDisabled ? 'disabled' : null,
          readonly: isReadOnly ? 'readonly' : null,
        }),
        stylex.props(
          inputWrapperStyles.base,
          styles.wrapper,
          hasNumberSteppers && styles.wrapperWithNumberSteppers,
          sizeStyles[size],
          isDisabled && inputWrapperStyles.disabled,
          status && inputStatusBorderStyles[status.type],
          status && !isDisabled && inputStatusHoverShadowStyles[status.type],
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
        ref={mergedInputRef}
        id={id}
        name={isDisabled || formatValue ? undefined : htmlName}
        type="text"
        inputMode={isIntegerOnly ? 'numeric' : 'decimal'}
        role="spinbutton"
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
        readOnly={isReadOnly || showsDisabledMessage || undefined}
        autoFocus={hasAutoFocus}
        data-autofocus={hasAutoFocus || undefined}
        aria-valuemin={min ?? undefined}
        aria-valuemax={max ?? undefined}
        aria-valuenow={value ?? undefined}
        aria-valuetext={
          value == null || !formatValue ? undefined : formattedValue
        }
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
      {formatValue && htmlName && !isDisabled && (
        <input
          type="hidden"
          name={htmlName}
          value={value == null ? '' : String(value)}
        />
      )}
      {units && (
        <span id={unitsID} {...stylex.props(styles.units)}>
          {units}
        </span>
      )}
      {/*
        Live region announcing invalid typed input to assistive technology.
        The value silently reverts on blur, so without this a screen-reader
        user would get no feedback that their entry was rejected (WCAG 3.3.1).
      */}
      <VisuallyHidden as="div" role="alert" aria-live="assertive">
        {!isInputValid ? 'Invalid number' : ''}
      </VisuallyHidden>
      {hasClear && value != null && !isDisabled && !isReadOnly && (
        <InputClearButton
          label={t('@astryx.numberInput.clearLabel', {label})}
          onClick={handleClear}
        />
      )}
      {statusIcon}
      {hasNumberSteppers && (
        <div {...stylex.props(styles.numberSteppers)}>
          <button
            type="button"
            tabIndex={-1}
            disabled={isDisabled || isReadOnly || !canIncrement}
            aria-label={t('@astryx.numberInput.incrementLabel', {label})}
            onPointerDown={event => event.preventDefault()}
            onClick={() => {
              inputRef.current?.focus();
              stepValue(1);
            }}
            {...stylex.props(
              styles.numberStepperButton,
              (isDisabled || isReadOnly || !canIncrement) &&
                styles.numberStepperButtonDisabled,
            )}>
            <Icon
              icon="chevronDown"
              size="xsm"
              color="inherit"
              xstyle={styles.incrementIcon}
            />
          </button>
          <button
            type="button"
            tabIndex={-1}
            disabled={isDisabled || isReadOnly || !canDecrement}
            aria-label={t('@astryx.numberInput.decrementLabel', {label})}
            onPointerDown={event => event.preventDefault()}
            onClick={() => {
              inputRef.current?.focus();
              stepValue(-1);
            }}
            {...stylex.props(
              styles.numberStepperButton,
              styles.decrementButton,
              (isDisabled || isReadOnly || !canDecrement) &&
                styles.numberStepperButtonDisabled,
            )}>
            <Icon icon="chevronDown" size="xsm" color="inherit" />
          </button>
        </div>
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
      statusVariant={statusVariant}
      labelTooltip={labelTooltip}
      width={width}>
      {inputWrapper}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </Field>
  );
}

NumberInput.displayName = 'NumberInput';
