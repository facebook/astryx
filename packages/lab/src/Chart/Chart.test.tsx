// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Chart.test.tsx
 * @input Uses vitest, @testing-library/react, Chart component
 * @output Unit tests for Chart accessibility (WCAG 1.1.1)
 * @position Testing; validates Chart.tsx accessible name + data-table fallback
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {Chart} from './Chart';

const data = [
  {month: 'Jan', revenue: 100, profit: 20},
  {month: 'Feb', revenue: 200, profit: 40},
  {month: 'Mar', revenue: 150, profit: 30},
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

describe('Chart accessible name', () => {
  it('exposes the svg as a named image with a default label', () => {
    render(
      <Chart data={data} xKey="month" yKeys={['revenue', 'profit']}>
        <g />
      </Chart>,
    );
    reportWidth(600);

    expect(
      screen.getByRole('img', {name: 'Chart of revenue, profit by month'}),
    ).toBeInTheDocument();
  });

  it('uses a custom label when provided', () => {
    render(
      <Chart data={data} xKey="month" yKeys={['revenue']} label="Q1 revenue">
        <g />
      </Chart>,
    );
    reportWidth(600);

    expect(screen.getByRole('img', {name: 'Q1 revenue'})).toBeInTheDocument();
  });
});

describe('Chart data table fallback', () => {
  it('renders a visually hidden table mirroring the data', () => {
    render(
      <Chart data={data} xKey="month" yKeys={['revenue', 'profit']}>
        <g />
      </Chart>,
    );
    reportWidth(600);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Column headers: x key + each y key
    expect(
      screen.getByRole('columnheader', {name: 'month'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'revenue'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'profit'}),
    ).toBeInTheDocument();

    // Row headers and values
    expect(screen.getByRole('rowheader', {name: 'Feb'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: '200'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: '40'})).toBeInTheDocument();

    // Visually hidden, but still in the a11y tree (StyleX clip class attached,
    // not display:none/hidden — jsdom does not apply the stylesheet itself).
    const wrapper = table.parentElement as HTMLElement;
    expect(wrapper.getAttribute('class')).toBeTruthy();
    expect(wrapper).not.toHaveAttribute('hidden');
  });

  it('skips the table when the dataset exceeds the size cutoff', () => {
    const big = Array.from({length: 101}, (_, i) => ({
      month: `m${i}`,
      revenue: i,
    }));
    render(
      <Chart data={big} xKey="month" yKeys={['revenue']}>
        <g />
      </Chart>,
    );
    reportWidth(600);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
