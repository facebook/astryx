// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useAlertActionLayout.test.tsx
 * @input resolveAlertActionLayout, and a component using useAlertActionLayout
 *   over two actions laid out with stubbed widths, with the shared resize
 *   observer replaced by one the test fires
 * @output UIKit's action layout rule: two actions share a row when each label
 *   fits its own half (per label, never the sum), three or more stack, one
 *   fills the row; the hook stacks until it can measure, re-decides when the
 *   row or a label changes size, and keeps the wide row off compact viewports
 * @position jsdom tests of packages/core/src/AlertDialog/useAlertActionLayout.ts
 */

import {act, render} from '@testing-library/react';
import {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  resolveAlertActionLayout,
  useAlertActionLayout,
  type AlertActionLayout,
} from './useAlertActionLayout';

const {observers} = vi.hoisted(() => ({
  observers: new Map<Element, Set<() => void>>(),
}));

vi.mock('../utils/sharedResizeObserver', () => ({
  observeResize: (element: Element, callback: () => void) => {
    const set = observers.get(element) ?? new Set();
    set.add(callback);
    observers.set(element, set);
    return () => set.delete(callback);
  },
}));

/** Fires the resize callbacks registered for `element`. */
function resized(element: Element): void {
  act(() => {
    for (const callback of observers.get(element) ?? []) {
      callback();
    }
  });
}

// UIKit's measured row: 288 wide with an 8 gap, so each action gets 140.
const ROW = 288;
const GAP = 8;
const PADDING = 12;

let latest: AlertActionLayout | null = null;
let rowWidth = ROW;
const labelWidths = new Map<string, number>();

function Actions({
  labels,
  isCompact = true,
}: {
  labels: [string, string];
  isCompact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  latest = useAlertActionLayout(ref, {
    isCompact,
    itemSelector: '[data-action]',
    labels,
  });
  return (
    <div>
      <div ref={ref} data-testid="row" style={{columnGap: `${GAP}px`}}>
        {labels.map(label => (
          <button
            key={label}
            type="button"
            data-action
            style={{paddingLeft: `${PADDING}px`, paddingRight: `${PADDING}px`}}>
            <span>
              <span data-testid={`label-${label}`}>{label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

beforeEach(() => {
  observers.clear();
  latest = null;
  rowWidth = ROW;
  labelWidths.clear();
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.dataset.testid === 'row' ? rowWidth : 0;
    },
  );
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(
    function (this: HTMLElement) {
      const id = this.dataset.testid ?? '';
      return id.startsWith('label-')
        ? (labelWidths.get(id.slice('label-'.length)) ?? 0)
        : 0;
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('resolveAlertActionLayout', () => {
  const measure = (widths: number[]) =>
    resolveAlertActionLayout({available: ROW, gap: GAP, widths});

  it('puts two actions in a row when each fits its own half', () => {
    expect(measure([140, 140])).toBe('row');
    expect(measure([114 + 2 * PADDING, 111 + 2 * PADDING])).toBe('row');
  });

  it('stacks them when one does not, whatever the sum', () => {
    expect(measure([141, 40])).toBe('stack');
    // 137.6 + 53.7 sum to less than the row, and UIKit still stacks them.
    expect(measure([137.6 + 2 * PADDING, 53.7 + 2 * PADDING])).toBe('stack');
  });

  it('always stacks three actions and lets one fill the row', () => {
    expect(measure([40, 40, 40])).toBe('stack');
    expect(measure([400])).toBe('row');
  });
});

describe('useAlertActionLayout', () => {
  it('shares the row when both labels fit their halves', () => {
    labelWidths.set('Cancel', 52);
    labelWidths.set('Delete', 50);
    render(<Actions labels={['Cancel', 'Delete']} />);
    expect(latest).toBe('row');
  });

  it('stacks when one label is wider than its half', () => {
    labelWidths.set('Cancel', 52);
    labelWidths.set('Delete everything', 140);
    render(<Actions labels={['Cancel', 'Delete everything']} />);
    expect(latest).toBe('stack');
  });

  it('stacks until the row can be measured', () => {
    rowWidth = 0;
    labelWidths.set('Cancel', 52);
    labelWidths.set('Delete', 50);
    const view = render(<Actions labels={['Cancel', 'Delete']} />);
    expect(latest).toBe('stack');
    rowWidth = ROW;
    resized(view.getByTestId('row'));
    expect(latest).toBe('row');
  });

  it('decides again when the row or a label changes size', () => {
    labelWidths.set('Cancel', 52);
    labelWidths.set('Delete', 50);
    const view = render(<Actions labels={['Cancel', 'Delete']} />);
    expect(latest).toBe('row');
    // A narrower row (a resize) leaves too little for the label.
    rowWidth = 120;
    resized(view.getByTestId('row'));
    expect(latest).toBe('stack');
    rowWidth = ROW;
    resized(view.getByTestId('row'));
    expect(latest).toBe('row');
    // A web font loads and the label grows past its half.
    labelWidths.set('Delete', 130);
    resized(view.getByTestId('label-Delete'));
    expect(latest).toBe('stack');
  });

  it('keeps the wide row off a compact viewport', () => {
    labelWidths.set('Cancel', 52);
    labelWidths.set('Delete everything', 300);
    render(
      <Actions labels={['Cancel', 'Delete everything']} isCompact={false} />,
    );
    expect(latest).toBe('row');
    expect(observers.size).toBe(0);
  });
});
