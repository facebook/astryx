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

  it('shows each row of a looping wheel once, at the copy nearest the band', () => {
    // Minute 0 at an offset on minute 58 sits two rows below the band.
    expect(rowDistance(0, 58 * 32, LOOPING)).toBe(64);
    expect(rowDistance(58, 0, LOOPING)).toBe(-64);
    expect(rowDistance(30, 0, LOOPING)).toBe(-960);
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
    expect(rowAtPoint(-40, 0, LOOPING, GEOMETRY)).toBe(59);
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

  it('steps a looping row to its other copy while it is out of sight', () => {
    // From minute 58 across 0 to minute 3: minute 30 changes sides behind
    // the drum and must never be drawn on the front on the way.
    const spin = spinCurve(58 * 32, 63 * 32);
    const samples = sampleCurve(spin);
    const frames = rowKeyframes(28, samples, spin.duration, LOOPING, GEOMETRY);
    expect(frames).toBeNull();
    const minute1 = rowKeyframes(1, samples, spin.duration, LOOPING, GEOMETRY)!;
    for (const frame of minute1) {
      expect(frame.transform).not.toContain('NaN');
    }
    // Minute 33 is at the back the whole time: no keyframes. Minute 0 comes
    // into view from below and passes the band.
    const minute0 = rowKeyframes(0, samples, spin.duration, LOOPING, GEOMETRY)!;
    expect(minute0[0].transform).toBe(rowTransform(rowAngle(64, GEOMETRY)));
    expect(minute0[minute0.length - 1].transform).toBe(
      rowTransform(rowAngle(-96, GEOMETRY)),
    );
  });

  it('jumps a parked looping row with two keyframes at the same progress', () => {
    // A long looping spin: row 0 goes once round the back.
    const spin = spinCurve(0, 40 * 32);
    const samples = sampleCurve(spin);
    const frames = rowKeyframes(0, samples, spin.duration, LOOPING, GEOMETRY)!;
    const steps = frames.filter(
      (frame, i) => i > 0 && frame.offset === frames[i - 1].offset,
    );
    expect(steps.length).toBe(1);
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i].offset).toBeGreaterThanOrEqual(frames[i - 1].offset);
    }
  });

  it('translates the band strip with the offset, folding a looping strip', () => {
    expect(stripTranslation(992, MINUTES)).toBe(-992);
    expect(stripTranslation(992, LOOPING)).toBe(-(992 + 1920));
    expect(stripTranslation(-32, LOOPING)).toBe(-(1888 + 1920));
    const spin = spinCurve(58 * 32, 63 * 32);
    const frames = stripKeyframes(sampleCurve(spin), spin.duration, LOOPING);
    const steps = frames.filter(
      (frame, i) => i > 0 && frame.offset === frames[i - 1].offset,
    );
    expect(steps.length).toBe(1);
  });
});
