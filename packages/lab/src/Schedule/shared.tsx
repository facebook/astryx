// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file shared.tsx
 * @input Schedule events, dates, timezone IDs, and display metadata
 * @output Shared rendering primitives, formatters, and styles for schedule views
 * @position Internal view utility module; consumed by Monthly, Weekly, Day, and List views
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  borderVars,
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '@xds/core/theme/tokens.stylex';
import {Spinner} from '@xds/core/Spinner';
import {HStack} from '@xds/core/Stack';
import {Heading, Text} from '@xds/core/Text';
import {
  plainDateFromInstant,
  plainDateIsAfter,
  plainDateIsBefore,
  plainDateToInstant,
  type PlainDate,
} from '@xds/core/utils';
import {isDayEvent} from './dateMath';
import {useScheduleContext} from './context';
import type {
  CalendarEvent,
  CalendarInstantEvent,
  Instant,
  ScheduleCategory,
  ScheduleHeaderContent,
  ScheduleEventColor,
} from './types';

const DEFAULT_EVENT_CATEGORY: ScheduleCategory = {
  label: 'Event',
  color: 'blue',
};

export function ScheduleFrame({
  title,
  titleLabel,
  isLoading,
  children,
}: {
  title: ReactNode;
  titleLabel: string;
  isLoading: boolean;
  children: ReactNode;
}) {
  const {plugins} = useScheduleContext();
  const initialHeader: ScheduleHeaderContent = {
    startContent: null,
    centerContent: (
      <span {...stylex.props(styles.headerTitleContent)}>
        <Heading level={2}>{title}</Heading>
        <span
          {...stylex.props(
            styles.loadingSpinner,
            !isLoading && styles.loadingSpinnerHidden,
          )}>
          <Spinner size="md" aria-label="Loading events" />
        </span>
      </span>
    ),
    endContent: null,
  };
  const header = plugins.reduce(
    (content, plugin) =>
      plugin.renderHeader?.(
        content.startContent,
        content.centerContent,
        content.endContent,
      ) ?? content,
    initialHeader,
  );

  return (
    <section {...stylex.props(styles.frame)} aria-label={titleLabel}>
      <div {...stylex.props(styles.header)}>
        <HStack gap={8} align="center" xstyle={styles.headerControls}>
          {header.startContent}
        </HStack>
        <HStack gap={8} align="center" xstyle={styles.headerTitle}>
          {header.centerContent}
        </HStack>
        <HStack
          gap={8}
          align="center"
          justify="end"
          xstyle={styles.headerStatus}>
          {header.endContent}
        </HStack>
      </div>
      {children}
    </section>
  );
}

export function ScheduleMonthTitle({
  date,
  timezoneID,
}: {
  date: PlainDate;
  timezoneID: string;
}) {
  const month = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    timeZone: timezoneID,
  }).format(new Date(Date.UTC(date.year, date.month - 1, date.day, 12)));
  return (
    <>
      <span {...stylex.props(styles.titleEmphasis)}>{month}</span> {date.year}
    </>
  );
}

export function ScheduleRangeMonthTitle({
  start,
  end,
  timezoneID,
}: {
  start: PlainDate;
  end: PlainDate;
  timezoneID: string;
}) {
  if (start.year === end.year && start.month === end.month) {
    return <ScheduleMonthTitle date={start} timezoneID={timezoneID} />;
  }

  const startMonth = formatWithPlainDate(start, timezoneID, {month: 'long'});
  const endMonth = formatWithPlainDate(end, timezoneID, {month: 'long'});
  return start.year === end.year ? (
    <>
      <span {...stylex.props(styles.titleEmphasis)}>{startMonth}</span> -{' '}
      <span {...stylex.props(styles.titleEmphasis)}>{endMonth}</span> {end.year}
    </>
  ) : (
    <>
      <span {...stylex.props(styles.titleEmphasis)}>{startMonth}</span>{' '}
      {start.year} -{' '}
      <span {...stylex.props(styles.titleEmphasis)}>{endMonth}</span> {end.year}
    </>
  );
}

export function EventPill({
  event,
  day,
  timezoneID,
  isPast = false,
}: {
  event: CalendarEvent;
  day?: PlainDate;
  timezoneID?: string;
  isPast?: boolean;
}) {
  const {categories} = useScheduleContext();
  const category = getEventCategory(event, categories);
  const timeLabel =
    day != null && timezoneID != null && !isDayEvent(event)
      ? formatEventTime(event, day, timezoneID)
      : null;
  return (
    <span
      {...stylex.props(
        styles.eventPill,
        isPast
          ? eventPastSurfaceColorStyle(category.color)
          : eventSurfaceColorStyle(category.color),
      )}>
      {timeLabel != null && (
        <Text type="supporting" color="inherit" xstyle={styles.eventTime}>
          {timeLabel}
        </Text>
      )}
      <Text
        type="supporting"
        color="inherit"
        weight="bold"
        xstyle={styles.eventTitle}>
        {event.title}
      </Text>
    </span>
  );
}

export function MonthEventPill({
  event,
  timezoneID,
  isPast = false,
}: {
  event: CalendarEvent;
  timezoneID: string;
  isPast?: boolean;
}) {
  const {categories} = useScheduleContext();
  const category = getEventCategory(event, categories);
  const timeLabel = isDayEvent(event)
    ? null
    : formatEventStartTime(event, timezoneID);
  return (
    <span
      {...stylex.props(
        styles.eventPill,
        isPast
          ? eventPastSurfaceColorStyle(category.color)
          : eventSurfaceColorStyle(category.color),
      )}>
      {timeLabel != null && (
        <Text type="supporting" color="inherit" xstyle={styles.eventTime}>
          {timeLabel}
        </Text>
      )}
      <Text
        type="supporting"
        color="inherit"
        weight="bold"
        xstyle={styles.eventTitle}>
        {event.title}
      </Text>
    </span>
  );
}

export function ListEventRow({
  event,
  timezoneID,
  isPast = false,
}: {
  event: CalendarEvent;
  timezoneID: string;
  isPast?: boolean;
}) {
  const {categories} = useScheduleContext();
  const category = getEventCategory(event, categories);
  return (
    <div {...stylex.props(styles.listEventRow, isPast && styles.listEventPast)}>
      <span
        aria-hidden
        {...stylex.props(
          styles.listEventDot,
          eventDotColorStyle(category.color),
        )}
      />
      <span {...stylex.props(styles.listEventTime)}>
        {isDayEvent(event)
          ? 'All day'
          : formatEventTimeRange(event, timezoneID)}
      </span>
      <span {...stylex.props(styles.listEventTitle)}>{event.title}</span>
    </div>
  );
}

export function getEventCategory(
  event: CalendarEvent,
  categories: ReadonlyArray<ScheduleCategory>,
): ScheduleCategory {
  return (
    categories.find(category => category.label === event.category) ??
    (event.category != null
      ? {label: event.category, color: DEFAULT_EVENT_CATEGORY.color}
      : DEFAULT_EVENT_CATEGORY)
  );
}

export function eventColorStyle(color: ScheduleEventColor | undefined) {
  switch (color) {
    case 'cyan':
      return styles.eventCyan;
    case 'gray':
      return styles.eventGray;
    case 'green':
      return styles.eventGreen;
    case 'orange':
      return styles.eventOrange;
    case 'pink':
      return styles.eventPink;
    case 'purple':
      return styles.eventPurple;
    case 'red':
      return styles.eventRed;
    case 'teal':
      return styles.eventTeal;
    case 'yellow':
      return styles.eventYellow;
    case 'blue':
    default:
      return styles.eventBlue;
  }
}

export function eventDotColorStyle(color: ScheduleEventColor | undefined) {
  switch (color) {
    case 'cyan':
      return styles.eventDotCyan;
    case 'gray':
      return styles.eventDotGray;
    case 'green':
      return styles.eventDotGreen;
    case 'orange':
      return styles.eventDotOrange;
    case 'pink':
      return styles.eventDotPink;
    case 'purple':
      return styles.eventDotPurple;
    case 'red':
      return styles.eventDotRed;
    case 'teal':
      return styles.eventDotTeal;
    case 'yellow':
      return styles.eventDotYellow;
    case 'blue':
    default:
      return styles.eventDotBlue;
  }
}

export function eventSurfaceColorStyle(
  color: ScheduleEventColor | undefined,
) {
  switch (color) {
    case 'cyan':
      return styles.eventSurfaceCyan;
    case 'gray':
      return styles.eventSurfaceGray;
    case 'green':
      return styles.eventSurfaceGreen;
    case 'orange':
      return styles.eventSurfaceOrange;
    case 'pink':
      return styles.eventSurfacePink;
    case 'purple':
      return styles.eventSurfacePurple;
    case 'red':
      return styles.eventSurfaceRed;
    case 'teal':
      return styles.eventSurfaceTeal;
    case 'yellow':
      return styles.eventSurfaceYellow;
    case 'blue':
    default:
      return styles.eventSurfaceBlue;
  }
}

export function eventPastSurfaceColorStyle(
  color: ScheduleEventColor | undefined,
) {
  switch (color) {
    case 'cyan':
      return styles.eventPastSurfaceCyan;
    case 'gray':
      return styles.eventPastSurfaceGray;
    case 'green':
      return styles.eventPastSurfaceGreen;
    case 'orange':
      return styles.eventPastSurfaceOrange;
    case 'pink':
      return styles.eventPastSurfacePink;
    case 'purple':
      return styles.eventPastSurfacePurple;
    case 'red':
      return styles.eventPastSurfaceRed;
    case 'teal':
      return styles.eventPastSurfaceTeal;
    case 'yellow':
      return styles.eventPastSurfaceYellow;
    case 'blue':
    default:
      return styles.eventPastSurfaceBlue;
  }
}

export function formatWithPlainDate(
  date: PlainDate,
  timezoneID: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(undefined, {
    ...options,
    timeZone: timezoneID,
  }).format(new Date(plainDateToInstant(date, timezoneID, 12)));
}

export function formatMonthTitle(date: PlainDate, timezoneID: string): string {
  return formatWithPlainDate(date, timezoneID, {
    month: 'long',
    year: 'numeric',
  });
}

export function formatWeekTitle(
  start: PlainDate,
  end: PlainDate,
  timezoneID: string,
): string {
  if (start.year === end.year && start.month === end.month) {
    return formatMonthTitle(start, timezoneID);
  }
  const startMonth = formatWithPlainDate(start, timezoneID, {month: 'long'});
  const endMonth = formatWithPlainDate(end, timezoneID, {month: 'long'});
  return start.year === end.year
    ? `${startMonth} - ${endMonth} ${end.year}`
    : `${startMonth} ${start.year} - ${endMonth} ${end.year}`;
}

export function formatRangeTitle(
  start: PlainDate,
  end: PlainDate,
  timezoneID: string,
): string {
  return `${formatShortDate(start, timezoneID)} - ${formatShortDate(
    end,
    timezoneID,
  )}`;
}

export function formatFullDate(date: PlainDate, timezoneID: string): string {
  return formatWithPlainDate(date, timezoneID, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(date: PlainDate, timezoneID: string): string {
  return formatWithPlainDate(date, timezoneID, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatWeekday(
  date: PlainDate,
  timezoneID: string,
  weekday: 'short' | 'long',
): string {
  return formatWithPlainDate(date, timezoneID, {weekday});
}

export function formatDayNumber(date: PlainDate, timezoneID: string): string {
  return formatWithPlainDate(date, timezoneID, {day: 'numeric'});
}

export function formatHour(hour: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2026, 0, 1, hour)));
}

export function formatTimezoneAbbreviation(
  date: PlainDate,
  timezoneID: string,
): string {
  const part = new Intl.DateTimeFormat(undefined, {
    timeZone: timezoneID,
    timeZoneName: 'short',
  })
    .formatToParts(new Date(plainDateToInstant(date, timezoneID, 12)))
    .find(({type}) => type === 'timeZoneName');
  return part?.value ?? timezoneID;
}

export function formatEventTime(
  event: CalendarInstantEvent,
  day: PlainDate,
  timezoneID: string,
): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneID,
  });
  return `${formatter.format(new Date(event.start))} - ${formatter.format(
    new Date(event.end),
  )}`;
}

export function formatEventTimeRange(
  event: CalendarInstantEvent,
  timezoneID: string,
): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneID,
  });
  return `${formatter.format(new Date(event.start))} - ${formatter.format(
    new Date(event.end),
  )}`;
}

export function formatEventStartTime(
  event: CalendarInstantEvent,
  timezoneID: string,
): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneID,
  }).format(new Date(event.start));
}

export function formatEventAccessibilityLabel(
  event: CalendarEvent,
  day: PlainDate,
  timezoneID: string,
  categories: ReadonlyArray<ScheduleCategory>,
): string {
  const category = getEventCategory(event, categories);
  const timeLabel = isDayEvent(event)
    ? 'all day'
    : formatEventTime(event, day, timezoneID);
  return `${event.title}, ${category.label}, ${timeLabel}`;
}

export function getMinutesSinceStartOfDay(
  instant: number,
  timezoneID: string,
): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneID,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const lookup = Object.fromEntries(
    parts
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, Number(part.value)]),
  );
  return lookup.hour * 60 + lookup.minute;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function eventSpansPastDay(
  event: CalendarInstantEvent,
  day: PlainDate,
  timezoneID: string,
): boolean {
  return plainDateIsAfter(
    plainDateFromInstant(Math.max(event.end - 1, event.start), timezoneID),
    day,
  );
}

export function isEventInPast(
  event: CalendarEvent,
  currentTime: Instant,
  timezoneID: string,
): boolean {
  if (isDayEvent(event)) {
    return plainDateIsBefore(
      event.end,
      plainDateFromInstant(currentTime, timezoneID),
    );
  }
  return event.end <= currentTime;
}

const baseText = {
  fontFamily: typographyVars['--font-family-body'],
  color: colorVars['--color-text-primary'],
};

export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
  },
  frame: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-card'],
    overflow: 'hidden',
  },
  header: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  headerControls: {
    justifySelf: 'start',
  },
  headerTitle: {
    justifySelf: 'center',
    textAlign: 'center',
    minWidth: 0,
  },
  headerTitleContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  loadingSpinner: {
    display: 'inline-flex',
  },
  loadingSpinnerHidden: {
    visibility: 'hidden',
  },
  headerStatus: {
    justifySelf: 'end',
    minWidth: 0,
  },
  titleEmphasis: {
    fontWeight: fontWeightVars['--font-weight-bold'],
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  weekHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  weekdayLabel: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    textAlign: 'center',
  },
  weekdayHeading: {
    textAlign: 'center',
  },
  monthGrid: {
    overflowX: 'auto',
  },
  monthGridSurface: {
    position: 'relative',
    width: '100%',
    minWidth: '784px',
  },
  monthCellGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gridAutoRows: '128px',
  },
  monthGridRow: {
    display: 'contents',
  },
  monthEventOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gridAutoRows: '128px',
    pointerEvents: 'none',
  },
  monthCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    minWidth: 0,
    padding: 0,
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
    borderBlockEndWidth: borderVars['--border-width'],
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-border'],
    backgroundColor: colorVars['--color-background-card'],
  },
  monthCellLastColumn: {
    borderInlineEndWidth: 0,
  },
  monthCellLastRow: {
    borderBlockEndWidth: 0,
  },
  monthCellOutside: {
    backgroundColor: colorVars['--color-background-muted'],
  },
  monthDayNumber: {
    alignSelf: 'flex-start',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '24px',
    height: '24px',
    margin: spacingVars['--spacing-0-5'],
    paddingInlineStart: spacingVars['--spacing-1'],
    paddingInlineEnd: 0,
    borderRadius: radiusVars['--radius-full'],
    color: colorVars['--color-text-secondary'],
  },
  currentDayPill: {
    color: colorVars['--color-on-accent'],
    backgroundColor: colorVars['--color-accent'],
  },
  monthEventStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    minWidth: 0,
  },
  monthEventSpan: (
    week: number,
    columnStart: number,
    columnEnd: number,
    level: number,
  ) => ({
    gridRow: `${week + 1}`,
    gridColumn: `${columnStart + 1} / ${columnEnd + 2}`,
    alignSelf: 'start',
    minWidth: 0,
    marginInlineStart: spacingVars['--spacing-0-5'],
    marginInlineEnd: `calc(${spacingVars['--spacing-0-5']} + ${borderVars['--border-width']})`,
    marginBlockStart: `${30 + level * 29}px`,
    pointerEvents: 'auto',
    zIndex: 1,
  }),
  eventPill: {
    ...baseText,
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    minWidth: 0,
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderRadius: radiusVars['--radius-inner'],
    paddingBlock: spacingVars['--spacing-0-5'],
    paddingInline: spacingVars['--spacing-1-5'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  eventTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  eventTime: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    opacity: 0.8,
  },
  moreEvents: {
    ...baseText,
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  timeGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '60px minmax(0, 1fr)',
    gridTemplateRows: '56px auto 1fr',
    height: '640px',
    minHeight: 0,
    overflow: 'hidden',
  },
  timeGridCorner: {
    gridColumn: 1,
    gridRow: 1,
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  timeGridHeader: {
    gridColumn: 2,
    gridRow: 1,
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(140px, 1fr)',
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  timeGridHeaderCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-0-5'],
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
  },
  timeGridHeaderCellLast: {
    borderInlineEndWidth: 0,
  },
  timeGridHeaderHeading: {
    textAlign: 'center',
  },
  timeGridHeaderHeadingContent: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-1'],
  },
  timeGridDayNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusVars['--radius-full'],
  },
  timeGridCurrentDayPill: {
    minWidth: '30px',
    height: '30px',
    lineHeight: '30px',
    color: colorVars['--color-on-accent'],
    backgroundColor: colorVars['--color-accent'],
  },
  allDayLabel: {
    gridColumn: 1,
    gridRow: 2,
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  allDayRow: {
    gridColumn: 2,
    gridRow: 2,
    overflowX: 'auto',
    minHeight: 0,
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  allDayRowSurface: (columnCount: number, levelCount: number) => ({
    position: 'relative',
    width: '100%',
    minWidth: `${Math.max(1, columnCount) * 140}px`,
    minHeight: levelCount > 0 ? `${3 + levelCount * 27}px` : '26px',
  }),
  allDayCellGrid: (columnCount: number) => ({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.max(1, columnCount)}, minmax(0, 1fr))`,
  }),
  allDayEventOverlay: (columnCount: number) => ({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.max(1, columnCount)}, minmax(0, 1fr))`,
    pointerEvents: 'none',
  }),
  allDayCell: {
    minWidth: 0,
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
  },
  allDayCellLast: {
    borderInlineEndWidth: 0,
  },
  allDayEventSpan: (columnStart: number, columnEnd: number, level: number) => ({
    gridColumn: `${columnStart + 1} / ${columnEnd + 2}`,
    alignSelf: 'start',
    minWidth: 0,
    marginInlineStart: spacingVars['--spacing-0-5'],
    marginInlineEnd: `calc(${spacingVars['--spacing-0-5']} + ${borderVars['--border-width']})`,
    marginBlockStart: `${2 + level * 27}px`,
    pointerEvents: 'auto',
  }),
  timeGridBody: {
    gridColumn: '1 / -1',
    gridRow: 3,
    display: 'grid',
    gridTemplateColumns: '60px minmax(0, 1fr)',
    overflow: 'auto',
    minHeight: 0,
  },
  timeLabels: {
    gridColumn: 1,
    position: 'relative',
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
  },
  timeLabel: {
    ...baseText,
    position: 'absolute',
    insetInline: 0,
    transform: 'translateY(-50%)',
    paddingInlineStart: spacingVars['--spacing-1'],
    paddingInlineEnd: spacingVars['--spacing-1'],
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    textAlign: 'end',
  },
  timeLabelPosition: (index: number, hourHeight: number) => ({
    top: `${index * hourHeight - 1}px`,
  }),
  timeColumns: {
    gridColumn: 2,
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(140px, 1fr)',
    minWidth: 0,
  },
  timeColumn: {
    position: 'relative',
    display: 'grid',
    minWidth: 0,
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
  },
  timeColumnRows: (hourHeight: number) => ({
    gridAutoRows: `${hourHeight}px`,
  }),
  timeColumnLast: {
    borderInlineEndWidth: 0,
  },
  hourSlot: {
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  hourSlotLast: {
    borderBottomWidth: 0,
  },
  timedEvent: {
    ...baseText,
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minHeight: '24px',
    minWidth: 0,
    overflow: 'hidden',
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderRadius: radiusVars['--radius-inner'],
    paddingBlockStart: spacingVars['--spacing-0-5'],
    paddingBlockEnd: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  timedEventPosition: (top: number, height: number, level: number) => ({
    top: `calc(${top}% + 2px)`,
    height: `calc(${height}% - 5px)`,
    insetInlineStart:
      level === 0
        ? spacingVars['--spacing-0-5']
        : `calc(${spacingVars['--spacing-0-5']} + ${level * 8}%)`,
    insetInlineEnd: spacingVars['--spacing-0-5'],
    zIndex: level + 1,
  }),
  currentTimeLine: (top: number) => ({
    position: 'absolute',
    insetInline: 0,
    top: `calc(${top}% + 2px)`,
    borderTopWidth: '2px',
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-border-orange'],
    zIndex: 20,
    pointerEvents: 'none',
    '::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: '-6px',
      top: '-6px',
      width: '10px',
      height: '10px',
      borderRadius: radiusVars['--radius-full'],
      backgroundColor: colorVars['--color-border-orange'],
    },
  }),
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  listDay: {
    display: 'grid',
    gridTemplateColumns: '88px minmax(0, 1fr)',
    alignItems: 'start',
    columnGap: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  listDayLast: {
    borderBottomWidth: 0,
  },
  listDayHeading: {
    gridColumn: '1',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    columnGap: spacingVars['--spacing-2'],
    marginBlockStart: `calc(${spacingVars['--spacing-1']} * -1)`,
    marginInlineStart: `calc(${spacingVars['--spacing-1']} * -1)`,
  },
  listDayNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '30px',
    height: '30px',
    borderRadius: radiusVars['--radius-full'],
  },
  listDayNumberText: {
    fontWeight: fontWeightVars['--font-weight-bold'],
  },
  listDayNumberCurrent: {
    justifyContent: 'center',
    color: colorVars['--color-on-accent'],
    backgroundColor: colorVars['--color-accent'],
  },
  listEvents: {
    gridColumn: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    minWidth: 0,
  },
  listNowRow: {
    position: 'relative',
    height: '10px',
    marginBlock: spacingVars['--spacing-0-5'],
    '::before': {
      content: '""',
      position: 'absolute',
      insetInline: 0,
      top: '4px',
      borderTopWidth: '2px',
      borderTopStyle: 'solid',
      borderTopColor: colorVars['--color-border-orange'],
    },
    '::after': {
      content: '""',
      position: 'absolute',
      insetInlineStart: '-1px',
      top: 0,
      width: '10px',
      height: '10px',
      borderRadius: radiusVars['--radius-full'],
      backgroundColor: colorVars['--color-border-orange'],
    },
  },
  listEventRow: {
    display: 'grid',
    gridTemplateColumns: '12px 144px minmax(0, 1fr)',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    minWidth: 0,
  },
  listEventDot: {
    width: '10px',
    height: '10px',
    borderRadius: radiusVars['--radius-full'],
  },
  listEventTime: {
    ...baseText,
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    whiteSpace: 'nowrap',
  },
  listEventTitle: {
    ...baseText,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  listEventPast: {
    opacity: 0.5,
  },
  eventBlue: {
    color: colorVars['--color-text-blue'],
    backgroundColor: colorVars['--color-background-blue'],
    borderColor: colorVars['--color-border-blue'],
  },
  eventDotBlue: {
    backgroundColor: colorVars['--color-border-blue'],
  },
  eventSurfaceBlue: {
    color: colorVars['--color-text-blue'],
    borderColor: colorVars['--color-border-blue'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-blue']} 20%, ${colorVars['--color-background-card']})`,
  },
  eventPastSurfaceBlue: {
    color: `color-mix(in srgb, ${colorVars['--color-text-blue']} 52%, ${colorVars['--color-text-secondary']})`,
    borderColor: `color-mix(in srgb, ${colorVars['--color-border-blue']} 48%, ${colorVars['--color-border']})`,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-blue']} 10%, ${colorVars['--color-background-card']})`,
  },
  eventCyan: {
    color: colorVars['--color-text-cyan'],
    backgroundColor: colorVars['--color-background-cyan'],
    borderColor: colorVars['--color-border-cyan'],
  },
  eventDotCyan: {
    backgroundColor: colorVars['--color-border-cyan'],
  },
  eventSurfaceCyan: {
    color: colorVars['--color-text-cyan'],
    borderColor: colorVars['--color-border-cyan'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-cyan']} 20%, ${colorVars['--color-background-card']})`,
  },
  eventPastSurfaceCyan: {
    color: `color-mix(in srgb, ${colorVars['--color-text-cyan']} 52%, ${colorVars['--color-text-secondary']})`,
    borderColor: `color-mix(in srgb, ${colorVars['--color-border-cyan']} 48%, ${colorVars['--color-border']})`,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-cyan']} 10%, ${colorVars['--color-background-card']})`,
  },
  eventGray: {
    color: colorVars['--color-text-gray'],
    backgroundColor: colorVars['--color-background-gray'],
    borderColor: colorVars['--color-border-gray'],
  },
  eventDotGray: {
    backgroundColor: colorVars['--color-text-secondary'],
  },
  eventSurfaceGray: {
    color: colorVars['--color-text-gray'],
    borderColor: colorVars['--color-border-gray'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-gray']} 20%, ${colorVars['--color-background-card']})`,
  },
  eventPastSurfaceGray: {
    color: colorVars['--color-text-secondary'],
    borderColor: colorVars['--color-border'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-gray']} 10%, ${colorVars['--color-background-card']})`,
  },
  eventGreen: {
    color: colorVars['--color-text-green'],
    backgroundColor: colorVars['--color-background-green'],
    borderColor: colorVars['--color-border-green'],
  },
  eventDotGreen: {
    backgroundColor: colorVars['--color-border-green'],
  },
  eventSurfaceGreen: {
    color: colorVars['--color-text-green'],
    borderColor: colorVars['--color-border-green'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-green']} 20%, ${colorVars['--color-background-card']})`,
  },
  eventPastSurfaceGreen: {
    color: `color-mix(in srgb, ${colorVars['--color-text-green']} 52%, ${colorVars['--color-text-secondary']})`,
    borderColor: `color-mix(in srgb, ${colorVars['--color-border-green']} 48%, ${colorVars['--color-border']})`,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-green']} 10%, ${colorVars['--color-background-card']})`,
  },
  eventOrange: {
    color: colorVars['--color-text-orange'],
    backgroundColor: colorVars['--color-background-orange'],
    borderColor: colorVars['--color-border-orange'],
  },
  eventDotOrange: {
    backgroundColor: colorVars['--color-border-orange'],
  },
  eventSurfaceOrange: {
    color: colorVars['--color-text-orange'],
    borderColor: colorVars['--color-border-orange'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-orange']} 20%, ${colorVars['--color-background-card']})`,
  },
  eventPastSurfaceOrange: {
    color: `color-mix(in srgb, ${colorVars['--color-text-orange']} 52%, ${colorVars['--color-text-secondary']})`,
    borderColor: `color-mix(in srgb, ${colorVars['--color-border-orange']} 48%, ${colorVars['--color-border']})`,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-orange']} 10%, ${colorVars['--color-background-card']})`,
  },
  eventPink: {
    color: colorVars['--color-text-pink'],
    backgroundColor: colorVars['--color-background-pink'],
    borderColor: colorVars['--color-border-pink'],
  },
  eventDotPink: {
    backgroundColor: colorVars['--color-border-pink'],
  },
  eventSurfacePink: {
    color: colorVars['--color-text-pink'],
    borderColor: colorVars['--color-border-pink'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-pink']} 20%, ${colorVars['--color-background-card']})`,
  },
  eventPastSurfacePink: {
    color: `color-mix(in srgb, ${colorVars['--color-text-pink']} 52%, ${colorVars['--color-text-secondary']})`,
    borderColor: `color-mix(in srgb, ${colorVars['--color-border-pink']} 48%, ${colorVars['--color-border']})`,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-pink']} 10%, ${colorVars['--color-background-card']})`,
  },
  eventPurple: {
    color: colorVars['--color-text-purple'],
    backgroundColor: colorVars['--color-background-purple'],
    borderColor: colorVars['--color-border-purple'],
  },
  eventDotPurple: {
    backgroundColor: colorVars['--color-border-purple'],
  },
  eventSurfacePurple: {
    color: colorVars['--color-text-purple'],
    borderColor: colorVars['--color-border-purple'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-purple']} 20%, ${colorVars['--color-background-card']})`,
  },
  eventPastSurfacePurple: {
    color: `color-mix(in srgb, ${colorVars['--color-text-purple']} 52%, ${colorVars['--color-text-secondary']})`,
    borderColor: `color-mix(in srgb, ${colorVars['--color-border-purple']} 48%, ${colorVars['--color-border']})`,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-purple']} 10%, ${colorVars['--color-background-card']})`,
  },
  eventRed: {
    color: colorVars['--color-text-red'],
    backgroundColor: colorVars['--color-background-red'],
    borderColor: colorVars['--color-border-red'],
  },
  eventDotRed: {
    backgroundColor: colorVars['--color-border-red'],
  },
  eventSurfaceRed: {
    color: colorVars['--color-text-red'],
    borderColor: colorVars['--color-border-red'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-red']} 20%, ${colorVars['--color-background-card']})`,
  },
  eventPastSurfaceRed: {
    color: `color-mix(in srgb, ${colorVars['--color-text-red']} 52%, ${colorVars['--color-text-secondary']})`,
    borderColor: `color-mix(in srgb, ${colorVars['--color-border-red']} 48%, ${colorVars['--color-border']})`,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-red']} 10%, ${colorVars['--color-background-card']})`,
  },
  eventTeal: {
    color: colorVars['--color-text-teal'],
    backgroundColor: colorVars['--color-background-teal'],
    borderColor: colorVars['--color-border-teal'],
  },
  eventDotTeal: {
    backgroundColor: colorVars['--color-border-teal'],
  },
  eventSurfaceTeal: {
    color: colorVars['--color-text-teal'],
    borderColor: colorVars['--color-border-teal'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-teal']} 20%, ${colorVars['--color-background-card']})`,
  },
  eventPastSurfaceTeal: {
    color: `color-mix(in srgb, ${colorVars['--color-text-teal']} 52%, ${colorVars['--color-text-secondary']})`,
    borderColor: `color-mix(in srgb, ${colorVars['--color-border-teal']} 48%, ${colorVars['--color-border']})`,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-teal']} 10%, ${colorVars['--color-background-card']})`,
  },
  eventYellow: {
    color: colorVars['--color-text-yellow'],
    backgroundColor: colorVars['--color-background-yellow'],
    borderColor: colorVars['--color-border-yellow'],
  },
  eventDotYellow: {
    backgroundColor: colorVars['--color-border-yellow'],
  },
  eventSurfaceYellow: {
    color: colorVars['--color-text-yellow'],
    borderColor: colorVars['--color-border-yellow'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-yellow']} 20%, ${colorVars['--color-background-card']})`,
  },
  eventPastSurfaceYellow: {
    color: `color-mix(in srgb, ${colorVars['--color-text-yellow']} 52%, ${colorVars['--color-text-secondary']})`,
    borderColor: `color-mix(in srgb, ${colorVars['--color-border-yellow']} 48%, ${colorVars['--color-border']})`,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-border-yellow']} 10%, ${colorVars['--color-background-card']})`,
  },
});
