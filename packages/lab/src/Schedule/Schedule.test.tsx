// Copyright (c) Meta Platforms, Inc. and affiliates.

import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {createEventFromISO} from './CalendarEvent';
import {Schedule} from './Schedule';
import {createScheduleDayView} from './DayView';
import {createScheduleListView} from './ListView';
import {createScheduleMonthlyView} from './MonthlyView';
import {createScheduleWeeklyView} from './WeeklyView';
import {sortEvents} from './dateMath';
import {useScheduleViewSelectorPlugin} from './plugins/ViewSelectorPlugin';
import type {
  CalendarEvent,
  Instant,
  ScheduleCategory,
  SchedulePlugin,
} from './types';

describe('createEventFromISO', () => {
  it('creates all-day PlainDate events from date-only ISO strings', () => {
    const event = createEventFromISO({
      id: 'planning',
      title: 'Planning offsite',
      category: 'Planning',
      start: '2026-05-13',
      end: '2026-05-14',
    });

    expect(event).toEqual({
      id: 'planning',
      title: 'Planning offsite',
      category: 'Planning',
      start: {year: 2026, month: 5, day: 13},
      end: {year: 2026, month: 5, day: 14},
    });
  });

  it('creates instant events from date-time ISO strings', () => {
    const event = createEventFromISO({
      id: 'standup',
      title: 'Standup',
      start: '2026-05-13T16:00:00.000Z',
      end: '2026-05-13T16:30:00.000Z',
    });

    expect(typeof event.start).toBe('number');
    expect(event.start).toBe(Date.parse('2026-05-13T16:00:00.000Z'));
  });
});

describe('Schedule', () => {
  const categories: ScheduleCategory[] = [
    {label: 'Sync', color: 'blue'},
    {label: 'Design', color: 'purple'},
    {label: 'Blocked', color: 'red'},
    {label: 'Migration', color: 'pink'},
  ];
  const events: CalendarEvent[] = [
    createEventFromISO({
      id: 'visible',
      title: 'Visible sync',
      category: 'Sync',
      start: '2026-05-13T16:00:00.000Z',
      end: '2026-05-13T16:30:00.000Z',
    }),
    createEventFromISO({
      id: 'all-day',
      title: 'Design review',
      category: 'Design',
      start: '2026-05-13',
      end: '2026-05-13',
    }),
    createEventFromISO({
      id: 'outside',
      title: 'Outside range',
      category: 'Blocked',
      start: '2026-08-13',
      end: '2026-08-13',
    }),
  ];

  it('filters array events to the active view range', async () => {
    render(
      <Schedule
        view={createScheduleMonthlyView()}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Visible sync')).toBeInTheDocument();
    });
    expect(screen.getByText('Design review')).toBeInTheDocument();
    expect(screen.queryByText('Outside range')).not.toBeInTheDocument();
  });

  it('loads async events with Instant range boundaries', async () => {
    const loader = vi.fn(
      async (_start: Instant, _end: Instant) =>
        [
          createEventFromISO({
            id: 'async',
            title: 'Loaded event',
            start: '2026-05-13T17:00:00.000Z',
            end: '2026-05-13T18:00:00.000Z',
          }),
        ] as CalendarEvent[],
    );

    render(
      <Schedule
        view={createScheduleDayView()}
        events={loader}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    const [start, end] = loader.mock.calls[0];
    expect(typeof start).toBe('number');
    expect(typeof end).toBe('number');
    expect(start).toBe(Date.UTC(2026, 4, 13));
    expect(end).toBe(Date.UTC(2026, 4, 14));
    expect(await screen.findByText('Loaded event')).toBeInTheDocument();
  });

  it('renders list view grouped by localized day', async () => {
    const listEvents = [
      ...events,
      createEventFromISO({
        id: 'overnight',
        title: 'Overnight migration',
        category: 'Migration',
        start: '2026-05-13T23:00:00.000Z',
        end: '2026-05-14T02:00:00.000Z',
      }),
    ];

    render(
      <Schedule
        view={createScheduleListView({days: 7})}
        events={listEvents}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Wed')).toBeInTheDocument();
    });
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('Visible sync')).toBeInTheDocument();
    expect(screen.getByText('Design review')).toBeInTheDocument();
    expect(screen.getAllByText('11:00 PM - 2:00 AM')).toHaveLength(2);
  });

  it('renders weekly view with the same month title as monthly view', () => {
    render(
      <Schedule
        view={createScheduleWeeklyView()}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    expect(screen.getByRole('region', {name: 'May 2026'})).toBeInTheDocument();
  });

  it('exposes monthly view as an ARIA grid', () => {
    render(
      <Schedule
        view={createScheduleMonthlyView()}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    expect(screen.getByRole('grid', {name: 'May 2026'})).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'Wednesday'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'Wednesday'}),
    ).toHaveAttribute('aria-colindex', '4');
    expect(
      screen.getByRole('gridcell', {name: 'Wednesday, May 13, 2026'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {name: 'Wednesday, May 13, 2026'}),
    ).toHaveAttribute('aria-current', 'date');
    expect(
      screen.getByText('Visible sync, Sync, 4:00 PM - 4:30 PM'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Design review, Design, all day'),
    ).toBeInTheDocument();
  });

  it('exposes time grid views as ARIA grids', () => {
    render(
      <Schedule
        view={createScheduleDayView({minHour: 8, maxHour: 10})}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    expect(
      screen.getByRole('grid', {name: 'Schedule time grid'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'Wednesday, May 13, 2026'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'Wednesday, May 13, 2026'}),
    ).toHaveAttribute('aria-colindex', '2');
    expect(
      screen.getByRole('columnheader', {name: 'Wednesday, May 13, 2026'}),
    ).toHaveAttribute('aria-current', 'date');
    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 all day. Design review, Design, all day',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {name: 'Wednesday, May 13, 2026 8 AM'}),
    ).toBeInTheDocument();
  });

  it('exposes timed events in the accessible time grid cells', () => {
    render(
      <Schedule
        view={createScheduleDayView({minHour: 16, maxHour: 17})}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 4 PM. Visible sync, Sync, 4:00 PM - 4:30 PM',
      }),
    ).toBeInTheDocument();
  });

  it('exposes all-day events in the accessible time grid cells', () => {
    render(
      <Schedule
        view={createScheduleDayView({minHour: 8, maxHour: 10})}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 all day. Design review, Design, all day',
      }),
    ).toBeInTheDocument();
  });

  it('labels list day headings with the full date', () => {
    render(
      <Schedule
        view={createScheduleListView({days: 7})}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    expect(
      screen.getByRole('heading', {name: 'Wednesday, May 13, 2026'}),
    ).toBeInTheDocument();
  });

  it('calls onChangeDate with the previous view date preserving time of day', () => {
    const onChangeDate = vi.fn();
    render(
      <Schedule
        view={createScheduleDayView()}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13, 15, 6) as Instant}
        onChangeDate={onChangeDate}
        timezoneID="UTC"
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Previous day'}));
    expect(onChangeDate).toHaveBeenCalledWith(Date.UTC(2026, 4, 12, 15, 6));
  });

  it('allows plugins to customize header slots', () => {
    const plugin: SchedulePlugin = {
      renderHeader: (_startContent, centerContent, endContent) => ({
        startContent: <span>Custom start</span>,
        centerContent,
        endContent,
      }),
    };

    render(
      <Schedule
        view={createScheduleDayView()}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13) as Instant}
        timezoneID="UTC"
        plugins={[plugin]}
      />,
    );

    expect(screen.getByText('Custom start')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Previous day'}),
    ).not.toBeInTheDocument();
  });

  it('renders a view selector plugin in the header end slot', () => {
    const onChangeView = vi.fn();
    const dayView = createScheduleDayView();
    const monthView = createScheduleMonthlyView();
    const viewOptions = [
      {view: monthView, label: 'Month'},
      {view: dayView, label: 'Day'},
    ];

    function ScheduleWithViewSelector() {
      const viewSelectorPlugin = useScheduleViewSelectorPlugin(viewOptions, {
        onChangeView,
      });
      return (
        <Schedule
          view={dayView}
          events={events}
          categories={categories}
          date={Date.UTC(2026, 4, 13) as Instant}
          timezoneID="UTC"
          plugins={[viewSelectorPlugin]}
        />
      );
    }

    render(<ScheduleWithViewSelector />);

    expect(screen.getByRole('button', {name: /Day/})).toBeInTheDocument();
  });
});

describe('sortEvents', () => {
  it('sorts mixed all-day and instant events by start time', () => {
    const sortedEvents = sortEvents(
      [
        createEventFromISO({
          id: 'instant-later',
          title: 'A later timed event',
          start: '2026-05-14T16:00:00.000Z',
          end: '2026-05-14T17:00:00.000Z',
        }),
        createEventFromISO({
          id: 'all-day-earlier',
          title: 'Z earlier all-day event',
          start: '2026-05-13',
          end: '2026-05-13',
        }),
        createEventFromISO({
          id: 'instant-earliest',
          title: 'Middle timed event',
          start: '2026-05-12T16:00:00.000Z',
          end: '2026-05-12T17:00:00.000Z',
        }),
      ],
      'UTC',
    );

    expect(sortedEvents.map(event => event.id)).toEqual([
      'instant-earliest',
      'all-day-earlier',
      'instant-later',
    ]);
  });
});
