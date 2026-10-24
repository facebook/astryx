// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelPhysics.ts
 * @input A wheel's offset and release velocity, its rows, and the UIKit
 *   picker constants (motion/uikit/picker.ts)
 * @output Exports the curves a picker wheel moves on: the release plan (a
 *   coast onto a row, a snap, a coast into an end and its bounce, a return
 *   from past an end), the tap spin, the rubber band while dragging, the
 *   release velocity and the row crossings that tick
 * @position Pure math of the Wheel (Wheel.tsx); the drum (wheelDrum.ts)
 *   renders whatever curve this returns
 *
 * Units follow the motion foundation: positions in px, time in seconds,
 * velocities in px/s. The offset is the distance the rows have travelled up:
 * row k sits under the band when the offset is k × the row height. The
 * constants are UIKit's, in pt, scaled by `scale` (the row height over
 * UIKit's 32 pt), so a theme that changes the row height keeps UIKit's
 * motion relative to its rows.
 *
 * What UIKit does, as measured (picker.ts has the numbers and sources):
 *
 * - The release velocity is 0.25 × the pan's velocity plus 0.75 × its value
 *   one event earlier.
 * - Inside the rows, a release slower than `release.minimumSpeed` carries no
 *   velocity. Past an end, the velocity is kept.
 * - The scroll view projects the coast to offset + (v − stopSpeed) ÷ λ,
 *   λ = −ln(scroll.decelerationRate.normal) per ms, and the picker snaps
 *   that to the nearest row. A target among the rows is reached by a coast
 *   that keeps the release velocity and re-solves the rate so that the
 *   speed falls to `stopSpeed` exactly there, where it stops. A projection
 *   past an end is not re-solved: the coast decays at the normal rate into
 *   the end, and the bounce takes its velocity there.
 * - A release without velocity eases onto the nearest row at `snapRate`.
 * - A release past an end returns on the bounce spring.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/wheelPhysics.test.ts
 * - /packages/core/src/DateInput/Wheel.tsx
 */

import {cubicBezier} from '../motion/bezier';
import {solveDecay} from '../motion/decay';
import {rubberBand} from '../motion/rubberBand';
import {solveSpring, toSpring} from '../motion/spring';
import {picker, scroll, timing} from '../motion/uikit';

/** A motion of the wheel's offset, from t = 0 to `duration` (seconds). */
export interface WheelCurve {
  /** Seconds until the wheel is at rest on `to`. */
  readonly duration: number;
  /** Where the motion ends. */
  readonly to: number;
  /** Offset at `t` seconds; `to` from `duration` on. */
  value(t: number): number;
  /** Velocity at `t` seconds, px/s; 0 from `duration` on. */
  velocity(t: number): number;
}

/** How a release moves the wheel. */
export type WheelPlanKind = 'coast' | 'snap' | 'edge' | 'return';

/** What a release does: the curve, and the row it ends on. */
export interface WheelPlan {
  readonly kind: WheelPlanKind;
  /**
   * The row the wheel comes to rest on. With `looping` it can be any
   * integer: the row it shows is `index` modulo the row count.
   */
  readonly index: number;
  readonly curve: WheelCurve;
}

/** The rows a wheel moves over. */
export interface WheelLayout {
  /** Row height, px. */
  readonly rowHeight: number;
  readonly rowCount: number;
  /** Whether the rows repeat without end (minutes, hours). */
  readonly looping?: boolean;
}

/** UIKit's row height in pt: the unit the picker constants are measured in. */
const UIKIT_ROW_HEIGHT = picker.geometry.rowHeight;

/** The normal deceleration constant, per second. */
const NORMAL_LAMBDA = -1000 * Math.log(scroll.decelerationRate.normal);

/** Below half a device pixel at 3×, a motion is on its row. */
const AT_REST_PT = 1 / 6;

/** The constants' scale for a wheel whose rows are `rowHeight` px tall. */
export function scaleFor(rowHeight: number): number {
  return rowHeight / UIKIT_ROW_HEIGHT;
}

/** The wheel at rest on `offset`: a curve that does not move. */
export function restCurve(offset: number): WheelCurve {
  return {
    duration: 0,
    to: offset,
    value: () => offset,
    velocity: () => 0,
  };
}

/**
 * The velocity UIScrollView coasts with, from the pan's velocity at the last
 * event and at the event before it (px/s).
 *
 * @example
 * ```
 * releaseVelocity(1584, 717); // 934 px/s
 * ```
 */
export function releaseVelocity(current: number, previous: number): number {
  const weight = picker.release.currentVelocityWeight;
  return weight * current + (1 - weight) * previous;
}

/** The offsets of the first and last rows; unbounded when looping. */
export function offsetBounds({rowHeight, rowCount, looping}: WheelLayout): {
  min: number;
  max: number;
} {
  if (looping) {
    return {min: -Infinity, max: Infinity};
  }
  return {min: 0, max: Math.max(0, rowCount - 1) * rowHeight};
}

/**
 * The offset a drag shows for the finger's `offset`: past the first or last
 * row it is rubber-banded, as a UIPickerView's table is.
 */
export function dragOffset(offset: number, layout: WheelLayout): number {
  const {min, max} = offsetBounds(layout);
  const dimension =
    picker.geometry.rubberBandDimension * scaleFor(layout.rowHeight);
  if (offset < min) {
    return min + rubberBand(offset - min, dimension);
  }
  if (offset > max) {
    return max + rubberBand(offset - max, dimension);
  }
  return offset;
}

/** The nearest row to `offset` (clamped to the rows unless looping). */
export function nearestIndex(offset: number, layout: WheelLayout): number {
  const index = Math.round(offset / layout.rowHeight);
  if (layout.looping) {
    return index;
  }
  return Math.min(Math.max(index, 0), Math.max(0, layout.rowCount - 1));
}

/** `index` folded onto the rows: the row a looping wheel shows there. */
export function wrapIndex(index: number, rowCount: number): number {
  if (rowCount <= 0) {
    return 0;
  }
  return ((index % rowCount) + rowCount) % rowCount;
}

/**
 * Ease from `from` onto `to` as UIKit does after a release without
 * velocity: e^(−k t) of the distance left, done once within half a device
 * pixel.
 */
export function snapCurve(from: number, to: number, scale = 1): WheelCurve {
  const distance = from - to;
  const rate = picker.snapRate * 1000;
  const epsilon = AT_REST_PT * scale;
  if (Math.abs(distance) <= epsilon) {
    return {
      duration: 0,
      to,
      value: () => to,
      velocity: () => 0,
    };
  }
  const duration = Math.log(Math.abs(distance) / epsilon) / rate;
  return {
    duration,
    to,
    value: t => (t >= duration ? to : to + distance * Math.exp(-rate * t)),
    velocity: t => (t >= duration ? 0 : -rate * distance * Math.exp(-rate * t)),
  };
}

/**
 * A coast from `from` at `velocity` that keeps the velocity and ends on `to`
 * at the stop speed: the rate is re-solved so that the speed falls from
 * |velocity| to the stop speed over exactly `to − from`.
 */
export function coastCurve(
  from: number,
  velocity: number,
  to: number,
  scale = 1,
): WheelCurve {
  const stopSpeed = picker.release.stopSpeed * 1000 * scale;
  const distance = to - from;
  const speed = Math.abs(velocity);
  if (
    distance === 0 ||
    Math.sign(distance) !== Math.sign(velocity) ||
    speed <= stopSpeed
  ) {
    return snapCurve(from, to, scale);
  }
  const direction = Math.sign(distance);
  // Per second: the speed falls by λ × the distance covered.
  const lambda = (speed - stopSpeed) / Math.abs(distance);
  const duration = Math.log(speed / stopSpeed) / lambda;
  return {
    duration,
    to,
    value: t =>
      t >= duration
        ? to
        : from + (direction * speed * -Math.expm1(-lambda * t)) / lambda,
    velocity: t =>
      t >= duration ? 0 : direction * speed * Math.exp(-lambda * t),
  };
}

/** The bounce spring, from `from` with `velocity`, onto `to`. */
export function bounceCurve(
  from: number,
  velocity: number,
  to: number,
  scale = 1,
): WheelCurve {
  const spring = solveSpring(toSpring(scroll.bounce), {
    from,
    to,
    velocity,
  });
  const duration = spring.settleTime(AT_REST_PT * scale);
  return {
    duration,
    to,
    value: t => (t >= duration ? to : spring.value(t)),
    velocity: t => (t >= duration ? 0 : spring.velocity(t)),
  };
}

/**
 * A coast that runs into an end: the normal decay until the offset reaches
 * `edge`, then the bounce spring with the velocity it has there.
 */
export function edgeCurve(
  from: number,
  velocity: number,
  edge: number,
  scale = 1,
): WheelCurve {
  const decay = solveDecay({from, velocity});
  const hit = decay.timeToReach(edge);
  if (hit == null) {
    return bounceCurve(from, velocity, edge, scale);
  }
  const bounce = bounceCurve(edge, decay.velocity(hit), edge, scale);
  return {
    duration: hit + bounce.duration,
    to: edge,
    value: t => (t < hit ? decay.value(t) : bounce.value(t - hit)),
    velocity: t => (t < hit ? decay.velocity(t) : bounce.velocity(t - hit)),
  };
}

/**
 * Where the scroll view projects a release: the coast's rest point at the
 * normal rate, short of the stop speed.
 */
export function projectRelease(
  offset: number,
  velocity: number,
  scale = 1,
): number {
  const stopSpeed = picker.release.stopSpeed * 1000 * scale;
  const speed = Math.abs(velocity);
  if (speed <= stopSpeed) {
    return offset;
  }
  return offset + (Math.sign(velocity) * (speed - stopSpeed)) / NORMAL_LAMBDA;
}

/**
 * What the wheel does when the finger lifts at `offset` with `velocity`
 * (px/s, positive when the rows move up).
 *
 * @example
 * ```
 * const plan = planRelease(963.67, 933.4, {rowHeight: 32, rowCount: 60});
 * plan.index; // 45: the coast stops on row 45 after about 2.3 s
 * ```
 */
export function planRelease(
  offset: number,
  velocity: number,
  layout: WheelLayout,
): WheelPlan {
  const scale = scaleFor(layout.rowHeight);
  const {min, max} = offsetBounds(layout);
  if (offset < min || offset > max) {
    const edge = offset < min ? min : max;
    return {
      kind: 'return',
      index: nearestIndex(edge, layout),
      curve: bounceCurve(offset, velocity, edge, scale),
    };
  }
  const minimumSpeed = picker.release.minimumSpeed * 1000 * scale;
  const speed = Math.abs(velocity) < minimumSpeed ? 0 : velocity;
  const projected = projectRelease(offset, speed, scale);
  if (projected < min || projected > max) {
    const edge = projected < min ? min : max;
    return {
      kind: 'edge',
      index: nearestIndex(edge, layout),
      curve: edgeCurve(offset, speed, edge, scale),
    };
  }
  const index = nearestIndex(projected, layout);
  const target = index * layout.rowHeight;
  if (speed === 0) {
    return {kind: 'snap', index, curve: snapCurve(offset, target, scale)};
  }
  const curve = coastCurve(offset, speed, target, scale);
  return {kind: curve.duration > 0 ? 'coast' : 'snap', index, curve};
}

/**
 * The tap spin onto a row: setContentOffset animated, 0.3 s on Core
 * Animation's ease-in-ease-out.
 */
export function spinCurve(
  from: number,
  to: number,
  duration: number = picker.tapSpin.durationMs / 1000,
  curve: readonly [number, number, number, number] = timing.curves.easeInOut,
): WheelCurve {
  if (from === to || !(duration > 0)) {
    return restCurve(to);
  }
  const ease = cubicBezier(curve);
  const distance = to - from;
  // Velocity from the eased progress's slope, by a central difference.
  const step = 1e-4;
  return {
    duration,
    to,
    value: t => (t >= duration ? to : from + distance * ease(t / duration)),
    velocity: t => {
      if (t >= duration || t < 0) {
        return 0;
      }
      const a = ease(Math.max(0, t / duration - step));
      const b = ease(Math.min(1, t / duration + step));
      return (distance * (b - a)) / (2 * step * duration);
    },
  };
}

/**
 * The times (seconds, ascending) at which a row's centre reaches the band's
 * centre during `curve`, after `after` and up to `until`, thinned so that two
 * are never closer than the selection tick's minimum interval. `last` is the
 * time of the previous tick, if any. Leaving the row the wheel starts on is
 * not a tick; reaching the next one is.
 */
export function tickTimes(
  curve: WheelCurve,
  rowHeight: number,
  {
    after = 0,
    until = curve.duration,
    last = -Infinity,
    step = 1 / 240,
  }: {after?: number; until?: number; last?: number; step?: number} = {},
): number[] {
  const interval = picker.selectionTick.minimumIntervalMs / 1000;
  const times: number[] = [];
  let previous = curve.value(after);
  let lastTick = last;
  for (let t = after + step; t < until + step; t += step) {
    const time = Math.min(t, until);
    const value = curve.value(time);
    if (reachesRow(previous, value, rowHeight) && time - lastTick >= interval) {
      times.push(time);
      lastTick = time;
    }
    previous = value;
    if (time === until) {
      break;
    }
  }
  return times;
}

/**
 * Whether moving from offset `from` to `to` brings a row's centre onto the
 * band's: a multiple of `rowHeight` in (from, to] moving up, or in [to, from)
 * moving down.
 */
export function reachesRow(
  from: number,
  to: number,
  rowHeight: number,
): boolean {
  if (to > from) {
    return Math.floor(to / rowHeight) > Math.floor(from / rowHeight);
  }
  if (to < from) {
    return Math.ceil(to / rowHeight) < Math.ceil(from / rowHeight);
  }
  return false;
}
