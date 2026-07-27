// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Stat} from './Stat';

describe('Stat', () => {
  it('renders label and value', () => {
    render(<Stat label="Total requests" value="2.4M" />);
    expect(screen.getByText('Total requests')).toBeInTheDocument();
    expect(screen.getByText('2.4M')).toBeInTheDocument();
  });

  it('renders the stable class and default size data attribute', () => {
    render(<Stat label="Total requests" value="2.4M" data-testid="stat" />);
    const root = screen.getByTestId('stat');
    expect(root.classList.contains('astryx-stat')).toBe(true);
    expect(root.getAttribute('data-size')).toBe('md');
  });

  it('reflects the size prop as a data attribute', () => {
    render(
      <Stat label="Total requests" value="2.4M" size="lg" data-testid="stat" />,
    );
    expect(screen.getByTestId('stat').getAttribute('data-size')).toBe('lg');
  });

  it('renders delta text with screen-reader direction', () => {
    render(
      <Stat
        label="Total requests"
        value="2.4M"
        delta={{value: '+12.4%', direction: 'up'}}
      />,
    );
    expect(screen.getByText('+12.4%')).toBeInTheDocument();
    expect(screen.getByText('(trending up)')).toBeInTheDocument();
  });

  it('maps direction to default sentiment', () => {
    render(
      <Stat
        label="P95 latency"
        value="284 ms"
        delta={{value: '+18 ms', direction: 'up'}}
      />,
    );
    const delta = screen.getByText('+18 ms');
    expect(delta.getAttribute('data-sentiment')).toBe('positive');
  });

  it('maps down direction to negative sentiment by default', () => {
    render(
      <Stat
        label="Signups"
        value="1,204"
        delta={{value: '-4.1%', direction: 'down'}}
      />,
    );
    expect(screen.getByText('-4.1%').getAttribute('data-sentiment')).toBe(
      'negative',
    );
  });

  it('maps flat direction to neutral sentiment by default', () => {
    render(
      <Stat
        label="Active users"
        value="18,204"
        delta={{value: '0.0%', direction: 'flat'}}
      />,
    );
    expect(screen.getByText('0.0%').getAttribute('data-sentiment')).toBe(
      'neutral',
    );
    expect(screen.getByText('(flat)')).toBeInTheDocument();
  });

  it('lets sentiment override the direction mapping for inverted metrics', () => {
    render(
      <Stat
        label="Error rate"
        value="0.42%"
        delta={{value: '-0.08%', direction: 'down', sentiment: 'positive'}}
      />,
    );
    const delta = screen.getByText('-0.08%');
    expect(delta.getAttribute('data-sentiment')).toBe('positive');
    expect(screen.getByText('(trending down)')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(
      <Stat
        label="Total requests"
        value="2.4M"
        description="vs. previous 30 days"
      />,
    );
    expect(screen.getByText('vs. previous 30 days')).toBeInTheDocument();
  });

  it('renders media content when provided', () => {
    render(
      <Stat
        label="Total requests"
        value="2.4M"
        media={<svg data-testid="sparkline" />}
      />,
    );
    expect(screen.getByTestId('sparkline')).toBeInTheDocument();
  });

  it('does not render a delta glyph without a delta', () => {
    const {container} = render(<Stat label="Total requests" value="2.4M" />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<Stat ref={ref} label="Total requests" value="2.4M" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('supports data-testid', () => {
    render(<Stat label="Total requests" value="2.4M" data-testid="stat" />);
    expect(screen.getByTestId('stat')).toBeInTheDocument();
  });

  it('accepts a ReactNode value', () => {
    render(
      <Stat
        label="Uptime"
        value={
          <span>
            99.98<small>%</small>
          </span>
        }
      />,
    );
    expect(screen.getByText('99.98')).toBeInTheDocument();
  });
});
