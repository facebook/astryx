// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Chart.test.tsx
 * @input Renders Chart with a stubbed ResizeObserver; probes useChart outside a provider
 * @output Render-smoke coverage for the chart root: width gate, margin group, context guard (#4295)
 * @position Colocated test for Chart.tsx and ChartContext.ts
 */

import {Component, type ReactNode} from 'react';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {Chart} from './Chart';
import {useChart} from './ChartContext';

const data = [
  {month: 'Jan', revenue: 10},
  {month: 'Feb', revenue: 20},
  {month: 'Mar', revenue: 30},
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

/** Renders nothing; exists only to call useChart during render. */
function Probe() {
  useChart();
  return null;
}

class Boundary extends Component<
  {children: ReactNode},
  {message: string | null}
> {
  state: {message: string | null} = {message: null};
  static getDerivedStateFromError(error: Error) {
    return {message: error.message};
  }
  render() {
    return this.state.message !== null ? (
      <div data-testid="caught">{this.state.message}</div>
    ) : (
      this.props.children
    );
  }
}

describe('Chart', () => {
  it('renders no svg until the container reports a width', () => {
    const {container} = render(
      <Chart data={data} xKey="month" yKeys={['revenue']}>
        <circle data-testid="mark" />
      </Chart>,
    );

    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryByTestId('mark')).toBeNull();
  });

  it('renders the svg at the reported width once the container measures', () => {
    const {container} = render(
      <Chart data={data} xKey="month" yKeys={['revenue']}>
        <circle data-testid="mark" />
      </Chart>,
    );

    reportWidth(464);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('width', '464');
    // Default height
    expect(svg).toHaveAttribute('height', '300');
  });

  it('renders children inside the margin-translated group', () => {
    render(
      <Chart data={data} xKey="month" yKeys={['revenue']}>
        <circle data-testid="mark" />
      </Chart>,
    );

    reportWidth(464);

    // Default margins: left 48, top 16 (d3 margin convention)
    const mark = screen.getByTestId('mark');
    expect(mark.closest('g')).toHaveAttribute('transform', 'translate(48,16)');
  });

  it('throws a clear error when useChart is used outside <Chart>', () => {
    // React logs the caught render error; keep test output quiet.
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <Boundary>
          <Probe />
        </Boundary>,
      );
      expect(screen.getByTestId('caught')).toHaveTextContent(
        'Chart components must be used inside <Chart>',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
