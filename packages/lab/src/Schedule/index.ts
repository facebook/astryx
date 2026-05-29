// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input XDSSchedule implementation and public schedule types
 * @output Public exports for @xds/lab Schedule
 * @position Component entry point; re-exported by packages/lab/src/index.ts
 */

export {XDSSchedule, type XDSScheduleProps} from './XDSSchedule';
export {createEventFromISO} from './CalendarEvent';
export {
  createXDSScheduleMonthlyView,
  type XDSScheduleMonthlyViewOptions,
} from './MonthlyView';
export {
  createXDSScheduleWeeklyView,
  type XDSScheduleWeeklyViewOptions,
} from './WeeklyView';
export {
  createXDSScheduleDayView,
  type XDSScheduleDayViewOptions,
} from './DayView';
export {
  createXDSScheduleListView,
  type XDSScheduleListViewOptions,
} from './ListView';
export {XDSScheduleContext, useXDSScheduleContext} from './context';
export {
  defaultXDSSchedulePlugins,
  useXDSSchedulePaginationPlugin,
  useXDSScheduleViewSelectorPlugin,
} from './plugins';
export type {XDSScheduleContextValue} from './context';
export type {XDSSchedulePaginationPluginOptions} from './plugins/PaginationPlugin';
export type {
  XDSScheduleViewSelectorOption,
  XDSScheduleViewSelectorPluginOptions,
} from './plugins/ViewSelectorPlugin';

export type {
  CalendarDayEvent,
  CalendarEvent,
  CalendarEventBase,
  CalendarInstantEvent,
  Instant,
  PlainDate,
  ScheduleRange,
  ZonedDateTime,
  ZonedDateTimeRange,
  XDSScheduleCategory,
  XDSScheduleDate,
  XDSScheduleEventColor,
  XDSScheduleEventSource,
  XDSScheduleHeaderContent,
  XDSSchedulePlugin,
  XDSSchedulePluginPosition,
  XDSScheduleView,
  XDSScheduleViewBase,
  XDSScheduleViewOptions,
} from './types';
