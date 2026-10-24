// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menu.ts
 * @input Nothing; data only
 * @output Exports `menu`: UIMenu's touch timing (when a held finger opens a
 *   pull-down button's menu, how far it travels before it can pick a row),
 *   the shape the menu grows out of and collapses into, where it sits over
 *   its button on a phone, and its haptics
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
} as const;
