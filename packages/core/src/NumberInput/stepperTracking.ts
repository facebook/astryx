// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepperTracking.ts
 * @input The half of a number stepper under a pointer over time, and a clock
 * @output Exports StepperTracking (the stepper's tap and autorepeat rules on
 *   explicit times), repeatInterval, halfAt (which half a point is on) and
 *   the StepperHalf type
 * @position Pure half of NumberInput's stepper press: no DOM. The press layer
 *   (NumberInputTouch.tsx) feeds it from the gesture system's PressTracker,
 *   for every pointer; tested by stepperTracking.test.ts with a manual clock
 *
 * The rules (motion/uikit/stepper.ts):
 *
 * - A tap steps nothing at its lift: a control activates by the browser's
 *   click on a lift inside (`spec:AST-094` FR11). The lift names the half
 *   that click steps, the one under the pointer then: a pointer that slid
 *   from − onto + before anything repeated names +. A lift outside the
 *   control names nothing.
 * - A held press steps `delayMs` after it reached the control (UIStepper's
 *   measured delay), then keeps stepping on one steady ramp: after
 *   `firstIntervalMs`, then each interval `acceleration` times the one
 *   before, never under `minIntervalMs`. Each interval is timed from the
 *   step before it, so a step that runs late (a busy main thread) runs once,
 *   never as a burst. A lift after a repeat names nothing, so its click adds
 *   nothing.
 * - Sliding onto the other half keeps the running cadence; the next step
 *   lands on the new half.
 * - Leaving the control pauses the cadence and coming back resumes it: the
 *   next step comes once the rest of the paused interval has passed, never
 *   at once, so a pointer trembling at the edge adds no step and does not
 *   speed the ramp.
 * - A half at its bound does not step; the clock runs on, so sliding to the
 *   other half steps it on the next beat.
 *
 * SYNC: When modified, update stepperTracking.test.ts and the press layer
 * in NumberInputTouch.tsx.
 */

import {browserClock, type GestureClock} from '../gestures';
import {stepper} from '../motion/uikit/stepper';

export type StepperHalf = 'increment' | 'decrement';

export interface StepperTrackingOptions {
  /**
   * Step the value toward `half`. Returns false when that half cannot step
   * (its bound is reached, or the field is disabled or read-only).
   */
  step: (half: StepperHalf) => boolean;
  /** The clock timers run on: `performance.now()`, the base of `event.timeStamp`. */
  clock?: GestureClock;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * The half a point is on: the one whose centre is nearer, so the same rule
 * serves halves stacked in a column and halves side by side. The increment
 * half wins a tie; with no centres read, the point is on it.
 */
export function halfAt(
  centers: {readonly increment: Point; readonly decrement: Point} | null,
  point: Point,
): StepperHalf {
  if (centers == null) {
    return 'increment';
  }
  const distance = (center: Point) =>
    (center.x - point.x) ** 2 + (center.y - point.y) ** 2;
  return distance(centers.decrement) < distance(centers.increment)
    ? 'decrement'
    : 'increment';
}

/** The interval before the next repeat, once `stepsMade` steps were made. */
export function repeatInterval(stepsMade: number): number {
  const {firstIntervalMs, acceleration, minIntervalMs} = stepper.autorepeat;
  return Math.max(
    minIntervalMs,
    firstIntervalMs * acceleration ** Math.max(0, stepsMade - 1),
  );
}

export class StepperTracking {
  /** Whether a press is tracked. */
  isTracking = false;
  /** Whether the press has reached the control (the repeat clock runs). */
  isDelivered = false;
  /** The half under the pointer; null while it is outside the control. */
  half: StepperHalf | null = null;
  /** Steps made by this press (taps and repeats). */
  steps = 0;

  private readonly options: StepperTrackingOptions;
  private readonly clock: GestureClock;
  /** When the armed repeat fires; null while none is armed. */
  private deadline: number | null = null;
  /** What was left of the interval when the pointer left the control. */
  private remaining: number | null = null;
  private timer: unknown = null;

  constructor(options: StepperTrackingOptions) {
    this.options = options;
    this.clock = options.clock ?? browserClock;
  }

  /** A pointer landed on `half`. */
  begin(half: StepperHalf): void {
    this.reset();
    this.isTracking = true;
    this.half = half;
  }

  /**
   * The press reached the control at `time`: at touch-down outside a scroll
   * view, after its content-touch delay inside one. Starts the repeat clock.
   */
  deliver(time: number): void {
    if (!this.isTracking || this.isDelivered) {
      return;
    }
    this.isDelivered = true;
    const deadline = time + stepper.autorepeat.delayMs;
    if (this.half == null) {
      this.remaining = Math.max(0, deadline - this.clock.now());
    } else {
      this.arm(deadline);
    }
  }

  /** The pointer moved; `half` is null when it is outside the control. */
  move(half: StepperHalf | null): void {
    if (!this.isTracking) {
      return;
    }
    const wasOutside = this.half == null;
    this.half = half;
    if (!this.isDelivered || wasOutside === (half == null)) {
      // A slide between the halves keeps the running cadence.
      return;
    }
    if (half == null) {
      // Leaving the control pauses the cadence.
      this.remaining =
        this.deadline == null
          ? null
          : Math.max(0, this.deadline - this.clock.now());
      this.disarm();
    } else {
      // Coming back resumes it, with the rest of the paused interval.
      this.arm(
        this.clock.now() + (this.remaining ?? repeatInterval(this.steps)),
      );
      this.remaining = null;
    }
  }

  /**
   * The pointer lifted over `half` (null: outside the control). Steps
   * nothing: returns the half the browser's click after a tap steps, or null
   * after a repeat, for a lift outside, or with no press.
   */
  end(half: StepperHalf | null): StepperHalf | null {
    if (!this.isTracking) {
      return null;
    }
    const isTap = this.steps === 0;
    this.reset();
    return isTap ? half : null;
  }

  /** The press was taken away (a scroll, the system): nothing more steps. */
  cancel(): void {
    this.reset();
  }

  /** Drop the press and its timer (the control unmounted). */
  dispose(): void {
    this.reset();
  }

  private repeat(): void {
    const half = this.half;
    if (half != null && this.options.step(half)) {
      this.steps += 1;
    }
    // Timed from after this step's work, so a late step runs once.
    this.arm(this.clock.now() + repeatInterval(this.steps));
  }

  private arm(deadline: number): void {
    this.disarm();
    this.deadline = deadline;
    this.timer = this.clock.setTimeout(
      () => {
        this.timer = null;
        this.deadline = null;
        if (this.isTracking && this.half != null) {
          this.repeat();
        }
      },
      Math.max(0, deadline - this.clock.now()),
    );
  }

  private disarm(): void {
    if (this.timer != null) {
      this.clock.clearTimeout(this.timer);
      this.timer = null;
    }
    this.deadline = null;
  }

  private reset(): void {
    this.disarm();
    this.isTracking = false;
    this.isDelivered = false;
    this.half = null;
    this.steps = 0;
    this.remaining = null;
  }
}
