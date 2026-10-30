// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepper.ts
 * @input Nothing; data only
 * @output Exports `stepper`: the stepper's tap and autorepeat clocks (UIStepper's
 *   measured delay and fastest interval, and a proposed ramp between them),
 *   the timing of its pressed state and its shape, as measured on iOS 26.2
 * @position The stepper domain of the UIKit constants table (motion/uikit)
 *
 * Every leaf carries one or more `@source` (apple-docs | wwdc | webkit |
 * measured | GUESS); webkit and GUESS values also carry the `@measure` task
 * that will confirm or replace them (motion/README.md). uikit.test.ts
 * enforces both.
 *
 * iOS 26 draws the stepper with SwiftUI inside UIKit's control
 * (`UIStepperDesignLibraryVisualElement` hosting a `DesignLibraryStepper`),
 * so the pressed state was read as rendered (frame by frame), not from view
 * properties. Durations are in ms, lengths in pt (CSS px).
 *
 * SYNC: When modified, update /packages/core/src/motion/README.md (the domain
 * list) and /packages/core/src/NumberInput/stepperTracking.ts.
 */

export const stepper = {
  autorepeat: {
    /**
     * A finger held on a half steps it this long after the press reaches the
     * control, then keeps stepping; a quicker tap steps once, at the lift.
     * Outside a scroll view the press reaches it at touch-down; inside one,
     * after the scroll view's content-touch delay (the first step of a hold
     * there came at +653 ms).
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, valueChanged against the HID stream (holds of 0.8, 3 and 8 s: first step at +505, +508, +514 ms; in a vertical scroll view +653 ms), Oct 23 2026 and Oct 24 2026
     */
    delayMs: 500,
    /**
     * The interval before the second step of a hold. Each later interval is
     * `acceleration` times the one before, down to `minIntervalMs`: one
     * steady ramp. UIStepper waits 500 ms between its first six steps, then
     * drops to 100 ms and later to 50 ms; on a phone that read as slow, and a
     * gentle, predictable ramp was asked for (#8205).
     * @source GUESS — proposed, pending owner review: UIStepper measured 500 ms between its first repeats (+514, 1017, 1520, 2023, 2525, 3028 ms), iOS 26.2 sim, Oct 23 2026
     * @measure M-STP20
     */
    firstIntervalMs: 250,
    /**
     * Each repeat's interval as a fraction of the one before: a steady
     * acceleration with no jump.
     * @source GUESS — proposed, pending owner review, with `firstIntervalMs`
     * @measure M-STP20
     */
    acceleration: 0.9,
    /**
     * The shortest interval: the ramp stops here; the step size never grows.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, 8 s hold: steps 21 to 59 from +4514 to +6512 ms (52.5 ms apart), step size 1 throughout, Oct 23 2026
     */
    minIntervalMs: 50,
  },
  press: {
    /**
     * When the pressed half's fill changes after the press reaches the
     * control: in the first frame, with no animation (unchanged under Reduce
     * Motion); only the touched half changes.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, rendered frames of a 60 ms tap and a 1.2 s hold, with and without Reduce Motion, Oct 24 2026
     */
    highlightInMs: 0,
    /**
     * When the fill returns after the lift: in the first frame, with no
     * fade.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, rendered frames of a 60 ms tap and a 1.2 s hold, with and without Reduce Motion, Oct 24 2026
     */
    highlightOutMs: 0,
  },
  /**
   * The control's shape as rendered. Its colours are theme values (fill,
   * divider, glyphs, the pressed half); UIKit's, for reference: fill light
   * #EEEEEF / dark #121213, pressed #DADADB, divider and disabled glyph light
   * #B9B9BC / dark #535356, glyphs black / white.
   */
  look: {
    /**
     * Width, pt: two halves of 47.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, drawHierarchy crops at 3x (93–94 × 32 pt) and the halves' accessibility frames (47 × 32 each), Oct 24 2026
     */
    widthPt: 94,
    /**
     * Height, pt; the same at the largest Dynamic Type size (AX5).
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, drawHierarchy crops at 3x, default and AX5 text sizes, Oct 24 2026
     */
    heightPt: 32,
    /**
     * Corner radius, pt: a capsule.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, the crop's edge profile, Oct 24 2026
     */
    cornerRadiusPt: 16,
    /**
     * The divider between the halves: this wide, pt.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, drawHierarchy crops at 3x, Oct 24 2026
     */
    dividerWidthPt: 1,
    /**
     * The divider's height, pt, centred: 4 pt from the top and the bottom.
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, drawHierarchy crops at 3x, Oct 24 2026
     */
    dividerHeightPt: 24,
    /**
     * The glyphs' length, pt: − is a 13 pt bar, + two crossed ones, each
     * centred in its half (x 23.5 and 70.5).
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, drawHierarchy crops at 3x, Oct 24 2026
     */
    glyphLengthPt: 13,
    /**
     * The glyphs' stroke, pt (2.33 under Bold Text, which a page cannot read).
     * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, drawHierarchy crops at 3x, with and without Bold Text, Oct 24 2026
     */
    glyphStrokePt: 1.67,
  },
  /**
   * The haptic UIStepper plays: none, on a tap, during a hold, or when a
   * hold reaches the maximum.
   * @source measured: UIKit lab (injected host app), iOS 26.2 sim iPhone 17 Pro, UIFeedbackGenerator hooks armed (impact, selection, notification), a tap, a 3 s hold and a hold from 7 to the maximum 10, Oct 23 2026 and Oct 24 2026
   */
  haptic: 'none',
} as const;
