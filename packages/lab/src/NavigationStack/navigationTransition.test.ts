// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigationTransition.test.ts
 * @input Uses vitest and navigationTransition.ts
 * @output Unit coverage of NavigationStack's transition math: the layers at
 *   a progress, their velocities, the release rule against UIKit's measured
 *   releases, and progress from a finger's travel
 * @position Testing; guards the numbers the component hands the animator
 */

import {describe, expect, it} from 'vitest';
import {uikit} from '@astryxdesign/core/motion/experimental';
import {
  layersAt,
  layerVelocities,
  popVelocity,
  programmaticVelocity,
  progressFromTravel,
  shouldFinishPop,
} from './navigationTransition';

const {navigation} = uikit;
const W = 402;

describe('layersAt', () => {
  it('covers the screen with the top card at p = 0 (a push has landed)', () => {
    expect(layersAt(0, W)).toEqual({
      topX: 0,
      underX: navigation.parallax * W,
      dim: 1,
    });
  });

  it('has the card under it back at p = 1 (a pop has landed)', () => {
    const at = layersAt(1, W);
    expect(at.topX).toBe(W);
    expect(at.underX).toBeCloseTo(0, 10);
    expect(at.dim).toBe(0);
  });

  it('moves the card underneath at 0.3 of the top card’s speed (parallax)', () => {
    const a = layersAt(0.2, W);
    const b = layersAt(0.6, W);
    expect((b.underX - a.underX) / (b.topX - a.topX)).toBeCloseTo(0.3, 10);
  });

  it('mirrors every x under RTL', () => {
    const ltr = layersAt(0.4, W);
    const rtl = layersAt(0.4, W, 'rtl');
    expect(rtl.topX).toBe(-ltr.topX);
    expect(rtl.underX).toBe(-ltr.underX);
    expect(rtl.dim).toBe(ltr.dim);
  });
});

describe('layerVelocities', () => {
  it('is the derivative of layersAt, so one spring keeps the layers together', () => {
    const dp = 3.2;
    const h = 1e-6;
    const a = layersAt(0.5, W);
    const b = layersAt(0.5 + dp * h, W);
    const v = layerVelocities(dp, W);
    expect(v.topX).toBeCloseTo((b.topX - a.topX) / h, 3);
    expect(v.underX).toBeCloseTo((b.underX - a.underX) / h, 3);
    expect(v.dim).toBeCloseTo((b.dim - a.dim) / h, 3);
  });
});

describe('programmaticVelocity', () => {
  it('starts the push and the pop at 8.773 widths per second, not from rest', () => {
    expect(programmaticVelocity('push')).toBe(-navigation.pushVelocity);
    expect(programmaticVelocity('pop')).toBe(navigation.pushVelocity);
    // 3527 pt/s on the 402 pt card UIKit was measured on.
    expect(navigation.pushVelocity * W).toBeCloseTo(3527, -1);
  });
});

describe('shouldFinishPop', () => {
  it.each([
    // UIKit's own boundary cases (iOS 26.2 decision hook, 61 releases).
    [0.475, 0, false], // a still finger short of half cancels
    [0.05, 2.0, true], // a flick of ~2 widths/s from the edge finishes
    [0.05, 1.28, false], // ~490 pt/s from the edge cancels
    [0.6, 0, true],
    [0.6, -0.5, false], // dragged back toward the edge
    [0.3, 0.6, true],
  ])('p %f, v %f widths/s → finish %s', (p, v, finish) => {
    expect(shouldFinishPop(p, v)).toBe(finish);
  });
});

describe('progressFromTravel', () => {
  it('tracks the finger 1:1 as a share of the width', () => {
    expect(progressFromTravel(0, W / 4, W)).toBeCloseTo(0.25, 10);
  });

  it('continues from the progress a grabbed transition had', () => {
    expect(progressFromTravel(0.4, W / 10, W)).toBeCloseTo(0.5, 10);
  });

  it('clamps at both ends: no travel past the edge or back over it', () => {
    expect(progressFromTravel(0, -50, W)).toBe(0);
    expect(progressFromTravel(0.9, W, W)).toBe(1);
  });

  it('reads leftward travel as a pop under RTL', () => {
    expect(progressFromTravel(0, -W / 2, W, 'rtl')).toBeCloseTo(0.5, 10);
  });
});

describe('popVelocity', () => {
  it('converts px/s to widths per second toward the pop', () => {
    expect(popVelocity(804, W)).toBeCloseTo(2, 10);
    expect(popVelocity(-804, W, 'rtl')).toBeCloseTo(2, 10);
    expect(popVelocity(100, 0)).toBe(0);
  });
});
