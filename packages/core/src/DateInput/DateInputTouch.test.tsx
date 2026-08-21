// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DateInputTouch.test.tsx
 * @input Uses vitest, @testing-library/react, DateInput and its helpers
 * @output Behavior coverage for the responsive date picker
 * @position Test file for /packages/core/src/DateInput/
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
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {useState} from 'react';
import type {ISODateString} from '../utils';
import {InputGroup} from '../InputGroup';
import {stableClassName} from '../naming';
import {DateInput, TOUCH_POINTER_QUERY} from './DateInput';
import {
  toMonthIndex,
  monthIndexOf,
  fromMonthIndex,
  clampIndex,
  rowAtScrollOffset,
  scrollOffsetForRow,
  paneWindow,
  rowsIn,
  DEFAULT_MONTH_REACH,
} from './monthGeometry';
import {SWIPE_DISTANCE} from './useOwnScrollGesture';
import {DRAG_SLOP} from './usePointerDragScroll';

// ---------------------------------------------------------------------------
// jsdom scaffolding
// ---------------------------------------------------------------------------

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

/** An arbitrary pane size for the pure geometry tests. */
const PANE = 264;
/**
 * What the month scrollport measures as. The scroller pages along the INLINE
 * axis, so its pane size is a WIDTH — a phone's worth, since the value only
 * has to be non-zero and consistent for the virtualization to mount panes.
 */
const SCROLLPORT_WIDTH = 360;

/** Matches the repo-wide setup polyfill, so hover-gated behavior still works. */
const HOVER_CAPABLE = /\(\s*hover\s*:\s*hover\s*\)/;

/**
 * Point the surface switch at a phone or at a desktop. Only
 * {@link TOUCH_POINTER_QUERY} is forced; every other query keeps the answer
 * the shared test setup gives it.
 */
/**
 * Answer media queries the way a given device would.
 *
 * Width queries are answered HONESTLY against `width`, so a width bound
 * creeping back into the surface switch fails a test rather than passing
 * silently on a stub that ignores it.
 */
function stubMedia({
  pointer,
  anyPointer,
  width,
}: {
  pointer: 'coarse' | 'fine';
  anyPointer?: 'coarse' | 'fine';
  width: number;
}): void {
  vi.stubGlobal('matchMedia', (query: string) => {
    let matches: boolean;
    const maxWidth = /\(\s*max-width:\s*(\d+)px\s*\)/.exec(query);
    const minWidth = /\(\s*min-width:\s*(\d+)px\s*\)/.exec(query);
    if (/any-pointer:\s*coarse/.test(query)) {
      matches = (anyPointer ?? pointer) === 'coarse';
    } else if (/pointer:\s*coarse/.test(query)) {
      matches = pointer === 'coarse';
    } else if (/pointer:\s*fine/.test(query)) {
      matches = pointer === 'fine';
    } else if (maxWidth) {
      matches = width <= Number(maxWidth[1]);
    } else if (minWidth) {
      matches = width >= Number(minWidth[1]);
    } else {
      matches = HOVER_CAPABLE.test(query);
    }
    // A compound query is only true when every part of it is.
    if (matches && maxWidth && query.includes('pointer:')) {
      matches = width <= Number(maxWidth[1]);
    }
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  });
}

function setViewport(kind: 'mobile' | 'desktop'): void {
  stubMedia(
    kind === 'mobile'
      ? {pointer: 'coarse', width: 393}
      : {pointer: 'fine', width: 1280},
  );
}

/**
 * Run `fn` with the month scrollport reporting the height its CSS gives it.
 *
 * jsdom lays nothing out, so `clientHeight` is 0 and the scroller mounts no
 * panes at all. The override is installed only around the work that needs it
 * and torn down immediately: a getter left on `HTMLElement.prototype` makes
 * EVERY later DOM read take a slow path, measured at ~2.4s per test here.
 */
/** One animation frame, for the rAF-throttled scroll handlers. */
async function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

function withLayout<T>(fn: () => T): T {
  // jsdom defines clientWidth on Element.prototype; shadowing it on
  // HTMLElement.prototype and deleting the shadow afterwards restores the
  // original getter without having to copy its descriptor.
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return this.dataset?.scroller === 'months' ? SCROLLPORT_WIDTH : 0;
    },
  });
  try {
    return fn();
  } finally {
    delete (HTMLElement.prototype as {clientWidth?: unknown}).clientWidth;
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
  React.ComponentProps<typeof DateInput>
>) {
  const [value, setValue] = useState<ISODateString | undefined>(initial);
  return (
    <DateInput
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
const field = (): HTMLInputElement => screen.getByRole('combobox');

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

describe('DateInput — surface selection', () => {
  it('switches on the pointer alone, so a tablet gets the picker too', () => {
    // `pointer` is the PRIMARY device, which is what makes it the whole test:
    // a touchscreen laptop reports `fine` (its trackpad) and keeps the
    // typable field, and a narrowed desktop window is still a mouse. A width
    // bound would only re-exclude tablets — the clearest case for a thumb
    // picker there is — so there deliberately is not one.
    expect(TOUCH_POINTER_QUERY).toBe('(pointer: coarse)');

    // An 1194px tablet in landscape: coarse pointer, far wider than any
    // handset breakpoint. It answers width queries honestly, so a width bound
    // creeping back in would fail here rather than pass silently.
    stubMedia({pointer: 'coarse', width: 1194});
    render(<Controlled initial="2026-03-21" />);
    expect(field()).toHaveAttribute('readonly');
  });

  it('keeps the typable field for a touchscreen laptop', () => {
    // Touch available, but the trackpad is primary — so `pointer` is `fine`
    // and only `any-pointer` is coarse. The keyboard is right there, and
    // typing a date beats scrolling to it.
    stubMedia({pointer: 'fine', anyPointer: 'coarse', width: 1366});
    render(<Controlled initial="2026-03-21" />);
    expect(field()).not.toHaveAttribute('readonly');
  });

  it('keeps the typable field in a narrowed desktop window', () => {
    stubMedia({pointer: 'fine', width: 500});
    render(<Controlled initial="2026-03-21" />);
    expect(field()).not.toHaveAttribute('readonly');
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
      <DateInput label="Event date" onChange={onChange} min={undefined} />,
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

describe('DateInput — field parity', () => {
  it('shows a placeholder until a date is chosen, then the formatted value', () => {
    const {rerender} = render(
      <DateInput label="Ship date" onChange={() => {}} />,
    );
    expect(field()).toHaveValue('');
    expect(field()).toHaveAttribute('placeholder', 'Select a date');
    rerender(
      <DateInput label="Ship date" value="2026-03-21" onChange={() => {}} />,
    );
    expect(field()).toHaveValue('March 21, 2026');
  });

  it('honors a named format', () => {
    render(
      <DateInput
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
      <DateInput
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
      <DateInput
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
      <DateInput
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
      render(<DateInput label="Ship date" onChange={() => {}} />);
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
    render(<DateInput label="Ship date" isDisabled onChange={() => {}} />);
    expect(field()).toBeDisabled();
    fireEvent.click(field());
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('stays focusable and explains itself when disabled with a reason', () => {
    render(
      <DateInput
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
      <DateInput
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
    render(<DateInput label="Ship date" isRequired onChange={() => {}} />);
    expect(field()).toHaveAttribute('aria-required', 'true');
  });

  it('associates the label natively, so the field is named without ARIA', () => {
    render(<DateInput label="Ship date" onChange={() => {}} />);
    expect(screen.getByLabelText('Ship date')).toBe(field());
  });

  it('runs changeAction and shows a busy state', async () => {
    let resolve: () => void = () => {};
    const changeAction = vi.fn(
      async () =>
        new Promise<void>(r => {
          resolve = r;
        }),
    );
    withLayout(() => {
      render(
        <DateInput
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
        <DateInput label="Start" onChange={() => {}} />
      </InputGroup>,
    );
    // Named by the group label plus its own, the way core's inputs are.
    expect(field().getAttribute('aria-labelledby')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// The picker surface
// ---------------------------------------------------------------------------

describe('DateInput — calendar surface', () => {
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

  it('Save closes the sheet without touching the value', () => {
    const onChange = vi.fn();
    renderAndOpen(<Controlled initial="2026-03-21" onChange={onChange} />);
    fireEvent.click(
      within(pane('March 2026')).getByRole('button', {name: /March 25, 2026/}),
    );
    onChange.mockClear();
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    // Named for what it means to someone finishing a form, not for what it
    // does internally: the value was already committed by the tap that chose
    // it, so this fires nothing of its own.
    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue('March 25, 2026');
  });

  it('Save closes even with no date chosen, committing nothing', () => {
    const onChange = vi.fn();
    withLayout(() => {
      render(<DateInput label="Ship date" onChange={onChange} />);
      fireEvent.click(field());
      fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    });
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has Save in the footer and no Today button', () => {
    renderAndOpen();
    expect(screen.getByRole('button', {name: 'Save'})).toBeInTheDocument();
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

  it('pages a month with the header arrows', () => {
    renderAndOpen();
    const header = () =>
      document.querySelector<HTMLElement>('[data-title="month-year"]')!;
    expect(header()).toHaveTextContent('March 2026');
    fireEvent.click(screen.getByRole('button', {name: 'Next month'}));
    expect(header()).toHaveTextContent('April 2026');
    fireEvent.click(screen.getByRole('button', {name: 'Previous month'}));
    expect(header()).toHaveTextContent('March 2026');
  });

  /**
   * A programmatic scroll must not report its own arrival as if the user had
   * scrolled there. Nothing needs the report — whatever asked for the scroll
   * already knows the month — and trusting it turns a steer into a cycle.
   *
   * The case that bit: a wheel commit steers this scroller while it is hidden
   * behind the wheels, and a hidden scroller does not reliably stay put. On
   * iOS the position is re-snapped when the panel becomes visible again,
   * firing a scroll just as the wheels close and reports start being trusted
   * again — so the month drifted on the way back to the calendar.
   */
  it('does not report a scroll it was told to make', async () => {
    await withLayout(async () => {
      render(
        <Controlled initial="2026-03-21" min="2026-01-01" max="2026-12-31" />,
      );
      fireEvent.click(field());
      const header = () =>
        document.querySelector<HTMLElement>('[data-title="month-year"]')!;
      const scroller = document.querySelector<HTMLElement>(
        '[data-scroller="months"]',
      )!;

      // An arrow steers it to April. The scroll that lands there is our own
      // doing, so whatever it reports must not move the month again.
      fireEvent.click(screen.getByRole('button', {name: 'Next month'}));
      expect(header()).toHaveTextContent('April 2026');
      // Row 3 of a range starting in January is April: the month the steer
      // was aiming at, arriving.
      scroller.scrollLeft = 3 * SCROLLPORT_WIDTH;
      fireEvent.scroll(scroller);
      await frame();
      expect(header()).toHaveTextContent('April 2026');

      // A finger ends the steering: from here the months it passes are the
      // user's, and every one of them counts.
      // jsdom has no constructible TouchEvent, and a bare Event carries no
      // `touches` — which crashes the gesture hook that reads `touches[0]`.
      // That crash is the fake event's fault, not the hook's: a browser's
      // touchstart always has the list.
      const touchStart = new Event('touchstart', {bubbles: true});
      const point = {identifier: 1, clientX: 100, clientY: 100};
      Object.defineProperties(touchStart, {
        touches: {value: [point]},
        targetTouches: {value: [point]},
        changedTouches: {value: [point]},
      });
      scroller.dispatchEvent(touchStart);
      scroller.scrollLeft = 5 * SCROLLPORT_WIDTH;
      fireEvent.scroll(scroller);
      // The report is made from inside a rAF callback, so the state update
      // lands outside the act() that fireEvent wraps.
      await waitFor(() => expect(header()).toHaveTextContent('June 2026'));
    });
  });

  /**
   * An arrow with nowhere to go is hidden, not greyed. A disabled control
   * still says "this is a thing you could do", and at the edge of a range it
   * is not — there is no state the user can reach where it becomes
   * available, so a permanently greyed chevron just reads as broken.
   *
   * It keeps its box, though: `visibility: hidden` rather than unmounting,
   * so the remaining arrow does not slide sideways as an edge is reached.
   */
  it('hides an arrow at the end of the reachable range', () => {
    renderAndOpen(
      <Controlled initial="2026-03-10" min="2026-03-01" max="2026-03-31" />,
    );
    // Queried by attribute, not by role: `visibility: hidden` is exactly what
    // strips an element of its accessible name, so a role query cannot see
    // these — which is the point of the assertion below.
    const arrow = (name: string) =>
      document.querySelector<HTMLElement>(
        `dialog[open] button[aria-label="${name}"]`,
      );
    for (const name of ['Previous month', 'Next month']) {
      // Still mounted, so the header cannot reflow...
      expect(arrow(name)).toBeInTheDocument();
      expect(arrow(name)).toBeDisabled();
      // ...but gone from the accessibility tree, and so unreachable.
      expect(screen.queryByRole('button', {name})).toBeNull();
    }
  });

  it('shows both arrows when there is somewhere to go in each direction', () => {
    renderAndOpen(
      <Controlled initial="2026-03-10" min="2026-01-01" max="2026-12-31" />,
    );
    expect(
      screen.getByRole('button', {name: 'Previous month'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Next month'}),
    ).toBeInTheDocument();
  });

  it('does not change the selection when paging', () => {
    const onChange = vi.fn();
    renderAndOpen(<Controlled initial="2026-03-21" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', {name: 'Next month'}));
    // Navigating is not selecting — the mistake the old Today button made.
    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue('March 21, 2026');
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

describe('DateInput — month/year wheels', () => {
  /**
   * The header title. Queried by attribute rather than by role and accessible
   * name: every role query in here walks a tree of ~150 elements and computes
   * a name for each, which dominates the runtime of these tests.
   */
  const title = () =>
    document.querySelector<HTMLElement>('[data-title="month-year"]')!;

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

  /**
   * The arrows step the calendar, and the calendar is not on screen. They
   * keep their layout box rather than unmounting: they are the tallest thing
   * in the header on a coarse pointer (44px against the title's 36), so
   * dropping them would shorten it and shift the sheet mid-cross-fade.
   */
  it('hides the month arrows while the wheels are up', () => {
    renderAndOpen();
    const arrows = document.querySelector<HTMLElement>(
      '[data-arrows="months"]',
    )!;
    expect(arrows).not.toHaveAttribute('inert');

    openWheels();
    expect(arrows).toHaveAttribute('inert');
    // Still in the layout, so the header cannot change height.
    expect(arrows).toBeInTheDocument();

    fireEvent.click(title());
    expect(arrows).not.toHaveAttribute('inert');
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

  /**
   * A wheel commit steers the hidden calendar, and the calendar reports the
   * month it lands on. Taking that report back while the wheels are open
   * closes a cycle: commit -> echo -> the echo moves the wheel's selected row
   * -> the wheel is repositioned -> that scroll reads as another commit.
   *
   * Whether it converges comes down to how precisely a browser says
   * "scrolling stopped". Chrome has `scrollend` and settles at once; iOS
   * below Safari 26 has none, and its momentum runs on after the finger
   * lifts, so each lap committed the next month along and the month climbed
   * on its own — reported from a device, invisible in Chrome.
   *
   * Driven here through the calendar's real scroll listener, which needs a
   * measured scrollport (`withLayout`) and a `scrollLeft` far enough to land
   * on another pane, then a frame for the rAF throttle. No timing assumptions:
   * the echo either reaches the month or it does not.
   */
  it('ignores the calendar echo while the wheels are steering it', async () => {
    await withLayout(async () => {
      render(<Controlled initial="2026-03-21" {...FIVE_YEARS} />);
      fireEvent.click(field());
      openWheels();
      fireEvent.click(
        within(screen.getByRole('listbox', {name: 'Month'})).getByText(
          'January',
        ),
      );
      expect(title()).toHaveTextContent('January 2026');

      // The calendar, scrolling to January behind the wheels, reports each
      // month it passes. None of it may move the month the wheels just set.
      const scroller = document.querySelector<HTMLElement>(
        '[data-scroller="months"]',
      )!;
      for (const row of [5, 6, 7, 8]) {
        scroller.scrollLeft = row * SCROLLPORT_WIDTH;
        fireEvent.scroll(scroller);
        await frame();
      }
      expect(title()).toHaveTextContent('January 2026');
    });
    // The other direction — the calendar reporting its month when it IS the
    // surface — is what every test in the calendar-surface block above
    // depends on, so it is covered rather than restated here.
  });

  /**
   * The reveal case, which is the one that was reported from a device.
   *
   * A wheel commit steers the calendar while it is hidden behind the wheels,
   * and `visibility: hidden` keeps the layout box but does not guarantee the
   * scroll position survives: iOS re-snaps the scroller when it becomes
   * visible again, and not necessarily onto the pane it was put on. That
   * fires a scroll exactly as the wheels close and reports start being
   * trusted again — so the month drifted on the way back to the dates.
   *
   * Simulated here by moving the hidden scroller somewhere it was never sent,
   * which is what the re-snap amounts to.
   */
  it('holds the month when the hidden calendar is re-snapped on reveal', async () => {
    await withLayout(async () => {
      render(<Controlled initial="2026-03-21" {...FIVE_YEARS} />);
      fireEvent.click(field());
      openWheels();
      fireEvent.click(
        within(screen.getByRole('listbox', {name: 'Month'})).getByText(
          'January',
        ),
      );
      expect(title()).toHaveTextContent('January 2026');

      // iOS moves the hidden scroller off the pane it was steered to.
      const scroller = document.querySelector<HTMLElement>(
        '[data-scroller="months"]',
      )!;
      scroller.scrollLeft += 4 * SCROLLPORT_WIDTH;

      // Back to the dates. Two things have to hold: the stray position must
      // not become the month, and the calendar must be put back on the pane
      // the month names — or the header would say January over a different
      // month's grid.
      const scrollTo = vi.mocked(Element.prototype.scrollTo);
      scrollTo.mockClear();
      fireEvent.click(title());
      fireEvent.scroll(scroller);
      await frame();
      await frame();
      expect(title()).toHaveTextContent('January 2026');

      // January 2026 is row 24 of a range that starts in January 2024.
      expect(scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({left: 24 * SCROLLPORT_WIDTH}),
      );
    });
  });

  /**
   * The wheels are a detour to reach a far month, not a mode. Reopening into
   * them would answer a question the user has not asked yet, and hide the
   * dates they came back for behind another tap.
   */
  it('always reopens on the calendar, whatever was showing last time', () => {
    renderAndOpen();
    openWheels();
    expect(title()).toHaveAttribute('aria-expanded', 'true');

    // Dismissed from the wheels, where Done is deliberately not offered —
    // the handle, the scrim and Escape are the ways out.
    fireEvent.keyDown(document.querySelector('dialog[open]')!, {key: 'Escape'});
    expect(field()).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(field());
    expect(title()).toHaveAttribute('aria-expanded', 'false');
    expect(panel('calendar')).not.toHaveAttribute('inert');
    expect(panel('wheels')).toHaveAttribute('inert');
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

  it('Clear empties the field and brings the calendar home', () => {
    const onChange = vi.fn();
    // Today is 15 March 2026 in these tests; open on a month away from it.
    renderAndOpen(
      <Controlled
        initial="2026-08-21"
        onChange={onChange}
        min="2026-01-01"
        max="2026-12-31"
      />,
    );
    expect(title()).toHaveTextContent('August 2026');

    fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(field()).toHaveValue('');
    // Clearing the date and leaving the calendar on the month of the date you
    // just cleared is a half-finished action.
    expect(title()).toHaveTextContent('March 2026');
    // And it does not dismiss — the sheet is still there to pick again.
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  /**
   * "If possible" is the whole subtlety. A range can exclude the current
   * month entirely — a booking window that opens next quarter — and there is
   * then no honest month to go to. Clamping would land on the nearest edge
   * and present a different month as though it were today's, so the move is
   * skipped and the calendar stays put. The value clears either way.
   */
  it('clears without moving when the current month is out of range', () => {
    const onChange = vi.fn();
    renderAndOpen(
      <Controlled
        initial="2027-05-10"
        onChange={onChange}
        min="2027-01-01"
        max="2027-12-31"
      />,
    );
    expect(title()).toHaveTextContent('May 2027');

    fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(field()).toHaveValue('');
    expect(title()).toHaveTextContent('May 2027');
  });

  it('offers Clear only on the calendar, beside Save', () => {
    renderAndOpen();
    expect(screen.getByRole('button', {name: 'Clear'})).toBeInTheDocument();
    openWheels();
    // The wheels choose a month; there is no date there to clear.
    expect(screen.queryByRole('button', {name: 'Clear'})).toBeNull();
  });

  it('Save closes the whole picker; Done only leaves the wheels', () => {
    // Two finishes, deliberately different: Save ends the task, Done ends a
    // step. They never appear together — each belongs to the surface it is
    // shown on — so neither has to carry two meanings by position.
    renderAndOpen();
    openWheels();
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    // Back on the calendar, still open.
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(title()).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  /**
   * The two actions share one grid cell and take turns, so the footer is one
   * button tall whichever is showing and the sheet never changes height
   * mid-swap. `inert` is what keeps the hidden one out of the accessibility
   * tree, rather than merely out of sight.
   */
  it('shows exactly one footer action, and only the visible one is reachable', () => {
    renderAndOpen();
    // Queried off the DOM rather than by role: every role-with-name query
    // walks this tree computing accessible names, and there are ~150
    // elements in it. Same reason the title helper above does it this way.
    const cell = (label: string) =>
      [...document.querySelectorAll('dialog[open] button')].find(
        el => el.textContent?.trim() === label,
      )!.parentElement!;

    expect(cell('Save')).not.toHaveAttribute('inert');
    expect(cell('Done')).toHaveAttribute('inert');
    expect(screen.queryByRole('button', {name: 'Done'})).toBeNull();

    openWheels();
    expect(cell('Save')).toHaveAttribute('inert');
    expect(cell('Done')).not.toHaveAttribute('inert');
    expect(screen.queryByRole('button', {name: 'Save'})).toBeNull();

    // Both stay mounted throughout, which is what keeps the row's height
    // fixed across the swap.
    expect(cell('Save')).toBeInTheDocument();
    expect(cell('Done')).toBeInTheDocument();
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
});

// ---------------------------------------------------------------------------
// Gesture ownership — the nested scrollers vs. the sheet's swipe-to-dismiss
// ---------------------------------------------------------------------------

describe('DateInput — nested scrollers keep their own touch gesture', () => {
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
  const touch = (
    el: Element,
    type: string,
    at: {x: number; y: number} = {x: 100, y: 200},
  ) => {
    const event = new Event(type, {
      bubbles: true,
      cancelable: type !== 'touchend',
    });
    const point = {identifier: 1, clientX: at.x, clientY: at.y, target: el};
    Object.defineProperties(event, {
      changedTouches: {value: [point]},
      touches: {value: type === 'touchend' ? [] : [point]},
      targetTouches: {value: type === 'touchend' ? [] : [point]},
    });
    return el.dispatchEvent(event);
  };

  /**
   * A whole gesture: down at the origin, drag by (dx, dy), lift. Returns the
   * scroller's stubbed `scrollBy`, which is how the paging fallback shows up
   * (jsdom implements neither scrolling nor `scrollBy`).
   */
  const swipe = (
    el: Element,
    dx: number,
    dy: number,
    {scrollsBy = 0}: {scrollsBy?: number} = {},
  ) => {
    // jsdom has no layout, so `scrollLeft` never moves on its own. Shadow it
    // on this instance for the gesture: a native pan is the browser moving
    // the scroller mid-drag, and watching for exactly that is how the hook
    // knows whether its claim was honoured. Instance-only and deleted after,
    // per the prototype-getter cost noted at the top of this file.
    let offset = 0;
    const scrollBy = vi.fn();
    Object.defineProperties(el, {
      scrollLeft: {
        configurable: true,
        get: () => offset,
        set: (value: number) => {
          offset = value;
        },
      },
      scrollBy: {configurable: true, value: scrollBy},
    });
    const origin = {x: 150, y: 200};
    touch(el, 'touchstart', origin);
    for (const step of [0.5, 1]) {
      if (step === 0.5) {
        offset += scrollsBy;
      }
      touch(el, 'touchmove', {
        x: origin.x + dx * step,
        y: origin.y + dy * step,
      });
    }
    touch(el, 'touchend');
    // @ts-expect-error - removing the shadows restores the prototype's
    delete el.scrollLeft;
    // @ts-expect-error - same
    delete el.scrollBy;
    return scrollBy;
  };

  it('lets a touch on the calendar reach the sheet, now that it pages sideways', () => {
    renderAndOpen();
    const scroller = document.querySelector('[data-scroller="months"]')!;
    const ancestor = watchAncestor();
    touch(scroller, 'touchstart');
    touch(scroller, 'touchmove');
    // The calendar used to claim the gesture, because it scrolled vertically
    // and the sheet read every downward drag as a dismiss. Paging sideways
    // removes the conflict: horizontal pans stay here and vertical ones go to
    // the sheet, so a downward drag can go back to meaning swipe-to-dismiss.
    // A move with no direction yet (the same point twice) is nobody's.
    expect(ancestor.seen).toEqual(['touchstart', 'touchmove']);
    ancestor.stop();
  });

  it('claims a horizontal drag on the calendar', () => {
    renderAndOpen();
    const scroller = document.querySelector('[data-scroller="months"]')!;
    const ancestor = watchAncestor();
    swipe(scroller, -80, 0);
    // touchstart still propagates — 'inline' cannot know the direction yet —
    // but every move after the axis locks is ours.
    expect(ancestor.seen).not.toContain('touchmove');
    ancestor.stop();
  });

  it('leaves a downward drag on the calendar to the sheet', () => {
    renderAndOpen();
    const scroller = document.querySelector('[data-scroller="months"]')!;
    const ancestor = watchAncestor();
    swipe(scroller, 0, 80);
    expect(ancestor.seen).toContain('touchmove');
    ancestor.stop();
  });

  it('keeps a diagonal drag, because a thumb arcs as it swipes', () => {
    renderAndOpen();
    const scroller = document.querySelector('[data-scroller="months"]')!;
    const ancestor = watchAncestor();
    // ~50° off horizontal: past the browser's own pan-x cone, still ours.
    swipe(scroller, -60, 72);
    expect(ancestor.seen).not.toContain('touchmove');
    ancestor.stop();
  });

  /**
   * The band between our claim and the browser's `pan-x` cone. The sheet has
   * been told to keep off, and the compositor refuses to pan, so without the
   * fallback these gestures would do nothing at all — measured as a dead zone
   * from 45° to 60° on an iPhone 15 profile.
   */
  it('pages a month itself when the browser refuses to pan a claimed swipe', () => {
    renderAndOpen();
    const scroller = document.querySelector('[data-scroller="months"]')!;

    const forward = swipe(scroller, -60, 72);
    expect(forward).toHaveBeenCalledTimes(1);
    expect(forward.mock.calls[0][0]).toMatchObject({behavior: 'smooth'});
    // Swiping left advances: the offset moves towards the end of the line.
    expect(forward.mock.calls[0][0].left).toBeGreaterThan(0);

    const back = swipe(scroller, 60, 72);
    expect(back.mock.calls[0][0].left).toBeLessThan(0);
  });

  it('stays out of the way when the browser did pan', () => {
    renderAndOpen();
    const scroller = document.querySelector('[data-scroller="months"]')!;
    // Native momentum and snapping own this one; a second nudge would fight
    // them. `scrollsBy` stands in for the compositor moving the scroller.
    expect(swipe(scroller, -120, 0, {scrollsBy: 40})).not.toHaveBeenCalled();
  });

  it('ignores a claimed gesture too short to be a swipe', () => {
    renderAndOpen();
    const scroller = document.querySelector('[data-scroller="months"]')!;
    expect(swipe(scroller, -SWIPE_DISTANCE + 4, 0)).not.toHaveBeenCalled();
  });

  it('never pages from a drag it gave to the sheet', () => {
    renderAndOpen();
    const scroller = document.querySelector('[data-scroller="months"]')!;
    expect(swipe(scroller, -40, 200)).not.toHaveBeenCalled();
  });

  it('stops a touch on a wheel from reaching the sheet', () => {
    renderAndOpen();
    fireEvent.click(
      document.querySelector<HTMLElement>('[data-title="month-year"]')!,
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
      '[data-title="month-year"]',
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
// Dragging a wheel with a mouse
// ---------------------------------------------------------------------------

/**
 * A wheel is a scroll container, so a finger pans it for free. A mouse gets
 * nothing: browsers do not drag-scroll an overflow container, so pressing and
 * pulling on the one control shaped like a thing you spin did nothing at all.
 *
 * It matters on desktop specifically because that is where this surface is
 * reviewed, themed and screenshotted.
 */
describe('DateInput — a mouse can drag a wheel', () => {
  const title = () =>
    document.querySelector<HTMLElement>('[data-title="month-year"]')!;

  /** jsdom has no layout: give the rows a height and the wheel a scrollTop. */
  function withWheelLayout<T>(fn: () => T): T {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get(this: HTMLElement) {
        return this.getAttribute('role') === 'option' ? 28 : 0;
      },
    });
    try {
      return fn();
    } finally {
      // @ts-expect-error - deleting the shadow restores Element's own getter
      delete HTMLElement.prototype.offsetHeight;
    }
  }

  const wheel = () => screen.getByRole('listbox', {name: 'Month'});

  const pointer = (
    type: string,
    {y = 0, pointerType = 'mouse', button = 0, id = 1} = {},
  ) => {
    const event = new Event(type, {bubbles: true, cancelable: true});
    Object.defineProperties(event, {
      clientY: {value: y},
      pointerId: {value: id},
      pointerType: {value: pointerType},
      button: {value: button},
    });
    return event;
  };

  /** Stubs jsdom's missing capture API and records scrollTop as it moves. */
  function trackable(el: HTMLElement) {
    let top = 0;
    Object.defineProperty(el, 'scrollTop', {
      configurable: true,
      get: () => top,
      set: (v: number) => {
        top = v;
      },
    });
    el.setPointerCapture = () => {};
    el.releasePointerCapture = () => {};
    el.hasPointerCapture = () => true;
    el.scrollTo = ((opts: ScrollToOptions) => {
      top = opts.top ?? top;
    }) as HTMLElement['scrollTo'];
    return {
      get scrollTop() {
        return top;
      },
    };
  }

  it('scrolls the wheel when a mouse drags it', () => {
    renderAndOpen();
    fireEvent.click(title());
    withWheelLayout(() => {
      const el = wheel();
      const track = trackable(el);
      el.dispatchEvent(pointer('pointerdown', {y: 200}));
      el.dispatchEvent(pointer('pointermove', {y: 160}));
      // Content follows the hand: pulling up scrolls further down the list.
      expect(track.scrollTop).toBe(40);
      el.dispatchEvent(pointer('pointerup', {y: 160}));
      // And the release lands on a row boundary rather than between two.
      expect(track.scrollTop % 28).toBe(0);
    });
  });

  it('ignores movement too small to be a drag, so a click is still a click', () => {
    renderAndOpen();
    fireEvent.click(title());
    withWheelLayout(() => {
      const el = wheel();
      const track = trackable(el);
      el.dispatchEvent(pointer('pointerdown', {y: 200}));
      el.dispatchEvent(pointer('pointermove', {y: 200 - (DRAG_SLOP - 1)}));
      expect(track.scrollTop).toBe(0);
    });
  });

  it('leaves touch and pen alone — they pan natively, and better', () => {
    renderAndOpen();
    fireEvent.click(title());
    withWheelLayout(() => {
      for (const pointerType of ['touch', 'pen']) {
        const el = wheel();
        const track = trackable(el);
        el.dispatchEvent(pointer('pointerdown', {y: 200, pointerType}));
        el.dispatchEvent(pointer('pointermove', {y: 120, pointerType}));
        expect(track.scrollTop).toBe(0);
        el.dispatchEvent(pointer('pointerup', {y: 120, pointerType}));
      }
    });
  });

  it('ignores a secondary button, which belongs to the context menu', () => {
    renderAndOpen();
    fireEvent.click(title());
    withWheelLayout(() => {
      const el = wheel();
      const track = trackable(el);
      el.dispatchEvent(pointer('pointerdown', {y: 200, button: 2}));
      el.dispatchEvent(pointer('pointermove', {y: 120}));
      expect(track.scrollTop).toBe(0);
    });
  });

  /**
   * `scroll-snap-type: y mandatory` re-snaps after every scroll, programmatic
   * ones included. Measured with it left on: 7 of 8 five-pixel drag steps were
   * yanked back to a snap position, so the wheel stuck to a row and then
   * jumped a whole one.
   */
  it('suspends snapping for the drag, and restores it after', () => {
    renderAndOpen();
    fireEvent.click(title());
    withWheelLayout(() => {
      const el = wheel();
      trackable(el);
      expect(el.style.scrollSnapType).toBe('');
      el.dispatchEvent(pointer('pointerdown', {y: 200}));
      el.dispatchEvent(pointer('pointermove', {y: 160}));
      expect(el.style.scrollSnapType).toBe('none');
      el.dispatchEvent(pointer('pointerup', {y: 160}));
      el.dispatchEvent(new Event('scrollend'));
      expect(el.style.scrollSnapType).toBe('');
    });
  });

  /**
   * BottomSheet starts its own drag-to-dismiss from a `pointerdown` on its
   * body and CAPTURES the pointer for it, which retargets every later pointer
   * event — including the click. Measured before this: a click on a wheel row
   * that wobbled more than a pixel selected nothing at all.
   */
  it('keeps the press away from the sheet, which would capture the pointer', () => {
    renderAndOpen();
    fireEvent.click(title());
    withWheelLayout(() => {
      const el = wheel();
      trackable(el);
      const seen: string[] = [];
      const listener = (event: Event) => seen.push(event.type);
      document.body.addEventListener('pointerdown', listener);
      el.dispatchEvent(pointer('pointerdown', {y: 200}));
      expect(seen).not.toContain('pointerdown');
      document.body.removeEventListener('pointerdown', listener);
    });
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

  describe('rowAtScrollOffset', () => {
    it('maps an exact offset to its row', () => {
      expect(rowAtScrollOffset(0, PANE, 100)).toBe(0);
      expect(rowAtScrollOffset(PANE * 7, PANE, 100)).toBe(7);
    });

    it('rounds to the nearest row mid-scroll', () => {
      expect(rowAtScrollOffset(PANE * 7 + 10, PANE, 100)).toBe(7);
      expect(rowAtScrollOffset(PANE * 7 - 10, PANE, 100)).toBe(7);
      expect(rowAtScrollOffset(PANE * 6.6, PANE, 100)).toBe(7);
    });

    it('never leaves the list', () => {
      expect(rowAtScrollOffset(-500, PANE, 100)).toBe(0);
      expect(rowAtScrollOffset(PANE * 1000, PANE, 100)).toBe(99);
    });

    it('is 0 before the pane size is known, rather than dividing by zero', () => {
      expect(rowAtScrollOffset(1234, 0, 100)).toBe(0);
    });

    it('reads RTL scrollLeft, which counts down from zero', () => {
      // The spec puts the inline start at 0 and runs negative from there, so
      // an unsigned read would pin an RTL calendar to month zero forever.
      expect(rowAtScrollOffset(-PANE * 7, PANE, 100, true)).toBe(7);
      expect(rowAtScrollOffset(-PANE * 7 - 10, PANE, 100, true)).toBe(7);
      expect(rowAtScrollOffset(0, PANE, 100, true)).toBe(0);
    });
  });

  describe('scrollOffsetForRow', () => {
    it('is the inverse of rowAtScrollOffset, in both directions', () => {
      for (const isRTL of [false, true]) {
        for (const row of [0, 1, 7, 99]) {
          const offset = scrollOffsetForRow(row, PANE, isRTL);
          expect(rowAtScrollOffset(offset, PANE, 100, isRTL)).toBe(row);
        }
      }
    });

    it('runs negative under RTL', () => {
      expect(scrollOffsetForRow(3, PANE, false)).toBe(PANE * 3);
      expect(scrollOffsetForRow(3, PANE, true)).toBe(-PANE * 3);
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

describe('DateInput — scroll CSS (definition-level)', () => {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const read = (file: string) => readFileSync(path.join(dir, file), 'utf8');

  it('pages the month scroller one whole pane at a time, horizontally', () => {
    const source = read('MonthScroller.tsx');
    expect(source).toContain("scrollSnapType: 'x mandatory'");
    expect(source).toContain("scrollSnapAlign: 'start'");
    // pan-x is what splits the gesture by axis: horizontal pans stay with the
    // calendar, vertical ones reach the sheet as swipe-to-dismiss. Without it
    // the two would fight again, the way they did when this scrolled down.
    expect(source).toContain("touchAction: 'pan-x'");
    // The pane and the scrollport must come from the same expression, or a
    // pane stops being exactly one screen and every snap offset drifts.
    expect(
      source.match(/blockSize: dateInputTouchGeometry\.paneBlockSize/g),
    ).toHaveLength(2);
  });

  it('positions panes with logical properties, so RTL mirrors', () => {
    const source = read('MonthScroller.tsx');
    // Scoped to the style objects: `scrollTo({left})` is the DOM API and is
    // supposed to say left — it is the CSS that must stay logical, because
    // physical `left` would lay the months out identically in both directions
    // while the scroll math mirrored, and the two would disagree under RTL.
    const styles = source
      .slice(
        source.indexOf('const styles = stylex.create('),
        source.indexOf('export interface MonthScrollerHandle'),
      )
      // Comments explain the rule ("insetInlineStart, not left") and would
      // otherwise trip it.
      .replace(/\/\/.*$/gm, '');
    expect(styles).toContain('insetInlineStart');
    expect(styles).not.toMatch(/\bleft:/);
    expect(styles).not.toMatch(/\bright:/);
  });

  it('keeps the month scroller and the wheels on border-box', () => {
    // Load-bearing: clientHeight is the pane height, the snap offsets and the
    // virtualization all at once.
    expect(read('MonthScroller.tsx')).toContain("boxSizing: 'border-box'");
    expect(read('Wheel.tsx')).toContain("boxSizing: 'border-box'");
  });

  it('sizes the wheel row tighter than a day cell, with larger text', () => {
    const tokens = read('tokens.stylex.ts');
    // Scroll-first rows: closer together than day cells and closer to the
    // text they hold, the way a platform picker packs them.
    expect(tokens).toContain("wheelItemSize: '28px'");
    expect(read('Wheel.tsx')).toContain(
      "fontSize: typeScaleVars['--text-large-size']",
    );
  });

  it('centers wheel rows and pads both ends so either extreme can reach the band', () => {
    const source = read('Wheel.tsx');
    expect(source).toContain("scrollSnapType: 'y mandatory'");
    expect(source).toContain("scrollSnapAlign: 'center'");
    expect(source).toContain(
      'paddingBlock: dateInputTouchGeometry.wheelEdgePadding',
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

  it('insets the sheet content equally on every edge', () => {
    const source = read('TouchDateField.tsx');
    // One inset, and the header/footer must not add their own on top of it —
    // that is what put the title and Done 4px off the day grid's line.
    expect(source).toContain("paddingInline: spacingVars['--spacing-4']");
    expect(source).toContain("paddingBlockEnd: spacingVars['--spacing-4']");
    // The block-start is the documented exception: the grab handle floats out
    // of flow, so the content wrapper owes it the height it occupies.
    expect(source).toContain("paddingBlockStart: spacingVars['--spacing-6']");
    const header = source.slice(
      source.indexOf('  header: {'),
      source.indexOf('  title: {'),
    );
    expect(header).not.toContain('paddingInline');
    const footer = source.slice(
      source.indexOf('  footer: {'),
      source.indexOf('  sheetBody: {'),
    );
    expect(footer).not.toContain('paddingInline');
  });

  it('floors the touch target without discarding the size prop', () => {
    const source = read('TouchDateField.tsx');
    // Each size keeps its own height AND cannot render below a thumb's reach.
    const sizeMap = source.slice(
      source.indexOf('const sizeStyles = stylex.create('),
      source.indexOf('const styles = stylex.create('),
    );
    expect(
      sizeMap.match(
        /minBlockSize: \{default: null, '@media \(pointer: coarse\)': TOUCH_TARGET\}/g,
      ),
    ).toHaveLength(3);
  });

  it('floors the month arrows too — Button tops out at 36px', () => {
    const source = read('TouchDateField.tsx');
    const arrow = source.slice(
      source.indexOf('  monthArrow: {'),
      source.indexOf('  monthArrowIcon: {'),
    );
    expect(arrow).toContain(
      "minBlockSize: {default: null, '@media (pointer: coarse)': TOUCH_TARGET}",
    );
    expect(arrow).toContain(
      "minInlineSize: {default: null, '@media (pointer: coarse)': TOUCH_TARGET}",
    );
  });

  /**
   * A bare inline wrapper puts the glyph on the text baseline, a few px above
   * the button's optical centre. Core's Calendar carries the same rule on its
   * own nav icons.
   */
  it('keeps the mirrored arrow glyph centred', () => {
    const source = read('TouchDateField.tsx');
    const icon = source.slice(source.indexOf('  monthArrowIcon: {'));
    expect(icon.slice(0, icon.indexOf('}'))).toContain(
      "display: 'inline-flex'",
    );
  });

  /**
   * The panels share one grid cell, so a cross-fade overlays them — and the
   * wheels' translucent selection band then tints a strip of the calendar
   * grid showing through underneath, one band-shaped rectangle of the
   * outgoing surface looking unlike the rest of it. That is what "the grey
   * area animates differently" was.
   *
   * They take turns instead: everything leaving fades out over the first leg
   * with no delay, everything arriving waits a leg and fades in over the
   * second. Measured on an iPhone 15 profile afterwards: zero frames with
   * both panels painting.
   */
  /**
   * Both footer actions span the sheet. A full-width primary is the shape a
   * phone form ends with, and it puts the target under the thumb wherever
   * the hand is.
   */
  it('spans the footer with its actions', () => {
    const source = read('TouchDateField.tsx');
    // Clear + Save share the calendar's cell; Done is the wheels'. Each
    // fills the space it is given, so the row divides evenly rather than by
    // label length.
    expect(source.match(/width="100%"/g)).toHaveLength(3);
  });

  it('fades the two surfaces in turn, never at the same time', () => {
    const source = read('TouchDateField.tsx');
    const styles = source.slice(
      source.indexOf('const styles = stylex.create('),
    );
    // Panels, weekday row, header arrows, footer: each waits a leg to arrive.
    expect(styles.match(/transitionDelay: PANEL_FADE_MS/g)).toHaveLength(4);
    // ...and each of their hidden states leaves at once, with no delay.
    expect(
      styles.match(/transitionDelay: '0s'/g)?.length ?? 0,
    ).toBeGreaterThanOrEqual(8);
  });

  /**
   * The selection band has to be visible enough that fading it reads as a
   * fade. At `--color-background-muted` (4.7% alpha) the whole plate sat 17
   * units of colour from the sheet behind it, so its animation had 17 units
   * to happen in while the text beside it travelled 412 — it did not look
   * like it was fading, it looked like it appeared at the end.
   * `--color-neutral` (10%) doubles that to 36 and is still quiet enough to
   * sit under text.
   */
  it('gives the wheel band enough contrast for its fade to read', () => {
    const source = read('Wheel.tsx');
    const band = source.slice(
      source.indexOf('  band: {'),
      source.indexOf('});', source.indexOf('  band: {')),
    );
    expect(band).toContain("backgroundColor: colorVars['--color-neutral']");
  });

  /**
   * `--ease-standard` is `cubic-bezier(0.24, 1, 0.4, 1)`: right for something
   * travelling a distance, wrong for a fade. Measured with it, opacity hit
   * 50% in 91ms and 95% in 241ms of a 410ms transition — the fade was over
   * long before the duration was, so lengthening the duration bought an
   * imperceptible tail rather than a slower fade. A fade covers no distance,
   * so its progress should simply be its progress.
   *
   * The title chevron is the exception and keeps the token: it rotates, and
   * rotation is travel.
   */
  it('fades linearly, and eases only the thing that travels', () => {
    const source = read('TouchDateField.tsx');
    const styles = source.slice(
      source.indexOf('const styles = stylex.create('),
    );
    const chevron = styles.slice(
      styles.indexOf('  titleChevron: {'),
      styles.indexOf('  titleChevronOpen: {'),
    );
    expect(chevron).toContain("transitionProperty: 'transform'");
    expect(chevron).toContain(
      "transitionTimingFunction: easeVars['--ease-standard']",
    );
    // The chevron is the only eased transition; every fade is linear.
    expect(
      styles.match(/transitionTimingFunction: easeVars\['--ease-standard'\]/g),
    ).toHaveLength(1);
    expect(styles.match(/transitionTimingFunction: 'linear'/g)).toHaveLength(4);
  });

  it('keeps the virtual keyboard down on the touch field', () => {
    const source = read('TouchDateField.tsx');
    // readOnly alone still opens the keyboard on some Android browsers.
    expect(source).toContain('readOnly');
    expect(source).toContain('inputMode="none"');
  });
});
