// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sheet.ts
 * @input Nothing; data only
 * @output Exports `sheet`: how UISheetPresentationController resolves a
 *   drag's release, the target projection and the speed that picks the
 *   release spring
 * @position The sheet domain of the UIKit constants table (motion/uikit);
 *   its springs are `springs.sheetPresent`, `.sheetDismiss`, `.sheetDetent`,
 *   `.sheetReleaseFast` and `.sheetDismissSwipe`
 *
 * Read from UIKit with a `[.medium(), .large()]` sheet in an injected host
 * app on the iOS 26.2 simulator: the release velocity UIKit computed, the
 * offset it released at, the detent it settled on and the
 * `CASpringAnimation` it attached, for every release. Speeds are in pt/s
 * (CSS px/s); times in seconds.
 *
 * Every leaf carries one or more `@source`; webkit and GUESS values also carry
 * the `@measure` task that will confirm or replace them. uikit.test.ts
 * enforces both.
 *
 * SYNC: When modified, update /packages/core/src/motion/README.md
 */

export const sheet = {
  release: {
    /**
     * How far ahead a release is projected, as seconds of its velocity: the
     * sheet settles on the position nearest `offset + velocity × this`,
     * the dismissed position (fully off screen) counting as one of them.
     * Linear in the velocity; at rest, the nearest position.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, 47 drag releases of a [.medium(), .large()] sheet
     *   between 0 and 4000 pt/s (offset and velocity of the sheet
     *   interaction's last drag update before the lift, outcome from the
     *   detent it settled on): a linear projection at 0.114 s reproduces 44;
     *   two others straddle the medium / dismissed boundary less than 1 pt
     *   from it, closer than any single value separates (reading noise), and
     *   the last one's final drag update under-reports its throw (1140 pt/s
     *   for a 3000 pt/s injection). A quadratic projection (v·|v|) is
     *   rejected by releases at 927, 991 and 997 pt/s, Oct 23 2026
     */
    projectionSeconds: 0.114,
    /**
     * Release speed (pt/s, in either direction, toward or away from the
     * target) from which the settle runs on `springs.sheetReleaseFast` (80 %
     * damping) instead of `springs.sheetDetent` (critically damped); the
     * midpoint of the measured bracket. Interactive dismissal follows the
     * same rule, with `springs.sheetDismissSwipe`.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CASpringAnimation dump per release against the sheet
     *   interaction's last drag velocity: damping 36.515 (ζ 1) at every
     *   release up to 997 pt/s, 29.212 (ζ 0.8) at 1147 pt/s and every one
     *   faster, toward the target or away from it, so the switch lies in
     *   (997, 1147], Oct 23 2026
     */
    fastSpeed: 1072,
  },
} as const;
