// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelDrum.test.ts
 * @input wheelDrum.ts and wheelPhysics.ts, and a UIPickerView's cell
 *   transforms read at rest
 * @output Proves the drum puts rows where UIKit's cylinder does, and that a
 *   baked motion stays within tolerance, never sweeps a parked row across the
 *   front, and leaves rows that never show without animations
 * @position Unit coverage for DateInput/wheelDrum.ts
 */

import {describe, expect, it} from 'vitest';
import {
  BAKE_TOLERANCE,
  PARKED_ANGLE,
  drumGeometry,
  isRowVisible,
  rowAngle,
  rowAtPoint,
  rowDistance,
  rowKeyframes,
  rowOrigin,
  rowTransform,
  sampleCurve,
  stripKeyframes,
  stripTranslation,
} from './wheelDrum';
import {planRelease, spinCurve, type WheelLayout} from './wheelPhysics';

const MINUTES: WheelLayout = {rowHeight: 32, rowCount: 60};
const LOOPING: WheelLayout = {...MINUTES, looping: true};
const GEOMETRY = drumGeometry(32);

/** Where CSS puts a row's centre: rotateX(−θ) about an origin R behind it. */
function cylinderPosition(angle: number, radius: number) {
  return {y: radius * Math.sin(angle), z: radius * (Math.cos(angle) - 1)};
}

describe('the drum at rest', () => {
  it('turns rows ±1 to ±4 as UIPickerView does', () => {
    // UIKit's cell transforms: rotations of 18.85, 37.8, 56.7 and 75.7°
    // (18.92° a row; its depths fit R = 97.2, which gives 18.86°).
    const measured = [18.85, 37.8, 56.7, 75.7];
    measured.forEach((degrees, i) => {
      const angle = rowAngle(
        rowDistance(31 + i + 1, 31 * 32, MINUTES),
        GEOMETRY,
      );
      expect(Math.abs((angle * 180) / Math.PI - degrees)).toBeLessThan(0.3);
      const above = rowAngle(
        rowDistance(31 - i - 1, 31 * 32, MINUTES),
        GEOMETRY,
      );
      expect(above).toBeCloseTo(-angle, 12);
    });
  });

  it('moves rows onto the cylinder where UIKit’s cells sit', () => {
    // UIKit's cells, relative to the band: depth −5.2, −20.4, −43.9, −73.2
    // pt; along y 32k minus 0.41, 4.23, 14.5, 33.6 pt (at a rest offset a
    // fraction of a point off the row).
    const depth = [-5.2, -20.4, -43.9, -73.2];
    const pull = [0.41, 4.23, 14.5, 33.6];
    depth.forEach((z, i) => {
      const k = i + 1;
      const position = cylinderPosition(
        rowAngle(k * 32, GEOMETRY),
        GEOMETRY.radius,
      );
      expect(Math.abs(position.z - z)).toBeLessThan(0.5);
      expect(Math.abs(position.y - (32 * k - pull[i]))).toBeLessThan(0.4);
    });
  });

  it('writes the turn as one rotation about an origin R behind the row', () => {
    expect(rowOrigin(GEOMETRY)).toBe('50% 50% -97.2px');
    expect(rowTransform(32 / 97.2)).toBe('rotateX(-0.32922rad)');
  });

  it('parks rows past a quarter turn instead of turning them round', () => {
    const angle = rowAngle(400, GEOMETRY);
    expect(angle).toBe(PARKED_ANGLE);
    expect(isRowVisible(angle)).toBe(false);
    expect(isRowVisible(rowAngle(140, GEOMETRY))).toBe(true);
  });

  it('scales the whole drum with the row height', () => {
    const geometry = drumGeometry(28);
    expect(geometry.radius).toBeCloseTo(85.05, 2);
    expect(geometry.height).toBe(189);
    expect(rowAngle(28, geometry)).toBeCloseTo(rowAngle(32, GEOMETRY), 12);
  });

  it('draws each copy of a looping wheel at its own position', () => {
    // Minute 0's next copy (position 60) at an offset on minute 58 sits two
    // rows below the band; minute 58's copy above minute 0, two rows above.
    expect(rowDistance(60, 58 * 32, LOOPING)).toBe(64);
    expect(rowDistance(-2, 0, LOOPING)).toBe(-64);
    expect(rowDistance(30, 0, LOOPING)).toBe(960);
    // A minute column every 15 minutes, on :45: its 45 shows again four rows
    // above and four below, as UIPickerView's looping table draws it.
    const quarters = {rowHeight: 32, rowCount: 4, looping: true};
    expect(rowDistance(7, 3 * 32, quarters)).toBe(128);
    expect(rowDistance(-1, 3 * 32, quarters)).toBe(-128);
  });
});

describe('which row is under a point', () => {
  it('inverts the cylinder', () => {
    const y = GEOMETRY.radius * Math.sin(32 / GEOMETRY.radius);
    expect(rowAtPoint(y, 31 * 32, MINUTES, GEOMETRY)).toBe(32);
    expect(rowAtPoint(-y, 31 * 32, MINUTES, GEOMETRY)).toBe(30);
    expect(rowAtPoint(0, 31 * 32, MINUTES, GEOMETRY)).toBe(31);
  });

  it('finds nothing past the drum or past the rows', () => {
    expect(
      rowAtPoint(GEOMETRY.radius + 1, 31 * 32, MINUTES, GEOMETRY),
    ).toBeNull();
    expect(rowAtPoint(-40, 0, MINUTES, GEOMETRY)).toBeNull();
    // On a looping wheel, the copy's own position: minute 59 above minute 0.
    expect(rowAtPoint(-40, 0, LOOPING, GEOMETRY)).toBe(-1);
  });
});

describe('a baked motion', () => {
  const coast = planRelease(1110, 1016.2, MINUTES).curve;

  it('stays within the tolerance between samples', () => {
    const samples = sampleCurve(coast);
    expect(samples[0].t).toBe(0);
    expect(samples[samples.length - 1].t).toBe(coast.duration);
    expect(samples.length).toBeLessThan(400);
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1];
      const b = samples[i];
      for (const f of [0.1, 0.33, 0.5, 0.66, 0.9]) {
        const t = a.t + (b.t - a.t) * f;
        const linear = a.value + (b.value - a.value) * f;
        expect(Math.abs(coast.value(t) - linear)).toBeLessThanOrEqual(
          BAKE_TOLERANCE * 1.5,
        );
      }
    }
  });

  it('animates only the rows that show during the motion', () => {
    const samples = sampleCurve(coast);
    // Rows 30 to 55 show at some point between row 34.7 and row 50.
    expect(
      rowKeyframes(10, samples, coast.duration, MINUTES, GEOMETRY),
    ).toBeNull();
    expect(
      rowKeyframes(59, samples, coast.duration, MINUTES, GEOMETRY),
    ).toBeNull();
    const row40 = rowKeyframes(40, samples, coast.duration, MINUTES, GEOMETRY);
    expect(row40).not.toBeNull();
    expect(row40![0].offset).toBe(0);
    expect(row40![row40!.length - 1].offset).toBe(1);
    // It ends parked above the band, where row 40 sits when row 50 is on it.
    expect(row40![row40!.length - 1].transform).toBe(
      rowTransform(-PARKED_ANGLE),
    );
    const row50 = rowKeyframes(50, samples, coast.duration, MINUTES, GEOMETRY);
    expect(row50![row50!.length - 1].transform).toBe(rowTransform(0));
  });

  it('moves a looping copy on from its own position across the seam', () => {
    // From minute 58 across 0 to minute 3. Minute 28 stays at the back: no
    // keyframes.
    const spin = spinCurve(58 * 32, 63 * 32);
    const samples = sampleCurve(spin);
    expect(
      rowKeyframes(28, samples, spin.duration, LOOPING, GEOMETRY),
    ).toBeNull();
    const minute1 = rowKeyframes(
      61,
      samples,
      spin.duration,
      LOOPING,
      GEOMETRY,
    )!;
    for (const frame of minute1) {
      expect(frame.transform).not.toContain('NaN');
    }
    // Minute 0 past the seam (position 60) comes into view from below and
    // passes the band.
    const minute0 = rowKeyframes(
      60,
      samples,
      spin.duration,
      LOOPING,
      GEOMETRY,
    )!;
    expect(minute0[0].transform).toBe(rowTransform(rowAngle(64, GEOMETRY)));
    expect(minute0[minute0.length - 1].transform).toBe(
      rowTransform(rowAngle(-96, GEOMETRY)),
    );
  });

  it('parks a looping copy that leaves the drum, with no jump', () => {
    // A long looping spin: the copy at position 0 turns up off the drum and
    // stays parked; the copies further on have positions of their own.
    const spin = spinCurve(0, 40 * 32);
    const samples = sampleCurve(spin);
    const frames = rowKeyframes(0, samples, spin.duration, LOOPING, GEOMETRY)!;
    expect(frames[0].transform).toBe(rowTransform(0));
    expect(frames.at(-1)!.transform).toBe(
      rowTransform(rowAngle(-40 * 32, GEOMETRY)),
    );
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i].offset).toBeGreaterThan(frames[i - 1].offset);
    }
  });

  it('translates the band strip with the offset itself, past either end of a looping wheel', () => {
    expect(stripTranslation(992)).toBe(-992);
    // A looping spin from minute 58 across the seam to 03 moves the strip
    // straight on: its rows sit at their positions past the end (60 → 00).
    const spin = spinCurve(58 * 32, 63 * 32);
    const frames = stripKeyframes(sampleCurve(spin), spin.duration);
    expect(frames[0].transform).toBe('translateY(-1856px)');
    expect(frames.at(-1)!.transform).toBe('translateY(-2016px)');
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i].offset).toBeGreaterThanOrEqual(frames[i - 1].offset);
    }
  });
});
