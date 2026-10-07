// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MonthlyView.tsx
 * @input Schedule context and monthly view options
 * @output Month grid schedule view factory: chips on at most three levels per
 *   week row, and a "+N more" button on a busy day that opens the view's one
 *   popover listing that day's events
 * @position Concrete schedule view; exported as createScheduleMonthlyView
 */

import {useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {layerAnimations} from '@astryxdesign/core/Layer';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {
  focusOutlineStyles,
  plainDateAddDays,
  plainDateAddMonths,
  plainDateIsAfter,
  plainDateIsBefore,
  plainDateIsEqual,
  plainDateSetEndOfWeekExclusive,
  plainDateSetFirstOfMonth,
  plainDateSetStartOfWeek,
  plainDateToISO,
  type PlainDate,
} from '@astryxdesign/core/utils';
import {Heading, Text} from '@astryxdesign/core/Text';
import {enumerateDates, getScheduleRangeFromDates} from './dateMath';
import {useScheduleContext} from './context';
import {
  getEventDateSpan,
  layoutMonthEvents,
  MONTH_VISIBLE_LEVELS,
} from './monthLayout';
import {
  formatDayNumber,
  formatEventAccessibilityLabel,
  formatFullDate,
  formatMonthTitle,
  formatWeekday,
  formatWeekRange,
  isEventInPast,
  ListEventRow,
  MonthEventPill,
  ScheduleFrame,
  ScheduleMonthTitle,
  SchedulePopoverBody,
  styles,
} from './shared';
import {useCurrentTime} from './useCurrentTime';
import {useScheduleViewPopover} from './useScheduleViewPopover';
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
  const {
    events,
    categories,
    date,
    focusDate,
    timezoneID,
    locale,
    range,
    isLoading,
    headingLevel,
  } = useScheduleContext();
  const rangeDate = date.toPlainDate();
  const highlightedDate = focusDate.toPlainDate();
  const currentTime = useCurrentTime();
  const days = enumerateDates(range.startDate, range.endDate);
  const weeks = getWeeks(days);
  const layout = layoutMonthEvents(events, days, timezoneID);
  const overflowByDay = new Map(
    layout.overflow.map(day => [day.dayIndex, day.count]),
  );
  const eventsByDay = getMonthEventsByDay(events, days, timezoneID);
  // Day popover (component:Schedule FR17, AR7): one popover for the grid,
  // opened from a busy day's "+N more" and named by that day's full date.
  const dayByKey = new Map<string, PlainDate>(
    days.map(day => [plainDateToISO(day), day]),
  );
  const monthTitle = formatMonthTitle(rangeDate, timezoneID, locale);
  const tableRef = useRef<HTMLDivElement>(null);
  const dayPopover = useScheduleViewPopover(
    key => {
      const day = key == null ? undefined : dayByKey.get(key);
      return day == null ? monthTitle : formatFullDate(day, timezoneID, locale);
    },
    // A day that stops being busy takes its "+N more" with it; focus lands
    // on that day's cell instead of the page.
    key => {
      tableRef.current
        ?.querySelector<HTMLElement>(`[data-schedule-day="${key}"]`)
        ?.focus();
    },
  );
  const openDay =
    dayPopover.openKey == null ? null : dayByKey.get(dayPopover.openKey);

  return (
    <ScheduleFrame
      title={<ScheduleMonthTitle date={rangeDate} timezoneID={timezoneID} />}
      titleLabel={monthTitle}
      isLoading={isLoading}>
      {/* A table, not an interactive grid (component:Schedule AR7): weekday
          column headers, week row headers, cells named by their full date,
          and no arrow-key promise, so a busy day's "+N more" is an ordinary
          Tab stop. The table scrolls horizontally at narrow viewports and a
          month without a busy day has no focusable descendants, so it is
          focusable itself for keyboard scrolling (axe:
          scrollable-region-focusable). */}
      <div
        ref={tableRef}
        role="table"
        aria-label={monthTitle}
        tabIndex={0}
        {...dayPopover.containerProps}
        {...stylex.props(styles.monthGrid)}>
        <div role="row" {...stylex.props(styles.weekHeader)}>
          <div
            role="columnheader"
            aria-colindex={1}
            {...stylex.props(styles.visuallyHidden)}>
            Week
          </div>
          {days.slice(0, 7).map((day, index) => (
            <div
              key={plainDateToISO(day)}
              role="columnheader"
              aria-label={formatWeekday(day, timezoneID, 'long', locale)}
              aria-colindex={index + 2}
              {...stylex.props(styles.weekdayLabel)}>
              <Heading
                level={headingLevel}
                color="secondary"
                display="block"
                xstyle={styles.weekdayHeading}>
                {formatWeekday(day, timezoneID, 'short', locale)}
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
                <div
                  role="rowheader"
                  aria-colindex={1}
                  {...stylex.props(styles.visuallyHidden)}>
                  {formatWeekRange(
                    week[0],
                    week[week.length - 1],
                    timezoneID,
                    locale,
                  )}
                </div>
                {week.map((day, dayIndex) => {
                  const index = weekIndex * 7 + dayIndex;
                  const isOutsideMonth = day.month !== rangeDate.month;
                  const dayISO = plainDateToISO(day);
                  const dayEvents = eventsByDay.get(dayISO) ?? EMPTY_EVENTS;
                  const hiddenCount = overflowByDay.get(index);
                  return (
                    <div
                      key={plainDateToISO(day)}
                      role="cell"
                      aria-label={formatFullDate(day, timezoneID, locale)}
                      aria-colindex={dayIndex + 2}
                      // Focus lands here when the day's "+N more" goes away.
                      tabIndex={-1}
                      data-schedule-day={dayISO}
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
                        focusOutlineStyles.focusVisible,
                        styles.monthCellFocus,
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
                          {formatDayNumber(day, timezoneID, locale)}
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
                                locale,
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      {hiddenCount != null && (
                        <button
                          type="button"
                          aria-label={`${hiddenCount} more ${
                            hiddenCount === 1 ? 'event' : 'events'
                          }, ${formatFullDate(day, timezoneID, locale)}`}
                          {...dayPopover.getTriggerProps(dayISO)}
                          {...stylex.props(
                            styles.eventButtonReset,
                            styles.monthMoreButton,
                            styles.monthMoreButtonPosition(
                              MONTH_VISIBLE_LEVELS - 1,
                            ),
                            focusOutlineStyles.focusVisible,
                          )}>
                          {/* Isolated, so the count reads "+3 more" in either
                              direction. */}
                          <bdi>+{hiddenCount} more</bdi>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div aria-hidden {...stylex.props(styles.monthEventOverlay)}>
            {layout.chips.map(segment => (
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
      {dayPopover.popover.render(
        openDay == null ? null : (
          <SchedulePopoverBody
            label={`${formatFullDate(openDay, timezoneID, locale)} events`}>
            <MonthDayEvents
              day={openDay}
              events={eventsByDay.get(plainDateToISO(openDay)) ?? EMPTY_EVENTS}
            />
          </SchedulePopoverBody>
        ),
        {
          placement: 'below',
          alignment: 'start',
          offset: spacingVars['--spacing-1'],
          xstyle: layerAnimations.below,
        },
      )}
    </ScheduleFrame>
  );
}

/** The day popover's content: every event of one day, in start order. */
function MonthDayEvents({
  day,
  events,
}: {
  day: PlainDate;
  events: ReadonlyArray<CalendarEvent>;
}) {
  const {timezoneID, locale} = useScheduleContext();
  const currentTime = useCurrentTime();
  return (
    <div {...stylex.props(styles.monthDayEvents)}>
      <Text type="supporting" weight="bold" color="secondary">
        {formatFullDate(day, timezoneID, locale)}
      </Text>
      <ul {...stylex.props(styles.monthDayEventList)}>
        {events.map(event => (
          <li key={event.id}>
            <ListEventRow
              event={event}
              timezoneID={timezoneID}
              isPast={isEventInPast(event, currentTime, timezoneID)}
            />
          </li>
        ))}
      </ul>
    </div>
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
