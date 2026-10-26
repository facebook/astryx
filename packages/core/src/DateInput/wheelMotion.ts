// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelMotion.ts
 * @input A wheel's DOM (its drum rows and its band strip), its layout, and
 *   curves from wheelPhysics.ts
 * @output Exports WheelMotion: the one owner of a wheel's offset. It writes
 *   the rows for a drag frame by frame, plays any curve on the compositor
 *   (baked per row by wheelDrum.ts), reads the offset on screen at any
 *   instant, stops a motion where it is, ticks, and reports arrival
 * @position Imperative engine of the touch picker wheel (PickerWheel.tsx).
 *   Never renders React: a gesture or a motion writes styles and nothing
 *   else
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
 * - /packages/core/src/DateInput/wheelMotion.test.ts
 * - /packages/core/src/DateInput/PickerWheel.tsx
 * - /packages/core/src/DateInput/PickerWheel.test.tsx
 */

import {canVibrate, playHaptic} from '../gestures/haptics';
import {picker} from '../motion/uikit/picker';
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
import {lookKeyframes, rowFrameAt, type WheelLook} from './wheelLook';
import {
  nearestIndex,
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

/** Options for a cross-fade (`WheelMotion.crossFade`). */
export interface CrossFadeOptions {
  /** The whole fade, out and back in, ms (0: land at once). */
  durationMs: number;
  /** Each half's CSS timing function. @default 'linear' */
  easing?: string;
  /** What fades: the drawings of the rows. */
  fade: ReadonlyArray<HTMLElement>;
  /**
   * Called on a main-thread timer at the fade's midpoint, timed from when the
   * fade starts on screen. The rows land on the compositor, so a busy main
   * thread can run it after they have landed.
   */
  onMidpoint?: () => void;
  /** Called once when the fade ends, either way. */
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
  /** Runs once at the curve's midpoint (a cross-fade's landing). */
  readonly midpoint?: () => void;
  midpointDone?: boolean;
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
 * What the player last wrote on an element, as a keyframe: its transform,
 * and its opacity when one is set.
 */
function drawnStyle(element: HTMLElement): Keyframe {
  const {transform, opacity} = element.style;
  return opacity === '' ? {transform} : {transform, opacity};
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
  /** Last angle (or look frame) written per row, so a frame writes only what changed. */
  private written: (number | string | null)[] = [];
  /** The look the rows are drawn in, or null for the drum (wheelDrum.ts). */
  private look: WheelLook | null = null;
  /** Told the row nearest the band whenever it changes. */
  private nearestListener: ((position: number) => void) | null = null;
  private lastNearest: number | null = null;
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
      this.reportNearest(nearestIndex(this.restingOffset, this.layout));
    }
  }

  /**
   * Draw the rows in `look` (wheelLook.ts) instead of on the drum: each row
   * gets its look frame's transform and opacity. Null draws the drum.
   */
  setLook(look: WheelLook | null): void {
    this.look = look;
    this.written = this.rows.map(() => null);
    if (this.motion == null) {
      this.render(this.restingOffset, true);
    }
  }

  /**
   * Tell `listener` the position of the row nearest the band whenever it
   * changes: on a drag frame, where a motion stops or ends, and at rest. A
   * motion itself reports nothing until it ends, so the compositor plays it
   * without the main thread laying out or painting a mark per row.
   */
  onNearestChange(listener: ((position: number) => void) | null): void {
    this.nearestListener = listener;
    this.lastNearest = null;
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
    this.reportNearest(nearestIndex(offset, this.layout));
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
    this.reportNearest(nearestIndex(offset, this.layout));
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
      this.reportNearest(nearestIndex(curve.to, this.layout));
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
    const look = this.look;
    // The strip first: the browser starts animations created in one task
    // together, and the wheel's offset is the strip's.
    if (animated) {
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
    if (animated && look != null) {
      this.rows.forEach((row, index) => {
        const frames = lookKeyframes(
          index,
          samples,
          curve.duration,
          this.layout,
          look,
        );
        if (frames == null) {
          return;
        }
        row.style.willChange = 'transform, opacity';
        promoted.push(row);
        const keyframes: Keyframe[] = frames.map(frame => ({
          offset: frame.offset * scale,
          transform: frame.transform,
          opacity: frame.opacity,
        }));
        const last = frames[frames.length - 1];
        keyframes.push({
          offset: 1,
          transform: last.transform,
          opacity: last.opacity,
        });
        animations.push(
          row.animate(keyframes, {duration: totalMs, easing: 'linear'}),
        );
      });
    } else if (animated) {
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
    this.followStart(motion);
    this.schedule(motion);
  }

  /**
   * Land on `to` without travel, as reduced motion asks
   * (design:reduced-motion DR2): `fade` dips out where the rows are, the
   * rows land on `to` at the midpoint (`onMidpoint` runs on a main-thread
   * timer near it), and `fade` comes back in; nothing is seen to move,
   * `durationMs` in all.
   * Like any motion it ends once (`onEnd`), and `stop` (a finger) ends it
   * where it is shown: before the midpoint the rows have not moved.
   *
   * The landing is baked, as `play()` bakes its end: the destination goes
   * inline first, and each row that moves, and the strip, holds its origin in
   * an animation that steps onto the destination at the midpoint, on the
   * compositor, so a busy main thread never brings the fade back in on the
   * old rows. Without Web Animations (jsdom) the rows land on a timer. The
   * midpoint and the end are timed from when the fade starts on screen, as a
   * `play()`'s end is.
   */
  crossFade(to: number, options: CrossFadeOptions): void {
    const {durationMs, easing = 'linear', fade, onMidpoint, onEnd} = options;
    const from = this.stop();
    this.dragPrevious = null;
    if (!(durationMs > 0) || Math.abs(to - from) < 1e-6) {
      onMidpoint?.();
      this.restingOffset = to;
      this.render(to, true);
      this.reportNearest(nearestIndex(to, this.layout));
      onEnd?.('arrived', to);
      return;
    }
    const duration = durationMs / 1000;
    const curve: WheelCurve = {
      duration,
      to,
      value: t => (t < duration / 2 ? from : to),
      velocity: () => 0,
    };
    const animations = fade
      .filter(canAnimate)
      .map(element =>
        element.animate(
          [{opacity: 1, easing}, {opacity: 0, easing}, {opacity: 1}],
          {duration: durationMs, easing: 'linear'},
        ),
      );
    const promoted: HTMLElement[] = [];
    const baked = this.rows.length > 0 && canAnimate(this.rows[0]);
    if (baked) {
      const moved = this.strip == null ? this.rows : [...this.rows, this.strip];
      const origins = moved.map(element => drawnStyle(element));
      this.restingOffset = to;
      this.render(to, true);
      // Like `play()`, the last keyframe holds past the end.
      const totalMs = durationMs + END_HOLD_MS;
      const midpoint = durationMs / 2 / totalMs;
      moved.forEach((element, index) => {
        const origin = origins[index];
        const destination = drawnStyle(element);
        if (
          !canAnimate(element) ||
          (origin.transform === destination.transform &&
            origin.opacity === destination.opacity)
        ) {
          return;
        }
        element.style.willChange = 'transform';
        promoted.push(element);
        animations.push(
          element.animate(
            [
              {offset: 0, ...origin},
              {offset: midpoint, ...origin},
              {offset: midpoint, ...destination},
              {offset: 1, ...destination},
            ],
            {duration: totalMs, easing: 'linear'},
          ),
        );
      });
    }
    const motion: RunningMotion = {
      curve,
      origin: now(),
      animations,
      promoted,
      timers: [],
      ticks: false,
      onEnd,
      midpoint: () => {
        onMidpoint?.();
        if (!baked) {
          this.render(to, true);
        }
        this.reportNearest(nearestIndex(to, this.layout));
      },
    };
    this.motion = motion;
    this.followStart(motion);
    this.schedule(motion);
  }

  /** Release every resource; the rows stay where they are shown. */
  dispose(): void {
    const motion = this.motion;
    if (motion != null) {
      const offset = this.offset();
      this.finish(motion);
      this.restingOffset = offset;
      this.render(offset, true);
    }
  }

  /**
   * The browser starts animations created in one task together, when it next
   * commits a frame, which a busy main thread delays: read that start back so
   * `offset()` and the timers follow the screen.
   */
  private followStart(motion: RunningMotion): void {
    const first = motion.animations[0];
    first?.ready?.then(
      () => {
        if (this.motion === motion && typeof first.startTime === 'number') {
          this.shiftOrigin(motion, first.startTime);
        }
      },
      () => {
        // Cancelled before it started: time it from now, so it still ends.
        if (this.motion === motion) {
          this.shiftOrigin(motion, now());
        }
      },
    );
  }

  /**
   * Whether the motion's animations are still waiting for the frame that
   * starts them; their start (`followStart`) re-arms the timers then.
   */
  private isPending(motion: RunningMotion): boolean {
    return motion.animations[0]?.pending === true;
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
              if (this.isPending(motion)) {
                return;
              }
              this.lastTick = now();
              playHaptic('selection');
            }, delay),
          );
        }
      }
    }
    if (motion.midpoint != null && motion.midpointDone !== true) {
      motion.timers.push(
        window.setTimeout(
          () => {
            if (
              this.motion !== motion ||
              motion.midpointDone === true ||
              this.isPending(motion)
            ) {
              return;
            }
            motion.midpointDone = true;
            motion.midpoint?.();
          },
          Math.max(0, durationMs / 2 - elapsed),
        ),
      );
    }
    motion.timers.push(
      window.setTimeout(
        () => {
          if (this.motion !== motion || this.isPending(motion)) {
            return;
          }
          this.finish(motion);
          this.restingOffset = motion.curve.to;
          this.render(motion.curve.to, true);
          this.reportNearest(nearestIndex(motion.curve.to, this.layout));
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

  /** Tell the listener the row nearest the band, if it changed. */
  private reportNearest(position: number): void {
    if (position === this.lastNearest) {
      return;
    }
    this.lastNearest = position;
    this.nearestListener?.(position);
  }

  /** Write every row (and the strip) for `offset`; only what changed. */
  private render(offset: number, force = false): void {
    const {layout, geometry, look} = this;
    if (look != null) {
      for (let index = 0; index < this.rows.length; index++) {
        const frame = rowFrameAt(index, offset, layout, look);
        const key = `${frame.transform}|${frame.opacity}`;
        if (!force && this.written[index] === key) {
          continue;
        }
        this.written[index] = key;
        const style = this.rows[index].style;
        style.transform = frame.transform;
        style.opacity = String(frame.opacity);
      }
      if (this.strip != null) {
        this.strip.style.transform = `translateY(${stripTranslation(offset, layout)}px)`;
      }
      return;
    }
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
