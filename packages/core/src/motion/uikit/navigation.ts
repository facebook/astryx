// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigation.ts
 * @input Nothing; data only
 * @output Exports `navigation`: UINavigationController's push / pop geometry,
 *   starting velocity, dimming, transition clock and the interactive pop's
 *   finish rule
 * @position The navigation domain of the UIKit constants table
 *   (motion/uikit); its springs are `springs.navigationPush`,
 *   `springs.navigationPop`, `springs.navigationInteractivePopFinish` and
 *   `springs.navigationBarElements`
 *
 * On iOS 26.2 UIKit moves the cards by writing their positions into Core
 * Animation presentation modifiers every frame from the main thread; the
 * values below are fitted to those writes. The web version runs the same
 * curves on the compositor, which keeps them moving while the main thread is
 * busy.
 *
 * Every leaf carries one or more `@source`; webkit and GUESS values also carry
 * the `@measure` task that will confirm or replace them. uikit.test.ts
 * enforces both.
 *
 * SYNC: When modified, update /packages/core/src/motion/MEASUREMENTS.md
 */

import {registerMotionTable} from '../roles';
export const navigation = {
  /**
   * The push and pop springs start moving at this many travels per second
   * (3527 pt/s on a 402 pt card), not from rest.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAPresentationModifier (value, velocity) fit, Oct 23 2026
   */
  pushVelocity: 8.773,
  /**
   * Where the card underneath ends, as a fraction of the container width:
   * it moves from 0 to −0.3 W while the incoming card moves from W to 0.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAPresentationModifier values, Oct 23 2026
   */
  parallax: -0.3,
  /**
   * The dimming over the card underneath: black at this alpha, its opacity
   * going 0 → 1 on the push spring.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, _UIParallaxDimmingView read, Oct 23 2026
   */
  dimmingAlpha: 0.1,
  /**
   * The transition context's duration, in ms; it paces completion callbacks
   * (a linear property animator), not the cards.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, transitionDuration read, Oct 23 2026
   */
  transitionMs: 350,
  /**
   * The interactive pop finishes when progress + this × velocity passes
   * `interactivePopFinishThreshold` (progress in widths, velocity in widths
   * per second): seconds of projection.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, the pop decision method hooked over 61 controlled
   *   releases: the rule matches 58; the 3 misses all finished where it says
   *   cancel, Oct 23 2026
   */
  interactivePopFinishProjection: 0.35,
  /**
   * Past its start (a finger brought back beyond where the screen is fully
   * in place), the interactive pop's top screen follows the finger at this
   * share of its travel, linearly; a release there returns on
   * `springs.navigationInteractivePopReturn`.
   * @source measured: UIKit lab batch 62 (iOS 26.2 simulator, iPhone 17
   *   Pro), a back swipe scrubbed to ~50 % and brought back past its start
   *   at ~310 pt/s, lifted 10.7 pt of finger after the view crossed its
   *   start: fitted jointly with `springs.navigationInteractivePopReturn` to
   *   the view's x at the lift (−6.89 pt) and after it, Oct 24 2026
   */
  interactivePopRubberBand: 0.71,
  /**
   * The progress the projected release must pass to finish the pop (a still
   * finger at 0.475 cancels).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, the pop decision method over 61 releases, Oct 23 2026
   */
  interactivePopFinishThreshold: 0.5,
  /**
   * Travel, in px, before the full-width content swipe (iOS 26's back swipe
   * from anywhere in the content) begins.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UINavigationController.contentSwipe began after 27–30 pt
   *   of travel for drags at or under 600 pt/s, Oct 23 2026
   * At 1000 pt/s it began on the first move event (~8 pt), so above some
   * speed between 600 and 1000 pt/s it begins sooner.
   * @measure M-N4
   */
  contentPopHysteresis: 27,
  /**
   * The interactive pop's release velocity is the mean of the pan's last
   * this-many velocities (each velocity(in:).x / width, one per finger move
   * and one at the lift). It does not decay while the finger rests: a pause
   * keeps the last value, and only moving back lowers it.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIPercentDrivenInteractiveTransition averageVelocity =
   *   (prev_n + prev_n−1 + prev_n−2) / 3 at every update to 4 decimals; held
   *   0–400 ms before the lift it stays 0.73–0.75, Oct 23 2026
   */
  interactivePopVelocitySamples: 3,
  /**
   * On a push from the root, the back button's glass platter is there from
   * the first frame and its chevron starts fading in (on
   * `springs.navigationBackButton`) this many ms after the screens start
   * moving. On a pop to the root the chevron fades out at once on the same
   * spring and the platter leaves with the screen.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, inline root ↔ inline detail, per 60 Hz frame (batch
   *   62): the slide's start fitted with the push spring (rms 0.0015 of the
   *   travel); the chevron image's effective opacity (0.027, 0.27, 0.53,
   *   0.72, 0.84, 0.91, 0.97 …) fits the 0.4 s spring from 60.8 ms after it
   *   within 0.010; on the pop it starts within a frame of the slide (0.973,
   *   0.825, 0.642, 0.474 … at 34 ms steps), Oct 24 2026
   */
  backChevronPushDelayMs: 60,
  /**
   * How far, in px, the bar's title rises as it fades in once a large title
   * has scrolled under the bar (and sinks as it fades out when the large
   * title comes back), on `springs.navigationBarElements`.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, real HID drags of a large-title table: the inline title
   *   label's frame y 88.67 → 73.67 on a UIView spring (springDuration 0.6,
   *   bounce 0) fired ~5 pt after the bar collapsed, Oct 24 2026
   */
  inlineTitleRise: 15,
} as const;

/**
 * Registers this table with the motion registry (motion/roles.ts). It lists
 * no role: spec:AST-094 FR4 names none of its values, so each plays as
 * measured. Nothing registers on import, and a second call does nothing.
 */
export function registerNavigationTable(): void {
  registerMotionTable('navigation', navigation);
}
