// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zoomMedia.ts
 * @input Nothing; data only
 * @output Exports `zoomMedia`: UIScrollView
 *   zooming as a photo viewer uses *   it — the overshoot past the zoom limits, the eased curve and duration
 *   law of the return from an overshoot and of `zoom(to:animated:)`, and
 *   Photos' double-tap and maximum zoom
 * @position A component domain of the UIKit constants table (motion/uikit);
 *   read by Lightbox's zoom stage (Lightbox/zoomStage.ts) and its touch
 *   module. Internal constants: touch motion has no theme surface
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

import {reducedMotionCrossFade} from './timing';

/**
 * UIScrollView zooming as a photo viewer uses it, with Photos' double-tap
 * and maximum zoom (the header has the measurements). Re-exported from
 * motion/uikit, inside core.
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
     * transform and position and the scroll view's bounds, easeInEaseOut:
     * the `timing.curves.move` leaf itself, so the settle plays that role.
     * Zoom and offset move together on it.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CAAnimation read (timing function control points),
     *   Oct 23 2026
     */
    curve: reducedMotionCrossFade.curve,
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
  },
} as const;
