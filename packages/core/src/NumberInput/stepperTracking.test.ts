// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepperTracking.test.ts
 * @input vitest, StepperTracking, and UIStepper's measured event times
 * @output UIStepper's tap and autorepeat rules on explicit times: taps step at
 *   the lift, the hold's cadence and its phases, slides, leaving and coming
 *   back, bounds, a busy main thread, cancellation
 * @position Unit tests for NumberInput/stepperTracking.ts (no DOM, no real
 *   time)
 */

import {describe, expect, it} from 'vitest';
import type {GestureClock} from '../gestures';
import {stepper} from '../motion/uikit';
import {
  halfAt,
  repeatInterval,
  StepperTracking,
  type StepperHalf,
} from './stepperTracking';

/** A clock whose timers fire only when the test moves time. */
function manualClock() {
  let now = 0;
  let nextId = 1;
  const timers = new Map<number, {at: number; run: () => void}>();
  const clock: GestureClock = {
    now: () => now,
    setTimeout: (run, ms) => {
      const id = nextId++;
      timers.set(id, {at: now + ms, run});
      return id;
    },
    clearTimeout: id => {
      timers.delete(id as number);
    },
  };
  const nextDue = (upTo: number) => {
    let due: [number, {at: number; run: () => void}] | null = null;
    for (const entry of timers) {
      if (entry[1].at <= upTo && (due == null || entry[1].at < due[1].at)) {
        due = entry;
      }
    }
    return due;
  };
  return {
    clock,
    /** Moves time to `to`, running each timer at its own deadline. */
    advanceTo(to: number) {
      for (let due = nextDue(to); due != null; due = nextDue(to)) {
        timers.delete(due[0]);
        now = due[1].at;
        due[1].run();
      }
      now = to;
    },
    /** A blocked main thread until `to`: then every timer due runs once, late. */
    stallTo(to: number) {
      now = to;
      for (let due = nextDue(to); due != null; due = nextDue(to)) {
        timers.delete(due[0]);
        due[1].run();
      }
    },
    get now() {
      return now;
    },
  };
}

function setup(canStep: (half: StepperHalf) => boolean = () => true) {
  const time = manualClock();
  const steps: {half: StepperHalf; at: number}[] = [];
  const tracking = new StepperTracking({
    clock: time.clock,
    step: half => {
      if (!canStep(half)) {
        return false;
      }
      steps.push({half, at: time.now});
      return true;
    },
  });
  /** A finger lands on `half` at time 0 and the press reaches the control at `deliverAt`. */
  const press = (half: StepperHalf, deliverAt = 0) => {
    tracking.begin(half);
    if (deliverAt === 0) {
      tracking.deliver(0);
    } else {
      time.advanceTo(deliverAt);
      tracking.deliver(deliverAt);
    }
  };
  return {time, steps, tracking, press};
}

const at = (steps: {at: number}[]) => steps.map(step => step.at);

/**
 * UIStepper, iOS 26.2: the times of the value changes during an 8 s hold on
 * +, from the touch-down (UIKit lab, HID touches, valueChanged log).
 */
const UIKIT_HOLD = [
  514, 1017, 1520, 2023, 2525, 3028, 3130, 3233, 3335, 3438, 3539, 3644, 3747,
  3849, 3951, 4052, 4154, 4257, 4359, 4463, 4514, 4566, 4619, 4669, 4720,
];

describe('StepperTracking: taps', () => {
  it('a tap steps once, at the lift', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    time.advanceTo(60);
    expect(steps).toEqual([]);
    tracking.end('increment');
    expect(steps).toEqual([{half: 'increment', at: 60}]);
    time.advanceTo(3000);
    expect(steps).toHaveLength(1);
  });

  it('a finger that slid from − onto + before any repeat steps + at the lift', () => {
    const {time, steps, tracking, press} = setup();
    press('decrement');
    time.advanceTo(200);
    tracking.move('increment');
    time.advanceTo(350);
    tracking.end('increment');
    expect(steps).toEqual([{half: 'increment', at: 350}]);
  });

  it('a lift outside the control steps nothing', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    time.advanceTo(120);
    tracking.move(null);
    tracking.end(null);
    time.advanceTo(2000);
    expect(steps).toEqual([]);
  });

  it('a tap quicker than a scroll view’s delay still steps at the lift', () => {
    const {time, steps, tracking} = setup();
    tracking.begin('increment');
    time.advanceTo(60);
    tracking.end('increment');
    expect(at(steps)).toEqual([60]);
  });
});

describe('StepperTracking: holding a half', () => {
  it('steps at 0.5 s, every 0.5 s to six steps, every 0.1 s to twenty, then every 50 ms', () => {
    const {time, steps, press} = setup();
    press('increment');
    time.advanceTo(4720);
    const expected = [
      500, 1000, 1500, 2000, 2500, 3000, 3100, 3200, 3300, 3400, 3500, 3600,
      3700, 3800, 3900, 4000, 4100, 4200, 4300, 4400, 4450, 4500, 4550, 4600,
      4650, 4700,
    ];
    expect(at(steps)).toEqual(expected);
    expect(steps.every(step => step.half === 'increment')).toBe(true);
  });

  it('matches UIStepper’s measured hold within its own step work', () => {
    const {time, steps, press} = setup();
    press('increment');
    time.advanceTo(UIKIT_HOLD.at(-1)!);
    // UIKit re-arms its timer after each step's work (about 2.5 ms in the
    // lab), so its steps drift later by a few ms per step; the model's times
    // are the drift-free schedule, never later than UIKit's.
    const model = at(steps).slice(0, UIKIT_HOLD.length);
    UIKIT_HOLD.forEach((uikit, i) => {
      const lag = uikit - model[i];
      expect(lag, `step ${i + 1}`).toBeGreaterThanOrEqual(0);
      expect(lag, `step ${i + 1}`).toBeLessThanOrEqual(14 + 3 * i);
    });
    // Each phase's interval matches UIKit's to within its step work.
    const gaps = (times: number[], from: number, to: number) =>
      (times[to] - times[from]) / (to - from);
    expect(gaps(UIKIT_HOLD, 0, 5)).toBeCloseTo(
      stepper.autorepeat.slowIntervalMs,
      -1,
    );
    expect(gaps(UIKIT_HOLD, 6, 19)).toBeCloseTo(
      stepper.autorepeat.mediumIntervalMs,
      -1,
    );
    expect(gaps(UIKIT_HOLD, 20, 24)).toBeCloseTo(
      stepper.autorepeat.fastIntervalMs,
      -1,
    );
  });

  it('a lift after a repeat adds no step', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    time.advanceTo(800);
    tracking.end('increment');
    time.advanceTo(3000);
    expect(at(steps)).toEqual([500]);
  });

  it('inside a scroll view the delay counts from the delayed delivery', () => {
    const {time, steps, press} = setup();
    // UIKit: +653 and +1155 ms.
    press('increment', 150);
    time.advanceTo(1200);
    expect(at(steps)).toEqual([650, 1150]);
  });

  it('nothing repeats before the press reaches the control', () => {
    const {time, steps, tracking} = setup();
    tracking.begin('increment');
    time.advanceTo(2000);
    expect(steps).toEqual([]);
  });

  it('repeatInterval follows the phases', () => {
    expect([0, 5, 6, 19, 20, 80].map(repeatInterval)).toEqual([
      500, 500, 100, 100, 50, 50,
    ]);
  });
});

describe('StepperTracking: moving the finger', () => {
  it('a slide onto the other half keeps the running cadence', () => {
    const {time, steps, tracking, press} = setup();
    // UIKit: −49 at +508, −48 at +1010, slide at +1190, +49 at +1513, +50 at +2014.
    press('decrement');
    time.advanceTo(1190);
    tracking.move('increment');
    time.advanceTo(2100);
    expect(steps).toEqual([
      {half: 'decrement', at: 500},
      {half: 'decrement', at: 1000},
      {half: 'increment', at: 1500},
      {half: 'increment', at: 2000},
    ]);
  });

  it('leaving the control stops the repeat', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    time.advanceTo(1100);
    tracking.move(null);
    time.advanceTo(6000);
    expect(at(steps)).toEqual([500, 1000]);
  });

  it('coming back steps at once and resumes the cadence, counted in steps', () => {
    const {time, steps, tracking, press} = setup();
    // UIKit: steps at +519 and +1020, out from +1103, back at +11507: a step
    // at +11520, then +12023 (still the slow interval after a 10 s pause).
    press('increment');
    time.advanceTo(1100);
    tracking.move(null);
    time.advanceTo(11500);
    tracking.move('increment');
    time.advanceTo(12100);
    expect(at(steps)).toEqual([500, 1000, 11500, 12000]);
  });

  it('coming back before the first repeat keeps the press’s own clock', () => {
    const early = setup();
    early.press('increment');
    early.time.advanceTo(200);
    early.tracking.move(null);
    early.time.advanceTo(300);
    early.tracking.move('increment');
    early.time.advanceTo(1100);
    expect(at(early.steps)).toEqual([500, 1000]);

    const late = setup();
    late.press('increment');
    late.time.advanceTo(200);
    late.tracking.move(null);
    late.time.advanceTo(700);
    late.tracking.move('increment');
    late.time.advanceTo(1300);
    expect(at(late.steps)).toEqual([700, 1200]);
  });

  it('a half at its bound does not step; the other half steps on the next beat', () => {
    const time = manualClock();
    let value = 8;
    const steps: {half: StepperHalf; at: number}[] = [];
    const tracking = new StepperTracking({
      clock: time.clock,
      step: half => {
        const next = half === 'increment' ? value + 1 : value - 1;
        if (next < 0 || next > 10) {
          return false;
        }
        value = next;
        steps.push({half, at: time.now});
        return true;
      },
    });
    // UIKit, holding + from 7 with a maximum of 10: 8, 9, 10, then nothing.
    tracking.begin('increment');
    tracking.deliver(0);
    time.advanceTo(2600);
    expect(at(steps)).toEqual([500, 1000]);
    expect(value).toBe(10);
    tracking.move('decrement');
    time.advanceTo(3100);
    expect(steps.at(-1)).toEqual({half: 'decrement', at: 3000});
    expect(value).toBe(9);
  });
});

describe('StepperTracking: a busy main thread and cancellation', () => {
  it('a step that runs late runs once, and the cadence resumes from it', () => {
    const {time, steps, press} = setup();
    press('increment');
    time.advanceTo(1000);
    // The main thread is blocked from 1000 to 1700: the 1500 step runs late,
    // once, and the next one is a full interval after it.
    time.stallTo(1700);
    time.advanceTo(2300);
    expect(at(steps)).toEqual([500, 1000, 1700, 2200]);
  });

  it('a cancel steps nothing and stops the clock', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    time.advanceTo(300);
    tracking.cancel();
    time.advanceTo(2000);
    expect(steps).toEqual([]);
    expect(tracking.isTracking).toBe(false);
  });

  it('a cancel after a repeat keeps the steps already made', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    time.advanceTo(1200);
    tracking.cancel();
    time.advanceTo(3000);
    expect(at(steps)).toEqual([500, 1000]);
  });

  it('a new press starts from nothing', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    time.advanceTo(3600);
    tracking.end('increment');
    const before = steps.length;
    const startedAt = time.now;
    tracking.begin('increment');
    tracking.deliver(startedAt);
    time.advanceTo(startedAt + 1100);
    expect(at(steps.slice(before))).toEqual([
      startedAt + 500,
      startedAt + 1000,
    ]);
  });
});

describe('halfAt', () => {
  it('splits a column at the middle', () => {
    const column = {increment: {x: 8, y: 8}, decrement: {x: 8, y: 24}};
    expect(halfAt(column, {x: 8, y: 2})).toBe('increment');
    expect(halfAt(column, {x: 12, y: 15})).toBe('increment');
    expect(halfAt(column, {x: 4, y: 17})).toBe('decrement');
  });

  it('splits the touch control at its divider: − on the left, + on the right', () => {
    const control = {decrement: {x: 23.5, y: 16}, increment: {x: 70.5, y: 16}};
    expect(halfAt(control, {x: 1, y: 30})).toBe('decrement');
    expect(halfAt(control, {x: 46, y: 2})).toBe('decrement');
    expect(halfAt(control, {x: 48, y: 2})).toBe('increment');
    expect(halfAt(control, {x: 93, y: 16})).toBe('increment');
  });

  it('answers the increment half before any layout was read', () => {
    expect(halfAt(null, {x: 0, y: 0})).toBe('increment');
  });
});
