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
  type CurveSample,
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
  /** The curve's samples, kept to bake rows that mount while it plays. */
  readonly samples: ReadonlyArray<CurveSample>;
  /** The animations by row index, and the strip's. */
  readonly rowAnimations: Map<number, Animation>;
  stripAnimation: Animation | null;
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

/**
 * One element's animation along a curve lasting `duration` seconds, its last
 * keyframe held for `END_HOLD_MS` past the end, the element promoted to its
 * own layer while it plays.
 */
function bake(
  element: HTMLElement,
  frames: ReadonlyArray<{offset: number; transform: string}>,
  duration: number,
): Animation {
  const durationMs = duration * 1000;
  const totalMs = durationMs + END_HOLD_MS;
  const scale = durationMs / totalMs;
  const keyframes: Keyframe[] = frames.map(frame => ({
    offset: frame.offset * scale,
    transform: frame.transform,
  }));
  keyframes.push({offset: 1, transform: frames[frames.length - 1].transform});
  element.style.willChange = 'transform';
  return element.animate(keyframes, {duration: totalMs, easing: 'linear'});
}

/** The element an animation moves. */
function targetOf(animation: Animation): Element | null {
  const effect = animation.effect;
  return effect instanceof KeyframeEffect ? effect.target : null;
}

/** Cancel an animation and drop its element's layer. */
function release(animation: Animation): void {
  animation.cancel();
  const target = targetOf(animation);
  if (target instanceof HTMLElement) {
    target.style.willChange = '';
  }
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
 * motion.attach(new Map([[29, row29], [30, row30], [31, row31]]), strip);
 * motion.setOffset(30 * 32);
 * motion.play(planRelease(motion.offset(), 900, layout).curve, {ticks: true});
 * ```
 */
export class WheelMotion {
  private layout: WheelLayout;
  private geometry: DrumGeometry;
  /** The mounted rows by option index (the Wheel mounts a window of them). */
  private rows: ReadonlyMap<number, HTMLElement> = new Map();
  private strip: HTMLElement | null = null;
  private restingOffset = 0;
  private motion: RunningMotion | null = null;
  /** Last angle written per row, so a frame writes only what changed. */
  private written = new Map<number, number>();
  private lastTick = -Infinity;
  /** Last offset a drag frame showed, for its ticks. */
  private dragPrevious: number | null = null;

  constructor(layout: WheelLayout) {
    this.layout = layout;
    this.geometry = drumGeometry(layout.rowHeight);
  }

  /**
   * The drum's mounted rows, by option index, and the band's strip. A
   * running motion carries on through a re-attach: the rows it already
   * animates keep their animations (an owner re-rendered, say with other
   * rows disabled), rows that unmounted lose theirs, and rows that mounted
   * join it in step.
   */
  attach(
    rows: ReadonlyMap<number, HTMLElement>,
    strip: HTMLElement | null,
  ): void {
    this.rows = rows;
    this.strip = strip;
    this.written = new Map();
    const motion = this.motion;
    if (motion == null) {
      this.render(this.restingOffset);
      return;
    }
    for (const [index, animation] of motion.rowAnimations) {
      if (rows.get(index) !== targetOf(animation)) {
        release(animation);
        motion.rowAnimations.delete(index);
      }
    }
    for (const [index, row] of rows) {
      if (motion.rowAnimations.has(index)) {
        continue;
      }
      // The end state inline first, as for every row of a motion.
      const angle = rowAngle(
        rowDistance(index, motion.curve.to, this.layout),
        this.geometry,
      );
      row.style.transform = rowTransform(angle);
      this.written.set(index, angle);
      const animation = this.animateRow(motion, index, row);
      if (animation != null) {
        animation.startTime = motion.origin;
        motion.rowAnimations.set(index, animation);
      }
    }
    if (
      motion.stripAnimation != null &&
      targetOf(motion.stripAnimation) !== strip
    ) {
      release(motion.stripAnimation);
      motion.stripAnimation = null;
    }
    if (motion.stripAnimation == null && strip != null) {
      strip.style.transform = `translateY(${stripTranslation(motion.curve.to)}px)`;
      motion.stripAnimation = this.animateStrip(motion, strip);
      if (motion.stripAnimation != null) {
        motion.stripAnimation.startTime = motion.origin;
      }
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
      this.written = new Map();
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
    // The end state goes inline first: whatever the animations do, the rows
    // rest there once they are gone.
    this.restingOffset = curve.to;
    this.render(curve.to);
    const motion: RunningMotion = {
      curve,
      origin: now(),
      samples: sampleCurve(curve),
      rowAnimations: new Map(),
      stripAnimation: null,
      timers: [],
      ticks,
      onEnd,
    };
    this.motion = motion;
    this.rows.forEach((row, index) => {
      const animation = this.animateRow(motion, index, row);
      if (animation != null) {
        motion.rowAnimations.set(index, animation);
      }
    });
    if (this.strip != null) {
      motion.stripAnimation = this.animateStrip(motion, this.strip);
    }
    // The browser starts animations created in one task together, when it
    // commits them; read that start back so `offset()` follows the screen.
    const first =
      motion.rowAnimations.values().next().value ?? motion.stripAnimation;
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

  /** Row `index`'s animation along `motion`, or null when it stays parked. */
  private animateRow(
    motion: RunningMotion,
    index: number,
    row: HTMLElement,
  ): Animation | null {
    if (!canAnimate(row)) {
      return null;
    }
    const frames = rowKeyframes(
      index,
      motion.samples,
      motion.curve.duration,
      this.layout,
      this.geometry,
    );
    return frames == null ? null : bake(row, frames, motion.curve.duration);
  }

  /** The band strip's animation along `motion`. */
  private animateStrip(
    motion: RunningMotion,
    strip: HTMLElement,
  ): Animation | null {
    return canAnimate(strip)
      ? bake(
          strip,
          stripKeyframes(motion.samples, motion.curve.duration),
          motion.curve.duration,
        )
      : null;
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
    for (const animation of motion.rowAnimations.values()) {
      release(animation);
    }
    motion.rowAnimations.clear();
    if (motion.stripAnimation != null) {
      release(motion.stripAnimation);
      motion.stripAnimation = null;
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
    for (const [index, row] of this.rows) {
      const angle = rowAngle(rowDistance(index, offset, layout), geometry);
      if (!force && this.written.get(index) === angle) {
        continue;
      }
      this.written.set(index, angle);
      row.style.transform = rowTransform(angle);
    }
    if (this.strip != null) {
      this.strip.style.transform = `translateY(${stripTranslation(offset)}px)`;
    }
  }
}
