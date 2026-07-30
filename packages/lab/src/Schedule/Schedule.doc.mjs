// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */

export const docs = {
  name: 'Schedule',
  displayName: 'Schedule',
  group: 'Schedule',
  category: 'Content',

  usage: {
    description:
      'Schedule is a read-only calendar surface that renders events as a month grid, a day or week time grid, or a list grouped by day — the layout comes from a view object you pass in. It handles timezone-aware date math, paging between ranges, and async event loading, and exposes header slots that plugins fill with navigation controls. Use it to display an existing schedule; it has no event selection, creation, or editing affordances.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Hold the rendered date in state and wire onChangeDate to it. Schedule never advances the date itself, so without that handler the built-in previous/Today/next controls render but nothing moves.',
      },
      {
        guidance: true,
        description:
          'Match the view to the density of the data: a month grid for at-a-glance load, a day or week time grid when start and end times matter, a list when the schedule is sparse.',
      },
      {
        guidance: true,
        description:
          'Give each event a category string that matches a categories entry so its color is meaningful and screen readers announce the category name. An unmatched name still renders, but always in blue.',
      },
      {
        guidance: false,
        description:
          'Reach for Schedule when the user has to pick a date. It has no selection model — use DateInput, DateRangeInput, or Calendar instead.',
      },
      {
        guidance: false,
        description:
          'Rely on event color alone to carry meaning. Only ten colors exist, so they repeat on larger category sets; the accessible label already announces title, category, and time.',
      },
      {
        guidance: false,
        description:
          'Pass a custom plugins array without re-adding the pagination plugin unless you deliberately want no navigation controls — a custom array replaces the default set rather than extending it.',
      },
    ],
    anatomy: [
      {
        name: 'Header start slot',
        required: false,
        description:
          'Leading header region filled by plugins. The default plugin set renders a previous / Today / next button group here.',
      },
      {
        name: 'Header title',
        required: true,
        description:
          'A level-2 heading naming the range on screen, e.g. "May 2026". The same text is the accessible name of the schedule region.',
      },
      {
        name: 'Loading spinner',
        required: false,
        description:
          'Sits beside the title while an async events loader is still pending, labelled "Loading events".',
      },
      {
        name: 'Header end slot',
        required: false,
        description:
          'Trailing header region, empty by default. The view selector plugin renders its menu here.',
      },
      {
        name: 'View body',
        required: true,
        description:
          'Whatever the view renders: a month grid, a day/week time grid with an hour gutter and an all-day row, or a list grouped under day headings. Grid views expose ARIA grid, columnheader, and gridcell roles and are marked aria-readonly.',
      },
      {
        name: 'Event',
        required: false,
        description:
          'One pill (grid views) or row with a color dot (list view) per event, tinted by its category and dimmed once it is in the past.',
      },
      {
        name: 'Current time line',
        required: false,
        description:
          'A line across the day or week time grid at the current time, on the current day only. It ticks once a minute and is absent during server rendering.',
      },
    ],
  },

  props: [
    {
      name: 'view',
      type: 'ScheduleView<Options>',
      description:
        'The view object that owns the layout and the date range each page covers. Build one with createScheduleMonthlyView, createScheduleWeeklyView, createScheduleDayView, or createScheduleListView; each factory takes its own options (weekStartsOn, minHour/maxHour/hourHeight, days).',
      required: true,
    },
    {
      name: 'events',
      type: 'ReadonlyArray<CalendarEvent> | ((start: Instant, end: Instant) => Promise<ReadonlyArray<CalendarEvent>>)',
      description:
        "Either a static array, filtered to the events overlapping the rendered range and sorted by start, or a loader called with that range's start and end epoch milliseconds. A loader suspends while pending — the header shows a spinner and the view renders empty. Results are cached per loader identity and range, so keep the loader reference stable (useCallback) or every re-render refetches.",
      required: true,
    },
    {
      name: 'categories',
      type: "ReadonlyArray<{label: string, color: 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray'}>",
      description:
        'Category definitions matched to each event by label === event.category. The match supplies the event\'s color and the category name in its accessible label. An event whose category names no entry keeps that name but falls back to blue; an event with no category is announced as "Event" in blue.',
      default: '[]',
    },
    {
      name: 'date',
      type: 'Instant',
      description:
        'Unix epoch milliseconds anywhere inside the range to render; the view expands it to a full month, week, day, or list window. Fully controlled — Schedule never changes it, so pair it with onChangeDate.',
      required: true,
    },
    {
      name: 'focusDate',
      type: 'Instant',
      description:
        'Unix epoch milliseconds marking the day treated as "today": in the month, week, and day views that cell gets aria-current="date" and the highlighted styling. The list view ignores it. When omitted it is captured once at mount and never advances afterwards.',
      default: 'Date.now() at mount',
    },
    {
      name: 'onChangeDate',
      type: '(date: Instant) => void',
      description:
        "Called with the epoch milliseconds to render next when a pagination plugin pages backward or forward, or when Today is pressed. Paging preserves the time of day; Today passes the current time. This is the component's only callback — there is no event-level interaction.",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description:
        'IANA timezone ID (e.g. "America/Los_Angeles") used for every date calculation and every formatted label, so the same events regroup across days when it changes.',
      default: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
    },
    {
      name: 'plugins',
      type: 'ReadonlyArray<SchedulePlugin>',
      description:
        'Header plugins, applied in order; each may wrap or replace the start, center, and end header content. Supplying an array replaces the default pagination controls — compose useSchedulePaginationPlugin and useScheduleViewSelectorPlugin to keep both.',
      default: 'defaultSchedulePlugins',
    },
    {
      name: 'headingLevel',
      type: '2 | 3 | 4 | 5 | 6',
      description:
        'Heading level for sub-headings inside the schedule — the weekday and day column headers in the grid views, and the day headings in the list view — so the schedule nests correctly under the surrounding page outline. The header range title is always a level-2 heading.',
      default: '3',
    },
  ],
};
