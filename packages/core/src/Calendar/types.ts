// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @output Calendar component prop types and interfaces
 * @position Types shared across Calendar component files
 */

import type {XDSBaseProps} from '../XDSBaseProps';
import type {ISODateString, DayOfWeek, DateRange} from '../utils/dateTypes';

export type {ISODateString, DayOfWeek, DateRange} from '../utils/dateTypes';

/** Imperative handle for XDSCalendar handleRef */
export interface XDSCalendarHandle {
  /** Navigate the calendar to show the month containing the given date */
  navigateTo: (date: ISODateString) => void;
}

// ─── Base Props (shared across all modes) ─────────────────────

interface XDSCalendarBaseProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  ref?: React.Ref<HTMLDivElement>;
  handleRef?: React.Ref<XDSCalendarHandle>;
  numberOfMonths?: 1 | 2;
  min?: ISODateString;
  max?: ISODateString;
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
  focusDate?: ISODateString;
  onFocusDateChange?: (focusDate: ISODateString) => void;
  hasOutsideDays?: boolean;
  hasWeekNumbers?: boolean;
  hasVariableRowCount?: boolean;
  weekStartsOn?: DayOfWeek;
}

// ─── Mode-specific Props (discriminated union) ────────────────

interface XDSCalendarSingleProps extends XDSCalendarBaseProps {
  mode?: 'single';
  value?: ISODateString;
  defaultValue?: ISODateString;
  onChange?: (value: ISODateString, valueAsDate: Date) => void;
}

interface XDSCalendarRangeProps extends XDSCalendarBaseProps {
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (value: DateRange) => void;
}

export type XDSCalendarProps = XDSCalendarSingleProps | XDSCalendarRangeProps;
