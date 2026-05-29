// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file context.tsx
 * @input Resolved XDSSchedule events, range, timezone, and active date
 * @output Schedule context object and hook used by view components
 * @position Internal context bridge between generic XDSSchedule and concrete views
 */

import {createContext, useContext} from 'react';
import type {
  CalendarEvent,
  ScheduleRange,
  ZonedDateTime,
  XDSScheduleCategory,
  XDSSchedulePlugin,
  XDSScheduleViewBase,
} from './types';

export interface XDSScheduleContextValue {
  events: ReadonlyArray<CalendarEvent>;
  categories: ReadonlyArray<XDSScheduleCategory>;
  date: ZonedDateTime;
  focusDate: ZonedDateTime;
  timezoneID: string;
  range: ScheduleRange;
  isLoading: boolean;
  onPreviousDate: () => void;
  previousDateLabel: string;
  onToday: () => void;
  onNextDate: () => void;
  nextDateLabel: string;
  view: XDSScheduleViewBase;
  plugins: ReadonlyArray<XDSSchedulePlugin>;
}

export const XDSScheduleContext = createContext<XDSScheduleContextValue | null>(
  null,
);

export function useXDSScheduleContext(): XDSScheduleContextValue {
  const context = useContext(XDSScheduleContext);
  if (context == null) {
    throw new Error('XDSSchedule views must be rendered inside XDSSchedule.');
  }
  return context;
}
