// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadialChart.test.tsx
 * @input RadialChart + useRadial under a stubbed ResizeObserver
 * @output Render-smoke coverage: the containerWidth > 0 gate in both modes,
 *   svg sizing, and the useRadial outside-provider guard
 * @position Colocated test for RadialChart.tsx
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, act} from '@testing-library/react';
import {RadialChart} from './RadialChart';
import {useRadial} from './RadialContext';

const pieData = [
  {region: 'NA', revenue: 500},
  {region: 'EU', revenue: 300},
  {region: 'APAC', revenue: 200},
];

const spiderData = [
  {model: 'A', speed: 10, handling: 5, comfort: 8},
  {model: 'B', speed: 5, handling: 10, comfort: 4},
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

describe('RadialChart', () => {
  it('renders no svg in pie mode until the container reports a width', () => {
    const {container} = render(
      <RadialChart data={pieData} valueKey="revenue" labelKey="region">
        <g data-testid="child" />
      </RadialChart>,
    );

    expect(container.querySelector('svg')).toBeNull();

    reportWidth(600);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('width', '600');
    // Default height is 400.
    expect(svg).toHaveAttribute('height', '400');
  });

  it('renders no svg in spider mode until the container reports a width', () => {
    const {container} = render(
      <RadialChart
        data={spiderData}
        axes={['speed', 'handling', 'comfort']}
        height={300}>
        <g data-testid="child" />
      </RadialChart>,
    );

    expect(container.querySelector('svg')).toBeNull();

    reportWidth(500);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('width', '500');
    expect(svg).toHaveAttribute('height', '300');
  });
});

describe('useRadial', () => {
  it('throws when used outside <RadialChart>', () => {
    function Probe() {
      useRadial();
      return null;
    }

    expect(() => render(<Probe />)).toThrow(
      'Radial components must be used inside <RadialChart>',
    );
  });
});
