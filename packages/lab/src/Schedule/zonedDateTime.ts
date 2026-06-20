// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zonedDateTime.ts
 * @input Instant epoch milliseconds and IANA timezone IDs
 * @output Lightweight ZonedDateTime helpers used by Schedule views
 * @position Internal timezone-aware date bridge between schedule shell and views
 */

import {
  plainDateAddDays,
  plainDateFromInstant,
  plainDateToInstant,
  type PlainDate,
} from '@xds/core/utils';
import type {Instant, ScheduleRange, ScheduleDate} from './types';

export interface ZonedDateTime {
  instant: Instant;
  timezoneID: string;
  toPlainDate: () => PlainDate;
  addDays: (days: number) => ZonedDateTime;
  startOfDay: () => ZonedDateTime;
}

export type ZonedDateTimeRange = [ZonedDateTime, ZonedDateTime];

export function createZonedDateTime(
  date: ScheduleDate,
  timezoneID: string,
): ZonedDateTime {
  return zonedDateTimeFromInstant(date as Instant, timezoneID);
}

export function zonedDateTimeFromInstant(
  instant: Instant,
  timezoneID: string,
): ZonedDateTime {
  return {
    instant,
    timezoneID,
    toPlainDate: () => plainDateFromInstant(instant, timezoneID),
    addDays: days => {
      const date = plainDateAddDays(
        plainDateFromInstant(instant, timezoneID),
        days,
      );
      return zonedDateTimeFromInstant(
        plainDateToInstant(date, timezoneID) as Instant,
        timezoneID,
      );
    },
    startOfDay: () => {
      const date = plainDateFromInstant(instant, timezoneID);
      return zonedDateTimeFromInstant(
        plainDateToInstant(date, timezoneID) as Instant,
        timezoneID,
      );
    },
  };
}

export function scheduleRangeToZonedDateTimeRange(
  range: ScheduleRange,
  timezoneID: string,
): ZonedDateTimeRange {
  return [
    zonedDateTimeFromInstant(range.start, timezoneID),
    zonedDateTimeFromInstant(range.end, timezoneID),
  ];
}
