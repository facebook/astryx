// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThreeDChart.test.tsx
 * @input ThreeDChart + use3D under a stubbed ResizeObserver
 * @output Render-smoke coverage: the containerWidth > 0 gate, svg sizing,
 *   and the use3D outside-provider guard. autoRotate stays at its default
 *   (0) so no rAF loop starts.
 * @position Colocated test for ThreeDChart.tsx
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, act} from '@testing-library/react';
import {ThreeDChart} from './ThreeDChart';
import {use3D} from './ThreeDContext';

const data = [
  {x: 0, y: 0, z: 0},
  {x: 2, y: 2, z: 2},
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

describe('ThreeDChart', () => {
  it('renders no svg until the container reports a width', () => {
    const {container} = render(
      <ThreeDChart data={data} xKey="x" yKey="y" zKey="z">
        <g data-testid="child" />
      </ThreeDChart>,
    );

    expect(container.querySelector('svg')).toBeNull();

    reportWidth(600);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('width', '600');
    // Default height is 400.
    expect(svg).toHaveAttribute('height', '400');
  });

  it('sizes the svg from the height prop', () => {
    const {container} = render(
      <ThreeDChart data={data} xKey="x" yKey="y" zKey="z" height={250}>
        <g data-testid="child" />
      </ThreeDChart>,
    );

    reportWidth(500);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '500');
    expect(svg).toHaveAttribute('height', '250');
  });
});

describe('use3D', () => {
  it('throws when used outside <ThreeDChart>', () => {
    function Probe() {
      use3D();
      return null;
    }

    expect(() => render(<Probe />)).toThrow(
      '3D components must be used inside <ThreeDChart>',
    );
  });
});
