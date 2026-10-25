// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file search.ts
 * @input Nothing; data only
 * @output Exports `search`: UISearchController's activation and cancel clock,
 *   the stacked search field's geometry and its close button's entrance, the
 *   clear button, the navigation bar's fades over an activation, the field
 *   that scrolls away with the content, and the bottom placement's rest above
 *   the keyboard
 * @position The search domain of the UIKit constants table (motion/uikit);
 *   read by lab's SearchField, and by the navigation stack's bar and the tab
 *   bar's search tab that host it. The keyboard's own spring is
 *   `springs.keyboard`
 *
 * On iOS 26.2 a search bar in a navigation item activates on one
 * UIViewPropertyAnimator: the field rises into the bar and narrows, a glass
 * close button slides in beside it, and the large title rides up with the
 * field while it fades. Cancel plays the same animator backwards. Reduce
 * Motion keeps every travel and adds no cross-fade.
 *
 * Every leaf carries one or more `@source`; webkit and GUESS values also carry
 * the `@measure` task that will confirm or replace them. uikit.test.ts
 * enforces both.
 *
 * Its clock, curve and scroll-away snap are motion roles a theme may retune
 * (motion/roles.ts): `search.activationMs`, `search.activationCurve` and
 * `search.scrollAway.snapMs`. Thresholds and geometry are not motion, so
 * they are not roles.
 *
 * SYNC: When modified, update /packages/core/src/motion/MEASUREMENTS.md and
 * run `pnpm generate:motion-roles`
 */

/**
 * UISearchController's search bar: activation, cancel, geometry and
 * placements.
 * @experimental
 */
export const search = {
  /**
   * The activation's clock, in ms: one UIViewPropertyAnimator moves the
   * field, its width, the close button and the large title. Cancel runs the
   * same animator backwards over the same time.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIViewPropertyAnimator duration read at setup and the
   *   field's frame per frame (rms 1.5 % against this clock and curve),
   *   Oct 24 2026
   */
  activationMs: 383.3,
  /**
   * The activation's curve: the animator's UICubicTimingParameters control
   * points, UIKit's ease-in-ease-out (`timing.curves.easeInOut`).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UICubicTimingParameters read at setup, Oct 24 2026
   */
  activationCurve: [0.42, 0, 0.58, 1],
  // Reduce Motion: UIKit keeps the activation's travel with or without
  // Prefer Cross-Fade Transitions (measured in the same UIKit lab, iOS 26.2
  // simulator, iPhone 17 Pro, Oct 24 2026); Astryx follows
  // `design:reduced-motion` instead, so the table holds no setting for it.
  stacked: {
    /**
     * The stacked field's height, pt.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, UISearchTextField frame (370 × 44 at x 16), Oct 24 2026
     */
    fieldHeight: 44,
    /**
     * The field's inset from each side of its container, pt (370 wide on a
     * 402 pt screen).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, UISearchTextField frame, Oct 24 2026
     */
    fieldInset: 16,
    /**
     * The glass close button that replaces iOS 18's Cancel text: a square of
     * this side, pt, at the trailing inset.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the close UIButton's frame (44 × 44 at x 342),
     *   Oct 24 2026
     */
    closeSize: 44,
    /**
     * The gap between the active field and the close button, pt: the active
     * field narrows to the container's width minus the two insets, this gap
     * and the button (315 on a 402 pt screen).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the active field (x 16, 315 wide) and the close button
     *   (x 342), Oct 24 2026
     */
    closeGap: 11,
    /**
     * How far past its resting place the close button starts, toward the
     * trailing edge, pt: it slides in from there while its opacity goes
     * 0 → 1, both on the activation's curve. On cancel it slides back out at
     * full opacity and is removed at the end.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the close button's frame and alpha per frame (x 386 →
     *   342, alpha 0 → 1; cancel 342 → 386 at alpha 1), Oct 24 2026
     */
    closeTravel: 44,
  },
  bar: {
    /**
     * The fraction of the activation by which the navigation bar's back
     * button and large title are gone: with p the activation's progress, the
     * back button's opacity is 1 − p / 0.35 (it does not move) and the large
     * title's (1 − p / 0.35)²; the inline title stays hidden. The bar itself
     * shrinks to its compact height on the activation's clock.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, a pushed screen with a large title: the bar's height
     *   and the back button's and titles' alphas per frame over an
     *   activation, Oct 24 2026
     */
    fadeOutProgress: 0.35,
    /**
     * On cancel the large title fades back in over the activation's last
     * stretch, from this fraction: opacity (p − 0.65) / 0.35. The back button
     * is back at full opacity from the cancel's first frame.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the same screen over a cancel with the close button,
     *   Oct 24 2026
     */
    largeTitleFadeInProgress: 0.65,
  },
  scrollAway: {
    /**
     * How far the content must scroll before the field (with
     * `hidesSearchBarWhenScrolling`) starts collapsing with it, pt; after
     * that it follows 1:1.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, contentOffset and the field's frame per frame over
     *   slow pans, Oct 24 2026
     */
    hysteresisPt: 10,
    /**
     * The collapse released past this many points snaps the field closed;
     * short of it the field springs back open.
     * @source GUESS — between the two measured releases: at 15 pt the field
     *   springs open, at 30 pt it snaps closed
     * @measure M-SE1
     */
    collapseThresholdPt: 22,
    /**
     * The snap closed (or open) after a release, in ms.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, contentOffset per frame after a release at 30 pt
     *   (−138 → −116), Oct 24 2026
     */
    snapMs: 230,
  },
  bottom: {
    /**
     * The bottom (toolbar) field's height at rest, pt; it is 336 wide at
     * the bottom of a 402 pt screen. (A tab bar's search tab has its own
     * glass geometry, which belongs with the tab bar's values, not here.)
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the `.integrated` field's frame (336 × 38 at y 803),
     *   Oct 24 2026
     */
    fieldHeight: 38,
    /**
     * While active, the field's centre rests this far above the keyboard's
     * top edge, pt (a 17 pt gap), and follows the keyboard; a tab bar's
     * search field rides the keyboard the same way.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the field pinned to keyboardLayoutGuide (centre y 503
     *   with the keyboard's top at 539), Oct 24 2026
     */
    keyboardCenterOffset: 36,
    /**
     * The active field's width, pt, beside the close button.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, the `.integrated` field's frame once settled,
     *   Oct 24 2026
     */
    activeWidth: 308,
  },
  clear: {
    /**
     * The clear button's side inside the field, pt. It appears and
     * disappears at once (no fade), and a tap clears the text without moving
     * the keyboard; tapped while the field is not editing, it also makes the
     * field first responder.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, `_UITextFieldClearButton` frame and alpha per frame,
     *   UIKeyboardWillShow 75 ms after a tap while not editing, Oct 24 2026
     */
    size: 20,
  },
} as const;

// Each duration and curve above is a motion role a theme may retune
// (motion/roles.ts); registerTables.ts registers them. The thresholds
// (`scrollAway.hysteresisPt`, `scrollAway.collapseThresholdPt`) and the
// geometry are not durations, springs or curves, so they never become roles.
