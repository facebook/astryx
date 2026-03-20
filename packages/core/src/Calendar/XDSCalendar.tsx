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
 */

'use client';

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
  dateToISO,
  parseISO,
  isSameDay,
  isDateInRange,
  getWeekNumber,
  formatAccessibleDate,
} from './utils';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

/**
 * ISO 8601 date string in YYYY-MM-DD format.
 * Example: "2026-01-28"
 */

export type ISODateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

/** Day of week: 0 = Sunday through 6 = Saturday */

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Date range with start and end dates */

export interface DateRange {
  start: ISODateString;
  end: ISODateString;
}

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
  const today = useMemo(() => new Date(), []);

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
  const [internalFocusDate, setInternalFocusDate] = useState<Date>(() => {
    if (focusDateProp) return parseISO(focusDateProp);
    if (effectiveValue) {
      if (typeof effectiveValue === 'string') {
        return parseISO(effectiveValue);
      } else {
        return parseISO(effectiveValue.start);
      }
    }
    return new Date();
  });

  // Use controlled focusDate if callback is provided, otherwise use internal state
  const isControlledFocus =
    focusDateProp !== undefined && onFocusDateChange !== undefined;
  const focusDate = isControlledFocus
    ? parseISO(focusDateProp)
    : internalFocusDate;

  // Expose imperative handle for external navigation
  useImperativeHandle(
    ref,
    () => ({
      navigateTo: (date: ISODateString) => {
        if (isControlledFocus) {
          onFocusDateChange?.(date);
        } else {
          setInternalFocusDate(parseISO(date));
        }
      },
    }),
    [isControlledFocus, onFocusDateChange],
  );

  // Base month (first day of focus month)
  const baseMonth = useMemo(() => {
    const d = new Date(focusDate);
    d.setDate(1);
    return d;
  }, [focusDate]);

  // Generate visible months
  const visibleMonths = useMemo(() => {
    return Array.from({length: numberOfMonths}, (_, i) => {
      const m = new Date(baseMonth);
      m.setMonth(baseMonth.getMonth() + i);
      return m;
    });
  }, [baseMonth, numberOfMonths]);

  // Format month header
  const monthYearLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
    });
    if (numberOfMonths === 1) {
      return formatter.format(visibleMonths[0]);
    }
    return visibleMonths.map(m => formatter.format(m)).join(' – ');
  }, [visibleMonths, numberOfMonths]);

  // Navigation handlers
  const navigateMonth = useCallback(
    (delta: number, focusedDate?: ISODateString, offset?: number) => {
      const newDate = new Date(baseMonth);
      newDate.setMonth(baseMonth.getMonth() + delta);
      const newISO = dateToISO(newDate);

      // Calculate target focus date if a focused date was provided
      if (focusedDate) {
        const currentDate = parseISO(focusedDate);
        const daysToMove = offset ?? 7;
        currentDate.setDate(currentDate.getDate() + delta * daysToMove);
        setPendingFocus(dateToISO(currentDate));
      }

      if (onFocusDateChange) {
        onFocusDateChange(newISO);
      } else {
        setInternalFocusDate(newDate);
      }
    },
    [baseMonth, onFocusDateChange],
  );

  // Day click handler
  const handleDayClick = useCallback(
    (date: Date) => {
      const iso = dateToISO(date);

      if (mode === 'single') {
        setInternalValue(iso);
        (onChange as XDSCalendarSingleProps['onChange'])?.(iso, date);
      } else {
        // Range mode
        if (rangeSelectionStart === null) {
          // First click - start the range
          setRangeSelectionStart(iso);
        } else {
          // Second click - complete the range
          const startDate = parseISO(rangeSelectionStart);
          let start: ISODateString;
          let end: ISODateString;

          // Ensure start <= end
          if (date < startDate) {
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
      {...rest}>
      {/* Header with navigation */}
      <div {...stylex.props(calendarStyles.header)}>
        <XDSButton
          label="Previous month"
          variant="ghost"
          icon={<XDSIcon icon="chevronLeft" size="sm" color="inherit" />}
          onClick={() => navigateMonth(-1)}
        />

        <span {...stylex.props(calendarStyles.monthYearLabel)}>
          {monthYearLabel}
        </span>

        <XDSButton
          label="Next month"
          variant="ghost"
          icon={<XDSIcon icon="chevronRight" size="sm" color="inherit" />}
          onClick={() => navigateMonth(1)}
        />
      </div>

      {/* Month grids */}
      <div {...stylex.props(calendarStyles.monthsContainer)}>
        {visibleMonths.map(month => (
          <MonthGrid
            key={`${month.getFullYear()}-${month.getMonth()}`}
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
            onDayHover={date => setHoveredDate(date ? dateToISO(date) : null)}
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
  month: Date;
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
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date | null) => void;
  today: Date;
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
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // Use hooks for days generation and constraints
  const {days, weeks, dayNames} = useCalendarDays({
    year,
    month: monthIndex,
    weekStartsOn,
    hasVariableRowCount,
  });

  const {isDateDisabled} = useCalendarConstraints({
    min,
    max,
    dateConstraints,
  });

  const {isTabbable} = useCalendarRovingTabindex({
    days,
    today,
    year,
    month: monthIndex,
    isDateDisabled,
  });

  // Helper to get the focused date from the currently focused element
  const getFocusedDate = useCallback((): ISODateString | null => {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) return null;

    const ariaLabel = activeElement.getAttribute('aria-label');
    if (!ariaLabel) return null;

    const parsed = new Date(ariaLabel);
    if (isNaN(parsed.getTime())) return null;

    return dateToISO(parsed);
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
  const {gridRef, handleKeyDown: handleGridKeyDown} = useGridFocus({
    columns: 7,
    cellSelector: 'button:not([disabled])',
    onNavigateBefore: handleNavigatePrevious,
    onNavigateAfter: handleNavigateNext,
    onPageUp: handlePageUp,
    onPageDown: handlePageDown,
  });

  // Handle pending focus after month navigation
  useEffect(() => {
    if (!pendingFocus || !gridRef.current) return;

    const buttons = gridRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled])',
    );

    const targetDate = parseISO(pendingFocus);
    const targetLabel = formatAccessibleDate(targetDate);

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
  let selectedDate: Date | null = null;
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;

  if (mode === 'single' && value && typeof value === 'string') {
    selectedDate = parseISO(value as ISODateString);
  } else if (mode === 'range' && value && typeof value === 'object') {
    const range = value as DateRange;
    rangeStart = parseISO(range.start);
    rangeEnd = parseISO(range.end);
  }

  // Handle in-progress range selection
  if (rangeSelectionStart) {
    rangeStart = parseISO(rangeSelectionStart);
    rangeEnd = rangeStart;
  }

  // Calculate preview range when hovering during range selection
  let previewStart: Date | null = null;
  let previewEnd: Date | null = null;
  if (mode === 'range' && rangeSelectionStart && hoveredDate) {
    const startDate = parseISO(rangeSelectionStart);
    const hoverDate = parseISO(hoveredDate);
    if (startDate.getTime() !== hoverDate.getTime()) {
      if (hoverDate < startDate) {
        previewStart = hoverDate;
        previewEnd = startDate;
      } else {
        previewStart = startDate;
        previewEnd = hoverDate;
      }
    }
  }

  // Month label for announcements
  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
    }).format(month);
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
          <div key={i} {...stylex.props(monthGridStyles.dayName)}>
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        ref={gridRef as React.RefObject<HTMLDivElement | null>}
        role="grid"
        aria-label={monthLabel}
        onKeyDown={handleGridKeyDown}
        {...stylex.props(
          monthGridStyles.daysGrid,
          hasWeekNumbers && monthGridStyles.daysGridWithNumbers,
        )}>
        {weeks.map((week, weekIndex) => {
          const weekDate = week.find(d => !d.isOutside)?.date || week[0].date;
          const weekNum = getWeekNumber(weekDate);

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
  selectedDate: Date | null;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  previewStart: Date | null;
  previewEnd: Date | null;
  today: Date;
  hasOutsideDays: boolean;
  isDisabled: boolean;
  isTabbable: boolean;
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date | null) => void;
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

  const isToday = isSameDay(date, today);
  const isSelected =
    mode === 'single' && selectedDate && isSameDay(date, selectedDate);
  const isInRange =
    mode === 'range' &&
    rangeStart &&
    rangeEnd &&
    isDateInRange(date, rangeStart, rangeEnd);
  const isRangeStart =
    mode === 'range' && rangeStart && isSameDay(date, rangeStart);
  const isRangeEnd = mode === 'range' && rangeEnd && isSameDay(date, rangeEnd);

  // Preview range calculations
  const isInPreview =
    previewStart && previewEnd && isDateInRange(date, previewStart, previewEnd);
  const isPreviewStart = previewStart && isSameDay(date, previewStart);
  const isPreviewEnd = previewEnd && isSameDay(date, previewEnd);

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
        aria-label={formatAccessibleDate(date)}
        aria-selected={isSelected || isInRange || undefined}
        aria-disabled={isDisabled || undefined}
        disabled={isDisabled}
        tabIndex={isTabbableDay ? 0 : -1}
        onClick={() => !isDisabled && onDayClick(date)}
        onMouseEnter={() => !isDisabled && onDayHover(date)}
        onMouseLeave={() => onDayHover(null)}
        {...mergeProps(
          xdsClassName('calendar-day', {
            selected:
              isSelected || isRangeStart || isRangeEnd ? 'selected' : null,
            today: isToday ? 'today' : null,
            disabled: isDisabled ? 'disabled' : null,
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
            isDisabled && dayCellStyles.dayDisabled,
            isDisabled && dayCellTheme.dayDisabled,
          ),
        )}>
        {dayNumber}
      </button>
    </div>
  );
}
