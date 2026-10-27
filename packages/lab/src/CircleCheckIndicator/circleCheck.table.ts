// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file circleCheck.table.ts
 * @input UIKit measurements on the iOS 26.2 simulator
 * @output Exports `circleCheckTable`: the multiple-selection circle's
 *   measured geometry at two text sizes (pt) and its mark change (ms)
 * @position Internal to CircleCheckIndicator. circleCheck.stylex.ts mirrors
 *   it at build time (StyleX cannot read a module at build time), and
 *   circleCheck.test.tsx fails if the mirror drifts
 *
 * The circle is a Lab component, so its measurements live beside it rather
 * than in Core's UIKit constants table, which holds what Core's own
 * components play (Core's selection marks read `selection.mark` there).
 */

/**
 * UIKit's multiple-selection circle: the edit-mode control of a table row
 * (UITableViewCellEditControl) and a collection-view list's
 * `.multiselect()` accessory, the SF Symbols `circle` and
 * `checkmark.circle.fill` in a 25.67 pt control at the Large text size. It
 * grows and thickens with the text size. Lengths in pt.
 */
export const circleCheckTable = {
  /** At the Large text size, the default. */
  large: {
    /**
     * The circle's outer diameter.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, view frames and 3× pixels read (table edit mode and
     *   list multiselect, light and dark), Oct 24 2026
     */
    diameter: 21.8,
    /**
     * The empty circle's stroke; its interior is clear.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, 3× pixels read, Oct 24 2026
     */
    stroke: 1.54,
    /**
     * The white checkmark's ink box in the filled circle, square.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, 3× pixels read, Oct 24 2026
     */
    checkSize: 9,
    /**
     * The checkmark's stroke.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, 3× pixels read, Oct 24 2026
     */
    checkStroke: 1.35,
    /**
     * How far below the circle's centre the checkmark's ink sits.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, 3× pixels read, Oct 24 2026
     */
    checkOffsetY: 1,
  },
  /** At the xSmall text size, the smallest. */
  xSmall: {
    /**
     * The circle's outer diameter.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, view frames and 3× pixels read at the xSmall text
     *   size, Oct 24 2026
     */
    diameter: 18,
    /**
     * The empty circle's stroke.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, 3× pixels read at the xSmall text size, Oct 24 2026
     */
    stroke: 1.27,
    /**
     * The checkmark's ink box, square.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, 3× pixels read at the xSmall text size, Oct 24 2026
     */
    checkSize: 8,
  },
  /**
   * The circle's mark changes in one frame, as UIKit's selection marks do.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAAnimation read: a UICollectionView list's
   *   multiselect accessory changes at the lift with no animation added,
   *   with and without Reduce Motion, Oct 23 2026
   * @source measured: Reminders (built-in app), iOS 26.2 simulator, iPhone
   *   17 Pro, UIImageView symbol read: the completion circle's symbol is
   *   replaced in one frame about 17 ms after the lift, with no symbol
   *   effect, Oct 24 2026
   */
  changeMs: 0,
} as const;
