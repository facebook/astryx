// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSegmentedTouchTracking.test.ts
 * @input useSegmentedTouchTracking.ts's segment resolution
 * @output Proof of which segment a finger counts for, the rule the
 *   action-group tracker resolves the highlight and the commit with; and of
 *   which click the late-click guard swallows
 * @position Testing for /packages/core/src/SegmentedControl/useSegmentedTouchTracking.ts
 */

import {describe, expect, it} from 'vitest';
import {
  isLateClick,
  segmentTargetAt,
  type SegmentSpan,
} from './useSegmentedTouchTracking';

function spans(
  layout: ReadonlyArray<[string, number, number]>,
  disabled: ReadonlyArray<string> = [],
): SegmentSpan[] {
  return layout.map(([value, left, right]) => {
    const element = document.createElement('button');
    element.dataset.value = value;
    if (disabled.includes(value)) {
      element.setAttribute('aria-disabled', 'true');
    }
    return {element, left, right};
  });
}

const valueAt = (x: number, segments: SegmentSpan[]) =>
  segmentTargetAt(x, segments)?.dataset.value ?? null;

describe('segmentTargetAt', () => {
  // Gaps of 4 px, and a narrow segment beside a wide one.
  const layout: ReadonlyArray<[string, number, number]> = [
    ['grid', 12, 108],
    ['list', 112, 152],
    ['table', 156, 314],
  ];

  it('counts a finger over a segment for that segment, however near a narrower neighbour’s center', () => {
    const segments = spans(layout);
    // Inside Table, nearer List's center (132) than Table's own (235).
    expect(valueAt(160, segments)).toBe('table');
    expect(valueAt(60, segments)).toBe('grid');
  });

  it('splits a gap at its middle', () => {
    const segments = spans(layout);
    expect(valueAt(109, segments)).toBe('grid');
    expect(valueAt(111, segments)).toBe('list');
    expect(valueAt(153, segments)).toBe('list');
    expect(valueAt(155, segments)).toBe('table');
  });

  it('counts a finger past either end for the end segment', () => {
    const segments = spans(layout);
    expect(valueAt(-40, segments)).toBe('grid');
    expect(valueAt(400, segments)).toBe('table');
  });

  it('counts a finger over a disabled segment for nothing', () => {
    const segments = spans(layout, ['list']);
    expect(valueAt(130, segments)).toBeNull();
    expect(valueAt(111, segments)).toBeNull();
    expect(valueAt(109, segments)).toBe('grid');
  });
});

describe('isLateClick', () => {
  const segment = document.createElement('button');
  const label = document.createElement('span');
  segment.append(label);

  it('swallows the browser\u2019s own trusted click on the segment', () => {
    expect(
      isLateClick({isTrusted: true, detail: 1, target: label}, segment),
    ).toBe(true);
  });

  it('lets a keyboard\u2019s or assistive technology\u2019s activation (detail 0) through (AST-094 FR21)', () => {
    expect(
      isLateClick({isTrusted: true, detail: 0, target: label}, segment),
    ).toBe(false);
  });

  it('lets a script\u2019s click and a click elsewhere through', () => {
    expect(
      isLateClick({isTrusted: false, detail: 1, target: label}, segment),
    ).toBe(false);
    expect(
      isLateClick(
        {isTrusted: true, detail: 1, target: document.createElement('div')},
        segment,
      ),
    ).toBe(false);
  });
});
