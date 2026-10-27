// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zoomMedia.ts
 * @input Nothing; data only
 * @output Exports `zoomMedia`: UIScrollView
 *   zooming as a photo viewer uses *   it — the overshoot past the zoom limits, the eased curve and duration
 *   law of the return from an overshoot and of `zoom(to:animated:)`, and
 *   Photos' double-tap and maximum zoom, the gap between its pages, and
 *   its drag-to-dismiss (the shrink and fades by travel, the release rule,
 *   the dismissal's and the cancel's springs), the zoom transition from
 *   a source (its springs and the two portals' fades), the chrome a tap
 *   or a zoom hides (its fade and the background's turn to black), and the
 *   pinch that closes the viewer (its release rule, fades and springs)
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
  transition: {
    /**
     * The zoom transition's opening (iOS 18 `.zoom`): one critically damped
     * spring drives both portals' frames and fades. Against the logged
     * frames it fits within 1.9 pt RMS, the motion starting about 13 ms
     * before the first frame that shows it.
     * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
     *   modal and a push with `preferredTransition = .zoom` from a 118 pt
     *   cell, the `UIViewSpringAnimationBehavior` UIKit logged (damping
     *   ratio 1.0, response 0.34) and both portals' frames, Oct 24 2026
     */
    openSpring: {response: 0.34, dampingRatio: 1},
    /**
     * The closing frame's spring: a small undershoot into the cell (117.8 pt
     * then 118 for a 118 pt cell).
     * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, the
     *   close of the same transition, behavior 0.92 / 0.34, Oct 24 2026
     */
    closeSpring: {response: 0.34, dampingRatio: 0.92},
    /**
     * The closing fades' spring.
     * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, the
     *   same close, behavior 1.0 / 0.34, Oct 24 2026
     */
    closeFadeSpring: {response: 0.34, dampingRatio: 1},
    /**
     * The detail's opacity is min(1, gain × progress): 0.318 / 0.675 /
     * 0.829 at 33 / 67 / 83 ms, opaque by about 0.12 s.
     * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, the
     *   detail portal's effective opacity per frame against the spring's
     *   progress, Oct 24 2026
     */
    detailFadeGain: 1.56,
    /**
     * The source portal's opacity is min(1, gain × (1 − progress)): 0.863 /
     * 0.577 / 0.295 / 0.143 at 67 / 100 / 150 / 200 ms.
     * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, the
     *   source portal's effective opacity per frame against the spring's
     *   progress, Oct 24 2026
     */
    sourceFadeGain: 1.5,
  },
  chrome: {
    /**
     * Photos hides its bars and controls (the chrome) for a single tap: on
     * the photo once a double tap can no longer follow (~385 ms after the
     * lift), beside it at the lift. A zoom hides them too: a double tap as it
     * zooms in, a pinch as it passes the fitted size (before the lift). The
     * next tap, and a return to the fitted size, show them. While zoomed the
     * background stays black and a tap toggles only the chrome; a cancelled
     * drag to dismiss brings the chrome back and leaves the black. Every
     * change runs the chrome's opacity on a CABasicAnimation this long, s,
     * on `fadeCurve`.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the
     *   CAAnimations added at single taps beside a 3000 × 2000 photo and at
     *   double taps on it (opacity, duration 0.2), with the bars' opacity per
     *   frame, Oct 24 2026
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, taps on
     *   the photo at the fitted size and zoomed, pinches past and back to the
     *   fitted size, and a cancelled drag with the chrome hidden, the chrome
     *   and the background per frame, Oct 24 2026
     */
    fadeSeconds: 0.2,
    /**
     * The chrome fade's timing function: easeInEaseOut.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the same
     *   CAAnimations (timing function control points), Oct 24 2026
     */
    fadeCurve: [0.42, 0, 0.58, 1],
    /**
     * The viewer's background turns black as the chrome hides and back as
     * it shows, over this long, s, easeInEaseOut (`fadeCurve`).
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the
     *   backgroundColor CAAnimations at the same taps (duration 0.1) and the
     *   background colour per frame, Oct 24 2026
     */
    backgroundSeconds: 0.1,
    /**
     * Hiding, the background waits this long, s, before it turns; showing,
     * it turns at once.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the
     *   UIView animation that carries the background (delay 0.1 when the
     *   chrome hides, 0 when it shows), Oct 24 2026
     */
    backgroundHideDelaySeconds: 0.1,
  },
  pinchClose: {
    /**
     * A pinch that starts at the fitted size and goes below it shrinks the
     * photo with the fingers, about their centroid, which it follows: no
     * resistance (a pinch that starts zoomed rubber-bands below the fitted
     * size instead, `overshoot`, and never closes). Released, it closes into
     * its thumbnail when the pinch's scale (the recognizer's, relative to the
     * span it began at, as UIPinchGestureRecognizer's) went below this and
     * was not reopened by `reopenScale`: straight in, 0.93414 at the lift
     * closed and 0.93517 sprang back (finger scales 0.903 and 0.904, two runs
     * each), still or moving, at any speed.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, a
     *   3000 × 2000 photo opened from the Library grid, two-finger pinches
     *   synthesized in-process (60 Hz), the pinch recognizer's scale read
     *   after every touch event and the outcome of releases at finger scales
     *   0.95 … 0.40 and 0.901 … 0.909, Oct 24 2026
     */
    closeScale: 0.9347,
    /**
     * A pinch reopened by this much from its smallest scale springs back
     * instead of closing, at any depth (recognizer scale, absolute: the same
     * at depths 0.62 and 0.83): +0.04965 closed and +0.05069 sprang back.
     * The recognizer's velocity does not decide it (+0.035 closed while its
     * velocity read −0.9 per s, +0.040 … +0.048 closed at +1.1 … +5.2 per s).
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, the same
     *   setup, pinches in to finger scales 0.6 and 0.8 reopened by 0.035 …
     *   0.052 before a still release, the recognizer read after every touch
     *   event, Oct 24 2026
     */
    reopenScale: 0.0502,
    /**
     * The backdrop's opacity against the pinch's scale, as [scale, opacity]
     * pairs; between them it interpolates, past the last it is 0.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, a
     *   3000 × 2000 photo opened from the Library grid, two-finger pinches
     *   synthesized in-process (60 Hz), the one-up background view's opacity per frame (the same on the way back out), Oct 24 2026
     */
    // prettier-ignore
    backdropAlpha: [[1, 1], [0.95, 0.98], [0.9, 0.95], [0.87, 0.93], [0.85, 0.9], [0.82, 0.86], [0.8, 0.81], [0.77, 0.76], [0.75, 0.7], [0.72, 0.64], [0.69, 0.58], [0.67, 0.51], [0.64, 0.44], [0.62, 0.38], [0.59, 0.31], [0.56, 0.26], [0.54, 0.2], [0.51, 0.15], [0.49, 0.11], [0.46, 0.08], [0.43, 0.05], [0.41, 0.02]],
    /**
     * The chrome's opacity falls this much per unit of scale below 1, from
     * 1: 0.98 → 0.89, 0.90 → 0.43, 0.85 → 0.12, gone at 0.83.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, a
     *   3000 × 2000 photo opened from the Library grid, two-finger pinches
     *   synthesized in-process (60 Hz), the navigation bar's opacity per frame, Oct 24 2026
     */
    chromeAlphaPerScale: 5.9,
    /**
     * Closing, the photo flies into its thumbnail on this critically damped
     * spring (position and size, from the release's velocity), while the
     * backdrop and the chrome fade out on it.
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, a
     *   3000 × 2000 photo opened from the Library grid, two-finger pinches
     *   synthesized in-process (60 Hz), CASpringAnimation on position and bounds.size at the lift: mass 1, damping ratio 1, stiffness 924 … 969 (response 0.202 … 0.207 s); opacities stiffness 947.29, damping 61.556, Oct 24 2026
     */
    closeSpring: {response: 0.204, dampingRatio: 1},
    /**
     * With no thumbnail to return to, a pinch-closed photo shrinks to this
     * fraction of its fitted size about the fitted box's centre, fading out
     * on the way.
     * @source GUESS — Photos scrolls its grid to the photo's cell before
     *   closing into it, so the stand-in for a page with no thumbnail is to
     *   measure
     * @measure M-ZM4
     */
    missingSourceScale: 0.5,
    /**
     * Springing back, the photo returns to the fitted size on this
     * critically damped spring from rest, settled ~0.37 s after the lift;
     * the backdrop and the chrome return on `closeSpring`. (Photos starts
     * the closing spring first and adds this one 2–3 ms later, a ~70 ms dip
     * toward the thumbnail that is not reproduced.)
     * @source measured: Photos, iOS 26.2 simulator, iPhone 17 Pro, a
     *   3000 × 2000 photo opened from the Library grid, two-finger pinches
     *   synthesized in-process (60 Hz), the return CASpringAnimation (stiffness 695.97, damping 52.762, mass 1, initial velocity 0), Oct 24 2026
     */
    returnSpring: {response: 0.238, dampingRatio: 1},
  },
} as const;
