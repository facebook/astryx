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
 * - /packages/core/src/DateInput/DateInputAdaptations.test.tsx (surface policy tests)
 * - /packages/core/src/DateInput/index.ts (exports if types change)
 * - /packages/core/src/hooks/useAdaptationSurfaceLatch.ts (holds a surface mid-interaction)
 * - /packages/core/src/theme/componentAdaptations.ts (policy shape + compiler)
 * - /apps/storybook/stories/DateInput.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/DateInput/ (showcase blocks)
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
import {useInputStatusIcon} from '../hooks/useInputStatusIcon';
import {useAdaptationSurfaceLatch} from '../hooks/useAdaptationSurfaceLatch';
import {useMediaQuery} from '../hooks/useMediaQuery';
import {useResolvedRequired} from '../hooks/useResolvedRequired';
import {usePopover} from '../Popover';
import {
  forEachAuthoredAdaptationValue,
  type ComponentAdaptations,
} from '../theme/componentAdaptations';
import {useComponentAdaptations} from '../theme/useComponentAdaptations';
import {NativeDateField} from './NativeDateField';
import {TouchDateField} from './TouchDateField';
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
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    borderRadius: radiusVars['--radius-element'],
  },
  iconButtonDisabled: {
    cursor: 'default',
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
    cursor: 'default',
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
/**
 * When DateInput hands date picking to the browser/OS instead of its own
 * surfaces.
 *
 * - `'touch'`: native on touch devices (coarse pointer), Astryx's calendar
 *   popover on mouse-driven ones
 * - `'always'`: native wherever the browser supports `<input type="date">`
 * - `'never'`: Astryx's own pickers everywhere
 *
 * @deprecated Use `adaptations` with `DateInputAdaptationValue`. The closest
 * policy for each shorthand is documented on `DateInputProps.nativePicker`.
 */
export type DateInputNativePicker = 'touch' | 'always' | 'never';

/**
 * The surfaces a resolved DateInput adaptation policy can name.
 *
 * The whole domain of `adaptations`, and each value is EXACT — it names one
 * tree, on any pointer:
 * - `'native'`: the platform's own control (`<input type="date">`), the surface
 *   `nativePicker` used to be the only way to ask for
 * - `'popover'`: the typable field with the calendar in an anchored popover
 * - `'bottom-sheet'`: the touch field with the swipe-paged month sheet
 *
 * Spelled as literals rather than aliased to an internal type, so a consumer's
 * compiler diagnostics never name something they cannot import.
 */
export type DateInputAdaptationValue = 'native' | 'popover' | 'bottom-sheet';

/** Runtime domain for `adaptations`, so an untyped caller is rejected too. */
const DATE_INPUT_ADAPTATION_VALUES = [
  'native',
  'popover',
  'bottom-sheet',
] as const satisfies ReadonlyArray<DateInputAdaptationValue>;

/** Diagnostic root for every `adaptations` failure on this component. */
const ADAPTATIONS_PATH = '<DateInput adaptations>';

export type DateInputFormat = Extract<
  TimestampFormat,
  'date' | 'date_long' | 'date_weekday' | 'system_date'
>;

// Re-export shared types for convenience

export type {
  InputStatus as DateInputStatus,
  InputStatusType as DateInputStatusType,
} from '../Field';
import {mergeProps, isFocusDetached} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import {stableClassName} from '../naming';
import {useLocale, useTranslator} from '../i18n';

import {useMergedRefs} from '../hooks/useMergedRefs';
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
   * Deprecated shorthand for choosing a picker surface. Existing calls keep
   * their released behavior, but new code should use `adaptations` so the
   * server-rendered surface and every environment rule are explicit.
   *
   * For the initial render and while the field is idle, map each value as
   * follows:
   * - `'touch'` → `{default: 'popover', rules: [{when: {pointer: 'coarse'}, value: 'native'}]}`
   * - `'always'` → `{default: 'native', rules: []}`
   * - `'never'` → `{default: 'popover', rules: [{when: {pointer: 'coarse'}, value: 'bottom-sheet'}]}`
   *
   * The new policy intentionally differs during an active interaction:
   * `adaptations` holds the current tree until the field is idle, while
   * `nativePicker="touch"` and `nativePicker="never"` keep their released
   * immediate pointer-switch behavior.
   *
   * `format` and `placeholder` still apply in native mode. `min`, `max`, and
   * `dateConstraints` remain supported and are enforced on commit. A legacy
   * call that combines `'touch'` or `'always'` with `numberOfMonths={2}` or an
   * explicit `weekStartsOn` has no exact `adaptations` equivalent because the
   * platform picker cannot draw those options; keep the shorthand until that
   * callsite can choose an exact supported surface.
   *
   * Mutually exclusive with `adaptations`.
   *
   * @default 'touch'
   * @deprecated Use `adaptations`; the mapping above preserves idle surface
   * selection when the exact surfaces support the field's other props.
   */
  nativePicker?: DateInputNativePicker;

  /**
   * Environment-conditioned surface policy: which of the three pickers this
   * field renders, decided by rules you write instead of by the pointer alone.
   *
   * `default` is the server-rendered, hydration, and no-match value; ordered
   * `rules` map conditions to the same three values, and the LAST matching rule
   * wins — condition shape creates no specificity. Width names resolve against
   * the NEAREST Theme's width points, `from` is inclusive, `below` is
   * exclusive, and the fields of one `when` are ANDed. An empty `rules` array
   * is well-formed and pins the field to `default` everywhere.
   *
   * Each value is exact and holds on any pointer, which is the difference from
   * `nativePicker`: `'bottom-sheet'` presents the touch sheet to a mouse if
   * that is what the policy says, and `'popover'` keeps the typable field on a
   * phone.
   *
   * A policy naming `'native'` anywhere — `default` or ANY rule, matched today
   * or not — is checked against the props the platform picker cannot express:
   * `numberOfMonths={2}` and an explicit `weekStartsOn` throw at render, rather
   * than being silently dropped on whichever device selects that rule. `min`,
   * `max` and `dateConstraints` stay supported: native mode forwards the bounds
   * and refuses an out-of-range commit.
   *
   * Mutually exclusive with `nativePicker` — the two name the same choice, so
   * passing both defined values throws before a surface opens. An explicitly
   * spread `undefined` is not a conflict.
   *
   * While the field is in use the resolved surface is held: a rule boundary
   * crossed during an open picker, or while the field has focus, applies once
   * the surface has closed and focus has left, so a rotation never swallows a
   * half-typed date.
   *
   * @example
   * ```
   * <DateInput
   *   label="Event date"
   *   value={date}
   *   onChange={setDate}
   *   adaptations={{
   *     default: 'popover',
   *     rules: [
   *       {when: {width: {below: 'md'}, pointer: 'coarse'}, value: 'bottom-sheet'},
   *       {when: {pointer: 'coarse', width: {below: 'sm'}}, value: 'native'},
   *     ],
   *   }}
   * />
   * ```
   */
  adaptations?: ComponentAdaptations<DateInputAdaptationValue>;
}

/**
 * `nativePicker` and `adaptations` name the same choice, so accepting both
 * would make precedence — not the caller — decide the surface.
 *
 * Checked on `undefined`, not on presence: spreading a props bag that carries
 * an explicit `adaptations: undefined` beside a real `nativePicker` is an
 * ordinary call, not a conflict (spec:AST-031 FR6).
 */
function assertExclusiveSurfaceProps(
  nativePicker: DateInputNativePicker | undefined,
  adaptations: ComponentAdaptations<DateInputAdaptationValue> | undefined,
): void {
  if (nativePicker !== undefined && adaptations !== undefined) {
    throw new Error(
      '<DateInput> received both `nativePicker` and `adaptations`, which select the same surface. Pass `adaptations` for an environment-conditioned policy — its `native` value is what `nativePicker` reaches — or `nativePicker` for the pointer-driven shorthand.',
    );
  }
}

/**
 * Reject a policy that names a surface it has also made impossible to draw.
 *
 * The platform picker has no month grid and no week-start control, so
 * `numberOfMonths={2}` or an explicit `weekStartsOn` beside a `'native'` value
 * is a contradiction. Every authored value is checked — `default` and EVERY
 * rule, including ones today's viewport cannot match — so the failure lands on
 * the author's machine instead of on the one phone that selects that rule
 * (spec:AST-031 IR3). It throws in production as well as development: a
 * silently dropped week start is a wrong calendar, not a warning.
 *
 * `weekStartsOn` is rejected on PRESENCE, not on value: `weekStartsOn={0}`
 * states Sunday, and the platform picker follows the OS locale whatever that
 * says. `numberOfMonths={1}` is the default shape and passes.
 *
 * `min`, `max` and `dateConstraints` are deliberately NOT rejected — native
 * mode forwards the bounds and enforces every constraint on commit — which is
 * also why the legacy `nativePicker` path keeps its own quieter fallback: it
 * predates this policy and drops what it cannot draw.
 */
function assertNativeSurfaceIsDrawable(
  adaptations: ComponentAdaptations<DateInputAdaptationValue>,
  {numberOfMonths, weekStartsOn}: DateInputProps,
): void {
  const conflicts: string[] = [];
  if (numberOfMonths !== undefined && numberOfMonths !== 1) {
    conflicts.push(
      `\`numberOfMonths={${numberOfMonths}}\` (the platform picker has no month grid to widen)`,
    );
  }
  if (weekStartsOn !== undefined) {
    conflicts.push(
      `\`weekStartsOn={${JSON.stringify(weekStartsOn)}}\` (the platform picker follows the OS locale's first day of week)`,
    );
  }
  if (conflicts.length === 0) {
    return;
  }
  forEachAuthoredAdaptationValue(
    adaptations,
    ADAPTATIONS_PATH,
    (value, valuePath) => {
      if (value === 'native') {
        throw new Error(
          `${valuePath} is "native", which cannot honor ${conflicts.join(
            ' or ',
          )}. Use "popover" or "bottom-sheet" for that value, or drop the prop.`,
        );
      }
    },
  );
}

/** Run the latch's focus handler after the caller's own, never instead of it. */
function composeFocusHandler(
  callerHandler: React.FocusEventHandler<HTMLElement> | undefined,
  latchHandler: (event: React.FocusEvent<HTMLElement>) => void,
): React.FocusEventHandler<HTMLElement> {
  return event => {
    callerHandler?.(event);
    latchHandler(event);
  };
}

/**
 * The pointer that decides which surface a `DateInput` renders.
 *
 * `pointer: coarse` is the *primary* pointing device, which is what makes it
 * the whole test. A touchscreen laptop reports `fine` (its trackpad) with
 * `any-pointer: coarse` alongside, so it keeps the typable field — right,
 * because its keyboard is there. A tablet reports `coarse` and gets the
 * picker, at any width. There is deliberately no width bound: it would only
 * re-exclude the tablets, since a narrowed desktop window is still a mouse.
 *
 * Deliberately NOT exported. It was, briefly, on the theory that an app might
 * want to ask the same question and lay out to match — but nothing asked, and
 * six other core components (CheckboxInput, ChatComposerInput, ...) just
 * write `@media (pointer: coarse)` inline rather than sharing a constant. An
 * export is additive later and awkward to withdraw, so it waits for a real
 * caller.
 */
const TOUCH_POINTER_QUERY = '(pointer: coarse)';

/**
 * The pointer-driven field: a text input you can type into, with a calendar
 * in a popover beside it. `DateInput` renders this whenever the primary
 * pointer is not a finger — see {@link TOUCH_POINTER_QUERY}.
 */
function PointerDateField({
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
  width,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DateInputProps) {
  const t = useTranslator();
  const locale = useLocale();
  const isEffectivelyRequired = useResolvedRequired({isRequired, isOptional});
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

  // Check if current input is valid (for styling purposes)
  const isInputValid =
    pendingInput === null || !pendingInput.trim()
      ? true
      : parseDateInput(pendingInput, locale) !== null;

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
          popover.isOpen
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
            state: popover.isOpen ? 'expanded' : 'collapsed',
          })}
        />
      </button>
      <input
        ref={useMergedRefs(ref, inputRef)}
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

PointerDateField.displayName = 'PointerDateField';

/**
 * A date picker whose `adaptations` policy selects an exact native, popover, or
 * bottom-sheet surface for the server and for ordered width/pointer rules.
 *
 * The surfaces share one value contract but use separate trees: the native
 * browser/OS control, a typable field with an anchored calendar, or a read-only
 * field opening Astryx's swipe-paged month sheet. The resolved tree is held
 * while the field is in use so a resize or rotation cannot discard a draft.
 *
 * Without `adaptations`, the deprecated `nativePicker` compatibility path keeps
 * its released pointer-driven behavior.
 *
 * ## Why a runtime switch and not CSS
 *
 * The surfaces are structurally different, so rendering all of them and hiding
 * the inactive ones would duplicate controls, ids, dialogs, effects, and focus
 * targets. One exact policy value selects the mounted tree instead.
 *
 * ## Hydration
 *
 * `adaptations.default` is the server-rendered and hydration surface. The
 * browser publishes the last matching rule after hydration, without asking the
 * server to guess a viewport or pointer (spec:AST-031 FR3).
 *
 * @example
 * ```
 * <DateInput
 *   label="Event date"
 *   value={date}
 *   onChange={setDate}
 *   adaptations={{
 *     default: 'popover',
 *     rules: [{when: {pointer: 'coarse'}, value: 'native'}],
 *   }}
 * />
 * ```
 */
export function DateInput({adaptations, ...props}: DateInputProps) {
  // Both props before any hook: a call that names the surface twice is a
  // mistake to report, not a precedence to resolve.
  assertExclusiveSurfaceProps(props.nativePicker, adaptations);

  const isTouch = useMediaQuery(TOUCH_POINTER_QUERY);
  // Called unconditionally, with `undefined` for a call site that has no
  // policy: the resolver then subscribes to nothing and publishes nothing, so
  // the legacy path below runs exactly the media query it always did.
  const {value: adaptedSurface} = useComponentAdaptations(adaptations, {
    path: ADAPTATIONS_PATH,
    values: DATE_INPUT_ADAPTATION_VALUES,
  });
  const {surface, onFocusCapture, onBlurCapture} =
    useAdaptationSurfaceLatch(adaptedSurface);

  if (adaptations !== undefined) {
    assertNativeSurfaceIsDrawable(adaptations, props);
    // The three surfaces are separate trees, so the latch's focus handlers ride
    // the field root each of them spreads its pass-through props onto.
    const surfaceProps: DateInputProps = {
      ...props,
      onFocusCapture: composeFocusHandler(props.onFocusCapture, onFocusCapture),
      onBlurCapture: composeFocusHandler(props.onBlurCapture, onBlurCapture),
    };
    if (surface === 'native') {
      return <NativeDateField {...surfaceProps} />;
    }
    if (surface === 'bottom-sheet') {
      return <TouchDateField {...surfaceProps} />;
    }
    // 'popover' — and the only other reachable value, since a policy always
    // resolves to one of its own admitted values.
    return <PointerDateField {...surfaceProps} />;
  }

  const nativePicker = props.nativePicker ?? 'touch';

  // The platform's picker, where the consumer asked for it — see the
  // `nativePicker` prop for what that trades away.
  if (nativePicker === 'always' || (nativePicker === 'touch' && isTouch)) {
    return <NativeDateField {...props} />;
  }
  return isTouch ? (
    <TouchDateField {...props} />
  ) : (
    <PointerDateField {...props} />
  );
}

DateInput.displayName = 'DateInput';
