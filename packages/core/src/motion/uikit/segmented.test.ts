// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file segmented.test.ts
 * @input vitest, the segmented-control domain of the UIKit constants table,
 *   the spring solver, and samples of UIKit's own selection slide
 * @output Holds `segmentedControl.selectionSpring` to UISegmentedControl's
 *   measured slide (position per frame, iOS 26.2 simulator), and checks the
 *   title cross-fade's clock and curve
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
import {springs} from './springs';
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

describe('one source for the slide', () => {
  it('the segmented slide has one spring, the measured one: no guessed thumb spring is left', () => {
    expect('segmentedThumb' in springs).toBe(false);
    expect(motionRoleIn(springs, 'segmentedThumb')).toBeUndefined();
    expect(motionRoleIn(segmentedControl, 'selectionSpring')).toMatchObject({
      id: 'segmentedControl.selectionSpring',
    });
  });
});

describe('Reduce Motion', () => {
  it('holds no values: SegmentedControl follows design:reduced-motion through the animator’s cross-fade, not UIKit’s fade and scale-in', () => {
    expect('reducedMotion' in segmentedControl).toBe(false);
  });
});
