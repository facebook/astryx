// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSCalendar.tsx
 * @input Uses React useState, useMemo, useCallback, hooks
 * @output Exports XDSCalendar component and related types
 * @position Core implementation; consumed by index.ts, tested by XDSCalendar.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Calendar/Calendar.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Calendar/XDSCalendar.test.tsx (tests for new/changed behavior)
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
} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';
import {useGridFocus} from '../hooks';
import {
  useCalendarDays,
  useCalendarConstraints,
  useCalendarRovingTabindex,
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
  plainDateFromDate,
  plainDateToday,
  plainDateSetFirstOfMonth,
  plainDateAddMonths,
  plainDateAddDays,
  plainDateIsBefore,
  plainDateIsEqual,
  plainDateIsInRange,
  plainDateGetWeekNumber,
  plainDateFormat,
  DATE_FORMAT_WITH_WEEKDAY,
  DATE_FORMAT_MONTH_YEAR,
} from '../utils/plainDate';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export type {ISODateString, DayOfWeek, DateRange} from '../utils/dateTypes';
import type {ISODateString, DayOfWeek, DateRange} from '../utils/dateTypes';

/** Imperative handle for XDSCalendar ref */

export interface XDSCalendarHandle {
  /** Navigate the calendar to show the month containing the given date */
  navigateTo: (date: ISODateString) => void;
}

// ─── Base Props (shared across all modes) ─────────────────────

interface XDSCalendarBaseProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the calendar (imperative handle) */
  ref?: React.Ref<XDSCalendarHandle>;
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
   * First day of week.
   * Default: 0 (Sunday)
   */
  weekStartsOn?: DayOfWeek;
}

// ─── Mode-specific Props (discriminated union) ────────────────

interface XDSCalendarSingleProps extends XDSCalendarBaseProps {
  /** Selection mode */
  mode?: 'single';

  /** Selected date in ISO format (YYYY-MM-DD) */
  value?: ISODateString;

  /** Default value for uncontrolled mode */
  defaultValue?: ISODateString;

  /** Callback when date is selected */
  onChange?: (value: ISODateString, valueAsDate: Date) => void;
}

interface XDSCalendarRangeProps extends XDSCalendarBaseProps {
  /** Selection mode */
  mode: 'range';

  /** Selected date range */
  value?: DateRange;

  /** Default value for uncontrolled mode */
  defaultValue?: DateRange;

  /** Callback when range is selected */
  onChange?: (value: DateRange) => void;
}

export type XDSCalendarProps = XDSCalendarSingleProps | XDSCalendarRangeProps;

// =============================================================================
// Main Component
// =============================================================================

/**
 * A calendar component for selecting dates or date ranges.
 *
 * @example
 * ```
 * <XDSCalendar value={selectedDate} onChange={setSelectedDate} />
 * ```
 */
export function XDSCalendar({ref, ...props}: XDSCalendarProps) {
  const {
    mode = 'single',
    value,
    defaultValue,
    onChange,
    numberOfMonths = 1,
    min,
    max,
    dateConstraints,
    focusDate: focusDateProp,
    onFocusDateChange,
    hasOutsideDays = true,
    hasWeekNumbers = false,
    hasVariableRowCount = false,
    weekStartsOn = 0,
    xstyle,
    className,
    style,
    ...rest
  } = props;

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
    ref,
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
        (onChange as XDSCalendarSingleProps['onChange'])?.(
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
          (onChange as XDSCalendarRangeProps['onChange'])?.(range);
        }
      }
    },
    [mode, onChange, rangeSelectionStart],
  );

  return (
    <div
      {...mergeProps(
        xdsClassName('calendar', {mode}),
        stylex.props(calendarStyles.calendar, xstyle),
        className,
        style,
      )}
      onKeyDown={handleCalendarKeyDown}
      {...rest}>
      {/* Header with navigation */}
      <div {...stylex.props(calendarStyles.header)}>
        <XDSButton
          label="Previous month"
          variant="ghost"
          icon={<XDSIcon icon="chevronLeft" size="sm" color="inherit" />}
          onClick={() => navigateMonth(-1)}
          isDisabled={!canNavigatePrevious}
          isIconOnly
        />

        <span {...stylex.props(calendarStyles.monthYearLabel)}>
          {monthYearLabel}
        </span>

        <XDSButton
          label="Next month"
          variant="ghost"
          icon={<XDSIcon icon="chevronRight" size="sm" color="inherit" />}
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

XDSCalendar.displayName = 'XDSCalendar';

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
      return plainDateFromISO(value as ISODateString);
    }
    return null;
  }, [mode, value]);

  const {isTabbable} = useCalendarRovingTabindex({
    days,
    today,
    year,
    month: month.month,
    isDateDisabled,
    selectedDate: selectedDateForTabindex,
  });

  // Helper to get the focused date from the currently focused element
  const getFocusedDate = useCallback((): ISODateString | null => {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) {
      return null;
    }

    const ariaLabel = activeElement.getAttribute('aria-label');
    if (!ariaLabel) {
      return null;
    }

    const parsed = new Date(ariaLabel);
    if (isNaN(parsed.getTime())) {
      return null;
    }

    return plainDateToISO(plainDateFromDate(parsed));
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

  // Grid focus navigation
  const {gridRef, handleKeyDown: handleGridKeyDown} =
    useGridFocus<HTMLDivElement>({
      columns: 7,
      cellSelector: 'button:not([disabled])',
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
    const targetLabel = plainDateFormat(targetPd, DATE_FORMAT_WITH_WEEKDAY);

    let targetButton: HTMLElement | null = null;
    for (const button of buttons) {
      if (button.getAttribute('aria-label') === targetLabel) {
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
    selectedDate = plainDateFromISO(value as ISODateString);
  } else if (mode === 'range' && value && typeof value === 'object') {
    const range = value as DateRange;
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
      {/* Day names header */}
      <div
        {...stylex.props(
          monthGridStyles.weekHeader,
          hasWeekNumbers && monthGridStyles.weekHeaderWithNumbers,
        )}>
        {hasWeekNumbers && (
          <div
            {...stylex.props(
              monthGridStyles.dayName,
              monthGridStyles.weekNumberHeader,
            )}
          />
        )}
        {dayNames.map((name, i) => (
          <div
            key={i}
            role="columnheader"
            {...stylex.props(monthGridStyles.dayName)}>
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        ref={gridRef}
        role="grid"
        aria-label={monthLabel}
        onKeyDown={handleGridKeyDown}
        {...stylex.props(
          monthGridStyles.daysGrid,
          hasWeekNumbers && monthGridStyles.daysGridWithNumbers,
        )}>
        {weeks.map((week, weekIndex) => {
          const weekDate = week.find(d => !d.isOutside)?.date || week[0].date;
          const weekNum = plainDateGetWeekNumber(weekDate);

          return (
            <div
              key={weekIndex}
              role="row"
              {...stylex.props(monthGridStyles.weekRow)}>
              {hasWeekNumbers && (
                <div {...stylex.props(monthGridStyles.weekNumber)}>
                  {weekNum}
                </div>
              )}
              {week.map((day, dayIndex) => (
                <DayCell
                  key={dayIndex}
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
                  isTabbable={isTabbable(day.iso)}
                  onDayClick={onDayClick}
                  onDayHover={onDayHover}
                />
              ))}
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
  isTabbable: isTabbableDay,
  onDayClick,
  onDayHover,
}: DayCellProps) {
  const {date, isOutside, dayNumber} = day;

  // Empty cell for outside days when not showing them
  if (isOutside && !hasOutsideDays) {
    return <div {...stylex.props(dayCellStyles.cell)} />;
  }

  // Outside days should not be clickable even when visible
  const effectivelyDisabled = isDisabled || isOutside;

  const isToday = plainDateIsEqual(date, today);
  const isSelected =
    mode === 'single' && selectedDate && plainDateIsEqual(date, selectedDate);
  const isInRange =
    mode === 'range' &&
    rangeStart &&
    rangeEnd &&
    plainDateIsInRange(date, [rangeStart, rangeEnd]);
  const isRangeStart =
    mode === 'range' && rangeStart && plainDateIsEqual(date, rangeStart);
  const isRangeEnd =
    mode === 'range' && rangeEnd && plainDateIsEqual(date, rangeEnd);

  // Preview range calculations
  const isInPreview =
    previewStart &&
    previewEnd &&
    plainDateIsInRange(date, [previewStart, previewEnd]);
  const isPreviewStart = previewStart && plainDateIsEqual(date, previewStart);
  const isPreviewEnd = previewEnd && plainDateIsEqual(date, previewEnd);

  // Determine cell background for range
  const hasRangeBackground = isInRange;

  // Round edges at grid boundaries or range endpoints
  const isFirstColumn = dayIndex === 0;
  const isLastColumn = dayIndex === 6;

  // Determine if background needs rounded edges
  const roundLeft = isRangeStart || isFirstColumn;
  const roundRight = isRangeEnd || isLastColumn;

  // Determine if preview needs rounded edges
  const previewRoundLeft = isPreviewStart || isFirstColumn;
  const previewRoundRight = isPreviewEnd || isLastColumn;

  return (
    <div {...stylex.props(dayCellStyles.cell)}>
      {/* Range background */}
      {hasRangeBackground && (
        <div
          {...stylex.props(
            dayCellStyles.rangeBg,
            dayCellTheme.rangeBg,
            roundLeft && dayCellStyles.rangeBgRadiusLeft,
            roundRight && dayCellStyles.rangeBgRadiusRight,
            isRangeStart && dayCellStyles.rangeInsetLeft,
            isRangeStart && roundRight && dayCellStyles.rangeInsetRight,
            isRangeEnd && dayCellStyles.rangeInsetRight,
            isRangeStart && roundLeft && dayCellStyles.rangeInsetLeft,
          )}
        />
      )}

      {/* Preview range background */}
      {isInPreview && (
        <div
          {...stylex.props(
            dayCellStyles.previewBg,
            dayCellTheme.previewBg,
            previewRoundLeft && dayCellStyles.previewBgRadiusLeft,
            previewRoundRight && dayCellStyles.previewBgRadiusRight,
            isPreviewStart && dayCellStyles.previewStart,
            isPreviewEnd && dayCellStyles.previewEnd,
          )}
        />
      )}

      {/* Day button */}
      <button
        type="button"
        role="gridcell"
        data-date={day.iso}
        aria-label={plainDateFormat(date, DATE_FORMAT_WITH_WEEKDAY)}
        aria-selected={isSelected || isInRange || undefined}
        aria-disabled={effectivelyDisabled || undefined}
        disabled={isDisabled}
        tabIndex={isTabbableDay ? 0 : -1}
        onClick={() => !effectivelyDisabled && onDayClick(date)}
        onMouseEnter={() => !effectivelyDisabled && onDayHover(date)}
        onMouseLeave={() => onDayHover(null)}
        {...mergeProps(
          xdsClassName('calendar-day', {
            selected:
              isSelected || isRangeStart || isRangeEnd ? 'selected' : null,
            today: isToday ? 'today' : null,
            disabled: effectivelyDisabled ? 'disabled' : null,
            'in-range': isInRange ? 'in-range' : null,
          }),
          stylex.props(
            dayCellStyles.day,
            dayCellTheme.day,
            isOutside && dayCellStyles.dayOutside,
            isOutside && dayCellTheme.dayOutside,
            isToday && !isSelected && !isInRange && dayCellStyles.dayToday,
            isToday && !isSelected && !isInRange && dayCellTheme.dayToday,
            isToday &&
              !isSelected &&
              isInRange &&
              dayCellStyles.dayTodayInRange,
            isToday && !isSelected && isInRange && dayCellTheme.dayTodayInRange,
            (isSelected || isRangeStart || isRangeEnd) &&
              dayCellStyles.daySelected,
            (isSelected || isRangeStart || isRangeEnd) &&
              dayCellTheme.daySelected,
            effectivelyDisabled && dayCellStyles.dayDisabled,
            effectivelyDisabled && dayCellTheme.dayDisabled,
          ),
        )}>
        {dayNumber}
      </button>
    </div>
  );
}
