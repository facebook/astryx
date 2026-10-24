// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelDrum.ts
 * @input A wheel's rows, its offset or a curve of it (wheelPhysics.ts), and
 *   the UIKit picker geometry (motion/uikit/picker.ts)
 * @output Exports the drum's geometry: each row's angle on the cylinder and
 *   its CSS transform, the band copy's translation, which row is under a
 *   point, and the curve baked into keyframes per row so a motion runs on the
 *   compositor
 * @position Rendering math of the Wheel (Wheel.tsx); pure, no DOM
 *
 * UIPickerView draws each row on a cylinder: a row whose centre is d px from
 * the band's (along the list) is turned about x by θ = d ÷ R and moved onto
 * the cylinder, (R sin θ, R (cos θ − 1)). In CSS that is one rotation,
 * `rotateX(−θ)`, about an origin R behind the row
 * (`transform-origin: 50% 50% −R`), the row laid out at the band's centre.
 * The copies above and below the band see it through the picker's
 * perspective; the band's own copy does not, and close to the band the
 * cylinder is flat to a tenth of a pixel, so that copy is a plain strip of
 * rows that translates.
 *
 * Rows beyond a quarter turn face away. They are parked at `PARKED_ANGLE`
 * with `backface-visibility: hidden` rather than turned further: a row two
 * thirds of a turn away would otherwise come round to the front again.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/wheelDrum.test.ts
 * - /packages/core/src/DateInput/Wheel.tsx
 */

import {picker} from '../motion/uikit';
import {
  scaleFor,
  wrapIndex,
  type WheelCurve,
  type WheelLayout,
} from './wheelPhysics';

/** A row turned this far is edge-on or beyond: hidden by its back face. */
export const PARKED_ANGLE = (95 * Math.PI) / 180;

/** Linear interpolation between baked samples stays within this, px. */
export const BAKE_TOLERANCE = 0.05;

/** The drum's size for a wheel with `rowHeight` px rows. */
export interface DrumGeometry {
  readonly rowHeight: number;
  /** Cylinder radius, px. */
  readonly radius: number;
  /** Perspective distance of the dimmed copies, px. */
  readonly perspective: number;
  readonly bandHeight: number;
  readonly bandInset: number;
  /** The picker's height, px. */
  readonly height: number;
  readonly rubberBandDimension: number;
}

/** UIKit's picker geometry scaled to rows `rowHeight` px tall. */
export function drumGeometry(rowHeight: number): DrumGeometry {
  const scale = scaleFor(rowHeight);
  const {geometry} = picker;
  return {
    rowHeight,
    radius: geometry.cylinderRadius * scale,
    perspective: geometry.perspective * scale,
    bandHeight: geometry.bandHeight * scale,
    bandInset: geometry.bandInset * scale,
    height: geometry.height * scale,
    rubberBandDimension: geometry.rubberBandDimension * scale,
  };
}

/**
 * Row `index`'s distance below the band's centre (px) at `offset`. A looping
 * wheel shows each row once, at the copy nearest the band.
 */
export function rowDistance(
  index: number,
  offset: number,
  layout: WheelLayout,
): number {
  const distance = index * layout.rowHeight - offset;
  if (!layout.looping) {
    return distance;
  }
  const cycle = layout.rowCount * layout.rowHeight;
  // Fold into [−cycle / 2, cycle / 2).
  return distance - cycle * Math.floor(distance / cycle + 0.5);
}

/** The angle (radians, positive below the band) of a row `distance` away. */
export function rowAngle(distance: number, geometry: DrumGeometry): number {
  const angle = distance / geometry.radius;
  return Math.max(-PARKED_ANGLE, Math.min(PARKED_ANGLE, angle));
}

/** Whether a row at `angle` faces the viewer. */
export function isRowVisible(angle: number): boolean {
  return Math.abs(angle) < Math.PI / 2;
}

/** CSS transform of a row at `angle` (its origin R behind it). */
export function rowTransform(angle: number): string {
  return `rotateX(${round(-angle, 5)}rad)`;
}

/** CSS transform-origin that puts a row on the cylinder. */
export function rowOrigin(geometry: DrumGeometry): string {
  return `50% 50% ${round(-geometry.radius, 3)}px`;
}

/**
 * The band copy's strip translation for `offset`. A looping strip carries
 * three cycles of rows and translates within the middle one.
 */
export function stripTranslation(offset: number, layout: WheelLayout): number {
  if (!layout.looping) {
    return -offset;
  }
  const cycle = layout.rowCount * layout.rowHeight;
  const folded = offset - cycle * Math.floor(offset / cycle);
  return -(folded + cycle);
}

/**
 * The row whose cylinder position is under a point `dy` px below the band's
 * centre, or null past the drum's top or bottom. Orthographic: the
 * perspective moves rows by under a pixel along y.
 */
export function rowAtPoint(
  dy: number,
  offset: number,
  layout: WheelLayout,
  geometry: DrumGeometry,
): number | null {
  if (Math.abs(dy) >= geometry.radius) {
    return null;
  }
  const distance = geometry.radius * Math.asin(dy / geometry.radius);
  const index = Math.round((offset + distance) / layout.rowHeight);
  if (layout.looping) {
    return wrapIndex(index, layout.rowCount);
  }
  return index >= 0 && index < layout.rowCount ? index : null;
}

/** One baked sample of a curve. */
export interface CurveSample {
  /** Seconds. */
  readonly t: number;
  readonly value: number;
}

/**
 * Samples `curve` over [0, duration] so that linear interpolation between
 * consecutive samples stays within `tolerance` px: bisection wherever the
 * midpoint (and the quarter points) stray further.
 */
export function sampleCurve(
  curve: WheelCurve,
  tolerance: number = BAKE_TOLERANCE,
  maxSamples = 1200,
): CurveSample[] {
  const end = curve.duration;
  if (!(end > 0)) {
    return [{t: 0, value: curve.value(0)}];
  }
  const samples: CurveSample[] = [{t: 0, value: curve.value(0)}];
  const refine = (a: CurveSample, b: CurveSample, depth: number) => {
    const span = b.t - a.t;
    const fits = [0.25, 0.5, 0.75].every(f => {
      const t = a.t + span * f;
      const linear = a.value + (b.value - a.value) * f;
      return Math.abs(curve.value(t) - linear) <= tolerance;
    });
    if (fits || depth >= 16 || samples.length >= maxSamples) {
      samples.push(b);
      return;
    }
    const mid = {t: a.t + span / 2, value: curve.value(a.t + span / 2)};
    refine(a, mid, depth + 1);
    refine(mid, b, depth + 1);
  };
  // Start from 1/60 s segments so a curve with a kink (an edge hit) is
  // never stepped over.
  const segments = Math.max(1, Math.ceil(end * 60));
  let previous = samples[0];
  for (let i = 1; i <= segments; i++) {
    const t = i === segments ? end : (end * i) / segments;
    const next = {t, value: curve.value(t)};
    refine(previous, next, 0);
    previous = next;
  }
  return samples;
}

/** A keyframe of one row's motion. */
export interface RowKeyframe {
  /** Progress through the motion, 0 to 1. */
  readonly offset: number;
  readonly transform: string;
}

/**
 * Row `index`'s keyframes along `samples` (a baked curve lasting `duration`
 * seconds), or null when the row stays parked out of sight throughout.
 * Runs of identical angles collapse to their ends; a looping row that jumps
 * to its other copy while parked gets two keyframes at the same progress, so
 * it never sweeps across the front on the way.
 */
export function rowKeyframes(
  index: number,
  samples: ReadonlyArray<CurveSample>,
  duration: number,
  layout: WheelLayout,
  geometry: DrumGeometry,
): RowKeyframe[] | null {
  const frames: RowKeyframe[] = [];
  let everVisible = false;
  let previousAngle: number | null = null;
  let pendingParked: RowKeyframe | null = null;
  const progress = (t: number) =>
    duration > 0 ? Math.min(1, t / duration) : 1;
  for (const sample of samples) {
    const angle = rowAngle(rowDistance(index, sample.value, layout), geometry);
    const frame = {offset: progress(sample.t), transform: rowTransform(angle)};
    if (isRowVisible(angle)) {
      everVisible = true;
    }
    if (previousAngle != null && angle === previousAngle) {
      // Still parked (or not moving): remember the run's end.
      pendingParked = frame;
      continue;
    }
    if (pendingParked != null) {
      frames.push(pendingParked);
      pendingParked = null;
    }
    if (
      previousAngle != null &&
      Math.abs(angle - previousAngle) > Math.PI &&
      frames.length > 0
    ) {
      // A looping row jumping to its other copy: step at this progress.
      frames.push({
        offset: frame.offset,
        transform: frames[frames.length - 1].transform,
      });
    }
    frames.push(frame);
    previousAngle = angle;
  }
  if (pendingParked != null) {
    frames.push(pendingParked);
  }
  if (!everVisible) {
    return null;
  }
  if (frames.length === 1) {
    frames.push({offset: 1, transform: frames[0].transform});
  }
  return frames;
}

/** The band strip's keyframes along `samples`. */
export function stripKeyframes(
  samples: ReadonlyArray<CurveSample>,
  duration: number,
  layout: WheelLayout,
): {offset: number; transform: string}[] {
  const frames: {offset: number; transform: string}[] = [];
  let previous: number | null = null;
  const cycle = layout.rowCount * layout.rowHeight;
  for (const sample of samples) {
    const y = stripTranslation(sample.value, layout);
    const offset = duration > 0 ? Math.min(1, sample.t / duration) : 1;
    if (
      previous != null &&
      layout.looping &&
      Math.abs(y - previous) > cycle / 2
    ) {
      frames.push({offset, transform: `translateY(${round(previous, 3)}px)`});
    }
    frames.push({offset, transform: `translateY(${round(y, 3)}px)`});
    previous = y;
  }
  if (frames.length === 1) {
    frames.push({offset: 1, transform: frames[0].transform});
  }
  return frames;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
