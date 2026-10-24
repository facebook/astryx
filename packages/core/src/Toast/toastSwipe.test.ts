// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toastSwipe.test.ts
 * @input toastSwipe.ts and the Toast constants of the UIKit table
 * @output Unit tests for how far the card follows a finger and which
 *   releases dismiss, against the recorded notification-banner releases
 * @position Colocated with toastSwipe.ts
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {resolveMotion} from '../motion/resolveMotion';
import {listMotionRoles, motionRoleOf} from '../motion/roles';
import {toast} from '../motion/uikit/toast';
import {followOffset, isDismissRelease} from './toastSwipe';

describe('followOffset', () => {
  it('keeps the card still until the finger has travelled the follow distance', () => {
    expect(followOffset(0)).toBe(0);
    expect(followOffset(toast.followFrom - 0.5)).toBe(0);
    expect(followOffset(toast.followFrom)).toBe(0);
    expect(followOffset(-toast.followFrom)).toBe(0);
  });

  it('then follows at the follow ratio, continuously (no jump)', () => {
    expect(followOffset(toast.followFrom + 0.1)).toBeCloseTo(
      0.1 * toast.followRatio,
      10,
    );
    expect(followOffset(toast.followFrom + 40)).toBeCloseTo(
      40 * toast.followRatio,
      10,
    );
  });

  it('reproduces the banner: a 60 px drag moves it 0.55 × (60 − 14)', () => {
    expect(followOffset(60)).toBeCloseTo(25.3, 10);
  });

  it('stretches the card the same way when the finger turns back away from the edge', () => {
    // The banner's 60 pt pull-down: 0.55 × (60 − 14), away from the edge.
    expect(followOffset(-60)).toBeCloseTo(-25.3, 10);
    expect(followOffset(-(toast.followFrom + 0.1))).toBeCloseTo(
      -0.1 * toast.followRatio,
      10,
    );
  });
});

describe('isDismissRelease', () => {
  // Each recorded banner release: finger travel toward the edge, the
  // finger's release speed (UIKit's estimator over the recorded touch
  // stream), and what the banner did.
  const releases: ReadonlyArray<
    readonly [name: string, travel: number, speed: number, dismissed: boolean]
  > = [
    ['slow 25 pt', 25, 82, false],
    ['slow 30 pt', 30, 82, false],
    ['slow 35 pt', 35, 55, false],
    ['slow 40 pt', 40, 82, false],
    ['slow 45 pt', 45, 60, true],
    ['slow 50 pt', 50, 66, true],
    ['10 pt flick', 10, 129, true],
    ['15 pt flick', 15, 219, true],
    ['15 pt flick, still 120 ms before the lift', 15, 188, true],
    ['40 pt at 300 pt/s, still 150 ms before the lift', 40, 245, true],
    ['slow 60 pt, still 300 ms before the lift', 60, 71, true],
    ['30 pt at 1400 pt/s', 30, 1714, true],
    ['40 pt up, then 20 pt back', 20, -121, false],
    ['slow 20 pt', 20, 60, false],
  ];

  it.each(releases)(
    'reproduces the banner release: %s',
    (_name, travel, speed, dismissed) => {
      expect(isDismissRelease(followOffset(travel), speed)).toBe(dismissed);
    },
  );

  it('springs a card stretched away from the edge back, however it is released', () => {
    expect(isDismissRelease(followOffset(-80), -400)).toBe(false);
    expect(isDismissRelease(followOffset(-80), 0)).toBe(false);
  });

  it('dismisses at the dismiss offset or the flick velocity, whichever comes first', () => {
    expect(isDismissRelease(toast.dismissOffset, 0)).toBe(true);
    expect(isDismissRelease(toast.dismissOffset - 0.01, 0)).toBe(false);
    expect(isDismissRelease(0, toast.flickVelocity)).toBe(true);
    expect(isDismissRelease(0, toast.flickVelocity - 1)).toBe(false);
  });
});

describe('theme roles', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('makes the settle spring the role toast.settle and no threshold a role', () => {
    expect(motionRoleOf(toast.settle)?.id).toBe('toast.settle');
    expect(motionRoleOf(toast.settle)?.variable).toBe('--motion-toast-settle');
    expect(
      listMotionRoles()
        .map(role => role.id)
        .filter(id => id.startsWith('toast.')),
    ).toEqual(['toast.settle']);
  });

  it("settles on the theme's spring when a theme retunes toast.settle", () => {
    const scope = document.createElement('div');
    scope.setAttribute('data-astryx-theme', 'snappy');
    const card = document.createElement('div');
    scope.append(card);
    document.body.append(scope);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element: Element) =>
        ({
          getPropertyValue: (name: string) =>
            element === scope && name === '--motion-toast-settle'
              ? '0.3s 0'
              : '',
        }) as CSSStyleDeclaration,
    );
    expect(resolveMotion(card, toast.settle)).toEqual({
      duration: 0.3,
      bounce: 0,
    });
  });
});
