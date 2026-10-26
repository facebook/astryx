// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file segmented.test.ts
 * @input vitest, the segmented-control domain of the UIKit constants table,
 *   the spring solver, and samples of UIKit's own selection slide
 * @output Holds `segmentedControl.selectionSpring` to UISegmentedControl's
 *   measured slide (position per frame, iOS 26.2 simulator), an internal
 *   constant no theme retunes
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
import {registerSpringsTable, springs} from './springs';

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

describe('the drag chase', () => {
  it('is the shared role springs.fingerTracking (spec:AST-094 FR4), the values UIKit reports for this control: no copy in the table', () => {
    registerSpringsTable();
    expect('trackingSpring' in segmentedControl).toBe(false);
    expect(springs.fingerTracking).toEqual({
      response: 0.15,
      dampingRatio: 0.86,
    });
    expect(motionRoleOf(springs.fingerTracking)).toMatchObject({
      id: 'springs.fingerTracking',
      kind: 'spring',
    });
  });
});

describe('internal constants', () => {
  it('no value is a motion role (spec:AST-094 FR4 names none for the segmented control); the titles switch at once, with no clock', () => {
    expect(motionRoleOf(segmentedControl.selectionSpring)).toBeUndefined();
    expect(motionRoleIn(segmentedControl, 'selectionSpring')).toBeUndefined();
    expect(motionRoleOf(segmentedControl.liftSpring)).toBeUndefined();
    expect(motionRoleIn(segmentedControl, 'tapLiftHangMs')).toBeUndefined();
    expect(motionRoleIn(segmentedControl, 'dragOvershoot')).toBeUndefined();
    expect(Object.keys(segmentedControl)).not.toContain('labelCrossFadeMs');
  });

  it('resolves to UIKit’s measured values whatever a theme sets: the old role variables do nothing', () => {
    const element = document.createElement('div');
    element.style.setProperty(
      '--motion-segmented-control-selection-spring',
      '0.25s 0',
    );
    element.style.setProperty('--motion-segmented-control-lift-spring', '1s 0');
    document.body.append(element);
    try {
      expect(resolveMotion(element, segmentedControl.selectionSpring)).toEqual(
        segmentedControl.selectionSpring,
      );
      expect(resolveMotion(element, segmentedControl.liftSpring)).toEqual(
        segmentedControl.liftSpring,
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

describe('one source for the slide', () => {
  it('the segmented slide has one spring, the measured one: no guessed thumb spring is left', () => {
    expect('segmentedThumb' in springs).toBe(false);
    expect(motionRoleIn(springs, 'segmentedThumb')).toBeUndefined();
  });
});

describe('Reduce Motion', () => {
  it('holds no values: SegmentedControl follows design:reduced-motion through the animator’s cross-fade, not UIKit’s fade and scale-in', () => {
    expect('reducedMotion' in segmentedControl).toBe(false);
  });
});

// UIKit lab, iOS 26.2 simulator (F4 batches 64 and 64b): a pressed unselected
// segment's title opacity per frame, [ms, opacity].
const MEASURED_PRESSED_TITLE = {
  /** A drag that starts on an unselected segment: the dim from touch-down. */
  dim: [
    [19, 0.98],
    [49, 0.92],
    [81, 0.82],
    [114, 0.69],
    [149, 0.57],
    [181, 0.47],
    [214, 0.4],
    [248, 0.34],
    [284, 0.29],
    [315, 0.26],
    [350, 0.23],
    [432, 0.2],
  ],
  /** A plain tap's dim from touch-down (b64b). */
  tapDim: [
    [14, 0.99],
    [32, 0.96],
    [48, 0.93],
    [64, 0.88],
    [81, 0.82],
    [294, 0.28],
  ],
  /** The chosen title coming back at the lift, from 0.21 (b64). */
  lift: [
    [24, 0.35],
    [42, 0.51],
    [59, 0.65],
    [75, 0.75],
    [92, 0.84],
    [109, 0.9],
    [143, 0.97],
    [174, 1],
  ],
} as const;

describe('the pressed title', () => {
  const {pressedTitle} = segmentedControl;

  it('dims to its opacity on the fade clock and comes back on the lift clock, as measured', () => {
    const fade = cubicBezier(pressedTitle.fadeCurve);
    for (const frames of [
      MEASURED_PRESSED_TITLE.dim,
      MEASURED_PRESSED_TITLE.tapDim,
    ]) {
      for (const [t, opacity] of frames) {
        const p = fade(Math.min(1, t / pressedTitle.fadeMs));
        expect(
          Math.abs(1 - (1 - pressedTitle.opacity) * p - opacity),
        ).toBeLessThan(0.02);
      }
    }
    const lift = cubicBezier(pressedTitle.liftCurve);
    for (const [t, opacity] of MEASURED_PRESSED_TITLE.lift) {
      const p = lift(Math.min(1, t / pressedTitle.liftMs));
      expect(Math.abs(0.21 + 0.79 * p - opacity)).toBeLessThan(0.03);
    }
  });

  it('is internal constants: its clocks, curves and opacity are no motion roles', () => {
    expect(motionRoleIn(pressedTitle, 'fadeMs')).toBeUndefined();
    expect(motionRoleIn(pressedTitle, 'liftMs')).toBeUndefined();
    expect(motionRoleOf(pressedTitle.fadeCurve)).toBeUndefined();
    expect(motionRoleOf(pressedTitle.liftCurve)).toBeUndefined();
    expect(motionRoleIn(pressedTitle, 'opacity')).toBeUndefined();
  });
});
