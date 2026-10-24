// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepperTracking.ts
 * @input The half of a number stepper under a finger over time, and a clock
 * @output Exports StepperTracking (UIStepper's tap and autorepeat rules on
 *   explicit times), repeatInterval and the StepperHalf type
 * @position Pure half of NumberInput's touch stepper: no DOM. NumberInput
 *   feeds it from the gesture system's PressTracker; tested by
 *   stepperTracking.test.ts with a manual clock
 *
 * UIStepper on iOS 26.2, as measured (motion/uikit/stepper.ts):
 *
 * - A tap steps once, at the lift, on the half under the finger then: a
 *   finger that slid from − onto + before anything repeated steps +. A lift
 *   outside the control steps nothing.
 * - A held finger steps `delayMs` after the press reached the control, then
 *   keeps stepping: every `slowIntervalMs` until `mediumAfterSteps` steps,
 *   every `mediumIntervalMs` until `fastAfterSteps`, then every
 *   `fastIntervalMs`. The phases count steps, not time. Each interval is
 *   timed from the step before it, so a step that runs late (a busy main
 *   thread) runs once, never as a burst. A lift after a repeat adds nothing.
 * - Sliding onto the other half keeps the running cadence; the next step
 *   lands on the new half.
 * - The control keeps no tracking margin: leaving its frame stops the
 *   repeat, and coming back steps at once and resumes the cadence. Coming
 *   back before the first repeat keeps the press's own clock (not measured:
 *   motion/MEASUREMENTS.md M-STP16).
 * - A half at its bound does not step; the clock runs on, so sliding to the
 *   other half steps it on the next beat.
 *
 * SYNC: When modified, update stepperTracking.test.ts and the stepper
 * glue in NumberInput.tsx.
 */

import {browserClock, type GestureClock} from '../gestures';
import {stepper} from '../motion/uikit';

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

/** The interval before the next repeat, once `stepsMade` steps were made. */
export function repeatInterval(stepsMade: number): number {
  const {
    slowIntervalMs,
    mediumAfterSteps,
    mediumIntervalMs,
    fastAfterSteps,
    fastIntervalMs,
  } = stepper.autorepeat;
  if (stepsMade < mediumAfterSteps) {
    return slowIntervalMs;
  }
  return stepsMade < fastAfterSteps ? mediumIntervalMs : fastIntervalMs;
}

export class StepperTracking {
  /** Whether a finger is tracked. */
  isTracking = false;
  /** Whether the press has reached the control (the repeat clock runs). */
  isDelivered = false;
  /** The half under the finger; null while it is outside the control. */
  half: StepperHalf | null = null;
  /** Steps made by this press (taps and repeats). */
  steps = 0;

  private readonly options: StepperTrackingOptions;
  private readonly clock: GestureClock;
  private deliveredAt = 0;
  private timer: unknown = null;

  constructor(options: StepperTrackingOptions) {
    this.options = options;
    this.clock = options.clock ?? browserClock;
  }

  /** A finger landed on `half`. */
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
    this.deliveredAt = time;
    this.arm(time + stepper.autorepeat.delayMs);
  }

  /** The finger moved; `half` is null when it is outside the control. */
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
      // Leaving the control stops the repeat.
      this.disarm();
    } else if (this.steps > 0) {
      // Coming back steps at once and resumes the cadence from there.
      this.repeat();
    } else {
      this.arm(this.deliveredAt + stepper.autorepeat.delayMs);
    }
  }

  /** The finger lifted over `half` (null: outside the control). */
  end(half: StepperHalf | null): void {
    if (!this.isTracking) {
      return;
    }
    const isTap = this.steps === 0;
    this.reset();
    if (isTap && half != null) {
      this.options.step(half);
    }
  }

  /** The press was taken away (a scroll, a recognizer): nothing more steps. */
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
    // Timed from after this step's work, as UIKit re-arms its timer.
    this.arm(this.clock.now() + repeatInterval(this.steps));
  }

  private arm(deadline: number): void {
    this.disarm();
    this.timer = this.clock.setTimeout(
      () => {
        this.timer = null;
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
  }

  private reset(): void {
    this.disarm();
    this.isTracking = false;
    this.isDelivered = false;
    this.half = null;
    this.steps = 0;
    this.deliveredAt = 0;
  }
}
