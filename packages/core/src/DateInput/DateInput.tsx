// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DateInput.tsx
 * @input Uses React, useId, useState, useCallback, useRef, Field, Icon, Calendar, usePopover, InputGroupContext
 * @output Exports DateInput component, DateInputProps
 * @position Core implementation; consumed by index.ts, tested by DateInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DateInput/DateInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/DateInput/DateInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/DateInput/index.ts (exports if types change)
 * - /apps/storybook/stories/DateInput.stories.tsx (storybook stories)
 * - /packages/core/templates/blocks/components/DateInput/ (showcase blocks)
 */

import {
  useId,
  useState,
  useCallback,
  useRef,
  useOptimistic,
  useTransition,
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
import {VisuallyHidden} from '../VisuallyHidden';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import {groupStyles} from '../InputGroup/groupStyles';
import {useSize} from '../SizeContext/SizeContext';
import {Spinner} from '../Spinner';
import {Calendar, type ISODateString, type CalendarHandle} from '../Calendar';
import {useCalendarConstraints} from '../Calendar/hooks';
import {usePopover} from '../Popover';
import {useTooltip} from '../Tooltip';
import {getInputARIA, parseDateInput} from '../utils';
import {
  plainDateFromISO,
  plainDateToISO,
  plainDateFormat,
  DATE_FORMAT_LONG,
} from '../utils/plainDate';

const styles = stylex.create({
  iconButton: {
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
  iconButtonDisabled: {
    cursor: 'not-allowed',
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
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
    minWidth: 180,
  },
  md: {
    height: sizeVars['--size-element-md'],
    minWidth: 180,
  },
  lg: {
    height: sizeVars['--size-element-lg'],
    minWidth: 180,
  },
});

export type DateInputSize = keyof typeof sizeStyles;

// Re-export shared types for convenience

export type {
  InputStatus as DateInputStatus,
  InputStatusType as DateInputStatusType,
} from '../Field';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

export interface DateInputProps extends Omit<
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
   * Typing and calendar activation stay blocked.
   *
   * Use this instead of wrapping a disabled input in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <DateInput
   *   label="Event date"
   *   value={date}
   *   onChange={setDate}
   *   isDisabled
   *   disabledMessage="You need the Editor role to change this"
   * />
   * ```
   */
  disabledMessage?: string;

  /**
   * The selected date in ISO format (YYYY-MM-DD).
   */
  value?: ISODateString;

  /**
   * Callback fired when the date changes.
   * Called with undefined when input is cleared.
   */
  onChange?: (value: ISODateString | undefined) => void;

  /**
   * Async action on change. Fires after onChange.
   */
  changeAction?: (value: ISODateString | undefined) => void | Promise<void>;

  /**
   * Whether the input is in a loading state.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Minimum selectable date in ISO format.
   */
  min?: ISODateString;

  /**
   * Maximum selectable date in ISO format.
   */
  max?: ISODateString;

  /**
   * Custom date constraint functions. Date is disabled if ANY function returns false.
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;

  /**
   * Placeholder text shown when no date is selected.
   * @default "Select a date"
   */
  placeholder?: string;

  /**
   * The size of the input.
   * - 'sm': Compact size (18px height)
   * - 'md': Default size (26px height)
   * @default 'md'
   */
  size?: DateInputSize;

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

  /**
   * Whether to show a clear button when a date is set.
   * When clicked, resets the value to undefined and returns focus to the input.
   * @default false
   */
  hasClear?: boolean;

  /**
   * Number of months to display in the calendar popover.
   * @default 1
   */
  numberOfMonths?: 1 | 2;
}

/**
 * A date picker component combining a text input with a calendar popover.
 *
 * @example
 * ```
 * <DateInput
 *   label="Event date"
 *   value={date}
 *   onChange={setDate}
 * />
 * ```
 */
export function DateInput({
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
  dateConstraints,
  placeholder: placeholderFromProps,
  size: sizeProp,
  status,
  labelTooltip,
  hasClear = false,
  numberOfMonths = 1,
  width,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DateInputProps) {
  const t = useTranslator();
  const placeholder =
    placeholderFromProps ?? t('@astryx.dateInput.placeholder');
  const size = useSize(sizeProp, 'md');
  const id = useId();
  const inputLabelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const calendarRef = useRef<CalendarHandle | null>(null);
  const lastFiredValueRef = useRef<ISODateString | undefined>(undefined);
  const inputGroup = useInputGroup();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;
  const isEffectivelyDisabled = isDisabled || isBusy;

  // Disabled-reason tooltip. Disabled controls swallow pointer events, so the
  // tooltip listeners attach to the input container (which already exists) and
  // the text input stays perceivable via aria-disabled instead of the disabled
  // attribute. Typing is blocked with readOnly and value mutation guards;
  // calendar activation is blocked by the isEffectivelyDisabled guards. Only
  // the persistent isDisabled state (not the transient busy state) surfaces a
  // reason.
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

  // Constraint checking for text input validation (reuses calendar logic)
  const {isDateDisabled} = useCalendarConstraints({min, max, dateConstraints});

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

  // Clear pending input when value changes externally (computed during render
  // via prev-value ref instead of useEffect to avoid an extra render cycle)
  const prevValueRef = useRef(value);
  if (value !== prevValueRef.current) {
    prevValueRef.current = value;
    if (value !== lastFiredValueRef.current) {
      lastFiredValueRef.current = undefined;
      if (pendingInput !== null) {
        setPendingInput(null);
      }
    }
  }

  // Display value: pending input if typing, otherwise formatted value
  const displayValue =
    pendingInput !== null
      ? pendingInput
      : optimisticValue && /^\d{4}-\d{2}-\d{2}$/.test(optimisticValue)
        ? plainDateFormat(plainDateFromISO(optimisticValue), DATE_FORMAT_LONG)
        : '';

  // Check if current input is valid (for styling purposes)
  const isInputValid =
    pendingInput === null || !pendingInput.trim()
      ? true
      : parseDateInput(pendingInput) !== null;

  const popover = usePopover({
    dialogLabel: t('@astryx.dateInput.dialogLabel'),
    closeButtonLabel: t('@astryx.dateInput.closeCalendar'),
    onHide: () => inputRef.current?.focus(),
  });

  // Handle toggling the popover from button click (focus calendar)
  const handleToggle = useCallback(() => {
    if (!isEffectivelyDisabled) {
      if (popover.isOpen) {
        popover.hide();
      } else {
        popover.show();
      }
    }
  }, [isEffectivelyDisabled, popover]);

  // Handle opening the popover from input click (keep focus in input)
  const handleInputClick = useCallback(() => {
    if (!isEffectivelyDisabled && !popover.isOpen) {
      popover.show({skipAutoFocus: true});
    }
  }, [isEffectivelyDisabled, popover]);

  // Unified change handler that fires both onChange and changeAction
  const fireChange = useCallback(
    (newValue: ISODateString | undefined) => {
      if (isBusy) {
        return;
      }
      onChange?.(newValue);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(newValue);
          await changeAction(newValue);
        });
      }
    },
    [isBusy, onChange, changeAction, startTransition, setOptimisticValue],
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    fireChange(undefined);
    inputRef.current?.focus();
  }, [fireChange]);

  // Handle date selection from calendar
  const handleDateSelect = useCallback(
    (selectedDate: ISODateString) => {
      fireChange(selectedDate);
      setPendingInput(null);
      popover.hide();
    },
    [fireChange, popover],
  );

  // Handle input text change - update immediately if valid and allowed
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // With a disabledMessage the input drops `disabled` for focusability, so
      // guard value mutation explicitly (readOnly also blocks typing).
      if (isEffectivelyDisabled) {
        return;
      }
      const newValue = e.target.value;
      setPendingInput(newValue);

      // If the input is valid and passes constraints, update immediately
      const parsed = parseDateInput(newValue);
      if (
        parsed &&
        plainDateToISO(parsed) !== value &&
        !isDateDisabled(parsed)
      ) {
        const parsedISO = plainDateToISO(parsed);
        lastFiredValueRef.current = parsedISO;
        fireChange(parsedISO);
        // Navigate calendar to show the parsed date's month
        calendarRef.current?.navigateTo(parsedISO);
      }
    },
    [value, fireChange, isDateDisabled, isEffectivelyDisabled],
  );

  // Commit pending input (shared by blur and Enter key)
  const commitPendingInput = useCallback(() => {
    if (pendingInput === null) {
      return;
    }

    if (!pendingInput.trim()) {
      if (value !== undefined) {
        fireChange(undefined);
      }
      setPendingInput(null);
      return;
    }

    const parsed = parseDateInput(pendingInput);
    if (parsed && !isDateDisabled(parsed)) {
      const parsedISO = plainDateToISO(parsed);
      if (parsedISO !== value) {
        fireChange(parsedISO);
      }
    }
    setPendingInput(null);
  }, [pendingInput, value, fireChange, isDateDisabled]);

  // Handle blur - validate, check constraints, and clear pending input
  const handleBlur = useCallback(() => {
    commitPendingInput();
  }, [commitPendingInput]);

  // Handle keyboard events on input
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && popover.isOpen) {
        e.preventDefault();
        popover.hide();
      } else if (
        (e.key === 'ArrowDown' || (e.altKey && e.key === 'ArrowDown')) &&
        !popover.isOpen
      ) {
        // APG combobox: ArrowDown (and Alt+ArrowDown) opens the calendar
        // popover from the keyboard, keeping focus in the input (forms-13).
        e.preventDefault();
        if (!isEffectivelyDisabled) {
          popover.show({skipAutoFocus: true});
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        commitPendingInput();
      }
    },
    [popover, commitPendingInput, isEffectivelyDisabled],
  );

  const inputWrapper = (
    <div
      ref={el => {
        popover.triggerRef(el);
        // Anchor + hover/focus listeners for the disabled-message tooltip.
        // Handlers are gated internally by isEnabled, and anchor names
        // compose, so attaching unconditionally is safe.
        disabledMessageTooltip.ref(el);
      }}
      {...rest}
      {...mergeProps(
        themeProps('date-input', {size, status: status?.type ?? null}),
        stylex.props(
          inputWrapperStyles.base,
          sizeStyles[size],
          isEffectivelyDisabled && inputWrapperStyles.disabled,
          status && inputStatusBorderStyles[status.type],
          status && inputStatusHoverShadowStyles[status.type],
          status && inputStatusFocusWithinStyles[status.type],
          inputGroup && groupStyles.inGroup,
          xstyle,
        ),
        className,
        style,
      )}>
      {inputGroup && <VisuallyHidden id={inputLabelID}>{label}</VisuallyHidden>}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isEffectivelyDisabled}
        aria-label={
          popover.isOpen
            ? t('@astryx.dateInput.toggleCalendarClose')
            : t('@astryx.dateInput.openCalendar')
        }
        {...stylex.props(
          styles.iconButton,
          isEffectivelyDisabled && styles.iconButtonDisabled,
        )}>
        <Icon icon="calendar" size="sm" color="secondary" />
      </button>
      <input
        ref={mergeRefs(ref, inputRef)}
        id={id}
        type="text"
        role="combobox"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onClick={handleInputClick}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        // With a disabledMessage the input keeps focusability via
        // aria-disabled so the reason is focus-discoverable; typing is
        // blocked with readOnly and the mutation guards, and calendar
        // activation is blocked by the isEffectivelyDisabled guards.
        disabled={isEffectivelyDisabled && !showsDisabledMessage}
        aria-disabled={showsDisabledMessage ? 'true' : undefined}
        readOnly={showsDisabledMessage || undefined}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-required={isRequired === true ? 'true' : undefined}
        aria-invalid={
          status?.type === 'error' || !isInputValid ? 'true' : undefined
        }
        aria-busy={isBusy || undefined}
        aria-expanded={popover.isOpen}
        aria-haspopup="dialog"
        aria-controls={popover.isOpen ? popover.id : undefined}
        aria-autocomplete="none"
        autoComplete="off"
        {...stylex.props(
          styles.input,
          isEffectivelyDisabled && styles.inputDisabled,
          !isInputValid && styles.inputInvalid,
        )}
      />
      {/*
          Live region announcing invalid typed input to assistive technology.
          The value silently reverts on blur, so without this a screen-reader
          user would get no feedback that their entry was rejected (WCAG 3.3.1).
        */}
      <VisuallyHidden as="div" role="alert" aria-live="assertive">
        {!isInputValid ? 'Invalid date' : ''}
      </VisuallyHidden>
      {hasClear && value !== undefined && !isEffectivelyDisabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={t('@astryx.dateInput.clear', {label})}
          {...stylex.props(styles.iconButton)}>
          <Icon icon="close" size="sm" color="secondary" />
        </button>
      )}
      {isBusy && <Spinner size="sm" />}
      {status && !inputGroup && (
        <Icon
          icon={statusIconMap[status.type]}
          size="md"
          color={statusIconColorMap[status.type]}
        />
      )}
      {popover.render(
        <Calendar
          handleRef={calendarRef}
          mode="single"
          value={optimisticValue}
          onChange={handleDateSelect}
          min={min}
          max={max}
          dateConstraints={dateConstraints}
          numberOfMonths={numberOfMonths}
        />,
        {placement: 'below', alignment: 'start'},
      )}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </div>
  );

  if (inputGroup) {
    return inputWrapper;
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
    </Field>
  );
}

DateInput.displayName = 'DateInput';
