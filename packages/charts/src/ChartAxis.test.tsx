// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartAxis.test.tsx
 * @input Uses vitest, @testing-library/react, Chart, ChartAxis, bar mark
 * @output Functional tests for axis rendering — group semantics, band/linear
 *         tick labels, default edge-line rules, custom formatting, truncation,
 *         and label capping
 * @position Colocated test for ChartAxis.tsx (issue #4295 viz coverage)
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, act, within} from '@testing-library/react';
import {Chart} from './Chart';
import {ChartAxis} from './ChartAxis';
import {bar} from './marks/bar';

const DATA = [
  {month: 'Jan', sales: 4},
  {month: 'Feb', sales: 10},
  {month: 'Mar', sales: 2},
];

// Capture the ResizeObserver callback so tests can drive the reported width.
let resizeCallback: ResizeObserverCallback | undefined;

beforeEach(() => {
  resizeCallback = undefined;
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(cb: ResizeObserverCallback) {
        resizeCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function reportWidth(width: number) {
  act(() => {
    resizeCallback?.(
      [{contentRect: {width}} as unknown as ResizeObserverEntry],
      {} as ResizeObserver,
    );
  });
}

function renderChart(axes: React.ReactNode, data = DATA) {
  const utils = render(
    <Chart data={data} xKey="month" series={[bar('sales')]} axes={axes} />,
  );
  reportWidth(600);
  return utils;
}

describe('ChartAxis bottom (band scale)', () => {
  it('renders a labeled group with one tick label per category', () => {
    renderChart(<ChartAxis position="bottom" />);
    const axis = screen.getByRole('group', {name: 'bottom axis'});
    expect(within(axis).getByText('Jan')).toBeInTheDocument();
    expect(within(axis).getByText('Feb')).toBeInTheDocument();
    expect(within(axis).getByText('Mar')).toBeInTheDocument();
  });

  it('is translated to the bottom edge of the plot and draws its edge line by default', () => {
    renderChart(<ChartAxis position="bottom" />);
    const axis = screen.getByRole('group', {name: 'bottom axis'});
    // Inner height for the default 300px chart: 300 - 24 - 32 = 244.
    expect(axis).toHaveAttribute('transform', 'translate(0,244)');
    const edge = axis.querySelector('line')!;
    expect(edge).not.toBeNull();
    expect(edge).toHaveAttribute('x2', '528');
  });

  it('caps labels to maxTicks by evenly skipping categories', () => {
    renderChart(<ChartAxis position="bottom" maxTicks={2} />);
    const axis = screen.getByRole('group', {name: 'bottom axis'});
    // 3 categories capped at 2 → step 2 → indices 0 and 2 survive.
    expect(within(axis).getByText('Jan')).toBeInTheDocument();
    expect(within(axis).getByText('Mar')).toBeInTheDocument();
    expect(within(axis).queryByText('Feb')).not.toBeInTheDocument();
  });

  it('truncates long category labels with an ellipsis', () => {
    renderChart(<ChartAxis position="bottom" truncate={4} />, [
      {month: 'January', sales: 4},
      {month: 'Feb', sales: 10},
    ]);
    const axis = screen.getByRole('group', {name: 'bottom axis'});
    expect(within(axis).getByText('Janu…')).toBeInTheDocument();
    // Short labels are left alone.
    expect(within(axis).getByText('Feb')).toBeInTheDocument();
  });
});

describe('ChartAxis left (linear scale)', () => {
  it('renders d3-formatted value ticks without an edge line by default', () => {
    renderChart(<ChartAxis position="left" />);
    const axis = screen.getByRole('group', {name: 'left axis'});
    // Bar series pins a zero baseline → domain [0, 10] → ticks 0,2,...,10.
    expect(within(axis).getByText('0')).toBeInTheDocument();
    expect(within(axis).getByText('4')).toBeInTheDocument();
    expect(within(axis).getByText('10')).toBeInTheDocument();
    // Documented default: only the bottom axis draws its edge line.
    expect(axis.querySelector('line')).toBeNull();
  });

  it('applies a custom tick formatter', () => {
    renderChart(
      <ChartAxis position="left" tickFormat={v => `$${String(v)}`} />,
    );
    const axis = screen.getByRole('group', {name: 'left axis'});
    expect(within(axis).getByText('$0')).toBeInTheDocument();
    expect(within(axis).getByText('$10')).toBeInTheDocument();
  });

  it('showTicks draws a perpendicular mark per tick and forces the axis line on', () => {
    renderChart(<ChartAxis position="left" showTicks />);
    const axis = screen.getByRole('group', {name: 'left axis'});
    const lines = axis.querySelectorAll('line');
    // 6 ticks (0..10 by 2) + the forced edge line.
    expect(lines).toHaveLength(7);
  });
});
