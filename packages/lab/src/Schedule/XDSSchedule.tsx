// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSSchedule.tsx
 * @input Calendar events, event loader functions, view objects, date/focusDate/timezone props
 * @output Generic read-only schedule shell that renders arbitrary schedule views
 * @position Lab component shell; concrete views live in separate view files
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Schedule/index.ts
 * - /packages/lab/src/Schedule/XDSSchedule.test.tsx
 * - /apps/storybook/stories/Schedule.stories.tsx
 */

import {Suspense, useCallback, useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '@xds/core';
import {mergeProps, plainDateFromInstant, xdsProps} from '@xds/core/utils';
import {eventOverlapsRange, getBrowserTimezoneID, sortEvents} from './dateMath';
import {XDSScheduleContext} from './context';
import {defaultXDSSchedulePlugins} from './plugins';
import {styles} from './shared';
import {createZonedDateTime} from './zonedDateTime';
import type {
  CalendarEvent,
  Instant,
  ScheduleRange,
  XDSScheduleCategory,
  XDSScheduleEventSource,
  XDSSchedulePlugin,
  XDSScheduleView,
  XDSScheduleViewOptions,
  ZonedDateTime,
  ZonedDateTimeRange,
} from './types';

export interface XDSScheduleProps<
  Options extends XDSScheduleViewOptions = XDSScheduleViewOptions,
> extends XDSBaseProps<HTMLDivElement> {
  /** View object returned by a `createXDSSchedule*View()` factory. */
  view: XDSScheduleView<Options>;
  /** Static calendar events or an async loader called with the active Instant range. */
  events: XDSScheduleEventSource;
  /** Category definitions used to style and label events by their `category` value. */
  categories?: ReadonlyArray<XDSScheduleCategory>;
  /** Focused Instant used to choose the currently rendered range. */
  date: Instant;
  /** Instant highlighted as the user's focus/current date. Defaults to mount time. */
  focusDate?: Instant;
  /** Called by pagination plugins when the rendered range should change. */
  onChangeDate?: (date: Instant) => void;
  /** IANA timezone ID used for date math and localized rendering. Defaults to browser timezone. */
  timezoneID?: string;
  /** Header/rendering plugins. Defaults to pagination controls. */
  plugins?: ReadonlyArray<XDSSchedulePlugin>;
}

interface EventRecord {
  status: 'pending' | 'fulfilled' | 'rejected';
  promise: Promise<void>;
  value: ReadonlyArray<CalendarEvent>;
  error: unknown;
}

const eventLoaderCache = new WeakMap<
  Exclude<XDSScheduleEventSource, ReadonlyArray<CalendarEvent>>,
  Map<string, EventRecord>
>();

function readAsyncEvents(
  loader: Exclude<XDSScheduleEventSource, ReadonlyArray<CalendarEvent>>,
  start: Instant,
  end: Instant,
): ReadonlyArray<CalendarEvent> {
  let loaderCache = eventLoaderCache.get(loader);
  if (loaderCache == null) {
    loaderCache = new Map();
    eventLoaderCache.set(loader, loaderCache);
  }

  const key = `${start}:${end}`;
  let record = loaderCache.get(key);
  if (record == null) {
    record = {
      status: 'pending',
      promise: Promise.resolve()
        .then(() => loader(start, end))
        .then(
          value => {
            if (record != null) {
              record.status = 'fulfilled';
              record.value = value;
            }
          },
          error => {
            if (record != null) {
              record.status = 'rejected';
              record.error = error;
            }
          },
        ),
      value: [],
      error: null,
    };
    loaderCache.set(key, record);
  }

  if (record.status === 'pending') {
    throw record.promise;
  }
  if (record.status === 'rejected') {
    throw record.error;
  }
  return record.value;
}

function resolveEvents(
  eventSource: XDSScheduleEventSource,
  range: ScheduleRange,
  timezoneID: string,
): ReadonlyArray<CalendarEvent> {
  const events =
    typeof eventSource === 'function'
      ? readAsyncEvents(eventSource, range.start, range.end)
      : eventSource;
  return sortEvents(
    events.filter(event => eventOverlapsRange(event, range, timezoneID)),
    timezoneID,
  );
}

function getRange<Options extends XDSScheduleViewOptions>(
  view: XDSScheduleView<Options>,
  date: ZonedDateTime,
): ScheduleRange {
  const [start, end] = view.getDateRange(date);
  return {
    start: start.instant,
    end: end.instant,
    startDate: plainDateFromInstant(start.instant, start.timezoneID),
    endDate: plainDateFromInstant(end.instant, end.timezoneID),
  };
}

function ScheduleViewContent<Options extends XDSScheduleViewOptions>({
  view,
  eventSource,
  categories,
  date,
  focusDate,
  isLoading,
  onPreviousDate,
  previousDateLabel,
  onToday,
  onNextDate,
  nextDateLabel,
  plugins,
}: {
  view: XDSScheduleView<Options>;
  eventSource: XDSScheduleEventSource;
  categories: ReadonlyArray<XDSScheduleCategory>;
  date: ZonedDateTime;
  focusDate: ZonedDateTime;
  isLoading: boolean;
  onPreviousDate: () => void;
  previousDateLabel: string;
  onToday: () => void;
  onNextDate: () => void;
  nextDateLabel: string;
  plugins: ReadonlyArray<XDSSchedulePlugin>;
}) {
  const Component = view.component;
  const range = getRange(view, date);
  const events = isLoading
    ? []
    : resolveEvents(eventSource, range, date.timezoneID);

  return (
    <XDSScheduleContext.Provider
      value={{
        events,
        categories,
        date,
        focusDate,
        timezoneID: date.timezoneID,
        range,
        isLoading,
        onPreviousDate,
        previousDateLabel,
        onToday,
        onNextDate,
        nextDateLabel,
        view,
        plugins,
      }}>
      <Component options={view.options} />
    </XDSScheduleContext.Provider>
  );
}

export function XDSSchedule({
  view,
  events,
  categories = [],
  date,
  focusDate: focusDateProp,
  onChangeDate,
  timezoneID: timezoneIDProp,
  plugins = defaultXDSSchedulePlugins,
  xstyle,
  className,
  style,
  ...rest
}: XDSScheduleProps) {
  const timezoneID = timezoneIDProp ?? getBrowserTimezoneID();
  const [internalFocusDate] = useState<Instant>(() => Date.now() as Instant);
  const focusDate = focusDateProp ?? internalFocusDate;
  const zonedDateTime = useMemo(
    () => createZonedDateTime(date, timezoneID),
    [date, timezoneID],
  );
  const focusZonedDateTime = useMemo(
    () => createZonedDateTime(focusDate, timezoneID),
    [focusDate, timezoneID],
  );
  const updateDate = useCallback(
    (nextDate: Instant) => {
      onChangeDate?.(nextDate);
    },
    [onChangeDate],
  );
  const shiftToRange = useCallback(
    (nextRange: ZonedDateTimeRange) => {
      const currentRange = view.getDateRange(zonedDateTime);
      updateDate(
        (zonedDateTime.instant +
          nextRange[0].instant -
          currentRange[0].instant) as Instant,
      );
    },
    [updateDate, view, zonedDateTime],
  );
  const previousDateRange = useMemo(
    () => view.getPreviousDateRange(zonedDateTime),
    [view, zonedDateTime],
  );
  const nextDateRange = useMemo(
    () => view.getNextDateRange(zonedDateTime),
    [view, zonedDateTime],
  );
  const onPreviousDate = useCallback(() => {
    shiftToRange(previousDateRange.range);
  }, [previousDateRange, shiftToRange]);
  const onToday = useCallback(() => {
    updateDate(Date.now() as Instant);
  }, [updateDate]);
  const onNextDate = useCallback(() => {
    shiftToRange(nextDateRange.range);
  }, [nextDateRange, shiftToRange]);

  return (
    <div
      {...rest}
      {...mergeProps(
        xdsProps('schedule'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}>
      <Suspense
        fallback={
          <ScheduleViewContent
            view={view}
            eventSource={[]}
            categories={categories}
            date={zonedDateTime}
            focusDate={focusZonedDateTime}
            isLoading
            onPreviousDate={onPreviousDate}
            previousDateLabel={previousDateRange.label}
            onToday={onToday}
            onNextDate={onNextDate}
            nextDateLabel={nextDateRange.label}
            plugins={plugins}
          />
        }>
        <ScheduleViewContent
          view={view}
          eventSource={events}
          categories={categories}
          date={zonedDateTime}
          focusDate={focusZonedDateTime}
          isLoading={false}
          onPreviousDate={onPreviousDate}
          previousDateLabel={previousDateRange.label}
          onToday={onToday}
          onNextDate={onNextDate}
          nextDateLabel={nextDateRange.label}
          plugins={plugins}
        />
      </Suspense>
    </div>
  );
}
