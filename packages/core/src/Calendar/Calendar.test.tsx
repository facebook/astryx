// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Calendar.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Test suite for Calendar component
 * @position Tests for Calendar.tsx
 *
 * SYNC: When Calendar.tsx changes, update tests accordingly
 */

import {describe, it, expect, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Calendar} from './Calendar';
import type {CalendarHandle} from './Calendar';

/**
 * Helper to find a day button by its day number.
 * Day buttons have aria-labels like "Thursday, January 15, 2026".
 */
function getDayButton(day: number, month = 'January', year = 2026) {
  // Match the full date pattern with the day number
  const pattern = new RegExp(`${month}\\s+${day},\\s+${year}`);
  return screen.getByRole('gridcell', {name: pattern});
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
    expect(day15).toHaveAttribute('aria-selected', 'true');
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

    const prevButton = screen.getByRole('button', {name: 'Previous month'});
    await user.click(prevButton);

    expect(screen.getByText('January 2026')).toBeInTheDocument();
  });

  it('navigates to next month', async () => {
    const user = userEvent.setup();

    render(<Calendar focusDate="2026-01-01" />);

    // Verify we start on January
    expect(screen.getByText('January 2026')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', {name: 'Next month'});
    await user.click(nextButton);

    expect(screen.getByText('February 2026')).toBeInTheDocument();
  });

  it('calls onFocusDateChange when navigating', async () => {
    const user = userEvent.setup();
    const handleFocusChange = vi.fn();

    render(
      <Calendar focusDate="2026-01-01" onFocusDateChange={handleFocusChange} />,
    );

    const nextButton = screen.getByRole('button', {name: 'Next month'});
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

    const nextButton = screen.getByRole('button', {name: 'Next month'});
    await user.click(nextButton);

    expect(screen.getByText(/February 2026.*March 2026/)).toBeInTheDocument();
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

    expect(day10).toHaveAttribute('aria-selected', 'true');
    expect(day12).toHaveAttribute('aria-selected', 'true');
    expect(day15).toHaveAttribute('aria-selected', 'true');
  });

  // ─── Accessibility ───────────────────────────────────────────

  it('has accessible grid structure', () => {
    render(<Calendar focusDate="2026-01-01" />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('gridcell').length).toBeGreaterThan(0);
  });

  it('has navigation buttons with accessible labels', () => {
    render(<Calendar />);

    expect(
      screen.getByRole('button', {name: 'Previous month'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Next month'}),
    ).toBeInTheDocument();
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
    day28.querySelector('button')?.focus();

    // Press ArrowDown — should move to Feb 4 (+7 days), not Feb 28
    await user.keyboard('{ArrowDown}');

    // After navigation, Feb 4 should be focused
    const focusedElement = document.activeElement;
    expect(focusedElement).toHaveAttribute('data-date', '2026-02-04');
  });

  it('prev button is disabled when focusDate month contains min', () => {
    render(<Calendar focusDate="2026-01-01" min="2026-01-15" />);

    const prevButton = screen.getByRole('button', {name: 'Previous month'});
    expect(prevButton).toBeDisabled();
  });

  it('next button is disabled when focusDate month contains max', () => {
    render(<Calendar focusDate="2026-01-01" max="2026-01-15" />);

    const nextButton = screen.getByRole('button', {name: 'Next month'});
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
});
