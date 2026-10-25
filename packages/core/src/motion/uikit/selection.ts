// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selection.ts
 * @input Nothing; data only
 * @output Exports `selection`: how iOS shows a selection mark changing (the
 *   checkmark accessory of a single-choice list, the multiselect circle of a
 *   collection-view list, the completion circle of a to-do row)
 * @position The selection domain of the UIKit constants table
 *   (motion/uikit); read by Indicator/selectionMotion.stylex.ts (the checkbox
 *   and radio marks) through its build-time mirror
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
 * checks it).
 */

/**
 * How iOS shows a selection mark changing: in one frame, with no animation.
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
} as const;
