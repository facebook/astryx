// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Chart.test.tsx
 * @input Uses vitest, @testing-library/react, Chart, bar/line marks
 * @output Functional tests for the chart root — measurement gate, SVG
 *         accessibility wiring, per-series render delegation, event layer,
 *         legend derivation, and auto palette assignment
 * @position Colocated test for Chart.tsx (issue #4295 viz coverage)
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, act, within} from '@testing-library/react';
import {Chart} from './Chart';
import {bar} from './marks/bar';
import {line} from './marks/line';

const DATA = [
  {month: 'Jan', sales: 4, profit: 1},
  {month: 'Feb', sales: 7, profit: 3},
  {month: 'Mar', sales: 2, profit: 2},
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

describe('Chart', () => {
  it('renders only an empty height-reserving placeholder until the container reports a width', () => {
    const {container} = render(
      <Chart data={DATA} xKey="month" series={[bar('sales')]} height={300} />,
    );
    expect(container.querySelector('svg')).toBeNull();
    const placeholder = container.firstElementChild as HTMLElement;
    expect(placeholder.tagName).toBe('DIV');
    expect(placeholder.style.height).toBe('300px');
    expect(placeholder.childElementCount).toBe(0);
  });

  it('labels and describes the svg from title and subtitle', () => {
    const {container} = render(
      <Chart
        data={DATA}
        xKey="month"
        series={[bar('sales')]}
        title="Monthly sales"
        subtitle="Units sold per month"
      />,
    );
    reportWidth(600);

    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-label', 'Monthly sales');
    expect(svg.querySelector('title')!.textContent).toBe('Monthly sales');
    const desc = svg.querySelector('desc')!;
    expect(desc.textContent).toBe('Units sold per month');
    expect(svg.getAttribute('aria-describedby')).toBe(desc.id);
  });

  it('renders one clipped group per series', () => {
    const {container} = render(
      <Chart
        data={DATA}
        xKey="month"
        series={[bar('sales'), line('profit')]}
      />,
    );
    reportWidth(600);

    const plot = container.querySelector('g[clip-path]')!;
    expect(plot).not.toBeNull();
    const seriesGroups = Array.from(plot.children).filter(
      el => el.tagName === 'g',
    );
    expect(seriesGroups).toHaveLength(2);
    // The bar group contains rendered paths, the line group its stroke path.
    expect(seriesGroups[0].querySelectorAll('path').length).toBeGreaterThan(0);
    expect(seriesGroups[1].querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('sizes the transparent event-capture rect to the plot area inside the default margins', () => {
    const {container} = render(
      <Chart data={DATA} xKey="month" series={[bar('sales')]} height={300} />,
    );
    reportWidth(600);

    // 600 - 48 (left) - 24 (right) = 528; 300 - 24 (top) - 32 (bottom) = 244.
    const eventRect = container.querySelector('rect[fill="transparent"]')!;
    expect(eventRect).not.toBeNull();
    expect(eventRect).toHaveAttribute('width', '528');
    expect(eventRect).toHaveAttribute('height', '244');
  });

  it('derives legend items from series labels when legend is enabled', () => {
    render(
      <Chart
        data={DATA}
        xKey="month"
        series={[bar('sales', {label: 'Sales'}), line('profit')]}
        legend
      />,
    );
    reportWidth(600);

    const list = screen.getByRole('list', {name: 'Chart legend'});
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('Sales')).toBeInTheDocument();
    // Label falls back to the dataKey when not provided.
    expect(within(rows[1]).getByText('profit')).toBeInTheDocument();
  });

  it('assigns distinct palette colors to series that do not declare one', () => {
    const {container} = render(
      <Chart
        data={DATA}
        xKey="month"
        series={[line('sales'), line('profit')]}
      />,
    );
    reportWidth(600);

    const strokes = Array.from(
      container.querySelectorAll('g[clip-path] path[stroke]'),
    ).map(p => p.getAttribute('stroke'));
    expect(strokes).toHaveLength(2);
    expect(strokes[0]).toBeTruthy();
    expect(strokes[1]).toBeTruthy();
    expect(strokes[0]).not.toBe(strokes[1]);
  });

  it('mounts the grouped tooltip portal when tooltip is enabled', () => {
    render(<Chart data={DATA} xKey="month" series={[bar('sales')]} tooltip />);
    reportWidth(600);

    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  });
});
