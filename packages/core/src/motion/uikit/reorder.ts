// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file reorder.ts
 * @input `scroll` (the content-touch delay) and `UIKIT_GESTURES` (the pan
 *   hysteresis)
 * @output Exports `reorder`: the values of a UIKit table's edit-mode reorder
 *   (the reorder control's claim, the rows sliding out of the way, the drop's
 *   settle and the edge autoscroll)
 * @position The reorder domain of the UIKit constants table (motion/uikit);
 *   read by List/reorderModel.ts and List/useListReorder.ts
 *
 * Measured on a `UITableView` in editing mode with reorder controls only, 40
 * rows of 44 pt (two of 88 pt in the second run), in an instrumented UIKit
 * app on the iOS 26.2 simulator: every animation, offset and recognizer state
 * logged per frame while real HID touches drag the reorder control. What it
 * found and the values below do not need: no lift (a held or dragged row
 * changes neither scale, opacity, z position nor shadow), the dragged row
 * follows the finger one to one with the grab offset kept, the drop goes to
 * the current proposed slot with no velocity projection, and no haptic plays.
 *
 * Every leaf carries one or more `@source` (apple-docs | wwdc | webkit |
 * measured | GUESS); GUESS values also carry the `@measure` task that will
 * confirm or replace them (MEASUREMENTS.md, M-RO rows). uikit.test.ts
 * enforces both. Durations are in ms unless named in seconds; springs use
 * UIKit's `springDuration` (s) and `bounce`; lengths are in points, one CSS
 * px each.
 *
 * SYNC: When modified, update /packages/core/src/motion/MEASUREMENTS.md.
 */

import {UIKIT_GESTURES} from './gestures';
import {scroll} from './scroll';

export const reorder = {
  claim: {
    /**
     * A still touch on the reorder control claims the drag after the scroll
     * view's content-touch delay: the table stops scrolling (`isScrollEnabled`
     * turns false) once it has passed.
     * @source measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro, table reorder
     *   (isScrollEnabled false 148–149 ms after touch-down on the reorder
     *   control), F4 batch 32b, Oct 23 2026
     */
    delayMs: scroll.delaysContentTouchesMs,
    /**
     * Travel before the claim that hands the touch to the scroll view: a flick
     * that starts on the reorder control scrolls the table with momentum and
     * the row does not move. The scroll view's pan begins at its hysteresis.
     * @source measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro, table reorder
     *   (a 120 pt flick in 80 ms from the reorder control scrolled the table;
     *   the row stayed), F4 batch 32b, Oct 23 2026
     */
    allowableMovement: UIKIT_GESTURES.pan.hysteresis.value,
  },
  slide: {
    /**
     * The rows that make room slide on `UIView.animate(springDuration: 0.3,
     * bounce: 0)`, for 44 pt and 88 pt rows alike (critically damped,
     * response 0.3 s: `list.update.tableSpring`).
     * @source measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro, table reorder
     *   (UIView springDuration:bounce: 0.3 / 0 on every neighbour; row 6 at
     *   88 pt 326 → 286.7 → 282.1 → 282), F4 batches 32 and 32b, Oct 23 2026
     */
    spring: {duration: 0.3, bounce: 0},
    /**
     * While the table autoscrolls, a slide's springDuration is shorter by this
     * much per point of autoscroll step: 0.24 / 0.21 / 0.18 / 0.03 s at 2 / 3 /
     * 4 / 9 pt per tick (0.3 − 0.03 × step, exact at all four).
     * @source measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro, table reorder
     *   autoscroll (UIView springDuration per slide), F4 batch 32b, Oct 23 2026
     */
    autoscrollShorteningPerStep: 0.03,
  },
  settle: {
    /**
     * The drop: the row springs from where it is to its slot, from rest
     * (initialSpringVelocity 0, even after a 600 pt/s release), bounce 0, in a
     * springDuration of this much times min(1, remaining distance / half the
     * dragged row's height).
     * @source measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro, table reorder
     *   drops (44 pt row: 12 pt → 0.1636 s; 88 pt row: 12 / 22 / 33 / 43 pt →
     *   0.0818 / 0.150 / 0.225 / 0.2932 s), F4 batches 32b and 32c, Oct 23 2026
     */
    maxDuration: 0.3,
    /**
     * The distance, as a fraction of the dragged row's height, at and beyond
     * which the drop takes the full springDuration.
     * @source measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro, table reorder
     *   drops of 44 pt and 88 pt rows (22 and 44 pt), F4 batch 32c, Oct 23
     *   2026
     */
    fullDistanceRowFraction: 0.5,
  },
  autoscroll: {
    /**
     * Autoscroll is a timer: the offset moves by a whole number of points
     * every 20 ms (50 Hz), constant at a given depth.
     * @source measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro, table reorder
     *   autoscroll (contentOffset per tick), F4 batches 32b and 32c, Oct 23
     *   2026
     */
    tickMs: 20,
    /**
     * The depths of the samples: how far the dragged row's edge (not the
     * finger) is past the scroll view's edge, negative inside. Between
     * samples the step is interpolated and rounded to a whole point; deeper
     * than the last sample it stays at the last (the row is clamped with its
     * centre on the edge there).
     * @source measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro, table reorder
     *   autoscroll with 44 pt rows (bottom edge; the top edge agreed within a
     *   point: 2 at 4 inside, 9 at 20 beyond), F4 batches 32b and 32c, Oct 23
     *   2026
     */
    depths: [-3, 6, 8, 10, 12, 16, 20, 22],
    /**
     * Points per tick at each of `depths`: 100 pt/s at the start, 500 pt/s at
     * the deepest.
     * @source measured: UIKit lab, iOS 26.2 sim iPhone 17 Pro, table reorder
     *   autoscroll with 44 pt rows, F4 batches 32b and 32c, Oct 23 2026
     */
    stepsPt: [2, 2, 3, 3, 4, 6, 8, 10],
    /**
     * How far inside the edge autoscroll starts (at the first sample's step):
     * none with the row's edge 12 pt inside, 2 pt per tick at 3 pt inside.
     * @source GUESS — a point inside the measured bracket (12 to 3 pt)
     * @measure M-RO26
     */
    startInset: 8,
  },
} as const;
