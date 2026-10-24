// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file segmented.test.ts
 * @input vitest, the segmented-control domain of the UIKit constants table,
 *   the spring solver, and samples of UIKit's own selection slide
 * @output Holds `segmentedControl.selectionSpring` to UISegmentedControl's
 *   measured slide (position per frame, iOS 26.2 simulator), the lift spring
 *   and growth to the measured hold and tap lifts (bounds per frame), and
 *   checks the title cross-fade's clock and curve
 * @position Testing; parity of the segmented-control constants (law P4,
 *   unit layer). The browser layer is
 *   SegmentedControl/__tests__/SegmentedControl.interaction.browser.spec.ts.
 */

import {describe, expect, it} from 'vitest';
import {cubicBezier} from '../bezier';
import {dampingRatioOf, responseOf, solveSpring, toSpring} from '../spring';
import {motionRoleIn, motionRoleOf} from '../roles';
import {resolveMotion} from '../resolveMotion';
import {segmentedControl} from './segmented';
import {timing} from './timing';

/**
 * The selection lens's presented position (pt, in the control) per frame,
 * from the frame the slide's presentation value first appears (t = 0 ms):
 * UIKit lab capture `b5-segmented` (iPhone 17 Pro, iOS 26.2 simulator,
 * Oct 23 2026), a 300 × 31 pt control of three equal segments.
 */
const MEASURED = {
  tap: {
    from: 50,
    to: 250,
    samples: [
      [0.0, 50],
      [69.1, 117.81],
      [135.6, 191.14],
      [206.4, 231.12],
      [267.7, 246.72],
      [333.3, 250.89],
      [403.2, 251.17],
      [470.0, 250.67],
      [536.6, 250.27],
    ],
  },
  animatedSet: {
    from: 250,
    to: 50,
    samples: [
      [0.0, 250],
      [71.9, 184.42],
      [139.9, 110.35],
      [204.5, 69.55],
      [272.0, 53.5],
      [340.1, 49.15],
      [406.5, 48.82],
      [471.1, 49.32],
      [538.5, 49.72],
    ],
  },
} as const;

/**
 * The worst and rms distance between the table's spring and a measured
 * slide. The capture logs a frame a few ms after the animation is created, so
 * the start is searched within ±6 ms; nothing else is fitted.
 */
function residuals({
  from,
  to,
  samples,
}: (typeof MEASURED)[keyof typeof MEASURED]): {
  worst: number;
  rms: number;
  offsetMs: number;
} {
  const curve = solveSpring(toSpring(segmentedControl.selectionSpring), {
    from,
    to,
    velocity: 0,
  });
  let best = {worst: Infinity, rms: Infinity, offsetMs: 0};
  for (let offset = -6; offset <= 6; offset += 0.25) {
    let worst = 0;
    let squares = 0;
    for (const [t, x] of samples) {
      const error = Math.abs(curve.value(Math.max(0, t + offset) / 1000) - x);
      worst = Math.max(worst, error);
      squares += error * error;
    }
    const rms = Math.sqrt(squares / samples.length);
    if (rms < best.rms) {
      best = {worst, rms, offsetMs: offset};
    }
  }
  return best;
}

describe('segmentedControl.selectionSpring reproduces UIKit’s slide', () => {
  it('is the response / damping ratio the capture fits', () => {
    const spring = toSpring(segmentedControl.selectionSpring);
    expect(responseOf(spring)).toBeCloseTo(0.4, 6);
    expect(dampingRatioOf(spring)).toBeCloseTo(0.85, 6);
  });

  it.each(Object.entries(MEASURED))(
    'matches the measured %s slide within a point',
    (_name, measured) => {
      const {worst, rms} = residuals(measured);
      expect(rms).toBeLessThan(0.75);
      expect(worst).toBeLessThan(1.5);
    },
  );

  it('overshoots like UIKit: about 1.25 pt past a 200 pt move, then settles back', () => {
    const curve = solveSpring(toSpring(segmentedControl.selectionSpring), {
      from: 50,
      to: 250,
      velocity: 0,
    });
    let peak = 0;
    for (let t = 0; t <= 1; t += 0.001) {
      peak = Math.max(peak, curve.value(t));
    }
    // Measured peak 251.25 at about 0.39 s (tap) and 251.23 (programmatic).
    expect(peak - 250).toBeGreaterThan(0.9);
    expect(peak - 250).toBeLessThan(1.6);
    expect(Math.abs(curve.value(0.6) - 250)).toBeLessThan(0.5);
  });
});

describe('the title cross-fade', () => {
  it('runs 200 ms on Core Animation’s default curve (CSS ease)', () => {
    expect(segmentedControl.labelCrossFadeMs).toBe(200);
    expect(segmentedControl.labelCrossFadeCurve).toEqual(
      timing.curves.caDefault,
    );
    // CSS `ease` is (0.25, 0.1, 0.25, 1): the same function.
    const ease = cubicBezier(segmentedControl.labelCrossFadeCurve);
    expect(ease(0.5)).toBeCloseTo(0.8024, 3);
  });
});

describe('motion roles', () => {
  it('every spring, clock and curve is a role a theme can retune', () => {
    expect(motionRoleOf(segmentedControl.selectionSpring)).toMatchObject({
      id: 'segmentedControl.selectionSpring',
      kind: 'spring',
      variable: '--motion-segmented-control-selection-spring',
    });
    expect(motionRoleOf(segmentedControl.labelCrossFadeCurve)).toMatchObject({
      id: 'segmentedControl.labelCrossFadeCurve',
      kind: 'curve',
    });
    expect(motionRoleIn(segmentedControl, 'labelCrossFadeMs')).toMatchObject({
      id: 'segmentedControl.labelCrossFadeMs',
      kind: 'duration',
      variable: '--motion-segmented-control-label-cross-fade-ms',
    });
  });

  it('with no theme setting them, resolves to UIKit’s measured values', () => {
    const element = document.createElement('div');
    document.body.append(element);
    try {
      expect(resolveMotion(element, segmentedControl.selectionSpring)).toEqual(
        segmentedControl.selectionSpring,
      );
      expect(resolveMotion(element, segmentedControl, 'labelCrossFadeMs')).toBe(
        200,
      );
    } finally {
      element.remove();
    }
  });
});

/**
 * The lens's bounds per frame (pt), from the same captures: holding the
 * selected 96 × 27 segment (ms from touch-down) and a tap slide (width =
 * frame width ÷ the stretch transform, ms from touch-up).
 */
const MEASURED_LIFT = {
  hold: [
    [12, 96.62, 26.82],
    [45, 101.45, 30.12],
    [78, 108.42, 34.84],
    [112, 113.51, 38.32],
    [145, 116.59, 40.47],
    [178, 118.28, 41.67],
    [212, 119.15, 42.32],
    [245, 119.53, 42.69],
    [278, 120, 43],
  ],
  tap: [
    [3, 96.0],
    [36, 100.33],
    [70, 107.46],
    [103, 112.83],
    [136, 116.14],
    [170, 118.0],
    [203, 119.0],
    [236, 119.5],
    [270, 114.84],
    [303, 107.91],
    [336, 102.78],
    [370, 99.63],
    [403, 97.88],
    [436, 96.94],
    [470, 96.47],
  ],
} as const;

describe('the lift', () => {
  const lift = toSpring(segmentedControl.liftSpring);
  const growth = segmentedControl.liftGrowth;

  it('reproduces the measured hold: +24 × +16 pt on the lift spring', () => {
    const width = solveSpring(lift, {
      from: 96,
      to: 96 + growth.width,
      velocity: 0,
    });
    const height = solveSpring(lift, {
      from: 27,
      to: 27 + growth.height,
      velocity: 0,
    });
    let best = Infinity;
    for (let offset = -15; offset <= 15; offset += 0.5) {
      let worst = 0;
      for (const [t, w, h] of MEASURED_LIFT.hold) {
        const s = Math.max(0, t + offset) / 1000;
        worst = Math.max(
          worst,
          Math.abs(width.value(s) - w),
          Math.abs(height.value(s) - h),
        );
      }
      best = Math.min(best, worst);
    }
    // Within 0.75 pt at every frame (the width and height share one start).
    expect(best).toBeLessThan(0.75);
  });

  it('reproduces a tap: lifted from the start, down again after the hang', () => {
    const hang = segmentedControl.tapLiftHangMs / 1000;
    const up = solveSpring(lift, {
      from: 96,
      to: 96 + growth.width,
      velocity: 0,
    });
    const down = solveSpring(lift, {
      from: up.value(hang),
      to: 96,
      velocity: up.velocity(hang),
    });
    let best = Infinity;
    for (let offset = -15; offset <= 15; offset += 0.5) {
      let worst = 0;
      for (const [t, w] of MEASURED_LIFT.tap) {
        const s = Math.max(0, t + offset) / 1000;
        const model = s <= hang ? up.value(s) : down.value(s - hang);
        worst = Math.max(worst, Math.abs(model - w));
      }
      best = Math.min(best, worst);
    }
    expect(best).toBeLessThan(0.75);
  });
});

/**
 * Reduce Motion: the lens's opacity and uniform scale per frame after a tap
 * and after a drag's lift (ms from its first frame at the destination), from
 * the same lab with Reduce Motion on.
 */
const MEASURED_REDUCED_MOTION = {
  tap: [
    [0, 0.0005, 0.8801],
    [16.7, 0.0564, 0.8868],
    [33.4, 0.1925, 0.9031],
    [50.0, 0.3831, 0.926],
    [66.7, 0.5673, 0.9481],
    [83.4, 0.6915, 0.963],
    [100.0, 0.7974, 0.9757],
    [116.7, 0.8691, 0.9843],
    [133.4, 0.926, 0.9911],
    [150.0, 0.9595, 0.9951],
    [166.7, 0.9831, 0.998],
    [183.4, 0.9954, 0.9995],
    [200.0, 1, 1],
  ],
  dragLift: [
    [0, 0.0005, 0.8801],
    [16.7, 0.0556, 0.8867],
    [33.4, 0.1956, 0.9035],
    [50.0, 0.3778, 0.9253],
    [66.7, 0.5538, 0.9465],
    [83.4, 0.6993, 0.9639],
    [100.0, 0.8062, 0.9767],
    [116.7, 0.8625, 0.9835],
    [133.4, 0.9277, 0.9913],
    [150.0, 0.9554, 0.9946],
    [166.7, 0.9813, 0.9978],
    [183.4, 0.9947, 0.9994],
    [200.0, 1, 1],
  ],
} as const;

describe('Reduce Motion', () => {
  const {reducedMotion} = segmentedControl;
  const ease = cubicBezier(reducedMotion.curve);

  it('fades and scales the lens in on one clock and curve, as measured', () => {
    for (const frames of Object.values(MEASURED_REDUCED_MOTION)) {
      // Opacity and scale share one progress at every frame.
      for (const [, opacity, scale] of frames) {
        expect(
          (scale - reducedMotion.scaleFrom) / (1 - reducedMotion.scaleFrom),
        ).toBeCloseTo(opacity, 2);
      }
      let best = Infinity;
      for (let offset = -10; offset <= 10; offset += 0.5) {
        let worst = 0;
        for (const [t, opacity, scale] of frames) {
          const p = ease(Math.max(0, t + offset) / reducedMotion.fadeMs);
          worst = Math.max(
            worst,
            Math.abs(p - opacity),
            Math.abs(
              reducedMotion.scaleFrom +
                (1 - reducedMotion.scaleFrom) * p -
                scale,
            ),
          );
        }
        best = Math.min(best, worst);
      }
      // Within 0.05 of the measured opacity and scale at every frame.
      expect(best).toBeLessThan(0.05);
    }
  });

  it('is two theme roles (clock and curve) and a measured starting scale', () => {
    expect(motionRoleIn(reducedMotion, 'fadeMs')).toMatchObject({
      id: 'segmentedControl.reducedMotion.fadeMs',
      kind: 'duration',
      variable: '--motion-segmented-control-reduced-motion-fade-ms',
    });
    expect(motionRoleOf(reducedMotion.curve)).toMatchObject({
      id: 'segmentedControl.reducedMotion.curve',
      kind: 'curve',
    });
    expect(motionRoleIn(reducedMotion, 'scaleFrom')).toBeUndefined();
  });
});
