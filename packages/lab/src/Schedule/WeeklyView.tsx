// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file WeeklyView.tsx
 * @input XDSSchedule context and weekly view options
 * @output Week time-grid schedule view factory
 * @position Concrete schedule view; exported as createXDSScheduleWeeklyView
 */

import {plainDateAddDays, plainDateSetStartOfWeek} from '@xds/core/utils';
import {enumerateDates, getScheduleRangeFromDates} from './dateMath';
import {useXDSScheduleContext} from './context';
import {
  formatWeekTitle,
  ScheduleFrame,
  ScheduleRangeMonthTitle,
} from './shared';
import {TimeGridView} from './TimeGridView';
import {scheduleRangeToZonedDateTimeRange} from './zonedDateTime';
import type {
  PlainDate,
  XDSScheduleView,
  XDSScheduleViewComponentProps,
} from './types';

export interface XDSScheduleWeeklyViewOptions {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minHour?: number;
  maxHour?: number;
  hourHeight?: number;
}

function XDSScheduleWeeklyView({
  options,
}: XDSScheduleViewComponentProps<XDSScheduleWeeklyViewOptions>) {
  const {events, focusDate, timezoneID, range, isLoading} =
    useXDSScheduleContext();
  const {minHour = 0, maxHour = 24, hourHeight = 100} = options;
  const days = enumerateDates(range.startDate, range.endDate);
  const highlightedDate = focusDate.toPlainDate();
  const titleLabel = formatWeekTitle(
    days[0],
    days[days.length - 1],
    timezoneID,
  );

  return (
    <ScheduleFrame
      title={
        <ScheduleRangeMonthTitle
          start={days[0]}
          end={days[days.length - 1]}
          timezoneID={timezoneID}
        />
      }
      titleLabel={titleLabel}
      isLoading={isLoading}>
      <TimeGridView
        days={days}
        events={events}
        focusDate={highlightedDate}
        timezoneID={timezoneID}
        minHour={minHour}
        maxHour={maxHour}
        hourHeight={hourHeight}
      />
    </ScheduleFrame>
  );
}

export function createXDSScheduleWeeklyView({
  weekStartsOn = 0,
  minHour = 0,
  maxHour = 24,
  hourHeight = 100,
}: XDSScheduleWeeklyViewOptions = {}): XDSScheduleView<XDSScheduleWeeklyViewOptions> {
  return {
    component: XDSScheduleWeeklyView,
    options: {weekStartsOn, minHour, maxHour, hourHeight},
    getDateRange: date => {
      const range = getWeekDateRange({
        date: date.toPlainDate(),
        timezoneID: date.timezoneID,
        weekStartsOn,
      });
      return scheduleRangeToZonedDateTimeRange(range, date.timezoneID);
    },
    getPreviousDateRange: date => {
      const range = getWeekDateRange({
        date: plainDateAddDays(date.toPlainDate(), -7),
        timezoneID: date.timezoneID,
        weekStartsOn,
      });
      return {
        label: 'Previous week',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID),
      };
    },
    getNextDateRange: date => {
      const range = getWeekDateRange({
        date: plainDateAddDays(date.toPlainDate(), 7),
        timezoneID: date.timezoneID,
        weekStartsOn,
      });
      return {
        label: 'Next week',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID),
      };
    },
  };
}

function getWeekDateRange({
  date,
  timezoneID,
  weekStartsOn,
}: {
  date: PlainDate;
  timezoneID: string;
  weekStartsOn: number;
}) {
  const startDate = plainDateSetStartOfWeek(date, weekStartsOn);
  return getScheduleRangeFromDates({
    startDate,
    endDate: plainDateAddDays(startDate, 7),
    timezoneID,
  });
}
