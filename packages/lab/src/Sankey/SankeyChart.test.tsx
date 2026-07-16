// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {SankeyChart} from './SankeyChart';
import {SankeyNode} from './SankeyNode';

const nodes = [
  {id: 'a', label: 'A', value: 10},
  {id: 'b', label: 'B', value: 10},
  {id: 'c', label: 'C', value: 10},
];
const links = [
  {source: 'a', target: 'b', value: 5},
  {source: 'b', target: 'c', value: 5},
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

describe('SankeyChart scroll container', () => {
  it('is keyboard-focusable when the chart needs horizontal scrolling', () => {
    render(
      <SankeyChart nodes={nodes} links={links} minColumnWidth={400}>
        <SankeyNode />
      </SankeyChart>,
    );

    // Container narrower than the minimum column width forces scrolling.
    reportWidth(300);

    const scrollRegion = screen.getByRole('group', {name: 'Sankey chart'});
    expect(scrollRegion).toHaveAttribute('tabindex', '0');
  });

  it('does not add a focusable scroll region when everything fits', () => {
    render(
      <SankeyChart nodes={nodes} links={links} minColumnWidth={50}>
        <SankeyNode />
      </SankeyChart>,
    );

    reportWidth(1000);

    expect(
      screen.queryByRole('group', {name: 'Sankey chart'}),
    ).not.toBeInTheDocument();
  });
});
