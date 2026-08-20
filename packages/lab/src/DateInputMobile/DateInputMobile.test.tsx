// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateInputMobile.test.tsx
 * @input Uses vitest, @testing-library/react, DateInputMobile and its helpers
 * @output Behavior coverage for the mobile date picker
 * @position Test file for /packages/lab/src/DateInputMobile/
 *
 * What jsdom can and cannot see here matters, and the split is deliberate:
 *
 * - The month math is pure, so it is tested directly and exhaustively.
 * - Rendering, selection, constraints, the wheels and the sheet are tested
 *   through the DOM, with `clientHeight` stubbed — jsdom has no layout, and
 *   the scroller mounts no panes until it knows how tall a pane is.
 * - Snapping, momentum and the scroll-driven falloff are CSS the browser
 *   resolves and jsdom does not implement at all. Those are asserted on the
 *   style DEFINITION instead (the last describe block), which at least fails
 *   loudly if someone deletes the property; the real verification is a
 *   browser, and the values it produced are recorded in the doc file.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import {render, screen, fireEvent, within} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {useState} from 'react';
import type {ISODateString} from '@astryxdesign/core/utils';
import {DateInputMobile} from './DateInputMobile';
import {
  toMonthIndex,
  monthIndexOf,
  fromMonthIndex,
  clampIndex,
  rowAtScrollTop,
  paneWindow,
  rowsIn,
  DEFAULT_MONTH_REACH,
} from './monthGeometry';

// ---------------------------------------------------------------------------
// jsdom scaffolding
// ---------------------------------------------------------------------------

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

/** One pane at the default 44px day size: 6 rows. */
const PANE = 264;

/**
 * Run `fn` with the month scrollport reporting the height its CSS gives it.
 *
 * jsdom lays nothing out, so `clientHeight` is 0 and the scroller mounts no
 * panes at all. The override is installed only around the render that needs
 * it and torn down immediately: a getter left on `HTMLElement.prototype`
 * makes EVERY later DOM read take a slow path, and measured at ~2.4s per test
 * in this file.
 */
function withLayout<T>(fn: () => T): T {
  // jsdom defines clientHeight on Element.prototype; shadowing it on
  // HTMLElement.prototype and deleting the shadow afterwards restores the
  // original getter without having to copy its descriptor.
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return this.dataset?.scroller === 'months' ? PANE : 0;
    },
  });
  try {
    return fn();
  } finally {
    delete (HTMLElement.prototype as {clientHeight?: unknown}).clientHeight;
  }
}

/** `render`, with the scroller able to measure itself. */
const renderPicker: typeof render = ui => withLayout(() => render(ui));

beforeAll(() => {
  Element.prototype.scrollTo = vi.fn();
  // jsdom's <dialog> implements none of these.
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.open = true;
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  vi.setSystemTime(new Date(2026, 2, 15)); // 15 March 2026, local
});

/**
 * One month's grid. Neighbouring panes render the same dates (a month spills
 * into the next), so every day query has to say which month it means.
 */
function pane(label: string): HTMLElement {
  const grid = screen
    .getAllByRole('grid')
    .find(g => g.getAttribute('aria-label') === label);
  if (grid == null) {
    throw new Error(`no pane for ${label}`);
  }
  return grid;
}

/** The decorative weekday row: the only 7-cell aria-hidden block. */
function weekdayRow(): HTMLElement {
  const row = [...document.querySelectorAll('[aria-hidden="true"]')].find(
    el => el.children.length === 7,
  );
  if (row == null) {
    throw new Error('no weekday row');
  }
  return row as HTMLElement;
}

/**
 * Bounded by default. Unbounded, the scroller mounts seven month panes — 294
 * day buttons — for every render, and under jsdom with StyleX's dev runtime
 * that is seconds a test. Three months exercises the same paths; the tests
 * that are actually about the range pass their own.
 */
const DEFAULT_RANGE = {min: '2026-02-01', max: '2026-04-30'} as const;

function Controlled({
  initial,
  ...props
}: {initial?: ISODateString} & Partial<
  React.ComponentProps<typeof DateInputMobile>
>) {
  const [value, setValue] = useState<ISODateString | undefined>(initial);
  return (
    <DateInputMobile
      label="Event date"
      presentation="inline"
      {...DEFAULT_RANGE}
      value={value}
      onChange={setValue}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Pure month arithmetic
// ---------------------------------------------------------------------------

describe('monthGeometry', () => {
  it('round-trips a month through its index', () => {
    for (const [year, month] of [
      [2026, 1],
      [2026, 12],
      [1976, 7],
      [2100, 2],
    ] as const) {
      expect(fromMonthIndex(toMonthIndex(year, month))).toEqual({year, month});
    }
  });

  it('orders months across a year boundary', () => {
    expect(toMonthIndex(2027, 1) - toMonthIndex(2026, 12)).toBe(1);
  });

  it('reads a month index off a PlainDate, ignoring the day', () => {
    expect(monthIndexOf({year: 2026, month: 3, day: 1})).toBe(
      monthIndexOf({year: 2026, month: 3, day: 31}),
    );
  });

  it('clamps to the reachable range', () => {
    expect(clampIndex(5, 10, 20)).toBe(10);
    expect(clampIndex(25, 10, 20)).toBe(20);
    expect(clampIndex(15, 10, 20)).toBe(15);
  });

  describe('rowAtScrollTop', () => {
    it('maps an exact offset to its row', () => {
      expect(rowAtScrollTop(0, PANE, 100)).toBe(0);
      expect(rowAtScrollTop(PANE * 7, PANE, 100)).toBe(7);
    });

    it('rounds to the nearest row mid-scroll', () => {
      expect(rowAtScrollTop(PANE * 7 + 10, PANE, 100)).toBe(7);
      expect(rowAtScrollTop(PANE * 7 - 10, PANE, 100)).toBe(7);
      expect(rowAtScrollTop(PANE * 6.6, PANE, 100)).toBe(7);
    });

    it('never leaves the list', () => {
      expect(rowAtScrollTop(-500, PANE, 100)).toBe(0);
      expect(rowAtScrollTop(PANE * 1000, PANE, 100)).toBe(99);
    });

    it('is 0 before the pane height is known, rather than dividing by zero', () => {
      expect(rowAtScrollTop(1234, 0, 100)).toBe(0);
    });
  });

  describe('paneWindow', () => {
    it('mounts the overscan on both sides', () => {
      expect(paneWindow(50, 100, 3)).toEqual({start: 47, end: 53});
      expect(rowsIn(paneWindow(50, 100, 1))).toEqual([49, 50, 51]);
    });

    it('truncates at the ends of the list instead of going out of bounds', () => {
      expect(paneWindow(0, 100, 3)).toEqual({start: 0, end: 3});
      expect(paneWindow(99, 100, 3)).toEqual({start: 96, end: 99});
    });
  });

  it('reaches a century in each direction by default', () => {
    expect(DEFAULT_MONTH_REACH).toBe(600);
  });
});

// ---------------------------------------------------------------------------
// The picker surface
// ---------------------------------------------------------------------------

describe('DateInputMobile — calendar surface', () => {
  it('opens on the selected month', () => {
    renderPicker(<Controlled initial="2026-03-21" />);
    expect(
      screen.getByRole('button', {name: /March 2026/}),
    ).toBeInTheDocument();
  });

  it('opens on the current month when there is no value', () => {
    renderPicker(<Controlled />);
    expect(
      screen.getByRole('button', {name: /March 2026/}),
    ).toBeInTheDocument();
  });

  it('mounts a window of months around the visible one, not the whole century', () => {
    // The one test that wants the full default reach.
    renderPicker(
      <Controlled initial="2026-03-21" min={undefined} max={undefined} />,
    );
    const grids = screen.getAllByRole('grid');
    expect(grids.length).toBeGreaterThan(1);
    expect(grids.length).toBeLessThanOrEqual(7);
    expect(grids.map(g => g.getAttribute('aria-label'))).toContain(
      'March 2026',
    );
  });

  it('renders every month as six rows, so panes cannot differ in height', () => {
    renderPicker(<Controlled initial="2026-02-01" />);
    // February 2026 needs only five rows; the pane still has six.
    const february = screen
      .getAllByRole('grid')
      .find(g => g.getAttribute('aria-label') === 'February 2026')!;
    expect(within(february).getAllByRole('row')).toHaveLength(6);
    expect(within(february).getAllByRole('gridcell')).toHaveLength(42);
  });

  it('commits the tapped day', () => {
    const onChange = vi.fn();
    renderPicker(<Controlled initial="2026-03-21" onChange={onChange} />);
    fireEvent.click(
      within(pane('March 2026')).getByRole('button', {name: /March 25, 2026/}),
    );
    expect(onChange).toHaveBeenCalledWith('2026-03-25');
  });

  it('marks the selection and today', () => {
    renderPicker(<Controlled initial="2026-03-21" />);
    const march = within(pane('March 2026'));
    expect(
      march
        .getByRole('button', {name: /March 21, 2026/})
        .closest('[role="gridcell"]'),
    ).toHaveAttribute('aria-selected', 'true');
    expect(march.getByRole('button', {name: /March 15, 2026/})).toHaveAttribute(
      'aria-current',
      'date',
    );
  });

  it('leaves exactly one day per month tab-reachable', () => {
    renderPicker(<Controlled initial="2026-03-21" />);
    const march = pane('March 2026');
    const tabbable = within(march)
      .getAllByRole('button')
      .filter(b => b.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    // The selected day, when the month holds one.
    expect(tabbable[0]).toHaveAttribute('data-date', '2026-03-21');
  });

  it('disables days outside min/max and refuses to commit them', () => {
    const onChange = vi.fn();
    renderPicker(
      <Controlled
        initial="2026-03-10"
        min="2026-03-05"
        max="2026-03-20"
        onChange={onChange}
      />,
    );
    const outOfRange = within(pane('March 2026')).getByRole('button', {
      name: /March 25, 2026/,
    });
    expect(outOfRange).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(outOfRange);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('honors custom date constraints', () => {
    renderPicker(
      <Controlled
        initial="2026-03-10"
        dateConstraints={[date => date.getDay() !== 0]}
      />,
    );
    // 2026-03-01 is a Sunday.
    expect(
      within(pane('March 2026')).getByRole('button', {name: /March 1, 2026/}),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders no adjacent-month days, so a date is on screen in one place only', () => {
    renderPicker(<Controlled initial="2026-03-21" />);
    const march = within(pane('March 2026'));
    // The grid still has 42 cells; the ones outside March are simply empty.
    expect(march.getAllByRole('gridcell')).toHaveLength(42);
    expect(march.getAllByRole('button')).toHaveLength(31);
    expect(march.queryByRole('button', {name: /April 1, 2026/})).toBeNull();
    expect(march.queryByRole('button', {name: /February 28, 2026/})).toBeNull();
  });

  it('rotates the weekday header with weekStartsOn', () => {
    const {rerender} = renderPicker(<Controlled initial="2026-03-21" />);
    expect(weekdayRow().children[0]).toHaveTextContent('Su');
    rerender(<Controlled initial="2026-03-21" weekStartsOn={1} />);
    expect(weekdayRow().children[0]).toHaveTextContent('Mo');
  });

  it('moves keyboard focus by date, across the month boundary', () => {
    renderPicker(<Controlled initial="2026-03-31" />);
    const last = within(pane('March 2026')).getByRole('button', {
      name: /March 31, 2026/,
    });
    last.focus();
    fireEvent.keyDown(last, {key: 'ArrowRight'});
    expect(document.activeElement).toHaveAttribute('data-date', '2026-04-01');
  });

  it('moves a week at a time with the vertical arrows', () => {
    renderPicker(<Controlled initial="2026-03-10" />);
    const day = within(pane('March 2026')).getByRole('button', {
      name: /March 10, 2026/,
    });
    day.focus();
    fireEvent.keyDown(day, {key: 'ArrowDown'});
    expect(document.activeElement).toHaveAttribute('data-date', '2026-03-17');
  });
});

// ---------------------------------------------------------------------------
// Month / year wheels
// ---------------------------------------------------------------------------

describe('DateInputMobile — month/year wheels', () => {
  /** The swap panel holding the calendar, or the one holding the wheels. */
  const panel = (which: 'calendar' | 'wheels') =>
    document.querySelector(`[data-panel="${which}"]`)!;

  /**
   * The header title. Queried by attribute rather than by role and accessible
   * name: every role query in here walks a tree of ~150 elements and computes
   * a name for each, which dominates the runtime of these tests.
   */
  const title = () =>
    document.querySelector<HTMLElement>('button[aria-expanded]')!;

  const openWheels = () => fireEvent.click(title());

  /**
   * Unbounded, the picker reaches a century in each direction: a hundred year
   * rows and a pane window of seven months, which is right in a browser and
   * seconds per render under jsdom. Each test takes the smallest range that
   * still exercises what it is about.
   */
  const MONTHS_ONLY = {min: '2026-02-01', max: '2026-04-30'} as const;
  const ONE_YEAR = {min: '2026-01-01', max: '2026-12-31'} as const;
  const FIVE_YEARS = {min: '2024-01-01', max: '2028-12-31'} as const;

  it('the header title opens them, and says so', () => {
    renderPicker(<Controlled initial="2026-03-21" {...MONTHS_ONLY} />);
    expect(title()).toHaveAttribute('aria-expanded', 'false');
    expect(panel('wheels')).toHaveAttribute('inert');
    expect(panel('calendar')).not.toHaveAttribute('inert');
    fireEvent.click(title());
    expect(title()).toHaveAttribute('aria-expanded', 'true');
    expect(panel('wheels')).not.toHaveAttribute('inert');
    expect(panel('calendar')).toHaveAttribute('inert');
    expect(screen.getByRole('listbox', {name: 'Month'})).toBeInTheDocument();
    expect(screen.getByRole('listbox', {name: 'Year'})).toBeInTheDocument();
  });

  it('offers twelve months, with the current one selected', () => {
    renderPicker(<Controlled initial="2026-03-21" {...MONTHS_ONLY} />);
    openWheels();
    const months = screen.getByRole('listbox', {name: 'Month'});
    const options = within(months).getAllByRole('option');
    expect(options).toHaveLength(12);
    expect(options[2]).toHaveTextContent('March');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('tapping a wheel row moves the calendar to that month', () => {
    renderPicker(<Controlled initial="2026-03-21" {...ONE_YEAR} />);
    openWheels();
    const months = screen.getByRole('listbox', {name: 'Month'});
    fireEvent.click(within(months).getByText('September'));
    expect(title()).toHaveTextContent('September 2026');
  });

  it('the year wheel keeps the month', () => {
    renderPicker(<Controlled initial="2026-03-21" {...FIVE_YEARS} />);
    openWheels();
    const years = screen.getByRole('listbox', {name: 'Year'});
    fireEvent.click(within(years).getByText('2025'));
    expect(title()).toHaveTextContent('March 2025');
  });

  it('is a single tab stop driven by the arrow keys', () => {
    renderPicker(<Controlled initial="2026-03-21" {...MONTHS_ONLY} />);
    openWheels();
    const months = screen.getByRole('listbox', {name: 'Month'});
    expect(months).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(months, {key: 'ArrowDown'});
    expect(title()).toHaveTextContent('April 2026');
    fireEvent.keyDown(months, {key: 'ArrowUp'});
    expect(title()).toHaveTextContent('March 2026');
  });

  it('will not commit a row outside min/max', () => {
    renderPicker(
      <Controlled initial="2026-03-10" min="2026-02-01" max="2026-05-31" />,
    );
    openWheels();
    const months = screen.getByRole('listbox', {name: 'Month'});
    const december = within(months)
      .getByText('December')
      .closest('[role="option"]')!;
    expect(december).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(december);
    expect(title()).toHaveTextContent('March 2026');
  });

  it('bounds the year wheel to the reachable range', () => {
    renderPicker(
      <Controlled initial="2026-03-10" min="2025-01-01" max="2027-12-31" />,
    );
    openWheels();
    const years = screen.getByRole('listbox', {name: 'Year'});
    expect(
      within(years)
        .getAllByRole('option')
        .map(o => o.textContent),
    ).toEqual(['2025', '2026', '2027']);
  });

  it('Done puts the calendar back', () => {
    renderPicker(<Controlled initial="2026-03-21" {...MONTHS_ONLY} />);
    openWheels();
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    expect(title()).toHaveAttribute('aria-expanded', 'false');
    expect(panel('wheels')).toHaveAttribute('inert');
  });
});

// ---------------------------------------------------------------------------
// Field and sheet
// ---------------------------------------------------------------------------

describe('DateInputMobile — field', () => {
  it('shows a placeholder until a date is chosen, then the formatted value', () => {
    const {rerender} = render(
      <DateInputMobile label="Ship date" onChange={() => {}} />,
    );
    expect(
      screen.getByRole('button', {name: /Select a date/}),
    ).toBeInTheDocument();
    rerender(
      <DateInputMobile
        label="Ship date"
        value="2026-03-21"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('March 21, 2026')).toBeInTheDocument();
  });

  it('honors the format prop', () => {
    render(
      <DateInputMobile
        label="Ship date"
        value="2026-03-21"
        format="system_date"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('2026-03-21')).toBeInTheDocument();
  });

  it('clears from the field', () => {
    const onChange = vi.fn();
    render(
      <DateInputMobile
        label="Ship date"
        value="2026-03-21"
        hasClear
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: /Clear date/}));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('does not open the picker until the field is tapped', () => {
    // The sheet mounts the picker on open, and its own entry work lands after
    // the click, so the layout stub has to span the whole test rather than
    // just the render.
    withLayout(() => {
      render(<DateInputMobile label="Ship date" onChange={() => {}} />);
      const trigger = screen.getByRole('button', {name: /Select a date/});
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getAllByRole('grid').length).toBeGreaterThan(0);
    });
  });

  it('is not openable while disabled', () => {
    render(
      <DateInputMobile label="Ship date" isDisabled onChange={() => {}} />,
    );
    const trigger = screen.getByRole('button', {name: /Select a date/});
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('labels the field, and accepts overrides for its own strings', () => {
    render(
      <DateInputMobile
        label="Fecha"
        onChange={() => {}}
        labels={{placeholder: 'Elige una fecha', today: 'Hoy'}}
      />,
    );
    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Elige una fecha/}),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Styles jsdom cannot resolve — assert the definition, not the effect
// ---------------------------------------------------------------------------

describe('DateInputMobile — scroll CSS (definition-level)', () => {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const read = (file: string) => readFileSync(path.join(dir, file), 'utf8');

  it('snaps the month scroller one whole pane at a time', () => {
    const source = read('MonthScroller.tsx');
    expect(source).toContain("scrollSnapType: 'y mandatory'");
    expect(source).toContain("scrollSnapAlign: 'start'");
    // The pane and the scrollport must come from the same expression, or a
    // pane stops being exactly one screen and every snap offset drifts.
    expect(
      source.match(/blockSize: dateInputMobileGeometry\.paneBlockSize/g),
    ).toHaveLength(2);
  });

  it('keeps the month scroller and the wheels on border-box', () => {
    // Load-bearing: clientHeight is the pane height, the snap offsets and the
    // virtualization all at once.
    expect(read('MonthScroller.tsx')).toContain("boxSizing: 'border-box'");
    expect(read('Wheel.tsx')).toContain("boxSizing: 'border-box'");
  });

  it('centers wheel rows and pads both ends so either extreme can reach the band', () => {
    const source = read('Wheel.tsx');
    expect(source).toContain("scrollSnapType: 'y mandatory'");
    expect(source).toContain("scrollSnapAlign: 'center'");
    expect(source).toContain(
      'paddingBlock: dateInputMobileGeometry.wheelEdgePadding',
    );
  });

  it('guards the scroll-driven falloff behind @supports', () => {
    const source = read('Wheel.tsx');
    // Without the guard, a browser that does not understand animation-timeline
    // runs these keyframes once on the document timeline instead.
    expect(source).toContain("'@supports (animation-timeline: view())'");
    expect(source).toContain("animationTimeline: 'view(y)'");
    expect(source).toContain("'@media (prefers-reduced-motion: reduce)'");
  });

  it('keeps the falloff off the snap area itself', () => {
    // A transform moves the snap area, and the wheel then settles a few
    // pixels off the row it is showing.
    const source = read('Wheel.tsx');
    const itemInner = source.slice(source.indexOf('itemInner: {'));
    expect(itemInner).toContain("animationTimeline: 'view(y)'");
    const item = source.slice(
      source.indexOf('  item: {'),
      source.indexOf('itemInner: {'),
    );
    expect(item).not.toContain('animationTimeline');
    expect(item).not.toContain("overflow: 'hidden'");
  });
});
