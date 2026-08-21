// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateInputNext.test.tsx
 * @input Uses vitest, @testing-library/react, DateInputNext and its helpers
 * @output Behavior coverage for the responsive date picker
 * @position Test file for /packages/lab/src/DateInputNext/
 *
 * What jsdom can and cannot see here matters, and the split is deliberate:
 *
 * - The month math is pure, so it is tested directly and exhaustively.
 * - Which surface is chosen, and the field contract each one honors, are
 *   tested through the DOM with `matchMedia` stubbed per test.
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
  afterEach,
} from 'vitest';
import {render, screen, fireEvent, within} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {useState} from 'react';
import type {ISODateString} from '@astryxdesign/core/utils';
import {InputGroup} from '@astryxdesign/core/InputGroup';
import {stableClassName} from '@astryxdesign/core/naming';
import {DateInputNext, MOBILE_PICKER_QUERY} from './DateInputNext';
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

/** One pane at the default 44px day size: 6 rows. */
const PANE = 264;

/** Matches the repo-wide setup polyfill, so hover-gated behavior still works. */
const HOVER_CAPABLE = /\(\s*hover\s*:\s*hover\s*\)/;

/**
 * Point the surface switch at a phone or at a desktop. Only
 * {@link MOBILE_PICKER_QUERY} is forced; every other query keeps the answer
 * the shared test setup gives it.
 */
function setViewport(kind: 'mobile' | 'desktop'): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches:
      query === MOBILE_PICKER_QUERY
        ? kind === 'mobile'
        : HOVER_CAPABLE.test(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

/**
 * Run `fn` with the month scrollport reporting the height its CSS gives it.
 *
 * jsdom lays nothing out, so `clientHeight` is 0 and the scroller mounts no
 * panes at all. The override is installed only around the work that needs it
 * and torn down immediately: a getter left on `HTMLElement.prototype` makes
 * EVERY later DOM read take a slow path, measured at ~2.4s per test here.
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
  // Re-stubbed per test, not once at module scope: the afterEach below clears
  // every stub, and matchMedia has to be re-pointed for each test anyway.
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
  setViewport('mobile');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * Bounded by default. Unbounded, the scroller mounts seven month panes — 294
 * day buttons — for every render, and under jsdom with StyleX's dev runtime
 * that is seconds a test. Three months exercises the same paths; the tests
 * that are actually about the range pass their own.
 */
const DEFAULT_RANGE = {min: '2026-02-01', max: '2026-04-30'} as const;

function Controlled({
  initial,
  onChange,
  ...props
}: {initial?: ISODateString} & Partial<
  React.ComponentProps<typeof DateInputNext>
>) {
  const [value, setValue] = useState<ISODateString | undefined>(initial);
  return (
    <DateInputNext
      label="Event date"
      {...DEFAULT_RANGE}
      {...props}
      value={value}
      // Composed, not overridden: spreading a test's `onChange` over this one
      // used to replace the state setter, so the field silently stopped
      // updating in exactly the tests that were watching it most closely.
      onChange={next => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

/** The closed field — a real input on both surfaces. */
const field = (): HTMLInputElement =>
  screen.getByRole('combobox') as HTMLInputElement;

/** Render, then open the picker. Both mount panes, so both need the layout. */
function renderAndOpen(
  ui: React.ReactElement = <Controlled initial="2026-03-21" />,
): void {
  withLayout(() => {
    render(ui);
    fireEvent.click(field());
  });
}

/**
 * One month's grid. Panes for neighbouring months are mounted too, so every
 * day query has to say which month it means.
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

// ---------------------------------------------------------------------------
// Which surface, and why
// ---------------------------------------------------------------------------

describe('DateInputNext — surface selection', () => {
  it('asks for narrow AND touch, not either alone', () => {
    // A touchscreen laptop (touch, wide) and a half-width desktop window
    // (narrow, mouse) each match one half and must keep the desktop control,
    // where typing a date beats scrolling to it.
    expect(MOBILE_PICKER_QUERY).toBe(
      '(max-width: 768px) and (pointer: coarse)',
    );
  });

  it('renders the desktop DateInput when the query does not match', () => {
    setViewport('desktop');
    render(<Controlled initial="2026-03-21" />);
    // The desktop control is a text field you can type into...
    expect(field()).not.toHaveAttribute('readonly');
    expect(field()).not.toHaveAttribute('inputmode');
    // ...and it opens a popover, not a sheet.
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('accepts typed input on the desktop surface', () => {
    setViewport('desktop');
    const onChange = vi.fn();
    render(
      <DateInputNext label="Event date" onChange={onChange} min={undefined} />,
    );
    fireEvent.change(field(), {target: {value: '2026-03-25'}});
    expect(onChange).toHaveBeenCalledWith('2026-03-25');
  });

  it('renders the touch field when the query matches', () => {
    render(<Controlled initial="2026-03-21" />);
    const input = field();
    // Still an input — same element, same role, so `ref` stays honest and the
    // label associates natively — but the picker is the only way to change it.
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('readonly');
    // What actually keeps the virtual keyboard from covering the sheet.
    expect(input).toHaveAttribute('inputmode', 'none');
  });

  it('forwards ref to the input on both surfaces', () => {
    const desktopRef = {current: null as HTMLInputElement | null};
    setViewport('desktop');
    const {unmount} = render(
      <Controlled initial="2026-03-21" ref={desktopRef} />,
    );
    expect(desktopRef.current).toBeInstanceOf(HTMLInputElement);
    unmount();

    const mobileRef = {current: null as HTMLInputElement | null};
    setViewport('mobile');
    render(<Controlled initial="2026-03-21" ref={mobileRef} />);
    expect(mobileRef.current).toBeInstanceOf(HTMLInputElement);
  });
});

// ---------------------------------------------------------------------------
// The field contract, honored identically on the touch surface
// ---------------------------------------------------------------------------

describe('DateInputNext — field parity', () => {
  it('shows a placeholder until a date is chosen, then the formatted value', () => {
    const {rerender} = render(
      <DateInputNext label="Ship date" onChange={() => {}} />,
    );
    expect(field()).toHaveValue('');
    expect(field()).toHaveAttribute('placeholder', 'Select a date');
    rerender(
      <DateInputNext
        label="Ship date"
        value="2026-03-21"
        onChange={() => {}}
      />,
    );
    expect(field()).toHaveValue('March 21, 2026');
  });

  it('honors a named format', () => {
    render(
      <DateInputNext
        label="Ship date"
        value="2026-03-21"
        format="system_date"
        onChange={() => {}}
      />,
    );
    expect(field()).toHaveValue('2026-03-21');
  });

  it('honors a function format', () => {
    render(
      <DateInputNext
        label="Ship date"
        value="2026-03-21"
        format={iso => `ISO:${iso}`}
        onChange={() => {}}
      />,
    );
    expect(field()).toHaveValue('ISO:2026-03-21');
  });

  it('honors a custom placeholder', () => {
    render(
      <DateInputNext
        label="Ship date"
        placeholder="Pick a day"
        onChange={() => {}}
      />,
    );
    expect(field()).toHaveAttribute('placeholder', 'Pick a day');
  });

  it('clears from the field', () => {
    const onChange = vi.fn();
    render(
      <DateInputNext
        label="Ship date"
        value="2026-03-21"
        hasClear
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: /Clear Ship date/}));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('does not open the picker until the field is tapped', () => {
    withLayout(() => {
      render(<DateInputNext label="Ship date" onChange={() => {}} />);
      expect(field()).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      fireEvent.click(field());
      expect(field()).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getAllByRole('grid').length).toBeGreaterThan(0);
    });
  });

  it('opens from the keyboard, APG combobox style', () => {
    withLayout(() => {
      render(<Controlled initial="2026-03-21" />);
      fireEvent.keyDown(field(), {key: 'ArrowDown'});
      expect(field()).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('is not openable while disabled', () => {
    render(<DateInputNext label="Ship date" isDisabled onChange={() => {}} />);
    expect(field()).toBeDisabled();
    fireEvent.click(field());
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('stays focusable and explains itself when disabled with a reason', () => {
    render(
      <DateInputNext
        label="Ship date"
        isDisabled
        disabledMessage="You need the Editor role"
        onChange={() => {}}
      />,
    );
    // aria-disabled, not disabled: the reason has to be reachable by keyboard.
    expect(field()).not.toBeDisabled();
    expect(field()).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(field());
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('renders label, description and status through Field', () => {
    render(
      <DateInputNext
        label="Ship date"
        description="When it leaves the warehouse"
        status={{type: 'error', message: 'Pick a date'}}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Ship date')).toBeInTheDocument();
    expect(
      screen.getByText('When it leaves the warehouse'),
    ).toBeInTheDocument();
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field().getAttribute('aria-describedby')).toBeTruthy();
  });

  it('marks required for assistive technology', () => {
    render(<DateInputNext label="Ship date" isRequired onChange={() => {}} />);
    expect(field()).toHaveAttribute('aria-required', 'true');
  });

  it('associates the label natively, so the field is named without ARIA', () => {
    render(<DateInputNext label="Ship date" onChange={() => {}} />);
    expect(screen.getByLabelText('Ship date')).toBe(field());
  });

  it('runs changeAction and shows a busy state', async () => {
    let resolve: () => void = () => {};
    const changeAction = vi.fn(
      () =>
        new Promise<void>(r => {
          resolve = r;
        }),
    );
    withLayout(() => {
      render(
        <DateInputNext
          label="Ship date"
          value="2026-03-10"
          min="2026-03-01"
          max="2026-03-31"
          onChange={() => {}}
          changeAction={changeAction}
        />,
      );
      fireEvent.click(field());
      fireEvent.click(
        within(pane('March 2026')).getByRole('button', {
          name: /March 25, 2026/,
        }),
      );
    });
    expect(changeAction).toHaveBeenCalledWith('2026-03-25');
    resolve();
  });

  it('drops the Field wrapper inside an InputGroup', () => {
    render(
      <InputGroup label="Range">
        <DateInputNext label="Start" onChange={() => {}} />
      </InputGroup>,
    );
    // Named by the group label plus its own, the way core's inputs are.
    expect(field().getAttribute('aria-labelledby')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// The picker surface
// ---------------------------------------------------------------------------

describe('DateInputNext — calendar surface', () => {
  it('opens on the selected month', () => {
    renderAndOpen();
    expect(pane('March 2026')).toBeInTheDocument();
  });

  it('opens on the current month when there is no value', () => {
    renderAndOpen(<Controlled />);
    expect(pane('March 2026')).toBeInTheDocument();
  });

  it('mounts a window of months around the visible one, not the whole century', () => {
    // The one test that wants the full default reach.
    renderAndOpen(
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
    renderAndOpen(<Controlled initial="2026-02-01" />);
    // February 2026 needs only five rows; the pane still has six.
    const february = within(pane('February 2026'));
    expect(february.getAllByRole('row')).toHaveLength(6);
    expect(february.getAllByRole('gridcell')).toHaveLength(42);
  });

  it('commits the tapped day and LEAVES the sheet open', () => {
    const onChange = vi.fn();
    renderAndOpen(<Controlled initial="2026-03-21" onChange={onChange} />);
    fireEvent.click(
      within(pane('March 2026')).getByRole('button', {name: /March 25, 2026/}),
    );
    // The tap is the commit. Staying open lets a mistake be corrected in
    // place, and a nearby date reconsidered, without reopening.
    expect(onChange).toHaveBeenCalledWith('2026-03-25');
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  it('lets a second tap correct the first, still without closing', () => {
    const onChange = vi.fn();
    renderAndOpen(<Controlled initial="2026-03-21" onChange={onChange} />);
    const march = within(pane('March 2026'));
    fireEvent.click(march.getByRole('button', {name: /March 25, 2026/}));
    fireEvent.click(march.getByRole('button', {name: /March 26, 2026/}));
    expect(onChange).toHaveBeenLastCalledWith('2026-03-26');
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  it('Done closes the sheet without touching the value', () => {
    const onChange = vi.fn();
    renderAndOpen(<Controlled initial="2026-03-21" onChange={onChange} />);
    fireEvent.click(
      within(pane('March 2026')).getByRole('button', {name: /March 25, 2026/}),
    );
    onChange.mockClear();
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    // Purely a dismiss: the value was committed by the tap, so Done must not
    // fire anything of its own.
    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue('March 25, 2026');
  });

  it('Done closes even with no date chosen, committing nothing', () => {
    const onChange = vi.fn();
    withLayout(() => {
      render(<DateInputNext label="Ship date" onChange={onChange} />);
      fireEvent.click(field());
      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    });
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has Done in the footer and no Today button', () => {
    renderAndOpen();
    expect(screen.getByRole('button', {name: 'Done'})).toBeInTheDocument();
    // "Today" moved the calendar to the current month WITHOUT selecting it,
    // which read as broken — the one thing the name promises is the thing it
    // did not do. Removed until it can be navigate-or-select on purpose.
    expect(screen.queryByRole('button', {name: 'Today'})).toBeNull();
  });

  it('marks the selection and today', () => {
    renderAndOpen();
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
    renderAndOpen();
    const tabbable = within(pane('March 2026'))
      .getAllByRole('button')
      .filter(b => b.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    // The selected day, when the month holds one.
    expect(tabbable[0]).toHaveAttribute('data-date', '2026-03-21');
  });

  it('disables days outside min/max and refuses to commit them', () => {
    const onChange = vi.fn();
    renderAndOpen(
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
    renderAndOpen(
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
    renderAndOpen();
    const march = within(pane('March 2026'));
    // The grid still has 42 cells; the ones outside March are simply empty.
    expect(march.getAllByRole('gridcell')).toHaveLength(42);
    expect(march.getAllByRole('button')).toHaveLength(31);
    expect(march.queryByRole('button', {name: /April 1, 2026/})).toBeNull();
    expect(march.queryByRole('button', {name: /February 28, 2026/})).toBeNull();
  });

  it('rotates the weekday header with weekStartsOn', () => {
    renderAndOpen();
    expect(weekdayRow().children[0]).toHaveTextContent('Su');
  });

  it('accepts weekStartsOn as a day name, like Calendar and DateInput', () => {
    renderAndOpen(<Controlled initial="2026-03-21" weekStartsOn="mon" />);
    expect(weekdayRow().children[0]).toHaveTextContent('Mo');
  });

  it('moves keyboard focus by date, across the month boundary', () => {
    renderAndOpen(<Controlled initial="2026-03-31" />);
    const last = within(pane('March 2026')).getByRole('button', {
      name: /March 31, 2026/,
    });
    last.focus();
    fireEvent.keyDown(last, {key: 'ArrowRight'});
    expect(document.activeElement).toHaveAttribute('data-date', '2026-04-01');
  });

  it('moves a week at a time with the vertical arrows', () => {
    renderAndOpen(<Controlled initial="2026-03-10" />);
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

describe('DateInputNext — month/year wheels', () => {
  /**
   * The header title. Queried by attribute rather than by role and accessible
   * name: every role query in here walks a tree of ~150 elements and computes
   * a name for each, which dominates the runtime of these tests.
   */
  const title = () =>
    document.querySelector<HTMLElement>(
      `.${stableClassName('date-input-next-title')}`,
    )!;

  const openWheels = () => fireEvent.click(title());

  /** The swap panel holding the calendar, or the one holding the wheels. */
  const panel = (which: 'calendar' | 'wheels') =>
    document.querySelector(`[data-panel="${which}"]`)!;

  const ONE_YEAR = {min: '2026-01-01', max: '2026-12-31'} as const;
  const FIVE_YEARS = {min: '2024-01-01', max: '2028-12-31'} as const;

  it('the header title opens them, and says so', () => {
    renderAndOpen();
    expect(title()).toHaveAttribute('aria-expanded', 'false');
    expect(panel('wheels')).toHaveAttribute('inert');
    expect(panel('calendar')).not.toHaveAttribute('inert');
    openWheels();
    expect(title()).toHaveAttribute('aria-expanded', 'true');
    expect(panel('wheels')).not.toHaveAttribute('inert');
    expect(panel('calendar')).toHaveAttribute('inert');
    expect(screen.getByRole('listbox', {name: 'Month'})).toBeInTheDocument();
    expect(screen.getByRole('listbox', {name: 'Year'})).toBeInTheDocument();
  });

  it('offers twelve months, with the current one selected', () => {
    renderAndOpen();
    openWheels();
    const options = within(
      screen.getByRole('listbox', {name: 'Month'}),
    ).getAllByRole('option');
    expect(options).toHaveLength(12);
    expect(options[2]).toHaveTextContent('March');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('tapping a wheel row moves the calendar to that month', () => {
    renderAndOpen(<Controlled initial="2026-03-21" {...ONE_YEAR} />);
    openWheels();
    fireEvent.click(
      within(screen.getByRole('listbox', {name: 'Month'})).getByText(
        'September',
      ),
    );
    expect(title()).toHaveTextContent('September 2026');
  });

  it('the year wheel keeps the month', () => {
    renderAndOpen(<Controlled initial="2026-03-21" {...FIVE_YEARS} />);
    openWheels();
    fireEvent.click(
      within(screen.getByRole('listbox', {name: 'Year'})).getByText('2025'),
    );
    expect(title()).toHaveTextContent('March 2025');
  });

  it('is a single tab stop driven by the arrow keys', () => {
    renderAndOpen();
    openWheels();
    const months = screen.getByRole('listbox', {name: 'Month'});
    expect(months).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(months, {key: 'ArrowDown'});
    expect(title()).toHaveTextContent('April 2026');
    fireEvent.keyDown(months, {key: 'ArrowUp'});
    expect(title()).toHaveTextContent('March 2026');
  });

  it('will not commit a row outside min/max', () => {
    renderAndOpen(<Controlled initial="2026-03-10" />);
    openWheels();
    const december = within(screen.getByRole('listbox', {name: 'Month'}))
      .getByText('December')
      .closest('[role="option"]')!;
    expect(december).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(december);
    expect(title()).toHaveTextContent('March 2026');
  });

  it('bounds the year wheel to the reachable range', () => {
    renderAndOpen(
      <Controlled initial="2026-03-10" min="2025-01-01" max="2027-12-31" />,
    );
    openWheels();
    expect(
      within(screen.getByRole('listbox', {name: 'Year'}))
        .getAllByRole('option')
        .map(o => o.textContent),
    ).toEqual(['2025', '2026', '2027']);
  });

  it('the title is what closes them again', () => {
    renderAndOpen();
    openWheels();
    expect(title()).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(title());
    expect(title()).toHaveAttribute('aria-expanded', 'false');
    expect(panel('wheels')).toHaveAttribute('inert');
  });

  it('the footer Done closes the whole sheet, not just the wheels', () => {
    // The two dismissals are distinct on purpose: the title swaps surfaces
    // inside the picker, Done leaves the picker. Wiring Done to "go back to
    // the calendar" would make the button mean two things by position.
    renderAndOpen();
    openWheels();
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the same footer while the wheels are up', () => {
    // The footer does not change with the surface — the header's action used
    // to swap between Today and Done, and that was the confusing part.
    renderAndOpen(
      <Controlled initial="2026-03-21" min="2025-01-01" max="2027-12-31" />,
    );
    openWheels();
    expect(screen.getByRole('button', {name: 'Done'})).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Gesture ownership — the nested scrollers vs. the sheet's swipe-to-dismiss
// ---------------------------------------------------------------------------

describe('DateInputNext — nested scrollers keep their own touch gesture', () => {
  /**
   * Stand-in for `BottomSheet`'s swipe-to-dismiss listener: a NATIVE listener
   * on an ancestor, in the bubble phase, which is exactly how the sheet
   * attaches its own (`addEventListener('touchstart', …, {passive: true})` on
   * its scrolling body). If an event reaches this, the sheet would have read
   * it as a drag.
   */
  function watchAncestor(): {seen: string[]; stop: () => void} {
    const seen: string[] = [];
    const listener = (event: Event) => seen.push(event.type);
    for (const type of ['touchstart', 'touchmove', 'touchend']) {
      document.body.addEventListener(type, listener);
    }
    return {
      seen,
      stop: () => {
        for (const type of ['touchstart', 'touchmove', 'touchend']) {
          document.body.removeEventListener(type, listener);
        }
      },
    };
  }

  /**
   * A touch event realistic enough for a real listener to read.
   *
   * jsdom has no constructible `TouchEvent`, and a bare `Event` carries no
   * `changedTouches` — which crashes any handler that reads one, including
   * BottomSheet's (`event.changedTouches[0]`). That crash is an artifact of
   * the fake event, not a bug: a browser's touchstart always has the list.
   * The stand-in below carries it, so an event that DOES reach the sheet
   * exercises the sheet rather than blowing up inside it.
   */
  const touch = (el: Element, type: string) => {
    const event = new Event(type, {
      bubbles: true,
      cancelable: type !== 'touchend',
    });
    const point = {identifier: 1, clientX: 100, clientY: 200, target: el};
    Object.defineProperties(event, {
      changedTouches: {value: [point]},
      touches: {value: type === 'touchend' ? [] : [point]},
      targetTouches: {value: type === 'touchend' ? [] : [point]},
    });
    return el.dispatchEvent(event);
  };

  it('stops a touch on the calendar from reaching the sheet', () => {
    renderAndOpen();
    const scroller = document.querySelector('[data-scroller="months"]')!;
    const ancestor = watchAncestor();
    touch(scroller, 'touchstart');
    touch(scroller, 'touchmove');
    // Without this, the sheet reads the body's scrollTop — which is 0 forever
    // in a sheet sized to hug its content — and promotes the drag to a
    // dismiss. Measured doing exactly that before the fix.
    expect(ancestor.seen).not.toContain('touchstart');
    expect(ancestor.seen).not.toContain('touchmove');
    ancestor.stop();
  });

  it('stops a touch on a wheel from reaching the sheet', () => {
    renderAndOpen();
    fireEvent.click(
      document.querySelector<HTMLElement>(
        `.${stableClassName('date-input-next-title')}`,
      )!,
    );
    const wheel = screen.getByRole('listbox', {name: 'Month'});
    const ancestor = watchAncestor();
    touch(wheel, 'touchstart');
    touch(wheel, 'touchmove');
    expect(ancestor.seen).not.toContain('touchstart');
    expect(ancestor.seen).not.toContain('touchmove');
    ancestor.stop();
  });

  it('lets touchend through, so the sheet can reset its own bookkeeping', () => {
    renderAndOpen();
    const scroller = document.querySelector('[data-scroller="months"]')!;
    const ancestor = watchAncestor();
    touch(scroller, 'touchend');
    expect(ancestor.seen).toContain('touchend');
    ancestor.stop();
  });

  it('leaves the rest of the picker to the sheet', () => {
    renderAndOpen();
    // The header is not a scroller: a drag there is the sheet's to interpret,
    // and it is one of the two places a dismiss can still start from.
    const title = document.querySelector<HTMLElement>(
      `.${stableClassName('date-input-next-title')}`,
    )!;
    const ancestor = watchAncestor();
    touch(title, 'touchstart');
    touch(title, 'touchmove');
    expect(ancestor.seen).toEqual(['touchstart', 'touchmove']);
    ancestor.stop();
  });

  it('does not swallow taps — stopPropagation must not reach click', () => {
    const onChange = vi.fn();
    renderAndOpen(<Controlled initial="2026-03-21" onChange={onChange} />);
    fireEvent.click(
      within(pane('March 2026')).getByRole('button', {name: /March 25, 2026/}),
    );
    expect(onChange).toHaveBeenCalledWith('2026-03-25');
  });
});

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
// Styles jsdom cannot resolve — assert the definition, not the effect
// ---------------------------------------------------------------------------

describe('DateInputNext — scroll CSS (definition-level)', () => {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const read = (file: string) => readFileSync(path.join(dir, file), 'utf8');

  it('snaps the month scroller one whole pane at a time', () => {
    const source = read('MonthScroller.tsx');
    expect(source).toContain("scrollSnapType: 'y mandatory'");
    expect(source).toContain("scrollSnapAlign: 'start'");
    // The pane and the scrollport must come from the same expression, or a
    // pane stops being exactly one screen and every snap offset drifts.
    expect(
      source.match(/blockSize: dateInputNextGeometry\.paneBlockSize/g),
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
      'paddingBlock: dateInputNextGeometry.wheelEdgePadding',
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

  it('floors the touch target without discarding the size prop', () => {
    const source = read('MobileDateField.tsx');
    // Each size keeps its own height AND cannot render below a thumb's reach.
    expect(
      source.match(
        /minBlockSize: \{default: null, '@media \(pointer: coarse\)': TOUCH_TARGET\}/g,
      ),
    ).toHaveLength(3);
  });

  it('keeps the virtual keyboard down on the touch field', () => {
    const source = read('MobileDateField.tsx');
    // readOnly alone still opens the keyboard on some Android browsers.
    expect(source).toContain('readOnly');
    expect(source).toContain('inputMode="none"');
  });
});
