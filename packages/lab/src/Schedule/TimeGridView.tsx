// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TimeGridView.tsx
 * @input Schedule context, visible days, timezone, and hour bounds
 * @output Shared weekly/day time-grid layout
 * @position Internal view primitive shared by WeeklyView and DayView
 */

import * as stylex from '@stylexjs/stylex';
import {
  plainDateAddDays,
  plainDateFromInstant,
  plainDateIsBefore,
  plainDateIsEqual,
  plainDateToInstant,
  plainDateToISO,
  type PlainDate,
} from '@xds/core/utils';
import {Heading, Text} from '@xds/core/Text';
import {useScheduleContext} from './context';
import {eventOccursOnDate, isDayEvent} from './dateMath';
import {
  clamp,
  EventPill,
  eventPastSurfaceColorStyle,
  eventSurfaceColorStyle,
  eventSpansPastDay,
  formatEventAccessibilityLabel,
  formatDayNumber,
  formatEventTime,
  formatFullDate,
  formatHour,
  formatTimezoneAbbreviation,
  formatWeekday,
  getEventCategory,
  getMinutesSinceStartOfDay,
  isEventInPast,
  styles,
} from './shared';
import {useCurrentTime} from './useCurrentTime';
import type {
  CalendarDayEvent,
  CalendarEvent,
  CalendarInstantEvent,
  ScheduleCategory,
} from './types';

export function TimeGridView({
  days,
  events,
  focusDate,
  timezoneID,
  minHour,
  maxHour,
  hourHeight,
}: {
  days: PlainDate[];
  events: ReadonlyArray<CalendarEvent>;
  focusDate: PlainDate;
  timezoneID: string;
  minHour: number;
  maxHour: number;
  hourHeight: number;
}) {
  const {categories} = useScheduleContext();
  const normalizedMinHour = Math.max(0, Math.min(23, Math.floor(minHour)));
  const normalizedMaxHour = Math.max(
    normalizedMinHour + 1,
    Math.min(24, Math.floor(maxHour)),
  );
  const hours = Array.from(
    {length: normalizedMaxHour - normalizedMinHour},
    (_, index) => normalizedMinHour + index,
  );
  const allDayEvents = events.filter(isDayEvent);
  const allDaySegments = getAllDayEventSegments(allDayEvents, days);
  const allDayLevelCount = allDaySegments.reduce(
    (levelCount, segment) => Math.max(levelCount, segment.level + 1),
    0,
  );
  const instantEvents = events.filter(
    (event): event is CalendarInstantEvent => !isDayEvent(event),
  );
  const currentTime = useCurrentTime();
  const currentDate = plainDateFromInstant(currentTime, timezoneID);
  const timezoneLabel = formatTimezoneAbbreviation(
    days[0] ?? focusDate,
    timezoneID,
  );

  return (
    <>
      <TimeGridAccessibilityGrid
        allDayEvents={allDayEvents}
        categories={categories}
        days={days}
        events={instantEvents}
        focusDate={focusDate}
        hours={hours}
        timezoneID={timezoneID}
        timezoneLabel={timezoneLabel}
      />
      <div aria-hidden {...stylex.props(styles.timeGrid)}>
        <div {...stylex.props(styles.timeGridCorner)} />
        <div {...stylex.props(styles.timeGridHeader)}>
          {days.map((day, index) => (
            <div
              key={plainDateToISO(day)}
              {...stylex.props(
                styles.timeGridHeaderCell,
                index === days.length - 1 && styles.timeGridHeaderCellLast,
              )}>
              <Heading
                level={4}
                color="secondary"
                display="block"
                xstyle={styles.timeGridHeaderHeading}>
                <span {...stylex.props(styles.timeGridHeaderHeadingContent)}>
                  {formatWeekday(day, timezoneID, 'short')}
                  <span
                    {...stylex.props(
                      styles.timeGridDayNumber,
                      plainDateIsEqual(day, focusDate) &&
                        styles.timeGridCurrentDayPill,
                    )}>
                    {formatDayNumber(day, timezoneID)}
                  </span>
                </span>
              </Heading>
            </div>
          ))}
        </div>
        <div {...stylex.props(styles.allDayLabel)}>
          <Text type="supporting" color="secondary" weight="bold">
            {timezoneLabel}
          </Text>
        </div>
        <div {...stylex.props(styles.allDayRow)}>
          <div
            {...stylex.props(
              styles.allDayRowSurface(days.length, allDayLevelCount),
            )}>
            <div {...stylex.props(styles.allDayCellGrid(days.length))}>
              {days.map((day, index) => (
                <div
                  key={plainDateToISO(day)}
                  {...stylex.props(
                    styles.allDayCell,
                    index === days.length - 1 && styles.allDayCellLast,
                  )}
                />
              ))}
            </div>
            <div {...stylex.props(styles.allDayEventOverlay(days.length))}>
              {allDaySegments.map(segment => (
                <div
                  key={`${segment.event.id}:${segment.columnStart}`}
                  {...stylex.props(
                    styles.allDayEventSpan(
                      segment.columnStart,
                      segment.columnEnd,
                      segment.level,
                    ),
                  )}>
                  <EventPill
                    event={segment.event}
                    isPast={isEventInPast(
                      segment.event,
                      currentTime,
                      timezoneID,
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div {...stylex.props(styles.timeGridBody)}>
          <div {...stylex.props(styles.timeLabels)}>
            {hours.slice(1).map((hour, index) => (
              <div
                key={hour}
                {...stylex.props(
                  styles.timeLabel,
                  styles.timeLabelPosition(index + 1, hourHeight),
                )}>
                {formatHour(hour)}
              </div>
            ))}
          </div>
          <div {...stylex.props(styles.timeColumns)}>
            {days.map((day, index) => {
              const currentTimeTop = getCurrentTimeTop({
                currentTime,
                day,
                timezoneID,
                minHour: normalizedMinHour,
                maxHour: normalizedMaxHour,
              });
              return (
                <div
                  key={plainDateToISO(day)}
                  {...stylex.props(
                    styles.timeColumn,
                    styles.timeColumnRows(hourHeight),
                    index === days.length - 1 && styles.timeColumnLast,
                  )}>
                  {hours.map((hour, index) => (
                    <div
                      key={hour}
                      {...stylex.props(
                        styles.hourSlot,
                        index === hours.length - 1 && styles.hourSlotLast,
                      )}
                    />
                  ))}
                  {getTimedEventLayouts({
                    events: instantEvents.filter(event =>
                      eventOccursOnDate(event, day, timezoneID),
                    ),
                    day,
                    timezoneID,
                    minHour: normalizedMinHour,
                    maxHour: normalizedMaxHour,
                  }).map(({event, height, level, top}) => {
                    const timeLabel = formatEventTime(event, day, timezoneID);
                    const category = getEventCategory(event, categories);
                    return (
                      <div
                        key={event.id}
                        {...stylex.props(
                          styles.timedEvent,
                          styles.timedEventPosition(
                            clamp(top, 0, 100),
                            clamp(height, 4, 100),
                            level,
                          ),
                          isEventInPast(event, currentTime, timezoneID)
                            ? eventPastSurfaceColorStyle(category.color)
                            : eventSurfaceColorStyle(category.color),
                        )}>
                        <Text
                          type="supporting"
                          color="inherit"
                          weight="bold"
                          xstyle={styles.eventTitle}>
                          {event.title}
                        </Text>
                        <Text
                          type="supporting"
                          color="inherit"
                          xstyle={styles.eventTime}>
                          {timeLabel}
                        </Text>
                      </div>
                    );
                  })}
                  {plainDateIsEqual(day, currentDate) &&
                    currentTimeTop != null && (
                      <div
                        aria-hidden
                        {...stylex.props(
                          styles.currentTimeLine(currentTimeTop),
                        )}
                      />
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function TimeGridAccessibilityGrid({
  allDayEvents,
  categories,
  days,
  events,
  focusDate,
  hours,
  timezoneID,
  timezoneLabel,
}: {
  allDayEvents: ReadonlyArray<CalendarDayEvent>;
  categories: ReadonlyArray<ScheduleCategory>;
  days: ReadonlyArray<PlainDate>;
  events: ReadonlyArray<CalendarInstantEvent>;
  focusDate: PlainDate;
  hours: ReadonlyArray<number>;
  timezoneID: string;
  timezoneLabel: string;
}) {
  return (
    <div
      role="grid"
      aria-label="Schedule time grid"
      aria-readonly
      {...stylex.props(styles.visuallyHidden)}>
      <div role="row">
        <div role="columnheader" aria-colindex={1}>
          Time
        </div>
        {days.map((day, index) => (
          <div
            key={plainDateToISO(day)}
            role="columnheader"
            aria-colindex={index + 2}
            aria-current={
              plainDateIsEqual(day, focusDate) ? 'date' : undefined
            }>
            {formatFullDate(day, timezoneID)}
          </div>
        ))}
      </div>
      <div role="row">
        <div role="rowheader" aria-colindex={1}>
          {timezoneLabel} all day
        </div>
        {days.map((day, index) => {
          const cellEvents = allDayEvents.filter(event =>
            eventOccursOnDate(event, day, timezoneID),
          );
          return (
            <div
              key={plainDateToISO(day)}
              role="gridcell"
              aria-colindex={index + 2}
              aria-label={formatTimeGridAccessibilityCellLabel({
                categories,
                day,
                events: cellEvents,
                label: `${formatFullDate(day, timezoneID)} all day`,
                timezoneID,
              })}
            />
          );
        })}
      </div>
      {hours.map(hour => (
        <div key={hour} role="row">
          <div role="rowheader" aria-colindex={1}>
            {formatHour(hour)}
          </div>
          {days.map((day, index) => {
            const cellEvents = events.filter(event =>
              eventOverlapsHour(event, day, hour, timezoneID),
            );
            return (
              <div
                key={plainDateToISO(day)}
                role="gridcell"
                aria-colindex={index + 2}
                aria-label={formatTimeGridAccessibilityCellLabel({
                  categories,
                  day,
                  events: cellEvents,
                  label: `${formatFullDate(day, timezoneID)} ${formatHour(
                    hour,
                  )}`,
                  timezoneID,
                })}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function formatTimeGridAccessibilityCellLabel({
  categories,
  day,
  events,
  label,
  timezoneID,
}: {
  categories: ReadonlyArray<ScheduleCategory>;
  day: PlainDate;
  events: ReadonlyArray<CalendarEvent>;
  label: string;
  timezoneID: string;
}): string {
  if (events.length === 0) {
    return label;
  }
  const eventLabels = events.map(event =>
    formatEventAccessibilityLabel(event, day, timezoneID, categories),
  );
  return `${label}. ${eventLabels.join('. ')}`;
}

function eventOverlapsHour(
  event: CalendarInstantEvent,
  day: PlainDate,
  hour: number,
  timezoneID: string,
): boolean {
  if (!eventOccursOnDate(event, day, timezoneID)) {
    return false;
  }
  const hourStart = plainDateToInstant(day, timezoneID, hour);
  const hourEnd =
    hour === 23
      ? plainDateToInstant(plainDateAddDays(day, 1), timezoneID)
      : plainDateToInstant(day, timezoneID, hour + 1);
  return event.start < hourEnd && event.end > hourStart;
}

interface AllDayEventSegment {
  event: CalendarDayEvent;
  columnStart: number;
  columnEnd: number;
  level: number;
}

function getAllDayEventSegments(
  events: ReadonlyArray<CalendarDayEvent>,
  days: ReadonlyArray<PlainDate>,
): AllDayEventSegment[] {
  const levels: number[] = [];
  return events
    .map(event => {
      const startIndex = days.findIndex(
        day => !plainDateIsBefore(day, event.start),
      );
      const endIndexFromRight = [...days]
        .reverse()
        .findIndex(day => !plainDateIsBefore(event.end, day));
      if (startIndex < 0 || endIndexFromRight < 0) {
        return null;
      }
      const endIndex = days.length - 1 - endIndexFromRight;
      return {event, startIndex, endIndex};
    })
    .filter(
      (
        segment,
      ): segment is {
        event: CalendarDayEvent;
        startIndex: number;
        endIndex: number;
      } => segment != null,
    )
    .sort((a, b) => {
      if (a.startIndex !== b.startIndex) {
        return a.startIndex - b.startIndex;
      }
      const aDuration = a.endIndex - a.startIndex;
      const bDuration = b.endIndex - b.startIndex;
      return (
        bDuration - aDuration || a.event.title.localeCompare(b.event.title)
      );
    })
    .map(({event, startIndex, endIndex}) => {
      const level = getAvailableAllDayLevel(levels, startIndex);
      levels[level] = endIndex;
      return {
        event,
        columnStart: startIndex,
        columnEnd: endIndex,
        level,
      };
    });
}

function getAvailableAllDayLevel(
  levels: number[],
  columnStart: number,
): number {
  const level = levels.findIndex(columnEnd => columnStart > columnEnd);
  return level >= 0 ? level : levels.length;
}

interface TimedEventLayout {
  event: CalendarInstantEvent;
  top: number;
  height: number;
  level: number;
}

function getTimedEventLayouts({
  events,
  day,
  timezoneID,
  minHour,
  maxHour,
}: {
  events: ReadonlyArray<CalendarInstantEvent>;
  day: PlainDate;
  timezoneID: string;
  minHour: number;
  maxHour: number;
}): TimedEventLayout[] {
  const totalMinutes = (maxHour - minHour) * 60;
  const levelEndMinutes: number[] = [];

  return events
    .map(event => {
      const startDate = plainDateFromInstant(event.start, timezoneID);
      const rawStart = plainDateIsBefore(startDate, day)
        ? 0
        : getMinutesSinceStartOfDay(event.start, timezoneID);
      const rawEnd = eventSpansPastDay(event, day, timezoneID)
        ? 24 * 60
        : getMinutesSinceStartOfDay(event.end, timezoneID);
      const minMinute = minHour * 60;
      const maxMinute = maxHour * 60;
      if (rawEnd <= minMinute || rawStart >= maxMinute) {
        return null;
      }
      const visibleStart = Math.max(rawStart, minMinute);
      const visibleEnd = Math.min(
        maxMinute,
        Math.max(visibleStart + 15, rawEnd),
      );
      return {event, visibleStart, visibleEnd};
    })
    .filter(
      (
        layout,
      ): layout is {
        event: CalendarInstantEvent;
        visibleStart: number;
        visibleEnd: number;
      } => layout != null && layout.visibleEnd > layout.visibleStart,
    )
    .sort((a, b) => {
      if (a.visibleStart !== b.visibleStart) {
        return a.visibleStart - b.visibleStart;
      }
      return (
        a.visibleEnd - b.visibleEnd ||
        a.event.title.localeCompare(b.event.title)
      );
    })
    .map(({event, visibleEnd, visibleStart}) => {
      const level = getAvailableTimedEventLevel(levelEndMinutes, visibleStart);
      levelEndMinutes[level] = visibleEnd;
      return {
        event,
        level,
        top: ((visibleStart - minHour * 60) / totalMinutes) * 100,
        height: ((visibleEnd - visibleStart) / totalMinutes) * 100,
      };
    });
}

function getAvailableTimedEventLevel(
  levelEndMinutes: number[],
  visibleStart: number,
): number {
  const level = levelEndMinutes.findIndex(
    endMinute => visibleStart >= endMinute,
  );
  return level >= 0 ? level : levelEndMinutes.length;
}

function getCurrentTimeTop({
  currentTime,
  day,
  timezoneID,
  minHour,
  maxHour,
}: {
  currentTime: number;
  day: PlainDate;
  timezoneID: string;
  minHour: number;
  maxHour: number;
}): number | null {
  const currentDate = plainDateFromInstant(currentTime, timezoneID);
  if (!plainDateIsEqual(day, currentDate)) {
    return null;
  }
  const currentMinute = getMinutesSinceStartOfDay(currentTime, timezoneID);
  const minMinute = minHour * 60;
  const maxMinute = maxHour * 60;
  if (currentMinute < minMinute || currentMinute > maxMinute) {
    return null;
  }
  return ((currentMinute - minMinute) / (maxMinute - minMinute)) * 100;
}
