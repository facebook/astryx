// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DateInputMobile.tsx
 * @input Uses React, Field, BottomSheet, Button, Icon, Calendar hooks, MonthScroller, MonthYearWheels
 * @output Exports DateInputMobile, DateInputMobileProps, DateInputMobileLabels
 * @position Lab component entry; consumed by index.ts, tested by DateInputMobile.test.tsx
 *
 * The touch counterpart to core's DateInput. DateInput is a text field with a
 * calendar popover — a shape built around a keyboard. This one has no text
 * entry at all: the surface IS the calendar, months are chosen by scrolling
 * through them, and the far jumps that scrolling is bad at are handled by two
 * wheels behind the header title.
 *
 * Three ideas, in the order they matter:
 *
 * 1. One month per screen. Every pane is the height of the scrollport and
 *    snaps to its start, so the picker is a fixed height and there is no
 *    resting position that shows half of two months. See MonthScroller.
 * 2. Scrolling is the month control. No chevrons: the neighbouring months are
 *    a flick away in the direction you already think of them.
 * 3. The title is the escape hatch. Tap it and the same box becomes a month
 *    wheel and a year wheel — a flick each to reach 2019 instead of forty.
 *
 * Deliberately not shared with DateInput yet. When this graduates, the
 * responsive story is one component that picks the surface from the pointer
 * type; keeping them apart while the interaction is still moving avoids
 * churning a stable core component.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/DateInputMobile/DateInputMobile.doc.mjs (props table, features)
 * - /packages/lab/src/DateInputMobile/DateInputMobile.test.tsx (tests)
 * - /packages/lab/src/DateInputMobile/index.ts (exports if types change)
 * - /packages/lab/src/index.ts (package barrel)
 * - /apps/storybook/stories/DateInputMobile.stories.tsx (stories)
 */

import {useCallback, useId, useMemo, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
import {Button} from '@astryxdesign/core/Button';
import {
  Field,
  InputClearButton,
  inputWrapperStyles,
  inputStatusBorderStyles,
  type InputStatus,
} from '@astryxdesign/core/Field';
import {Icon} from '@astryxdesign/core/Icon';
import {
  useCalendarConstraints,
  useCalendarDays,
} from '@astryxdesign/core/Calendar';
import {
  colorVars,
  spacingVars,
  radiusVars,
  sizeVars,
  borderVars,
  fontWeightVars,
  typeScaleVars,
  durationVars,
  easeVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {
  focusOutlineStyles,
  mergeProps,
  type DayOfWeek,
  type ISODateString,
  type SharedDateFormat,
  formatSharedDate,
  plainDateFromISO,
  plainDateToday,
  plainDateFormat,
  DATE_FORMAT_MONTH_YEAR,
} from '@astryxdesign/core/utils';
import {MonthScroller, type MonthScrollerHandle} from './MonthScroller';
import {MonthYearWheels} from './MonthYearWheels';
import {
  DEFAULT_MONTH_REACH,
  clampIndex,
  fromMonthIndex,
  monthIndexOf,
} from './monthGeometry';
import {dateInputMobileVars, dateInputMobileGeometry} from './tokens.stylex';

const styles = stylex.create({
  // ---- trigger (the closed field) ----
  trigger: {
    // Comfortably tappable, unlike the 32px desktop control.
    blockSize: dateInputMobileVars['--date-input-mobile-day-size'],
    minInlineSize: 180,
    gap: spacingVars['--spacing-2'],
  },
  triggerButton: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    padding: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    textAlign: 'start',
    cursor: 'pointer',
    fontSize: typeScaleVars['--text-body-size'],
    color: colorVars['--color-text-primary'],
  },
  triggerButtonDisabled: {
    cursor: 'not-allowed',
    color: colorVars['--color-text-disabled'],
  },
  triggerValue: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  triggerPlaceholder: {
    color: colorVars['--color-text-secondary'],
  },

  // ---- picker surface ----
  surface: {
    display: 'flex',
    flexDirection: 'column',
    // Every part of the surface is a fixed height, so the whole thing is too:
    // header + weekday row + body. Nothing here reflows when the month
    // changes or the wheels open.
    inlineSize: '100%',
  },
  surfaceFramed: {
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-surface'],
    padding: spacingVars['--spacing-2'],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    blockSize: sizeVars['--size-element-lg'],
    paddingInline: spacingVars['--spacing-1'],
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    blockSize: '100%',
    paddingInline: spacingVars['--spacing-2'],
    marginInlineStart: `calc(-1 * ${spacingVars['--spacing-2']})`,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: {
      default: 'transparent',
      '@media (hover: hover)': {
        default: 'transparent',
        ':hover': colorVars['--color-overlay-hover'],
      },
      ':active': colorVars['--color-overlay-pressed'],
    },
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  titleChevron: {
    display: 'inline-flex',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  titleChevronOpen: {
    transform: 'rotate(180deg)',
  },
  weekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    blockSize: sizeVars['--size-element-sm'],
    alignItems: 'center',
  },
  weekdaysHidden: {
    // Hidden, not unmounted: the row still owes the surface its height, or
    // opening the wheels would make the picker shorter.
    visibility: 'hidden',
  },
  weekday: {
    textAlign: 'center',
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },

  // ---- body: calendar and wheels share one cell ----
  body: {
    display: 'grid',
    blockSize: dateInputMobileGeometry.paneBlockSize,
    position: 'relative',
  },
  panel: {
    gridArea: '1 / 1',
    minWidth: 0,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  panelHidden: {
    // visibility (not display) keeps the month scroller laid out while the
    // wheels are up, so its scroll offset survives the round trip and the
    // wheels can steer it before it is shown again.
    visibility: 'hidden',
    opacity: 0,
    pointerEvents: 'none',
  },
  sheetBody: {
    paddingInline: spacingVars['--spacing-2'],
    // Clears the sheet's floating grab handle, which is out of flow and so
    // costs no layout space of its own — the content wrapper owes it.
    paddingBlockStart: spacingVars['--spacing-6'],
    paddingBlockEnd: spacingVars['--spacing-2'],
  },
});

/**
 * User-visible strings. Lab components do not ship translation keys, so these
 * are props with English defaults; they move into core's catalog when the
 * component graduates.
 */
export interface DateInputMobileLabels {
  /** Shown in the closed field before a date is chosen. */
  placeholder: string;
  /** Action that jumps the scroller back to the current month. */
  today: string;
  /** Action that closes the month/year wheels. */
  done: string;
  /** Accessible name of the header title button. */
  chooseMonthYear: string;
  /** Accessible name of the month wheel. */
  month: string;
  /** Accessible name of the year wheel. */
  year: string;
  /** Accessible name of the sheet. */
  dialog: string;
  /** Accessible name of the clear button. */
  clear: string;
}

const DEFAULT_LABELS: DateInputMobileLabels = {
  placeholder: 'Select a date',
  today: 'Today',
  done: 'Done',
  chooseMonthYear: 'Choose month and year',
  month: 'Month',
  year: 'Year',
  dialog: 'Choose a date',
  clear: 'Clear date',
};

export interface DateInputMobileProps extends Omit<
  BaseProps,
  'onChange' | 'defaultValue'
> {
  /** Label text for the field (required for accessibility). */
  label: string;
  /** Visually hide the label; it stays available to screen readers. */
  isLabelHidden?: boolean;
  /** Description shown between label and field. */
  description?: string;
  /** The selected date, ISO `YYYY-MM-DD`. */
  value?: ISODateString;
  /** Fired with the new date, or undefined when cleared. */
  onChange?: (value: ISODateString | undefined) => void;
  /** Earliest selectable date; also bounds the scroller and the wheels. */
  min?: ISODateString;
  /** Latest selectable date; also bounds the scroller and the wheels. */
  max?: ISODateString;
  /** Extra constraints. A date is disabled if ANY function returns false. */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
  /** First column of the week (0 = Sunday). @default 0 */
  weekStartsOn?: DayOfWeek;
  /** How the committed value reads in the closed field. @default 'date_long' */
  format?: SharedDateFormat;
  /**
   * Where the picker lives.
   * - `'sheet'`: a tappable field that opens the picker in a BottomSheet
   * - `'inline'`: the picker itself, framed, with no field or sheet
   * @default 'sheet'
   */
  presentation?: 'sheet' | 'inline';
  /** Show a clear button in the field once a date is set. @default false */
  hasClear?: boolean;
  /** Disables the field. */
  isDisabled?: boolean;
  /** Marks the field required. */
  isRequired?: boolean;
  /** Marks the field optional. */
  isOptional?: boolean;
  /** Status indicator and message. */
  status?: InputStatus;
  /** Overrides for user-visible strings. */
  labels?: Partial<DateInputMobileLabels>;
}

/**
 * A touch-first date picker: a continuously scrolling, snap-paged calendar
 * with month/year wheels behind the header title.
 *
 * @example
 * ```
 * const [date, setDate] = useState<ISODateString>();
 * <DateInputMobile label="Event date" value={date} onChange={setDate} />
 * ```
 *
 * @example
 * ```
 * // No field, no sheet — just the picker.
 * <DateInputMobile
 *   label="Event date"
 *   isLabelHidden
 *   presentation="inline"
 *   value={date}
 *   onChange={setDate}
 * />
 * ```
 */
export function DateInputMobile({
  label,
  isLabelHidden = false,
  description,
  value,
  onChange,
  min,
  max,
  dateConstraints,
  weekStartsOn = 0,
  format = 'date_long',
  presentation = 'sheet',
  hasClear = false,
  isDisabled = false,
  isRequired = false,
  isOptional = false,
  status,
  labels: labelOverrides,
  xstyle,
  className,
  style,
  ...rest
}: DateInputMobileProps) {
  const id = useId();
  const labelID = useId();
  const valueID = useId();
  const labels = {...DEFAULT_LABELS, ...labelOverrides};
  const today = useMemo(() => plainDateToday(), []);
  const selectedDate = useMemo(
    () => (value != null ? plainDateFromISO(value) : null),
    [value],
  );

  // The reachable range. Explicit bounds win; otherwise the scroller reaches a
  // century in each direction from wherever it opened. Anchored once, in a
  // state initializer: recomputing it as the selection moves would shift every
  // pane's scroll offset under the user mid-gesture.
  const [anchorMonthIndex] = useState(() =>
    monthIndexOf(value != null ? plainDateFromISO(value) : plainDateToday()),
  );
  const minMonthIndex =
    min != null
      ? monthIndexOf(plainDateFromISO(min))
      : anchorMonthIndex - DEFAULT_MONTH_REACH;
  const maxMonthIndex =
    max != null
      ? monthIndexOf(plainDateFromISO(max))
      : anchorMonthIndex + DEFAULT_MONTH_REACH;

  const [monthIndex, setMonthIndex] = useState(() =>
    clampIndex(anchorMonthIndex, minMonthIndex, maxMonthIndex),
  );
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const scrollerHandle = useRef<MonthScrollerHandle | null>(null);

  const {isDateDisabled} = useCalendarConstraints({min, max, dateConstraints});

  const {year, month} = fromMonthIndex(monthIndex);
  // Only the weekday names are wanted here; the panes build their own grids.
  // Taking them from the same hook keeps the header row and the columns
  // rotating together when weekStartsOn changes.
  const {dayNames} = useCalendarDays({year, month, weekStartsOn});
  const monthYearLabel = plainDateFormat(
    {year, month, day: 1},
    DATE_FORMAT_MONTH_YEAR,
  );

  const handleSelect = useCallback(
    (next: ISODateString) => {
      onChange?.(next);
      setIsSheetOpen(false);
    },
    [onChange],
  );

  const handleToday = useCallback(() => {
    const target = clampIndex(
      monthIndexOf(today),
      minMonthIndex,
      maxMonthIndex,
    );
    setMonthIndex(target);
    scrollerHandle.current?.scrollToMonth(target, 'smooth');
  }, [today, minMonthIndex, maxMonthIndex]);

  // A wheel commit steers the scroller immediately, even though it is behind
  // the wheels: it keeps its layout box while hidden, so by the time the
  // wheels close it is already resting on the new month.
  const handleWheelChange = useCallback((next: number) => {
    setMonthIndex(next);
    scrollerHandle.current?.scrollToMonth(next, 'auto');
  }, []);

  const surface = (
    <div
      {...stylex.props(
        styles.surface,
        presentation === 'inline' && styles.surfaceFramed,
      )}>
      <div {...stylex.props(styles.header)}>
        <button
          type="button"
          onClick={() => setIsWheelOpen(open => !open)}
          aria-expanded={isWheelOpen}
          aria-label={`${monthYearLabel}, ${labels.chooseMonthYear}`}
          {...stylex.props(styles.title, focusOutlineStyles.focusVisible)}>
          <span>{monthYearLabel}</span>
          <span
            {...stylex.props(
              styles.titleChevron,
              isWheelOpen && styles.titleChevronOpen,
            )}>
            <Icon icon="chevronDown" size="sm" color="secondary" />
          </span>
        </button>
        {isWheelOpen ? (
          <Button
            variant="ghost"
            size="sm"
            label={labels.done}
            onClick={() => setIsWheelOpen(false)}
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            label={labels.today}
            onClick={handleToday}
          />
        )}
      </div>

      {/* Decorative: each day carries its weekday in its accessible name, so
          this row is not a header row for assistive technology — and it must
          live outside the scroller, or it would scroll away with the month. */}
      <div
        aria-hidden="true"
        {...stylex.props(
          styles.weekdays,
          isWheelOpen && styles.weekdaysHidden,
        )}>
        {dayNames.map(name => (
          <div key={name} {...stylex.props(styles.weekday)}>
            {name}
          </div>
        ))}
      </div>

      <div {...stylex.props(styles.body)}>
        <div
          data-panel="calendar"
          // `inert` as well as the hidden styling: the panel keeps its layout
          // box (so the scroller holds its position and the wheels can steer
          // it), which means without this it would still be tabbable and
          // hit-testable behind the panel on top.
          inert={isWheelOpen ? true : undefined}
          {...stylex.props(styles.panel, isWheelOpen && styles.panelHidden)}>
          <MonthScroller
            key={`${minMonthIndex}:${maxMonthIndex}`}
            handleRef={scrollerHandle}
            minMonthIndex={minMonthIndex}
            maxMonthIndex={maxMonthIndex}
            initialMonthIndex={monthIndex}
            onVisibleMonthChange={setMonthIndex}
            selectedDate={selectedDate}
            today={today}
            isDateDisabled={isDateDisabled}
            weekStartsOn={weekStartsOn}
            onSelect={handleSelect}
          />
        </div>
        <div
          data-panel="wheels"
          inert={isWheelOpen ? undefined : true}
          {...stylex.props(styles.panel, !isWheelOpen && styles.panelHidden)}>
          <MonthYearWheels
            monthIndex={monthIndex}
            minMonthIndex={minMonthIndex}
            maxMonthIndex={maxMonthIndex}
            onChange={handleWheelChange}
            monthLabel={labels.month}
            yearLabel={labels.year}
            isActive={isWheelOpen}
          />
        </div>
      </div>
    </div>
  );

  if (presentation === 'inline') {
    return (
      <Field
        label={label}
        isLabelHidden={isLabelHidden}
        description={description}
        inputID={id}
        isOptional={isOptional}
        isRequired={isRequired}
        isDisabled={isDisabled}
        status={status}>
        <div
          id={id}
          {...rest}
          {...mergeProps(stylex.props(xstyle), className, style)}>
          {surface}
        </div>
      </Field>
    );
  }

  const displayValue =
    value != null ? formatSharedDate(plainDateFromISO(value), format) : null;

  return (
    <Field
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      labelID={labelID}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={status}>
      <div
        {...rest}
        {...mergeProps(
          stylex.props(
            inputWrapperStyles.base,
            styles.trigger,
            isDisabled && inputWrapperStyles.disabled,
            status && inputStatusBorderStyles[status.type],
            xstyle,
          ),
          className,
          style,
        )}>
        <button
          type="button"
          id={id}
          disabled={isDisabled}
          onClick={() => setIsSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isSheetOpen}
          // Field renders a real <label for>, which would name this button
          // "Ship date" and drop its contents from the accessible name — so
          // the chosen date, the whole point of the control, would never be
          // announced. Naming it from both parts restores it: "Ship date,
          // March 21, 2026".
          aria-labelledby={`${labelID} ${valueID}`}
          {...stylex.props(
            styles.triggerButton,
            isDisabled && styles.triggerButtonDisabled,
            focusOutlineStyles.focusVisible,
          )}>
          <Icon icon="calendar" size="sm" color="secondary" />
          <span
            id={valueID}
            {...stylex.props(
              styles.triggerValue,
              displayValue == null && styles.triggerPlaceholder,
            )}>
            {displayValue ?? labels.placeholder}
          </span>
        </button>
        {hasClear && value != null && !isDisabled && (
          <InputClearButton
            label={labels.clear}
            onClick={() => onChange?.(undefined)}
          />
        )}
      </div>

      <BottomSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        label={labels.dialog}
        // The picker is a fixed height by construction, so the sheet should be
        // exactly as tall as it is rather than claiming a viewport budget.
        height="hug">
        <div {...stylex.props(styles.sheetBody)}>{surface}</div>
      </BottomSheet>
    </Field>
  );
}

DateInputMobile.displayName = 'DateInputMobile';
