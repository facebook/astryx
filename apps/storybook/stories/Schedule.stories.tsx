// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useMemo, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  Schedule,
  createScheduleDayView,
  createScheduleListView,
  createScheduleMonthlyView,
  createScheduleWeeklyView,
  createEventFromISO,
  type CalendarEvent,
  type Instant,
  type ScheduleCategory,
  type ScheduleViewSelectorOption,
  useSchedulePaginationPlugin,
  useScheduleViewSelectorPlugin,
} from '@xds/lab';

const storyNow = new Date();
const focusDate = storyNow.getTime() as Instant;
const currentWeekStart = startOfWeek(storyNow);

const categories: ScheduleCategory[] = [
  {label: 'Company', color: 'blue'},
  {label: 'Design', color: 'purple'},
  {label: 'Launch', color: 'green'},
  {label: 'Focus', color: 'teal'},
  {label: 'Holiday', color: 'yellow'},
  {label: 'Retro', color: 'orange'},
  {label: 'Incident', color: 'red'},
  {label: 'Migration', color: 'pink'},
];

const events: CalendarEvent[] = [
  createEventFromISO({
    id: 'all-hands',
    title: 'Company all hands',
    category: 'Company',
    start: dateTimeISO(storyNow, 9),
    end: dateTimeISO(storyNow, 10),
  }),
  createEventFromISO({
    id: 'all-hands-previous-day',
    title: 'Company all hands',
    category: 'Company',
    start: dateTimeISO(addDays(storyNow, -1), 9),
    end: dateTimeISO(addDays(storyNow, -1), 10),
  }),
  createEventFromISO({
    id: 'all-hands-next-day',
    title: 'Company all hands',
    category: 'Company',
    start: dateTimeISO(addDays(storyNow, 1), 9),
    end: dateTimeISO(addDays(storyNow, 1), 10),
  }),
  createEventFromISO({
    id: 'design-review',
    title: 'Design review',
    category: 'Design',
    start: dateTimeISO(storyNow, 11),
    end: dateTimeISO(storyNow, 12, 30),
  }),
  createEventFromISO({
    id: 'launch',
    title: 'Launch window',
    category: 'Launch',
    start: dateISO(addDays(currentWeekStart, 3)),
    end: dateISO(addDays(currentWeekStart, 4)),
  }),
  createEventFromISO({
    id: 'focus-day',
    title: 'Focus day',
    category: 'Focus',
    start: dateISO(storyNow),
    end: dateISO(storyNow),
  }),
  createEventFromISO({
    id: 'company-holiday',
    title: 'Company holiday',
    category: 'Holiday',
    start: dateISO(addDays(currentWeekStart, 6)),
    end: dateISO(addDays(currentWeekStart, 6)),
  }),
  createEventFromISO({
    id: 'retro',
    title: 'Weekly retro',
    category: 'Retro',
    start: dateTimeISO(addDays(currentWeekStart, 5), 14),
    end: dateTimeISO(addDays(currentWeekStart, 5), 15),
  }),
  createEventFromISO({
    id: 'incident',
    title: 'Incident review',
    category: 'Incident',
    start: dateTimeISO(addDays(currentWeekStart, 1), 10, 30),
    end: dateTimeISO(addDays(currentWeekStart, 1), 11, 30),
  }),
  createEventFromISO({
    id: 'overnight-migration',
    title: 'Overnight migration',
    category: 'Migration',
    start: dateTimeISO(addDays(currentWeekStart, 5), 23, 30),
    end: dateTimeISO(addDays(currentWeekStart, 6), 2),
  }),
];

const meta: Meta<typeof Schedule> = {
  title: 'Lab/Schedule',
  component: Schedule,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div style={{padding: 24, minHeight: '100vh'}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Schedule>;

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function startOfWeek(date: Date): Date {
  const startDate = new Date(date);
  startDate.setHours(12, 0, 0, 0);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  return startDate;
}

function dateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateTimeISO(date: Date, hour: number, minute: number = 0): string {
  const dateTime = new Date(date);
  dateTime.setHours(hour, minute, 0, 0);
  return dateTime.toISOString();
}

function makeSeededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function createAsyncEvents(start: Instant, end: Instant): CalendarEvent[] {
  const random = makeSeededRandom(Math.floor(start / 86400000));
  const asyncCategories = categories.slice(0, 6);
  const titles = [
    'Planning sync',
    'Design critique',
    'Customer review',
    'Metrics readout',
    'Launch check',
    'Office hours',
  ];
  const generatedEvents: CalendarEvent[] = [];

  for (let dayStart = start; dayStart < end; dayStart += 24 * 60 * 60 * 1000) {
    const eventCount = 1 + Math.floor(random() * 3);
    const day = new Date(dayStart);

    for (let index = 0; index < eventCount; index++) {
      const startHour = 8 + Math.floor(random() * 8);
      const startMinute = random() > 0.65 ? 30 : 0;
      const durationHours = 1 + Math.floor(random() * 2);
      const title = titles[Math.floor(random() * titles.length)];
      const category =
        asyncCategories[Math.floor(random() * asyncCategories.length)];
      generatedEvents.push(
        createEventFromISO({
          id: `${dayStart}:${index}`,
          title,
          category: category.label,
          start: dateTimeISO(day, startHour, startMinute),
          end: dateTimeISO(day, startHour + durationHours, startMinute),
        }),
      );
    }

    if (random() > 0.68) {
      generatedEvents.push(
        createEventFromISO({
          id: `${dayStart}:all-day`,
          title: 'Focus day',
          category:
            asyncCategories[Math.floor(random() * asyncCategories.length)]
              .label,
          start: dateISO(day),
          end: dateISO(day),
        }),
      );
    }
  }

  return generatedEvents;
}

export const Monthly: Story = {
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(() => createScheduleMonthlyView(), []);

    return (
      <Schedule
        view={view}
        events={events}
        categories={categories}
        date={date}
        focusDate={focusDate}
        onChangeDate={setDate}
        timezoneID="America/Los_Angeles"
      />
    );
  },
};

export const Weekly: Story = {
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(
      () => createScheduleWeeklyView({minHour: 7, maxHour: 19}),
      [],
    );

    return (
      <Schedule
        view={view}
        events={events}
        categories={categories}
        date={date}
        onChangeDate={setDate}
        timezoneID="America/Los_Angeles"
      />
    );
  },
};

export const WeeklyFixedHeight: Story = {
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(
      () => createScheduleWeeklyView({minHour: 7, maxHour: 19}),
      [],
    );

    return (
      <div style={{height: 520}}>
        <Schedule
          view={view}
          events={events}
          categories={categories}
          date={date}
          onChangeDate={setDate}
          timezoneID="America/Los_Angeles"
          style={{height: '100%'}}
        />
      </div>
    );
  },
};

export const Day: Story = {
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(() => createScheduleDayView(), []);

    return (
      <Schedule
        view={view}
        events={events}
        categories={categories}
        date={date}
        focusDate={focusDate}
        onChangeDate={setDate}
        timezoneID="America/Los_Angeles"
      />
    );
  },
};

export const List: Story = {
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(() => createScheduleListView(), []);

    return (
      <Schedule
        view={view}
        events={events}
        categories={categories}
        date={date}
        focusDate={focusDate}
        onChangeDate={setDate}
        timezoneID="America/Los_Angeles"
      />
    );
  },
};

export const AsyncLoader: Story = {
  render: () => {
    const [date, setDate] = useState<Instant>(focusDate);
    const view = useMemo(
      () => createScheduleWeeklyView({minHour: 7, maxHour: 19}),
      [],
    );
    const loadEvents = async (
      start: Instant,
      end: Instant,
    ): Promise<CalendarEvent[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return createAsyncEvents(start, end);
    };

    return (
      <Schedule
        view={view}
        events={loadEvents}
        categories={categories}
        date={date}
        focusDate={focusDate}
        onChangeDate={setDate}
        timezoneID="America/Los_Angeles"
      />
    );
  },
};

export const ViewSelectorPlugin: Story = {
  render: () => {
    const views = useMemo(
      () => ({
        month: createScheduleMonthlyView(),
        week: createScheduleWeeklyView({minHour: 7, maxHour: 19}),
        day: createScheduleDayView({minHour: 8, maxHour: 18}),
        list: createScheduleListView(),
      }),
      [],
    );
    type StoryScheduleView = (typeof views)[keyof typeof views];
    const [view, setView] = useState<StoryScheduleView>(() => views.week);
    const [date, setDate] = useState<Instant>(focusDate);
    const viewOptions = useMemo<
      ReadonlyArray<ScheduleViewSelectorOption<StoryScheduleView>>
    >(
      () => [
        {view: views.month, label: 'Month'},
        {view: views.week, label: 'Week'},
        {view: views.day, label: 'Day'},
        {view: views.list, label: 'List'},
      ],
      [views],
    );
    const paginationPlugin = useSchedulePaginationPlugin();
    const viewSelectorPlugin = useScheduleViewSelectorPlugin(viewOptions, {
      onChangeView: setView,
    });
    const plugins = useMemo(
      () => [paginationPlugin, viewSelectorPlugin],
      [paginationPlugin, viewSelectorPlugin],
    );

    return (
      <Schedule
        view={view}
        events={events}
        categories={categories}
        date={date}
        focusDate={focusDate}
        onChangeDate={setDate}
        timezoneID="America/Los_Angeles"
        plugins={plugins}
      />
    );
  },
};
