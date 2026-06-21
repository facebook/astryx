// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CalendarEvent.ts
 * @input ISO event definitions and PlainDate/Instant primitives
 * @output Calendar event types and event construction helpers
 * @position Public schedule event model; consumed by Schedule and views
 */

import {
  plainDateFromISO,
  type ISODateString,
  type PlainDate,
} from '@xds/core/utils';
import type {TokenColor} from '@xds/core/Token';
import type {Instant} from './types';

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

export type ScheduleEventColor = Exclude<TokenColor, 'default'>;

export interface ScheduleCategory {
  label: string;
  color: ScheduleEventColor;
}

export interface CalendarEventBase {
  id: string;
  title: string;
  category?: string;
}

export interface CalendarDayEvent extends CalendarEventBase {
  start: PlainDate;
  end: PlainDate;
}

export interface CalendarInstantEvent extends CalendarEventBase {
  start: Instant;
  end: Instant;
}

export type CalendarEvent = CalendarDayEvent | CalendarInstantEvent;

export function createEventFromISO({
  id,
  title,
  category,
  start,
  end,
}: {
  id: string;
  title: string;
  category?: CalendarEvent['category'];
  start: string;
  end: string;
}): CalendarEvent {
  if (DATE_ONLY_RE.test(start) && DATE_ONLY_RE.test(end)) {
    return {
      id,
      title,
      category,
      start: plainDateFromISO(start as ISODateString),
      end: plainDateFromISO(end as ISODateString),
    };
  }
  return {
    id,
    title,
    category,
    start: Date.parse(start) as Instant,
    end: Date.parse(end) as Instant,
  };
}
