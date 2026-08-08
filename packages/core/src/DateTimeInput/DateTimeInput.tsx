// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DateTimeInput.tsx
 * @input Uses React, Field, Calendar, usePopover, time parsing utilities
 * @output Exports DateTimeInput component, DateTimeInputProps
 * @position Core implementation; consumed by index.ts, tested by DateTimeInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DateTimeInput/DateTimeInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/DateTimeInput/DateTimeInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/DateTimeInput/index.ts (exports if types change)
 * - /apps/storybook/stories/DateTimeInput.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/DateTimeInput/ (showcase blocks)
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
import {
  colorVars,
  sizeVars,
  radiusVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
  fontWeightVars,
  borderVars,
} from '../theme/tokens.stylex';
import {
  Field,
  type InputStatus,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '../Field';
import {Icon} from '../Icon';
import {VisuallyHidden} from '../VisuallyHidden';
import {Spinner} from '../Spinner';
import {
  Calendar,
  type ISODateString,
  type CalendarHandle,
  type DayOfWeek,
  type DayOfWeekName,
} from '../Calendar';
import {useCalendarConstraints} from '../Calendar/hooks';
import {usePopover} from '../Popover';
import {useTooltip} from '../Tooltip';
import {useInputContainer} from '../hooks/useInputContainer';
import {useInputStatusIcon} from '../hooks/useInputStatusIcon';
import {
  type ISOTimeString,
  parseDateInput,
  parseISOTime,
  parseTimeInput,
  formatDisplayTime12h,
  formatDisplayTime24h,
  formatISOTime,
  isTimeInRange,
  adjustTime,
  mergeProps,
  mergeRefs,
} from '../utils';
import {
  plainDateFromISO,
  plainDateToISO,
  plainDateFormat,
  DATE_FORMAT_LONG,
} from '../utils/plainDate';

import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {useSize} from '../SizeContext/SizeContext';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

export type ISODateTimeString = string & {
  readonly __brand: 'ISODateTimeString';
};

export type DateTimeInputHourFormat = '12h' | '24h';

export type DateTimeInputSize = 'sm' | 'md' | 'lg';

/** Supported minute increments for arrow-key stepping of the time field. */
export type DateTimeInputTimeIncrement = 1 | 5 | 10 | 15 | 30;

/**
 * Supported minute cadences for the preset-time dropdown. Every value divides
 * an hour evenly, so each option lands on a round clock time.
 */
export type DateTimeInputTimeOptionInterval = 5 | 10 | 15 | 30 | 60;

export type {
  InputStatus as DateTimeInputStatus,
  InputStatusType as DateTimeInputStatusType,
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
  // Preset-time list. Paddings and states mirror BaseTypeahead's dropdown and
  // Selector's options so every list in the system reads the same.
  timeListbox: {
    boxSizing: 'border-box',
    maxHeight: 300,
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
    minWidth: 'anchor-size(width)',
  },
  timeOption: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    paddingBlock: spacingVars['--spacing-1-5'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    cursor: 'pointer',
    textAlign: 'start',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
  },
  timeOptionHighlighted: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  timeOptionSelected: {
    fontWeight: fontWeightVars['--font-weight-medium'],
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

export interface DateTimeInputProps extends Omit<
  BaseProps,
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
   * Explains why the input is disabled. When set together with
   * `isDisabled`, the input shows a tooltip with this text on hover and
   * keyboard focus, and the date and time fields stay focusable (via
   * `aria-disabled`) so the reason is discoverable by keyboard and assistive
   * technology. Typing and calendar activation stay blocked.
   *
   * Use this instead of wrapping a disabled input in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <DateTimeInput
   *   label="Meeting time"
   *   value={dateTime}
   *   onChange={setDateTime}
   *   isDisabled
   *   disabledMessage="You need the Editor role to change this"
   * />
   * ```
   */
  disabledMessage?: string;

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
  hourFormat?: DateTimeInputHourFormat;

  /**
   * Minutes added or subtracted when stepping the time field with the arrow
   * keys. Constrained to a set of sensible increments.
   * @default 1
   */
  timeIncrement?: DateTimeInputTimeIncrement;

  /**
   * Minute cadence for a dropdown of preset times on the time field. Set it to
   * turn the time field into a combobox listing every valid time at that
   * cadence (`60` gives the 12 AM - 11 PM list, `15` a quarter-hour list).
   *
   * Omitted, the time field stays a plain text input: typed entry and
   * arrow-key stepping only, with no combobox semantics added to the
   * accessibility tree. Typed entry keeps working when the dropdown is on —
   * the list is a shortcut, not a restriction, so a time between two options
   * can still be typed.
   *
   * Independent of `timeIncrement`, which governs arrow-key stepping. Setting
   * both to the same value is the usual choice for scheduling flows.
   */
  timeOptionInterval?: DateTimeInputTimeOptionInterval;

  /**
   * Whether to show a clear button when a value is set.
   * @default false
   */
  hasClear?: boolean;

  /**
   * Placeholder text shown in the date portion when no date is selected.
   * @default "Select a date"
   */
  placeholder?: string;

  /**
   * Placeholder text shown in the time portion when no time is selected.
   * @default "Select a time"
   */
  timePlaceholder?: string;

  /**
   * Accessible label for the time portion of the field. Defaults to
   * `"{label} time"` so it is tied to the field's own label and localizable,
   * rather than a hardcoded English "Time".
   */
  timeLabel?: string;

  /**
   * The size of the inputs.
   * @default 'md'
   */
  size?: DateTimeInputSize;

  /**
   * Status indicator for the input.
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
   * Number of months to display in the calendar.
   * @default 1
   */
  numberOfMonths?: 1 | 2;

  /**
   * First day of week in the calendar. Accepts a number
   * (0 = Sunday … 6 = Saturday) or a three-letter day name ('sun'–'sat',
   * case-insensitive).
   * @default 0
   */
  weekStartsOn?: DayOfWeek | DayOfWeekName;
}

function splitDateTime(dt: ISODateTimeString | undefined): {
  date: ISODateString | undefined;
  time: ISOTimeString | undefined;
} {
  if (!dt) {
    return {date: undefined, time: undefined};
  }
  const tIndex = dt.indexOf('T');
  if (tIndex === -1) {
    return {date: dt as unknown as ISODateString, time: undefined};
  }
  return {
    date: dt.slice(0, tIndex) as ISODateString,
    time: dt.slice(tIndex + 1) as ISOTimeString,
  };
}

function combineDateTime(
  date: ISODateString | undefined,
  time: ISOTimeString | undefined,
): ISODateTimeString | undefined {
  if (!date || !time) {
    return undefined;
  }
  return `${date}T${time}` as ISODateTimeString;
}

const MINUTES_PER_DAY = 24 * 60;

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
 * <DateTimeInput
 *   label="Meeting time"
 *   value={dateTime}
 *   onChange={setDateTime}
 * />
 * ```
 */
export function DateTimeInput({
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
  hasSeconds = false,
  hourFormat = '12h',
  timeIncrement = 1,
  timeOptionInterval,
  hasClear = false,
  placeholder: placeholderFromProps,
  timePlaceholder: timePlaceholderFromProps,
  timeLabel,
  size: sizeProp,
  status,
  labelTooltip,
  numberOfMonths = 1,
  weekStartsOn,
  width,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DateTimeInputProps) {
  const t = useTranslator();
  const placeholder =
    placeholderFromProps ?? t('@astryx.dateTimeInput.placeholder');
  const timePlaceholder =
    timePlaceholderFromProps ?? t('@astryx.dateTimeInput.timePlaceholder');
  const size = useSize(sizeProp, 'md');
  const dateInputId = useId();
  const timeInputId = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const timeInputRef = useRef<HTMLInputElement | null>(null);
  const timeContainerRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<CalendarHandle | null>(null);
  const lastFiredDateRef = useRef<ISODateString | undefined>(undefined);

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;
  const isEffectivelyDisabled = isDisabled || isBusy;

  // Disabled-reason tooltip. Disabled controls swallow pointer events, so the
  // tooltip listeners attach to the outer row container (which already exists)
  // and both the date and time inputs stay perceivable via aria-disabled
  // instead of the disabled attribute. Typing is blocked with readOnly and the
  // value mutation guards; calendar activation is blocked by the
  // isEffectivelyDisabled guards. Only the persistent isDisabled state (not the
  // transient busy state) surfaces a reason.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The container div is not naturally focusable; focusin bubbles up from
    // the inputs, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  // DateTimeInput fixes its status presentation to the detached message box,
  // so the shared helper suppresses the on-field icon (the message box carries
  // its own leading glyph). Routed through the helper for consistency with the
  // rest of the bordered input family.
  const {statusIcon, describedBy: statusTooltipDescribedBy} =
    useInputStatusIcon({
      status,
      statusVariant: 'detached',
    });

  const ariaDescribedBy =
    [
      description ? descriptionID : null,
      status?.message ? statusMessageID : null,
      statusTooltipDescribedBy,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
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
    if (!minParts.date || !minParts.time || !valueParts.date) {
      return undefined;
    }
    return valueParts.date === minParts.date ? minParts.time : undefined;
  }, [minParts.date, minParts.time, valueParts.date]);

  const timeMax = useMemo(() => {
    if (!maxParts.date || !maxParts.time || !valueParts.date) {
      return undefined;
    }
    return valueParts.date === maxParts.date ? maxParts.time : undefined;
  }, [maxParts.date, maxParts.time, valueParts.date]);

  // --- Date input state ---
  const [datePendingInput, setDatePendingInput] = useState<string | null>(null);

  const prevDateRef = useRef(valueParts.date);
  if (valueParts.date !== prevDateRef.current) {
    prevDateRef.current = valueParts.date;
    if (valueParts.date !== lastFiredDateRef.current) {
      lastFiredDateRef.current = undefined;
      if (datePendingInput !== null) {
        setDatePendingInput(null);
      }
    }
  }

  const dateDisplayValue =
    datePendingInput !== null
      ? datePendingInput
      : valueParts.date && /^\d{4}-\d{2}-\d{2}$/.test(valueParts.date)
        ? plainDateFormat(plainDateFromISO(valueParts.date), DATE_FORMAT_LONG)
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
    if (timePendingInput !== null) {
      return timePendingInput;
    }
    return valueParts.time
      ? formatDisplayTime(valueParts.time, hasSeconds)
      : '';
  }, [timePendingInput, valueParts.time, formatDisplayTime, hasSeconds]);

  const isTimeInputValid = useMemo(() => {
    if (timePendingInput === null || !timePendingInput.trim()) {
      return true;
    }
    const parsed = parseTimeInput(timePendingInput, hasSeconds);
    if (!parsed) {
      return false;
    }
    return isTimeInRange(parsed, timeMin, timeMax);
  }, [timePendingInput, hasSeconds, timeMin, timeMax]);

  const resolvedTimePlaceholder = useMemo(() => {
    if (isTimeFocused && !timeDisplayValue) {
      return hourFormat === '12h' ? 'e.g., 2:30 PM' : 'e.g., 14:30';
    }
    return timePlaceholder;
  }, [isTimeFocused, timeDisplayValue, hourFormat, timePlaceholder]);

  // --- Preset time options (#2727) ---
  // Opt-in: without timeOptionInterval the time field keeps exactly the
  // semantics it shipped with — a plain text input, no combobox role, no
  // second listbox in the accessibility tree.
  const hasTimeOptions = timeOptionInterval !== undefined;

  const timeOptions = useMemo(() => {
    if (timeOptionInterval === undefined) {
      return [];
    }
    const options: {time: ISOTimeString; label: string}[] = [];
    for (
      let minutes = 0;
      minutes < MINUTES_PER_DAY;
      minutes += timeOptionInterval
    ) {
      const time = formatISOTime(
        {
          hour: Math.floor(minutes / 60),
          minute: minutes % 60,
          second: 0,
        },
        hasSeconds,
      );
      // The same bound the typed path enforces, so the list can never offer a
      // time that typing the identical string would reject.
      if (!isTimeInRange(time, timeMin, timeMax)) {
        continue;
      }
      options.push({time, label: formatDisplayTime(time, hasSeconds)});
    }
    return options;
  }, [timeOptionInterval, hasSeconds, timeMin, timeMax, formatDisplayTime]);

  // --- Unified change handler ---
  const fireChange = useCallback(
    (newValue: ISODateTimeString | undefined) => {
      if (isBusy) {
        return;
      }
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
  // Both layers are popover="auto", so opening the time list evicts the
  // calendar and fires this onHide. Returning focus to the date input is right
  // when the calendar itself was dismissed, and wrong once the user has moved
  // to the time field — there it would rip focus out from under them.
  const handleCalendarHide = useCallback(() => {
    if (document.activeElement === timeInputRef.current) {
      return;
    }
    dateInputRef.current?.focus();
  }, []);

  const popover = usePopover({
    dialogLabel: t('@astryx.dateTimeInput.dialogLabel'),
    closeButtonLabel: t('@astryx.dateInput.closeCalendar'),
    onHide: handleCalendarHide,
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
      // With a disabledMessage the input drops `disabled` for focusability, so
      // guard value mutation explicitly (readOnly also blocks typing).
      if (isEffectivelyDisabled) {
        return;
      }
      const text = e.target.value;
      setDatePendingInput(text);

      const parsed = parseDateInput(text);
      if (
        parsed &&
        plainDateToISO(parsed) !== valueParts.date &&
        !isDateDisabled(parsed)
      ) {
        const parsedISO = plainDateToISO(parsed);
        lastFiredDateRef.current = parsedISO;
        handleDateChange(parsedISO, 'input');
        calendarRef.current?.navigateTo(parsedISO);
      }
    },
    [valueParts.date, isDateDisabled, handleDateChange, isEffectivelyDisabled],
  );

  const commitDatePendingInput = useCallback(() => {
    if (datePendingInput === null) {
      return;
    }

    if (!datePendingInput.trim()) {
      if (value !== undefined) {
        fireChange(undefined);
      }
      setDatePendingInput(null);
      return;
    }

    const parsed = parseDateInput(datePendingInput);
    if (parsed && !isDateDisabled(parsed)) {
      const parsedISO = plainDateToISO(parsed);
      if (parsedISO !== valueParts.date) {
        handleDateChange(parsedISO, 'input');
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
        commitDatePendingInput();
      }
    },
    [popover, commitDatePendingInput, isEffectivelyDisabled],
  );

  // --- Time-option popover (#2727) ---
  const timeListboxId = useId();
  const [highlightedTimeIndex, setHighlightedTimeIndex] = useState(-1);

  // With popover="auto", showing the popover between pointerdown and
  // pointerup/click lets the browser's light-dismiss treat that same click as
  // "outside" and close it again. Defer the show past the click, as
  // BaseTypeahead does for the same reason.
  const timePointerActiveRef = useRef(false);

  const timePopover = usePopover({
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
    // The popup's own role="listbox" carries the semantics; the input keeps
    // DOM focus, so announcing a dialog here would misrepresent it.
    role: 'none',
    onHide: () => setHighlightedTimeIndex(-1),
  });

  // Anchor the list to the time wrapper, not the date input the field's own
  // trigger ref points at.
  useEffect(() => {
    if (!hasTimeOptions) {
      return;
    }
    const el = timeContainerRef.current;
    if (el) {
      timePopover.triggerRef(el);
    }
    return () => {
      timePopover.triggerRef(null);
    };
  }, [timePopover, hasTimeOptions]);

  const timeOptionId = useCallback(
    (index: number) => `${timeListboxId}-option-${index}`,
    [timeListboxId],
  );

  // Keep the active option visible. The listbox is a fixed-height scroll
  // container, so without this a list opens at midnight with the highlight far
  // below the fold, and keyboard navigation walks off-screen. Mirrors
  // BaseTypeahead's scrollIntoView({block: 'nearest'}).
  useEffect(() => {
    if (
      !timePopover.isOpen ||
      highlightedTimeIndex < 0 ||
      highlightedTimeIndex >= timeOptions.length
    ) {
      return;
    }
    document
      .getElementById(timeOptionId(highlightedTimeIndex))
      ?.scrollIntoView?.({block: 'nearest'});
  }, [
    timePopover.isOpen,
    highlightedTimeIndex,
    timeOptionId,
    timeOptions.length,
  ]);

  /**
   * The selected time in the same shape the options carry. splitDateTime slices
   * whatever follows the `T`, so a caller passing `14:00:00` with hasSeconds
   * off leaves `"14:00:00"` against options of `"14:00"` — comparing raw would
   * mark nothing selected, silently.
   */
  const selectedOptionTime = useMemo(() => {
    if (!valueParts.time) {
      return undefined;
    }
    const parsed = parseISOTime(valueParts.time);
    return parsed ? formatISOTime(parsed, hasSeconds) : undefined;
  }, [valueParts.time, hasSeconds]);

  /**
   * Index of the option at or immediately before `time`, so opening on a value
   * that is not itself an option (13:07 in a 15-minute list) still lands the
   * highlight somewhere sensible instead of nowhere.
   */
  const closestOptionIndex = useCallback(
    (time: ISOTimeString | undefined) => {
      if (!time || timeOptions.length === 0) {
        return -1;
      }
      let candidate = -1;
      for (let i = 0; i < timeOptions.length; i++) {
        if (timeOptions[i].time <= time) {
          candidate = i;
        } else {
          break;
        }
      }
      // A value below every option (min pushes the list past it) still gets the
      // first option rather than an empty highlight.
      return candidate === -1 ? 0 : candidate;
    },
    [timeOptions],
  );

  const showTimeOptions = useCallback(() => {
    if (!hasTimeOptions || isEffectivelyDisabled || timePopover.isOpen) {
      return;
    }
    setHighlightedTimeIndex(closestOptionIndex(selectedOptionTime));
    // useInputContainer routes wrapper clicks through input.click() once the
    // input advertises a popup, and a programmatic click does not focus. The
    // input must hold DOM focus or aria-activedescendant announces nothing.
    timeInputRef.current?.focus();
    if (timePointerActiveRef.current) {
      document.addEventListener(
        'click',
        () =>
          requestAnimationFrame(() => timePopover.show({skipAutoFocus: true})),
        {once: true},
      );
    } else {
      timePopover.show({skipAutoFocus: true});
    }
  }, [
    hasTimeOptions,
    isEffectivelyDisabled,
    timePopover,
    closestOptionIndex,
    selectedOptionTime,
  ]);

  /**
   * The single commit path for a time chosen from the list. Deliberately the
   * same shape as the typed path: same range check, same date requirement, so
   * picking 9:00 AM and typing "9:00 AM" are indistinguishable downstream.
   */
  const commitTimeOption = useCallback(
    (time: ISOTimeString) => {
      if (isEffectivelyDisabled || !isTimeInRange(time, timeMin, timeMax)) {
        return;
      }
      setTimePendingInput(null);
      if (time !== valueParts.time && valueParts.date) {
        const combined = combineDateTime(valueParts.date, time);
        if (combined) {
          fireChange(combined);
        }
      }
      timePopover.hide();
      timeInputRef.current?.focus();
    },
    [
      isEffectivelyDisabled,
      timeMin,
      timeMax,
      valueParts.time,
      valueParts.date,
      fireChange,
      timePopover,
    ],
  );

  // --- Time handlers ---
  const handleTimeInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // With a disabledMessage the input drops `disabled` for focusability, so
      // guard value mutation explicitly (readOnly also blocks typing).
      if (isEffectivelyDisabled) {
        return;
      }
      const text = e.target.value;
      setTimePendingInput(text);

      const parsed = parseTimeInput(text, hasSeconds);

      // Typing narrows nothing — free-form entry is the contract, and a time
      // between two options must stay reachable. The list instead follows the
      // typed value so Enter lands somewhere the user expects.
      if (timePopover.isOpen && parsed) {
        setHighlightedTimeIndex(closestOptionIndex(parsed));
      }

      if (
        parsed &&
        isTimeInRange(parsed, timeMin, timeMax) &&
        parsed !== valueParts.time
      ) {
        if (valueParts.date) {
          const combined = combineDateTime(valueParts.date, parsed);
          if (combined) {
            fireChange(combined);
          }
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
      isEffectivelyDisabled,
      timePopover.isOpen,
      closestOptionIndex,
    ],
  );

  const handleTimeFocus = useCallback(() => {
    // A disabled/busy input stays focusable (via aria-disabled) so its reason
    // is discoverable, but it must not present editing affordances — keep the
    // static placeholder rather than swapping in the format hint.
    if (isEffectivelyDisabled) {
      return;
    }
    setIsTimeFocused(true);
  }, [isEffectivelyDisabled]);

  const handleTimeBlur = useCallback(() => {
    setIsTimeFocused(false);
    if (timePendingInput === null) {
      return;
    }

    if (!timePendingInput.trim()) {
      // Empty time: revert display to previous value (don't emit partial datetime)
      setTimePendingInput(null);
      return;
    }

    const parsed = parseTimeInput(timePendingInput, hasSeconds);
    if (parsed && isTimeInRange(parsed, timeMin, timeMax)) {
      if (parsed !== valueParts.time && valueParts.date) {
        const combined = combineDateTime(valueParts.date, parsed);
        if (combined) {
          fireChange(combined);
        }
      }
    }
    setTimePendingInput(null);
  }, [timePendingInput, hasSeconds, timeMin, timeMax, valueParts, fireChange]);

  const handleTimeKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // The dropdown claims the arrow keys only while it is open. Closed, they
      // keep stepping the value by timeIncrement exactly as they always have —
      // that behaviour is documented and tested, so the list borrows Alt+Arrow
      // Down (the APG "open without moving" binding) to open instead.
      if (hasTimeOptions && !isEffectivelyDisabled) {
        if (e.key === 'Escape' && timePopover.isOpen) {
          e.preventDefault();
          timePopover.hide();
          return;
        }

        if (e.key === 'ArrowDown' && e.altKey) {
          e.preventDefault();
          showTimeOptions();
          return;
        }

        if (timePopover.isOpen && timeOptions.length > 0) {
          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              setHighlightedTimeIndex(i =>
                i < timeOptions.length - 1 ? i + 1 : i,
              );
              return;
            case 'ArrowUp':
              e.preventDefault();
              setHighlightedTimeIndex(i => (i > 0 ? i - 1 : i));
              return;
            case 'Home':
              e.preventDefault();
              setHighlightedTimeIndex(0);
              return;
            case 'End':
              e.preventDefault();
              setHighlightedTimeIndex(timeOptions.length - 1);
              return;
            case 'Enter': {
              e.preventDefault();
              const option = timeOptions[highlightedTimeIndex];
              if (option) {
                commitTimeOption(option.time);
              }
              return;
            }
            case 'Tab':
              // Let focus leave; blur commits any typed text as usual.
              timePopover.hide();
              return;
            default:
              break;
          }
        }
      }

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
          if (combined) {
            fireChange(combined);
          }
        }
      }
    },
    [
      valueParts,
      hasSeconds,
      timeIncrement,
      timeMin,
      timeMax,
      fireChange,
      hasTimeOptions,
      isEffectivelyDisabled,
      timePopover,
      timeOptions,
      highlightedTimeIndex,
      showTimeOptions,
      commitTimeOption,
    ],
  );

  // --- Clear ---
  const handleClear = useCallback(() => {
    fireChange(undefined);
    dateInputRef.current?.focus();
  }, [fireChange]);

  // Focus time input when clicking wrapper padding/icon
  const {onClick: handleTimeWrapperClick, onMouseUp: handleTimeWrapperMouseUp} =
    useInputContainer({
      containerRef: timeContainerRef,
      inputRef: timeInputRef,
      disabled: isEffectivelyDisabled,
    });

  return (
    <Field
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
      statusVariant="detached"
      width={width}>
      <div
        ref={disabledMessageTooltip.ref}
        {...rest}
        {...mergeProps(
          themeProps('date-time-input', {
            size,
            status: status?.type ?? null,
            disabled: isDisabled ? 'disabled' : null,
          }),
          stylex.props(styles.row, xstyle),
          className,
          style,
        )}>
        {/* Date input */}
        <div
          ref={popover.triggerRef}
          {...mergeProps(
            themeProps('date-time-input-date-segment', {
              size,
              status: status?.type ?? null,
            }),
            stylex.props(
              inputWrapperStyles.base,
              sizeStyles[size],
              styles.dateWrapper,
              isEffectivelyDisabled && inputWrapperStyles.disabled,
              status && inputStatusBorderStyles[status.type],
              status &&
                !isEffectivelyDisabled &&
                inputStatusHoverShadowStyles[status.type],
              status && inputStatusFocusWithinStyles[status.type],
            ),
          )}>
          <button
            type="button"
            onClick={handleCalendarToggle}
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
            ref={mergeRefs(ref, dateInputRef)}
            id={dateInputId}
            type="text"
            role="combobox"
            value={dateDisplayValue}
            onChange={handleDateInputChange}
            onBlur={handleDateBlur}
            onClick={handleDateInputClick}
            onKeyDown={handleDateKeyDown}
            placeholder={placeholder}
            // With a disabledMessage the input keeps focusability via
            // aria-disabled so the reason is focus-discoverable; typing is
            // blocked with readOnly and the mutation guards, and calendar
            // activation is blocked by the isEffectivelyDisabled guards.
            disabled={isEffectivelyDisabled && !showsDisabledMessage}
            aria-disabled={showsDisabledMessage ? 'true' : undefined}
            readOnly={showsDisabledMessage || undefined}
            aria-describedby={ariaDescribedBy}
            aria-required={isRequired === true ? 'true' : undefined}
            aria-invalid={
              status?.type === 'error' || !isDateInputValid ? 'true' : undefined
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
              !isDateInputValid && styles.inputInvalid,
            )}
          />
          {/*
            Live region announcing invalid typed date input to assistive
            technology. The value silently reverts on blur, so without this a
            screen-reader user would get no feedback that their entry was
            rejected (WCAG 3.3.1).
          */}
          <VisuallyHidden as="div" role="alert" aria-live="assertive">
            {!isDateInputValid ? 'Invalid date' : ''}
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
          {statusIcon}
        </div>

        {/* Time input */}
        <div
          ref={timeContainerRef}
          onClick={handleTimeWrapperClick}
          onMouseUp={handleTimeWrapperMouseUp}
          {...mergeProps(
            themeProps('date-time-input-time-segment', {
              size,
              status: status?.type ?? null,
            }),
            stylex.props(
              inputWrapperStyles.base,
              sizeStyles[size],
              styles.timeWrapper,
              isEffectivelyDisabled && inputWrapperStyles.disabled,
              status && inputStatusBorderStyles[status.type],
              status &&
                !isEffectivelyDisabled &&
                inputStatusHoverShadowStyles[status.type],
              status && inputStatusFocusWithinStyles[status.type],
            ),
          )}>
          <div {...stylex.props(styles.icon)}>
            <Icon icon="clock" size="sm" color="secondary" />
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
            onClick={hasTimeOptions ? showTimeOptions : undefined}
            onPointerDown={
              hasTimeOptions
                ? () => {
                    timePointerActiveRef.current = true;
                    document.addEventListener(
                      'click',
                      () => {
                        timePointerActiveRef.current = false;
                      },
                      {once: true},
                    );
                  }
                : undefined
            }
            placeholder={resolvedTimePlaceholder}
            // Combobox semantics appear only with the dropdown opted in, so a
            // field without it keeps a single combobox on the date half.
            role={hasTimeOptions ? 'combobox' : undefined}
            aria-expanded={hasTimeOptions ? timePopover.isOpen : undefined}
            aria-controls={
              hasTimeOptions && timePopover.isOpen ? timeListboxId : undefined
            }
            aria-autocomplete={hasTimeOptions ? 'list' : undefined}
            aria-activedescendant={
              hasTimeOptions &&
              timePopover.isOpen &&
              highlightedTimeIndex >= 0 &&
              highlightedTimeIndex < timeOptions.length
                ? timeOptionId(highlightedTimeIndex)
                : undefined
            }
            // With a disabledMessage the input keeps focusability via
            // aria-disabled so the reason is focus-discoverable; typing is
            // blocked with readOnly and the mutation guards.
            disabled={isEffectivelyDisabled && !showsDisabledMessage}
            aria-disabled={showsDisabledMessage ? 'true' : undefined}
            readOnly={showsDisabledMessage || undefined}
            aria-label={
              timeLabel ?? t('@astryx.dateTimeInput.timeSuffix', {label})
            }
            aria-describedby={ariaDescribedBy}
            aria-required={isRequired === true ? 'true' : undefined}
            aria-invalid={
              status?.type === 'error' || !isTimeInputValid ? 'true' : undefined
            }
            aria-busy={isBusy || undefined}
            {...stylex.props(
              styles.input,
              isEffectivelyDisabled && styles.inputDisabled,
              !isTimeInputValid && styles.inputInvalid,
            )}
          />
          {/*
            Live region announcing invalid typed time input to assistive
            technology (WCAG 3.3.1).
          */}
          <VisuallyHidden as="div" role="alert" aria-live="assertive">
            {!isTimeInputValid ? 'Invalid time' : ''}
          </VisuallyHidden>
        </div>
      </div>

      {popover.render(
        <Calendar
          handleRef={calendarRef}
          mode="single"
          value={valueParts.date}
          onChange={(d: ISODateString) => handleDateChange(d, 'calendar')}
          min={calendarMin}
          max={calendarMax}
          dateConstraints={dateConstraints}
          numberOfMonths={numberOfMonths}
          weekStartsOn={weekStartsOn}
        />,
        {placement: 'below', alignment: 'start'},
      )}

      {hasTimeOptions &&
        timePopover.render(
          // The layer renders its children open or closed, so mount the list
          // only while it is open — a 5-minute cadence is 288 nodes that would
          // otherwise sit in the DOM of every opted-in field for its lifetime.
          !timePopover.isOpen ? null : (
            <div
              id={timeListboxId}
              role="listbox"
              aria-label={t('@astryx.dateTimeInput.timeOptionsLabel', {label})}
              {...mergeProps(
                themeProps('date-time-input-time-listbox'),
                stylex.props(styles.timeListbox),
              )}>
              {timeOptions.map((option, index) => {
                const isSelected = option.time === selectedOptionTime;
                return (
                  <div
                    key={option.time}
                    id={timeOptionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    // Pointer-down commit: the input must not lose focus to the
                    // option, or blur would fire its own commit first.
                    onPointerDown={e => e.preventDefault()}
                    onClick={() => commitTimeOption(option.time)}
                    onMouseEnter={() => setHighlightedTimeIndex(index)}
                    {...mergeProps(
                      themeProps('date-time-input-time-option'),
                      stylex.props(
                        styles.timeOption,
                        index === highlightedTimeIndex &&
                          styles.timeOptionHighlighted,
                        isSelected && styles.timeOptionSelected,
                      ),
                    )}>
                    {option.label}
                  </div>
                );
              })}
            </div>
          ),
          {placement: 'below', alignment: 'start'},
        )}

      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </Field>
  );
}

DateTimeInput.displayName = 'DateTimeInput';
