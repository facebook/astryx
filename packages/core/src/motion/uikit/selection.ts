// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selection.ts
 * @input Nothing; data only
 * @output Exports `selection`: how iOS shows a selection mark changing (the
 *   checkmark accessory of a single-choice list, the multiselect circle of a
 *   collection-view list, the completion circle of a to-do row) and the
 *   multiple-selection circle's geometry at two text sizes
 * @position The selection domain of the UIKit constants table
 *   (motion/uikit); read by Indicator/selectionMotion.stylex.ts (the checkbox
 *   and radio marks) and by the lab's CircleCheckIndicator, each through its
 *   build-time mirror
 *
 * iOS has no checkbox or radio control: a choice is marked on its row, and
 * on iOS 26.2 the mark changes in the frame the selection lands, with no
 * animation of its own, in every built-in case measured. The one exception is
 * the edit-mode circle of a UITableView (a 0.15 s cross-fade), which list
 * rows in edit mode own.
 *
 * Every leaf carries one or more `@source`. Durations are in ms.
 * uikit.test.ts enforces both.
 *
 * SYNC: When modified, update
 * /packages/core/src/Indicator/selectionMotion.stylex.ts
 * (`selectionMotionConsts` mirrors `mark.changeMs`; selectionMotion.test.ts
 * checks it) and
 * /packages/lab/src/CircleCheckIndicator/circleCheck.stylex.ts
 * (`circleCheckConsts` mirrors `mark.changeMs` and `multiselectCircle`;
 * circleCheck.test.tsx checks it).
 */

export const selection = {
  mark: {
    /**
     * A selection mark appears and leaves in one frame. Reduce Motion keeps
     * it: there is nothing to substitute.
     * @source measured: Settings › Camera › Record Video (built-in app), iOS
     *   26.2 simulator, iPhone 17 Pro, cell hooks and CAAnimation read: the
     *   checkmark accessory moves between rows in one frame about 87 ms after
     *   the lift, with no animation on it, Oct 24 2026
     * @source measured: Reminders (built-in app), iOS 26.2 simulator, iPhone
     *   17 Pro, UIImageView symbol read: the completion circle's symbol is
     *   replaced in one frame about 17 ms after the lift, with no symbol
     *   effect, Oct 24 2026
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CAAnimation read: a UICollectionView list's
     *   multiselect accessory changes at the lift with no animation added,
     *   with and without Reduce Motion, Oct 23 2026
     */
    changeMs: 0,
  },
  /**
   * UIKit's multiple-selection circle: the edit-mode control of a table row
   * (UITableViewCellEditControl) and a collection-view list's
   * `.multiselect()` accessory, the SF Symbols `circle` and
   * `checkmark.circle.fill` in a 25.67 pt control at the Large text size. It
   * grows and thickens with the text size. Lengths in pt.
   */
  multiselectCircle: {
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
  },
} as const;
