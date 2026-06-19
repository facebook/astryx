// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {Timestamp} from './Timestamp';

describe('Timestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-25T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a <time> element with ISO datetime attribute', () => {
    render(
      <Timestamp
        value="2026-03-25T10:00:00Z"
        format="date_time"
        data-testid="ts"
      />,
    );
    const el = screen.getByTestId('ts');
    expect(el.tagName).toBe('TIME');
    expect(el.getAttribute('datetime')).toBe('2026-03-25T10:00:00.000Z');
  });

  it('renders relative format for recent times', () => {
    const twoHoursAgo = Date.now() / 1000 - 7200;
    render(<Timestamp value={twoHoursAgo} format="relative" />);
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('renders "just now" for very recent times', () => {
    const fiveSecondsAgo = Date.now() / 1000 - 5;
    render(<Timestamp value={fiveSecondsAgo} format="relative" />);
    expect(screen.getByText('just now')).toBeInTheDocument();
  });

  it('renders "yesterday" for times ~1 day ago', () => {
    const yesterday = Date.now() / 1000 - 100000;
    render(<Timestamp value={yesterday} format="relative" />);
    expect(screen.getByText('yesterday')).toBeInTheDocument();
  });

  // --- Standard display formats ---

  it('renders date format', () => {
    render(
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="date"
        data-testid="ts"
      />,
    );
    const el = screen.getByTestId('ts');
    expect(el.textContent).toContain('2026');
    // Should not contain time
    expect(el.textContent).not.toContain(':');
  });

  it('renders date_time format', () => {
    render(
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="date_time"
        data-testid="ts"
      />,
    );
    const el = screen.getByTestId('ts');
    expect(el.textContent).toContain('2026');
    // Should contain a colon for the time portion
    expect(el.textContent).toContain(':');
  });

  it('renders time format', () => {
    render(
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="time"
        data-testid="ts"
      />,
    );
    const el = screen.getByTestId('ts');
    // Should contain time but not year
    expect(el.textContent).toContain(':');
    expect(el.textContent).not.toContain('2026');
  });

  // --- System formats ---

  it('renders system_date format', () => {
    render(
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="system_date"
        data-testid="ts"
      />,
    );
    const el = screen.getByTestId('ts');
    expect(el.textContent).toMatch(/2026-02-\d{2}/);
  });

  it('renders system_date_time format', () => {
    render(
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="system_date_time"
        data-testid="ts"
      />,
    );
    const el = screen.getByTestId('ts');
    expect(el.textContent).toMatch(/2026-02-\d{2} \d{2}:\d{2}:\d{2}/);
  });

  it('renders system_time format', () => {
    render(
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="system_time"
        data-testid="ts"
      />,
    );
    const el = screen.getByTestId('ts');
    expect(el.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  // --- Auto format ---

  it('auto format uses relative for recent times', () => {
    const oneHourAgo = Date.now() / 1000 - 3600;
    render(<Timestamp value={oneHourAgo} format="auto" />);
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
  });

  it('auto format uses date_time for old times', () => {
    const oldDate = '2026-01-01T12:00:00Z';
    render(<Timestamp value={oldDate} format="auto" data-testid="ts" />);
    const el = screen.getByTestId('ts');
    expect(el.textContent).toContain('2026');
    expect(el.textContent).not.toContain('ago');
  });

  // --- Accessibility ---

  it('sets aria-label with full absolute time in relative mode', () => {
    const oneHourAgo = Date.now() / 1000 - 3600;
    render(
      <Timestamp
        value={oneHourAgo}
        format="relative"
        hasTooltip={false}
        data-testid="ts"
      />,
    );
    const el = screen.getByTestId('ts');
    expect(el.getAttribute('aria-label')).toBeTruthy();
    expect(el.getAttribute('aria-label')).toContain('2026');
  });

  it('does not set aria-label in non-relative mode', () => {
    render(
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="date_time"
        data-testid="ts"
      />,
    );
    const el = screen.getByTestId('ts');
    expect(el.getAttribute('aria-label')).toBeNull();
  });

  // --- Input handling ---

  it('accepts Unix timestamp in seconds', () => {
    render(<Timestamp value={1740000000} format="date" data-testid="ts" />);
    const el = screen.getByTestId('ts');
    expect(el.getAttribute('datetime')).toBeTruthy();
  });

  it('accepts ISO string', () => {
    render(
      <Timestamp
        value="2026-03-25T10:00:00Z"
        format="date_time"
        data-testid="ts"
      />,
    );
    const el = screen.getByTestId('ts');
    expect(el.getAttribute('datetime')).toBe('2026-03-25T10:00:00.000Z');
  });

  // --- Live updates ---

  it('live updates relative time', () => {
    const now = Date.now() / 1000;
    render(<Timestamp value={now - 5} format="relative" isLive />);
    expect(screen.getByText('just now')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByText('35 seconds ago')).toBeInTheDocument();
  });

  // --- Ref ---

  it('forwards ref', () => {
    const ref = {current: null as HTMLTimeElement | null};
    render(
      <Timestamp
        ref={ref}
        value="2026-03-25T10:00:00Z"
        format="date_time"
      />,
    );
    expect(ref.current).toBeInstanceOf(HTMLTimeElement);
  });

  // --- Test ID ---

  it('spreads data-testid', () => {
    render(
      <Timestamp
        value="2026-03-25T10:00:00Z"
        format="date_time"
        data-testid="my-timestamp"
      />,
    );
    expect(screen.getByTestId('my-timestamp')).toBeInTheDocument();
  });

  // --- Future dates ---

  it('handles future dates in relative mode', () => {
    const oneHourFromNow = Date.now() / 1000 + 3600;
    render(<Timestamp value={oneHourFromNow} format="relative" />);
    expect(screen.getByText('in 1 hour')).toBeInTheDocument();
  });

  // --- Long-ago relative ---

  it('renders months ago for dates older than 30 days', () => {
    const threeMonthsAgo = Date.now() / 1000 - 90 * 86400;
    render(<Timestamp value={threeMonthsAgo} format="relative" />);
    expect(screen.getByText('3 months ago')).toBeInTheDocument();
  });

  it('renders years ago for dates older than 365 days', () => {
    const twoYearsAgo = Date.now() / 1000 - 730 * 86400;
    render(<Timestamp value={twoYearsAgo} format="relative" />);
    expect(screen.getByText('2 years ago')).toBeInTheDocument();
  });

  // --- Auto threshold ---

  it('respects custom autoThreshold', () => {
    const twoHoursAgo = Date.now() / 1000 - 7200;
    render(
      <Timestamp value={twoHoursAgo} format="auto" autoThreshold={3600} />,
    );
    const el = screen.getByRole('time');
    expect(el.textContent).not.toContain('ago');
  });
});
