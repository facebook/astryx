// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DateInput.tsx
 * @input Uses React, useId, useState, useCallback, useRef, Field, Icon, Calendar, usePopover, InputGroupContext, useNativeDatePicker
 * @output Exports DateInput component, DateInputProps
 * @position Core implementation; consumed by index.ts, tested by DateInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DateInput/DateInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/DateInput/DateInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/DateInput/index.ts (exports if types change)
 * - /apps/storybook/stories/DateInput.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/DateInput/ (showcase blocks)
 */

import {
  use,
  useId,
  useState,
  useCallback,
  useEffect,
  useRef,
  useOptimistic,
  useTransition,
} from 'react';
import * as stylex from '@stylexjs/stylex';
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
  InputClearButton,
  type InputStatus,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
  type FieldStatusVariant,
} from '../Field';
import {Icon} from '../Icon';
import {VisuallyHidden} from '../VisuallyHidden';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import {groupStyles} from '../InputGroup/groupStyles';
import {useSize} from '../SizeContext/SizeContext';
import {Spinner} from '../Spinner';
import {
  Calendar,
  type ISODateString,
  type CalendarHandle,
  type DayOfWeek,
  type DayOfWeekName,
} from '../Calendar';
import {useCalendarConstraints} from '../Calendar/hooks';
import {
  useNativeDatePicker,
  type DateInputNativePicker,
} from './useNativeDatePicker';
import {useInputStatusIcon} from '../hooks/useInputStatusIcon';
import {useResolvedRequired} from '../hooks/useResolvedRequired';
import {usePopover} from '../Popover';
import {useTooltip} from '../Tooltip';
import {getInputARIA, isImeKeyEvent, parseDateInput} from '../utils';
import {
  plainDateFromISO,
  plainDateToISO,
  formatSharedDate,
} from '../utils/plainDate';
import type {TimestampFormat} from '../Timestamp';

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
  // `<input type="date">`, rendered when the browser/OS date picker takes over
  // (see useNativeDatePicker). The engine draws its own chrome inside the
  // field; these rules make it sit like the text variant it replaces.
  nativeInput: {
    // A date control's intrinsic height comes from its inner edit fields, not
    // from `line-height`, so it is ~2px taller than the text input and its
    // value paints a pixel off the text variant's baseline inside the same
    // flex row. One line box is exactly what the text input occupies.
    height: stylex.firstThatWorks(
      '1lh',
      `calc(max(1rem, ${typeScaleVars['--text-body-size']}) * ${typeScaleVars['--text-body-leading']})`,
    ),
    // iOS gives date controls their own button-like chrome, with inner
    // spacing and a centered value that no reset of ours can reach.
    WebkitAppearance: 'none',
    appearance: 'none',
    // Chromium paints a second calendar glyph inside the field. DateInput
    // already ships a toggle button, so drop the duplicate.
    '::-webkit-calendar-picker-indicator': {
      display: 'none',
    },
    // iOS Safari centers the value and reserves its own inner spacing.
    '::-webkit-date-and-time-value': {
      textAlign: 'start',
      marginBlock: 0,
      marginInline: 0,
      paddingBlock: 0,
      paddingInline: 0,
      lineHeight: 'inherit',
      minHeight: 0,
    },
    '::-webkit-datetime-edit': {
      paddingBlock: 0,
      paddingInline: 0,
      lineHeight: 'inherit',
    },
  },
  // Hides whatever the engine paints inside the control so DateInput's own
  // text can take that space. WebKit renders the value into a single
  // `::-webkit-date-and-time-value` run which the UA stylesheet gives no
  // colour of its own (the iOS UA colour, -apple-system-blue, sits on the
  // INPUT), so it inherits this; Chromium's `::-webkit-datetime-edit` fields
  // inherit it too. `-webkit-text-fill-color` is what actually wins inside a
  // WebKit date control.
  nativeInputTextHidden: {
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
  },
  // DateInput's own text, laid over the control. Decorative: the input still
  // holds the value and keeps its label, description, and status wiring, so
  // announcing this too would just double-speak.
  nativeOverlay: {
    position: 'absolute',
    insetInlineStart: 0,
    // Both insets, so the overlay is bounded by the slot rather than
    // shrink-to-fit. Without the end inset a long formatted date (the
    // default `date_long` renders up to "September 30, 2026") paints past
    // the slot and over whatever follows it in the field — measured running
    // 24px across the clear button.
    insetInlineEnd: 0,
    insetBlock: 0,
    // A BLOCK box, not a flex one: `text-overflow` only applies to a block
    // container, so on a flex container a too-long date hard-clips mid-glyph
    // instead of ellipsising (measured identical to `text-overflow: clip` in
    // both WebKit and Chromium). Centring then has to come from the line box
    // rather than `align-items`, so the overlay carries the same font size
    // and leading as the input it covers: one line of that leading fills the
    // overlay's height exactly, which puts the glyphs on the input's own
    // baseline. Without this the text sat ~2.4px high.
    display: 'block',
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    // A tap has to reach the control underneath — that is what raises the
    // picker.
    pointerEvents: 'none',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  nativeOverlayValue: {
    color: colorVars['--color-text-primary'],
  },
  nativeOverlayPlaceholder: {
    color: colorVars['--color-text-secondary'],
  },
  // Positioning context for the placeholder overlay, standing in for the
  // input's own box in the field's flex row.
  nativeInputSlot: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
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

/**
 * Named display formats for a committed date value. These are the date-only
 * members of Timestamp's `format` vocabulary — reused verbatim (via
 * `Extract`) so the same literal renders the same date shape in both
 * `Timestamp` and `DateInput`:
 * - `'date'`: locale short-month date, e.g. "Mar 21, 2026"
 * - `'date_long'`: locale long-month date, e.g. "March 21, 2026" (the default)
 * - `'date_weekday'`: short weekday + date, e.g. "Wed, Mar 21, 2026"
 * - `'system_date'`: ISO 8601 calendar date, e.g. "2026-03-21"
 *
 * Because `DateInputFormat` is `Extract`ed from `TimestampFormat`, the two
 * types stay in compile-time lockstep: renaming or removing one of these
 * members from `TimestampFormat` breaks this type at build time.
 */
export type DateInputFormat = Extract<
  TimestampFormat,
  'date' | 'date_long' | 'date_weekday' | 'system_date'
>;

// Re-export shared types for convenience

export type {
  InputStatus as DateInputStatus,
  InputStatusType as DateInputStatusType,
} from '../Field';
export type {DateInputNativePicker} from './useNativeDatePicker';
import {mergeProps, mergeRefs, isFocusDetached} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import {stableClassName} from '../naming';
import {useTranslator, InternationalizationContext} from '../i18n';

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
   * How the status message is placed relative to the input.
   * - 'attached': message overlaps directly below the input (bordered treatment)
   * - 'detached': message floats below as a separate element with spacing
   * - 'tooltip': no message box; the status icon becomes a focusable info-tip button that reveals the message on hover, keyboard focus, or tap
   * @default 'attached'
   */
  statusVariant?: FieldStatusVariant;

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

  /**
   * First day of week in the calendar popover. Accepts a number
   * (0 = Sunday … 6 = Saturday) or a three-letter day name ('sun'–'sat',
   * case-insensitive).
   * @default 0
   */
  weekStartsOn?: DayOfWeek | DayOfWeekName;

  /**
   * How the committed date value is displayed in the text field. Accepts a
   * named format reused from `Timestamp`'s `format` vocabulary (so the same
   * literal renders the same date shape in both components) or a function that
   * maps the ISO value to a custom display string.
   *
   * - `'date_long'` (default): long-month date, e.g. "March 21, 2026"
   * - `'date'`: short-month date, e.g. "Mar 21, 2026"
   * - `'date_weekday'`: short weekday + date, e.g. "Wed, Mar 21, 2026"
   * - `'system_date'`: ISO 8601 calendar date, e.g. "2026-03-21"
   * - `(value: ISODateString) => string`: fully custom display string
   *
   * Formatting applies only to the committed value — never to text the user is
   * actively typing. A custom function's output that `parseDateInput` cannot
   * read back can't be re-committed after an edit; external `value` changes
   * always recompute the display from the ISO value.
   *
   * @default 'date_long'
   * @example
   * ```
   * <DateInput label="Ship date" value={date} onChange={setDate} format="date" />
   * <DateInput
   *   label="Ship date"
   *   value={date}
   *   onChange={setDate}
   *   format={iso => new Date(iso + 'T00:00').toDateString()}
   * />
   * ```
   */
  format?: DateInputFormat | ((value: ISODateString) => string);

  /**
   * Whether date picking is handed to the browser/OS instead of the built-in
   * Calendar popover. A native control gives touch users the picker their
   * platform already teaches — the iOS wheel, the Android calendar dialog —
   * with system-sized hit areas, momentum scrolling, and the OS locale and
   * accessibility settings applied.
   *
   * - `'touch'` (default): native on touch devices (coarse pointer), the
   *   Calendar popover on mouse-driven ones
   * - `'always'`: native wherever the browser supports `<input type="date">`
   * - `'never'`: always the Calendar popover
   *
   * The switch is made on the client after hydration, so the server always
   * renders the text field. In native mode the browser owns the picker, so
   * `numberOfMonths` and `weekStartsOn` no longer apply — they describe a
   * calendar grid the native picker does not have. `format` and `placeholder`
   * still apply: DateInput paints the closed field's text itself, over the
   * control. On a desktop control, whose date segments the browser lets the
   * user type into, the field reverts to the browser's own format while it
   * has focus; a touch picker has no segments, so our text holds throughout.
   * The picker's own surface is always the OS locale's. `min` and `max` carry
   * over to the native control; `dateConstraints` cannot (a native picker
   * only expresses a contiguous range), so `'touch'` keeps the Calendar
   * popover whenever `dateConstraints` is set.
   *
   * @default 'touch'
   * @example
   * ```
   * // Keep the in-page calendar everywhere, including on phones
   * <DateInput label="Event date" value={date} onChange={setDate} nativePicker="never" />
   * ```
   */
  nativePicker?: DateInputNativePicker;
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
  statusVariant = 'attached',
  labelTooltip,
  hasClear = false,
  numberOfMonths = 1,
  weekStartsOn,
  format = 'date_long',
  nativePicker = 'touch',
  width,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DateInputProps) {
  const t = useTranslator();
  const isEffectivelyRequired = useResolvedRequired({isRequired, isOptional});
  const {locale} = use(InternationalizationContext);
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

  // Touch devices get the browser/OS date picker instead of the Calendar
  // popover: a `<input type="date">` whose picker the platform draws.
  const {isNative, isSegmentEditable} = useNativeDatePicker(
    nativePicker,
    (dateConstraints?.length ?? 0) > 0,
  );

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

  // Constraint checking for text input validation (reuses calendar logic)
  const {isDateDisabled} = useCalendarConstraints({min, max, dateConstraints});

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
      statusVariant !== 'tooltip' && status?.message ? statusMessageID : null,
      // The tooltip variant renders no message box; describe the input by the
      // tooltip's content instead so the status is still announced.
      statusTooltipDescribedBy,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ],
    inputGroup,
  );

  // Pending input while user is typing (null = show formatted value)
  const [pendingInput, setPendingInput] = useState<string | null>(null);

  // Native mode has no pending text — the control only ever hands back a
  // complete date. This holds a date the picker produced that `dateConstraints`
  // refuses (reachable only with nativePicker="always", since 'touch' keeps the
  // Calendar popover whenever constraints are set), so the refusal can be
  // announced instead of looking like a dead tap.
  const [rejectedNativeValue, setRejectedNativeValue] = useState<string | null>(
    null,
  );

  // Whether the native control has focus. Its empty-state hint is hidden so
  // DateInput's own placeholder can take that space, and focus is what brings
  // the hint back — the user is about to scroll or type into those segments.
  const [isNativeFocused, setIsNativeFocused] = useState(false);

  // Whether a key has gone into the native control since it took focus.
  //
  // Backstop for a device the pointer check gets wrong: a Windows tablet
  // reports a coarse pointer while desktop Chrome still renders editable
  // segments. Focus alone would not hand the field back there, and the user
  // would be typing into digits they cannot see. A picker-only control never
  // receives a keystroke, so this stays false on a phone.
  const [hasTypedSinceFocus, setHasTypedSinceFocus] = useState(false);

  // The raw value the native control last reported and we acted on, so the
  // same edit arriving through both commit paths only fires one change.
  const lastNativeCommitRef = useRef<string | null>(null);

  // Clear pending input when value changes externally (computed during render
  // via prev-value ref instead of useEffect to avoid an extra render cycle)
  const prevValueRef = useRef(value);
  if (value !== prevValueRef.current) {
    prevValueRef.current = value;
    lastNativeCommitRef.current = null;
    if (rejectedNativeValue !== null) {
      setRejectedNativeValue(null);
    }
    if (value !== lastFiredValueRef.current) {
      lastFiredValueRef.current = undefined;
      if (pendingInput !== null) {
        setPendingInput(null);
      }
    }
  }

  // Format a committed ISO value for display. The default `date_long` renders
  // the long-month shape (byte-identical to the historical hardcoded
  // DATE_FORMAT_LONG rendering, so still non-breaking); a function is called
  // with the ISO value; every other named member reuses Timestamp's shared
  // date mapping. Applies ONLY to the committed value, never to in-progress
  // typed input.
  const formatCommittedValue = useCallback(
    (iso: ISODateString): string =>
      typeof format === 'function'
        ? format(iso)
        : formatSharedDate(plainDateFromISO(iso), format, locale),
    [format, locale],
  );

  // Display value: pending input if typing, otherwise formatted value
  const displayValue =
    pendingInput !== null
      ? pendingInput
      : optimisticValue && /^\d{4}-\d{2}-\d{2}$/.test(optimisticValue)
        ? formatCommittedValue(optimisticValue)
        : '';

  // The native control's own value is always ISO — that is the only form it
  // accepts, and what the picker reads and writes. `format` rides on the
  // overlay below instead, so the value the engine holds stays canonical.
  const nativeValue =
    optimisticValue && /^\d{4}-\d{2}-\d{2}$/.test(optimisticValue)
      ? optimisticValue
      : '';

  // The engine owns the field's text only while the user is editing its
  // segments; the rest of the time DateInput paints it, which is what keeps
  // `format` applying in native mode. On a picker-only control — the iOS
  // wheel, the Android dialog — there are no segments, so both terms stay
  // false and our text holds even while the picker is open.
  const isEditingNative =
    (isSegmentEditable && isNativeFocused) || hasTypedSinceFocus;
  const paintsOwnText = isNative && !isEditingNative;

  // What goes over the control: the formatted value, or the placeholder when
  // there is nothing to format.
  const nativeOverlayText = nativeValue
    ? formatCommittedValue(nativeValue)
    : placeholder;
  const showsNativeOverlay = paintsOwnText && !!nativeOverlayText;

  // Check if current input is valid (for styling purposes)
  const isTypedInputValid =
    pendingInput === null || !pendingInput.trim()
      ? true
      : parseDateInput(pendingInput, locale) !== null;
  // The native control never hands back half-typed text, so the only way it
  // holds something invalid is a date `dateConstraints` refused.
  const isInputValid = isNative
    ? rejectedNativeValue === null
    : isTypedInputValid;

  const popover = usePopover({
    dialogLabel: t('@astryx.dateInput.dialogLabel'),
    closeButtonLabel: t('@astryx.dateInput.closeCalendar'),
    // Return focus to the input when the calendar closes — but only when the
    // dismiss left focus detached (Escape, or a click on non-focusable empty
    // space), which the focus trap can't restore on its own. A native
    // popover="auto" light-dismiss fires synchronously with the pointer event
    // that moved focus, so if the user clicked another control — the clear
    // button, another field, anywhere — focus has already landed there;
    // reclaiming it would fight their click.
    onHide: () => {
      if (isFocusDetached()) {
        inputRef.current?.focus();
      }
    },
  });

  // Handle toggling the popover from button click (focus calendar).
  // In native mode the same button asks the browser for its own picker.
  const handleToggle = useCallback(() => {
    if (isEffectivelyDisabled) {
      return;
    }
    if (isNative) {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      // Focus first: on touch browsers focusing the control is itself what
      // raises the picker, which covers engines without showPicker.
      input.focus();
      if (typeof input.showPicker === 'function') {
        try {
          input.showPicker();
        } catch {
          // showPicker throws without transient user activation and inside a
          // cross-origin iframe. The focus above is the fallback.
        }
      }
      return;
    }
    if (popover.isOpen) {
      popover.hide();
    } else {
      popover.show();
    }
  }, [isEffectivelyDisabled, isNative, popover]);

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
    // Focusing a native date control is what raises the OS picker, so taking
    // focus back after a clear would pop the wheel the user just dismissed —
    // and on iOS that reads as the clear having done nothing. Only the text
    // field, where focus restores the caret, gets it back.
    if (!isNative) {
      inputRef.current?.focus();
    }
  }, [fireChange, isNative]);

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
      const parsed = parseDateInput(newValue, locale);
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
    [value, fireChange, isDateDisabled, isEffectivelyDisabled, locale],
  );

  // Commit a raw value coming back from the native control. Its value is
  // either an ISO date string or '' — the engine never reports a half-typed
  // date, so there is no pending-text state to keep here.
  const commitNativeValue = useCallback(
    (newValue: string) => {
      if (isEffectivelyDisabled) {
        return;
      }
      // The same edit can arrive twice — React's synthetic change and the
      // native listener below both report it — so act on a raw value once.
      if (lastNativeCommitRef.current === newValue) {
        return;
      }
      lastNativeCommitRef.current = newValue;

      if (!newValue) {
        setRejectedNativeValue(null);
        if (value !== undefined) {
          fireChange(undefined);
        }
        return;
      }

      // The control's value is always ISO, which `parseDateInput` matches
      // before any locale-specific shape — but pass the locale anyway so
      // every call in this file reads the same way.
      const parsed = parseDateInput(newValue, locale);
      if (!parsed) {
        return;
      }
      if (isDateDisabled(parsed)) {
        // Refuse the date and let the controlled value snap the control back.
        // The live region below announces the rejection.
        setRejectedNativeValue(newValue);
        return;
      }

      setRejectedNativeValue(null);
      const parsedISO = plainDateToISO(parsed);
      if (parsedISO !== value) {
        lastFiredValueRef.current = parsedISO;
        fireChange(parsedISO);
      }
    },
    [value, fireChange, isDateDisabled, isEffectivelyDisabled, locale],
  );

  const handleNativeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      commitNativeValue(e.target.value);
    },
    [commitNativeValue],
  );

  // React's synthetic change system does not reliably observe the iOS date
  // picker's edits. Measured on an iPhone: picking a date fired a native
  // `input` event carrying the new date, while React's `onChange` never ran —
  // so React re-rendered and wrote its own stale value straight back over the
  // picker's, and the user's pick (and their Reset, which restores the date
  // the field opened with) silently reverted. A native listener reads what the
  // control actually holds, whatever React's synthetic layer made of it.
  const commitRef = useRef(commitNativeValue);
  useEffect(() => {
    commitRef.current = commitNativeValue;
  });
  useEffect(() => {
    if (!isNative) {
      return;
    }
    const input = inputRef.current;
    if (!input) {
      return;
    }
    const handleNative = () => commitRef.current(input.value);
    input.addEventListener('input', handleNative);
    input.addEventListener('change', handleNative);
    return () => {
      input.removeEventListener('input', handleNative);
      input.removeEventListener('change', handleNative);
    };
  }, [isNative]);

  // The value the native control mounts with. Deliberately captured once:
  // React writes to the element whenever a `value` OR `defaultValue` prop
  // changes, and on iOS ANY write while the picker sheet is open detaches the
  // sheet from the field — the wheel and Reset keep moving the sheet's own
  // highlight, but nothing they do reaches the input and no event fires, so
  // the user's Reset appears to do nothing. Holding this constant means React
  // touches the element exactly once, at mount; the effect below owns every
  // later update and only writes when the field is not focused.
  const initialNativeValueRef = useRef<string | null>(null);
  if (isNative && initialNativeValueRef.current === null) {
    initialNativeValueRef.current = nativeValue;
  }

  // Push an externally-changed value into the uncontrolled native control —
  // but never while it has focus, for the reason above. Blur flips
  // `isNativeFocused`, so this doubles as the reconcile once the picker
  // closes.
  useEffect(() => {
    if (!isNative || isNativeFocused) {
      return;
    }
    const input = inputRef.current;
    if (input && input.value !== nativeValue) {
      input.value = nativeValue;
    }
  }, [isNative, isNativeFocused, nativeValue]);

  // Reconcile when the picker closes, in case an engine commits its result on
  // dismissal without firing anything at all.
  const handleNativeBlur = useCallback(() => {
    const domValue = inputRef.current?.value;
    setIsNativeFocused(false);
    setHasTypedSinceFocus(false);
    // A refused date is reverted by the sync effect the moment focus leaves,
    // so the field is once again showing a date that IS valid. Keeping the
    // rejection past that point would mark good data invalid — a greyed value
    // and `aria-invalid` over a date the user never chose, with no way back
    // except changing the field again. The live region announced the refusal
    // while it happened; that is the feedback, not a persistent state.
    setRejectedNativeValue(null);
    if (domValue !== undefined && domValue !== nativeValue) {
      commitNativeValue(domValue);
    }
  }, [commitNativeValue, nativeValue]);

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

    const parsed = parseDateInput(pendingInput, locale);
    if (parsed && !isDateDisabled(parsed)) {
      const parsedISO = plainDateToISO(parsed);
      if (parsedISO !== value) {
        fireChange(parsedISO);
      }
    }
    setPendingInput(null);
  }, [pendingInput, value, fireChange, isDateDisabled, locale]);

  // Handle blur - validate, check constraints, and clear pending input
  const handleBlur = useCallback(() => {
    commitPendingInput();
  }, [commitPendingInput]);

  // Handle keyboard events on input
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // An in-progress IME composition uses Enter to commit the candidate and
      // Escape to cancel it; that composing keydown fires before
      // compositionend, so without this guard a Korean/Japanese/Chinese user
      // committing a syllable with Enter would instead commit the pending date
      // (or Escape would close the calendar mid-composition). See utils/ime.ts.
      if (isImeKeyEvent(e.nativeEvent)) {
        return;
      }
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
        themeProps('date-input', {
          size,
          status: status?.type ?? null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        stylex.props(
          inputWrapperStyles.base,
          sizeStyles[size],
          isEffectivelyDisabled && inputWrapperStyles.disabled,
          status && inputStatusBorderStyles[status.type],
          status &&
            !isEffectivelyDisabled &&
            inputStatusHoverShadowStyles[status.type],
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
          !isNative && popover.isOpen
            ? t('@astryx.dateInput.toggleCalendarClose')
            : t('@astryx.dateInput.openCalendar')
        }
        {...stylex.props(
          focusOutlineStyles.focusVisible,
          styles.iconButton,
          isEffectivelyDisabled && styles.iconButtonDisabled,
        )}>
        <Icon
          icon="calendar"
          size="sm"
          color="secondary"
          // Stable theme target on the toggle glyph itself, so a theme can
          // restyle just this icon (color, size, hover) — and each open/closed
          // state — via `defineTheme`. Same-element rules in @layer astryx-theme
          // win over the icon's own base color/size, which a button-level target
          // could not reach. Reflects the popover's open/closed state as a
          // `data-state` attribute.
          {...themeProps('date-input-toggle-icon', {
            state: !isNative && popover.isOpen ? 'expanded' : 'collapsed',
          })}
        />
      </button>
      {isNative ? (
        <span {...stylex.props(styles.nativeInputSlot)}>
          <input
            ref={mergeRefs(ref, inputRef)}
            id={id}
            type="date"
            // UNCONTROLLED on purpose, with a value that never changes after
            // mount. Measured on iOS: while its picker sheet is open, any
            // programmatic write to the field — React re-rendering a
            // controlled `value`, or even syncing a changed `defaultValue` —
            // detaches the sheet from the field. The wheel keeps moving and
            // Reset still shifts its own highlight, but nothing reaches the
            // input any more and no event fires, so Reset appears to do
            // nothing. A plain input carrying all the same CSS has no such
            // problem, which is what ruled the styling out. See
            // `initialNativeValueRef` and the sync effect above.
            defaultValue={initialNativeValueRef.current ?? ''}
            onChange={handleNativeChange}
            onFocus={() => {
              setIsNativeFocused(true);
              setHasTypedSinceFocus(false);
            }}
            onBlur={handleNativeBlur}
            onKeyDown={e => {
              // Only an edit hands the field back to the engine. Tab and
              // Escape leave the segments untouched, and counting them would
              // flash the engine's own format over ours for the frame before
              // focus goes — most visibly on the way out of the field.
              if (e.key !== 'Tab' && e.key !== 'Escape') {
                setHasTypedSinceFocus(true);
              }
            }}
            min={min}
            max={max}
            // With a disabledMessage the input keeps focusability via
            // aria-disabled so the reason is focus-discoverable; the mutation
            // guard in handleNativeChange blocks the picker's result, and
            // readOnly stops the engine from opening it at all.
            disabled={isEffectivelyDisabled && !showsDisabledMessage}
            aria-disabled={showsDisabledMessage ? 'true' : undefined}
            readOnly={showsDisabledMessage || undefined}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-required={isEffectivelyRequired ? 'true' : undefined}
            aria-invalid={
              status?.type === 'error' || !isInputValid ? 'true' : undefined
            }
            aria-busy={isBusy || undefined}
            {...stylex.props(
              styles.input,
              styles.nativeInput,
              showsNativeOverlay && styles.nativeInputTextHidden,
              isEffectivelyDisabled && styles.inputDisabled,
              !isInputValid && styles.inputInvalid,
            )}
          />
          {showsNativeOverlay && (
            <span
              aria-hidden="true"
              {...stylex.props(
                styles.nativeOverlay,
                nativeValue
                  ? styles.nativeOverlayValue
                  : styles.nativeOverlayPlaceholder,
                isEffectivelyDisabled && styles.inputDisabled,
                !isInputValid && !!nativeValue && styles.inputInvalid,
              )}>
              {nativeOverlayText}
            </span>
          )}
        </span>
      ) : (
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
          aria-required={isEffectivelyRequired ? 'true' : undefined}
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
      )}
      {/*
          Live region announcing invalid typed input to assistive technology.
          The value silently reverts on blur, so without this a screen-reader
          user would get no feedback that their entry was rejected (WCAG 3.3.1).
        */}
      <VisuallyHidden as="div" role="alert" aria-live="assertive">
        {!isInputValid ? t('@astryx.dateInput.invalidDate') : ''}
      </VisuallyHidden>
      {hasClear && value !== undefined && !isEffectivelyDisabled && (
        <InputClearButton
          label={t('@astryx.dateInput.clear', {label})}
          onClick={handleClear}
          iconClassName={stableClassName('date-input-clear-icon')}
        />
      )}
      {isBusy && <Spinner size="sm" />}
      {statusIcon}
      {!isNative &&
        popover.render(
          <Calendar
            handleRef={calendarRef}
            mode="single"
            value={optimisticValue}
            onChange={handleDateSelect}
            min={min}
            max={max}
            dateConstraints={dateConstraints}
            numberOfMonths={numberOfMonths}
            weekStartsOn={weekStartsOn}
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
      statusVariant={statusVariant}
      labelTooltip={labelTooltip}
      width={width}>
      {inputWrapper}
    </Field>
  );
}

DateInput.displayName = 'DateInput';
