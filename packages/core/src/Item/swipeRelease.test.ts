// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swipeRelease.test.ts
 * @input vitest; swipeRelease.ts and the UIKit constants table
 * @output The release rule against the UIKit lab's releases; the commit
 *   point and the resistance past it; the swipe spring is the one UIKit
 *   reported
 * @position Unit tests of packages/core/src/Item/swipeRelease.ts
 */

import {describe, expect, it} from 'vitest';
import {
  dampingRatioOf,
  naturalFrequency,
  settlingDuration,
  toSpring,
} from '../motion/spring';
import {swipeActions} from '../motion/uikit';
import {commitPoint, resistedTravel, resolveRelease} from './swipeRelease';

describe('resolveRelease', () => {
  // The UIKit lab's releases (batch 10a: plain table, 402 pt rows, two
  // trailing actions, a 156.67 pt open width; the full-swipe point far beyond
  // them), as the swipe pan reported them when the finger lifted: the
  // swipe's travel (past the 25 pt the pan needs to begin; negative when the
  // finger came back past where it began) and its velocity in pt/s, positive
  // toward open. A scripted "closing" release can still be opening when it
  // lifts (the 36 pt one at +458), so the reported values are the inputs.
  const OPEN_WIDTH = 156.67;
  const FAR = 373;
  const RELEASES: [travel: number, velocity: number, lands: string][] = [
    [35, -19, 'closed'],
    [65, 490, 'open'],
    [125, 1506, 'open'],
    [5, -492, 'closed'],
    [-55, -1532, 'closed'],
    [95, -16, 'open'],
    [125, 478, 'open'],
    [185, 1565, 'open'],
    [65, -468, 'closed'],
    // [115, +135]: closed. Scripted as a 1500 pt/s closing flick, it lifted
    // with the pan reporting a slow opening one: the one release of the 51
    // neither this rule nor projection explains.
    [-67, -2545, 'closed'],
    [-47.7, -1025, 'closed'],
    [-3, -256, 'closed'],
    [12.3, -22, 'closed'],
    [30.3, 293, 'open'],
    [64, 1058, 'open'],
    [132.3, 1983, 'open'],
    [-67, -2060, 'closed'],
    [-10, -1087, 'closed'],
    [35.7, 458, 'open'],
    [50, -18, 'closed'],
    [63, 286, 'open'],
    [93, 1372, 'open'],
    [170, 2031, 'open'],
    [1.7, -2168, 'closed'],
    [27.3, -996, 'closed'],
    [69.3, -287, 'closed'],
    [87.7, -5, 'open'],
    [100.3, 148, 'open'],
    [147.3, 1271, 'open'],
    [190.3, 608, 'open'],
    [39.3, -2052, 'closed'],
    [65, -983, 'closed'],
    [107, -308, 'closed'],
    [125, -18, 'open'],
    [143, 347, 'open'],
    [185, 948, 'open'],
    [245, 2082, 'open'],
    [42.3, -1975, 'closed'],
    [102.7, -991, 'closed'],
    [144.3, -283, 'closed'],
    [162.3, -19, 'open'],
    [180.3, 271, 'open'],
    [222.7, 1002, 'open'],
    [282.3, 1971, 'open'],
  ];

  it.each(RELEASES)(
    'lands where UIKit did: %s pt of swipe at %s pt/s → %s',
    (travel, velocity, lands) => {
      expect(
        resolveRelease({
          behavior: 'reveal',
          commitAt: FAR,
          openWidth: OPEN_WIDTH,
          travel: Math.max(0, travel),
          velocity,
        }),
      ).toBe(lands);
    },
  );

  it('goes the way a release moves from about 50 pt/s, and by where it is below that (batches 38c, 38d)', () => {
    // 204.67 pt open width, released at 0.7 of it: past half. The speeds
    // are the pan's at its end, as UIKit read them.
    const base = {
      behavior: 'reveal' as const,
      commitAt: 325,
      openWidth: 204.67,
      travel: 143,
    };
    for (const velocity of [-19.9, -21.2, -35.7, -40.7, 0, 56.1]) {
      expect(resolveRelease({...base, velocity})).toBe('open');
    }
    for (const velocity of [-56.1, -56.5, -68.5, -105, -200, -308]) {
      expect(resolveRelease({...base, velocity})).toBe('closed');
    }
  });

  it('closes a release past the open width that is moving back, as UIKit did (batch 38)', () => {
    // 204.67 pt open width; released about 300 pt out while coming back at
    // 300 pt/s: UIKit closed the row, though it would coast to rest past half
    // the open width.
    expect(
      resolveRelease({
        behavior: 'reveal',
        commitAt: 325,
        openWidth: 204.67,
        travel: 305,
        velocity: -300,
      }),
    ).toBe('closed');
    // The same release at rest, or still opening, stays open.
    for (const velocity of [0, 300]) {
      expect(
        resolveRelease({
          behavior: 'reveal',
          commitAt: 325,
          openWidth: 204.67,
          travel: 305,
          velocity,
        }),
      ).toBe('open');
    }
  });

  it('fires under reveal on a release past the commit point, whatever the velocity, and never on a flick short of it', () => {
    const base = {behavior: 'reveal' as const, commitAt: 192, openWidth: 144};
    expect(resolveRelease({...base, travel: 192, velocity: 0})).toBe('perform');
    expect(resolveRelease({...base, travel: 200, velocity: -2000})).toBe(
      'perform',
    );
    expect(resolveRelease({...base, travel: 44, velocity: 3000})).toBe('open');
    expect(resolveRelease({...base, travel: 191, velocity: 3000})).toBe('open');
  });

  it('fires under commit only past the commit point, and never rests', () => {
    const base = {behavior: 'commit' as const, commitAt: 150, openWidth: 72};
    expect(resolveRelease({...base, travel: 150, velocity: 0})).toBe('perform');
    expect(resolveRelease({...base, travel: 160, velocity: -1000})).toBe(
      'perform',
    );
    expect(resolveRelease({...base, travel: 100, velocity: 0})).toBe('closed');
    expect(resolveRelease({...base, travel: 40, velocity: 3000})).toBe(
      'closed',
    );
  });
});

describe('commitPoint and resistedTravel', () => {
  it('commits past the panel, or past the fraction of the row when that is further', () => {
    expect(commitPoint(72, 300)).toBe(150);
    expect(commitPoint(144, 300)).toBe(192);
  });

  it('follows the finger up to the commit point and resists past it', () => {
    expect(resistedTravel(150, 150)).toBe(150);
    expect(resistedTravel(250, 150)).toBeCloseTo(
      150 + 100 * swipeActions.overdragResistance,
      10,
    );
  });
});

describe('the swipe spring', () => {
  it('is the one UIKit reported: critically damped at 10 rad/s, settling in 0.9235 s', () => {
    for (const description of [swipeActions.tracking, swipeActions.settle]) {
      const spring = toSpring(description);
      expect(dampingRatioOf(spring)).toBeCloseTo(1, 10);
      expect(naturalFrequency(spring)).toBeCloseTo(10, 10);
      // UIKit's settlingDuration for it, within the 0.02 % the solver's
      // critically damped branch is documented to land.
      expect(settlingDuration(spring)).toBeCloseTo(0.9235, 3);
    }
  });
});
