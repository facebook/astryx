// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepperTracking.test.ts
 * @input vitest, StepperTracking, and UIStepper's measured delay
 * @output The stepper's tap and autorepeat rules on explicit times: taps step
 *   at the lift (a tap trembling on the edge too), the hold's one steady ramp,
 *   slides, leaving and coming back (a pause, never a step at once), edge
 *   tremble during a hold, bounds, a busy main thread, cancellation
 * @position Unit tests for NumberInput/stepperTracking.ts (no DOM, no real
 *   time)
 */

import {describe, expect, it} from 'vitest';
import type {GestureClock} from '../gestures';
import {stepper} from '../motion/uikit/stepper';
import {
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

/** The times the ramp steps at, from the delivery: 500, then 250 ms shrinking by 0.9 to 50. */
function rampTimes(count: number, from = 0): number[] {
  const times = [from + stepper.autorepeat.delayMs];
  while (times.length < count) {
    times.push(times.at(-1)! + repeatInterval(times.length));
  }
  return times;
}

const expectTimes = (actual: number[], expected: number[]) => {
  expect(actual, JSON.stringify(actual)).toHaveLength(expected.length);
  expected.forEach((time, i) => expect(actual[i]).toBeCloseTo(time, 6));
};

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

  it('a light tap trembling across the edge steps exactly once', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    for (const t of [10, 20, 30, 40, 50]) {
      time.advanceTo(t);
      tracking.move(null);
      time.advanceTo(t + 4);
      tracking.move('increment');
    }
    time.advanceTo(70);
    tracking.end('increment');
    expect(steps).toEqual([{half: 'increment', at: 70}]);
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
  it('steps at UIStepper’s 0.5 s, then on one steady ramp down to 50 ms', () => {
    const {time, steps, press} = setup();
    press('increment');
    time.advanceTo(1200);
    // 500, then 250, 225 and 202.5 ms apart.
    expectTimes(at(steps), [500, 750, 975, 1177.5]);
    time.advanceTo(4000);
    expectTimes(at(steps), rampTimes(steps.length));
    expect(steps.every(step => step.half === 'increment')).toBe(true);
  });

  it('the ramp has no jump: each interval is 0.9 of the last until 50 ms, then stays', () => {
    const {time, steps, press} = setup();
    press('increment');
    time.advanceTo(6000);
    const gaps = at(steps)
      .slice(1)
      .map((t, i) => t - at(steps)[i]);
    expect(gaps[0]).toBeCloseTo(250, 6);
    for (let i = 1; i < gaps.length; i += 1) {
      const expected = Math.max(50, gaps[i - 1] * 0.9);
      expect(gaps[i], `gap ${i + 1}`).toBeCloseTo(expected, 6);
    }
    expect(Math.min(...gaps)).toBeCloseTo(50, 6);
    // The ramp reaches its floor within three seconds of the press.
    expect(
      at(steps).find((t, i) => i > 0 && t - at(steps)[i - 1] === 50),
    ).toBeLessThan(3000);
  });

  it('a lift after a repeat adds no step', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    time.advanceTo(600);
    tracking.end('increment');
    time.advanceTo(3000);
    expect(at(steps)).toEqual([500]);
  });

  it('inside a scroll view the delay counts from the delayed delivery', () => {
    const {time, steps, press} = setup();
    // UIKit's first step in a scroll view: +653 ms.
    press('increment', 150);
    time.advanceTo(1000);
    expect(at(steps)).toEqual([650, 900]);
  });

  it('nothing repeats before the press reaches the control', () => {
    const {time, steps, tracking} = setup();
    tracking.begin('increment');
    time.advanceTo(2000);
    expect(steps).toEqual([]);
  });

  it('repeatInterval is 250 ms, then 0.9 of the last, never under 50 ms', () => {
    const intervals = [0, 1, 2, 3, 10, 16, 17, 80].map(repeatInterval);
    expectTimes(intervals, [
      250,
      250,
      225,
      202.5,
      250 * 0.9 ** 9,
      250 * 0.9 ** 15,
      50,
      50,
    ]);
  });
});

describe('StepperTracking: moving the finger', () => {
  it('a slide onto the other half keeps the running cadence', () => {
    const {time, steps, tracking, press} = setup();
    press('decrement');
    time.advanceTo(800);
    tracking.move('increment');
    time.advanceTo(1200);
    expect(steps.map(step => step.half)).toEqual([
      'decrement',
      'decrement',
      'increment',
      'increment',
    ]);
    expectTimes(at(steps), [500, 750, 975, 1177.5]);
  });

  it('leaving the control pauses the cadence', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    time.advanceTo(800);
    tracking.move(null);
    time.advanceTo(6000);
    expect(at(steps)).toEqual([500, 750]);
  });

  it('coming back resumes the rest of the paused interval, never a step at once', () => {
    const {time, steps, tracking, press} = setup();
    // Left at 800 with 175 ms of the 975 interval still to run.
    press('increment');
    time.advanceTo(800);
    tracking.move(null);
    time.advanceTo(5000);
    tracking.move('increment');
    expect(at(steps)).toEqual([500, 750]);
    time.advanceTo(5400);
    expectTimes(at(steps), [500, 750, 5175, 5377.5]);
  });

  it('trembling on the edge during a hold adds no step and does not speed the ramp', () => {
    const steady = setup();
    steady.press('increment');
    steady.time.advanceTo(2000);

    const trembling = setup();
    trembling.press('increment');
    // Out for 2 ms at a time, ten times, between 800 and 900.
    for (let t = 800; t < 900; t += 10) {
      trembling.time.advanceTo(t);
      trembling.tracking.move(null);
      trembling.time.advanceTo(t + 2);
      trembling.tracking.move('increment');
    }
    trembling.time.advanceTo(2000 + 20);
    // The same steps, each later by the 20 ms spent outside.
    expectTimes(
      at(trembling.steps),
      at(steady.steps).map(t => (t < 800 ? t : t + 20)),
    );
  });

  it('coming back before the first repeat keeps the rest of the delay', () => {
    const early = setup();
    early.press('increment');
    early.time.advanceTo(200);
    early.tracking.move(null);
    early.time.advanceTo(300);
    early.tracking.move('increment');
    early.time.advanceTo(900);
    expect(at(early.steps)).toEqual([600, 850]);

    const late = setup();
    late.press('increment');
    late.time.advanceTo(200);
    late.tracking.move(null);
    late.time.advanceTo(700);
    late.tracking.move('increment');
    late.time.advanceTo(1300);
    expect(at(late.steps)).toEqual([1000, 1250]);
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
    tracking.begin('increment');
    tracking.deliver(0);
    time.advanceTo(1300);
    expect(at(steps)).toEqual([500, 750]);
    expect(value).toBe(10);
    // The clock ran on at the bound (975, 1200, 1425 …): − steps on the next beat.
    tracking.move('decrement');
    time.advanceTo(1500);
    expect(steps.at(-1)).toEqual({half: 'decrement', at: 1425});
    expect(value).toBe(9);
  });
});

describe('StepperTracking: a busy main thread and cancellation', () => {
  it('a step that runs late runs once, and the cadence resumes from it', () => {
    const {time, steps, press} = setup();
    press('increment');
    time.advanceTo(1000);
    // The main thread is blocked from 1000 to 1700: the 1177.5 step runs late,
    // once, and the next one is a full interval after it.
    time.stallTo(1700);
    time.advanceTo(1900);
    expectTimes(at(steps), [500, 750, 975, 1700, 1882.25]);
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

  it('a cancel after a repeat stops the clock', () => {
    const {time, steps, tracking, press} = setup();
    press('increment');
    time.advanceTo(800);
    tracking.cancel();
    time.advanceTo(3000);
    expect(at(steps)).toEqual([500, 750]);
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
    time.advanceTo(startedAt + 800);
    expect(at(steps.slice(before))).toEqual([startedAt + 500, startedAt + 750]);
  });
});
