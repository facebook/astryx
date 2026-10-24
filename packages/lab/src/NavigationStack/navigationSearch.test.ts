// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigationSearch.test.ts
 * @input Uses vitest and navigationSearch.ts
 * @output Checks the bar side of a search activation against iOS 26.2's
 *   measured rules: the back button gone by 35 % of the activation, the large
 *   title its square, the large title's return over the cancel's last 35 %,
 *   the clock from the table when no theme retunes it, and `searchCurve`
 *   on UIKit's curve
 * @position Testing
 */

import {describe, expect, it} from 'vitest';
import {uikit} from '@astryxdesign/core/motion/experimental';
import {
  searchBarItemOpacity,
  searchClock,
  searchCurve,
  searchLargeTitleOpacity,
  searchLargeTitleReturnOpacity,
} from './navigationSearch';

// No theme: the clock is the table's (a detached element reads it too).
const {durationS: SEARCH_ACTIVATION_S, ease: searchEase} = searchClock(null);

describe('the bar side of a search activation', () => {
  it('runs 383 ms on the activation curve, which is symmetric', () => {
    expect(SEARCH_ACTIVATION_S).toBeCloseTo(
      uikit.search.activationMs / 1000,
      6,
    );
    expect(searchEase(0)).toBe(0);
    expect(searchEase(1)).toBe(1);
    expect(searchEase(0.5)).toBeCloseTo(0.5, 3);
    expect(searchEase(0.25) + searchEase(0.75)).toBeCloseTo(1, 3);
  });

  it('fades the back button by 1 − p / 0.35, gone at 35 % of the activation', () => {
    expect(searchBarItemOpacity(0)).toBe(1);
    expect(searchBarItemOpacity(0.175)).toBeCloseTo(0.5, 6);
    expect(searchBarItemOpacity(0.35)).toBe(0);
    expect(searchBarItemOpacity(0.8)).toBe(0);
  });

  it('fades the large title as the square of the back button', () => {
    expect(searchLargeTitleOpacity(0)).toBe(1);
    expect(searchLargeTitleOpacity(0.175)).toBeCloseTo(0.25, 6);
    expect(searchLargeTitleOpacity(0.35)).toBe(0);
  });

  it('brings the large title back over the cancel’s last 35 %', () => {
    expect(searchLargeTitleReturnOpacity(0)).toBe(0);
    expect(searchLargeTitleReturnOpacity(0.65)).toBe(0);
    expect(searchLargeTitleReturnOpacity(0.825)).toBeCloseTo(0.5, 6);
    expect(searchLargeTitleReturnOpacity(1)).toBe(1);
  });

  it('matches iOS 26.2’s inline title fading out in place (1, .903, .720, .442, .090, 0)', () => {
    // The capture's frames sit 33 ms apart, the first one 60 Hz frame into
    // the motion.
    const measured = [1, 0.903, 0.72, 0.442, 0.09, 0];
    measured.forEach((value, i) => {
      const t = 0.0167 + i * 0.0333;
      const p = searchEase(Math.min(1, t / SEARCH_ACTIVATION_S));
      expect(Math.abs(searchBarItemOpacity(p) - value)).toBeLessThan(0.02);
    });
  });

  it('turns a rule into a curve on the activation clock, with its own velocity', () => {
    const curve = searchCurve(searchEase, SEARCH_ACTIVATION_S, r => -100 * r);
    expect(curve.duration).toBeCloseTo(SEARCH_ACTIVATION_S, 6);
    expect(curve.at(0)).toBeCloseTo(0, 6);
    expect(curve.at(SEARCH_ACTIVATION_S / 2)).toBeCloseTo(-50, 1);
    expect(curve.at(SEARCH_ACTIVATION_S)).toBeCloseTo(-100, 6);
    // Fastest mid-way, at rest at both ends.
    expect(curve.velocity(SEARCH_ACTIVATION_S / 2)).toBeLessThan(-300);
    expect(Math.abs(curve.velocity(0))).toBeLessThan(5);
    expect(searchCurve(searchEase, 0, r => r).at(0)).toBe(1);
  });
});
