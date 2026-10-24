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
     * How far ahead a slow release is projected, as seconds of its velocity:
     * below `fastSpeed` the sheet settles on the position nearest
     * `offset + velocity × this`, the dismissed position (fully off screen)
     * counting as one of them. At rest, the nearest position.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, 134 drag releases of a [.medium(), .large()] sheet
     *   between 0 and 4000 pt/s (offset and velocity of the sheet
     *   interaction's last drag update before the lift, outcome from the
     *   detent it settled on), 47 on Oct 23 and 87 on Oct 24 2026 placed to
     *   separate the candidate laws: with `fastSpeed`'s flick branch, every
     *   release fits for any value from 0.092 to 0.104 s. A single linear
     *   projection fits at most 122 of them (at 0.103 s), and a quadratic
     *   one (offset + k·v·|v|) at most 126
     */
    projectionSeconds: 0.1,
    /**
     * Release speed (pt/s, in either direction) from which a release is a
     * flick: it goes at least to the next position beyond where it is in
     * its direction (`detentTolerance`), or to the projection's nearest
     * position if that is farther. The same speed switches the settle from
     * `springs.sheetDetent` (critically damped) to `springs.sheetReleaseFast`
     * (80 % damping); an interactive dismissal at it takes
     * `springs.sheetDismissSwipe`. Inside the measured bracket.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, 134 drag releases with the CASpringAnimation dump of
     *   each: damping 36.515 (ζ 1) at every release up to 997 pt/s and
     *   29.212 (ζ 0.8) at every one from 1147 pt/s on (Oct 23 2026); with
     *   the 0.1 s projection the outcomes fit the flick branch for a
     *   threshold from 997 to 1028 pt/s, and the spring follows the branch on
     *   all 87 releases of Oct 24 2026, so the switch lies in (997, 1028]
     */
    fastSpeed: 1008,
    /**
     * How close to a position (pt) a flick's offset counts as on it, so the
     * next position beyond is the one after it. Inside the measured bracket.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the 134 releases: two flicks released exactly on the
     *   medium detent go on to the next position in their direction, and one
     *   released 6.7 pt above it moving down stops at medium, so any value
     *   from 0 to 6.6 pt fits, Oct 24 2026
     */
    detentTolerance: 1,
  },
} as const;
