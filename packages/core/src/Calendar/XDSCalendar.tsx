// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSCalendar.tsx
 * @output XDSCalendar component
 * @position Core implementation; render logic first, sub-components below
 */

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useImperativeHandle,
} from 'react';
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
  plainDateGetWeekNumber,
  plainDateFormat,
  DATE_FORMAT_WITH_WEEKDAY,
  DATE_FORMAT_MONTH_YEAR,
} from '../utils/plainDate';
import {mergeProps} from '../utils';
import {xdsThemeProps} from '../utils/xdsThemeProps';
import {
  computeDayCellState,
  computeRangeRounding,
  computePreviewRounding,
  isEndpoint,
} from './dayCellUtils';
import type {
  XDSCalendarProps,
  XDSCalendarHandle,
  ISODateString,
  DateRange,
} from './types';

export type {XDSCalendarProps, XDSCalendarHandle, ISODateString, DateRange};
export type {DayOfWeek} from './types';

// =============================================================================
// XDSCalendar
// =============================================================================

/**
 * Calendar component for selecting dates or date ranges.
 *
 * @example
 * ```
 * <XDSCalendar value={selectedDate} onChange={setSelectedDate} />
 * ```
 */
export function XDSCalendar({ref, ...props}: XDSCalendarProps) {
  const {
    handleRef,
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

  const today = useMemo(() => plainDateToday(), []);

  const [internalValue, setInternalValue] = useState<
    ISODateString | DateRange | undefined
  >(defaultValue);
  const [rangeSelectionStart, setRangeSelectionStart] =
    useState<ISODateString | null>(null);
  const [hoveredDate, setHoveredDate] = useState<ISODateString | null>(null);
  const [pendingFocus, setPendingFocus] = useState<ISODateString | null>(null);

  const effectiveValue = value !== undefined ? value : internalValue;

  const [internalFocusDate, setInternalFocusDate] = useState<PlainDate>(() => {
    if (focusDateProp) {return plainDateFromISO(focusDateProp);}
    if (effectiveValue) {
      return typeof effectiveValue === 'string'
        ? plainDateFromISO(effectiveValue)
        : plainDateFromISO(effectiveValue.start);
    }
    return plainDateToday();
  });

  const isControlledFocus =
    focusDateProp !== undefined && onFocusDateChange !== undefined;
  const focusDate = isControlledFocus
    ? plainDateFromISO(focusDateProp)
    : internalFocusDate;

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

  const baseMonth = useMemo(
    () => plainDateSetFirstOfMonth(focusDate),
    [focusDate],
  );

  const visibleMonths = useMemo(
    () =>
      Array.from({length: numberOfMonths}, (_, i) =>
        plainDateAddMonths(baseMonth, i),
      ),
    [baseMonth, numberOfMonths],
  );

  const monthYearLabel = useMemo(() => {
    if (numberOfMonths === 1) {
      return plainDateFormat(visibleMonths[0], DATE_FORMAT_MONTH_YEAR);
    }
    return visibleMonths
      .map(m => plainDateFormat(m, DATE_FORMAT_MONTH_YEAR))
      .join(' \u2013 ');
  }, [visibleMonths, numberOfMonths]);

  const canNavigatePrevious = useMemo(() => {
    if (!min) {return true;}
    const minDate = plainDateFromISO(min);
    return (
      minDate.year < baseMonth.year ||
      (minDate.year === baseMonth.year && minDate.month < baseMonth.month)
    );
  }, [min, baseMonth]);

  const canNavigateNext = useMemo(() => {
    if (!max) {return true;}
    const maxDate = plainDateFromISO(max);
    const lastVisibleMonth = plainDateAddMonths(baseMonth, numberOfMonths - 1);
    return (
      maxDate.year > lastVisibleMonth.year ||
      (maxDate.year === lastVisibleMonth.year &&
        maxDate.month > lastVisibleMonth.month)
    );
  }, [max, baseMonth, numberOfMonths]);

  const navigateMonth = useCallback(
    (delta: number, focusedDate?: ISODateString, offset?: number) => {
      const newPd = plainDateAddMonths(baseMonth, delta);
      const newISO = plainDateToISO(newPd);

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

  const handleDayClick = useCallback(
    (date: PlainDate) => {
      const iso = plainDateToISO(date);

      if (mode === 'single') {
        setInternalValue(iso);
        (onChange as ((v: ISODateString, d: Date) => void) | undefined)?.(
          iso,
          plainDateToDate(date),
        );
      } else {
        if (rangeSelectionStart === null) {
          setRangeSelectionStart(iso);
        } else {
          const startPd = plainDateFromISO(rangeSelectionStart);
          const [start, end] = plainDateIsBefore(date, startPd)
            ? [iso, rangeSelectionStart]
            : [rangeSelectionStart, iso];

          const range: DateRange = {start, end};
          setInternalValue(range);
          setRangeSelectionStart(null);
          (onChange as ((v: DateRange) => void) | undefined)?.(range);
        }
      }
    },
    [mode, onChange, rangeSelectionStart],
  );

  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsThemeProps('calendar', {mode}),
        stylex.props(calendarStyles.calendar, xstyle),
        className,
        style,
      )}
      onKeyDown={handleCalendarKeyDown}
      {...rest}>
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
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
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

  const {days, weeks, dayNames} = useCalendarDays({
    year,
    month: month.month,
    weekStartsOn,
    hasVariableRowCount,
  });

  const {isDateDisabled} = useCalendarConstraints({min, max, dateConstraints});

  const selectedDateForTabindex = useMemo(() => {
    if (mode === 'single' && value && typeof value === 'string') {
      return plainDateFromISO(value);
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

  const getFocusedDate = useCallback((): ISODateString | null => {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) {return null;}
    const ariaLabel = activeElement.getAttribute('aria-label');
    if (!ariaLabel) {return null;}
    const parsed = new Date(ariaLabel);
    if (isNaN(parsed.getTime())) {return null;}
    return plainDateToISO(plainDateFromDate(parsed));
  }, []);

  const handleNavigatePrevious = useCallback(
    (_column: number, offset: number) => {
      const focusedDate = getFocusedDate();
      if (focusedDate) {onNavigatePrevious?.(focusedDate, offset);}
    },
    [getFocusedDate, onNavigatePrevious],
  );

  const handleNavigateNext = useCallback(
    (_column: number, offset: number) => {
      const focusedDate = getFocusedDate();
      if (focusedDate) {onNavigateNext?.(focusedDate, offset);}
    },
    [getFocusedDate, onNavigateNext],
  );

  const handlePageUp = useCallback(() => {
    const focusedDate = getFocusedDate();
    if (focusedDate) {onNavigatePrevious?.(focusedDate, 7);}
  }, [getFocusedDate, onNavigatePrevious]);

  const handlePageDown = useCallback(() => {
    const focusedDate = getFocusedDate();
    if (focusedDate) {onNavigateNext?.(focusedDate, 7);}
  }, [getFocusedDate, onNavigateNext]);

  const {gridRef, handleKeyDown: handleGridKeyDown} =
    useGridFocus<HTMLDivElement>({
      columns: 7,
      cellSelector: 'button:not([disabled])',
      onNavigateBefore: handleNavigatePrevious,
      onNavigateAfter: handleNavigateNext,
      onPageUp: handlePageUp,
      onPageDown: handlePageDown,
    });

  useEffect(() => {
    if (!pendingFocus || !gridRef.current) {return;}

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
    if (!targetButton && buttons.length > 0) {targetButton = buttons[0];}
    targetButton?.focus();
    onPendingFocusHandled?.();
  }, [pendingFocus, gridRef, onPendingFocusHandled]);

  // Parse selection state
  let selectedDate: PlainDate | null = null;
  let rangeStart: PlainDate | null = null;
  let rangeEnd: PlainDate | null = null;

  if (mode === 'single' && value && typeof value === 'string') {
    selectedDate = plainDateFromISO(value);
  } else if (mode === 'range' && value && typeof value === 'object') {
    rangeStart = plainDateFromISO(value.start);
    rangeEnd = plainDateFromISO(value.end);
  }

  if (rangeSelectionStart) {
    rangeStart = plainDateFromISO(rangeSelectionStart);
    rangeEnd = rangeStart;
  }

  // Preview range during hover
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

  const monthLabel = useMemo(
    () => plainDateFormat(month, DATE_FORMAT_MONTH_YEAR),
    [month],
  );

  return (
    <div {...stylex.props(monthGridStyles.monthGrid)}>
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
        {dayNames.map(name => (
          <div
            key={name}
            role="columnheader"
            {...stylex.props(monthGridStyles.dayName)}>
            {name}
          </div>
        ))}
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-label={monthLabel}
        onKeyDown={handleGridKeyDown}
        {...stylex.props(
          monthGridStyles.daysGrid,
          hasWeekNumbers && monthGridStyles.daysGridWithNumbers,
        )}>
        {weeks.map(week => {
          const weekDate = week.find(d => !d.isOutside)?.date || week[0].date;
          const weekNum = plainDateGetWeekNumber(weekDate);

          return (
            <div
              key={plainDateToISO(weekDate)}
              role="row"
              {...stylex.props(monthGridStyles.weekRow)}>
              {hasWeekNumbers && (
                <div {...stylex.props(monthGridStyles.weekNumber)}>
                  {weekNum}
                </div>
              )}
              {week.map((day, dayIndex) => (
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

  if (isOutside && !hasOutsideDays) {
    return <div {...stylex.props(dayCellStyles.cell)} />;
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
  const rangeRounding = computeRangeRounding(state);
  const previewRounding = computePreviewRounding(state);

  return (
    <div {...stylex.props(dayCellStyles.cell)}>
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

      <button
        type="button"
        role="gridcell"
        data-date={day.iso}
        aria-label={plainDateFormat(date, DATE_FORMAT_WITH_WEEKDAY)}
        aria-selected={state.isSelected || state.isInRange || undefined}
        aria-disabled={state.effectivelyDisabled || undefined}
        disabled={isDisabled}
        tabIndex={isTabbableDay ? 0 : -1}
        onClick={() => !state.effectivelyDisabled && onDayClick(date)}
        onMouseEnter={() => !state.effectivelyDisabled && onDayHover(date)}
        onMouseLeave={() => onDayHover(null)}
        {...mergeProps(
          xdsThemeProps('calendar-day', {
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
