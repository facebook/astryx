// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file segmented.ts
 * @input Nothing; data only
 * @output Exports `segmentedControl`: UISegmentedControl's selection slide
 *   spring, its Reduce Motion substitution (an in-place fade and scale-in),
 *   its label cross-fade clock and curve, and what a finger does to the lens: the lift (size and spring),
 *   how long a tap keeps it lifted, the spring it chases a dragging finger
 *   with, and how far past the end segments it follows
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
 * along the motion is not modeled yet.) Under Reduce Motion the lens neither
 * lifts nor travels: it fades and scales in at the new segment.
 *
 * Every leaf carries one or more `@source`; uikit.test.ts enforces it.
 * Durations are in ms; curves are cubic-bézier control points
 * [x1, y1, x2, y2]. Each spring, duration and curve is a motion role a theme
 * may retune (motion/roles.ts): `segmentedControl.selectionSpring` is
 * `--motion-segmented-control-selection-spring`, and so on. These measured
 * values are the default theme's.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/useSegmentedSelectionMotion.ts
 * - /packages/core/src/motion/README.md (domain list)
 * - the generated role table in docs (pnpm generate:motion-roles)
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
   * Reduce Motion: UIKit drops the slide. When the selection changes (a tap,
   * the lift of a drag, a programmatic set) the indicator jumps to the
   * destination and fades and scales in place there: its opacity rises from
   * 0 and its uniform scale from `scaleFrom`, on one clock and curve. Prefer
   * Cross-Fade makes no difference. The titles still cross-fade.
   */
  reducedMotion: {
    /**
     * The fade and scale-in's clock, in ms: UIKit's 0.2 s block, the one
     * that also cross-fades the titles, started at the change.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, Reduce Motion on (Prefer Cross-Fade off and on, read
     *   back), per-frame lens opacity and transform for a tap and a drag
     *   release, and the UIView.animate block started at the lift (duration
     *   0.2, curve 5); fit of the four cases with this clock and curve: rms
     *   0.012, max 0.041, Oct 24 2026
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, Reduce Motion on (read back YES), per-frame lens log
     *   for a tap and a programmatic set: no travel, the indicator gone for a
     *   frame and back at the destination, Oct 23 2026
     */
    fadeMs: 200,
    /**
     * The fade and scale-in's curve: the block's private curve 5, Core
     * Animation's default timing function (CSS `ease`). Opacity and scale
     * share it frame for frame.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, Reduce Motion on, per-frame lens opacity and scale
     *   progress (equal at every frame) and the UIView.animate options
     *   (curve 5) of the block started at the lift, Oct 24 2026
     */
    curve: [0.25, 0.1, 0.25, 1],
    /**
     * The indicator's uniform scale when it appears at the destination,
     * centered on it; it grows to 1 with the fade.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, Reduce Motion on, the lens's first frame after the
     *   change: sx = sy = 0.880 (84.5 x 23.8 pt of 96 x 27), its centre on the
     *   destination's, Oct 24 2026
     */
    scaleFrom: 0.88,
  },
  /**
   * How long the segment titles take to cross-fade between their unselected
   * and selected renderings (weight and color), in ms. UIKit animates the
   * label's contents, opacity, position and size in one
   * `UIView.animate(withDuration: 0.2)` block when the selection changes.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAAnimation read (UISegmentLabel contents and opacity,
   *   0.2 s), Oct 23 2026
   */
  labelCrossFadeMs: 200,
  /**
   * The title cross-fade's curve: the block's private curve 5, Core
   * Animation's default timing function (CSS `ease`).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIView.animate options (curve 5) and the
   *   CAMediaTimingFunction it resolves to, Oct 23 2026
   */
  labelCrossFadeCurve: [0.25, 0.1, 0.25, 1],
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
   * The spring the lifted lens chases a dragging finger with: its center
   * trails the finger (about 14 pt at 200 pt/s) and catches up within about
   * 0.13 s when the finger stops.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIViewSpringAnimationBehaviorSettings tracking values
   *   read during a drag (trackingDampingRatio 0.86, trackingResponse 0.15),
   *   Oct 23 2026
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, per-frame lens center against the HID touch stream for
   *   two drags, simulated chase rms 0.51 / 0.77 pt, Oct 23 2026
   */
  trackingSpring: {response: 0.15, dampingRatio: 0.86},
  /**
   * How far past the first or last segment's center the lens follows a
   * dragging finger, in pt; beyond that it stays put while the finger goes
   * on.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, a drag 60 pt past the last segment: the lens stops about
   *   11 pt past its center (312 vs 301), Oct 23 2026
   */
  dragOvershoot: 11,
} as const;

// Each spring, duration and curve above is a motion role a theme may retune
// (motion/roles.ts).
registerMotionTable('segmentedControl', segmentedControl);
