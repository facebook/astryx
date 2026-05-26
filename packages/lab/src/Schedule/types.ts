// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Public XDSSchedule API concepts
 * @output Event, view, date, loader, and context types for XDSSchedule
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
  XDSScheduleCategory,
  XDSScheduleEventColor,
} from './CalendarEvent';
export type {ZonedDateTime, ZonedDateTimeRange} from './zonedDateTime';

/** Unix epoch milliseconds. */
export type Instant = number;

export type XDSScheduleEventSource =
  | ReadonlyArray<CalendarEvent>
  | ((start: Instant, end: Instant) => Promise<ReadonlyArray<CalendarEvent>>);

export type XDSScheduleDate = Instant;

export interface ScheduleRange {
  startDate: PlainDate;
  endDate: PlainDate;
  start: Instant;
  end: Instant;
}

export type XDSScheduleViewOptions = object;

export interface XDSScheduleViewComponentProps<
  Options extends XDSScheduleViewOptions = XDSScheduleViewOptions,
> {
  options: Options;
}

export interface XDSScheduleNavigationRange {
  label: string;
  range: ZonedDateTimeRange;
}

export type XDSScheduleViewComponent<
  Options extends XDSScheduleViewOptions = XDSScheduleViewOptions,
> = (props: XDSScheduleViewComponentProps<Options>) => ReactNode;

export interface XDSScheduleViewBase {
  getDateRange: (date: ZonedDateTime) => ZonedDateTimeRange;
  getPreviousDateRange: (date: ZonedDateTime) => XDSScheduleNavigationRange;
  getNextDateRange: (date: ZonedDateTime) => XDSScheduleNavigationRange;
}

export interface XDSScheduleView<
  Options extends XDSScheduleViewOptions = XDSScheduleViewOptions,
> extends XDSScheduleViewBase {
  component: XDSScheduleViewComponent<Options>;
  options: Options;
}

export interface XDSScheduleHeaderContent {
  startContent: ReactNode;
  centerContent: ReactNode;
  endContent: ReactNode;
}

export type XDSSchedulePluginPosition = 'start' | 'end';

export interface XDSSchedulePlugin {
  renderHeader?: (
    startContent: ReactNode,
    centerContent: ReactNode,
    endContent: ReactNode,
  ) => XDSScheduleHeaderContent;
}
