// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toast.ts
 * @input Nothing; data only
 * @output Exports `toast`: how a Toast's touch presentation follows a swipe
 *   toward its edge and decides, on release, between settling back and
 *   leaving
 * @position The Toast domain of the UIKit constants table (motion/uikit)
 *
 * iOS has no toast control. The reference is the system notification banner,
 * which SpringBoard draws out of process, so nothing can read its animations:
 * the values below come from 60 fps recordings of HID-driven drags on the
 * iOS 26.2 simulator, the banner's position tracked per frame against the
 * touch stream (method B in MEASUREMENTS.md), over three runs of 8 to 22
 * releases. The banner starts to follow the finger late and at about half
 * its speed; on release it leaves if it is far enough out or the finger was
 * still moving toward the edge fast enough, and plays its ordinary exit
 * whatever the release speed; otherwise it springs back on the smooth
 * system spring. A touch never catches a banner that is settling back or
 * leaving, and Reduce Motion changes none of it.
 *
 * Every leaf carries one or more `@source`; webkit and GUESS values also carry
 * the `@measure` task that will confirm or replace them. uikit.test.ts
 * enforces both.
 *
 * The settle spring is a motion role a theme may retune (`toast.settle`,
 * motion/roles.ts); the follow and release values are gesture thresholds and
 * stay constants (bare numbers are never roles).
 *
 * SYNC: When modified, update /packages/core/src/motion/MEASUREMENTS.md and
 *   /packages/core/src/Toast/useToastGesture.ts (its header lists the rule).
 */

import {registerMotionTable} from '../roles';

export const toast = {
  /**
   * Finger travel since touch-down, toward the edge or back away from it,
   * before the banner starts to move with it. The pan itself begins earlier (UIKit's pan hysteresis,
   * `UIKIT_GESTURES.pan.hysteresis`), so a quick flick shorter than this
   * still counts; the travel before it never moves the banner, so it does
   * not jump when it starts to follow.
   * @source measured: SpringBoard notification banner, iOS 26.2 simulator,
   *   60 fps recordings of HID drags, banner y per frame against the touch
   *   stream: slow drags of 20 to 70 pt, up or down, move it 0.55 ×
   *   (travel − 14), with
   *   the display's 1 to 3 frames of lag corrected (17 pt uncorrected), Oct
   *   23 2026
   */
  followFrom: 14,
  /**
   * How far the banner moves per pixel the finger travels past `followFrom`,
   * toward the edge or away from it (away, the banner stretches and springs
   * back; past ~75 pt it would open its expanded view, which a toast does
   * not have).
   * @source measured: SpringBoard notification banner, iOS 26.2 simulator,
   *   60 fps recordings of HID drags up to 60 pt toward the edge and 70 pt
   *   away from it, linear (a rubber band fits worse), Oct 23 2026
   */
  followRatio: 0.55,
  /**
   * How much more vertical than horizontal a drag must be before it can
   * begin; a horizontal drag is left to the page (it never moves the banner).
   * @source GUESS — the value Toast shipped with: a thumb's arc is not a
   *   direction until it is 1.2 times more vertical than horizontal; a
   *   horizontal 60 pt drag leaves the banner where it is (measured, 60 fps
   *   recording)
   * @measure M-T2
   */
  axisRatio: 1.2,
  /**
   * How far from rest (px toward the edge) the card must be at the lift for
   * a release to dismiss it, whatever the finger's speed.
   * @source measured: SpringBoard notification banner, iOS 26.2 simulator,
   *   60 fps recordings of slow (60 pt/s) HID drags lifted while moving: 40 pt
   *   (0.55 × (40 − 14) = 14.3 out) settles, 45 pt (17.1 out) dismisses, as
   *   do longer ones; the midpoint, Oct 23 2026
   */
  dismissOffset: 15.7,
  /**
   * The finger's release speed toward the edge (px/s, UIKit's estimator: a
   * finger that stopped keeps its last speed) from which a release dismisses,
   * however little the card moved.
   * @source measured: SpringBoard notification banner, iOS 26.2 simulator,
   *   60 fps recordings of HID releases: slow drags at up to 82 pt/s settle;
   *   10 and 15 pt flicks at 129 to 245 pt/s dismiss, also after the finger
   *   stood still 33 to 150 ms before the lift; the midpoint, Oct 23 2026
   */
  flickVelocity: 105,
  /**
   * The settle back to rest after a release that does not dismiss, handed
   * the card's release velocity: the smooth system spring.
   * @source measured: SpringBoard notification banner, iOS 26.2 simulator,
   *   60 fps recordings of seven settles from 6.7 to 31 pt out: a critically
   *   damped spring with a 0.5 s response fits every frame within 0.3 pt (the
   *   recording's resolution is 0.67 pt), Oct 23 2026
   */
  settle: {response: 0.5, dampingRatio: 1},
} as const;

// The settle spring above is a motion role a theme may retune
// (motion/roles.ts); the thresholds are bare numbers, which are never roles.
registerMotionTable('toast', toast);
