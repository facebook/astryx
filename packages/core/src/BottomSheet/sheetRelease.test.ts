// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sheetRelease.test.ts
 * @input vitest, resolveSheetRelease and the UIKit constants table
 * @output Holds the release rule to UIKit's own releases: 47 drags of a
 *   UISheetPresentationController `[.medium(), .large()]` sheet read from
 *   UIKit (offset and velocity of the sheet interaction's last drag update
 *   before the lift, the detent it settled on, the damping of the spring it
 *   attached); plus the rule's own edges
 * @position Testing; pure, no DOM
 */

import {describe, expect, it} from 'vitest';
import {sheet, springs} from '../motion/uikit';
import {resolveSheetRelease} from './sheetRelease';

/**
 * Measured on the iOS 26.2 simulator (iPhone 17 Pro, 402 × 874 pt), in
 * UIKit's own interaction offsets: the sheet's top at the large detent is at
 * 62 pt, at the medium detent 404.32 pt, and gone at 874 pt.
 * [case, offset at the lift (pt), velocity (pt/s, + = down), outcome, ζ of
 * the release spring (null: a translate release, whose spring was not read)]
 */
const UIKIT_RELEASES: ReadonlyArray<
  [string, number, number, 'large' | 'medium' | 'dismissed', number | null]
> = [
  ['off-300.v0', 120.99, -12.5, 'large', 1],
  ['off-300.v500', 122.65, -481.4, 'large', 1],
  ['off-300.v1500', 116.65, -1495.6, 'large', 0.8],
  ['off-300.v3000', 129.32, -2903.5, 'large', 0.8],
  ['off-230.v0', 184.32, 0, 'large', 1],
  ['off-230.v500', 188.65, -472, 'large', 1],
  ['off-230.v1500', 199.65, -1590, 'large', 0.8],
  ['off-230.v3000', 225.65, -4037.7, 'large', 0.8],
  ['off-170.v0', 244.32, 0, 'medium', 1],
  ['off-170.v500', 250.99, -494.8, 'large', 1],
  ['off-170.v1500', 282.99, -2323, 'large', 0.8],
  ['off-170.v3000', 258.65, -3292.1, 'large', 0.8],
  ['off-120.v0', 294.32, 0, 'medium', 1],
  ['off-120.v500', 300.65, -466, 'medium', 1],
  ['off-120.v1500', 296.32, -2209.6, 'large', 0.8],
  ['off-120.v3000', 356.32, -686.1, 'medium', 1],
  ['off-60.v0', 354.32, 0, 'medium', 1],
  ['off-60.v500', 365.65, -493.5, 'medium', 1],
  ['off-60.v1500', 368.32, -574.9, 'medium', 1],
  ['off60.v0', 454.32, 0, 'medium', null],
  ['off60.v500', 446.99, 481.5, 'medium', null],
  ['off60.v1500', 428.32, 450.6, 'medium', null],
  ['off120.v0', 514.32, 0, 'medium', null],
  ['off120.v500', 503.65, 453.3, 'medium', null],
  ['off120.v1500', 512.32, 1969.9, 'dismissed', null],
  ['off120.v3000', 476.32, 1139.7, 'dismissed', null],
  ['off200.v0', 594.32, 0, 'medium', null],
  ['off200.v500', 583.65, 494.5, 'medium', null],
  ['off200.v1500', 579.32, 1400, 'dismissed', null],
  ['off200.v3000', 579.32, 3094.6, 'dismissed', null],
  ['off300.v0', 694.32, 0, 'dismissed', null],
  ['off300.v500', 687.65, 478.4, 'dismissed', null],
  ['off300.v1500', 666.65, 1489.2, 'dismissed', null],
  ['off300.v3000', 679.32, 3008.2, 'dismissed', null],
  ['up.end356.v900', 351.65, -926.5, 'medium', 1],
  ['up.end356.v1000', 352.65, -996.7, 'medium', 1],
  ['down.end500.v1000', 501.99, 991, 'medium', null],
  ['down.end500.v1200', 500.65, 1212.4, 'dismissed', null],
  ['up.long.v400', 277.65, -381.2, 'medium', 1],
  ['down.end600.v200', 590.32, 210.5, 'medium', null],
  ['zeta.towardLarge.v720', 160.32, -726.6, 'large', 1],
  ['zeta.towardLarge.v760', 160.65, -736.9, 'large', 1],
  ['zeta.towardLarge.v800', 167.65, -746.9, 'large', 1],
  ['zeta.towardLarge.v840', 161.32, -837.8, 'large', 1],
  ['zeta.awayFromTarget.v760', 224.32, 801.4, 'medium', 1],
  ['zeta.awayFromTarget.v840', 224.32, 1147.3, 'medium', 0.8],
  ['zeta.awayFromTarget.v1000', 208.32, 76, 'large', 1],
];

const LARGE = 62;
const MEDIUM = 404.32;
const GONE = 874;
const MEDIUM_GONE_BOUNDARY = (MEDIUM + GONE) / 2;

/**
 * The releases the rule does not reproduce, and why. The first two land on
 * opposite sides of the medium / dismissed boundary less than 1 pt from it
 * and from each other: one needs a projection time of at least 0.1145 s, the
 * other at most 0.1120 s, so no single value separates them (the noise of the
 * velocity reading). The third's last drag update read 1140 pt/s for a
 * 3000 pt/s injection (its siblings read ~3000): an under-read, not a rule.
 */
const KNOWN_MISSES: Record<string, 'boundary' | 'under-read'> = {
  'down.end500.v1200': 'boundary',
  'off200.v500': 'boundary',
  'off120.v3000': 'under-read',
};

describe('resolveSheetRelease against UIKit', () => {
  for (const [name, offset, velocity, outcome, zeta] of UIKIT_RELEASES) {
    it(`${name}: ${velocity} pt/s from ${offset} pt → ${outcome}`, () => {
      const release = resolveSheetRelease({
        detents: [LARGE, MEDIUM],
        dismissedOffset: GONE,
        position: offset,
        velocity,
      });
      const landed =
        release.kind === 'dismiss'
          ? 'dismissed'
          : release.index === 0
            ? 'large'
            : 'medium';
      const miss = KNOWN_MISSES[name];
      if (miss === 'boundary') {
        expect(landed).not.toBe(outcome);
        expect(Math.abs(release.projected - MEDIUM_GONE_BOUNDARY)).toBeLessThan(
          1,
        );
      } else if (miss === 'under-read') {
        expect(landed).not.toBe(outcome);
      } else {
        expect(landed).toBe(outcome);
      }
      if (zeta != null) {
        expect(release.spring).toBe(
          zeta === 1 ? springs.sheetDetent : springs.sheetReleaseFast,
        );
      }
    });
  }

  it('reproduces all but the three releases it names', () => {
    const misses = UIKIT_RELEASES.filter(([, offset, velocity, outcome]) => {
      const release = resolveSheetRelease({
        detents: [LARGE, MEDIUM],
        dismissedOffset: GONE,
        position: offset,
        velocity,
      });
      const landed =
        release.kind === 'dismiss'
          ? 'dismissed'
          : release.index === 0
            ? 'large'
            : 'medium';
      return landed !== outcome;
    }).map(([name]) => name);
    expect(misses.sort()).toEqual(Object.keys(KNOWN_MISSES).sort());
  });
});

describe('resolveSheetRelease', () => {
  it('projects linearly: offset plus the velocity times the projection time', () => {
    const release = resolveSheetRelease({
      detents: [0, 300],
      dismissedOffset: 640,
      position: 100,
      velocity: 500,
    });
    expect(release.projected).toBeCloseTo(
      100 + 500 * sheet.release.projectionSeconds,
      9,
    );
  });

  it('at rest, dismisses only past halfway from the shortest detent to gone', () => {
    const at = (position: number) =>
      resolveSheetRelease({
        detents: [0, 300],
        dismissedOffset: 640,
        position,
        velocity: 0,
      }).kind;
    expect(at(469)).toBe('detent');
    expect(at(471)).toBe('dismiss');
  });

  it('settles against the motion when the projection says so', () => {
    // Just above the shortest detent, moving up slowly: back down to it.
    const release = resolveSheetRelease({
      detents: [0, 300],
      dismissedOffset: 640,
      position: 250,
      velocity: -200,
    });
    expect(release).toMatchObject({kind: 'detent', index: 1, offset: 300});
  });

  it('never dismisses a sheet a drag may not dismiss', () => {
    const release = resolveSheetRelease({
      detents: [0, 300],
      dismissedOffset: null,
      position: 600,
      velocity: 3000,
    });
    expect(release).toMatchObject({kind: 'detent', index: 1, offset: 300});
  });

  it('picks the spring by speed alone, from sheet.release.fastSpeed', () => {
    const spring = (velocity: number, position = 150) =>
      resolveSheetRelease({
        detents: [0, 300],
        dismissedOffset: 640,
        position,
        velocity,
      }).spring;
    const fast = sheet.release.fastSpeed;
    expect(spring(fast - 1)).toBe(springs.sheetDetent);
    expect(spring(-(fast - 1))).toBe(springs.sheetDetent);
    expect(spring(fast)).toBe(springs.sheetReleaseFast);
    expect(spring(-fast)).toBe(springs.sheetReleaseFast);
    // Dismissals: the swipe spring when fast, the detent spring when slow.
    expect(spring(fast, 600)).toBe(springs.sheetDismissSwipe);
    expect(spring(0, 600)).toBe(springs.sheetDetent);
  });

  it('needs a detent', () => {
    expect(() =>
      resolveSheetRelease({
        detents: [],
        dismissedOffset: 640,
        position: 0,
        velocity: 0,
      }),
    ).toThrow(RangeError);
  });
});
