// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file bars.ts
 * @input Nothing; data only
 * @output Exports `bars`: when the iOS 26 scroll edge effect under a
 *   navigation bar appears and leaves, the springs it fades on, how far it
 *   reaches below the bar, and the shape of its veil; the bar's height and
 *   the geometry of the capsules its buttons sit on
 * @position The bars domain of the UIKit constants table (motion/uikit)
 *
 * On iOS 26.2 a navigation bar paints no background of its own: its
 * `_UIBarBackground` has no visible subviews in any appearance, and pushing
 * or popping animates no bar background. What separates the bar from the
 * content scrolling under it is the scroll view's edge effect
 * (`UIKit.ScrollEdgeEffectView`), which fades in once the content has moved
 * a few points under the bar: a veil of one colour, strongest at the top and
 * gone by the bar's bottom edge, with nothing blurred. Its colour is a theme
 * value; this file holds its shape and when and how it moves.
 *
 * Every value was read from UIKit on the iOS 26.2 simulator (iPhone 17 Pro)
 * in a UIKit host app: a UITableView under a standard navigation bar, its
 * content offset stepped in 0.25 pt increments and driven with real HID
 * drags, the effect view's model and presentation layers read after every
 * step and every frame, and `-[CALayer addAnimation:forKey:]` hooked on it.
 * Lengths are in pt (CSS px).
 *
 * Every leaf carries one or more `@source`; uikit.test.ts enforces it.
 *
 * SYNC: When modified, update /packages/core/src/motion/MEASUREMENTS.md
 */

import {registerMotionTable} from '../roles';

export const bars = {
  /**
   * The navigation bar under the status bar, with an inline title: this many
   * pt tall. Its buttons' capsules sit at its top edge and the title is
   * centred on them, leaving 10 pt below.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, `UIKit.NavigationBarPlatterContainer` frame
   *   (0, 62, 402, 54) under an inline title, every MR-9 configuration,
   *   Oct 23 2026
   */
  heightPt: 54,
  /**
   * iOS 26 bar buttons sit on glass capsules
   * (`_UINavigationBarPlatterGlassView`): image items side by side share
   * one capsule, every other item gets its own, and a fixed space splits a
   * run. The glass has no shadow layer, and its colour follows the content
   * behind it rather than the appearance (white over a white list, #191919
   * over a black one, in light and dark mode alike); on the web the
   * capsule paints the theme's general surface, opaque, with nothing
   * blurred.
   */
  buttonCapsules: {
    /**
     * Every capsule is this many pt tall, with a corner radius of half that
     * (22): a lone image item is a 44 × 44 circle.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, platter and glass view frames for a lone image item,
     *   two image items, image + text, a fixed space and `.prominent` (all
     *   44 tall, cornerRadius 22, at the bar's top y 62), Oct 23 2026
     */
    heightPt: 44,
    /**
     * The outermost capsule keeps this many pt from the screen's edge, on
     * both sides.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the trailing capsule's right edge at x 386 on a
     *   402-wide screen in every configuration, and the back button's circle
     *   at x 16, Oct 23 2026
     */
    edgeInsetPt: 16,
    /**
     * Neighbouring capsules are this many pt apart.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, a fixed space between two image items (44 circles at
     *   x 286 and 342) and an image item beside "Edit" (x 267.67 + 44, then
     *   323.67), Oct 23 2026
     */
    gapPt: 12,
    /**
     * Inside a capsule, the items' cells start this many pt in from each
     * end.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, one `_UIButtonBarButton` per item, the first starting
     *   4 pt in from the capsule's end (batch 18c), Oct 24 2026
     */
    cellInsetPt: 4,
    /**
     * Each item's cell is this many pt tall, centred on the capsule (4 pt
     * above and below).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, `_UIButtonBarButton` 36 pt tall at y 66 inside the
     *   44 pt glass view at y 62 (batch 18c), Oct 24 2026
     */
    cellHeightPt: 36,
    /**
     * Cells in one capsule are this many pt apart.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, two image items (cells at x 282.67, 41 wide, and
     *   339.67) and three (4 + 39.33 + 16 + 41 + 16 + 42.33 + 4 = 162.67)
     *   (batch 18c), Oct 24 2026
     */
    cellGapPt: 16,
    /**
     * An image item's cell is its glyph's width plus this many pt on each
     * side, and at least `cellHeightPt` wide: a lone image is a 36 pt cell,
     * so its capsule is the 44 pt circle.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, glyphs 27 and 28.33 pt wide in cells 41 and 42.33,
     *   and a lone image's 36 × 36 cell (batch 18c), Oct 24 2026
     */
    imagePaddingPt: 7,
    /**
     * A text item's cell is its label plus this many pt on each side:
     * "Edit" (SF Medium 17, 30.33 wide) is a 54.33 pt cell in a 62.33 pt
     * capsule.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the "Edit" label 30.33 wide in a 54.33 cell
     *   (batch 18c), Oct 24 2026
     */
    textPaddingPt: 12,
  },
  scrollEdgeEffect: {
    /**
     * The soft top edge effect is off while the content sits at most this
     * many pt past its rest offset and on beyond it: a switch, not a ramp
     * (opacity 0 through +10.0 pt, 1 from +10.25 pt, the same right after a
     * step and 500 ms later). The same threshold turns it off on the way
     * back; no hysteresis. Overscroll above the rest offset keeps it off.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, content offset stepped from +7.5 to +12.5 pt past
     *   rest in 0.25 pt steps, ScrollEdgeEffectView model and presentation
     *   opacity read after each step and 500 ms later, Oct 23 2026
     */
    switchPt: 10,
    /**
     * The effect fading in when the content passes the switch: its opacity
     * goes 0 → 1 on this CASpringAnimation (critically damped, response
     * 0.2 s; Core Animation gives it 0.294 s).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, `-[CALayer addAnimation:forKey:]` hooked on the effect
     *   view while crossing the switch (opacity, mass 1, stiffness 986.96,
     *   damping 62.83, duration 0.294), and its presentation opacity sampled
     *   every frame through a 100 pt/s HID drag, Oct 23 2026
     */
    appear: {mass: 1, stiffness: 986.96, damping: 62.83},
    /**
     * The effect fading out when the content comes back over the switch:
     * opacity 1 → 0 on this CASpringAnimation (critically damped, response
     * 0.35 s; Core Animation gives it 0.514 s).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, `-[CALayer addAnimation:forKey:]` hooked on the effect
     *   view while crossing the switch back (opacity, mass 1, stiffness
     *   322.27, damping 35.90, duration 0.514), and its presentation opacity
     *   sampled every frame through the drag back to rest, Oct 23 2026
     */
    disappear: {mass: 1, stiffness: 322.27, damping: 35.9},
    /**
     * How far the soft edge reaches below the bar's bottom edge, in pt: the
     * effect view is 170.8 pt tall under a bar whose bottom edge is at
     * 116 pt (62 pt of safe area and a 54 pt bar).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, ScrollEdgeEffectView frame (0, 0, 402, 170.8) under a
     *   standard navigation bar at y 62, height 54, Oct 23 2026
     */
    softExtentPt: 54.8,
    veil: {
      /**
       * The effect is a veil of one colour composited over the content, at
       * most this alpha: the opacity of its LuminanceAdjustment layer, in
       * light and dark mode alike. Plain alpha: black and mid-grey content
       * read through it with the same alpha. On iOS the veil's colour and
       * strength adapt to the luminance of the content behind the bar (with a
       * title, a white list shows no change, mid-grey is darkened and black
       * flips the title to white); the web veil takes the bar's theme colour.
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, screenshots of solid black, #808080 and white
       *   content under the effect read per pt row (y 0–180, light and dark,
       *   with and without a title), and the LuminanceAdjustment layer's
       *   opacity (0.85 in both modes), Oct 23 2026
       */
      maxAlpha: 0.85,
      /**
       * Where the veil's edge is half-transparent under a bar that shows a
       * title (inline, or a collapsed large title): this many pt above the
       * bottom of the bar's content (y 106 under a bar whose bottom edge is
       * at 116). The mask is the Gaussian shadow of a rectangle ending
       * there. A bar with no content puts it 11 pt above the status bar's
       * bottom instead (y 51, softness 24), and an expanded large title sits
       * outside the veil.
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, PocketMask's ShadowLayer frame in window coordinates
       *   with an inline title and with a collapsed large title (bottom edge
       *   at y 106), with no bar content and with an expanded large title
       *   (y 51), Oct 23 2026
       */
      edgeAboveContentBottomPt: 10,
      /**
       * How soft the edge is under a titled bar: the veil's alpha is
       * `maxAlpha × (1 − Φ((y − edge) / softnessPt))`, Φ the standard normal
       * CDF (the ShadowLayer's shadowRadius; the profile over #808080 is
       * centred near y 106 with σ ≈ 18). Nothing behind it is blurred: a
       * 1 pt stripe pattern loses exactly the contrast the veil explains.
       * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
       *   iPhone 17 Pro, the ShadowLayer's shadowRadius (18 with a title, 24
       *   without), per-pt-row profiles, 1 pt stripe contrast per row,
       *   Oct 23 2026
       */
      softnessPt: 18,
    },
  },
} as const;

/**
 * Registers the bars table (motion/roles.ts). It lists no roles: the scroll
 * edge effect's springs stay internal constants until the public
 * motion-token set is decided (`spec:AST-094` FR4, DEC-11), and the switch,
 * the extent and the veil are not motion (not springs, durations or curves).
 * Nothing registers on import: AppShell, which animates with this table,
 * hands it to the scroll edge effect (hooks/useScrollEdgeEffect.ts), which
 * calls it once before its first animation (it is idempotent).
 */
export function registerBarsTable(): void {
  registerMotionTable('bars', bars);
}
