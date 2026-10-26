// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file refresh.ts
 * @input The motion role registry (registerRefreshControlTable only)
 * @output Exports `refreshControl` and `registerRefreshControlTable`. The table: UIRefreshControl's height (the
 *   refreshing inset and the one-to-one stretch of a pull), its trigger, the
 *   pull after the trigger, the indicator's reveal curve, spin, trigger
 *   rotation and exit, and the end-of-refresh clock
 * @position The refresh-control domain of the UIKit constants table
 *   (motion/uikit). The release onto the inset is the scroll view's own
 *   bounce (`scroll.bounce`), and the pull past `height` uses the scroll
 *   view's rubber band (`scroll.rubberBand`)
 *
 * Measured on UIRefreshControls attached to scroll views 334, 400, 874 and
 * 1366 pt tall in the UIKit lab (iOS 26.2 simulator, iPhone 17 Pro, HID drags
 * at 20–400 pt/s, every `setContentOffset:` logged with its time, the
 * control's layer tree read per frame and every CAAnimation dumped). What a
 * pull does, measured:
 *
 * - the first `height` of overscroll tracks the finger one to one, after the
 *   pan's 10 pt hysteresis; beyond it the scroll view's rubber band applies
 *   to the excess (c = 0.55, d = the scroll view's height; within 0.2 pt);
 * - the indicator's reveal is a paused animation scrubbed by overscroll ÷ the
 *   trigger distance, and `valueChanged` fires while the finger is still
 *   down when that reaches 1; the trigger distance grows with the scroll
 *   view's height (`triggerHeightFraction`, never below `triggerMinimum`);
 * - a trigger within `postTriggerLinearHeights` × `height` steps the offset
 *   back onto the finger (13–18 pt) and it stays one to one up to there;
 * - released while refreshing, the content settles onto −`height` with the
 *   same bounce a plain scroll view uses (0.534 s from 50–59 pt), and the
 *   outward release velocity is not carried;
 * - a momentum overshoot past the trigger never triggers.
 *
 * Lengths are in pt (CSS px), durations in ms, curves cubic-bézier control
 * points [x1, y1, x2, y2].
 *
 * Every leaf carries one or more `@source`; webkit and GUESS values also carry
 * the `@measure` task that will confirm or replace them. uikit.test.ts
 * enforces both.
 *
 * Every value is an internal constant: spec:AST-094 FR4 names none of them as
 * a motion role, so the table registers no role (motion/roles.ts).
 *
 * SYNC: When modified, update /packages/core/src/motion/MEASUREMENTS.md
 */

import {registerMotionTable} from '../roles';

export const refreshControl = {
  /**
   * The refreshing inset: while refreshing, the content rests this far below
   * the top of the scroll view, with the indicator in the gap. Also the
   * stretch of a pull that tracks the finger one to one before the rubber
   * band starts.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIRefreshControl on a 334 pt scroll view: content held
   *   at −60.33 while refreshing (inset top 60), offset equal to finger
   *   travel − 10 pt up to 60, Oct 23 2026
   */
  height: 60,
  /**
   * The trigger distance as a fraction of the scroll view's height: a pull
   * triggers (and the indicator is fully revealed) when its overscroll
   * reaches this × the height, or `triggerMinimum`, whichever is larger.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIRefreshControl on scroll views 400 pt (trigger at
   *   79.0–79.3), 874 pt (168.3–173.7) and 1366 pt (about 271, from the
   *   reveal's slope) tall, Oct 23 2026
   */
  triggerHeightFraction: 0.198,
  /**
   * The shortest trigger distance, pt of overscroll: short scroll views
   * trigger here.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIRefreshControl on a 334 pt scroll view: trigger at
   *   73.0–73.3 at the top of the screen and 540 pt down, Oct 23 2026
   */
  triggerMinimum: 73,
  /**
   * After the trigger the offset follows the finger one to one again, up to
   * this many `height`s of overscroll; past it the pull resists again (one
   * run showed a 27.7 pt step back there, not replicated until confirmed).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIRefreshControl on a 334 pt scroll view, setContentOffset
   *   log: one to one from the frame after the trigger to −117.67, Oct 23 2026
   * @measure M-RC3
   */
  postTriggerLinearHeights: 2,
  /**
   * The indicator's reveal: a paused CAReplicatorLayer animation (speed 0,
   * time offset = overscroll ÷ trigger distance) of the layer's opacity
   * (0 → 1) on this curve, with the spokes' alpha offset following it
   * (alpha offset = opacity − 1: the first spoke shows first, the others
   * fill in as the pull grows).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAAnimation dump (CABasicAnimation instanceAlphaOffset
   *   and opacity, 1 s, timing function (0.42, 0, 0.58, 1)) and per-frame
   *   reads of the replicator's speed, timeOffset, opacity and
   *   instanceAlphaOffset, Oct 23 2026
   */
  revealCurve: [0.42, 0, 0.58, 1],
  /**
   * Spokes the indicator draws (instances of its replicator).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAReplicatorLayer instanceCount read, Oct 23 2026
   */
  indicatorSpokes: 8,
  /**
   * While spinning, each spoke is this much fainter than the one ahead of
   * it (the replicator's alpha offset per instance).
   * @source GUESS — the trigger animates instanceAlphaOffset and
   *   instanceColor on springs (dumped), but their target values were not
   *   read; one spoke's share of the circle is the gradient
   *   UIActivityIndicatorView shows
   * @measure M-RC4
   */
  spinAlphaStep: -0.125,
  /**
   * The indicator's spin: one turn of its keyframed transform per this many
   * ms, repeating, started in the trigger frame.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAAnimation dump: CAKeyframeAnimation transform on the
   *   CAReplicatorLayer, duration 1 s, repeatCount infinity, Oct 23 2026
   */
  spinMs: 1000,
  /**
   * At the trigger the indicator's container turns back from about half a
   * turn (π − 0.01 rad) to rest, additively, on this spring. UIKit asks for
   * mass 1, stiffness 7.03–7.42 (it differs per release) and damping 5000;
   * Core Animation clamps damping to critical unless `allowsOverdamping` is
   * set, so the curve is the critically damped spring of that stiffness.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAAnimation dump: CASpringAnimation transform, additive,
   *   mass 1, stiffness 7.418584 and 7.034003, damping 5000, duration 4,
   *   Oct 23 2026
   * @source GUESS — the clamp to critical damping follows the lab's reading
   *   of `allowsOverdamping` off for UIKit's other springs; this animation's
   *   own flag, and how the stiffness depends on the release, were not read
   * @measure M-RC4
   */
  triggerTurnSpring: {mass: 1, stiffness: 7.2, damping: 5.367},
  /**
   * The indicator's turn, radians (π − 0.01, about half a turn): the trigger
   * turn starts this far round and springs back to rest, and the end turns
   * from rest to here while the indicator shrinks.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAAnimation dumps: the trigger's CASpringAnimation
   *   transform starts at a rotation of π − 0.01 (Oct 23 2026); the end's
   *   CABasicAnimation transform ends at a rotation of 179.43° (Oct 24 2026)
   */
  turnRad: 3.131592653589793,
  /**
   * `endRefreshing()` while the control is visible: the inset leaves (the
   * content moves up by `height`) over this long, on `timing.curves.move`.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, setContentOffset per frame over 0.3 s inside
   *   UIView.animate(withDuration: 0.3), three runs at rest identical to the
   *   frame, Oct 23 2026
   */
  endMs: 300,
  /**
   * With the end, over this long on `timing.curves.move`, the spin gives
   * way to the indicator shrinking to `exitScale` as it turns by `turnRad`,
   * and the title fades out (1 → 0). The control's own opacity stays 1.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAAnimation dump and per-frame presentation: a 0.3 s
   *   CABasicAnimation on the CAReplicatorLayer transform from identity, and
   *   a 0.3 s opacity from 1 on the title label, on (0.42, 0, 0.58, 1), with
   *   874 pt and 334 pt tables, Oct 24 2026
   */
  exitMs: 300,
  /**
   * The end shrinks the indicator to this scale (it lands at almost nothing
   * while the content's edge still leaves a few points of the gap open).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, the replicator view's model transform after
   *   `endRefreshing()`: scale 0.001, uniform, no translation, Oct 24 2026
   */
  exitScale: 0.001,
} as const;

/**
 * Registers the table under `refreshControl` (motion/roles.ts) with no role:
 * spec:AST-094 FR4 names none of its values, so each stays an internal
 * constant. Nothing registers on import: the refresh control's touch layer
 * calls it once before its first animation (it is idempotent), so a page that
 * never pulls ships no registry.
 */
export function registerRefreshControlTable(): void {
  registerMotionTable('refreshControl', refreshControl);
}
