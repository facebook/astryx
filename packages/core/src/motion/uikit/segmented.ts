// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file segmented.ts
 * @input Nothing; data only
 * @output Exports `segmentedControl`: UISegmentedControl's selection slide
 *   spring and what a finger does to the lens: the lift (size and spring),
 *   how long a tap keeps it lifted, how far past the end segments it follows
 *   a dragging finger, and the pressed title's dim; and
 *   `registerSegmentedTable`, which registers its springs, durations and
 *   curves as internal motion roles (`spec:AST-094` FR4, DEC-11)
 * @position The segmented-control domain of the UIKit constants table
 *   (motion/uikit); read by SegmentedControl's touch presentation
 *
 * Every value was read from UIKit's own UISegmentedControl, three text
 * segments in a 300 × 31 pt control, on the iOS 26.2 simulator (iPhone 17
 * Pro). On iOS 26 the selection indicator is a Liquid Glass lens. Its
 * position is driven by a spring, published every frame as a presentation
 * value with its velocity: a tap, a programmatic `selectedSegmentIndex`
 * change and the same change inside `UIView.animate` all follow the same
 * spring. Only a finger also lifts the lens: holding the selected segment
 * lifts it in place, dragging it carries it with the finger, and a tap on
 * another segment lifts it for the first part of the slide. (The stretch
 * along the motion is not modeled yet.) UIKit also cross-fades
 * the two titles that change (0.2 s on Core Animation's default curve; UIKit
 * lab, Oct 23 2026); Astryx switches them at once, because a cross-fade needs
 * a second copy of each title (`architecture:component-style-authoring`
 * INV7). Under Reduce Motion
 * UIKit's lens fades and scales in at the new segment (0.2 s, CSS `ease`,
 * from a scale of 0.88; UIKit lab, iOS 26.2 simulator, Oct 24 2026). Astryx
 * follows `design:reduced-motion` instead, which allows no scaling: the
 * animator's Reduce Motion cross-fade, with no value of this table.
 *
 * Every leaf carries one or more `@source`; uikit.test.ts enforces it.
 * Durations are in ms; curves are cubic-bézier control points
 * [x1, y1, x2, y2]. Its springs, durations and curves are internal motion
 * roles (`registerSegmentedTable`; `spec:AST-094` FR4), which no theme
 * retunes while the roles stay internal (DEC-11). The lens
 * chases a dragging finger on the shared role `springs.fingerTracking`, the
 * values UIKit reports for this control too (trackingResponse 0.15,
 * trackingDampingRatio 0.86, read during a drag; per-frame chase rms 0.51 /
 * 0.77 pt; UIKit lab, iOS 26.2 simulator, Oct 23 2026).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/useSegmentedSelectionMotion.ts
 * - /packages/core/src/motion/README.md (domain list)
 */

import {registerMotionTable} from '../roles';

export const segmentedControl = {
  /**
   * The selection indicator's slide from the old segment to the new one,
   * after a tap and after a programmatic change alike: response 0.40 s,
   * damping ratio 0.85 (about 1.25 pt of overshoot on a 200 pt move,
   * settled by about 0.6 s). The width follows the same spring when the
   * segments differ in width.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIViewSpringAnimationBehavior read on the lens position
   *   for a tap and a programmatic set (dampingRatio 0.85, response 0.40,
   *   tracking off), Oct 23 2026
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, per-frame log of the lens's presentation position and
   *   velocity (method C) for a tap, a programmatic set and an animated set,
   *   least-squares spring fit (response 0.395 / 0.405 / 0.400 s, damping
   *   ratio 0.855 / 0.845 / 0.850, rms at most 0.65 pt over 200 pt),
   *   Oct 23 2026
   */
  selectionSpring: {response: 0.4, dampingRatio: 0.85},
  /**
   * How much a finger lifts the lens, in pt added to its resting size:
   * 96 × 27 → 120 × 43 in a three-segment 300 × 31 control, 71 × 27 →
   * 95 × 43 with four segments, 126 × 40 → 150 × 56 in a 390 × 44 control.
   * Additive, not a scale, and centered on the lens.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, per-frame lens bounds while holding the selected segment
   *   of three control sizes, Oct 23 2026
   */
  liftGrowth: {width: 24, height: 16},
  /**
   * The lift's spring, up when the finger lands on the selected segment (or
   * a tap starts a slide) and back down when it lets go: response 0.25 s,
   * damping ratio 1 (about 0.3 s to full size).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIViewSpringAnimationBehaviorSettings read on the lens
   *   while held (dampingRatio 1.0, response 0.25), Oct 23 2026
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, per-frame lens bounds through a 600 ms hold, spring fit
   *   of the lift and the release (rms 0.12 pt with 1.0 / 0.25), Oct 23 2026
   */
  liftSpring: {response: 0.25, dampingRatio: 1},
  /**
   * How long a tap on another segment keeps the lens lifted, in ms after the
   * slide starts, before it comes back down on the lift spring while still
   * travelling.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, per-frame lens bounds through a tap slide (bounds = size
   *   / transform), two-spring fit: lift at +6 ms, release at +236 ms, rms
   *   0.07 pt, Oct 23 2026
   */
  tapLiftHangMs: 230,
  /**
   * How far past the first or last segment's center the lens follows a
   * dragging finger, in pt; beyond that it stays put while the finger goes
   * on.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, a drag 60 pt past the last segment: the lens stops about
   *   11 pt past its center (312 vs 301), Oct 23 2026
   */
  dragOvershoot: 11,
  /**
   * A finger on an unselected segment (the lens stays on the selected one)
   * dims that segment's title: to `opacity` on `fadeMs` / `fadeCurve`. When
   * the finger crosses into another segment the dim moves with it on the same
   * clock (one title comes back as the other dims), and at the lift the
   * chosen title comes back on `liftMs` / `liftCurve` while its face switches
   * to the selected one at once. The selected face itself follows the finger
   * instantly during a drag of the lifted lens.
   */
  pressedTitle: {
    /**
     * The pressed title's opacity.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-tick UISegmentLabel effective opacity during a drag
     *   that starts on an unselected segment: 0.20 from 432 ms on (F4 batch
     *   64), Oct 24 2026
     */
    opacity: 0.2,
    /**
     * How long the dim takes (and the return when the finger moves on), in
     * ms.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-tick UISegmentLabel effective opacity (F4 batch
     *   64): 0.98 at 19 ms, 0.82 at 81, 0.57 at 149, 0.40 at 214, 0.29 at
     *   284, 0.23 at 350, 0.20 at 432; fit 470 ms on CSS ease, rms 0.004
     *   (the return when the finger moves on: the same fit, rms 0.007; a
     *   plain tap's dim, F4 batch 64b: a 0.47 s opacity animation, rms
     *   0.007), Oct 24 2026
     */
    fadeMs: 470,
    /**
     * The dim's curve: Core Animation's default timing function (CSS
     * `ease`).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-tick UISegmentLabel effective opacity (F4 batch
     *   64), fit per frame (see `fadeMs`), Oct 24 2026
     */
    fadeCurve: [0.25, 0.1, 0.25, 1],
    /**
     * How long the chosen title takes to come back at the lift, in ms.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-tick UISegmentLabel effective opacity after the
     *   lift (F4 batch 64): 0.21 → 0.35 at +24 ms, 0.51 at +42, 0.65 at +59,
     *   0.75 at +75, 0.84 at +92, 0.90 at +109, 0.97 at +143, 1 at +174;
     *   after a 100 ms tap 0.75 → 0.80 at +23, 0.89 at +57, 0.97 at +105, 1
     *   at +155 (F4 batch 64b, a 0.2 s opacity animation); fit over both
     *   180 ms on CSS ease, rms 0.021, Oct 24 2026
     */
    liftMs: 180,
    /**
     * The return's curve at the lift (CSS `ease`).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-tick UISegmentLabel effective opacity after the
     *   lift (F4 batch 64), fit per frame (see `liftMs`), Oct 24 2026
     */
    liftCurve: [0.25, 0.1, 0.25, 1],
  },
} as const;

/**
 * Registers this table with the motion registry (motion/roles.ts): the
 * springs, durations and curves SegmentedControl's touch presentation plays
 * become internal motion roles (`spec:AST-094` FR4, kept internal by DEC-11),
 * named in FR4's role table. The lift's size, the drag overshoot and the
 * pressed opacity are not motion and stay internal constants. Nothing
 * registers on import, and a second call does nothing.
 */
export function registerSegmentedTable(): void {
  registerMotionTable('segmented', segmentedControl, {
    roles: [
      'selectionSpring',
      'liftSpring',
      'tapLiftHangMs',
      'pressedTitle.fadeMs',
      'pressedTitle.fadeCurve',
      'pressedTitle.liftMs',
      'pressedTitle.liftCurve',
    ],
  });
}
