// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboard.ts
 * @input Nothing; data only
 * @output Exports `keyboard`: when Mobile Safari's visual viewport reports
 *   the software keyboard relative to the keyboard's own motion
 * @position The keyboard domain of the UIKit constants table
 *   (motion/uikit); read by keyboard/keyboardModel.ts. The keyboard's spring
 *   is `springs.keyboard` and its notification duration
 *   `timing.keyboardNotificationMs`
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
   * How long after the keyboard starts to rise Mobile Safari usually fires
   * the visual viewport's one `resize` for it, with the final height, in ms
   * (about a frame on an idle page). Content that follows the keyboard
   * starts its spring this far in the past.
   * @source measured: Mobile Safari, iOS 26.2 simulator, iPhone 17 Pro,
   *   60 fps recordings of seven shows on a light page, the keyboard
   *   assembly's top edge fitted to `springs.keyboard` (rms ≤ 1.8 pt)
   *   against the resize event's timestamp: 11 to 31 ms, mean 19,
   *   Oct 24 2026
   */
  showReportLagMs: 19,
  /**
   * The longest lag seen when the page's main thread was busy as the
   * keyboard rose: the resize waits for it, so the keyboard started at
   * about the last animation frame before the resize. The guide dates a
   * show back to that frame, but never further than this, in ms.
   * @source measured: Mobile Safari, iOS 26.2 simulator, iPhone 17 Pro,
   *   60 fps recording of ChatLayout's full chat story, the keyboard's top
   *   edge fitted to `springs.keyboard` (rms 0.9 pt): it started 43 ms
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
   *   `springs.keyboard` against the blur's timestamp: 18 to 28 ms, mean
   *   23, Oct 24 2026
   */
  hideAfterBlurMs: 23,
} as const;
