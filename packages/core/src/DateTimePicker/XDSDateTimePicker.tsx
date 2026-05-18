'use client';

/**
 * @file XDSDateTimePicker.tsx
 * @input Uses React, XDSField, XDSCalendar, useXDSPopover, time parsing utilities
 * @output Exports XDSDateTimePicker component, XDSDateTimePickerProps
 * @position Core implementation; consumed by index.ts, tested by XDSDateTimePicker.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DateTimePicker/DateTimePicker.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/DateTimePicker/XDSDateTimePicker.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/DateTimePicker/index.ts (exports if types change)
 * - /apps/storybook/stories/DateTimePicker.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/DateTimePicker/ (showcase blocks)
 */

import {
  useId,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useOptimistic,
  useTransition,
  type KeyboardEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSIconName} from '../Icon';
import {
  colorVars,
  sizeVars,
  radiusVars,
  spacingVars,
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
import {XDSIcon} from '../Icon';
import {XDSSpinner} from '../Spinner';
import {
  XDSCalendar,
  type ISODateString,
  type XDSCalendarHandle,
} from '../Calendar';
import {useCalendarConstraints} from '../Calendar/hooks';
import {useXDSPopover} from '../Popover';
import {useInputContainer} from '../hooks/useInputContainer';
import {
  type ISOTimeString,
  parseDateInput,
  formatDisplayDate,
  parseISO,
  parseTimeInput,
  formatDisplayTime12h,
  formatDisplayTime24h,
  formatISOTime,
  isTimeInRange,
  adjustTime,
  xdsClassName,
  mergeProps,
} from '../utils';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';

export type ISODateTimeString = string & {
  readonly __brand: 'ISODateTimeString';
};

export type XDSDateTimePickerHourFormat = '12h' | '24h';

export type XDSDateTimePickerSize = 'sm' | 'md';

export type {
  XDSInputStatus as XDSDateTimePickerStatus,
  XDSInputStatusType as XDSDateTimePickerStatusType,
} from '../Field';

const styles = stylex.create({
  row: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
  },
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
  dateWrapper: {
    flex: 1,
    flexBasis: 0,
  },
  timeWrapper: {
    flex: 1,
    flexBasis: 0,
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
  },
  md: {
    height: sizeVars['--size-element-md'],
  },
});

export interface XDSDateTimePickerProps extends Omit<
  XDSBaseProps,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the date input element */
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
   * The selected datetime in ISO 8601 format ("YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS").
   */
  value?: ISODateTimeString;

  /**
   * Callback fired when the datetime changes.
   * Called with undefined when input is cleared.
   */
  onChange: (value: ISODateTimeString | undefined) => void;

  /**
   * Async action on change. Fires after onChange.
   */
  changeAction?: (value: ISODateTimeString | undefined) => void | Promise<void>;

  /**
   * Whether the input is in a loading state.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Minimum selectable datetime in ISO format.
   * Constrains both date and time selection.
   */
  min?: ISODateTimeString;

  /**
   * Maximum selectable datetime in ISO format.
   * Constrains both date and time selection.
   */
  max?: ISODateTimeString;

  /**
   * Custom date constraint functions.
   * Date is disabled in the calendar if ANY function returns false.
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;

  /**
   * Whether to include seconds in the time portion.
   * @default false
   */
  hasSeconds?: boolean;

  /**
   * Hour display format.
   * @default '12h'
   */
  hourFormat?: XDSDateTimePickerHourFormat;

  /**
   * Time increment in minutes when using arrow keys in the time input.
   * @default 1
   */
  timeIncrement?: number;

  /**
   * Whether to show a clear button when a value is set.
   * @default false
   */
  hasClear?: boolean;

  /**
   * Placeholder text shown when no date is selected.
   * @default "Select a date"
   */
  placeholder?: string;

  /**
   * The size of the inputs.
   * @default 'md'
   */
  size?: XDSDateTimePickerSize;

  /**
   * Status indicator for the input.
   */
  status?: XDSInputStatus;

  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;

  /**
   * Number of months to display in the calendar.
   * @default 1
   */
  numberOfMonths?: 1 | 2;

  /**
   * Style overrides applied to the outer row container.
   */
  xstyle?: StyleXStyles;
}

function splitDateTime(dt: ISODateTimeString | undefined): {
  date: ISODateString | undefined;
  time: ISOTimeString | undefined;
} {
  if (!dt) return {date: undefined, time: undefined};
  const tIndex = dt.indexOf('T');
  if (tIndex === -1)
    return {date: dt as unknown as ISODateString, time: undefined};
  return {
    date: dt.slice(0, tIndex) as ISODateString,
    time: dt.slice(tIndex + 1) as ISOTimeString,
  };
}

function combineDateTime(
  date: ISODateString | undefined,
  time: ISOTimeString | undefined,
): ISODateTimeString | undefined {
  if (!date || !time) return undefined;
  return `${date}T${time}` as ISODateTimeString;
}

function getDefaultTime(hasSeconds: boolean): ISOTimeString {
  const now = new Date();
  return formatISOTime(
    {hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds()},
    hasSeconds,
  );
}

/**
 * A combined date and time picker with side-by-side date input and
 * time input under a single label. The date input opens a calendar
 * popover; the time input supports typed entry and arrow-key adjustment.
 *
 * @example
 * ```
 * <XDSDateTimePicker
 *   label="Meeting time"
 *   value={dateTime}
 *   onChange={setDateTime}
 * />
 * ```
 */
export function XDSDateTimePicker({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  value,
  onChange,
  changeAction,
  isLoading = false,
  min,
  max,
  dateConstraints,
  hasSeconds = false,
  hourFormat = '12h',
  timeIncrement = 1,
  hasClear = false,
  placeholder = 'Select a date',
  size = 'md',
  status,
  labelTooltip,
  numberOfMonths = 1,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: XDSDateTimePickerProps) {
  const dateInputId = useId();
  const timeInputId = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const timeInputRef = useRef<HTMLInputElement | null>(null);
  const timeContainerRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<XDSCalendarHandle | null>(null);
  const lastFiredDateRef = useRef<ISODateString | undefined>(undefined);

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;
  const isEffectivelyDisabled = isDisabled || isBusy;

  const statusIconMap: Record<XDSInputStatusType, XDSIconName> = {
    warning: 'warning',
    error: 'error',
    success: 'success',
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

  // Split min/max and current value
  const minParts = useMemo(() => splitDateTime(min), [min]);
  const maxParts = useMemo(() => splitDateTime(max), [max]);
  const valueParts = useMemo(
    () => splitDateTime(optimisticValue),
    [optimisticValue],
  );

  // Date constraints from min/max
  const calendarMin = minParts.date;
  const calendarMax = maxParts.date;
  const {isDateDisabled} = useCalendarConstraints({
    min: calendarMin,
    max: calendarMax,
    dateConstraints,
  });

  // Time constraints change depending on selected date
  const timeMin = useMemo(() => {
    if (!minParts.date || !minParts.time || !valueParts.date) return undefined;
    return valueParts.date === minParts.date ? minParts.time : undefined;
  }, [minParts.date, minParts.time, valueParts.date]);

  const timeMax = useMemo(() => {
    if (!maxParts.date || !maxParts.time || !valueParts.date) return undefined;
    return valueParts.date === maxParts.date ? maxParts.time : undefined;
  }, [maxParts.date, maxParts.time, valueParts.date]);

  // --- Date input state ---
  const [datePendingInput, setDatePendingInput] = useState<string | null>(null);

  useEffect(() => {
    if (valueParts.date === lastFiredDateRef.current) return;
    lastFiredDateRef.current = undefined;
    setDatePendingInput(null);
  }, [valueParts.date]);

  const dateDisplayValue =
    datePendingInput !== null
      ? datePendingInput
      : valueParts.date && /^\d{4}-\d{2}-\d{2}$/.test(valueParts.date)
        ? formatDisplayDate(valueParts.date)
        : '';

  const isDateInputValid =
    datePendingInput === null || !datePendingInput.trim()
      ? true
      : parseDateInput(datePendingInput) !== null;

  // --- Time input state ---
  const [timePendingInput, setTimePendingInput] = useState<string | null>(null);
  const [isTimeFocused, setIsTimeFocused] = useState(false);

  const formatDisplayTime =
    hourFormat === '12h' ? formatDisplayTime12h : formatDisplayTime24h;

  const timeDisplayValue = useMemo(() => {
    if (timePendingInput !== null) return timePendingInput;
    return valueParts.time
      ? formatDisplayTime(valueParts.time, hasSeconds)
      : '';
  }, [timePendingInput, valueParts.time, formatDisplayTime, hasSeconds]);

  const isTimeInputValid = useMemo(() => {
    if (timePendingInput === null || !timePendingInput.trim()) return true;
    const parsed = parseTimeInput(timePendingInput, hasSeconds);
    if (!parsed) return false;
    return isTimeInRange(parsed, timeMin, timeMax);
  }, [timePendingInput, hasSeconds, timeMin, timeMax]);

  const timePlaceholder = useMemo(() => {
    if (isTimeFocused && !timeDisplayValue) {
      return hourFormat === '12h' ? 'e.g., 2:30 PM' : 'e.g., 14:30';
    }
    return 'Select a time';
  }, [isTimeFocused, timeDisplayValue, hourFormat]);

  // --- Unified change handler ---
  const fireChange = useCallback(
    (newValue: ISODateTimeString | undefined) => {
      if (isBusy) return;
      onChange(newValue);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(newValue);
          await changeAction(newValue);
        });
      }
    },
    [isBusy, onChange, changeAction, startTransition, setOptimisticValue],
  );

  // --- Popover ---
  const popover = useXDSPopover({
    dialogLabel: 'Choose date',
    closeButtonLabel: 'Close calendar',
    onHide: () => dateInputRef.current?.focus(),
  });

  const handleCalendarToggle = useCallback(() => {
    if (!isEffectivelyDisabled) {
      if (popover.isOpen) {
        popover.hide();
      } else {
        popover.show();
      }
    }
  }, [isEffectivelyDisabled, popover]);

  const handleDateInputClick = useCallback(() => {
    if (!isEffectivelyDisabled && !popover.isOpen) {
      popover.show({skipAutoFocus: true});
    }
  }, [isEffectivelyDisabled, popover]);

  // --- Date handlers ---
  const handleDateChange = useCallback(
    (newDate: ISODateString, source: 'calendar' | 'input') => {
      const currentTime = valueParts.time ?? getDefaultTime(hasSeconds);

      let effectiveTime = currentTime;
      if (minParts.date && newDate === minParts.date && minParts.time) {
        if (!isTimeInRange(effectiveTime, minParts.time, undefined)) {
          effectiveTime = minParts.time;
        }
      }
      if (maxParts.date && newDate === maxParts.date && maxParts.time) {
        if (!isTimeInRange(effectiveTime, undefined, maxParts.time)) {
          effectiveTime = maxParts.time;
        }
      }

      const combined = combineDateTime(newDate, effectiveTime);
      if (combined) {
        fireChange(combined);
      }
      if (source === 'calendar') {
        setDatePendingInput(null);
        popover.hide();
      }
    },
    [valueParts.time, hasSeconds, minParts, maxParts, fireChange, popover],
  );

  const handleDateInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setDatePendingInput(text);

      const parsed = parseDateInput(text);
      if (
        parsed &&
        parsed !== valueParts.date &&
        !isDateDisabled(parseISO(parsed))
      ) {
        lastFiredDateRef.current = parsed;
        handleDateChange(parsed, 'input');
        calendarRef.current?.navigateTo(parsed);
      }
    },
    [valueParts.date, isDateDisabled, handleDateChange],
  );

  const commitDatePendingInput = useCallback(() => {
    if (datePendingInput === null) return;

    if (!datePendingInput.trim()) {
      if (value !== undefined) {
        fireChange(undefined);
      }
      setDatePendingInput(null);
      return;
    }

    const parsed = parseDateInput(datePendingInput);
    if (parsed && !isDateDisabled(parseISO(parsed))) {
      if (parsed !== valueParts.date) {
        handleDateChange(parsed, 'input');
      }
    }
    setDatePendingInput(null);
  }, [
    datePendingInput,
    value,
    valueParts.date,
    fireChange,
    isDateDisabled,
    handleDateChange,
  ]);

  const handleDateBlur = useCallback(() => {
    commitDatePendingInput();
  }, [commitDatePendingInput]);

  const handleDateKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && popover.isOpen) {
        e.preventDefault();
        popover.hide();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        commitDatePendingInput();
      }
    },
    [popover, commitDatePendingInput],
  );

  // --- Time handlers ---
  const handleTimeInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setTimePendingInput(text);

      const parsed = parseTimeInput(text, hasSeconds);
      if (
        parsed &&
        isTimeInRange(parsed, timeMin, timeMax) &&
        parsed !== valueParts.time
      ) {
        if (valueParts.date) {
          const combined = combineDateTime(valueParts.date, parsed);
          if (combined) fireChange(combined);
        }
      }
    },
    [
      hasSeconds,
      timeMin,
      timeMax,
      valueParts.time,
      valueParts.date,
      fireChange,
    ],
  );

  const handleTimeFocus = useCallback(() => setIsTimeFocused(true), []);

  const handleTimeBlur = useCallback(() => {
    setIsTimeFocused(false);
    if (timePendingInput === null) return;

    if (!timePendingInput.trim()) {
      // Empty time: revert display to previous value (don't emit partial datetime)
      setTimePendingInput(null);
      return;
    }

    const parsed = parseTimeInput(timePendingInput, hasSeconds);
    if (parsed && isTimeInRange(parsed, timeMin, timeMax)) {
      if (parsed !== valueParts.time && valueParts.date) {
        const combined = combineDateTime(valueParts.date, parsed);
        if (combined) fireChange(combined);
      }
    }
    setTimePendingInput(null);
  }, [timePendingInput, hasSeconds, timeMin, timeMax, valueParts, fireChange]);

  const handleTimeKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();

        let currentTime = valueParts.time;
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

        const delta = e.key === 'ArrowUp' ? timeIncrement : -timeIncrement;
        const newTime = adjustTime(currentTime, delta, hasSeconds);

        if (isTimeInRange(newTime, timeMin, timeMax) && valueParts.date) {
          const combined = combineDateTime(valueParts.date, newTime);
          if (combined) fireChange(combined);
        }
      }
    },
    [valueParts, hasSeconds, timeIncrement, timeMin, timeMax, fireChange],
  );

  // --- Clear ---
  const handleClear = useCallback(() => {
    fireChange(undefined);
    dateInputRef.current?.focus();
  }, [fireChange]);

  // --- Refs ---
  const setDateRefs = useCallback(
    (el: HTMLInputElement | null) => {
      dateInputRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
    },
    [ref],
  );

  // Focus time input when clicking wrapper padding/icon
  const {onClick: handleTimeWrapperClick, onMouseUp: handleTimeWrapperMouseUp} =
    useInputContainer({
      containerRef: timeContainerRef,
      inputRef: timeInputRef,
      disabled: isEffectivelyDisabled,
    });

  return (
    <XDSField
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={dateInputId}
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
      statusVariant="detached">
      <div
        {...rest}
        {...mergeProps(
          xdsClassName('date-time-picker', {
            size,
            status: status?.type ?? null,
          }),
          stylex.props(styles.row, xstyle),
          className,
          style,
        )}>
        {/* Date input */}
        <div
          ref={popover.triggerRef}
          {...stylex.props(
            inputWrapperStyles.base,
            sizeStyles[size],
            styles.dateWrapper,
            isEffectivelyDisabled && inputWrapperStyles.disabled,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            status && inputStatusFocusWithinStyles[status.type],
          )}>
          <input
            ref={setDateRefs}
            id={dateInputId}
            type="text"
            role="combobox"
            value={dateDisplayValue}
            onChange={handleDateInputChange}
            onBlur={handleDateBlur}
            onClick={handleDateInputClick}
            onKeyDown={handleDateKeyDown}
            placeholder={placeholder}
            disabled={isEffectivelyDisabled}
            aria-describedby={ariaDescribedBy}
            aria-required={isRequired === true ? 'true' : undefined}
            aria-invalid={status?.type === 'error' ? 'true' : undefined}
            aria-busy={isBusy || undefined}
            aria-expanded={popover.isOpen}
            aria-haspopup="dialog"
            aria-controls={popover.isOpen ? popover.id : undefined}
            aria-autocomplete="none"
            autoComplete="off"
            {...stylex.props(
              styles.input,
              isEffectivelyDisabled && styles.inputDisabled,
              !isDateInputValid && styles.inputInvalid,
            )}
          />
          {hasClear && value !== undefined && !isEffectivelyDisabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={`Clear ${label}`}
              {...stylex.props(styles.iconButton)}>
              <XDSIcon icon="close" size="sm" color="secondary" />
            </button>
          )}
          <button
            type="button"
            onClick={handleCalendarToggle}
            disabled={isEffectivelyDisabled}
            aria-label={popover.isOpen ? 'Close calendar' : 'Open calendar'}
            {...stylex.props(
              styles.iconButton,
              isEffectivelyDisabled && styles.iconButtonDisabled,
            )}>
            <XDSIcon icon="calendar" size="sm" color="secondary" />
          </button>
          {isBusy && <XDSSpinner size="sm" />}
          {status && (
            <XDSIcon
              icon={statusIconMap[status.type]}
              size="md"
              color={statusIconColorMap[status.type]}
            />
          )}
        </div>

        {/* Time input */}
        <div
          ref={timeContainerRef}
          onClick={handleTimeWrapperClick}
          onMouseUp={handleTimeWrapperMouseUp}
          {...stylex.props(
            inputWrapperStyles.base,
            sizeStyles[size],
            styles.timeWrapper,
            isEffectivelyDisabled && inputWrapperStyles.disabled,
            status && inputStatusBorderStyles[status.type],
            status && inputStatusHoverShadowStyles[status.type],
            status && inputStatusFocusWithinStyles[status.type],
          )}>
          <div {...stylex.props(styles.icon)}>
            <XDSIcon icon="clock" size="sm" color="secondary" />
          </div>
          <input
            ref={timeInputRef}
            id={timeInputId}
            type="text"
            value={timeDisplayValue}
            onChange={handleTimeInputChange}
            onFocus={handleTimeFocus}
            onBlur={handleTimeBlur}
            onKeyDown={handleTimeKeyDown}
            placeholder={timePlaceholder}
            disabled={isEffectivelyDisabled}
            aria-label="Time"
            {...stylex.props(
              styles.input,
              isEffectivelyDisabled && styles.inputDisabled,
              !isTimeInputValid && styles.inputInvalid,
            )}
          />
        </div>
      </div>

      {popover.render(
        <XDSCalendar
          ref={calendarRef}
          mode="single"
          value={valueParts.date}
          onChange={(d: ISODateString) => handleDateChange(d, 'calendar')}
          min={calendarMin}
          max={calendarMax}
          dateConstraints={dateConstraints}
          numberOfMonths={numberOfMonths}
        />,
        {placement: 'below', alignment: 'start'},
      )}
    </XDSField>
  );
}

XDSDateTimePicker.displayName = 'XDSDateTimePicker';
