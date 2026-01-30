/**
 * @file XDSCalendar.tsx
 * @input Uses React useState, useMemo, useCallback, forwardRef
 * @output Exports XDSCalendar component and related types
 * @position Core implementation; consumed by index.ts, tested by XDSCalendar.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Calendar/README.md (props table, features, implementation notes)
 * - /packages/core/src/Calendar/XDSCalendar.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Calendar/index.ts (exports if types change)
 * - /apps/storybook/stories/Calendar.stories.tsx (storybook stories)
 */

import {
  forwardRef,
  useState,
  useMemo,
  useCallback,
  type HTMLAttributes,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  textSizeVars,
} from '../theme/tokens.stylex';
import {XDSButton} from '../Button';
import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/react/24/outline';

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

// ─── Base Props (shared across all modes) ─────────────────────

interface XDSCalendarBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
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
// Utility Functions
// =============================================================================

function dateToISO(date: Date): ISODateString {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` as ISODateString;
}

function parseISO(str: ISODateString): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  calendar: {
    display: 'inline-block',
    backgroundColor: colorVars['--color-surface'],
    padding: spacingVars['--spacing-3'],
    minWidth: '220px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacingVars['--spacing-2'],
    gap: spacingVars['--spacing-2'],
  },
  monthYearLabel: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 600,
    fontSize: textSizeVars['--text-base'],
    color: colorVars['--color-text-primary'],
  },
  monthsContainer: {
    display: 'flex',
    gap: spacingVars['--spacing-4'],
  },
  monthGrid: {
    flex: '1 1 0',
  },
  weekHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: spacingVars['--spacing-1'],
  },
  weekHeaderWithNumbers: {
    gridTemplateColumns: 'auto repeat(7, 1fr)',
  },
  dayName: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: textSizeVars['--text-xsm'],
    fontWeight: 400,
    color: colorVars['--color-text-secondary'],
  },
  weekNumberHeader: {
    width: '32px',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
  },
  daysGridWithNumbers: {
    gridTemplateColumns: 'auto repeat(7, 1fr)',
  },
  weekNumber: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
  weekRow: {
    display: 'contents',
  },
  // Cell wrapper - contains positioned background element
  dayCell: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '32px',
  },
  // Range background element - positioned behind the day button
  dayRangeBg: {
    position: 'absolute',
    top: '2px',
    bottom: '2px',
    left: 0,
    right: 0,
    backgroundColor: colorVars['--color-accent-deemphasized'],
  },
  // Radius only (for row edges)
  dayRangeBgRadiusLeft: {
    left: '2px',
    borderTopLeftRadius: radiusVars['--radius-rounded'],
    borderBottomLeftRadius: radiusVars['--radius-rounded'],
  },
  dayRangeBgRadiusRight: {
    right: '2px',
    borderTopRightRadius: radiusVars['--radius-rounded'],
    borderBottomRightRadius: radiusVars['--radius-rounded'],
  },
  // Inset (for actual range start/end)
  dayRangeInsetLeft: {
    left: '2px',
  },
  dayRangeInsetRight: {
    right: '2px',
  },
  // Preview range background (dotted border)
  dayRangePreview: {
    position: 'absolute',
    top: '2px',
    bottom: '2px',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopStyle: 'dotted',
    borderTopColor: colorVars['--color-divider-emphasized'],
    borderBottomWidth: 1,
    borderBottomStyle: 'dotted',
    borderBottomColor: colorVars['--color-divider-emphasized'],
  },
  // Radius only (for row edges)
  dayRangePreviewRadiusLeft: {
    left: '2px',
    borderTopLeftRadius: radiusVars['--radius-rounded'],
    borderBottomLeftRadius: radiusVars['--radius-rounded'],
    borderLeftWidth: 1,
    borderLeftStyle: 'dotted',
    borderLeftColor: colorVars['--color-divider-emphasized'],
  },
  dayRangePreviewRadiusRight: {
    right: '2px',
    borderTopRightRadius: radiusVars['--radius-rounded'],
    borderBottomRightRadius: radiusVars['--radius-rounded'],
    borderRightWidth: 1,
    borderRightStyle: 'dotted',
    borderRightColor: colorVars['--color-divider-emphasized'],
  },
  // Border + inset (for actual preview start/end)
  dayRangePreviewStart: {
    left: '2px',
    borderLeftWidth: 1,
    borderLeftStyle: 'dotted',
    borderLeftColor: colorVars['--color-divider-emphasized'],
    borderTopLeftRadius: radiusVars['--radius-rounded'],
    borderBottomLeftRadius: radiusVars['--radius-rounded'],
  },
  dayRangePreviewEnd: {
    right: '2px',
    borderRightWidth: 1,
    borderRightStyle: 'dotted',
    borderRightColor: colorVars['--color-divider-emphasized'],
    borderTopRightRadius: radiusVars['--radius-rounded'],
    borderBottomRightRadius: radiusVars['--radius-rounded'],
  },
  day: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-sm'],
    color: colorVars['--color-text-primary'],
    padding: 0,
    position: 'relative',
    zIndex: 1,
    transitionProperty: 'background-color, color',
    transitionDuration: transitionVars['--transition-fast'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  dayOutside: {
    color: colorVars['--color-text-secondary'],
    opacity: 0.5,
  },
  dayToday: {
    boxShadow: `inset 0 0 0 1px ${colorVars['--color-divider-emphasized']}`,
  },
  dayTodayInRange: {
    boxShadow: `inset 0 0 0 1px ${colorVars['--color-text-primary']}`,
  },
  daySelected: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-text-on-media'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
    },
  },
  dayDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
    backgroundImage: {
      default: null,
      ':hover': null,
    },
  },
  navIcon: {
    width: '16px',
    height: '16px',
  },
});

// =============================================================================
// Sub-components
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
}: MonthGridProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // Calculate days to display
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Calculate starting offset based on weekStartsOn
  let startingDayOfWeek = firstDayOfMonth.getDay() - weekStartsOn;
  if (startingDayOfWeek < 0) startingDayOfWeek += 7;

  // Calculate total cells
  const totalDays = daysInMonth + startingDayOfWeek;
  const totalRows = hasVariableRowCount ? Math.ceil(totalDays / 7) : 6;
  const totalCells = totalRows * 7;

  // Parse constraints
  const minDate = min ? parseISO(min) : null;
  const maxDate = max ? parseISO(max) : null;

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
    rangeEnd = rangeStart; // Show as single day until end is selected
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

  // Generate day names
  const dayNames = useMemo(() => {
    const names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const rotated = [];
    for (let i = 0; i < 7; i++) {
      rotated.push(names[(i + weekStartsOn) % 7]);
    }
    return rotated;
  }, [weekStartsOn]);

  // Generate days
  const days = useMemo(() => {
    const result: Array<{
      date: Date;
      isOutside: boolean;
      dayNumber: number;
    }> = [];

    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startingDayOfWeek + 1;
      const date = new Date(year, monthIndex, dayOffset);
      const isOutside = dayOffset < 1 || dayOffset > daysInMonth;

      result.push({
        date,
        isOutside,
        dayNumber: date.getDate(),
      });
    }

    return result;
  }, [year, monthIndex, totalCells, startingDayOfWeek, daysInMonth]);

  // Group days into weeks for week numbers
  const weeks = useMemo(() => {
    const result: Array<typeof days> = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      if (dateConstraints) {
        for (const constraint of dateConstraints) {
          if (!constraint(date)) return true;
        }
      }
      return false;
    },
    [minDate, maxDate, dateConstraints],
  );

  return (
    <div {...stylex.props(styles.monthGrid)}>
      {/* Day names header */}
      <div
        {...stylex.props(
          styles.weekHeader,
          hasWeekNumbers && styles.weekHeaderWithNumbers,
        )}>
        {hasWeekNumbers && (
          <div {...stylex.props(styles.dayName, styles.weekNumberHeader)} />
        )}
        {dayNames.map((name, i) => (
          <div key={i} {...stylex.props(styles.dayName)}>
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        role="grid"
        {...stylex.props(
          styles.daysGrid,
          hasWeekNumbers && styles.daysGridWithNumbers,
        )}>
        {weeks.map((week, weekIndex) => {
          // Find first non-outside day for week number
          const weekDate = week.find(d => !d.isOutside)?.date || week[0].date;
          const weekNum = getWeekNumber(weekDate);

          return (
            <div key={weekIndex} role="row" {...stylex.props(styles.weekRow)}>
              {hasWeekNumbers && (
                <div {...stylex.props(styles.weekNumber)}>{weekNum}</div>
              )}
              {week.map((day, dayIndex) => {
                const {date, isOutside, dayNumber} = day;

                if (isOutside && !hasOutsideDays) {
                  return (
                    <div key={dayIndex} {...stylex.props(styles.dayCell)} />
                  );
                }

                const isToday = isSameDay(date, today);
                const isSelected =
                  mode === 'single' &&
                  selectedDate &&
                  isSameDay(date, selectedDate);
                const isInRange =
                  mode === 'range' &&
                  rangeStart &&
                  rangeEnd &&
                  isDateInRange(date, rangeStart, rangeEnd);
                const isRangeStart =
                  mode === 'range' && rangeStart && isSameDay(date, rangeStart);
                const isRangeEnd =
                  mode === 'range' && rangeEnd && isSameDay(date, rangeEnd);
                const isDisabled = isDateDisabled(date);

                // Preview range calculations
                const isInPreview =
                  previewStart &&
                  previewEnd &&
                  isDateInRange(date, previewStart, previewEnd);
                const isPreviewStart =
                  previewStart && isSameDay(date, previewStart);
                const isPreviewEnd = previewEnd && isSameDay(date, previewEnd);

                // Determine cell background for range - show for all cells in range
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
                  <div key={dayIndex} {...stylex.props(styles.dayCell)}>
                    {hasRangeBackground && (
                      <div
                        {...stylex.props(
                          styles.dayRangeBg,
                          roundLeft && styles.dayRangeBgRadiusLeft,
                          roundRight && styles.dayRangeBgRadiusRight,
                          isRangeStart && styles.dayRangeInsetLeft,
                          isRangeStart &&
                            roundRight &&
                            styles.dayRangeInsetRight,
                          isRangeEnd && styles.dayRangeInsetRight,
                          isRangeStart && roundLeft && styles.dayRangeInsetLeft,
                        )}
                      />
                    )}
                    {isInPreview && (
                      <div
                        {...stylex.props(
                          styles.dayRangePreview,
                          previewRoundLeft && styles.dayRangePreviewRadiusLeft,
                          previewRoundRight &&
                            styles.dayRangePreviewRadiusRight,
                          isPreviewStart && styles.dayRangePreviewStart,
                          isPreviewStart &&
                            roundRight &&
                            styles.dayRangeInsetRight,
                          isPreviewEnd && styles.dayRangePreviewEnd,
                          isPreviewEnd && roundLeft && styles.dayRangeInsetLeft,
                        )}
                      />
                    )}
                    <button
                      type="button"
                      role="gridcell"
                      aria-selected={isSelected || isInRange || undefined}
                      aria-disabled={isDisabled || undefined}
                      disabled={isDisabled}
                      tabIndex={isToday && !isDisabled ? 0 : -1}
                      onClick={() => !isDisabled && onDayClick(date)}
                      onMouseEnter={() => !isDisabled && onDayHover(date)}
                      onMouseLeave={() => onDayHover(null)}
                      {...stylex.props(
                        styles.day,
                        isOutside && styles.dayOutside,
                        isToday && !isSelected && !isInRange && styles.dayToday,
                        isToday &&
                          !isSelected &&
                          isInRange &&
                          styles.dayTodayInRange,
                        (isSelected || isRangeStart || isRangeEnd) &&
                          styles.daySelected,
                        isDisabled && styles.dayDisabled,
                      )}>
                      {dayNumber}
                    </button>
                  </div>
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
// Main Component
// =============================================================================

export const XDSCalendar = forwardRef<HTMLDivElement, XDSCalendarProps>(
  (props, ref) => {
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
      (delta: number) => {
        const newDate = new Date(baseMonth);
        newDate.setMonth(baseMonth.getMonth() + delta);
        const newISO = dateToISO(newDate);

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
      <div ref={ref} {...stylex.props(styles.calendar)} {...rest}>
        {/* Header with navigation */}
        <div {...stylex.props(styles.header)}>
          <XDSButton
            label="Previous month"
            variant="ghost"
            icon={<ChevronLeftIcon {...stylex.props(styles.navIcon)} />}
            onClick={() => navigateMonth(-1)}
          />

          <span {...stylex.props(styles.monthYearLabel)}>{monthYearLabel}</span>

          <XDSButton
            label="Next month"
            variant="ghost"
            icon={<ChevronRightIcon {...stylex.props(styles.navIcon)} />}
            onClick={() => navigateMonth(1)}
          />
        </div>

        {/* Month grids */}
        <div {...stylex.props(styles.monthsContainer)}>
          {visibleMonths.map((month, index) => (
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
            />
          ))}
        </div>
      </div>
    );
  },
);

XDSCalendar.displayName = 'XDSCalendar';
