// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tabBarModel.test.ts
 * @input vitest and tabBarModel.ts
 * @output Checks the TabBar's geometry against UIKit's measured layouts on
 *   iOS 26.2 (iPhone 17 Pro): the capsule's natural width, the items' shared
 *   width and their centres, for two to five tabs with and without the
 *   search tab, and the right-to-left mirror
 * @position Testing; pure math, no DOM
 */

import {describe, expect, it} from 'vitest';
import {
  itemCenters,
  itemWidth,
  itemWidthCss,
  naturalWidth,
} from './tabBarModel';

/**
 * UIKit's layouts: capsule width, then the items' screen x and width (the
 * capsule's own x subtracted below).
 */
const UIKIT_LAYOUTS = [
  {label: '2 tabs', capsuleX: 107, capsule: 188, width: 94, xs: [111, 197]},
  {label: '3 tabs', capsuleX: 64, capsule: 274, width: 94, xs: [68, 154, 240]},
  {
    label: '4 tabs',
    capsuleX: 21,
    capsule: 360,
    width: 98,
    xs: [25, 109.67, 194.33, 279],
  },
  {
    label: '5 tabs',
    capsuleX: 21,
    capsule: 360,
    width: 77,
    xs: [25, 93.75, 162.5, 231.25, 300],
  },
  {
    label: '3 tabs and search',
    capsuleX: 21,
    capsule: 290,
    width: 100.67,
    xs: [25, 115.67, 206.33],
  },
  {
    label: '4 tabs and search',
    capsuleX: 21,
    capsule: 290,
    width: 76,
    xs: [25, 93.67, 162.33, 231],
  },
];

describe('naturalWidth', () => {
  it('is UIKit’s capsule for two and three tabs, and reaches the 360 pt screen with four', () => {
    expect(naturalWidth(2)).toBe(188);
    expect(naturalWidth(3)).toBe(274);
    expect(naturalWidth(4)).toBe(360);
  });
});

describe('itemWidth and itemCenters', () => {
  for (const layout of UIKIT_LAYOUTS) {
    it(`match UIKit within a point: ${layout.label}`, () => {
      const n = layout.xs.length;
      expect(
        Math.abs(itemWidth(layout.capsule, n) - layout.width),
      ).toBeLessThan(1);
      const centers = itemCenters(layout.capsule, n);
      centers.forEach((center, i) => {
        const uikit = layout.xs[i] - layout.capsuleX + layout.width / 2;
        expect(Math.abs(center - uikit)).toBeLessThan(1);
      });
    });
  }

  it('keeps the first and last items one inset from the edges, the rest evenly between', () => {
    const centers = itemCenters(360, 5);
    const size = itemWidth(360, 5);
    expect(centers[0]).toBeCloseTo(4 + size / 2, 9);
    expect(centers[4]).toBeCloseTo(360 - 4 - size / 2, 9);
    const steps = centers.slice(1).map((center, i) => center - centers[i]);
    for (const step of steps) {
      expect(step).toBeCloseTo(steps[0], 9);
    }
  });

  it('mirrors in a right-to-left capsule (the first item on the right)', () => {
    expect(itemCenters(290, 4, true)).toEqual(
      itemCenters(290, 4).map(x => 290 - x),
    );
  });

  it('centres a single item and has nothing for none', () => {
    expect(itemCenters(200, 1)).toEqual([100]);
    expect(itemCenters(200, 0)).toEqual([]);
  });

  it('spells the same width in CSS', () => {
    expect(itemWidthCss(4)).toBe(
      'min(1.0659 * 100cqw / 4 + 0.0436 * 100cqw - 14.61px, 100cqw - 8px)',
    );
  });
});
