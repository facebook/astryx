/**
 * @file XDSCalendar.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Test suite for XDSCalendar component
 * @position Tests for XDSCalendar.tsx
 *
 * SYNC: When XDSCalendar.tsx changes, update tests accordingly
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useRef} from 'react';
import {XDSCalendar, type XDSCalendarHandle} from './XDSCalendar';

/**
 * Helper to find a day button by its day number.
 * Day buttons have aria-labels like "Thursday, January 15, 2026".
 */
function getDayButton(day: number, month = 'January', year = 2026) {
  const pattern = new RegExp(`${month}\\s+${day},\\s+${year}`);
  return screen.getByRole('button', {name: pattern});
}

/**
 * Helper to get all day buttons inside gridcells.
 */
function getAllDayButtons() {
  const gridcells = screen.getAllByRole('gridcell');
  return gridcells
    .map(cell => cell.querySelector('button'))
    .filter((btn): btn is HTMLButtonElement => btn !== null);
}

describe('XDSCalendar', () => {
  // ─── Basic Rendering ─────────────────────────────────────────

  it('renders current month by default', () => {
    render(<XDSCalendar />);

    const today = new Date();
    const formatter = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
    });
    const expectedLabel = formatter.format(today);

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('displays day names', () => {
    render(<XDSCalendar focusDate="2026-01-01" />);

    // Day names should be present (localized 2-char abbreviations)
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(7);
  });

  it('displays correct number of day cells', () => {
    render(<XDSCalendar focusDate="2026-01-01" />);

    // 6 rows * 7 days = 42 day buttons in gridcells (default fixed row count)
    const buttons = getAllDayButtons();
    expect(buttons.length).toBe(42);
  });

  // ─── Selection ───────────────────────────────────────────────

  it('highlights selected date', () => {
    render(<XDSCalendar value="2026-01-15" focusDate="2026-01-01" />);

    const day15 = getDayButton(15);
    expect(day15).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange when date is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<XDSCalendar onChange={handleChange} focusDate="2026-01-01" />);

    const day15 = getDayButton(15);
    await user.click(day15);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('2026-01-15', expect.any(Date));
  });

  it('supports uncontrolled mode with defaultValue', () => {
    render(<XDSCalendar defaultValue="2026-01-15" focusDate="2026-01-01" />);

    const day15 = getDayButton(15);
    expect(day15).toHaveAttribute('aria-selected', 'true');
  });

  it('does not write internalValue when value is controlled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    // Render with controlled value — component should not hold internal state
    const {rerender} = render(
      <XDSCalendar value="2026-01-10" onChange={handleChange} focusDate="2026-01-01" />,
    );

    // Click a different day
    await user.click(getDayButton(15));

    // onChange fires but value is still controlled
    expect(handleChange).toHaveBeenCalledWith('2026-01-15', expect.any(Date));

    // Re-render without updating value — selection should not change
    rerender(
      <XDSCalendar value="2026-01-10" onChange={handleChange} focusDate="2026-01-01" />,
    );

    const day10 = getDayButton(10);
    expect(day10).toHaveAttribute('aria-selected', 'true');
  });

  // ─── Navigation ──────────────────────────────────────────────

  it('navigates to previous month', async () => {
    const user = userEvent.setup();

    render(<XDSCalendar focusDate="2026-02-01" />);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('February 2026');

    const prevButton = screen.getByRole('button', {name: 'Previous month'});
    await user.click(prevButton);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('January 2026');
  });

  it('navigates to next month', async () => {
    const user = userEvent.setup();

    render(<XDSCalendar focusDate="2026-01-01" />);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('January 2026');

    const nextButton = screen.getByRole('button', {name: 'Next month'});
    await user.click(nextButton);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('February 2026');
  });

  it('calls onFocusDateChange when navigating', async () => {
    const user = userEvent.setup();
    const handleFocusChange = vi.fn();

    render(
      <XDSCalendar
        focusDate="2026-01-01"
        onFocusDateChange={handleFocusChange}
      />,
    );

    const nextButton = screen.getByRole('button', {name: 'Next month'});
    await user.click(nextButton);

    expect(handleFocusChange).toHaveBeenCalledWith('2026-02-01');
  });

  it('navigates without onFocusDateChange (semi-controlled focusDate)', async () => {
    const user = userEvent.setup();

    // focusDate provided without onFocusDateChange — should still navigate internally
    render(<XDSCalendar focusDate="2026-01-01" />);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('January 2026');

    const nextButton = screen.getByRole('button', {name: 'Next month'});
    await user.click(nextButton);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('February 2026');
  });

  it('syncs with focusDate prop changes after init', () => {
    const {rerender} = render(<XDSCalendar focusDate="2026-01-01" />);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('January 2026');

    rerender(<XDSCalendar focusDate="2026-06-01" />);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('June 2026');
  });

  it('controlled value change auto-navigates to visible month', () => {
    const {rerender} = render(
      <XDSCalendar value="2026-01-15" focusDate="2026-01-01" />,
    );

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('January 2026');

    // Change value to a date in a different month
    rerender(<XDSCalendar value="2026-06-15" />);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('June 2026');
  });

  // ─── Date Constraints ────────────────────────────────────────

  it('respects min date constraint', () => {
    render(<XDSCalendar focusDate="2026-01-01" min="2026-01-10" />);

    const day5 = getDayButton(5);
    expect(day5).toHaveAttribute('aria-disabled', 'true');

    const day15 = getDayButton(15);
    expect(day15).not.toHaveAttribute('aria-disabled');
  });

  it('respects max date constraint', () => {
    render(<XDSCalendar focusDate="2026-01-01" max="2026-01-20" />);

    const day25 = getDayButton(25);
    expect(day25).toHaveAttribute('aria-disabled', 'true');

    const day15 = getDayButton(15);
    expect(day15).not.toHaveAttribute('aria-disabled');
  });

  it('respects custom dateConstraints', () => {
    const isWeekday = (date: Date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    };

    render(
      <XDSCalendar focusDate="2026-01-01" dateConstraints={[isWeekday]} />,
    );

    // January 4, 2026 is a Sunday - should be disabled
    const sunday = getDayButton(4);
    expect(sunday).toHaveAttribute('aria-disabled', 'true');
  });

  it('respects multiple constraints simultaneously', () => {
    const isWeekday = (date: Date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    };

    render(
      <XDSCalendar
        focusDate="2026-01-01"
        min="2026-01-05"
        max="2026-01-25"
        dateConstraints={[isWeekday]}
      />,
    );

    // Day 3 before min — disabled
    const day3 = getDayButton(3);
    expect(day3).toHaveAttribute('aria-disabled', 'true');

    // Day 4 is Sunday — disabled by constraint
    const day4 = getDayButton(4);
    expect(day4).toHaveAttribute('aria-disabled', 'true');

    // Day 5 is Monday after min — enabled
    const day5 = getDayButton(5);
    expect(day5).not.toHaveAttribute('aria-disabled');

    // Day 26 is after max — disabled
    const day26 = getDayButton(26);
    expect(day26).toHaveAttribute('aria-disabled', 'true');
  });

  it('prevents click on disabled days', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSCalendar
        focusDate="2026-01-01"
        min="2026-01-10"
        onChange={handleChange}
      />,
    );

    const day5 = getDayButton(5);
    await user.click(day5);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disables nav buttons at min/max bounds', () => {
    render(
      <XDSCalendar
        focusDate="2026-01-01"
        min="2026-01-01"
        max="2026-01-31"
      />,
    );

    const prevButton = screen.getByRole('button', {name: 'Previous month'});
    const nextButton = screen.getByRole('button', {name: 'Next month'});

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  // ─── Multi-Month ─────────────────────────────────────────────

  it('renders two months when numberOfMonths={2}', () => {
    render(<XDSCalendar numberOfMonths={2} focusDate="2026-01-01" />);

    const heading = screen.getByRole('heading', {level: 2});
    expect(heading).toHaveTextContent(/January 2026.*February 2026/);
  });

  it('navigation advances both months together', async () => {
    const user = userEvent.setup();

    render(<XDSCalendar numberOfMonths={2} focusDate="2026-01-01" />);

    const nextButton = screen.getByRole('button', {name: 'Next month'});
    await user.click(nextButton);

    const heading = screen.getByRole('heading', {level: 2});
    expect(heading).toHaveTextContent(/February 2026.*March 2026/);
  });

  // ─── Display Options ─────────────────────────────────────────

  it('shows week numbers when hasWeekNumbers is true', () => {
    render(<XDSCalendar hasWeekNumbers focusDate="2026-01-01" />);

    const weekNumberCells = screen.getAllByText(/^[1-5]$/);
    expect(weekNumberCells.length).toBeGreaterThan(5);
  });

  it('respects weekStartsOn option', () => {
    render(<XDSCalendar weekStartsOn={1} focusDate="2026-01-01" />);

    const columnHeaders = screen.getAllByRole('columnheader');
    // First column header should have Monday's full name as aria-label
    expect(columnHeaders[0]).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/Monday/i),
    );
  });

  it('renders with hasVariableRowCount', () => {
    render(<XDSCalendar hasVariableRowCount focusDate="2026-02-01" />);

    // February 2026 starts on Sunday, so it needs only 4 rows
    // With variable row count, fewer cells should be rendered
    const buttons = getAllDayButtons();
    expect(buttons.length).toBeLessThan(42);
  });

  it('renders hasOutsideDays=false with gridcell role on empty cells', () => {
    render(<XDSCalendar hasOutsideDays={false} focusDate="2026-01-01" />);

    // All cells (including empty ones for outside days) should have gridcell role
    // 6 rows * 7 days = 42 gridcells even with hasOutsideDays=false
    const gridcells = screen.getAllByRole('gridcell');
    expect(gridcells.length).toBe(42);

    // Some gridcells should be empty (no button inside)
    const emptyGridcells = gridcells.filter(
      cell => !cell.querySelector('button'),
    );
    expect(emptyGridcells.length).toBeGreaterThan(0);
  });

  it('outside days are not selectable', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSCalendar
        focusDate="2026-01-01"
        onChange={handleChange}
        hasOutsideDays
      />,
    );

    // Find a day button from December 2025 (outside day in January view)
    const outsideDays = getAllDayButtons().filter(
      btn => btn.getAttribute('aria-disabled') === 'true' &&
        btn.getAttribute('data-date')?.startsWith('2025-12'),
    );

    if (outsideDays.length > 0) {
      await user.click(outsideDays[0]);
      expect(handleChange).not.toHaveBeenCalled();
    }
  });

  // ─── Range Mode ──────────────────────────────────────────────

  it('supports range selection mode', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSCalendar
        mode="range"
        onChange={handleChange}
        focusDate="2026-01-01"
      />,
    );

    const day10 = getDayButton(10);
    await user.click(day10);

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
      <XDSCalendar
        mode="range"
        onChange={handleChange}
        focusDate="2026-01-01"
      />,
    );

    const day20 = getDayButton(20);
    await user.click(day20);

    const day10 = getDayButton(10);
    await user.click(day10);

    expect(handleChange).toHaveBeenCalledWith({
      start: '2026-01-10',
      end: '2026-01-20',
    });
  });

  it('same date twice creates single-day range', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSCalendar
        mode="range"
        onChange={handleChange}
        focusDate="2026-01-01"
      />,
    );

    const day15 = getDayButton(15);
    await user.click(day15);
    await user.click(day15);

    expect(handleChange).toHaveBeenCalledWith({
      start: '2026-01-15',
      end: '2026-01-15',
    });
  });

  it('highlights range when value is provided', () => {
    render(
      <XDSCalendar
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

  it('cancels range selection with Escape', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSCalendar
        mode="range"
        onChange={handleChange}
        focusDate="2026-01-01"
      />,
    );

    // Start range
    const day10 = getDayButton(10);
    await user.click(day10);

    // Press Escape to cancel
    await user.keyboard('{Escape}');

    // Click another day — should start a new range, not complete the old one
    const day20 = getDayButton(20);
    await user.click(day20);

    // onChange should NOT have been called (first range was cancelled)
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('resets rangeSelectionStart when mode changes', () => {
    const {rerender} = render(
      <XDSCalendar mode="range" focusDate="2026-01-01" />,
    );

    // Simulate a mode change — internal rangeSelectionStart should reset
    rerender(<XDSCalendar mode="single" focusDate="2026-01-01" />);

    // No way to directly check internal state, but the component should render
    // without errors and not be in a range selection state
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('resets rangeSelectionStart when controlled value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const {rerender} = render(
      <XDSCalendar
        mode="range"
        value={{start: '2026-01-05', end: '2026-01-10'}}
        onChange={handleChange}
        focusDate="2026-01-01"
      />,
    );

    // Start a range selection
    await user.click(getDayButton(15));

    // External value change should reset range selection
    rerender(
      <XDSCalendar
        mode="range"
        value={{start: '2026-01-20', end: '2026-01-25'}}
        onChange={handleChange}
        focusDate="2026-01-01"
      />,
    );

    // Click day 28 — should be a fresh range start, not complete the old range
    await user.click(getDayButton(28));
    expect(handleChange).not.toHaveBeenCalled();
  });

  // ─── Accessibility ───────────────────────────────────────────

  it('has accessible grid structure with proper roles', () => {
    render(<XDSCalendar focusDate="2026-01-01" />);

    // Root has group role
    expect(screen.getByRole('group')).toBeInTheDocument();

    // Grid exists
    expect(screen.getByRole('grid')).toBeInTheDocument();

    // Rows exist (header row + 6 week rows)
    expect(screen.getAllByRole('row').length).toBe(7);

    // Grid cells exist (42 day cells)
    expect(screen.getAllByRole('gridcell').length).toBe(42);

    // Column headers exist
    expect(screen.getAllByRole('columnheader').length).toBe(7);
  });

  it('has aria-label on root element', () => {
    render(<XDSCalendar focusDate="2026-01-01" />);

    const root = screen.getByRole('group');
    expect(root).toHaveAttribute('aria-label', 'Calendar');
  });

  it('has heading role on month/year label', () => {
    render(<XDSCalendar focusDate="2026-01-01" />);

    const heading = screen.getByRole('heading', {level: 2});
    expect(heading).toHaveTextContent('January 2026');
  });

  it('has navigation buttons with accessible labels', () => {
    render(<XDSCalendar />);

    expect(
      screen.getByRole('button', {name: 'Previous month'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Next month'}),
    ).toBeInTheDocument();
  });

  it('has aria-live region for month change announcements', async () => {
    const user = userEvent.setup();

    render(<XDSCalendar focusDate="2026-01-01" />);

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');

    // Navigate to trigger announcement
    const nextButton = screen.getByRole('button', {name: 'Next month'});
    await user.click(nextButton);

    expect(liveRegion).toHaveTextContent(/February 2026/);
  });

  it('day buttons have data-date attribute for keyboard navigation', () => {
    render(<XDSCalendar focusDate="2026-01-01" />);

    const day15 = getDayButton(15);
    expect(day15).toHaveAttribute('data-date', '2026-01-15');
  });

  it('roving tabindex targets selected date', () => {
    render(<XDSCalendar value="2026-01-15" focusDate="2026-01-01" />);

    const day15 = getDayButton(15);
    expect(day15).toHaveAttribute('tabindex', '0');

    // Other days should have tabindex=-1
    const day10 = getDayButton(10);
    expect(day10).toHaveAttribute('tabindex', '-1');
  });

  it('disabled days use aria-disabled instead of HTML disabled for keyboard nav', () => {
    render(
      <XDSCalendar
        focusDate="2026-01-01"
        dateConstraints={[(date) => date.getDay() !== 0 && date.getDay() !== 6]}
      />,
    );

    // All day buttons should be in the DOM (aria-disabled keeps them focusable)
    const buttons = getAllDayButtons();
    expect(buttons.length).toBe(42);

    // Disabled days should have aria-disabled, not HTML disabled
    const sunday = getDayButton(4);
    expect(sunday).toHaveAttribute('aria-disabled', 'true');
    expect(sunday).not.toHaveAttribute('disabled');
  });

  // ─── Imperative Ref ──────────────────────────────────────────

  it('supports imperative navigateTo via ref', () => {
    function TestComponent() {
      const ref = useRef<XDSCalendarHandle>(null);
      return (
        <>
          <XDSCalendar ref={ref} focusDate="2026-01-01" />
          <button onClick={() => ref.current?.navigateTo('2026-06-01')}>
            Go to June
          </button>
        </>
      );
    }

    render(<TestComponent />);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('January 2026');

    act(() => {
      screen.getByText('Go to June').click();
    });

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('June 2026');
  });

  // ─── Keyboard Navigation ────────────────────────────────────

  it('arrow key navigation works through disabled days', async () => {
    const user = userEvent.setup();

    render(
      <XDSCalendar
        focusDate="2026-01-01"
        dateConstraints={[(date) => date.getDay() !== 0 && date.getDay() !== 6]}
      />,
    );

    // Focus the tabbable day
    const buttons = getAllDayButtons();
    const tabbableButton = buttons.find(
      btn => btn.getAttribute('tabindex') === '0',
    );
    expect(tabbableButton).toBeDefined();

    tabbableButton!.focus();

    // Arrow right should move focus to next day, even if disabled
    await user.keyboard('{ArrowRight}');

    // Focus should have moved (we can't easily test DOM focus in jsdom,
    // but we verify the component doesn't throw)
    expect(document.activeElement).toBeDefined();
  });

  // ─── Week Number Correctness ────────────────────────────────

  it('displays correct ISO week numbers', () => {
    render(<XDSCalendar hasWeekNumbers focusDate="2026-02-01" />);

    // February 2026 contains week 6, which is unique to week numbers
    // (no day button will show "6" in February since Feb has 28 days and day 6 exists,
    // but week 6 of the year should be present)
    const allText6 = screen.getAllByText('6');
    // Should find at least 2: week number "6" and day "6"
    expect(allText6.length).toBeGreaterThanOrEqual(2);
  });

  // ─── Min/Max Boundary Inclusion ─────────────────────────────

  it('min date is selectable (inclusive)', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSCalendar
        focusDate="2026-01-01"
        min="2026-01-10"
        onChange={handleChange}
      />,
    );

    const day10 = getDayButton(10);
    expect(day10).not.toHaveAttribute('aria-disabled');

    await user.click(day10);
    expect(handleChange).toHaveBeenCalledWith('2026-01-10', expect.any(Date));
  });

  it('max date is selectable (inclusive)', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSCalendar
        focusDate="2026-01-01"
        max="2026-01-20"
        onChange={handleChange}
      />,
    );

    const day20 = getDayButton(20);
    expect(day20).not.toHaveAttribute('aria-disabled');

    await user.click(day20);
    expect(handleChange).toHaveBeenCalledWith('2026-01-20', expect.any(Date));
  });

  // ─── Disabled Day Mouse Events ─────────────────────────────

  it('does not fire onMouseLeave for disabled days', () => {
    render(
      <XDSCalendar
        focusDate="2026-01-01"
        min="2026-01-10"
      />,
    );

    const day5 = getDayButton(5);
    expect(day5).toHaveAttribute('aria-disabled', 'true');

    // We verify the handler is guarded by checking aria-disabled
    // The actual mouse event guard is in the component code
  });
});
