// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Calendar.tsx
 * @input Uses React useState, useMemo, useCallback, hooks
 * @output Exports Calendar component and related types
 * @position Core implementation; forwards DOM ref and exposes navigation via
 *   handleRef
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Calendar/Calendar.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Calendar/Calendar.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Calendar/index.ts (exports if types change)
 * - /apps/storybook/stories/Calendar.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Calendar/ (showcase blocks)
 */

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {useAnnounce, useGridFocus} from '../hooks';
import {
  useCalendarDays,
  useCalendarConstraints,
  type CalendarDay,
} from './hooks';
import {
  calendarStyles,
  monthGridStyles,
  dayCellStyles,
  dayCellTheme,
} from './styles';
import {
  type PlainDate,
  plainDateFromISO,
  plainDateToISO,
  plainDateToDate,
  plainDateToday,
  plainDateSetFirstOfMonth,
  plainDateAddMonths,
  plainDateAddDays,
  plainDateIsBefore,
  plainDateIsEqual,
  plainDateGetWeekNumber,
  plainDateFormat,
  DATE_FORMAT_WITH_WEEKDAY,
  DATE_FORMAT_MONTH_YEAR,
} from '../utils/plainDate';
import {mergeProps, composeEventHandlers} from '../utils';
import {
  computeDayCellState,
  computeRangeRounding,
  computePreviewRounding,
  computeDayNeighborContinuity,
  isEndpoint,
  type DayNeighborContinuity,
} from './dayCellUtils';

// =============================================================================
// Types
// =============================================================================

export type {
  ISODateString,
  DayOfWeek,
  DayOfWeekName,
  DateRange,
} from '../utils/dateTypes';
import type {
  ISODateString,
  DayOfWeek,
  DayOfWeekName,
  DateRange,
} from '../utils/dateTypes';
import {normalizeDayOfWeek} from '../utils/dateTypes';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

/** Imperative handle for Calendar handleRef */

export interface CalendarHandle {
  /** Navigate the calendar to show the month containing the given date */
  navigateTo: (date: ISODateString) => void;
}

// ─── Base Props (shared across all modes) ─────────────────────

interface CalendarBaseProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the calendar root element. */
  ref?: React.Ref<HTMLDivElement>;
  /** Imperative handle ref for calendar navigation. */
  handleRef?: React.Ref<CalendarHandle>;
  /** Number of months to display (default: 1) */
  numberOfMonths?: 1 | 2;

  /** Minimum selectable date in ISO format */
  min?: ISODateString;

  /** Maximum selectable date in ISO format */
  max?: ISODateString;

  /**
   * Custom date constraint functions. Date is disabled if ANY function returns false.
   * Use for complex rules like "weekdays only" or "no holidays".
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;

  /**
   * Controlled focus date (which month is visible).
   * If not provided, defaults to selected date or today.
   */
  focusDate?: ISODateString;

  /** Callback when visible month changes via navigation */
  onFocusDateChange?: (focusDate: ISODateString) => void;

  /**
   * Show days from adjacent months (grayed out).
   * Default: true
   */
  hasOutsideDays?: boolean;

  /**
   * Show ISO week numbers in a side column.
   * Default: false
   */
  hasWeekNumbers?: boolean;

  /**
   * Use variable rows per month vs. fixed 6-row grid.
   * Default: false (fixed 6 rows for consistent height)
   */
  hasVariableRowCount?: boolean;

  /**
   * First day of week. Accepts a number (0 = Sunday … 6 = Saturday) or a
   * three-letter day name ('sun'–'sat', case-insensitive) for readability.
   * Default: 0 (Sunday)
   */
  weekStartsOn?: DayOfWeek | DayOfWeekName;
}

// ─── Mode-specific Props (discriminated union) ────────────────

interface CalendarSingleProps extends CalendarBaseProps {
  /** Selection mode */
  mode?: 'single';

  /** Selected date in ISO format (YYYY-MM-DD) */
  value?: ISODateString;

  /** Default value for uncontrolled mode */
  defaultValue?: ISODateString;

  /** Callback when date is selected */
  onChange?: (value: ISODateString, valueAsDate: Date) => void;
}

interface CalendarRangeProps extends CalendarBaseProps {
  /** Selection mode */
  mode: 'range';

  /** Selected date range */
  value?: DateRange;

  /** Default value for uncontrolled mode */
  defaultValue?: DateRange;

  /** Callback when range is selected */
  onChange?: (value: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

// =============================================================================
// Main Component
// =============================================================================

/**
 * A calendar component for selecting dates or date ranges.
 *
 * @example
 * ```
 * <Calendar value={selectedDate} onChange={setSelectedDate} />
 * ```
 */
export function Calendar({ref, ...props}: CalendarProps) {
  const t = useTranslator();
  const {
    handleRef,
    mode = 'single',
    value,
    defaultValue,
    onChange,
    numberOfMonths: numberOfMonthsProp = 1,
    min,
    max,
    dateConstraints,
    focusDate: focusDateProp,
    onFocusDateChange,
    hasOutsideDays = true,
    hasWeekNumbers = false,
    hasVariableRowCount = false,
    weekStartsOn: weekStartsOnProp = 0,
    xstyle,
    className,
    style,
    onKeyDown,
    ...rest
  } = props;

  // Normalize `weekStartsOn` (number or three-letter day name) to a numeric
  // DayOfWeek so all downstream date math keeps working with an index.
  const weekStartsOn = normalizeDayOfWeek(weekStartsOnProp);

  // `numberOfMonths` is typed `1 | 2`; defensively clamp anything else that
  // slips through at runtime to 1 so `Array.from({length})` can't render an
  // absurd number of month grids (e.g. `numberOfMonths={1000}`).
  const numberOfMonths = numberOfMonthsProp === 2 ? 2 : 1;

  // Today's date (memoized)
  const today = useMemo(() => plainDateToday(), []);

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<
    ISODateString | DateRange | undefined
  >(defaultValue);

  // Range selection in progress (first click made, waiting for second)
  const [rangeSelectionStart, setRangeSelectionStart] =
    useState<ISODateString | null>(null);

  // Hovered date for range preview
  const [hoveredDate, setHoveredDate] = useState<ISODateString | null>(null);

  // Pending focus target after month navigation
  const [pendingFocus, setPendingFocus] = useState<ISODateString | null>(null);

  // Determine effective value
  const effectiveValue = value !== undefined ? value : internalValue;

  // Focus date state (which month is visible)
  const [internalFocusDate, setInternalFocusDate] = useState<PlainDate>(() => {
    if (focusDateProp) {
      return plainDateFromISO(focusDateProp);
    }
    if (effectiveValue) {
      if (typeof effectiveValue === 'string') {
        return plainDateFromISO(effectiveValue);
      } else {
        return plainDateFromISO(effectiveValue.start);
      }
    }
    return plainDateToday();
  });

  // Use controlled focusDate if callback is provided, otherwise use internal state
  const isControlledFocus =
    focusDateProp !== undefined && onFocusDateChange !== undefined;
  const focusDate = isControlledFocus
    ? plainDateFromISO(focusDateProp)
    : internalFocusDate;

  // Expose imperative handle for external navigation
  useImperativeHandle(
    handleRef,
    () => ({
      navigateTo: (date: ISODateString) => {
        if (isControlledFocus) {
          onFocusDateChange?.(date);
        } else {
          setInternalFocusDate(plainDateFromISO(date));
        }
      },
    }),
    [isControlledFocus, onFocusDateChange],
  );

  // Base month (first day of focus month)
  const baseMonth = useMemo(() => {
    return plainDateSetFirstOfMonth(focusDate);
  }, [focusDate]);

  // Generate visible months
  const visibleMonths = useMemo(() => {
    return Array.from({length: numberOfMonths}, (_, i) => {
      return plainDateAddMonths(baseMonth, i);
    });
  }, [baseMonth, numberOfMonths]);

  // Format month header
  const monthYearLabel = useMemo(() => {
    if (numberOfMonths === 1) {
      return plainDateFormat(visibleMonths[0], DATE_FORMAT_MONTH_YEAR);
    }
    return visibleMonths
      .map(m => plainDateFormat(m, DATE_FORMAT_MONTH_YEAR))
      .join(' – ');
  }, [visibleMonths, numberOfMonths]);

  // Announce the newly visible month to screen readers whenever it changes.
  // The visible month label (`<span>`) carries no live semantics, so paging the
  // grid — via the header prev/next buttons, keyboard grid paging (arrow keys
  // across a month boundary, PageUp/PageDown), the `navigateTo` handle, or a
  // controlled `focusDate` change — otherwise updates the grid silently. Keying
  // off `monthYearLabel` reuses the existing single-/multi-month formatting and
  // only fires when the visible month actually changes (so selecting a date,
  // which does not move the grid, stays silent). The first-render guard avoids
  // announcing the initial month on mount.
  const announce = useAnnounce();
  const isInitialRenderRef = useRef(true);
  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }
    announce(monthYearLabel);
  }, [monthYearLabel, announce]);

  // Determine if prev/next navigation is possible based on min/max
  const canNavigatePrevious = useMemo(() => {
    if (!min) {
      return true;
    }
    const minDate = plainDateFromISO(min);
    // Can't go back if min is in the current focus month
    return (
      minDate.year < baseMonth.year ||
      (minDate.year === baseMonth.year && minDate.month < baseMonth.month)
    );
  }, [min, baseMonth]);

  const canNavigateNext = useMemo(() => {
    if (!max) {
      return true;
    }
    const maxDate = plainDateFromISO(max);
    // Check against the last visible month, not just baseMonth
    const lastVisibleMonth = plainDateAddMonths(baseMonth, numberOfMonths - 1);
    return (
      maxDate.year > lastVisibleMonth.year ||
      (maxDate.year === lastVisibleMonth.year &&
        maxDate.month > lastVisibleMonth.month)
    );
  }, [max, baseMonth, numberOfMonths]);

  // Navigation handlers
  const navigateMonth = useCallback(
    (delta: number, focusedDate?: ISODateString, offset?: number) => {
      const newPd = plainDateAddMonths(baseMonth, delta);
      const newISO = plainDateToISO(newPd);

      // Calculate target focus date if a focused date was provided
      if (focusedDate) {
        const currentPd = plainDateFromISO(focusedDate);
        const daysToMove = offset ?? 7;
        const targetPd = plainDateAddDays(currentPd, delta * daysToMove);
        setPendingFocus(plainDateToISO(targetPd));
      }

      if (onFocusDateChange) {
        onFocusDateChange(newISO);
      } else {
        setInternalFocusDate(newPd);
      }
    },
    [baseMonth, onFocusDateChange],
  );

  // Escape key handler to cancel range selection
  const handleCalendarKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        mode === 'range' &&
        rangeSelectionStart !== null &&
        e.key === 'Escape'
      ) {
        setRangeSelectionStart(null);
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [mode, rangeSelectionStart],
  );

  // Day click handler
  const handleDayClick = useCallback(
    (date: PlainDate) => {
      const iso = plainDateToISO(date);

      if (mode === 'single') {
        setInternalValue(iso);
        (onChange as CalendarSingleProps['onChange'])?.(
          iso,
          plainDateToDate(date),
        );
      } else {
        // Range mode
        if (rangeSelectionStart === null) {
          // First click - start the range
          setRangeSelectionStart(iso);
        } else {
          // Second click - complete the range
          const startPd = plainDateFromISO(rangeSelectionStart);
          let start: ISODateString;
          let end: ISODateString;

          // Ensure start <= end
          if (plainDateIsBefore(date, startPd)) {
            start = iso;
            end = rangeSelectionStart;
          } else {
            start = rangeSelectionStart;
            end = iso;
          }

          const range: DateRange = {start, end};
          setInternalValue(range);
          setRangeSelectionStart(null);
          (onChange as CalendarRangeProps['onChange'])?.(range);
        }
      }
    },
    [mode, onChange, rangeSelectionStart],
  );

  return (
    <div
      ref={ref}
      {...rest}
      {...mergeProps(
        themeProps('calendar', {mode}),
        stylex.props(calendarStyles.calendar, xstyle),
        className,
        style,
      )}
      onKeyDown={composeEventHandlers(onKeyDown, handleCalendarKeyDown)}>
      {/* Header with navigation */}
      <div {...stylex.props(calendarStyles.header)}>
        <Button
          label={t('@astryx.calendar.previousMonth')}
          variant="ghost"
          icon={
            // Wrapper span (not Icon props): Icon's string mode clobbers
            // caller classNames, so the RTL mirror must live on its own
            // element.
            <span {...stylex.props(calendarStyles.navIcon)}>
              <Icon icon="chevronLeft" size="sm" color="inherit" />
            </span>
          }
          onClick={() => navigateMonth(-1)}
          isDisabled={!canNavigatePrevious}
          isIconOnly
        />

        <span {...stylex.props(calendarStyles.monthYearLabel)}>
          {monthYearLabel}
        </span>

        <Button
          label={t('@astryx.calendar.nextMonth')}
          variant="ghost"
          icon={
            <span {...stylex.props(calendarStyles.navIcon)}>
              <Icon icon="chevronRight" size="sm" color="inherit" />
            </span>
          }
          onClick={() => navigateMonth(1)}
          isDisabled={!canNavigateNext}
          isIconOnly
        />
      </div>
      {/* Month grids */}
      <div {...stylex.props(calendarStyles.monthsContainer)}>
        {visibleMonths.map(month => (
          <MonthGrid
            key={`${month.year}-${month.month}`}
            month={month}
            value={effectiveValue}
            mode={mode}
            rangeSelectionStart={rangeSelectionStart}
            hoveredDate={hoveredDate}
            min={min}
            max={max}
            dateConstraints={dateConstraints}
            hasOutsideDays={hasOutsideDays}
            hasWeekNumbers={hasWeekNumbers}
            hasVariableRowCount={hasVariableRowCount}
            weekStartsOn={weekStartsOn}
            onDayClick={handleDayClick}
            onDayHover={date =>
              setHoveredDate(date ? plainDateToISO(date) : null)
            }
            today={today}
            onNavigatePrevious={(focusedDate, offset) =>
              navigateMonth(-1, focusedDate, offset)
            }
            onNavigateNext={(focusedDate, offset) =>
              navigateMonth(1, focusedDate, offset)
            }
            pendingFocus={pendingFocus}
            onPendingFocusHandled={() => setPendingFocus(null)}
          />
        ))}
      </div>
    </div>
  );
}

Calendar.displayName = 'Calendar';

// =============================================================================
// MonthGrid (Private)
// =============================================================================

interface MonthGridProps {
  month: PlainDate;
  value: ISODateString | DateRange | undefined;
  mode: 'single' | 'range';
  rangeSelectionStart: ISODateString | null;
  hoveredDate: ISODateString | null;
  min?: ISODateString;
  max?: ISODateString;
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
  hasOutsideDays: boolean;
  hasWeekNumbers: boolean;
  hasVariableRowCount: boolean;
  weekStartsOn: DayOfWeek;
  onDayClick: (date: PlainDate) => void;
  onDayHover: (date: PlainDate | null) => void;
  today: PlainDate;
  onNavigatePrevious?: (focusedDate: ISODateString, offset: number) => void;
  onNavigateNext?: (focusedDate: ISODateString, offset: number) => void;
  pendingFocus?: ISODateString | null;
  onPendingFocusHandled?: () => void;
}

function MonthGrid({
  month,
  value,
  mode,
  rangeSelectionStart,
  hoveredDate,
  min,
  max,
  dateConstraints,
  hasOutsideDays,
  hasWeekNumbers,
  hasVariableRowCount,
  weekStartsOn,
  onDayClick,
  onDayHover,
  today,
  onNavigatePrevious,
  onNavigateNext,
  pendingFocus,
  onPendingFocusHandled,
}: MonthGridProps) {
  const year = month.year;

  // Use hooks for days generation and constraints
  const {days, weeks, dayNames} = useCalendarDays({
    year,
    month: month.month,
    weekStartsOn,
    hasVariableRowCount,
  });

  const {isDateDisabled} = useCalendarConstraints({
    min,
    max,
    dateConstraints,
  });

  // Parse selected date for roving tabindex priority
  const selectedDateForTabindex = useMemo(() => {
    if (mode === 'single' && value && typeof value === 'string') {
      return plainDateFromISO(value);
    }
    return null;
  }, [mode, value]);

  // Seed the initial roving tab stop for this month. useGridFocus owns the
  // live tab stop (see `hasRovingTabIndex` below) — it honors an existing
  // `tabindex="0"` and repairs/moves it thereafter — so this only decides
  // which day button starts tabbable. Priority: selected date (if visible and
  // enabled) > today (if visible and enabled) > first enabled in-month day.
  const seedTabbableIso = useMemo((): ISODateString | null => {
    if (selectedDateForTabindex) {
      const isSelectedInMonth =
        selectedDateForTabindex.year === year &&
        selectedDateForTabindex.month === month.month;
      if (isSelectedInMonth && !isDateDisabled(selectedDateForTabindex)) {
        return plainDateToISO(selectedDateForTabindex);
      }
    }

    const isTodayInMonth = today.year === year && today.month === month.month;
    if (isTodayInMonth && !isDateDisabled(today)) {
      return plainDateToISO(today);
    }

    for (const day of days) {
      if (!day.isOutside && !isDateDisabled(day.date)) {
        return day.iso;
      }
    }

    return null;
  }, [days, today, year, month.month, isDateDisabled, selectedDateForTabindex]);

  // Helper to get the focused date from the currently focused element.
  // Reads the machine-readable `data-date` (ISO) attribute rather than parsing
  // the human-readable `aria-label` with `new Date()`, which is locale/format
  // dependent and returns Invalid Date in non-English locales (e.g. fr-FR,
  // ja-JP), silently swallowing month-boundary arrow navigation (complex-4).
  const getFocusedDate = useCallback((): ISODateString | null => {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) {
      return null;
    }

    const iso = activeElement.getAttribute('data-date');
    if (!iso) {
      return null;
    }

    return iso as ISODateString;
  }, []);

  // Handle navigation to previous month
  const handleNavigatePrevious = useCallback(
    (_column: number, offset: number) => {
      const focusedDate = getFocusedDate();
      if (focusedDate) {
        onNavigatePrevious?.(focusedDate, offset);
      }
    },
    [getFocusedDate, onNavigatePrevious],
  );

  // Handle navigation to next month
  const handleNavigateNext = useCallback(
    (_column: number, offset: number) => {
      const focusedDate = getFocusedDate();
      if (focusedDate) {
        onNavigateNext?.(focusedDate, offset);
      }
    },
    [getFocusedDate, onNavigateNext],
  );

  // Handle PageUp/PageDown
  const handlePageUp = useCallback(() => {
    const focusedDate = getFocusedDate();
    if (focusedDate) {
      onNavigatePrevious?.(focusedDate, 7);
    }
  }, [getFocusedDate, onNavigatePrevious]);

  const handlePageDown = useCallback(() => {
    const focusedDate = getFocusedDate();
    if (focusedDate) {
      onNavigateNext?.(focusedDate, 7);
    }
  }, [getFocusedDate, onNavigateNext]);

  // Grid focus navigation.
  //
  // The hook enumerates ALL grid cells (every `role="gridcell"`, including
  // disabled days and empty placeholder cells) so the true 7-column geometry is
  // preserved. `isCellFocusable` / `getFocusTarget` tell the hook which cells
  // can take focus (those containing an enabled day button) and where to send
  // focus (the day button inside the cell). Arrow keys move to the target
  // row/column and, if that cell is disabled, continue in the same direction to
  // the next enabled cell.
  const {
    gridRef,
    handleKeyDown: handleGridKeyDown,
    handleFocus: handleGridFocus,
  } = useGridFocus<HTMLDivElement>({
    columns: 7,
    cellSelector: '[role="gridcell"]',
    isCellFocusable: cell =>
      cell.querySelector('button:not([disabled])') !== null,
    getFocusTarget: cell => cell.querySelector<HTMLElement>('button'),
    hasRovingTabIndex: true,
    onNavigateBefore: handleNavigatePrevious,
    onNavigateAfter: handleNavigateNext,
    onPageUp: handlePageUp,
    onPageDown: handlePageDown,
  });

  // Handle pending focus after month navigation
  useEffect(() => {
    if (!pendingFocus || !gridRef.current) {
      return;
    }

    const buttons = gridRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled])',
    );

    const targetPd = plainDateFromISO(pendingFocus);
    const targetIso = plainDateToISO(targetPd);

    let targetButton: HTMLElement | null = null;
    for (const button of buttons) {
      if (button.getAttribute('data-date') === targetIso) {
        targetButton = button;
        break;
      }
    }

    if (!targetButton && buttons.length > 0) {
      targetButton = buttons[0];
    }

    targetButton?.focus();
    onPendingFocusHandled?.();
  }, [pendingFocus, gridRef, onPendingFocusHandled]);

  // Parse selection
  let selectedDate: PlainDate | null = null;
  let rangeStart: PlainDate | null = null;
  let rangeEnd: PlainDate | null = null;

  if (mode === 'single' && value && typeof value === 'string') {
    selectedDate = plainDateFromISO(value);
  } else if (mode === 'range' && value && typeof value === 'object') {
    const range = value;
    rangeStart = plainDateFromISO(range.start);
    rangeEnd = plainDateFromISO(range.end);
  }

  // Handle in-progress range selection
  if (rangeSelectionStart) {
    rangeStart = plainDateFromISO(rangeSelectionStart);
    rangeEnd = rangeStart;
  }

  // Calculate preview range when hovering during range selection
  let previewStart: PlainDate | null = null;
  let previewEnd: PlainDate | null = null;
  if (mode === 'range' && rangeSelectionStart && hoveredDate) {
    const startPd = plainDateFromISO(rangeSelectionStart);
    const hoverPd = plainDateFromISO(hoveredDate);
    if (!plainDateIsEqual(startPd, hoverPd)) {
      if (plainDateIsBefore(hoverPd, startPd)) {
        previewStart = hoverPd;
        previewEnd = startPd;
      } else {
        previewStart = startPd;
        previewEnd = hoverPd;
      }
    }
  }

  // Month label for announcements
  const monthLabel = useMemo(() => {
    return plainDateFormat(month, DATE_FORMAT_MONTH_YEAR);
  }, [month]);

  return (
    <div {...stylex.props(monthGridStyles.monthGrid)}>
      {/* Days grid (APG grid: header row of columnheaders + week rows) */}
      <div
        ref={gridRef}
        role="grid"
        aria-label={monthLabel}
        onKeyDown={handleGridKeyDown}
        onFocus={handleGridFocus}
        {...stylex.props(
          monthGridStyles.daysGrid,
          hasWeekNumbers && monthGridStyles.daysGridWithNumbers,
        )}>
        {/* Day names header row (columnheaders live inside the grid). Uses the
            same display:contents row so its cells align to the grid columns. */}
        <div role="row" {...stylex.props(monthGridStyles.weekRow)}>
          {hasWeekNumbers && (
            <div
              {...stylex.props(
                monthGridStyles.dayName,
                monthGridStyles.weekNumberHeader,
              )}
            />
          )}
          {dayNames.map(name => (
            <div
              key={name}
              role="columnheader"
              {...stylex.props(monthGridStyles.dayName)}>
              {name}
            </div>
          ))}
        </div>

        {weeks.map(week => {
          const weekDate = week.find(d => !d.isOutside)?.date || week[0].date;
          const weekNum = plainDateGetWeekNumber(weekDate);

          return (
            <div
              key={plainDateToISO(weekDate)}
              role="row"
              {...stylex.props(monthGridStyles.weekRow)}>
              {hasWeekNumbers && (
                <div
                  role="rowheader"
                  {...stylex.props(monthGridStyles.weekNumber)}>
                  {weekNum}
                </div>
              )}
              {week.map((day, dayIndex) => {
                // Whether the previous/next day in this week row continues the
                // highlighted run (range and preview). A disabled or
                // adjacent-month neighbour breaks continuity, so this day gets
                // an end cap on that side (#2715).
                const neighbors = computeDayNeighborContinuity({
                  week,
                  dayIndex,
                  mode,
                  rangeStart,
                  rangeEnd,
                  previewStart,
                  previewEnd,
                  isDisabled: isDateDisabled,
                });
                return (
                  <DayCell
                    key={day.iso}
                    day={day}
                    dayIndex={dayIndex}
                    mode={mode}
                    selectedDate={selectedDate}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    previewStart={previewStart}
                    previewEnd={previewEnd}
                    today={today}
                    hasOutsideDays={hasOutsideDays}
                    isDisabled={isDateDisabled(day.date)}
                    neighbors={neighbors}
                    isTabbable={day.iso === seedTabbableIso}
                    onDayClick={onDayClick}
                    onDayHover={onDayHover}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// DayCell (Private)
// =============================================================================

interface DayCellProps {
  day: CalendarDay;
  dayIndex: number;
  mode: 'single' | 'range';
  selectedDate: PlainDate | null;
  rangeStart: PlainDate | null;
  rangeEnd: PlainDate | null;
  previewStart: PlainDate | null;
  previewEnd: PlainDate | null;
  today: PlainDate;
  hasOutsideDays: boolean;
  isDisabled: boolean;
  /**
   * Whether the previous/next day in the same week continues the highlighted
   * run (range and preview). When a neighbour is disabled or outside the month
   * it breaks the run, so this day gets an end cap on that side (#2715).
   */
  neighbors: DayNeighborContinuity;
  /**
   * Whether this day seeds the initial roving tab stop. useGridFocus
   * (`hasRovingTabIndex`) owns the live tab stop thereafter — it honors an
   * existing `tabindex="0"` and repairs/moves it on navigation and focus.
   */
  isTabbable: boolean;
  onDayClick: (date: PlainDate) => void;
  onDayHover: (date: PlainDate | null) => void;
}

function DayCell({
  day,
  dayIndex,
  mode,
  selectedDate,
  rangeStart,
  rangeEnd,
  previewStart,
  previewEnd,
  today,
  hasOutsideDays,
  isDisabled,
  neighbors,
  isTabbable: isTabbableDay,
  onDayClick,
  onDayHover,
}: DayCellProps) {
  const {date, isOutside, dayNumber} = day;

  if (isOutside && !hasOutsideDays) {
    // Empty placeholder cell — still a gridcell so the grid geometry stays a
    // clean 7-per-row set for keyboard navigation.
    return <div role="gridcell" {...stylex.props(dayCellStyles.cell)} />;
  }

  const state = computeDayCellState({
    date,
    dayIndex,
    mode,
    selectedDate,
    rangeStart,
    rangeEnd,
    previewStart,
    previewEnd,
    today,
    isDisabled,
    isOutside,
  });

  const endpoint = isEndpoint(state);
  const rangeRounding = computeRangeRounding(state, {
    prevInRange: neighbors.prevInRange,
    nextInRange: neighbors.nextInRange,
  });
  const previewRounding = computePreviewRounding(state, {
    prevInPreview: neighbors.prevInPreview,
    nextInPreview: neighbors.nextInPreview,
  });

  return (
    <div
      role="gridcell"
      aria-selected={state.isSelected || state.isInRange || undefined}
      {...stylex.props(dayCellStyles.cell)}>
      {/* Range background */}
      {state.isInRange && (
        <div
          {...stylex.props(
            dayCellStyles.rangeBg,
            dayCellTheme.rangeBg,
            rangeRounding.roundLeft && dayCellStyles.rangeBgRadiusLeft,
            rangeRounding.roundRight && dayCellStyles.rangeBgRadiusRight,
            state.isRangeStart && dayCellStyles.rangeInsetLeft,
            state.isRangeStart &&
              rangeRounding.roundRight &&
              dayCellStyles.rangeInsetRight,
            state.isRangeEnd && dayCellStyles.rangeInsetRight,
            state.isRangeStart &&
              rangeRounding.roundLeft &&
              dayCellStyles.rangeInsetLeft,
          )}
        />
      )}

      {/* Preview range background */}
      {state.isInPreview && (
        <div
          {...stylex.props(
            dayCellStyles.previewBg,
            dayCellTheme.previewBg,
            previewRounding.roundLeft && dayCellStyles.previewBgRadiusLeft,
            previewRounding.roundRight && dayCellStyles.previewBgRadiusRight,
            state.isPreviewStart && dayCellStyles.previewStart,
            state.isPreviewEnd && dayCellStyles.previewEnd,
          )}
        />
      )}

      {/* Day button */}
      <button
        type="button"
        data-date={day.iso}
        aria-label={plainDateFormat(date, DATE_FORMAT_WITH_WEEKDAY)}
        aria-disabled={state.effectivelyDisabled || undefined}
        // Mark today's cell programmatically (APG date-picker pattern), not just
        // visually, so screen-reader users can identify the current date.
        aria-current={state.isToday ? 'date' : undefined}
        disabled={isDisabled}
        // Initial roving tab-stop seed; useGridFocus owns it after mount.
        tabIndex={isTabbableDay ? 0 : -1}
        onClick={() => !state.effectivelyDisabled && onDayClick(date)}
        onMouseEnter={() => !state.effectivelyDisabled && onDayHover(date)}
        onMouseLeave={() => onDayHover(null)}
        {...mergeProps(
          themeProps('calendar-day', {
            selected: endpoint ? 'selected' : null,
            today: state.isToday ? 'today' : null,
            disabled: state.effectivelyDisabled ? 'disabled' : null,
            'in-range': state.isInRange ? 'in-range' : null,
          }),
          stylex.props(
            dayCellStyles.day,
            dayCellTheme.day,
            isOutside && dayCellStyles.dayOutside,
            isOutside && dayCellTheme.dayOutside,
            state.isToday &&
              !state.isSelected &&
              !state.isInRange &&
              dayCellStyles.dayToday,
            state.isToday &&
              !state.isSelected &&
              !state.isInRange &&
              dayCellTheme.dayToday,
            state.isToday &&
              !state.isSelected &&
              state.isInRange &&
              dayCellStyles.dayTodayInRange,
            state.isToday &&
              !state.isSelected &&
              state.isInRange &&
              dayCellTheme.dayTodayInRange,
            endpoint && dayCellStyles.daySelected,
            endpoint && dayCellTheme.daySelected,
            state.effectivelyDisabled && dayCellStyles.dayDisabled,
            state.effectivelyDisabled && dayCellTheme.dayDisabled,
          ),
        )}>
        {dayNumber}
      </button>
    </div>
  );
}
