// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {LogStream, type LogEntry} from './LogStream';

const ENTRIES: LogEntry[] = [
  {
    id: 'a',
    timestamp: '14:02:11.482',
    level: 'info',
    source: 'api-gateway',
    message: 'request accepted',
  },
  {
    id: 'b',
    timestamp: '14:02:11.617',
    level: 'warn',
    source: 'billing',
    message: 'retrying upstream call',
  },
  {
    id: 'c',
    timestamp: '14:02:12.044',
    level: 'error',
    source: 'billing',
    message: 'upstream call failed',
    detail: <div>stack: billing.charge failed with 502</div>,
  },
  {
    id: 'd',
    timestamp: '14:02:12.371',
    level: 'debug',
    source: 'api-gateway',
    message: 'connection pool at 40%',
  },
];

/** jsdom has no layout: fake the scroll geometry on the log scroller. */
function setScrollMetrics(
  el: HTMLElement,
  {scrollHeight, clientHeight}: {scrollHeight: number; clientHeight: number},
) {
  Object.defineProperty(el, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(el, 'clientHeight', {
    value: clientHeight,
    configurable: true,
  });
}

describe('LogStream', () => {
  it('renders one row per entry with level and message', () => {
    render(<LogStream entries={ENTRIES} />);
    expect(screen.getByText('request accepted')).toBeInTheDocument();
    expect(screen.getByText('retrying upstream call')).toBeInTheDocument();
    expect(screen.getByText('upstream call failed')).toBeInTheDocument();
    expect(screen.getByText('connection pool at 40%')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('warn')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('debug')).toBeInTheDocument();
    // Level lands on the row element for theming hooks.
    expect(
      screen.getByText('upstream call failed').closest('[data-level]'),
    ).toHaveAttribute('data-level', 'error');
  });

  it('exposes the scroller as an accessible log region', () => {
    render(<LogStream entries={ENTRIES} label="Build output" />);
    expect(screen.getByRole('log', {name: 'Build output'})).toBeInTheDocument();
  });

  it('renders timestamps by default and hides them with hasTimestamps={false}', () => {
    const {rerender} = render(<LogStream entries={ENTRIES} />);
    expect(screen.getByText('14:02:11.482')).toBeInTheDocument();
    rerender(<LogStream entries={ENTRIES} hasTimestamps={false} />);
    expect(screen.queryByText('14:02:11.482')).not.toBeInTheDocument();
  });

  it('expands and collapses detail rows via the row button', async () => {
    const user = userEvent.setup();
    render(<LogStream entries={ENTRIES} />);
    // Only the entry with `detail` renders as a disclosure button.
    const row = screen.getByRole('button', {expanded: false});
    expect(row).toHaveTextContent('upstream call failed');
    expect(
      screen.queryByText('stack: billing.charge failed with 502'),
    ).not.toBeInTheDocument();

    await user.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText('stack: billing.charge failed with 502'),
    ).toBeInTheDocument();

    await user.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByText('stack: billing.charge failed with 502'),
    ).not.toBeInTheDocument();
  });

  it('pins scroll to the bottom on append while following', () => {
    const {rerender} = render(
      <LogStream entries={ENTRIES} isFollowing maxHeight={200} />,
    );
    const scroller = screen.getByRole('log');
    setScrollMetrics(scroller, {scrollHeight: 1000, clientHeight: 200});

    const appended: LogEntry[] = [
      ...ENTRIES,
      {
        id: 'e',
        timestamp: '14:02:13.005',
        level: 'info',
        source: 'api-gateway',
        message: 'request completed',
      },
    ];
    rerender(<LogStream entries={appended} isFollowing maxHeight={200} />);
    expect(scroller.scrollTop).toBe(1000);
  });

  it('unpins when the user scrolls away from the bottom', () => {
    const onFollowChange = vi.fn();
    render(
      <LogStream
        entries={ENTRIES}
        isFollowing
        onFollowChange={onFollowChange}
        maxHeight={200}
      />,
    );
    const scroller = screen.getByRole('log');
    setScrollMetrics(scroller, {scrollHeight: 1000, clientHeight: 200});

    // User drags the scrollbar far above the tail.
    scroller.scrollTop = 100;
    fireEvent.scroll(scroller);
    expect(onFollowChange).toHaveBeenCalledWith(false);
  });

  it('does not unpin on scroll events that stay at the bottom', () => {
    const onFollowChange = vi.fn();
    render(
      <LogStream
        entries={ENTRIES}
        isFollowing
        onFollowChange={onFollowChange}
        maxHeight={200}
      />,
    );
    const scroller = screen.getByRole('log');
    setScrollMetrics(scroller, {scrollHeight: 1000, clientHeight: 200});

    scroller.scrollTop = 800; // exactly at the bottom
    fireEvent.scroll(scroller);
    expect(onFollowChange).not.toHaveBeenCalled();
  });

  it('re-pins via the "Jump to latest" affordance', () => {
    const onFollowChange = vi.fn();
    render(
      <LogStream
        entries={ENTRIES}
        isFollowing={false}
        onFollowChange={onFollowChange}
        maxHeight={200}
      />,
    );
    const scroller = screen.getByRole('log');
    setScrollMetrics(scroller, {scrollHeight: 1000, clientHeight: 200});

    // No affordance while the viewport is (assumed) at the bottom.
    expect(
      screen.queryByRole('button', {name: /jump to latest/i}),
    ).not.toBeInTheDocument();

    scroller.scrollTop = 0;
    fireEvent.scroll(scroller);
    const jump = screen.getByRole('button', {name: /jump to latest/i});
    fireEvent.click(jump);
    expect(onFollowChange).toHaveBeenCalledWith(true);
    expect(scroller.scrollTop).toBe(1000);
  });

  it('supports uncontrolled follow state', () => {
    const {rerender} = render(<LogStream entries={ENTRIES} maxHeight={200} />);
    const scroller = screen.getByRole('log');
    setScrollMetrics(scroller, {scrollHeight: 1000, clientHeight: 200});

    // Unfollowed by default: appends do not move the viewport.
    scroller.scrollTop = 100;
    fireEvent.scroll(scroller);
    rerender(
      <LogStream
        entries={[
          ...ENTRIES,
          {id: 'e', timestamp: '14:02:13.005', level: 'info', message: 'tick'},
        ]}
        maxHeight={200}
      />,
    );
    expect(scroller.scrollTop).toBe(100);

    // Jump to latest pins; the next append follows.
    fireEvent.click(screen.getByRole('button', {name: /jump to latest/i}));
    expect(scroller.scrollTop).toBe(1000);
    rerender(
      <LogStream
        entries={[
          ...ENTRIES,
          {id: 'e', timestamp: '14:02:13.005', level: 'info', message: 'tick'},
          {id: 'f', timestamp: '14:02:14.005', level: 'info', message: 'tock'},
        ]}
        maxHeight={200}
      />,
    );
    expect(scroller.scrollTop).toBe(1000);
  });

  it('renderEntry replaces the default row', () => {
    render(
      <LogStream
        entries={ENTRIES}
        renderEntry={entry => <div>CUSTOM {entry.id}</div>}
      />,
    );
    expect(screen.getByText('CUSTOM a')).toBeInTheDocument();
    expect(screen.getByText('CUSTOM c')).toBeInTheDocument();
    expect(screen.queryByText('request accepted')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
