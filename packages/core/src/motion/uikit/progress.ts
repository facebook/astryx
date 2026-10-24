// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file progress.ts
 * @input Nothing; data only
 * @output Exports `progress`: UIActivityIndicatorView's drawing and clock
 *   (eight spokes, a 16-frame 0.8 s cycle, the alpha a spoke steps through
 *   after the bright head reaches it, the medium and large geometry) and
 *   UIProgressView's fill (minimum width, empty alpha, animated timing),
 *   and iOS Safari's indeterminate `<progress>` (segment, sweep, the Reduce
 *   Motion pulse)
 * @position The progress domain of the UIKit constants table (motion/uikit);
 *   read by the touch presentations of Spinner and ProgressBar
 *
 * UIKit draws the indicator as a plain layer whose `contents` steps through
 * sixteen pre-rendered images (a discrete keyframe animation, evenly spaced,
 * repeating forever). In each image the eight spokes carry their alpha baked
 * in; the values below are read from those images.
 *
 * Every leaf carries one or more `@source`; webkit and GUESS values also carry
 * the `@measure` task that will confirm or replace them. uikit.test.ts
 * enforces both.
 *
 * Lengths are in points (CSS px), durations in ms, alphas in 0..1.
 *
 * SYNC: When modified, update /packages/core/src/Spinner/Spinner.tsx (its
 * keyframes are literals, which Spinner.test.tsx checks against this file)
 * and /packages/core/src/ProgressBar/ProgressBar.tsx (its minimum fill and
 * indeterminate keyframes are literals, which ProgressBar.test.tsx checks).
 */

/**
 * UIActivityIndicatorView's and UIProgressView's values.
 * @experimental
 */
export const progress = {
  activityIndicator: {
    /**
     * Spokes, 45° apart, the first at 12 o'clock.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the indicator layer's contents keyframe images
     *   (medium and large), Oct 24 2026
     */
    spokeCount: 8,
    /**
     * One cycle of the contents animation: a full turn of the bright head.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CAKeyframeAnimation on `contents` (duration 0.8 s,
     *   discrete, repeatCount infinite), Oct 24 2026
     */
    cycleMs: 800,
    /**
     * Images per cycle, shown for equal times (no keyTimes): 50 ms each.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CAKeyframeAnimation on `contents` (16 values, no
     *   keyTimes), Oct 24 2026
     */
    framesPerCycle: 16,
    /**
     * The head moves clockwise one spoke every two images; in the image
     * between, every lit spoke dims by one step and none brightens.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-spoke alpha of the 16 contents images, Oct 24 2026
     */
    framesPerSpoke: 2,
    /**
     * The spoke the head is on in the first image, counted clockwise from
     * 12 o'clock: 6 is 9 o'clock. The stopped indicator shows this image.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, contents image 0 and the hidesWhenStopped = false
     *   image, Oct 24 2026
     */
    headSpokeAtStart: 6,
    /**
     * A spoke's alpha in each image from the one where the head reaches it
     * (the head) onwards; the last value holds until the head comes round
     * again. Absolute alphas of the images, which are drawn in the view's
     * color (#3C3C43 at the alpha below), so they include it.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-spoke alpha of the 16 contents images (medium and
     *   large identical), Oct 24 2026
     */
    spokeAlphas: [0.51, 0.467, 0.424, 0.38, 0.337, 0.294, 0.251, 0.208, 0.165],
    /**
     * The view color's own alpha (secondary label), already included in the
     * spoke alphas: divide by it for the multiplier on another color.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, UIActivityIndicatorView color (0.235, 0.235, 0.263,
     *   0.6), Oct 24 2026
     */
    colorAlpha: 0.6,
    /**
     * Each indicator starts its own cycle at the first image when it starts
     * animating: two started 0.62 s apart stay 0.62 s apart.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, beginTime of two indicators' contents animations,
     *   Oct 23 2026
     */
    startsAtFirstFrame: true,
    /**
     * Reduce Motion leaves the indicator unchanged, and so does a right-to-
     * left layout: the same images in the same order, turning clockwise.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the contents animation with Reduce Motion on and with
     *   semanticContentAttribute forceRightToLeft, Oct 23 and 24 2026
     */
    unchangedByReduceMotionOrRtl: true,
    medium: {
      /**
       * The view's side (`.medium`); the spokes are drawn about its centre.
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, intrinsic size of UIActivityIndicatorView(style:
       *   .medium), Oct 23 2026
       */
      sizePt: 20,
      /**
       * Where the spokes are centred, from the view's top-left corner, on both
       * axes: the view's centre.
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, ink bounds of the 60 × 60 px contents images, which
       *   fill the view (contentsGravity resize), Oct 24 2026
       */
      glyphCenterPt: 10,
      /**
       * Spoke width, a capsule with round caps: the half-maximum width across
       * each spoke at mid-length.
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, the 60 × 60 px contents images, averaged over the four
       *   axis-aligned spokes of all 16, Oct 24 2026
       */
      spokeWidthPt: 2.55,
      /**
       * Distance from the centre to a spoke's inner end (half maximum along
       * its centreline).
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, the 60 × 60 px contents images, averaged over the four
       *   axis-aligned spokes of all 16, Oct 24 2026
       */
      spokeInnerRadiusPt: 3.35,
      /**
       * Distance from the centre to a spoke's outer end: the frame's edge.
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, the 60 × 60 px contents images, averaged over the four
       *   axis-aligned spokes of all 16, Oct 24 2026
       */
      spokeOuterRadiusPt: 10,
    },
    large: {
      /**
       * The view's side (`.large`). The spokes span 35 pt of it (see
       * `glyphCenterPt`).
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, intrinsic size of UIActivityIndicatorView(style:
       *   .large), and the ink bounds of its 111 × 111 px contents images,
       *   Oct 23 and 24 2026
       */
      sizePt: 37,
      /**
       * Where the spokes are centred, from the view's top-left corner, on both
       * axes: 1 pt up and left of the view's centre, because the image is
       * drawn from its top-left corner and fills the view as drawn.
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, ink bounds of the 111 × 111 px contents images and
       *   the contents layer (37 × 37 at the view's origin, contentsGravity
       *   resize, contentsRect (0, 0, 1, 1), no transform), Oct 24 2026
       */
      glyphCenterPt: 17.5,
      /**
       * Spoke width, a capsule with round caps: the half-maximum width across
       * each spoke at mid-length.
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, the 111 × 111 px contents images, averaged over the
       *   four axis-aligned spokes of all 16, Oct 24 2026
       */
      spokeWidthPt: 5,
      /**
       * Distance from the centre to a spoke's inner end (half maximum along
       * its centreline).
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, the 111 × 111 px contents images, averaged over the
       *   four axis-aligned spokes of all 16, Oct 24 2026
       */
      spokeInnerRadiusPt: 5.5,
      /**
       * Distance from the centre to a spoke's outer end.
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, the 111 × 111 px contents images, averaged over the
       *   four axis-aligned spokes of all 16, Oct 24 2026
       */
      spokeOuterRadiusPt: 17.5,
    },
  },
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
     * setProgress(_:animated: true) runs for this long per whole unit of
     * progress it moves, measured on the model values (0.2 → 0.8 takes
     * 0.6 s), starting from wherever the fill is drawn when it is retargeted.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, UIView animation on the fill's frame (duration,
     *   beginFromCurrentState) for jumps of 0.6, 0.4 and 0.6, Oct 23 2026
     */
    animatedMsPerProgress: 1000,
    /**
     * That animation's curve is linear, and Reduce Motion leaves it
     * unchanged.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the fill's position animation (timing function
     *   linear), with Reduce Motion off and on, Oct 23 2026
     */
    animatedCurveIsLinear: true,
  },
  indeterminateWebProgress: {
    /**
     * iOS Safari's own `<progress>` with no value (UIKit has no indeterminate
     * bar): the moving segment's width, as a fraction of the track; a capsule
     * of its own that meets the track's round ends without clipping.
     * @source measured: WebKit's iOS RenderTheme in a WKWebView (Mobile
     *   Safari's renderer), iOS 26.2 simulator, iPhone 17 Pro, a
     *   `<progress>` 300 pt wide: the segment is 74.5 of the 298 pt track,
     *   Oct 24 2026
     */
    segmentFraction: 0.25,
    /**
     * One sweep of the segment from one end of the track to the other, in
     * ms; it then sweeps back (a ping-pong), linearly.
     * @source measured: WebKit's iOS RenderTheme in a WKWebView, iOS 26.2
     *   simulator, iPhone 17 Pro: turns 1.0 s apart, a linear fit within
     *   0.013 of the travel, Oct 24 2026
     */
    sweepMs: 1000,
    /**
     * With Reduce Motion the segment does not travel: the whole bar is drawn
     * in the fill color at an alpha pulsing between these values, linearly,
     * starting at the first.
     * @source measured: WebKit's iOS RenderTheme in a WKWebView, iOS 26.2
     *   simulator, iPhone 17 Pro, Reduce Motion on: 0.303 and 0.601 from the
     *   composite, starting at the low one, Oct 24 2026
     */
    reducedMotionAlpha: [0.3, 0.6],
    /**
     * Each direction of that pulse, in ms.
     * @source measured: WebKit's iOS RenderTheme in a WKWebView, iOS 26.2
     *   simulator, iPhone 17 Pro, Reduce Motion on: 1.0 s each way,
     *   Oct 24 2026
     */
    reducedMotionPulseMs: 1000,
  },
} as const;
