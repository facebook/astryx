// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Public Schedule API concepts
 * @output Event, view, date, loader, and context types for Schedule
 * @position Public type surface; consumed by Schedule implementation and exports
 */

import type {ReactNode} from 'react';
import type {PlainDate} from '@xds/core/utils';
import type {CalendarEvent} from './CalendarEvent';
import type {ZonedDateTime, ZonedDateTimeRange} from './zonedDateTime';

export type {PlainDate} from '@xds/core/utils';
export type {
  CalendarDayEvent,
  CalendarEvent,
  CalendarEventBase,
  CalendarInstantEvent,
  ScheduleCategory,
  ScheduleEventColor,
} from './CalendarEvent';
export type {ZonedDateTime, ZonedDateTimeRange} from './zonedDateTime';

/** Unix epoch milliseconds. */
export type Instant = number;

export type ScheduleEventSource =
  | ReadonlyArray<CalendarEvent>
  | ((start: Instant, end: Instant) => Promise<ReadonlyArray<CalendarEvent>>);

export type ScheduleDate = Instant;

export interface ScheduleRange {
  startDate: PlainDate;
  endDate: PlainDate;
  start: Instant;
  end: Instant;
}

export type ScheduleViewOptions = object;

export interface ScheduleViewComponentProps<
  Options extends ScheduleViewOptions = ScheduleViewOptions,
> {
  options: Options;
}

export interface ScheduleNavigationRange {
  label: string;
  range: ZonedDateTimeRange;
}

export type ScheduleViewComponent<
  Options extends ScheduleViewOptions = ScheduleViewOptions,
> = (props: ScheduleViewComponentProps<Options>) => ReactNode;

export interface ScheduleViewBase {
  getDateRange: (date: ZonedDateTime) => ZonedDateTimeRange;
  getPreviousDateRange: (date: ZonedDateTime) => ScheduleNavigationRange;
  getNextDateRange: (date: ZonedDateTime) => ScheduleNavigationRange;
}

export interface ScheduleView<
  Options extends ScheduleViewOptions = ScheduleViewOptions,
> extends ScheduleViewBase {
  component: ScheduleViewComponent<Options>;
  options: Options;
}

export interface ScheduleHeaderContent {
  startContent: ReactNode;
  centerContent: ReactNode;
  endContent: ReactNode;
}

export type SchedulePluginPosition = 'start' | 'end';

export interface SchedulePlugin {
  renderHeader?: (
    startContent: ReactNode,
    centerContent: ReactNode,
    endContent: ReactNode,
  ) => ScheduleHeaderContent;
}
