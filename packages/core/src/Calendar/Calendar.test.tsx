// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Calendar.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Test suite for Calendar component
 * @position Tests for Calendar.tsx
 *
 * SYNC: When Calendar.tsx changes, update tests accordingly
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {act, render, screen, within, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {getButton} from '../__tests__/fastRoleQueries';
import * as stylex from '@stylexjs/stylex';
import {Calendar} from './Calendar';
import type {CalendarHandle} from './Calendar';
import {calendarStyles} from './styles';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';

afterEach(() => {
  __resetLiveRegionsForTest();
});

function politeRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="polite"]');
}

/**
 * Helper to find a day button by its day number.
 * Day buttons are native <button> elements with aria-labels like
 * "Thursday, January 15, 2026". Each button is the sole child of a
 * role="gridcell" wrapper.
 */
function getDayButton(day: number, month = 'January', year = 2026) {
  // Match the full date pattern with the day number
  const pattern = new RegExp(`${month}\\s+${day},\\s+${year}`);
  return getButton(pattern);
}

describe('Calendar', () => {
  // ─── Basic Rendering ─────────────────────────────────────────
  it('forwards ref to the calendar root element', () => {
    let root: HTMLDivElement | null = null;
    render(
      <Calendar
        ref={el => {
          root = el;
        }}
      />,
    );
    expect(root).toBeInstanceOf(HTMLDivElement);
  });

  it('exposes navigation through handleRef', () => {
    let handle: CalendarHandle | null = null;
    render(
      <Calendar
        handleRef={h => {
          handle = h;
        }}
      />,
    );

    act(() => {
      handle?.navigateTo('2026-03-01');
    });

    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('renders current month by default', () => {
    render(<Calendar />);

    const today = new Date();
    const formatter = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
    });
    const expectedLabel = formatter.format(today);

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it("marks today's cell with aria-current='date'", () => {
    render(<Calendar />);

    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const todayCell = document.querySelector(`button[data-date="${iso}"]`);
    expect(todayCell).not.toBeNull();
    expect(todayCell).toHaveAttribute('aria-current', 'date');

    // Only today's cell is marked current.
    const others = Array.from(
      document.querySelectorAll('button[data-date]'),
    ).filter(el => el.getAttribute('data-date') !== iso);
    expect(others.length).toBeGreaterThan(0);
    others.forEach(el => expect(el).not.toHaveAttribute('aria-current'));
  });

  it('displays day names', () => {
    render(<Calendar />);

    expect(screen.getByText('Su')).toBeInTheDocument();
    expect(screen.getByText('Mo')).toBeInTheDocument();
    expect(screen.getByText('Tu')).toBeInTheDocument();
    expect(screen.getByText('We')).toBeInTheDocument();
    expect(screen.getByText('Th')).toBeInTheDocument();
    expect(screen.getByText('Fr')).toBeInTheDocument();
    expect(screen.getByText('Sa')).toBeInTheDocument();
  });

  it('displays correct number of day cells', () => {
    render(<Calendar />);

    // 6 rows * 7 days = 42 cells (default fixed row count)
    const buttons = screen.getAllByRole('gridcell');
    expect(buttons.length).toBe(42);
  });

  // ─── Selection ───────────────────────────────────────────────

  it('highlights selected date', () => {
    render(<Calendar value="2026-01-15" focusDate="2026-01-01" />);

    const day15 = getDayButton(15);
    // In an ARIA grid, selection state lives on the gridcell, not the button
    // (a plain button role does not permit aria-selected).
    const gridcell15 = day15.closest('[role="gridcell"]');
    expect(gridcell15).toHaveAttribute('aria-selected', 'true');
    expect(day15).not.toHaveAttribute('aria-selected');
  });

  it('calls onChange when date is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Calendar onChange={handleChange} focusDate="2026-01-01" />);

    const day15 = getDayButton(15);
    await user.click(day15);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('2026-01-15', expect.any(Date));
  });

  // ─── Navigation ──────────────────────────────────────────────

  it('navigates to previous month', async () => {
    const user = userEvent.setup();

    render(<Calendar focusDate="2026-02-01" />);

    // Verify we start on February
    expect(screen.getByText('February 2026')).toBeInTheDocument();

    const prevButton = getButton('Previous month');
    await user.click(prevButton);

    expect(screen.getByText('January 2026')).toBeInTheDocument();
  });

  it('navigates to next month', async () => {
    const user = userEvent.setup();

    render(<Calendar focusDate="2026-01-01" />);

    // Verify we start on January
    expect(screen.getByText('January 2026')).toBeInTheDocument();

    const nextButton = getButton('Next month');
    await user.click(nextButton);

    expect(screen.getByText('February 2026')).toBeInTheDocument();
  });

  it('calls onFocusDateChange when navigating', async () => {
    const user = userEvent.setup();
    const handleFocusChange = vi.fn();

    render(
      <Calendar focusDate="2026-01-01" onFocusDateChange={handleFocusChange} />,
    );

    const nextButton = getButton('Next month');
    await user.click(nextButton);

    expect(handleFocusChange).toHaveBeenCalledWith('2026-02-01');
  });

  // ─── Date Constraints ────────────────────────────────────────

  it('respects min date constraint', () => {
    render(<Calendar focusDate="2026-01-01" min="2026-01-10" />);

    // Day 5 should be disabled (before min)
    const day5 = getDayButton(5);
    expect(day5).toBeDisabled();

    // Day 15 should be enabled (after min)
    const day15 = getDayButton(15);
    expect(day15).not.toBeDisabled();
  });

  it('respects max date constraint', () => {
    render(<Calendar focusDate="2026-01-01" max="2026-01-20" />);

    const day25 = getDayButton(25);
    expect(day25).toBeDisabled();

    const day15 = getDayButton(15);
    expect(day15).not.toBeDisabled();
  });

  it('respects custom dateConstraints', () => {
    // Only allow weekdays
    const isWeekday = (date: Date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    };

    render(<Calendar focusDate="2026-01-01" dateConstraints={[isWeekday]} />);

    // January 4, 2026 is a Sunday - should be disabled
    const sunday = getDayButton(4);
    expect(sunday).toBeDisabled();
  });

  // ─── Multi-Month ─────────────────────────────────────────────

  it('renders two months when numberOfMonths={2}', () => {
    render(<Calendar numberOfMonths={2} focusDate="2026-01-01" />);

    // The header shows both months
    expect(screen.getByText(/January 2026.*February 2026/)).toBeInTheDocument();
  });

  it('navigation advances both months together', async () => {
    const user = userEvent.setup();

    render(<Calendar numberOfMonths={2} focusDate="2026-01-01" />);

    const nextButton = getButton('Next month');
    await user.click(nextButton);

    expect(screen.getByText(/February 2026.*March 2026/)).toBeInTheDocument();
  });

  it('clamps out-of-range numberOfMonths to a single month', () => {
    // 1000 would otherwise try to render 1000 month grids and lock the page up.
    render(
      <Calendar
        numberOfMonths={1000 as unknown as 1 | 2}
        focusDate="2026-01-01"
      />,
    );

    // Only the focused month renders — no second month, no range separator.
    expect(screen.getByText('January 2026')).toBeInTheDocument();
    expect(screen.queryByText(/February 2026/)).not.toBeInTheDocument();
  });

  it('clamps numberOfMonths={0} to a single month', () => {
    render(
      <Calendar
        numberOfMonths={0 as unknown as 1 | 2}
        focusDate="2026-01-01"
      />,
    );

    // 0 previously rendered no months at all; now falls back to one.
    expect(screen.getByText('January 2026')).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell').length).toBeGreaterThan(0);
  });

  // ─── Display Options ─────────────────────────────────────────

  it('shows week numbers when hasWeekNumbers is true', () => {
    render(<Calendar hasWeekNumbers focusDate="2026-01-01" />);

    // Look for week number cells - they should be in the grid but not buttons
    // Week numbers for January 2026 include week 1, 2, 3, 4, 5
    const weekNumberCells = screen.getAllByText(/^[1-5]$/);
    // Should have more than just day numbers (week numbers add extra cells)
    expect(weekNumberCells.length).toBeGreaterThan(5);
  });

  it('respects weekStartsOn option', () => {
    render(<Calendar weekStartsOn={1} />);

    // First day name should be Monday
    const dayNames = screen.getAllByText(/^(Mo|Tu|We|Th|Fr|Sa|Su)$/);
    expect(dayNames[0]).toHaveTextContent('Mo');
  });

  it('accepts a three-letter day name for weekStartsOn', () => {
    render(<Calendar weekStartsOn="mon" />);

    // "mon" should behave exactly like the numeric 1 (Monday first).
    const dayNames = screen.getAllByText(/^(Mo|Tu|We|Th|Fr|Sa|Su)$/);
    expect(dayNames[0]).toHaveTextContent('Mo');
  });

  it('treats weekStartsOn day names case-insensitively', () => {
    render(<Calendar weekStartsOn={'WED' as 'wed'} />);

    const dayNames = screen.getAllByText(/^(Mo|Tu|We|Th|Fr|Sa|Su)$/);
    expect(dayNames[0]).toHaveTextContent('We');
  });

  // ─── Range Mode ──────────────────────────────────────────────

  it('supports range selection mode', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Calendar mode="range" onChange={handleChange} focusDate="2026-01-01" />,
    );

    // Click start date
    const day10 = getDayButton(10);
    await user.click(day10);

    // Click end date
    const day15 = getDayButton(15);
    await user.click(day15);

    expect(handleChange).toHaveBeenCalledWith({
      start: '2026-01-10',
      end: '2026-01-15',
    });
  });

  it('handles reverse range selection (end before start)', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Calendar mode="range" onChange={handleChange} focusDate="2026-01-01" />,
    );

    // Click later date first
    const day20 = getDayButton(20);
    await user.click(day20);

    // Click earlier date
    const day10 = getDayButton(10);
    await user.click(day10);

    // Should swap to ensure start <= end
    expect(handleChange).toHaveBeenCalledWith({
      start: '2026-01-10',
      end: '2026-01-20',
    });
  });

  it('highlights range when value is provided', () => {
    render(
      <Calendar
        mode="range"
        value={{start: '2026-01-10', end: '2026-01-15'}}
        focusDate="2026-01-01"
      />,
    );

    const day10 = getDayButton(10);
    const day12 = getDayButton(12);
    const day15 = getDayButton(15);

    // Selection state lives on the gridcell wrapper, not the day button.
    expect(day10.closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(day12.closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(day15.closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(day10).not.toHaveAttribute('aria-selected');
    expect(day12).not.toHaveAttribute('aria-selected');
    expect(day15).not.toHaveAttribute('aria-selected');
  });

  it('caps the range highlight next to a disabled mid-range day (#2715)', () => {
    // Disable Jan 13. With Jan 10–15 selected, day 12 (immediately before the
    // disabled day) should get a rounded end cap on its right edge, and day 14
    // (immediately after) a rounded cap on its left edge — so the highlight
    // reads as terminating at the disabled gap rather than running square-edged
    // into it.
    const disableJan13 = (d: Date) =>
      !(d.getFullYear() === 2026 && d.getMonth() === 0 && d.getDate() === 13);
    render(
      <Calendar
        mode="range"
        value={{start: '2026-01-10', end: '2026-01-15'}}
        focusDate="2026-01-01"
        dateConstraints={[disableJan13]}
      />,
    );

    // The range background is an absolutely-positioned sibling div inside the
    // same gridcell as the day button.
    const rangeBgFor = (day: number): HTMLElement => {
      const button = getDayButton(day);
      const cell = button.closest('[role="gridcell"]') as HTMLElement;
      // First child div is the range background (rendered before the button).
      return cell.firstElementChild as HTMLElement;
    };

    const day12Bg = rangeBgFor(12);
    const day14Bg = rangeBgFor(14);

    // Capped edges have a border radius; the un-capped edge stays square.
    expect(getComputedStyle(day12Bg).borderTopRightRadius).not.toBe('');
    expect(getComputedStyle(day12Bg).borderTopRightRadius).not.toBe('0px');
    expect(getComputedStyle(day14Bg).borderTopLeftRadius).not.toBe('');
    expect(getComputedStyle(day14Bg).borderTopLeftRadius).not.toBe('0px');
  });

  it('does not range-highlight adjacent-month spillover days in two-month view', () => {
    // #2715: with July 1–31 selected and July+August visible, July 26–31 also
    // render as outside days in the August pane. Those spillover copies must
    // not carry the range-highlight state (data-in-range) even though their
    // dates fall inside the selected range.
    render(
      <Calendar
        mode="range"
        numberOfMonths={2}
        focusDate="2026-07-01"
        value={{start: '2026-07-01', end: '2026-07-31'}}
      />,
    );

    const spillover = [
      '2026-07-26',
      '2026-07-27',
      '2026-07-28',
      '2026-07-29',
      '2026-07-30',
      '2026-07-31',
    ];

    const allDayButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('button[data-date]'),
    );

    for (const iso of spillover) {
      const matches = allDayButtons.filter(
        b => b.getAttribute('data-date') === iso,
      );
      // Renders once in the July pane and once as a spillover in August.
      expect(matches.length).toBeGreaterThanOrEqual(2);
      const outsideCopies = matches.filter(
        b => b.getAttribute('aria-disabled') === 'true',
      );
      expect(outsideCopies.length).toBeGreaterThanOrEqual(1);
      for (const b of outsideCopies) {
        expect(b).not.toHaveAttribute('data-in-range');
      }
    }
  });

  // ─── Accessibility ───────────────────────────────────────────

  it('has accessible grid structure', () => {
    render(<Calendar focusDate="2026-01-01" />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('gridcell').length).toBeGreaterThan(0);
  });

  it('renders a valid APG grid: one grid, header row of columnheaders inside it, week rows of gridcells', () => {
    render(<Calendar focusDate="2026-01-01" />);

    const grids = screen.getAllByRole('grid');
    expect(grids.length).toBe(1);
    const grid = grids[0];

    // The columnheaders live INSIDE the grid.
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders.length).toBe(7);
    for (const header of columnHeaders) {
      expect(grid.contains(header)).toBe(true);
    }

    // The grid's rows: first is the header row of columnheaders, the rest are
    // week rows whose direct children are gridcells.
    const rows = within(grid).getAllByRole('row');
    // 1 header row + 6 week rows (fixed 6-row grid).
    expect(rows.length).toBe(7);

    const [headerRow, ...weekRows] = rows;

    // Header row's direct children are the 7 columnheaders.
    const headerChildren = Array.from(headerRow.children);
    const headerColHeaders = headerChildren.filter(
      child => child.getAttribute('role') === 'columnheader',
    );
    expect(headerColHeaders.length).toBe(7);

    // Each week row's direct children are gridcells (7 per row).
    for (const row of weekRows) {
      const gridcellChildren = Array.from(row.children).filter(
        child => child.getAttribute('role') === 'gridcell',
      );
      expect(gridcellChildren.length).toBe(7);
    }
  });

  it('renders week-number cells as rowheader when hasWeekNumbers is set', () => {
    render(<Calendar hasWeekNumbers focusDate="2026-01-01" />);

    const grid = screen.getByRole('grid');
    const rowHeaders = within(grid).getAllByRole('rowheader');
    // One rowheader (week number) per week row.
    expect(rowHeaders.length).toBeGreaterThanOrEqual(5);
    // Week numbers are numeric.
    for (const header of rowHeaders) {
      expect(header.textContent).toMatch(/^\d+$/);
    }
  });

  it('gridcell wrappers are direct children of week rows, and the button is inside the gridcell', () => {
    render(<Calendar focusDate="2026-01-01" />);

    const grid = screen.getByRole('grid');
    const gridcells = within(grid).getAllByRole('gridcell');
    for (const cell of gridcells) {
      // The gridcell's parent is a role="row".
      const parent = cell.parentElement;
      expect(parent?.getAttribute('role')).toBe('row');
      // The day button (if present) is a descendant of the gridcell.
      const button = cell.querySelector('button');
      if (button) {
        expect(cell.contains(button)).toBe(true);
        expect(button).not.toHaveAttribute('role', 'gridcell');
      }
    }
  });

  it('has navigation buttons with accessible labels', () => {
    render(<Calendar />);

    expect(getButton('Previous month')).toBeInTheDocument();
    expect(getButton('Next month')).toBeInTheDocument();
  });

  // ─── Month Change Announcements ──────────────────────────────

  describe('month change announcements', () => {
    it('does not announce on initial render', () => {
      render(<Calendar focusDate="2026-01-01" />);
      // The live region is only created lazily on first announce; mounting the
      // calendar must not speak the initial month.
      expect(politeRegion()).toBeNull();
    });

    it('announces the new month politely when clicking next', async () => {
      const user = userEvent.setup();
      render(<Calendar focusDate="2026-01-01" />);

      await user.click(screen.getByRole('button', {name: 'Next month'}));

      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('February 2026');
      });
    });

    it('announces the new month politely when clicking previous', async () => {
      const user = userEvent.setup();
      render(<Calendar focusDate="2026-02-01" />);

      await user.click(screen.getByRole('button', {name: 'Previous month'}));

      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('January 2026');
      });
    });

    it('announces the next month when paging the grid with PageDown', async () => {
      const user = userEvent.setup();
      render(<Calendar focusDate="2026-01-01" />);

      // PageDown from a focused day pages the visible grid to the next month.
      getDayButton(15).focus();
      await user.keyboard('{PageDown}');

      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('February 2026');
      });
    });

    it('announces the newly visible month when navigated via the handle', async () => {
      let handle: CalendarHandle | null = null;
      render(
        <Calendar
          focusDate="2026-01-01"
          handleRef={h => {
            handle = h;
          }}
        />,
      );

      act(() => {
        handle?.navigateTo('2026-03-01');
      });

      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('March 2026');
      });
    });

    it('announces both months in a two-month view', async () => {
      const user = userEvent.setup();
      render(<Calendar numberOfMonths={2} focusDate="2026-01-01" />);

      await user.click(screen.getByRole('button', {name: 'Next month'}));

      await waitFor(() => {
        expect(politeRegion()).toHaveTextContent('February 2026 – March 2026');
      });
    });

    it('does not announce when selecting a date leaves the visible month unchanged', async () => {
      const user = userEvent.setup();
      render(<Calendar focusDate="2026-01-01" />);

      // Selecting an in-month day does not move the grid, so nothing should be
      // announced (the live region stays uncreated).
      await user.click(getDayButton(15));

      // Allow the announce rAF a chance to run before asserting silence.
      await act(async () => {
        await new Promise(resolve => requestAnimationFrame(resolve));
      });
      expect(politeRegion()).toBeNull();
    });
  });

  // ─── Bug Regression Tests ───────────────────────────────────

  it('day buttons have data-date attribute with ISO string', () => {
    render(<Calendar focusDate="2026-01-01" />);

    const day15 = getDayButton(15);
    expect(day15).toHaveAttribute('data-date', '2026-01-15');
  });

  it('ArrowDown moves focus +7 days, not to same day in next month', async () => {
    const user = userEvent.setup();
    const handleFocusChange = vi.fn();

    render(
      <Calendar focusDate="2026-01-01" onFocusDateChange={handleFocusChange} />,
    );

    // Focus Jan 28
    const day28 = getDayButton(28);
    await user.click(day28);
    day28.focus();

    // Press ArrowDown — should move to Feb 4 (+7 days), not Feb 28
    await user.keyboard('{ArrowDown}');

    // After navigation, Feb 4 should be focused
    const focusedElement = document.activeElement;
    expect(focusedElement).toHaveAttribute('data-date', '2026-02-04');
  });

  it('ArrowDown lands on the same weekday +7 days even when earlier days are disabled (complex-2)', async () => {
    const user = userEvent.setup();

    // min disables Jan 1–4 (HTML-disabled). Jan 8 is a Thursday; ArrowDown must
    // land on Jan 15 (the same weekday, +7 days), not a shifted date caused by
    // the removed enabled cells.
    render(<Calendar focusDate="2026-01-01" min="2026-01-05" />);

    const day1 = getDayButton(1);
    expect(day1).toBeDisabled();

    const day8 = getDayButton(8);
    day8.focus();

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveAttribute('data-date', '2026-01-15');

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveAttribute('data-date', '2026-01-22');
  });

  it('ArrowUp skips a disabled cell in the same column to the next enabled row (complex-2)', async () => {
    const user = userEvent.setup();

    // max disables Jan 22 onward. Focus Feb 5 handling is out of scope; instead
    // use dateConstraints to disable a single mid-grid day and verify column
    // geometry is preserved (ArrowUp from Jan 15 skips disabled Jan 8 → Jan 1).
    const disableJan8 = (date: Date) =>
      !(
        date.getFullYear() === 2026 &&
        date.getMonth() === 0 &&
        date.getDate() === 8
      );

    render(<Calendar focusDate="2026-01-01" dateConstraints={[disableJan8]} />);

    const day8 = getDayButton(8);
    expect(day8).toBeDisabled();

    const day15 = getDayButton(15);
    day15.focus();

    // ArrowUp: same column one row up is Jan 8 (disabled) → skip to Jan 1.
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toHaveAttribute('data-date', '2026-01-01');
  });

  it('cross-month arrow nav resolves the focused date from data-date (locale-safe)', async () => {
    // Regression for complex-4: getFocusedDate must read the machine-readable
    // data-date attribute, not parse the human-readable aria-label with
    // new Date() (which is locale-dependent). We prove the resolution path by
    // corrupting the aria-label to something new Date() cannot parse — cross-
    // month navigation must still report the correct ISO date.
    const user = userEvent.setup();
    const handleFocusChange = vi.fn();

    render(
      <Calendar focusDate="2026-01-01" onFocusDateChange={handleFocusChange} />,
    );

    const day28 = getDayButton(28);
    await user.click(day28);
    day28.focus();
    // Simulate a non-English/unparseable aria-label while keeping data-date.
    day28.setAttribute('aria-label', '2026年1月28日 水曜日');

    await user.keyboard('{ArrowDown}');

    // Feb 4 (+7 days) — resolved via data-date despite the unparseable label.
    expect(document.activeElement).toHaveAttribute('data-date', '2026-02-04');
  });

  it('prev button is disabled when focusDate month contains min', () => {
    render(<Calendar focusDate="2026-01-01" min="2026-01-15" />);

    const prevButton = getButton('Previous month');
    expect(prevButton).toBeDisabled();
  });

  it('next button is disabled when focusDate month contains max', () => {
    render(<Calendar focusDate="2026-01-01" max="2026-01-15" />);

    const nextButton = getButton('Next month');
    expect(nextButton).toBeDisabled();
  });

  it('outside days are not clickable when hasOutsideDays is true', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Calendar
        focusDate="2026-01-01"
        hasOutsideDays
        onChange={handleChange}
      />,
    );

    // January 2026 starts on Thursday, so Dec 28-31 are outside days
    // Find an outside day button (December day visible in January grid)
    const outsideDays = screen.getAllByRole('gridcell').filter(cell => {
      const button = cell.querySelector('button');
      return button?.getAttribute('aria-disabled') === 'true';
    });

    // Click the first outside day
    if (outsideDays[0]) {
      const button = outsideDays[0].querySelector('button');
      if (button) {
        await user.click(button);
      }
    }

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('Escape cancels range selection in progress', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Calendar mode="range" onChange={handleChange} focusDate="2026-01-01" />,
    );

    // Click start date to begin range selection
    const day10 = getDayButton(10);
    await user.click(day10);

    // Press Escape to cancel
    await user.keyboard('{Escape}');

    // Click another date — should start a NEW range, not complete the old one
    const day20 = getDayButton(20);
    await user.click(day20);

    // onChange should NOT have been called (no range completed)
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('day name headers have role="columnheader"', () => {
    render(<Calendar focusDate="2026-01-01" />);

    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders.length).toBe(7);

    // Verify they contain day name abbreviations
    const dayNames = columnHeaders.map(h => h.textContent);
    expect(dayNames).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
  });

  it('button inside gridcell does not duplicate role="gridcell"', () => {
    render(<Calendar focusDate="2026-01-01" />);

    const gridcells = screen.getAllByRole('gridcell');
    for (const cell of gridcells) {
      const button = cell.querySelector('button');
      if (button) {
        expect(button).not.toHaveAttribute('role', 'gridcell');
      }
    }
  });

  // ─── RTL (#3388) ─────────────────────────────────────────────

  describe('RTL month navigation', () => {
    // jsdom does not apply compiled StyleX CSS, so the scaleX(-1) mirror
    // itself is only observable in a browser (see the dir="rtl" Storybook
    // story). These tests pin the structure the fix depends on: both nav
    // chevrons render inside the navIcon wrapper that carries the
    // ':is([dir="rtl"] *)' conditional transform.
    it('wraps both nav chevrons in the RTL-mirroring navIcon wrapper', () => {
      render(<Calendar focusDate="2026-01-01" />);

      const {className: navIconClass} = stylex.props(calendarStyles.navIcon);
      expect(navIconClass).toBeTruthy();

      for (const name of ['Previous month', 'Next month']) {
        const button = getButton(name);
        const wrappers = Array.from(button.querySelectorAll('span')).filter(
          span => span.className === navIconClass,
        );
        expect(wrappers.length).toBe(1);
      }
    });

    it('keeps navigation semantics unchanged under dir="rtl"', async () => {
      const user = userEvent.setup();

      render(
        <div dir="rtl">
          <Calendar focusDate="2026-02-01" />
        </div>,
      );

      expect(screen.getByText('February 2026')).toBeInTheDocument();

      // DOM order and handlers must not change in RTL: flexbox already
      // places "Previous month" at the visual right; only the glyph mirrors.
      await user.click(getButton('Previous month'));
      expect(screen.getByText('January 2026')).toBeInTheDocument();

      await user.click(getButton('Next month'));
      expect(screen.getByText('February 2026')).toBeInTheDocument();
    });
  });
});
