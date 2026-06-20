// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MonthlyView.tsx
 * @input Schedule context and monthly view options
 * @output Month grid schedule view factory
 * @position Concrete schedule view; exported as createScheduleMonthlyView
 */

import * as stylex from '@stylexjs/stylex';
import {
  plainDateAddDays,
  plainDateAddMonths,
  plainDateFromInstant,
  plainDateIsAfter,
  plainDateIsBefore,
  plainDateIsEqual,
  plainDateSetEndOfWeekExclusive,
  plainDateSetFirstOfMonth,
  plainDateSetStartOfWeek,
  plainDateToISO,
  type PlainDate,
} from '@xds/core/utils';
import {Heading, Text} from '@xds/core/Text';
import {
  enumerateDates,
  getScheduleRangeFromDates,
  isDayEvent,
} from './dateMath';
import {useScheduleContext} from './context';
import {
  formatDayNumber,
  formatEventAccessibilityLabel,
  formatFullDate,
  formatMonthTitle,
  formatWeekday,
  isEventInPast,
  MonthEventPill,
  ScheduleFrame,
  ScheduleMonthTitle,
  styles,
} from './shared';
import {useCurrentTime} from './useCurrentTime';
import {scheduleRangeToZonedDateTimeRange} from './zonedDateTime';
import type {
  CalendarEvent,
  ScheduleView,
  ScheduleViewComponentProps,
} from './types';

export interface ScheduleMonthlyViewOptions {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

function ScheduleMonthlyView(
  _props: ScheduleViewComponentProps<ScheduleMonthlyViewOptions>,
) {
  const {events, categories, date, focusDate, timezoneID, range, isLoading} =
    useScheduleContext();
  const rangeDate = date.toPlainDate();
  const highlightedDate = focusDate.toPlainDate();
  const currentTime = useCurrentTime();
  const days = enumerateDates(range.startDate, range.endDate);
  const weeks = getWeeks(days);
  const eventSegments = getMonthEventSegments(events, days, timezoneID);
  const eventsByDay = getMonthEventsByDay(events, days, timezoneID);

  return (
    <ScheduleFrame
      title={<ScheduleMonthTitle date={rangeDate} timezoneID={timezoneID} />}
      titleLabel={formatMonthTitle(rangeDate, timezoneID)}
      isLoading={isLoading}>
      <div
        role="grid"
        aria-label={formatMonthTitle(rangeDate, timezoneID)}
        aria-readonly
        {...stylex.props(styles.monthGrid)}>
        <div role="row" {...stylex.props(styles.weekHeader)}>
          {days.slice(0, 7).map((day, index) => (
            <div
              key={plainDateToISO(day)}
              role="columnheader"
              aria-label={formatWeekday(day, timezoneID, 'long')}
              aria-colindex={index + 1}
              {...stylex.props(styles.weekdayLabel)}>
              <Heading
                level={4}
                color="secondary"
                display="block"
                xstyle={styles.weekdayHeading}>
                {formatWeekday(day, timezoneID, 'short')}
              </Heading>
            </div>
          ))}
        </div>
        <div {...stylex.props(styles.monthGridSurface)}>
          <div {...stylex.props(styles.monthCellGrid)}>
            {weeks.map((week, weekIndex) => (
              <div
                key={plainDateToISO(week[0])}
                role="row"
                {...stylex.props(styles.monthGridRow)}>
                {week.map((day, dayIndex) => {
                  const index = weekIndex * 7 + dayIndex;
                  const isOutsideMonth = day.month !== rangeDate.month;
                  const dayEvents =
                    eventsByDay.get(plainDateToISO(day)) ?? EMPTY_EVENTS;
                  return (
                    <div
                      key={plainDateToISO(day)}
                      role="gridcell"
                      aria-label={formatFullDate(day, timezoneID)}
                      aria-colindex={dayIndex + 1}
                      aria-current={
                        plainDateIsEqual(day, highlightedDate)
                          ? 'date'
                          : undefined
                      }
                      {...stylex.props(
                        styles.monthCell,
                        index % 7 === 6 && styles.monthCellLastColumn,
                        index >= days.length - 7 && styles.monthCellLastRow,
                        isOutsideMonth && styles.monthCellOutside,
                      )}>
                      <div
                        {...stylex.props(
                          styles.monthDayNumber,
                          plainDateIsEqual(day, highlightedDate) &&
                            styles.currentDayPill,
                        )}>
                        <Text
                          type="supporting"
                          color="inherit"
                          weight="medium"
                          hasTabularNumbers>
                          {formatDayNumber(day, timezoneID)}
                        </Text>
                      </div>
                      {dayEvents.length > 0 && (
                        <ul {...stylex.props(styles.visuallyHidden)}>
                          {dayEvents.map(event => (
                            <li key={event.id}>
                              {formatEventAccessibilityLabel(
                                event,
                                day,
                                timezoneID,
                                categories,
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div aria-hidden {...stylex.props(styles.monthEventOverlay)}>
            {eventSegments.map(segment => (
              <div
                key={`${segment.event.id}:${segment.week}:${segment.columnStart}`}
                {...stylex.props(
                  styles.monthEventSpan(
                    segment.week,
                    segment.columnStart,
                    segment.columnEnd,
                    segment.level,
                  ),
                )}>
                <MonthEventPill
                  event={segment.event}
                  timezoneID={timezoneID}
                  isPast={isEventInPast(segment.event, currentTime, timezoneID)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScheduleFrame>
  );
}

function getWeeks(days: ReadonlyArray<PlainDate>): PlainDate[][] {
  const weeks: PlainDate[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}

const EMPTY_EVENTS: ReadonlyArray<CalendarEvent> = [];

function getMonthEventsByDay(
  events: ReadonlyArray<CalendarEvent>,
  days: ReadonlyArray<PlainDate>,
  timezoneID: string,
): Map<string, CalendarEvent[]> {
  const eventsByDay = new Map<string, CalendarEvent[]>();
  days.forEach(day => {
    eventsByDay.set(plainDateToISO(day), []);
  });
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  if (firstDay == null || lastDay == null) {
    return eventsByDay;
  }

  events.forEach(event => {
    const [eventStart, eventEnd] = getEventDateSpan(event, timezoneID);
    if (
      plainDateIsBefore(eventEnd, firstDay) ||
      plainDateIsAfter(eventStart, lastDay)
    ) {
      return;
    }

    let current = plainDateIsBefore(eventStart, firstDay)
      ? firstDay
      : eventStart;
    const visibleEnd = plainDateIsAfter(eventEnd, lastDay) ? lastDay : eventEnd;
    while (!plainDateIsAfter(current, visibleEnd)) {
      eventsByDay.get(plainDateToISO(current))?.push(event);
      current = plainDateAddDays(current, 1);
    }
  });

  return eventsByDay;
}

interface MonthEventSegment {
  event: CalendarEvent;
  week: number;
  columnStart: number;
  columnEnd: number;
  level: number;
}

const MAX_MONTH_EVENT_LEVELS = 4;

function getMonthEventSegments(
  events: ReadonlyArray<CalendarEvent>,
  days: ReadonlyArray<PlainDate>,
  timezoneID: string,
): MonthEventSegment[] {
  const segments: MonthEventSegment[] = [];
  const levelsByWeek: Array<number[]> = [];
  const monthEvents = events
    .map(event => {
      const [eventStart, eventEnd] = getEventDateSpan(event, timezoneID);
      const startIndex = days.findIndex(
        day => !plainDateIsBefore(day, eventStart),
      );
      const endIndexFromRight = [...days]
        .reverse()
        .findIndex(day => !plainDateIsAfter(day, eventEnd));
      if (startIndex < 0 || endIndexFromRight < 0) {
        return null;
      }
      const endIndex = days.length - 1 - endIndexFromRight;
      return {
        event,
        startIndex,
        endIndex,
        isPriority: isDayEvent(event) || endIndex > startIndex,
      };
    })
    .filter(
      (
        record,
      ): record is {
        event: CalendarEvent;
        startIndex: number;
        endIndex: number;
        isPriority: boolean;
      } => record != null,
    )
    .sort((a, b) => {
      if (a.startIndex !== b.startIndex) {
        return a.startIndex - b.startIndex;
      }
      if (a.isPriority !== b.isPriority) {
        return a.isPriority ? -1 : 1;
      }
      const aDuration = a.endIndex - a.startIndex;
      const bDuration = b.endIndex - b.startIndex;
      if (aDuration !== bDuration) {
        return bDuration - aDuration;
      }
      return a.event.title.localeCompare(b.event.title);
    });

  monthEvents.forEach(({event, startIndex, endIndex}) => {
    const [eventStart, eventEnd] = getEventDateSpan(event, timezoneID);
    if (
      plainDateIsBefore(eventEnd, days[0]) ||
      plainDateIsAfter(eventStart, days[days.length - 1])
    ) {
      return;
    }

    for (
      let week = Math.floor(startIndex / 7);
      week <= Math.floor(endIndex / 7);
      week += 1
    ) {
      const columnStart =
        week === Math.floor(startIndex / 7) ? startIndex % 7 : 0;
      const columnEnd = week === Math.floor(endIndex / 7) ? endIndex % 7 : 6;
      const weekLevels = (levelsByWeek[week] ??= []);
      const level = getAvailableLevel(weekLevels, columnStart);
      if (level < MAX_MONTH_EVENT_LEVELS) {
        weekLevels[level] = columnEnd;
        segments.push({event, week, columnStart, columnEnd, level});
      }
    }
  });

  return segments;
}

function getEventDateSpan(
  event: CalendarEvent,
  timezoneID: string,
): [PlainDate, PlainDate] {
  if (isDayEvent(event)) {
    return [event.start, event.end];
  }
  return [
    plainDateFromInstant(event.start, timezoneID),
    plainDateFromInstant(Math.max(event.end - 1, event.start), timezoneID),
  ];
}

function getAvailableLevel(levels: number[], columnStart: number): number {
  const level = levels.findIndex(columnEnd => columnStart > columnEnd);
  return level >= 0 ? level : levels.length;
}

export function createScheduleMonthlyView({
  weekStartsOn = 0,
}: ScheduleMonthlyViewOptions = {}): ScheduleView<ScheduleMonthlyViewOptions> {
  return {
    component: ScheduleMonthlyView,
    options: {weekStartsOn},
    getDateRange: date => {
      const range = getMonthDateRange({
        date: date.toPlainDate(),
        timezoneID: date.timezoneID,
        weekStartsOn,
      });
      return scheduleRangeToZonedDateTimeRange(range, date.timezoneID);
    },
    getPreviousDateRange: date => {
      const range = getMonthDateRange({
        date: plainDateAddMonths(date.toPlainDate(), -1),
        timezoneID: date.timezoneID,
        weekStartsOn,
      });
      return {
        label: 'Previous month',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID),
      };
    },
    getNextDateRange: date => {
      const range = getMonthDateRange({
        date: plainDateAddMonths(date.toPlainDate(), 1),
        timezoneID: date.timezoneID,
        weekStartsOn,
      });
      return {
        label: 'Next month',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID),
      };
    },
  };
}

function getMonthDateRange({
  date,
  timezoneID,
  weekStartsOn,
}: {
  date: PlainDate;
  timezoneID: string;
  weekStartsOn: number;
}) {
  const firstOfMonth = plainDateSetFirstOfMonth(date);
  const nextMonth = plainDateAddMonths(firstOfMonth, 1);
  return getScheduleRangeFromDates({
    startDate: plainDateSetStartOfWeek(firstOfMonth, weekStartsOn),
    endDate: plainDateSetEndOfWeekExclusive(
      plainDateAddDays(nextMonth, -1),
      weekStartsOn,
    ),
    timezoneID,
  });
}
