// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file segmented.ts
 * @input Nothing; data only
 * @output Exports `segmentedControl`: UISegmentedControl's selection slide
 *   spring, its Reduce Motion substitution, and its label cross-fade clock
 *   and curve
 * @position The segmented-control domain of the UIKit constants table
 *   (motion/uikit); read by SegmentedControl's touch presentation
 *
 * Every value was read from UIKit's own UISegmentedControl, three text
 * segments in a 300 × 31 pt control, on the iOS 26.2 simulator (iPhone 17
 * Pro). On iOS 26 the selection indicator is a Liquid Glass lens. Its
 * position is driven by a spring, published every frame as a presentation
 * value with its velocity: a tap, a programmatic `selectedSegmentIndex`
 * change and the same change inside `UIView.animate` all follow the same
 * spring. Only a finger also lifts and stretches the lens; those clocks
 * belong to the press and are not in this file yet. Under Reduce Motion the
 * lens does not travel at all.
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
   * Reduce Motion: UIKit drops the slide. The indicator is gone for a frame
   * and reappears at the destination, for a tap and a programmatic set alike;
   * the titles still cross-fade. In the animator's vocabulary that is an
   * instant move, not a cross-fade.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, Reduce Motion on (read back YES), per-frame lens log for
   *   a tap and a programmatic set, Oct 23 2026
   */
  reducedMotion: 'instant',
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
} as const;

// Each spring, duration and curve above is a motion role a theme may retune
// (motion/roles.ts).
registerMotionTable('segmentedControl', segmentedControl);
