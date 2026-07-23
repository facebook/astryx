// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('does not round a tier up past its own boundary', () => {
    // Just under each threshold the count must stay within the tier, e.g.
    // 59.98 minutes is "59 minutes ago", never "60 minutes ago".
    const {rerender} = render(
      <Timestamp value={Date.now() / 1000 - 3599} format="relative" />,
    );
    expect(screen.getByText('59 minutes ago')).toBeInTheDocument();

    rerender(<Timestamp value={Date.now() / 1000 - 86399} format="relative" />);
    expect(screen.getByText('23 hours ago')).toBeInTheDocument();

    rerender(
      <Timestamp value={Date.now() / 1000 - 2591999} format="relative" />,
    );
    expect(screen.getByText('29 days ago')).toBeInTheDocument();

    // Same guarantee on the future side.
    rerender(<Timestamp value={Date.now() / 1000 + 3599} format="relative" />);
    expect(screen.getByText('in 59 minutes')).toBeInTheDocument();
  });

  it('renders "now" for very recent times', () => {
    const fiveSecondsAgo = Date.now() / 1000 - 5;
    render(<Timestamp value={fiveSecondsAgo} format="relative" />);
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  it('renders "now" for the current instant (not a future phrase)', () => {
    // A value equal to "right now". Because the internal `now` baseline is
    // captured at render time, it can lag the value by a fraction of a second,
    // producing a tiny negative delta that must not be treated as the future.
    render(<Timestamp value={Date.now() / 1000} format="relative" />);
    expect(screen.queryByText(/^in /)).not.toBeInTheDocument();
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  it('renders "now" for a value a hair in the future (clock skew)', () => {
    // Real-world clock / captured-now skew can make a current-ish value land a
    // fraction of a second in the future relative to the component's internal
    // `now`. This must read as the present ("now"), never "in a few
    // seconds". Regression test for the right-now -> future-phrase bug.
    const aHairInTheFuture = Date.now() / 1000 + 0.6;
    render(<Timestamp value={aHairInTheFuture} format="relative" />);
    expect(screen.queryByText(/^in /)).not.toBeInTheDocument();
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  it('renders "yesterday" for times ~1 day ago', () => {
    const yesterday = Date.now() / 1000 - 100000;
    render(<Timestamp value={yesterday} format="relative" />);
    expect(screen.getByText('yesterday')).toBeInTheDocument();
  });

  // --- Standard display formats ---

  it('renders date format', () => {
    render(
      <Timestamp value="2026-02-19T17:00:00Z" format="date" data-testid="ts" />,
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
      <Timestamp value="2026-02-19T17:00:00Z" format="time" data-testid="ts" />,
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
    expect(screen.getByText('now')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByText('35 seconds ago')).toBeInTheDocument();
  });

  // --- Ref ---

  it('forwards ref', () => {
    const ref = {current: null as HTMLTimeElement | null};
    render(
      <Timestamp ref={ref} value="2026-03-25T10:00:00Z" format="date_time" />,
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

  it('renders "now" for a value a few seconds in the future (clock skew)', () => {
    // Beyond the sub-second render lag but still within the skew tolerance: a
    // value ~20s ahead of our clock is almost always skew (the value's clock
    // running fast), not a genuine future event, so it should read as the
    // present rather than "in a few seconds".
    const twentySecondsFromNow = Date.now() / 1000 + 20;
    render(<Timestamp value={twentySecondsFromNow} format="relative" />);
    expect(screen.queryByText(/^in /)).not.toBeInTheDocument();
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  it('renders a genuine near-future time beyond the skew tolerance', () => {
    // Past the skew window — this is a real upcoming time, not clock drift.
    const fortyFiveSecondsFromNow = Date.now() / 1000 + 45;
    render(<Timestamp value={fortyFiveSecondsFromNow} format="relative" />);
    expect(screen.getByText('in a few seconds')).toBeInTheDocument();
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

  // --- Invalid values ---

  it('renders nothing instead of crashing on an unparseable string value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const {container} = render(
        <Timestamp value="not-a-date" data-testid="ts" />,
      );
      expect(container).toBeEmptyDOMElement();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('could not parse value'),
      );
    } finally {
      warn.mockRestore();
    }
  });

  it('renders nothing instead of crashing on a NaN value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const {container} = render(<Timestamp value={NaN} data-testid="ts" />);
      expect(container).toBeEmptyDOMElement();
    } finally {
      warn.mockRestore();
    }
  });

  // --- Tooltip keyboard reachability (WCAG 1.4.13 / 2.1.1) ---

  describe('tooltip keyboard reachability', () => {
    const originalMatches = HTMLElement.prototype.matches;
    const originalShowPopover = HTMLElement.prototype.showPopover;
    const originalHidePopover = HTMLElement.prototype.hidePopover;

    beforeEach(() => {
      // The tooltip is lazy-loaded via a dynamic import; real timers let the
      // import promise and RTL's waitFor resolve naturally (the outer
      // beforeEach installs fake timers, which would stall them).
      vi.useRealTimers();

      // Mock the Popover API, which jsdom does not implement.
      HTMLElement.prototype.showPopover = vi.fn();
      HTMLElement.prototype.hidePopover = vi.fn();

      // jsdom does not derive :focus-visible from keyboard focus for a <time>
      // element; treat the focused element as focus-visible so the tooltip's
      // keyboard-focus path can be exercised.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HTMLElement.prototype as any).matches = function (
        selector: string,
      ): boolean {
        if (selector === ':focus-visible') {
          return this === document.activeElement;
        }
        return originalMatches.call(this, selector);
      };
    });

    afterEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HTMLElement.prototype as any).matches = originalMatches;
      HTMLElement.prototype.showPopover = originalShowPopover;
      HTMLElement.prototype.hidePopover = originalHidePopover;
    });

    it('makes the <time> element focusable while the tooltip is attached', () => {
      render(
        <Timestamp
          value={Date.now() / 1000 - 3600}
          format="relative"
          data-testid="ts"
        />,
      );
      expect(screen.getByTestId('ts')).toHaveAttribute('tabindex', '0');
    });

    it('shows the tooltip when the timestamp receives keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <Timestamp
          value={Date.now() / 1000 - 3600}
          format="relative"
          data-testid="ts"
        />,
      );
      const el = screen.getByTestId('ts');

      // Wait for the lazy-loaded tooltip layer to mount and confirm it
      // carries the full absolute time (same string as the aria-label).
      // Compare with normalized whitespace: Intl output can contain narrow
      // no-break spaces that jest-dom's matcher normalization would break on.
      const layer = await screen.findByRole('tooltip', {hidden: true});
      const normalize = (s: string) => s.replace(/\s+/g, ' ');
      expect(normalize(layer.textContent ?? '')).toContain(
        normalize(el.getAttribute('aria-label') ?? '\0'),
      );

      // Tab onto the timestamp — the only tab stop in the document.
      await user.tab();
      expect(el).toHaveFocus();
      await waitFor(() => {
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      });
    });

    it('does not add a tab stop when the tooltip is disabled', () => {
      render(
        <Timestamp
          value={Date.now() / 1000 - 3600}
          format="relative"
          hasTooltip={false}
          data-testid="ts"
        />,
      );
      expect(screen.getByTestId('ts')).not.toHaveAttribute('tabindex');
    });

    it('does not add a tab stop for absolute formats (no tooltip)', () => {
      render(
        <Timestamp
          value="2026-02-19T17:00:00Z"
          format="date_time"
          data-testid="ts"
        />,
      );
      expect(screen.getByTestId('ts')).not.toHaveAttribute('tabindex');
    });

    it('keeps the full absolute aria-label while the tooltip is attached', () => {
      render(
        <Timestamp
          value={Date.now() / 1000 - 3600}
          format="relative"
          data-testid="ts"
        />,
      );
      const label = screen.getByTestId('ts').getAttribute('aria-label');
      expect(label).toBeTruthy();
      // The label is the full absolute string, not the relative text.
      expect(label).not.toContain('ago');
    });
  });

  // --- Multi-zone / multi-format tooltip entries ---

  describe('tooltipEntries', () => {
    // A fixed instant that lands on a different calendar day in Tokyo, so a
    // zone-blind implementation is visible in the output.
    const VALUE = '2026-02-19T17:00:00Z';

    const originalShowPopover = HTMLElement.prototype.showPopover;
    const originalHidePopover = HTMLElement.prototype.hidePopover;

    beforeEach(() => {
      // The tooltip is lazy-loaded; real timers let the dynamic import and
      // RTL's findBy* resolve (the outer beforeEach installs fake timers).
      vi.useRealTimers();
      HTMLElement.prototype.showPopover = vi.fn();
      HTMLElement.prototype.hidePopover = vi.fn();
    });

    afterEach(() => {
      HTMLElement.prototype.showPopover = originalShowPopover;
      HTMLElement.prototype.hidePopover = originalHidePopover;
    });

    it('leaves the default tooltip as a single unwrapped line', async () => {
      render(
        <Timestamp
          value={Date.now() / 1000 - 3600}
          format="relative"
          data-testid="ts"
        />,
      );
      const layer = await screen.findByRole('tooltip', {hidden: true});
      // No entries configured — the tooltip content stays the bare string it
      // has always been, with no list wrapper introduced around it.
      expect(layer.querySelector('dl')).toBeNull();

      const normalize = (s: string) => s.replace(/\s+/g, ' ');
      expect(normalize(layer.textContent ?? '')).toContain(
        normalize(screen.getByTestId('ts').getAttribute('aria-label') ?? '\0'),
      );
    });

    it('renders one tooltip line per configured entry', async () => {
      render(
        <Timestamp
          value={VALUE}
          format="relative"
          tooltipEntries={[
            {label: 'Local'},
            {timezoneID: 'UTC', label: 'UTC'},
            {timezoneID: 'Asia/Tokyo', label: 'Tokyo'},
          ]}
        />,
      );
      const layer = await screen.findByRole('tooltip', {hidden: true});
      expect(layer.querySelectorAll('dd')).toHaveLength(3);
      expect(layer.textContent).toContain('Local');
      expect(layer.textContent).toContain('UTC');
      expect(layer.textContent).toContain('Tokyo');
    });

    it('renders each entry in the time zone it names', async () => {
      render(
        <Timestamp
          value={VALUE}
          format="relative"
          tooltipEntries={[
            {timezoneID: 'UTC', format: 'system_date_time', label: 'UTC'},
            {
              timezoneID: 'Asia/Tokyo',
              format: 'system_date_time',
              label: 'Tokyo',
            },
          ]}
        />,
      );
      const layer = await screen.findByRole('tooltip', {hidden: true});
      const values = Array.from(layer.querySelectorAll('dd')).map(
        el => el.textContent,
      );
      // Machine formats are locale- and host-timezone-independent, so these
      // hold on any developer machine and on CI.
      expect(values).toEqual(['2026-02-19 17:00:00', '2026-02-20 02:00:00']);
    });

    it('shows a tooltip for absolute formats once entries are configured', async () => {
      render(
        <Timestamp
          value={VALUE}
          format="date_time"
          tooltipEntries={[{timezoneID: 'UTC', label: 'UTC'}]}
          data-testid="ts"
        />,
      );
      // Without entries an absolute format has no tooltip at all; configuring
      // entries must not be silently ignored.
      const layer = await screen.findByRole('tooltip', {hidden: true});
      expect(layer.textContent).toContain('UTC');
      // ...and the anchor becomes keyboard-reachable, as it is for relative.
      expect(screen.getByTestId('ts')).toHaveAttribute('tabindex', '0');
    });

    it('treats an empty entry list exactly like no configuration', () => {
      render(
        <Timestamp
          value={VALUE}
          format="date_time"
          tooltipEntries={[]}
          data-testid="ts"
        />,
      );
      // `hasTooltip` stays the only on/off switch — an empty array is not a
      // second way to spell "off", and it must not widen the gate either.
      expect(screen.getByTestId('ts')).not.toHaveAttribute('tabindex');
    });

    it('still honors hasTooltip={false} when entries are configured', () => {
      render(
        <Timestamp
          value={VALUE}
          format="date_time"
          hasTooltip={false}
          tooltipEntries={[{timezoneID: 'UTC'}]}
          data-testid="ts"
        />,
      );
      expect(screen.getByTestId('ts')).not.toHaveAttribute('tabindex');
    });

    it('leaves the accessible name unchanged when entries are configured', async () => {
      const value = Date.now() / 1000 - 3600;
      const {unmount} = render(
        <Timestamp value={value} format="relative" data-testid="a" />,
      );
      const before = screen.getByTestId('a').getAttribute('aria-label');
      unmount();

      render(
        <Timestamp
          value={value}
          format="relative"
          tooltipEntries={[{timezoneID: 'UTC', label: 'UTC'}]}
          data-testid="b"
        />,
      );
      // The accessible name stays the canonical absolute time in the viewer's
      // own zone; the extra zones reach assistive tech through the tooltip's
      // aria-describedby, not by being stuffed into the name.
      expect(screen.getByTestId('b').getAttribute('aria-label')).toBe(before);
    });

    it('does not add an accessible name to absolute formats with entries', () => {
      render(
        <Timestamp
          value={VALUE}
          format="date_time"
          tooltipEntries={[{timezoneID: 'UTC'}]}
          data-testid="ts"
        />,
      );
      expect(screen.getByTestId('ts').getAttribute('aria-label')).toBeNull();
    });

    it('does not crash on an unknown time zone', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(
          <Timestamp
            value={VALUE}
            format="relative"
            tooltipEntries={[
              {timezoneID: 'Not/AZone', format: 'system_date_time'},
              {timezoneID: 'UTC', format: 'system_date_time'},
            ]}
          />,
        );
        const layer = await screen.findByRole('tooltip', {hidden: true});
        const values = Array.from(layer.querySelectorAll('dd')).map(
          el => el.textContent,
        );
        expect(values).toHaveLength(2);
        expect(values[1]).toBe('2026-02-19 17:00:00');
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Not/AZone'));
      } finally {
        warn.mockRestore();
      }
    });
  });
});
