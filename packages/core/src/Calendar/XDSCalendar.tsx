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
  useRef,
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

  // Today's date — fresh on every render so it updates after midnight
  const today = new Date();

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

  // Track the month index that should handle pendingFocus
  const [pendingFocusMonthIndex, setPendingFocusMonthIndex] = useState<
    number | null
  >(null);

  // Determine effective value
  const isControlledValue = value !== undefined;
  const effectiveValue = isControlledValue ? value : internalValue;

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

  // Sync internalFocusDate when focusDate prop changes (semi-controlled)
  const prevFocusDateProp = useRef(focusDateProp);
  useEffect(() => {
    if (focusDateProp !== prevFocusDateProp.current) {
      prevFocusDateProp.current = focusDateProp;
      if (focusDateProp) {
        setInternalFocusDate(parseISO(focusDateProp));
      }
    }
  }, [focusDateProp]);

  // Reset rangeSelectionStart when mode changes
  const prevMode = useRef(mode);
  useEffect(() => {
    if (mode !== prevMode.current) {
      prevMode.current = mode;
      setRangeSelectionStart(null);
      setHoveredDate(null);
    }
  }, [mode]);

  // Reset rangeSelectionStart when controlled value changes externally
  const prevValue = useRef(value);
  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      setRangeSelectionStart(null);
      setHoveredDate(null);
    }
  }, [value]);

  // Determine focus date
  // Fully controlled: focusDate + onFocusDateChange → always use prop
  // Semi-controlled: focusDate without onFocusDateChange → use internal (synced on prop change)
  const isFullyControlledFocus =
    focusDateProp !== undefined && onFocusDateChange !== undefined;
  const focusDate = isFullyControlledFocus
    ? parseISO(focusDateProp)
    : internalFocusDate;

  // Expose imperative handle for external navigation
  useImperativeHandle(
    ref,
    () => ({
      navigateTo: (date: ISODateString) => {
        if (onFocusDateChange) {
          onFocusDateChange(date);
        }
        setInternalFocusDate(parseISO(date));
      },
    }),
    [onFocusDateChange],
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

  // Auto-navigate to show the controlled value's month when value changes
  useEffect(() => {
    if (!isControlledValue || !value) return;

    const targetDate =
      typeof value === 'string' ? parseISO(value) : parseISO(value.start);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    // Check if target is already visible
    const isVisible = visibleMonths.some(
      m =>
        m.getFullYear() === targetYear && m.getMonth() === targetMonth,
    );

    if (!isVisible) {
      const newFocusDate = new Date(targetYear, targetMonth, 1);
      if (onFocusDateChange) {
        onFocusDateChange(dateToISO(newFocusDate));
      }
      setInternalFocusDate(newFocusDate);
    }
  }, [value, isControlledValue, visibleMonths, onFocusDateChange]);

  // Constraints (including nav bounds)
  const {canNavigatePrevious, canNavigateNext} =
    useCalendarConstraints({
      min,
      max,
      dateConstraints,
    });

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

  // Aria-live announcement for month changes
  const [monthAnnouncement, setMonthAnnouncement] = useState('');

  // Navigation handlers
  const navigateMonth = useCallback(
    (delta: number, focusedDate?: ISODateString, offset?: number) => {
      const newDate = new Date(baseMonth);
      newDate.setMonth(baseMonth.getMonth() + delta);
      const newISO = dateToISO(newDate);

      // Calculate target focus date for keyboard nav
      if (focusedDate) {
        const currentDate = parseISO(focusedDate);
        const daysToMove = offset ?? 7;

        if (daysToMove === 7) {
          // PageUp/PageDown or vertical arrow: go to same day in adjacent month
          currentDate.setMonth(currentDate.getMonth() + delta);
        } else {
          // Horizontal arrow: move by days
          currentDate.setDate(currentDate.getDate() + delta * daysToMove);
        }
        const targetISO = dateToISO(currentDate);
        setPendingFocus(targetISO);

        // Determine which month grid should handle this focus
        const targetMonth = currentDate.getMonth();
        const targetYear = currentDate.getFullYear();
        const newVisibleMonths = Array.from(
          {length: numberOfMonths},
          (_, i) => {
            const m = new Date(newDate);
            m.setMonth(newDate.getMonth() + i);
            return m;
          },
        );
        const monthIdx = newVisibleMonths.findIndex(
          m =>
            m.getFullYear() === targetYear && m.getMonth() === targetMonth,
        );
        setPendingFocusMonthIndex(monthIdx >= 0 ? monthIdx : 0);
      }

      // Announce month change
      const formatter = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
      });
      setMonthAnnouncement(formatter.format(newDate));

      // Always update internal state
      setInternalFocusDate(newDate);
      // Also fire callback if provided
      if (onFocusDateChange) {
        onFocusDateChange(newISO);
      }
    },
    [baseMonth, onFocusDateChange, numberOfMonths],
  );

  const isPrevDisabled = !canNavigatePrevious(visibleMonths);
  const isNextDisabled = !canNavigateNext(visibleMonths);

  // Day click handler
  const handleDayClick = useCallback(
    (date: Date) => {
      const iso = dateToISO(date);

      if (mode === 'single') {
        if (!isControlledValue) {
          setInternalValue(iso);
        }
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

          if (isSameDay(date, startDate)) {
            // Same date twice = single-day range
            start = iso;
            end = iso;
          } else if (date < startDate) {
            start = iso;
            end = rangeSelectionStart;
          } else {
            start = rangeSelectionStart;
            end = iso;
          }

          const range: DateRange = {start, end};
          if (!isControlledValue) {
            setInternalValue(range);
          }
          setRangeSelectionStart(null);
          setHoveredDate(null);
          (onChange as XDSCalendarRangeProps['onChange'])?.(range);
        }
      }
    },
    [mode, onChange, rangeSelectionStart, isControlledValue],
  );

  // Escape handler to cancel range selection
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && mode === 'range' && rangeSelectionStart) {
        setRangeSelectionStart(null);
        setHoveredDate(null);
        e.preventDefault();
      }
    },
    [mode, rangeSelectionStart],
  );

  // Parse selected date for roving tabindex
  const selectedDateForTabindex = useMemo(() => {
    if (mode === 'single' && effectiveValue && typeof effectiveValue === 'string') {
      return parseISO(effectiveValue as ISODateString);
    }
    return null;
  }, [mode, effectiveValue]);

  return (
    <div
      {...rest}
      {...mergeProps(
        xdsClassName('calendar', {mode}),
        stylex.props(calendarStyles.calendar, xstyle),
        className,
        style,
      )}
      role="group"
      aria-label="Calendar"
      onKeyDown={handleKeyDown}>
      {/* Header with navigation */}
      <div {...stylex.props(calendarStyles.header)}>
        <XDSButton
          label="Previous month"
          variant="ghost"
          icon={<XDSIcon icon="chevronLeft" size="sm" color="inherit" />}
          onClick={() => navigateMonth(-1)}
          disabled={isPrevDisabled}
        />

        <span
          role="heading"
          aria-level={2}
          {...stylex.props(calendarStyles.monthYearLabel)}>
          {monthYearLabel}
        </span>

        <XDSButton
          label="Next month"
          variant="ghost"
          icon={<XDSIcon icon="chevronRight" size="sm" color="inherit" />}
          onClick={() => navigateMonth(1)}
          disabled={isNextDisabled}
        />
      </div>

      {/* Month grids */}
      <div {...stylex.props(calendarStyles.monthsContainer)}>
        {visibleMonths.map((month, monthIndex) => (
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
            selectedDate={selectedDateForTabindex}
            onNavigatePrevious={(focusedDate, offset) =>
              navigateMonth(-1, focusedDate, offset)
            }
            onNavigateNext={(focusedDate, offset) =>
              navigateMonth(1, focusedDate, offset)
            }
            pendingFocus={
              pendingFocusMonthIndex === monthIndex ? pendingFocus : null
            }
            onPendingFocusHandled={() => {
              setPendingFocus(null);
              setPendingFocusMonthIndex(null);
            }}
          />
        ))}
      </div>

      {/* Aria-live region for month change announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        {...stylex.props(calendarStyles.srOnly)}>
        {monthAnnouncement}
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
  selectedDate: Date | null;
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
  selectedDate,
  onNavigatePrevious,
  onNavigateNext,
  pendingFocus,
  onPendingFocusHandled,
}: MonthGridProps) {
  const year = month.getFullYear();
  const monthNum = month.getMonth();

  // Use hooks for days generation and constraints
  const {days, weeks, dayNames} = useCalendarDays({
    year,
    month: monthNum,
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
    month: monthNum,
    isDateDisabled,
    selectedDate,
  });

  // Get focused date from data attribute (not localized aria-label)
  const getFocusedDate = useCallback((): ISODateString | null => {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) return null;

    const dateAttr = activeElement.getAttribute('data-date');
    if (!dateAttr) return null;

    return dateAttr as ISODateString;
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

  // Handle PageUp/PageDown — same day in prev/next month
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

  // Grid focus navigation — use all gridcell buttons (including disabled via aria-disabled)
  const {gridRef, handleKeyDown: handleGridKeyDown} = useGridFocus({
    columns: 7,
    cellSelector: '[role="gridcell"] > button',
    onNavigateBefore: handleNavigatePrevious,
    onNavigateAfter: handleNavigateNext,
    onPageUp: handlePageUp,
    onPageDown: handlePageDown,
  });

  // Handle pending focus after month navigation
  useEffect(() => {
    if (!pendingFocus || !gridRef.current) return;

    const buttons = gridRef.current.querySelectorAll<HTMLElement>(
      '[role="gridcell"] > button',
    );

    let targetButton: HTMLElement | null = null;
    for (const button of buttons) {
      if (button.getAttribute('data-date') === pendingFocus) {
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
  let selectedDateForDisplay: Date | null = null;
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;

  if (mode === 'single' && value && typeof value === 'string') {
    selectedDateForDisplay = parseISO(value as ISODateString);
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
    if (hoverDate < startDate) {
      previewStart = hoverDate;
      previewEnd = startDate;
    } else if (hoverDate > startDate) {
      previewStart = startDate;
      previewEnd = hoverDate;
    }
    // If same date, no preview needed
  }

  // Month label for grid aria-label
  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
    }).format(month);
  }, [month]);

  return (
    <div {...stylex.props(monthGridStyles.monthGrid)}>
      {/* Days grid — day names are inside the grid for proper association */}
      <div
        ref={gridRef as React.RefObject<HTMLDivElement | null>}
        role="grid"
        aria-label={monthLabel}
        onKeyDown={handleGridKeyDown}
        {...stylex.props(
          monthGridStyles.daysGrid,
          hasWeekNumbers && monthGridStyles.daysGridWithNumbers,
        )}>
        {/* Day name headers as first row inside the grid */}
        <div
          role="row"
          {...stylex.props(
            monthGridStyles.weekHeader,
            hasWeekNumbers && monthGridStyles.weekHeaderWithNumbers,
          )}>
          {hasWeekNumbers && (
            <div
              role="columnheader"
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
              aria-label={new Intl.DateTimeFormat(undefined, {
                weekday: 'long',
              }).format(
                new Date(
                  2026,
                  0,
                  4 + ((i + weekStartsOn) % 7),
                ),
              )}
              {...stylex.props(monthGridStyles.dayName)}>
              {name}
            </div>
          ))}
        </div>

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
                  selectedDate={selectedDateForDisplay}
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

  // Empty cell for outside days when not showing them — still needs gridcell role
  if (isOutside && !hasOutsideDays) {
    return (
      <div role="gridcell" {...stylex.props(dayCellStyles.cell)} />
    );
  }

  // Outside days are not selectable (they belong to adjacent months)
  const effectivelyDisabled = isDisabled || isOutside;

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
    <div role="gridcell" {...stylex.props(dayCellStyles.cell)}>
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

      {/* Day button — uses aria-disabled instead of disabled for keyboard navigation */}
      <button
        type="button"
        data-date={day.iso}
        aria-label={formatAccessibleDate(date)}
        aria-selected={isSelected || isInRange || undefined}
        aria-disabled={effectivelyDisabled || undefined}
        tabIndex={isTabbableDay ? 0 : -1}
        onClick={() => !effectivelyDisabled && onDayClick(date)}
        onMouseEnter={() => !effectivelyDisabled && onDayHover(date)}
        onMouseLeave={() => !effectivelyDisabled && onDayHover(null)}
        {...stylex.props(
          dayCellStyles.day,
          dayCellTheme.day,
          isOutside && dayCellStyles.dayOutside,
          isOutside && dayCellTheme.dayOutside,
          isToday && !isSelected && !isInRange && dayCellStyles.dayToday,
          isToday && !isSelected && !isInRange && dayCellTheme.dayToday,
          isToday && !isSelected && isInRange && dayCellStyles.dayTodayInRange,
          isToday && !isSelected && isInRange && dayCellTheme.dayTodayInRange,
          (isSelected || isRangeStart || isRangeEnd) &&
            dayCellStyles.daySelected,
          (isSelected || isRangeStart || isRangeEnd) &&
            dayCellTheme.daySelected,
          effectivelyDisabled && dayCellStyles.dayDisabled,
          effectivelyDisabled && dayCellTheme.dayDisabled,
        )}>
        {dayNumber}
      </button>
    </div>
  );
}
