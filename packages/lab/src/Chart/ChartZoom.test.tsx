// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartZoom.test.tsx
 * @input Renders ChartZoom inside Chart with a stubbed ResizeObserver
 * @output Render-smoke coverage for zoom: capture surface, portaled toolbar, toolbar opt-out.
 *   Wheel/pinch gestures need createSVGPoint/getScreenCTM, which do not exist in
 *   jsdom, so they are intentionally out of scope here. (#4295)
 * @position Colocated test for ChartZoom.tsx
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {Chart} from './Chart';
import {ChartZoom} from './ChartZoom';

const data = [
  {x: 0, y: 1},
  {x: 1, y: 2},
  {x: 2, y: 3},
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

describe('ChartZoom', () => {
  it('renders a full-plot wheel and drag capture surface', () => {
    const {container} = render(
      <Chart data={data} xKey="x" yKeys={['y']} interactive>
        <ChartZoom />
      </Chart>,
    );

    reportWidth(464);

    const surface = container.querySelector('svg > g rect');
    expect(surface).not.toBeNull();
    expect(surface).toHaveAttribute('width', '400');
    expect(surface).toHaveAttribute('height', '252');
    expect(surface).toHaveAttribute('fill', 'transparent');
  });

  it('portals the zoom toolbar into the chart container once the svg is measured', () => {
    render(
      <Chart data={data} xKey="x" yKeys={['y']} interactive>
        <ChartZoom />
      </Chart>,
    );

    // The toolbar portal target is the svg's parent, which only resolves on a
    // render after the svg has been committed — report a second measurement.
    reportWidth(464);
    reportWidth(465);

    expect(screen.getByRole('button', {name: 'Zoom in'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Zoom out'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Reset zoom'}),
    ).toBeInTheDocument();
  });

  it('renders no toolbar when toolbar is false', () => {
    render(
      <Chart data={data} xKey="x" yKeys={['y']} interactive>
        <ChartZoom toolbar={false} />
      </Chart>,
    );

    reportWidth(464);
    reportWidth(465);

    expect(screen.queryByRole('button')).toBeNull();
  });
});
