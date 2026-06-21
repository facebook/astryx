// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file context.tsx
 * @input Resolved Schedule events, range, timezone, and active date
 * @output Schedule context object and hook used by view components
 * @position Internal context bridge between generic Schedule and concrete views
 */

import {createContext, useContext} from 'react';
import type {
  CalendarEvent,
  ScheduleRange,
  ZonedDateTime,
  ScheduleCategory,
  SchedulePlugin,
  ScheduleViewBase,
} from './types';

export interface ScheduleContextValue {
  events: ReadonlyArray<CalendarEvent>;
  categories: ReadonlyArray<ScheduleCategory>;
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
  view: ScheduleViewBase;
  plugins: ReadonlyArray<SchedulePlugin>;
}

export const ScheduleContext = createContext<ScheduleContextValue | null>(
  null,
);

export function useScheduleContext(): ScheduleContextValue {
  const context = useContext(ScheduleContext);
  if (context == null) {
    throw new Error('Schedule views must be rendered inside Schedule.');
  }
  return context;
}
