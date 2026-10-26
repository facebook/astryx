// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menu.ts
 * @input Nothing; data only
 * @output Exports `menu`: the shape the menu grows out of and collapses
 *   into, where it sits over its button on a phone, UIMenu's haptics, and
 *   how a sub-menu opens in place (the box's springs, the parent list's scale
 *   and drop behind it)
 * @position The menu domain of the UIKit constants table (motion/uikit); its
 *   springs are `springs.menuOpen`, `springs.menuClose` and, under Reduce
 *   Motion, `springs.menuReducedMotion`
 *
 * UIMenu presented by a button whose menu is its primary action
 * (`showsMenuAsPrimaryAction`), read from UIKit on the iOS 26.2 simulator.
 * Lengths are in pt (CSS px), durations in ms (the unit of pointer-event
 * timestamps these clocks are compared against).
 *
 * Every leaf carries one or more `@source`; GUESS values also carry the
 * `@measure` task that will confirm or replace them. uikit.test.ts enforces
 * both.
 *
 * Registered as the `menu` motion table with no roles: `spec:AST-094` FR4
 * names none of its values, so each stays an internal constant. When a
 * finger's press opens the menu is `spec:AST-094` FR29's (as it presses in a
 * fixed bar; after the scroll view's content-touch delay,
 * `scroll.delaysContentTouchesMs`, inside one).
 * The press values the shared menu press model reads (the drift allowance
 * and the handoff) are `UIKIT_MENU_PRESS` (gestures.ts).
 *
 * SYNC: When modified, update /packages/core/src/motion/MEASUREMENTS.md
 */

import {registerMotionTable} from '../roles';

export const menu = {
  /**
   * The menu grows out of, and collapses back into, a square this size
   * centered on the button.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, per-frame presentation frames of the menu's morph view,
   *   Oct 23 2026: 22 × 22 centered on the button in the first frame of the
   *   open; the close animates its model to the same 22 × 22 square
   * @measure M-MN3
   */
  collapsedSize: 22,
  /**
   * On a phone the menu covers its button: centered on it, top-aligned with
   * it, and kept this far from the screen's sides.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, settled menu frames, Oct 23 2026: a 250 pt menu from a
   *   button centered at x 201 sits at x 76 (centered); from a button at
   *   x 8 it sits at x 8, and from one ending at x 394 on the 402 pt screen
   *   it ends at 394; its top is the button's top
   * @measure M-MN3
   */
  screenMargin: 8,
  /**
   * The menu opens upward instead, its bottom aligned with the button's
   * bottom, when the button's center is below this fraction of the screen's
   * height.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, settled menu frames, Oct 23 2026: on the 874 pt screen,
   *   buttons centered at y 132 and 352 opened downward and buttons centered
   *   at y 442 and 802 upward, so the threshold lies in (0.40, 0.51]
   * @source GUESS — 0.5, the screen's middle
   * @measure M-MN3
   */
  openUpwardBelow: 0.5,
  /**
   * Haptics: a selection tick each time a scrubbing finger moves the
   * highlight to another row; nothing at the open or at the pick.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, feedback-generator hooks, Oct 23 2026: a scrub across
   *   five rows logged one selectionChangedAtLocation: per row change (four),
   *   between userInteractionStarted at the scrub's start and
   *   userInteractionEnded at the lift
   */
  scrubHaptic: 'selection',
  /**
   * The sub-menu's header as it opens: its title cross-fades from the row's
   * regular weight to semibold, and its chevron turns from ahead to down, on
   * this quicker spring.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, a pull-down button at y 150 whose menu opens downward
   *   (Alpha, Beta, Sort By ▸ (Name, Date, Size), Delete), every menu label,
   *   image and view read per 60 Hz tick, Oct 24 2026 (t from the tap-down;
   *   the lift at 60 ms): the semibold title's opacity 0.1 (106 ms),
   *   0.28 (123), 0.62 (156), 0.82 (189), 0.92 (223), 0.97 (256), 0.99 (289),
   *   1 (359), the regular one's the complement; the chevron 9° (106 ms), 25°
   *   (123), 54° (156), 73° (189), 83° (223), 87° (256), 88.5° (289), 90°
   *   (360). The spring is the least-squares fit of one spring and its start
   *   (89 ms) to both (rms 0.0045)
   */
  submenuHeaderSpring: {dampingRatio: 0.99, response: 0.205},
  /**
   * The header as the sub-menu goes back: its title cross-fades back to the
   * regular weight and its chevron turns back ahead, slower than they came.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, a pull-down button at y 150 whose menu opens downward
   *   (Alpha, Beta, Sort By ▸ (Name, Date, Size), Delete), every menu label,
   *   image and view read per 60 Hz tick, Oct 24 2026 (t from the tap-down;
   *   the lift at 60 ms): the semibold title's opacity 0.87 (160 ms),
   *   0.57 (228), 0.33 (296), 0.18 (361), 0.09 (428), 0.01 (628); the
   *   chevron back to 0° over about 0.6 s. The spring is the least-squares
   *   fit of one spring and its start (109 ms) to the title (rms 0.0014)
   */
  submenuHeaderBackSpring: {dampingRatio: 0.97, response: 0.52},
  /**
   * While a sub-menu shows, the parent's rows stay under its card at this
   * opacity…
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, a pull-down button at y 150 whose menu opens downward
   *   (Alpha, Beta, Sort By ▸ (Name, Date, Size), Delete), every menu label,
   *   image and view read per 60 Hz tick, Oct 24 2026 (t from the tap-down;
   *   the lift at 60 ms): every parent row's own opacity 1 → 0.5,
   *   never 0; the rows the card covers stay under it
   */
  submenuParentOpacity: 0.5,
  /**
   * …and this scale, about the parent list's center.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, a pull-down button at y 150 whose menu opens downward
   *   (Alpha, Beta, Sort By ▸ (Name, Date, Size), Delete), every menu label,
   *   image and view read per 60 Hz tick, Oct 24 2026 (t from the tap-down;
   *   the lift at 60 ms): the parent list 1 → 0.97 (Beta's center y
   *   212.7 → 210.8, toward the list's center)
   */
  submenuParentScale: 0.97,
} as const;

/**
 * Registers the menu table with the motion registry (idempotent; nothing
 * runs on import). It lists no roles, so its values stay internal constants
 * (motion/roles.ts); the hold-open delay is a gesture threshold, not a role.
 */
export function registerMenuTable(): void {
  registerMotionTable('menu', menu);
}
