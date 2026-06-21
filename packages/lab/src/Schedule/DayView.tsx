// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DayView.tsx
 * @input Schedule context and day view options
 * @output Single-day time-grid schedule view factory
 * @position Concrete schedule view; exported as createScheduleDayView
 */

import {
  DATE_FORMAT_WITH_WEEKDAY,
  plainDateAddDays,
  plainDateFormat,
} from '@xds/core/utils';
import {enumerateDates, getScheduleRangeFromDates} from './dateMath';
import {useScheduleContext} from './context';
import {ScheduleMonthTitle, ScheduleFrame} from './shared';
import {TimeGridView} from './TimeGridView';
import {scheduleRangeToZonedDateTimeRange} from './zonedDateTime';
import type {
  PlainDate,
  ScheduleView,
  ScheduleViewComponentProps,
} from './types';

export interface ScheduleDayViewOptions {
  minHour?: number;
  maxHour?: number;
  hourHeight?: number;
}

function ScheduleDayView({
  options,
}: ScheduleViewComponentProps<ScheduleDayViewOptions>) {
  const {events, date, focusDate, timezoneID, range, isLoading} =
    useScheduleContext();
  const {minHour = 0, maxHour = 24, hourHeight = 100} = options;
  const rangeDate = date.toPlainDate();
  const days = enumerateDates(range.startDate, range.endDate);
  const titleLabel = plainDateFormat(rangeDate, DATE_FORMAT_WITH_WEEKDAY);

  return (
    <ScheduleFrame
      title={<ScheduleMonthTitle date={rangeDate} timezoneID={timezoneID} />}
      titleLabel={titleLabel}
      isLoading={isLoading}>
      <TimeGridView
        days={days}
        events={events}
        focusDate={focusDate.toPlainDate()}
        timezoneID={timezoneID}
        minHour={minHour}
        maxHour={maxHour}
        hourHeight={hourHeight}
      />
    </ScheduleFrame>
  );
}

export function createScheduleDayView({
  minHour = 0,
  maxHour = 24,
  hourHeight = 100,
}: ScheduleDayViewOptions = {}): ScheduleView<ScheduleDayViewOptions> {
  return {
    component: ScheduleDayView,
    options: {minHour, maxHour, hourHeight},
    getDateRange: date => {
      const range = getDayDateRange({
        date: date.toPlainDate(),
        timezoneID: date.timezoneID,
      });
      return scheduleRangeToZonedDateTimeRange(range, date.timezoneID);
    },
    getPreviousDateRange: date => {
      const range = getDayDateRange({
        date: plainDateAddDays(date.toPlainDate(), -1),
        timezoneID: date.timezoneID,
      });
      return {
        label: 'Previous day',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID),
      };
    },
    getNextDateRange: date => {
      const range = getDayDateRange({
        date: plainDateAddDays(date.toPlainDate(), 1),
        timezoneID: date.timezoneID,
      });
      return {
        label: 'Next day',
        range: scheduleRangeToZonedDateTimeRange(range, date.timezoneID),
      };
    },
  };
}

function getDayDateRange({
  date,
  timezoneID,
}: {
  date: PlainDate;
  timezoneID: string;
}) {
  return getScheduleRangeFromDates({
    startDate: date,
    endDate: plainDateAddDays(date, 1),
    timezoneID,
  });
}
