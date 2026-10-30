// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file progressBar.ts
 * @input Nothing; data only
 * @output Exports `progressBar`: UIProgressView's fill (minimum width, empty
 *   alpha, animated timing)
 * @position ProgressBar's rows of the UIKit constants table's progress domain
 *   (motion/uikit); read by ProgressBar's touch presentation
 *
 * Every leaf carries one or more `@source`; webkit and GUESS values also carry
 * the `@measure` task that will confirm or replace them. uikit.test.ts
 * enforces both.
 *
 * Lengths are in points (CSS px), durations in ms, alphas in 0..1.
 *
 * Every value is an internal constant: the table lists no motion role, so no
 * theme retunes it (`spec:AST-094` FR4).
 *
 * SYNC: When modified, update /packages/core/src/ProgressBar/ProgressBar.tsx
 * (its minimum fill, a literal) and
 * /packages/core/src/ProgressBar/progressBarTouch.stylex.ts (the touch
 * timing's constants); ProgressBar.test.tsx checks both against this file.
 */

import {registerMotionTable} from '../roles';

/** UIProgressView's values, for ProgressBar. */
export const progressBar = {
  progressView: {
    /**
     * The track's height in the `.default` style; the fill is as tall.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, intrinsic size of UIProgressView(progressViewStyle:
     *   .default), Oct 23 2026
     */
    heightPt: 4,
    /**
     * Once progress is above zero the fill is never narrower than this many
     * track heights (8 pt on the 4 pt track): at 0.005 of a 300 pt track it
     * is 8 pt wide, at 0.05 it is 15.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the fill image view's frame at progress 0, 0.005,
     *   0.01, 0.05, 0.5 and 1, Oct 23 2026
     */
    minimumFillHeights: 2,
    /**
     * At progress 0 the fill is transparent (alpha 0, still at its minimum
     * width).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the fill image view's alpha at progress 0, Oct 23 2026
     */
    emptyFillAlpha: 0,
    /**
     * setProgress(_:animated: true) runs this long for a change of the whole
     * track (0 → 1), and in proportion for less, measured on the model
     * values (0.2 → 0.8 takes 0.6 s), starting from wherever the fill is
     * drawn when it is retargeted.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, UIView animation on the fill's frame (duration,
     *   beginFromCurrentState) for jumps of 0.6, 0.4 and 0.6, Oct 23 2026
     */
    wholeTrackMs: 1000,
    /**
     * That animation's curve is linear, and Reduce Motion leaves it
     * unchanged.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the fill's position animation (timing function
     *   linear), with Reduce Motion off and on, Oct 23 2026
     */
    animatedCurveIsLinear: true,
  },
} as const;

/**
 * Registers the table for discovery; it lists no roles, so it adds none.
 * Idempotent, and nothing runs on import: ProgressBar's touch presentation is
 * CSS alone, its timing read from ProgressBar's internal constants
 * (progressBarTouch.stylex.ts).
 */
export function registerProgressBarTable(): void {
  registerMotionTable('progress', progressBar);
}
