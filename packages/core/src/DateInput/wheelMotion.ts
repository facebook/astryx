// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelMotion.ts
 * @input The Wheel's DOM (its drum rows and its band strip), its layout, and
 *   curves from wheelPhysics.ts
 * @output Exports WheelMotion: the one owner of a wheel's offset. It writes
 *   the rows for a drag frame by frame, plays any curve on the compositor
 *   (baked per row by wheelDrum.ts), reads the offset on screen at any
 *   instant, stops a motion where it is, ticks, and reports arrival
 * @position Imperative engine of the Wheel (Wheel.tsx). Never renders React:
 *   a gesture or a motion writes styles and nothing else
 *
 * A motion is a set of Web Animations, one per row that shows during it plus
 * one for the band strip, all baked from the same samples of the same curve
 * and created in the same task, so the browser starts them together. The
 * inline styles already hold the end values before they start, and the last
 * keyframe holds for `END_HOLD_MS` past the end: the frame a motion ends
 * needs no main thread, so a busy main thread never freezes or jumps it.
 *
 * Rows that a motion animates are promoted (`will-change: transform`) from
 * before it starts until it ends: Mobile Safari freezes a Web Animation on an
 * element without a compositing layer through a main-thread block.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/Wheel.tsx
 * - /packages/core/src/DateInput/Wheel.test.tsx
 */

import {canVibrate, playHaptic} from '../gestures/haptics';
import {picker} from '../motion/uikit';
import {
  drumGeometry,
  rowAngle,
  rowDistance,
  rowKeyframes,
  rowTransform,
  sampleCurve,
  stripKeyframes,
  stripTranslation,
  type DrumGeometry,
} from './wheelDrum';
import {
  reachesRow,
  tickTimes,
  type WheelCurve,
  type WheelLayout,
} from './wheelPhysics';

/** How long the last keyframe holds past a motion's end, ms. */
const END_HOLD_MS = 5000;

/** How a motion ended: arrived on its row, or stopped before. */
export type WheelMotionOutcome = 'arrived' | 'stopped';

/** Options for one motion. */
export interface PlayOptions {
  /** Tick as rows reach the band (a drag's release); a tap's spin does not. */
  ticks?: boolean;
  /** Called once when the motion ends, either way. */
  onEnd?: (outcome: WheelMotionOutcome, offset: number) => void;
}

interface RunningMotion {
  readonly curve: WheelCurve;
  /** document.timeline time the curve's t = 0 maps to, ms. */
  origin: number;
  readonly animations: Animation[];
  readonly promoted: HTMLElement[];
  readonly timers: number[];
  readonly ticks: boolean;
  readonly onEnd?: (outcome: WheelMotionOutcome, offset: number) => void;
}

function now(): number {
  const time =
    typeof document !== 'undefined'
      ? (document.timeline?.currentTime as number | null | undefined)
      : null;
  return typeof time === 'number' ? time : performance.now();
}

function canAnimate(element: Element): boolean {
  return typeof (element as HTMLElement).animate === 'function';
}

/**
 * The offset of one picker column and everything that moves it.
 *
 * @example
 * ```
 * const motion = new WheelMotion({rowHeight: 32, rowCount: 60});
 * motion.attach(rows, strip);
 * motion.setOffset(30 * 32);
 * motion.play(planRelease(motion.offset(), 900, layout).curve, {ticks: true});
 * ```
 */
export class WheelMotion {
  private layout: WheelLayout;
  private geometry: DrumGeometry;
  private rows: HTMLElement[] = [];
  private strip: HTMLElement | null = null;
  private restingOffset = 0;
  private motion: RunningMotion | null = null;
  /** Last angle written per row, so a frame writes only what changed. */
  private written: (number | null)[] = [];
  private lastTick = -Infinity;
  /** Last offset a drag frame showed, for its ticks. */
  private dragPrevious: number | null = null;

  constructor(layout: WheelLayout) {
    this.layout = layout;
    this.geometry = drumGeometry(layout.rowHeight);
  }

  /**
   * The drum's rows (one per option, in order) and the band's strip. Handed
   * the same nodes again (an owner re-rendered, say with other rows
   * disabled), a running motion keeps playing on them; new nodes stop it.
   */
  attach(rows: HTMLElement[], strip: HTMLElement | null): void {
    const sameNodes =
      strip === this.strip &&
      rows.length === this.rows.length &&
      rows.every((row, index) => row === this.rows[index]);
    if (!sameNodes) {
      this.stop();
    }
    this.rows = rows;
    this.strip = strip;
    this.written = rows.map(() => null);
    if (this.motion == null) {
      this.render(this.restingOffset);
    }
  }

  /** Update the rows (a new option list); keeps the offset. */
  setLayout(layout: WheelLayout): void {
    const changed =
      layout.rowCount !== this.layout.rowCount ||
      layout.rowHeight !== this.layout.rowHeight ||
      Boolean(layout.looping) !== Boolean(this.layout.looping);
    this.layout = layout;
    this.geometry = drumGeometry(layout.rowHeight);
    if (changed) {
      this.written = this.rows.map(() => null);
    }
  }

  /** Whether a motion is playing. */
  isMoving(): boolean {
    return this.motion != null;
  }

  /** The offset on screen at `time` (document.timeline ms; default now). */
  offset(time: number = now()): number {
    const motion = this.motion;
    if (motion == null) {
      return this.restingOffset;
    }
    const t = Math.max(0, (time - motion.origin) / 1000);
    return motion.curve.value(Math.min(t, motion.curve.duration));
  }

  /** Where the wheel will be at rest: the motion's end, or the offset now. */
  target(): number {
    return this.motion?.curve.to ?? this.restingOffset;
  }

  /** The velocity on screen at `time`, px/s. */
  velocity(time: number = now()): number {
    const motion = this.motion;
    if (motion == null) {
      return 0;
    }
    const t = Math.max(0, (time - motion.origin) / 1000);
    return motion.curve.velocity(t);
  }

  /** Show `offset` at once, stopping any motion. A drag frame. */
  setOffset(offset: number, {ticks = false}: {ticks?: boolean} = {}): void {
    if (this.motion != null) {
      this.stop();
    }
    if (ticks && this.dragPrevious != null) {
      this.tickBetween(this.dragPrevious, offset, now());
    }
    this.dragPrevious = offset;
    this.restingOffset = offset;
    this.render(offset);
  }

  /** Forget the previous drag frame (a new gesture starts). */
  resetDrag(): void {
    this.dragPrevious = null;
  }

  /**
   * Stop the motion where it is on screen (a finger landing on a spinning
   * wheel). Returns the offset it stopped at.
   */
  stop(time: number = now()): number {
    const motion = this.motion;
    if (motion == null) {
      return this.restingOffset;
    }
    const offset = this.offset(time);
    this.finish(motion);
    this.restingOffset = offset;
    this.render(offset, true);
    motion.onEnd?.('stopped', offset);
    return offset;
  }

  /** Play `curve` from the current offset; the rows end at curve.to. */
  play(curve: WheelCurve, {ticks = false, onEnd}: PlayOptions = {}): void {
    this.stop();
    this.dragPrevious = null;
    if (!(curve.duration > 0)) {
      this.restingOffset = curve.to;
      this.render(curve.to);
      onEnd?.('arrived', curve.to);
      return;
    }
    const durationMs = curve.duration * 1000;
    const totalMs = durationMs + END_HOLD_MS;
    const scale = durationMs / totalMs;
    const samples = sampleCurve(curve);
    const animations: Animation[] = [];
    const promoted: HTMLElement[] = [];
    // The end state goes inline first: whatever the animations do, the rows
    // rest there once they are gone.
    this.restingOffset = curve.to;
    this.render(curve.to);
    const animated = this.rows.length > 0 && canAnimate(this.rows[0]);
    if (animated) {
      this.rows.forEach((row, index) => {
        const frames = rowKeyframes(
          index,
          samples,
          curve.duration,
          this.layout,
          this.geometry,
        );
        if (frames == null) {
          return;
        }
        row.style.willChange = 'transform';
        promoted.push(row);
        const keyframes: Keyframe[] = frames.map(frame => ({
          offset: frame.offset * scale,
          transform: frame.transform,
        }));
        keyframes.push({
          offset: 1,
          transform: frames[frames.length - 1].transform,
        });
        animations.push(
          row.animate(keyframes, {duration: totalMs, easing: 'linear'}),
        );
      });
      if (this.strip != null && canAnimate(this.strip)) {
        const frames = stripKeyframes(samples, curve.duration, this.layout);
        const keyframes: Keyframe[] = frames.map(frame => ({
          offset: frame.offset * scale,
          transform: frame.transform,
        }));
        keyframes.push({
          offset: 1,
          transform: frames[frames.length - 1].transform,
        });
        this.strip.style.willChange = 'transform';
        promoted.push(this.strip);
        animations.push(
          this.strip.animate(keyframes, {duration: totalMs, easing: 'linear'}),
        );
      }
    }
    const motion: RunningMotion = {
      curve,
      origin: now(),
      animations,
      promoted,
      timers: [],
      ticks,
      onEnd,
    };
    this.motion = motion;
    // The browser starts animations created in one task together, when it
    // commits them; read that start back so `offset()` follows the screen.
    const first = animations[0];
    if (first != null) {
      first.ready?.then(
        () => {
          if (this.motion === motion && typeof first.startTime === 'number') {
            this.shiftOrigin(motion, first.startTime);
          }
        },
        () => {},
      );
    }
    this.schedule(motion);
  }

  /** Release every resource; the rows stay where they are. */
  dispose(): void {
    const motion = this.motion;
    if (motion != null) {
      const offset = this.offset();
      this.finish(motion);
      this.restingOffset = offset;
    }
  }

  private shiftOrigin(motion: RunningMotion, origin: number): void {
    if (origin === motion.origin) {
      return;
    }
    motion.origin = origin;
    for (const timer of motion.timers) {
      clearTimeout(timer);
    }
    motion.timers.length = 0;
    this.schedule(motion);
  }

  private schedule(motion: RunningMotion): void {
    const elapsed = now() - motion.origin;
    const durationMs = motion.curve.duration * 1000;
    if (motion.ticks && canVibrate()) {
      for (const time of tickTimes(motion.curve, this.layout.rowHeight, {
        last: (this.lastTick - motion.origin) / 1000,
      })) {
        const delay = time * 1000 - elapsed;
        if (delay >= 0) {
          motion.timers.push(
            window.setTimeout(() => {
              this.lastTick = now();
              playHaptic('selection');
            }, delay),
          );
        }
      }
    }
    motion.timers.push(
      window.setTimeout(
        () => {
          if (this.motion !== motion) {
            return;
          }
          this.finish(motion);
          this.restingOffset = motion.curve.to;
          this.render(motion.curve.to, true);
          motion.onEnd?.('arrived', motion.curve.to);
        },
        Math.max(0, durationMs - elapsed),
      ),
    );
  }

  private finish(motion: RunningMotion): void {
    if (this.motion === motion) {
      this.motion = null;
    }
    for (const timer of motion.timers) {
      clearTimeout(timer);
    }
    for (const animation of motion.animations) {
      animation.cancel();
    }
    for (const element of motion.promoted) {
      element.style.willChange = '';
    }
  }

  /** Haptic ticks for rows reached between two drag frames. */
  private tickBetween(from: number, to: number, time: number): void {
    if (!canVibrate() || !reachesRow(from, to, this.layout.rowHeight)) {
      return;
    }
    if (time - this.lastTick < picker.selectionTick.minimumIntervalMs) {
      return;
    }
    this.lastTick = time;
    playHaptic('selection');
  }

  /** Write every row (and the strip) for `offset`; only what changed. */
  private render(offset: number, force = false): void {
    const {layout, geometry} = this;
    for (let index = 0; index < this.rows.length; index++) {
      const angle = rowAngle(rowDistance(index, offset, layout), geometry);
      if (!force && this.written[index] === angle) {
        continue;
      }
      this.written[index] = angle;
      this.rows[index].style.transform = rowTransform(angle);
    }
    if (this.strip != null) {
      this.strip.style.transform = `translateY(${stripTranslation(offset, layout)}px)`;
    }
  }
}
