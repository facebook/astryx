// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menu.ts
 * @input Nothing; data only
 * @output Exports `menu`: UIMenu's touch timing (when a held finger opens a
 *   pull-down button's menu, how far it travels before it can pick a row),
 *   the shape the menu grows out of and collapses into, where it sits over
 *   its button on a phone, its haptics, and how a sub-menu opens in place
 *   (the box's springs, the parent list's scale and drop behind it)
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
 * SYNC: When modified, update /packages/core/src/motion/MEASUREMENTS.md
 */

export const menu = {
  /**
   * A finger resting on the button opens its menu under the finger after
   * this long; a tap released sooner opens it at the lift. UIKit's
   * touch-down recognizer on the button drives both. Inside a scroll view
   * the scroll view first holds the touch for its content-touch delay
   * (`scroll.delaysContentTouchesMs`), so a held finger opens the menu at
   * the sum of the two.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, gesture-state hook, Oct 23 2026:
   *   `_UITouchDownGestureRecognizer` on a UIButton with
   *   showsMenuAsPrimaryAction recognized 150–153 ms after touch-down with
   *   the finger held (holds of 150, 160, 170 and 200 ms) and at the lift
   *   for holds of 100, 130 and 140 ms; the open spring started one frame
   *   later. Inside a UIScrollView, holds of up to 200 ms recognized at the
   *   lift and a held finger at about 303 ms
   * @measure M-MN1
   */
  holdOpenMs: 150,
  /**
   * How far the finger may move on the button before the hold-open delay
   * and still open the menu.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, gesture-state hook, Oct 23 2026: on a button outside any
   *   scroll view, a 12 pt move within 80 ms still opened the menu at about
   *   151 ms; moves of 14, 17, 20 and 25 pt failed and opened nothing (the
   *   recognizer's allowableMovement reads 10)
   * @source GUESS — 13 pt, between the 12 pt that opened and the 14 pt that
   *   did not
   * @measure M-MN1
   */
  holdOpenSlopPx: 13,
  /**
   * After the menu opens under a still-held finger, the finger has to travel
   * this far (a straight-line distance) before it starts picking: until then
   * nothing is highlighted and lifting acts on nothing, so the press that
   * opened the menu never picks the row that appeared under it. Counted from
   * the first sample the menu receives after it opened, not from where the
   * finger was when it opened.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, gesture-state hook, steps 150 ms apart, Oct 23 2026:
   *   with the menu open under a held finger and a 1 pt first step, moves of
   *   (0, 9) and (7, 7) picked nothing; (0, 10), (0, 11), (10, 0), (9, 9) and
   *   (10, 10) picked; a 9 pt step followed by 3 pt more picked nothing
   * @measure M-MN2
   */
  scrubHandoffPx: 10,
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
   * A sub-menu opening in place (its row tapped on a phone): the menu's box
   * grows to fit the sub-menu, keeping the edge the menu is anchored by, on
   * this spring; the sub-menu's header rides from the tapped row to the top
   * on it, and the parent list shrinks behind on it.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, per-frame frames of the menu's container view, Oct 24
   *   2026: tapping "More" in a three-row menu moved the container's top
   *   370 → 363.1 → 348.9 → 333.9 → 321 → 311.2 → 304.4 → 300.1 → 297.6 →
   *   296.3 → 295.7 → 296 (33 ms steps) while its bottom stayed put and its
   *   height went 104 → 178: a 0.35 s settle with a 0.3 pt overshoot; the
   *   presentation springs logged in that window were (0.75, 0.35) ×26,
   *   (1.0, 0.21) ×13, (0.8, 0.4) and (0.6, 1.0). The spring here is the
   *   least-squares fit of a single spring to those twelve frames of the
   *   container's top (residual 1e-4), the motion the eye sees
   */
  submenuOpenSpring: {dampingRatio: 0.84, response: 0.415},
  /**
   * Back out of a sub-menu (its header tapped): the box shrinks back on this
   * spring, the header rides down into the parent's row and the parent list
   * grows back to full size.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, per-frame frames of the menu's container view, Oct 24
   *   2026: tapping the sub-menu's header moved the container's top 296 →
   *   370 over about 0.5 s with no overshoot (296, 298.3, 310.7, 325.4,
   *   338.1, 347.9, 355.0, 360.0, 363.4, 365.7, 367.2, 368.2, 368.8, 369.3,
   *   369.5, 370 at 33 ms steps); the springs logged were (0.8, 0.49) ×16,
   *   (1.0, 0.5) ×11, (0.5, 0.6) ×5, (1.0, 0.14) ×2 and (0.8, 0.4) ×2. The
   *   spring here is the least-squares fit of a single spring to those frames
   *   (residual 8e-5, the first frame half a frame after the tap)
   */
  submenuBackSpring: {dampingRatio: 1, response: 0.385},
  /**
   * While a sub-menu shows, the parent list stays behind it at this scale.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, settled frames, Oct 24 2026: the parent list went from
   *   250 × 104 to 242.5 × 100.9 behind the open sub-menu, and back to
   *   250 × 104 after the header was tapped
   */
  submenuParentScale: 0.97,
  /**
   * …and this much lower, in pt.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, settled frames, Oct 24 2026: the scaled parent list sat
   *   3 pt below where it stood, with its tapped row at opacity 0
   */
  submenuParentDropPx: 3,
} as const;
