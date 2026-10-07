// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {useMemo, useState} from 'react';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {createEventFromISO} from './CalendarEvent';
import {Schedule} from './Schedule';
import {createScheduleDayView} from './DayView';
import {createScheduleListView} from './ListView';
import {createScheduleMonthlyView} from './MonthlyView';
import {createScheduleWeeklyView} from './WeeklyView';
import {sortEvents} from './dateMath';
import {formatWithPlainDate} from './shared';
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

describe('Schedule date formatting', () => {
  it('keeps Gregorian fields when options request another calendar', () => {
    expect(
      formatWithPlainDate(
        {year: 2026, month: 8, day: 22},
        'UTC',
        {
          year: 'numeric',
          calendar: 'buddhist',
        },
        'en',
      ),
    ).toBe('2026');
  });

  it('formats Gregorian dates with the requested locale', () => {
    const date = {year: 2026, month: 8, day: 22};
    expect(
      formatWithPlainDate(
        date,
        'UTC',
        {month: 'long', year: 'numeric'},
        'th-TH',
      ),
    ).toBe(
      new Intl.DateTimeFormat('th-TH', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
        calendar: 'gregory',
      }).format(new Date(Date.UTC(2026, 7, 22, 12))),
    );
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

  it('renders monthly dates and times with the provider locale', async () => {
    render(
      <InternationalizationProvider locale="fr-FR">
        <Schedule
          view={createScheduleMonthlyView()}
          events={events}
          categories={categories}
          date={Date.UTC(2026, 4, 13)}
          focusDate={Date.UTC(2026, 4, 13)}
          timezoneID="UTC"
        />
      </InternationalizationProvider>,
    );

    expect(screen.getByRole('heading', {name: 'mai 2026'})).toBeInTheDocument();
    expect(screen.getByRole('grid', {name: 'mai 2026'})).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'mercredi'}),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Visible sync, Sync, 16:00 - 16:30'),
    ).toBeInTheDocument();
  });

  it('renders monthly weekday headings at the configured headingLevel (default 3)', async () => {
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
    expect(screen.getAllByRole('heading', {level: 3}).length).toBeGreaterThan(
      0,
    );
  });

  it('renders list day headings at the configured headingLevel (default 3)', async () => {
    render(
      <Schedule
        view={createScheduleListView({days: 7})}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Visible sync')).toBeInTheDocument();
    });
    expect(screen.getAllByRole('heading', {level: 3}).length).toBeGreaterThan(
      0,
    );
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

  it('makes the scrollable monthly grid keyboard-focusable', () => {
    // The month grid is a horizontal scroll container with no focusable
    // descendants, so it needs tabindex="0" itself for
    // scrollable-region-focusable to pass and for keyboard scrolling.
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

    expect(screen.getByRole('grid', {name: 'May 2026'})).toHaveAttribute(
      'tabindex',
      '0',
    );
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

  it('renders the time grid inside one named scroll viewport', () => {
    render(
      <Schedule
        view={createScheduleWeeklyView({minHour: 8, maxHour: 17})}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    const viewport = screen.getByRole('region', {name: 'May 2026 time grid'});
    const content = viewport.querySelector('[data-scroll-content]');
    expect(content).not.toBeNull();
    // Header cells, the all-day row, the hour gutter, and the day columns are
    // items of the same grid, so no part of the painted header lives outside
    // the viewport's own scrolling content.
    const headerCells = viewport.querySelectorAll('h3');
    expect(headerCells).toHaveLength(7);
    headerCells.forEach(cell => {
      expect(cell.parentElement?.parentElement).toBe(content);
    });
    expect(
      screen.getByText('Visible sync').closest('[data-scroll-content]'),
    ).toBe(content);
    // The hidden read-only grid repeats the hour as a row header; the painted
    // gutter label is the one inside the viewport.
    const gutterLabel = screen
      .getAllByText('9 AM')
      .find(label => viewport.contains(label));
    expect(gutterLabel?.closest('[data-scroll-content]')).toBe(content);
  });

  it('keeps every painted time-grid part hidden from assistive technology', () => {
    render(
      <Schedule
        view={createScheduleWeeklyView({minHour: 8, maxHour: 10})}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );

    const viewport = screen.getByRole('region', {name: 'May 2026 time grid'});
    const content = viewport.querySelector('[data-scroll-content]');
    expect(content).not.toBeNull();
    const parts = Array.from(content?.children ?? []);
    // corner + 7 header cells + all-day label + all-day row + gutter + 7 columns
    expect(parts).toHaveLength(18);
    parts.forEach(part => {
      expect(part).toHaveAttribute('aria-hidden', 'true');
    });
    // The read-only grid stays the accessible representation of the events.
    expect(
      screen.getByRole('gridcell', {
        name: 'Wednesday, May 13, 2026 all day. Design review, Design, all day',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /Visible sync/})).toBeNull();
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

describe('Schedule across a midnight that daylight saving skips', () => {
  // Both zones spring forward at local midnight: the day starts at 01:00.
  const cases = [
    {
      timezoneID: 'America/Santiago',
      date: Date.UTC(2026, 8, 8, 15),
      week: [
        'Sunday, September 6, 2026',
        'Monday, September 7, 2026',
        'Tuesday, September 8, 2026',
        'Wednesday, September 9, 2026',
        'Thursday, September 10, 2026',
        'Friday, September 11, 2026',
        'Saturday, September 12, 2026',
      ],
    },
    {
      timezoneID: 'America/Havana',
      date: Date.UTC(2026, 2, 10, 15),
      week: [
        'Sunday, March 8, 2026',
        'Monday, March 9, 2026',
        'Tuesday, March 10, 2026',
        'Wednesday, March 11, 2026',
        'Thursday, March 12, 2026',
        'Friday, March 13, 2026',
        'Saturday, March 14, 2026',
      ],
    },
  ];
  const renderPopover = () => null;
  const dayGroups = () =>
    screen
      .getAllByRole('group')
      .map(group => group.getAttribute('aria-label') ?? '')
      .filter(name => /, \d{4}$/u.test(name));

  it.each(cases)(
    'keeps seven days in the week and one in the day view in $timezoneID',
    ({timezoneID, date, week}) => {
      const {unmount} = render(
        <Schedule
          view={createScheduleWeeklyView({renderPopover})}
          events={[]}
          date={date}
          timezoneID={timezoneID}
        />,
      );
      expect(dayGroups()).toEqual(week);
      unmount();
      render(
        <Schedule
          view={createScheduleDayView({renderPopover})}
          events={[]}
          date={date - 2 * 24 * 60 * 60 * 1000}
          timezoneID={timezoneID}
        />,
      );
      expect(dayGroups()).toEqual([week[0]]);
    },
  );
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

describe('Schedule event popover', () => {
  const categories: ScheduleCategory[] = [
    {label: 'Sync', color: 'blue'},
    {label: 'Design', color: 'purple'},
  ];
  const events: CalendarEvent[] = [
    createEventFromISO({
      id: 'later',
      title: 'Later sync',
      category: 'Sync',
      start: '2026-05-13T17:00:00.000Z',
      end: '2026-05-13T17:30:00.000Z',
    }),
    createEventFromISO({
      id: 'earlier',
      title: 'Earlier sync',
      category: 'Sync',
      start: '2026-05-13T16:00:00.000Z',
      end: '2026-05-13T16:30:00.000Z',
    }),
    createEventFromISO({
      id: 'tuesday',
      title: 'Tuesday sync',
      category: 'Sync',
      start: '2026-05-12T16:00:00.000Z',
      end: '2026-05-12T16:30:00.000Z',
    }),
    createEventFromISO({
      id: 'all-day',
      title: 'Design review',
      category: 'Design',
      start: '2026-05-13',
      end: '2026-05-13',
    }),
  ];
  const renderPopover = (event: CalendarEvent) => (
    <p>Details for {event.title}</p>
  );

  function renderWeek(
    options: Parameters<typeof createScheduleWeeklyView>[0] = {},
    eventSource: ReadonlyArray<CalendarEvent> = events,
  ) {
    return render(
      <Schedule
        view={createScheduleWeeklyView({minHour: 8, maxHour: 20, ...options})}
        events={eventSource}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );
  }

  function eventButtons() {
    return screen.queryAllByRole('button', {name: /sync|Design review/});
  }

  function dialogOf(button: HTMLElement): HTMLElement {
    const controls = button.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const layer = document.getElementById(controls ?? '');
    expect(layer).not.toBeNull();
    const dialog =
      layer?.getAttribute('role') === 'dialog'
        ? layer
        : layer?.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog).not.toBeNull();
    return dialog as HTMLElement;
  }

  it('keeps the read-only grid and renders no button when the option is absent', () => {
    renderWeek();
    expect(eventButtons()).toEqual([]);
    expect(
      screen.getByRole('grid', {name: 'Schedule time grid'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders each event with content as a named popup button grouped by day', () => {
    renderWeek({renderPopover});
    expect(screen.queryByRole('grid')).toBeNull();
    const allDay = screen.getByRole('group', {name: 'All-day events'});
    const allDayButton = allDay.querySelector('button');
    expect(allDayButton?.getAttribute('aria-label')).toBe(
      'Design review, all day, Design, Wednesday, May 13, 2026',
    );
    const wednesday = screen.getByRole('group', {
      name: 'Wednesday, May 13, 2026',
    });
    expect(
      Array.from(wednesday.querySelectorAll('button')).map(button =>
        button.getAttribute('aria-label'),
      ),
    ).toEqual([
      'Earlier sync, 4:00 PM - 4:30 PM, Sync, Wednesday, May 13, 2026',
      'Later sync, 5:00 PM - 5:30 PM, Sync, Wednesday, May 13, 2026',
    ]);
    for (const button of eventButtons()) {
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button.getAttribute('aria-controls')).toBe(
        eventButtons()[0].getAttribute('aria-controls'),
      );
      expect(button.closest('[aria-hidden="true"]')).toBeNull();
    }
  });

  it('opens one popover named by the event, switches between events, and closes on Escape', () => {
    renderWeek({renderPopover});
    const earlier = screen.getByRole('button', {name: /^Earlier sync/});
    const later = screen.getByRole('button', {name: /^Later sync/});

    fireEvent.click(earlier);
    expect(earlier).toHaveAttribute('aria-expanded', 'true');
    expect(later).toHaveAttribute('aria-expanded', 'false');
    const dialog = dialogOf(earlier);
    expect(dialog).toHaveAttribute('aria-label', 'Earlier sync');
    expect(dialog).toHaveTextContent('Details for Earlier sync');
    // jsdom cannot show a native popover, so the dialog is queried by role
    // attribute rather than through the accessibility tree.
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);

    // A pointer press on another block closes the popover ahead of the
    // browser's light dismiss; the click that follows opens the pressed block.
    fireEvent.pointerDown(later);
    expect(earlier).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(later);
    expect(earlier).toHaveAttribute('aria-expanded', 'false');
    expect(later).toHaveAttribute('aria-expanded', 'true');
    expect(dialogOf(later)).toHaveAttribute('aria-label', 'Later sync');
    expect(dialogOf(later)).toHaveTextContent('Details for Later sync');
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);

    fireEvent.keyDown(dialogOf(later), {key: 'Escape'});
    expect(later).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Details for Later sync')).toBeNull();
  });

  it('closes when the open block is clicked again or dismissed by the browser', () => {
    renderWeek({renderPopover});
    const earlier = screen.getByRole('button', {name: /^Earlier sync/});
    fireEvent.pointerDown(earlier);
    fireEvent.click(earlier);
    expect(earlier).toHaveAttribute('aria-expanded', 'true');
    // The press on the open block closes it, whether or not the browser's
    // light dismiss already did.
    fireEvent.pointerDown(earlier);
    fireEvent.click(earlier);
    expect(earlier).toHaveAttribute('aria-expanded', 'false');

    fireEvent.pointerDown(earlier);
    fireEvent.click(earlier);
    expect(earlier).toHaveAttribute('aria-expanded', 'true');
    // A browser light dismiss reaches the layer as a toggle to closed.
    const layer = document.getElementById(
      earlier.getAttribute('aria-controls') ?? '',
    ) as HTMLElement;
    const toggle = new Event('toggle');
    Object.defineProperty(toggle, 'newState', {value: 'closed'});
    fireEvent(layer, toggle);
    expect(earlier).toHaveAttribute('aria-expanded', 'false');
  });

  it('leaves an event without content read-only but still exposed', () => {
    renderWeek({
      renderPopover: event =>
        event.id === 'later' ? null : renderPopover(event),
    });
    expect(screen.queryByRole('button', {name: /^Later sync/})).toBeNull();
    const wednesday = screen.getByRole('group', {
      name: 'Wednesday, May 13, 2026',
    });
    const staticBlock = wednesday.querySelector(
      '[aria-label^="Later sync"]',
    ) as HTMLElement;
    expect(staticBlock.tagName).toBe('DIV');
    expect(staticBlock).not.toHaveAttribute('aria-haspopup');
    expect(staticBlock.closest('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByRole('button', {name: /^Earlier sync/})).toBeVisible();
  });

  it('re-renders the open content with the event object of the same id and closes when it leaves', () => {
    const {rerender} = renderWeek({renderPopover});
    const view = createScheduleWeeklyView({
      minHour: 8,
      maxHour: 20,
      renderPopover,
    });
    const earlier = screen.getByRole('button', {name: /^Earlier sync/});
    fireEvent.click(earlier);
    expect(dialogOf(earlier)).toHaveTextContent('Details for Earlier sync');

    const renamed = events.map(event =>
      event.id === 'earlier'
        ? {...event, title: 'Earlier sync (moved)'}
        : event,
    );
    rerender(
      <Schedule
        view={view}
        events={renamed}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );
    const renamedButton = screen.getByRole('button', {
      name: /^Earlier sync \(moved\)/,
    });
    expect(renamedButton).toHaveAttribute('aria-expanded', 'true');
    expect(dialogOf(renamedButton)).toHaveAttribute(
      'aria-label',
      'Earlier sync (moved)',
    );
    expect(dialogOf(renamedButton)).toHaveTextContent(
      'Details for Earlier sync (moved)',
    );

    rerender(
      <Schedule
        view={view}
        events={renamed.filter(event => event.id !== 'earlier')}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        focusDate={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );
    expect(screen.queryByRole('button', {name: /^Earlier sync/})).toBeNull();
    expect(screen.queryByText(/Details for Earlier sync/)).toBeNull();
    expect(
      screen.queryAllByRole('button', {name: /sync/, expanded: true}),
    ).toEqual([]);
  });

  it('closes when the range is paged away from the open event', () => {
    function Paged() {
      const [date, setDate] = useState<Instant>(Date.UTC(2026, 4, 13));
      const view = useMemo(
        () =>
          createScheduleWeeklyView({minHour: 8, maxHour: 20, renderPopover}),
        [],
      );
      return (
        <Schedule
          view={view}
          events={events}
          categories={categories}
          date={date}
          onChangeDate={setDate}
          timezoneID="UTC"
        />
      );
    }
    render(<Paged />);
    const earlier = screen.getByRole('button', {name: /^Earlier sync/});
    fireEvent.click(earlier);
    expect(dialogOf(earlier)).toHaveTextContent('Details for Earlier sync');
    fireEvent.click(screen.getByRole('button', {name: 'Next week'}));
    expect(screen.queryByRole('button', {name: /^Earlier sync/})).toBeNull();
    expect(screen.queryByText(/Details for Earlier sync/)).toBeNull();
  });

  it('leaves the month and list views read-only', () => {
    const {rerender} = render(
      <Schedule
        view={createScheduleMonthlyView()}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );
    expect(eventButtons()).toEqual([]);
    rerender(
      <Schedule
        view={createScheduleListView()}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );
    expect(eventButtons()).toEqual([]);
  });

  it('exposes the same option on the day view', () => {
    render(
      <Schedule
        view={createScheduleDayView({minHour: 8, maxHour: 20, renderPopover})}
        events={events}
        categories={categories}
        date={Date.UTC(2026, 4, 13)}
        timezoneID="UTC"
      />,
    );
    const earlier = screen.getByRole('button', {name: /^Earlier sync/});
    fireEvent.click(earlier);
    expect(dialogOf(earlier)).toHaveTextContent('Details for Earlier sync');
  });
});
