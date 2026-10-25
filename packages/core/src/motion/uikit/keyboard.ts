// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboard.ts
 * @input Nothing; data only
 * @output Exports `keyboard`: the software keyboard's own spring and
 *   notification duration, and when Mobile Safari's visual viewport reports
 *   the keyboard relative to its motion
 * @position The keyboard domain of the UIKit constants table
 *   (motion/uikit); read by keyboard/keyboardModel.ts, the keyboard layout
 *   guide and Chat's keyboard ride. Neither the spring nor the duration is a
 *   theme role: the system moves the keyboard on them whatever the theme
 *   says, so content that rides the keyboard plays these values, never a
 *   theme's (spec:AST-099 FR3)
 *
 * UIKit hands a view the keyboard's end frame before the keyboard moves. A
 * page only learns it from the visual viewport, which Mobile Safari updates
 * once per show or hide and late; these offsets let the keyboard layout
 * guide date each motion back to where the keyboard really is.
 *
 * Every leaf carries one or more `@source`; webkit and GUESS values also carry
 * the `@measure` task that will confirm or replace them. uikit.test.ts
 * enforces both.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

export const keyboard = {
  /**
   * The keyboard's frame animation, show and hide alike: critically damped,
   * response 0.2667 s. The notification reports curve 7 and 0.3833 s
   * (`notificationMs`); Core Animation cuts the spring there.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CAAnimation read on the keyboard host and a
   *   keyboardLayoutGuide-pinned view, Oct 23 2026
   */
  spring: {mass: 1, stiffness: 555.0265, damping: 47.118},
  /**
   * The duration the keyboard notifications report
   * (UIKeyboardAnimationDurationUserInfoKey, with curve 7), show and hide
   * alike, in ms. The frame follows `spring`, cut at this time.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIKeyboardWillShow / WillHide / WillChangeFrame read,
   *   Oct 23 2026
   */
  notificationMs: 383.3,
  /**
   * How long after the keyboard starts to rise Mobile Safari usually fires
   * the visual viewport's one `resize` for it, with the final height, in ms
   * (about a frame on an idle page). Content that follows the keyboard
   * starts its spring this far in the past.
   * @source measured: Mobile Safari, iOS 26.2 simulator, iPhone 17 Pro,
   *   60 fps recordings of seven shows on a light page, the keyboard
   *   assembly's top edge fitted to `keyboard.spring` (rms ≤ 1.8 pt)
   *   against the resize event's timestamp: 11 to 31 ms, mean 19,
   *   Oct 24 2026
   */
  showReportLagMs: 19,
  /**
   * How long after the field that brings up the keyboard gains focus the
   * keyboard starts to rise, in ms. UIKit raises it on its own schedule, so
   * a busy main thread does not delay it; only the page's report waits.
   * When the report comes late, the guide dates the show from the focus by
   * this much and joins the keyboard's spring where it is by then.
   * @source measured: Mobile Safari, iOS 26.2 simulator, iPhone 17 Pro,
   *   fourteen shows from a tap on ChatLayout's composer: the visual
   *   viewport's resize came 173 to 241 ms after the focus (median 206),
   *   less `showReportLagMs`, Oct 24 2026
   */
  focusToShowMs: 187,
  /**
   * The longest lag seen when the page's main thread was busy as the
   * keyboard rose: the resize waits for it, so the keyboard started at
   * about the last animation frame before the resize. Without a focus to
   * date it from, the guide dates a show back to that frame, but never
   * further than this, in ms.
   * @source measured: Mobile Safari, iOS 26.2 simulator, iPhone 17 Pro,
   *   60 fps recording of ChatLayout's full chat story, the keyboard's top
   *   edge fitted to `keyboard.spring` (rms 0.9 pt): it started 43 ms
   *   before the resize and 1 ms before the last frame preceding it,
   *   Oct 24 2026
   */
  showReportLagMaxMs: 43,
  /**
   * How long after the focused field blurs (to nothing that brings up a
   * keyboard) the keyboard starts to fall, in ms, whether the page blurred
   * it or the accessory bar's Done did. Safari reports the hide only once
   * the keyboard is down, 417 to 453 ms after the blur.
   * @source measured: Mobile Safari, iOS 26.2 simulator, iPhone 17 Pro,
   *   60 fps recordings of six hides (three after a scripted blur, three
   *   after a tap on Done), the keyboard assembly's top edge fitted to
   *   `keyboard.spring` against the blur's timestamp: 18 to 28 ms, mean
   *   23, Oct 24 2026
   */
  hideAfterBlurMs: 23,
} as const;
