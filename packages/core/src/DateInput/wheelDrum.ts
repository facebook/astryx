// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelDrum.ts
 * @input A wheel's rows, its offset or a curve of it (wheelPhysics.ts), and
 *   the UIKit picker geometry (motion/uikit/picker.ts)
 * @output Exports the drum's geometry: each row's angle on the cylinder and
 *   its CSS transform, where a row is drawn through the perspective, the band
 *   copy's translation, which row is drawn under a point, and the curve baked
 *   into keyframes per row so a motion runs on the compositor
 * @position Rendering math of the touch picker wheel (PickerWheel.tsx); pure,
 *   no DOM
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
 * - /packages/core/src/DateInput/PickerWheel.tsx
 */

import {picker} from '../motion/uikit/picker';
import {scaleFor, type WheelCurve, type WheelLayout} from './wheelPhysics';

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
 * The distance (px) below the band's centre, at `offset`, of the row drawn at
 * `position` along the wheel: its option index, or on a looping wheel any
 * integer. A looping wheel draws one row per position, so every copy of an
 * option has its own and a short list repeats around the cylinder, as
 * UIPickerView's looping table does.
 */
export function rowDistance(
  position: number,
  offset: number,
  layout: WheelLayout,
): number {
  return position * layout.rowHeight - offset;
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
 * The band copy's strip translation for `offset`. The strip's rows sit at
 * their positions along the wheel (position × row height, a looping wheel's
 * positions running past either end), so the strip moves with the offset
 * itself, unfolded.
 */
export function stripTranslation(offset: number): number {
  return -offset;
}

/** Where a row is drawn along y, from the band's centre, px. */
export interface RowExtent {
  readonly top: number;
  readonly bottom: number;
}

/**
 * Where a row at `angle` is drawn: laid out at the band's centre, turned by
 * `rowTransform(angle)` about the origin `rowOrigin` puts R behind it, and
 * seen through the picker's perspective from the band's centre. Near the
 * drum's edge the perspective draws a row several px nearer the band than
 * the cylinder alone would (7 px for the fourth row).
 */
export function rowExtent(angle: number, geometry: DrumGeometry): RowExtent {
  const {radius, perspective, rowHeight} = geometry;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // An edge `y` from the row's centre, R in front of the origin, turned
  // about x by −angle; then its depth from the layout plane sets its scale.
  const drawn = (y: number) => {
    const turnedY = y * cos + radius * sin;
    const depth = radius * cos - y * sin - radius;
    return (turnedY * perspective) / (perspective - depth);
  };
  return {top: drawn(-rowHeight / 2), bottom: drawn(rowHeight / 2)};
}

/**
 * The position of the row drawn under a point `dy` px below the band's
 * centre (an option index, or on a looping wheel the copy's own position),
 * or null where none is. Inside the band its flat copy shows (the drum is cut
 * away there), so the band strip's row. Outside it, the drum's rows where
 * `rowExtent` draws them; a point in the sliver between two of them takes the
 * nearer, and a point past the outermost one finds nothing.
 */
export function rowAtPoint(
  dy: number,
  offset: number,
  layout: WheelLayout,
  geometry: DrumGeometry,
): number | null {
  const {rowHeight} = layout;
  if (Math.abs(dy) < geometry.bandHeight / 2) {
    return rowAtPosition(Math.round((offset + dy) / rowHeight), layout);
  }
  // Rows within a quarter turn face the viewer; the rest are not drawn.
  const reach = Math.ceil((geometry.radius * Math.PI) / 2 / rowHeight) + 1;
  const centre = Math.round(offset / rowHeight);
  let nearest: number | null = null;
  let nearestGap = Infinity;
  let drawnAbove = false;
  let drawnBelow = false;
  for (let position = centre - reach; position <= centre + reach; position++) {
    if (rowAtPosition(position, layout) == null) {
      continue;
    }
    const angle = rowAngle(rowDistance(position, offset, layout), geometry);
    if (!isRowVisible(angle)) {
      continue;
    }
    const {top, bottom} = rowExtent(angle, geometry);
    if (dy >= top && dy <= bottom) {
      return position;
    }
    drawnAbove ||= bottom < dy;
    drawnBelow ||= top > dy;
    const gap = dy < top ? top - dy : dy - bottom;
    if (gap < nearestGap) {
      nearestGap = gap;
      nearest = position;
    }
  }
  return drawnAbove && drawnBelow ? nearest : null;
}

/**
 * The position a row is drawn at, or null where none is: a looping wheel
 * draws a copy at every position, a list only its own rows.
 */
function rowAtPosition(position: number, layout: WheelLayout): number | null {
  if (layout.looping) {
    return position;
  }
  return position >= 0 && position < layout.rowCount ? position : null;
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
 * The keyframes of the row at `position` along `samples` (a baked curve
 * lasting `duration` seconds), or null when the row stays parked out of sight
 * throughout. Runs of identical angles collapse to their ends.
 */
export function rowKeyframes(
  position: number,
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
    const angle = rowAngle(
      rowDistance(position, sample.value, layout),
      geometry,
    );
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
): {offset: number; transform: string}[] {
  const frames: {offset: number; transform: string}[] = [];
  for (const sample of samples) {
    const y = stripTranslation(sample.value);
    const offset = duration > 0 ? Math.min(1, sample.t / duration) : 1;
    frames.push({offset, transform: `translateY(${round(y, 3)}px)`});
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
