// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file searchFieldModel.test.ts
 * @input vitest, searchFieldModel.ts and the UIKit search table
 * @output The model's geometry and clock: the active width on an iPhone 17
 *   Pro, every part's pose at rest and active (both directions), the eased
 *   curve's ends, symmetry and velocities, and the share of the clock a
 *   change of mind takes
 * @position Testing; validates searchFieldModel.ts without a DOM
 */

import {describe, expect, it} from 'vitest';
import {uikit} from '@astryxdesign/core/motion/experimental';
import {
  ACTIVATION_S,
  activationEase,
  activeFieldWidth,
  easedCurve,
  heldCurve,
  poseFor,
  remainingFraction,
} from './searchFieldModel';

const IPHONE = {restWidth: 370, height: 44, lift: 99, isRtl: false};

describe('searchFieldModel', () => {
  it('runs on the UIKit activation clock and curve', () => {
    expect(ACTIVATION_S).toBeCloseTo(0.3833, 4);
    expect(uikit.search.activationCurve).toEqual(uikit.timing.curves.easeInOut);
    expect(activationEase(0.5)).toBeCloseTo(0.5, 6);
  });

  it('narrows the field to 315 px beside the close button on a 402 px screen', () => {
    expect(activeFieldWidth(370)).toBe(315);
  });

  it('poses every part at rest and active', () => {
    expect(poseFor(false, IPHONE)).toEqual({
      y: 0,
      middleScale: 1,
      endX: 0,
      closeX: 44,
      closeOpacity: 0,
    });
    const active = poseFor(true, IPHONE);
    expect(active.y).toBe(-99);
    expect(active.endX).toBe(-55);
    expect(active.middleScale).toBeCloseTo(271 / 326, 9);
    expect(active.closeX).toBe(0);
    expect(active.closeOpacity).toBe(1);
  });

  it('mirrors the trailing end and the close button right to left', () => {
    const rtl = {...IPHONE, isRtl: true};
    expect(poseFor(false, rtl).closeX).toBe(-44);
    expect(poseFor(true, rtl).endX).toBe(55);
  });

  it('eases from rest to rest, symmetric, through its middle at half the clock', () => {
    const curve = easedCurve(0, -55, ACTIVATION_S);
    expect(curve.duration).toBeCloseTo(0.3833, 4);
    expect(curve.at(0)).toBe(0);
    expect(curve.at(ACTIVATION_S)).toBeCloseTo(-55, 9);
    expect(curve.at(ACTIVATION_S / 2)).toBeCloseTo(-27.5, 6);
    expect(Math.abs(curve.velocity(0))).toBeLessThan(1);
    expect(Math.abs(curve.velocity(ACTIVATION_S))).toBeLessThan(1);
    // Fastest in the middle: 55 px over 0.383 s at the curve's peak slope.
    expect(curve.velocity(ACTIVATION_S / 2)).toBeLessThan(-200);
    expect(easedCurve(3, 9, 0).at(0)).toBe(9);
  });

  it('holds a value to the end of the clock, then lands on its target', () => {
    const curve = heldCurve(0.6, 0, ACTIVATION_S);
    expect(curve.at(0)).toBe(0.6);
    expect(curve.at(ACTIVATION_S - 0.001)).toBe(0.6);
    expect(curve.at(ACTIVATION_S)).toBe(0);
    expect(curve.velocity(0.1)).toBe(0);
  });

  it('takes the share of the clock that the remaining travel is of the whole', () => {
    const rest = poseFor(false, IPHONE);
    const active = poseFor(true, IPHONE);
    expect(remainingFraction(rest, rest, active)).toBe(1);
    expect(remainingFraction(active, rest, active)).toBe(0);
    const halfway = {...rest, y: -49.5, endX: -27.5, closeX: 22};
    expect(remainingFraction(halfway, active, rest)).toBeCloseTo(0.5, 9);
  });
});
