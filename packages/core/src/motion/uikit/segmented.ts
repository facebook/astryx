// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file segmented.ts
 * @input Nothing; data only
 * @output Exports `segmentedControl`: UISegmentedControl's selection slide
 *   spring; and `registerSegmentedTable`, which registers it as an internal
 *   motion role (`spec:AST-094` FR4, DEC-11)
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
 * belong to the press and are not in this file yet. UIKit also cross-fades
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
 * [x1, y1, x2, y2]. The slide's spring is an internal motion role
 * (`registerSegmentedTable`; `spec:AST-094` FR4), which no theme retunes
 * while it stays internal (DEC-11).
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
} as const;

/**
 * Registers this table with the motion registry (motion/roles.ts): the slide's
 * spring becomes an internal motion role (`spec:AST-094` FR4, kept internal
 * by DEC-11), named in FR4's role table. Nothing registers on import, and a
 * second call does nothing.
 */
export function registerSegmentedTable(): void {
  registerMotionTable('segmented', segmentedControl, {
    roles: ['selectionSpring'],
  });
}
