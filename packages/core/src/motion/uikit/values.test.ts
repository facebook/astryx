// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file values.test.ts
 * @input vitest, the UIKit constants table and the motion math
 * @output Checks the table's values through the math that plays them: every
 *   spring is valid and settles; the alert spring is UIKit's legacy
 *   derivation; a sheet's detent and presentation springs render alike;
 *   scroll-to-top and the rubber band reproduce what UIKit was measured doing
 * @position Testing; the source rules are uikit.test.ts
 */

import {describe, expect, it} from 'vitest';
import {cubicBezier} from '../bezier';
import {solveDecay} from '../decay';
import {rubberBand} from '../rubberBand';
import {
  dampingRatioOf,
  naturalFrequency,
  responseOf,
  settlingDuration,
  springFromUIKitDampingDuration,
  toSpring,
  type SpringDescription,
} from '../spring';
import {datePicker, scroll, springs} from '.';

describe('UIKit constants table through the motion math', () => {
  const springEntries: [string, SpringDescription][] = [
    ...Object.entries(springs),
    ['scroll.bounce', scroll.bounce],
  ];

  it.each(springEntries)(
    '%s is a valid spring that settles',
    (_, description) => {
      const spring = toSpring(description);
      const settle = settlingDuration(spring);
      expect(settle).toBeGreaterThan(0.05);
      expect(settle).toBeLessThan(2);
    },
  );

  it('the alert spring is UIKit\u2019s legacy derivation at 0.404 s, critically damped', () => {
    // UIKit asks for damping 600 (clamped to 1) over 0.404 s; the measured
    // grid predicts the spring Core Animation was handed.
    const derived = springFromUIKitDampingDuration({
      duration: 0.404,
      dampingRatio: 1,
    });
    expect(derived.stiffness).toBeCloseTo(springs.alertPresent.stiffness, 1);
    expect(derived.damping).toBeCloseTo(springs.alertPresent.damping, 2);
  });

  it('a sheet\u2019s detent spring is its presentation spring as rendered (critical, same pace)', () => {
    // Core Animation clamps UIKit\u2019s default spring to critical damping.
    expect(naturalFrequency(toSpring(springs.sheetDetent))).toBeCloseTo(
      naturalFrequency(toSpring(springs.sheetPresent)),
      6,
    );
  });

  it('scroll-to-top as a decay lands on the top along the measured curve', () => {
    // 2000 pt from the top: remaining distance every ~50 ms after the start.
    const measured = [1257, 768, 475, 296, 186, 118];
    const coast = solveDecay({
      from: 0,
      velocity: 9.7 * 2000,
      rate: scroll.scrollToTopRate,
    });
    expect(coast.rest).toBeCloseTo(2000, -1);
    measured.forEach((remaining, i) => {
      expect(
        Math.abs(2000 - coast.value((i + 1) * 0.05) - remaining),
      ).toBeLessThan(30);
    });
  });

  it('the rubber band reproduces UIScrollView\u2019s released overscroll', () => {
    // Finger 100 / 300 / 600 pt past the edge of an 874 pt view, minus the
    // pan\u2019s 10 pt hysteresis.
    const cases: [number, number][] = [
      [90, 47],
      [290, 135],
      [590, 236.67],
    ];
    for (const [overflow, shown] of cases) {
      expect(
        Math.abs(
          rubberBand(overflow, 874, scroll.rubberBand.coefficient) - shown,
        ),
      ).toBeLessThan(0.5);
    }
  });

  it('the date picker\u2019s animated selection is springDuration 0.3 with no bounce, settling in 0.441 s', () => {
    // UIKit attached mass 1, stiffness 438.649, damping 41.888 and reported
    // a settlingDuration of 0.441 s.
    const spring = toSpring(datePicker.calendar.selection.programmaticSpring);
    expect(dampingRatioOf(spring)).toBeCloseTo(1, 4);
    expect(responseOf(spring)).toBeCloseTo(0.3, 4);
    expect(settlingDuration(spring)).toBeCloseTo(0.441, 3);
  });

  it('the compact date picker\u2019s popover opens and closes on the menu springs', () => {
    expect(datePicker.compact.present).toEqual(springs.menuOpen);
    expect(datePicker.compact.dismiss).toEqual(springs.menuClose);
  });

  it('a column the date picker turns itself moves on the sinusoid of an animated setContentOffset, within 0.2 %', () => {
    const ease = cubicBezier(datePicker.wheels.columnTurn.curve);
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      expect(
        Math.abs(ease(t) - (0.5 - 0.5 * Math.cos(Math.PI * t))),
      ).toBeLessThan(0.002);
    }
  });
});
