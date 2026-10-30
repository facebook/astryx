// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pageControlModel.test.ts
 * @input vitest, pageControlModel.ts, the UIKit page-control table
 * @output Proves the page-control math against UIPageControl's measured
 *   sizes (5 pages: 108.3 pt; 50 pages: capped at 161.3 pt) and the tap rule
 * @position Testing
 */

import {describe, expect, it} from 'vitest';
import {pageControlLayout, tapTarget, windowOffset} from './pageControlModel';

describe('pageControlLayout', () => {
  it("matches UIPageControl's measured width for 5 pages", () => {
    const layout = pageControlLayout(5);
    expect(layout.stripWidth).toBeCloseTo(80.35, 1);
    expect(layout.width).toBeCloseTo(108.3, 0);
    expect(layout.isWindowed).toBe(false);
  });

  it('caps the width at 161.3 for 50 pages and windows the row', () => {
    const layout = pageControlLayout(50);
    expect(layout.width).toBe(161.3);
    expect(layout.stripWidth).toBeCloseTo(50 * 9.67 + 49 * 8, 5);
    expect(layout.isWindowed).toBe(true);
  });

  it('is empty without pages', () => {
    expect(pageControlLayout(0)).toEqual({
      width: 28,
      stripWidth: 0,
      isWindowed: false,
    });
  });
});

describe('windowOffset', () => {
  it('does not shift a row that fits', () => {
    expect(windowOffset(5, 4)).toBe(0);
  });

  it('pins the row at the start, centres the current page, pins at the end', () => {
    expect(windowOffset(50, 0)).toBe(0);
    const middle = windowOffset(50, 25);
    const visible = 161.3 - 28;
    expect(25 * 17.67 + 9.67 / 2 - middle).toBeCloseTo(visible / 2, 5);
    const {stripWidth} = pageControlLayout(50);
    expect(windowOffset(50, 49)).toBeCloseTo(stripWidth - visible, 5);
  });
});

describe('tapTarget', () => {
  it('a tap on the trailing side moves forward one page, the leading side back', () => {
    expect(tapTarget(60, 50, 2, 5, false)).toBe(3);
    expect(tapTarget(40, 50, 2, 5, false)).toBe(1);
  });

  it('mirrors in RTL', () => {
    expect(tapTarget(40, 50, 2, 5, true)).toBe(3);
    expect(tapTarget(60, 50, 2, 5, true)).toBe(1);
  });

  it('stops at the first and last pages', () => {
    expect(tapTarget(60, 50, 4, 5, false)).toBe(4);
    expect(tapTarget(40, 50, 0, 5, false)).toBe(0);
  });
});
