// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menu.ts
 * @input Nothing; data only
 * @output Exports `menu`: the shape the menu grows out of and collapses
 *   into, and UIMenu's haptics
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
 * Registered as the `menu` motion table: its springs and durations are roles
 * a theme may retune. When a finger's press opens the menu is
 * `spec:AST-094` FR29's (as it presses in a fixed bar; after the scroll
 * view's content-touch delay, `scroll.delaysContentTouchesMs`, inside one).
 * The press values the shared menu press model reads (the drift allowance
 * and the handoff) are `UIKIT_GESTURES.menuPress` (gestures.ts).
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
   * Haptics: a selection tick each time a scrubbing finger moves the
   * highlight to another row; nothing at the open or at the pick.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, feedback-generator hooks, Oct 23 2026: a scrub across
   *   five rows logged one selectionChangedAtLocation: per row change (four),
   *   between userInteractionStarted at the scrub's start and
   *   userInteractionEnded at the lift
   */
  scrubHaptic: 'selection',
} as const;

/**
 * Registers the menu table's motion roles with the theme (idempotent; nothing
 * runs on import). The menu's touch module calls it before its first
 * animation; the hold-open delay is a gesture threshold, not a role.
 */
export function registerMenuTable(): void {
  registerMotionTable('menu', menu);
}
