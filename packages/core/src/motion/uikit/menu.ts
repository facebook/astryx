// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menu.ts
 * @input Nothing; data only
 * @output Exports `menu`: the shape the menu grows out of and collapses
 *   into, where it sits over its button on a phone
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
} as const;

/**
 * Registers the menu table with the motion registry (idempotent; nothing
 * runs on import). It lists no roles, so its values stay internal constants
 * (motion/roles.ts); the hold-open delay is a gesture threshold, not a role.
 */
export function registerMenuTable(): void {
  registerMotionTable('menu', menu);
}
