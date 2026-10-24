// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zoomMedia.ts
 * @input Nothing; data only
 * @output Exports `zoomMedia`: UIScrollView zooming as a photo viewer uses
 *   it — the overshoot past the zoom limits, the eased curve and duration
 *   law of the return from an overshoot and of `zoom(to:animated:)`, and
 *   Photos' double-tap and maximum zoom, the gap between its pages, and
 *   its drag-to-dismiss (the shrink and fades by travel, the release rule,
 *   the dismissal's and the cancel's springs)
 * @position A component domain of the UIKit constants table (motion/uikit);
 *   read by Lightbox's zoom stage (Lightbox/zoomStage.ts)
 *
 * Measured on the iOS 26.2 simulator (iPhone 17 Pro, 402 × 874 pt at 3×):
 * a UIKit host app's full-screen UIScrollView zooming one image view
 * (minimumZoomScale = fit, maximum 4, bouncesZoom on), and Photos itself on
 * 3000 × 2000 and 2000 × 3000 photos, driven with real HID touches; every
 * `CAAnimation` UIKit added and every zoomScale / contentOffset it set were
 * logged. Findings that shape the stage and carry no number: the zoom equals
 * the pinch's scale 1:1 inside the limits, and the content point under the
 * fingers' centroid stays under it (within 1 pt), past the limits too; a
 * pinch released inside the limits keeps no scale momentum; a two-finger tap
 * does nothing; the double tap fires on the second lift, with no wait.
 *
 * Every leaf carries one or more `@source`; webkit and GUESS values also
 * carry the `@measure` task that will confirm or replace them. uikit.test.ts
 * enforces both.
 *
 * SYNC: When modified, update /packages/core/src/motion/MEASUREMENTS.md
 */

export const zoomMedia = {
  overshoot: {
    /**
     * Past a zoom limit the zoom gives way: past the maximum M it reads
     * M·(f − (f − 1)·M ÷ s), past the minimum m it reads m ÷ (f − (f − 1)·s ÷ m),
     * s the pinch's own scale; with f = 2 it leaves the limit at the pinch's
     * pace and approaches f times the limit (2M, m ÷ 2). Pinch 4.5 / 5 / 5.5
     * / 6 past a maximum of 4 read 4.444 / 4.8 / 5.091 / 5.333; 0.85 / 0.7 /
     * 0.474 / 0.323 past a minimum of 1 read 0.870 / 0.769 / 0.655 / 0.596.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, zoomScale against the pinch recognizer's scale per
     *   event, Oct 23 2026
     */
    limitFactor: 2,
  },
  settle: {
    /**
     * The return from past a limit, and `zoom(to:animated:)` /
     * `setZoomScale(_:animated:)`: a CABasicAnimation on the image view's
     * transform and position and the scroll view's bounds, easeInEaseOut
     * (`timing.curves.easeInOut`). Zoom and offset move together on it.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CAAnimation read (timing function control points),
     *   Oct 23 2026
     */
    curve: [0.42, 0, 0.58, 1],
    /**
     * Its duration, s, is this plus `secondsPerLnRatio` × |ln(zoom ratio)|:
     * 5.333 → 4 lasts 0.186 s, 4.8 → 4 0.155 s, 0.596 → 1 0.255 s.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CAAnimation durations of releases past the limits and
     *   of zoom(to:animated:), Oct 23 2026
     */
    baseSeconds: 0.1,
    /**
     * See `baseSeconds`.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CAAnimation durations of releases past the limits and
     *   of zoom(to:animated:), Oct 23 2026
     */
    secondsPerLnRatio: 0.3,
    /**
     * `zoom(to:animated:)` never takes longer than this, s: 1 ↔ 2.5 takes
     * 0.375 s, a rect 4 times smaller 0.400 s; Photos' double tap from 1 to
     * 3.261 shows ~0.42 s of motion.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CAAnimation durations of zoom(to:animated:) and
     *   setZoomScale(_:animated:), Oct 23 2026
     */
    maxSeconds: 0.4,
  },
  viewer: {
    /**
     * A double tap at the fitted size zooms until the photo fills the stage
     * (aspect fill: a 402 × 268 landscape photo on the 874 pt tall screen
     * zooms 3.261×, a 402 × 603 portrait 1.449×), bringing the tapped point
     * to the centre, kept inside the stage (a tap near the edge stops at the
     * edge); a double tap while zoomed returns to the fitted size. Both run
     * `settle`.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro,
     *   zoomScale and contentOffset per frame after double taps at the
     *   centre and near the edge of 3000 × 2000 and 2000 × 3000 photos,
     *   Oct 23 2026
     */
    doubleTapZoom: 'aspectFill',
    /**
     * When the photo already fills the stage (its aspect is the stage's, or
     * a mouse double-clicks a photo shown at its own size), a double tap
     * zooms this many times instead.
     * @source GUESS — Lightbox's released double-click zoom; Photos' double
     *   tap on a photo with the screen's aspect is to measure
     * @measure M-ZM1
     */
    filledDoubleTapScale: 2,
    /**
     * The maximum zoom is this many times the zoom at which one image pixel
     * covers one device pixel: 14.93 for a 3000 × 2000 photo fitted 402 pt
     * wide at 3×, 9.95 for 2000 × 3000.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the
     *   zoomScale a pinch settles on past the maximum, 3000 × 2000 and
     *   2000 × 3000 photos, Oct 23 2026
     */
    maxPixelZoomMultiple: 6,
    /**
     * Space between photos while they page, pt: the pager's stride is the
     * screen's width plus this (442 on the 402 pt screen). It shows only
     * while a page moves.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the
     *   pager's contentOffset per page, Oct 23 2026
     */
    pageGap: 40,
  },
  dismiss: {
    /**
     * While a photo at its fitted size is dragged down, it shrinks about its
     * centre by 1 − k·d², d the drag's downward travel in pt (its centre
     * follows the finger): 0.997 / 0.978 / 0.942 / 0.899 at 25 / 65 / 105 /
     * 145 pt (k the least-squares fit, within 0.004).
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, a 3000 ×
     *   2000 photo at its fitted size dragged down 25–145 pt, the zoom
     *   view's bounds per frame, Oct 24 2026
     */
    scalePerTravelSquared: 4.91e-6,
    /**
     * The viewer's backdrop fades by 1 − k·d²: 1.0 / 0.95 / 0.86 / 0.71 at
     * 25 / 65 / 105 / 145 pt (k the least-squares fit, within 0.009).
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the same
     *   drags, the backdrop view's alpha per frame, Oct 24 2026
     */
    backdropAlphaPerTravelSquared: 1.35e-5,
    /**
     * The neighbouring photos and the controls fade faster, linearly once
     * the drag passes `chromeFadeStart`: 1 − k·(d − start), 0.96 / 0.76 /
     * 0.52 / 0.33 at 25 / 65 / 105 / 145 pt (fitted within 0.016).
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the same
     *   drags, the neighbouring pages' and the chrome's alpha per frame,
     *   Oct 24 2026
     */
    chromeAlphaPerPoint: 0.00533,
    /**
     * Travel, pt, before the controls start to fade (see
     * `chromeAlphaPerPoint`).
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the
     *   intercept of the same fit, Oct 24 2026
     */
    chromeFadeStart: 17.8,
    /**
     * A release within this distance of where the drag started cancels, as
     * a release moving up does; any other release dismisses, however short
     * the pull (20, 40 and 60 pt pulls held still, then lifted, dismiss; a
     * pull brought back to about 5 pt cancels).
     * @source GUESS — between the measured 5 pt (cancels) and 20 pt
     *   (dismisses); Photos, iOS 26.2 simulator, Oct 24 2026
     * @measure M-ZM3
     */
    cancelTravel: 10,
    /**
     * The dismissal's position spring (critically damped, response about
     * 0.21 s): the photo leaves along it.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, a
     *   committed drag-to-dismiss, the zoom view's position animation
     *   (`CASpringAnimation` mass 1, stiffness 918.09, damping 60.60),
     *   Oct 24 2026
     */
    dismissPositionSpring: {mass: 1, stiffness: 918.09, damping: 60.6},
    /**
     * The dismissal's spring for size and opacity (critically damped).
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the same
     *   dismissal, the bounds and opacity animations (stiffness 947.14,
     *   damping 61.55), Oct 24 2026
     */
    dismissSizeSpring: {mass: 1, stiffness: 947.14, damping: 61.55},
    /**
     * A cancelled drag's return, position (critically damped).
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, a pull
     *   flicked back up, the position animation (stiffness 877.63, damping
     *   59.25), Oct 24 2026
     */
    cancelPositionSpring: {mass: 1, stiffness: 877.63, damping: 59.25},
    /**
     * A cancelled drag's return, size and opacity (critically damped).
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the same
     *   return, the bounds animation (stiffness 955.23, damping 61.81),
     *   Oct 24 2026
     */
    cancelSizeSpring: {mass: 1, stiffness: 955.23, damping: 61.81},
  },
} as const;
