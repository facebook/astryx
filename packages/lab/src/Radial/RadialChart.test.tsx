// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadialChart.test.tsx
 * @input Uses vitest, @testing-library/react, RadialChart component
 * @output Unit tests for RadialChart accessibility (WCAG 1.1.1)
 * @position Testing; validates RadialChart.tsx accessible name + data-table fallback
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {RadialChart} from './RadialChart';

const spiderData = [
  {name: 'modelA', speed: 8, handling: 6, comfort: 7},
  {name: 'modelB', speed: 5, handling: 9, comfort: 6},
];

const pieData = [
  {region: 'NA', revenue: 60},
  {region: 'EU', revenue: 40},
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

describe('RadialChart accessible name', () => {
  it('names the svg from the axes in spider mode', () => {
    render(
      <RadialChart data={spiderData} axes={['speed', 'handling', 'comfort']}>
        <g />
      </RadialChart>,
    );
    reportWidth(500);

    expect(
      screen.getByRole('img', {
        name: 'Radar chart of speed, handling, comfort',
      }),
    ).toBeInTheDocument();
  });

  it('names the svg from the value key in pie mode', () => {
    render(
      <RadialChart data={pieData} valueKey="revenue" labelKey="region">
        <g />
      </RadialChart>,
    );
    reportWidth(500);

    expect(
      screen.getByRole('img', {name: 'Pie chart of revenue'}),
    ).toBeInTheDocument();
  });

  it('uses a custom label when provided', () => {
    render(
      <RadialChart
        data={pieData}
        valueKey="revenue"
        labelKey="region"
        label="Revenue by region">
        <g />
      </RadialChart>,
    );
    reportWidth(500);

    expect(
      screen.getByRole('img', {name: 'Revenue by region'}),
    ).toBeInTheDocument();
  });
});

describe('RadialChart data table fallback', () => {
  it('renders slice labels, values, and percentages in pie mode', () => {
    render(
      <RadialChart data={pieData} valueKey="revenue" labelKey="region">
        <g />
      </RadialChart>,
    );
    reportWidth(500);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    expect(screen.getByRole('rowheader', {name: 'NA'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: '60'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: '60.0%'})).toBeInTheDocument();
    expect(screen.getByRole('rowheader', {name: 'EU'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: '40.0%'})).toBeInTheDocument();

    // Visually hidden, but still in the a11y tree.
    const wrapper = table.parentElement as HTMLElement;
    expect(wrapper.getAttribute('class')).toBeTruthy();
    expect(wrapper).not.toHaveAttribute('hidden');
  });

  it('renders one row per series across the axes in spider mode', () => {
    render(
      <RadialChart data={spiderData} axes={['speed', 'handling', 'comfort']}>
        <g />
      </RadialChart>,
    );
    reportWidth(500);

    expect(
      screen.getByRole('columnheader', {name: 'speed'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('rowheader', {name: 'modelA'})).toBeInTheDocument();
    expect(screen.getByRole('rowheader', {name: 'modelB'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: '8'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: '9'})).toBeInTheDocument();
  });

  it('skips the table when the dataset exceeds the size cutoff', () => {
    const big = Array.from({length: 101}, (_, i) => ({
      region: `r${i}`,
      revenue: i + 1,
    }));
    render(
      <RadialChart data={big} valueKey="revenue" labelKey="region">
        <g />
      </RadialChart>,
    );
    reportWidth(500);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
