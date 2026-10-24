// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboard.ts
 * @input registerMotionTable
 * @output Exports `keyboard`: how the software keyboard moves on Android
 *   (Chrome with Gboard): its slide's durations and curve
 * @position The keyboard domain of the Android constants table
 *   (motion/android); read by keyboard/keyboardModel.ts for Chromium. The
 *   UIKit table (motion/uikit) holds iOS's keyboard; this table holds only
 *   Android's
 *
 * Chrome reports the keyboard once per show or hide, at the start of its
 * slide (a `geometrychange` while the page overlays the keyboard, or one
 * visual viewport resize), never per frame. Content that follows the
 * keyboard plays this curve from the report so it moves in step with the
 * slide. Each value is a theme motion role (`androidKeyboard.showMs`, …).
 *
 * Every leaf carries one or more `@source`. android.test.ts enforces it.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

import {registerMotionTable} from '../roles';

export const keyboard = {
  /**
   * How long the keyboard takes to slide up, in ms.
   *
   * @source aosp frameworks/base/core/java/android/view/InsetsController.java
   *   ANIMATION_DURATION_SYNC_IME_MS = 285
   * @source measured: Chrome 124 with Gboard on Android 15 (API 35
   *   emulator); seven shows recorded frame by frame fit `curve` over 285 ms
   *   within 3.9 px rms
   */
  showMs: 285,
  /**
   * How long the keyboard takes to slide down, in ms.
   *
   * @source measured: Chrome 124 with Gboard on Android 15 (API 35
   *   emulator); seven hides recorded frame by frame fit `curve` over 250 ms
   *   within 4.4 px rms
   */
  hideMs: 250,
  /**
   * The slide's curve, cubic-bézier control points.
   *
   * @source aosp frameworks/base/core/java/android/view/InsetsController.java
   *   SYNC_IME_INTERPOLATOR = new PathInterpolator(0.2f, 0f, 0f, 1f)
   */
  curve: [0.2, 0, 0, 1],
} as const;

registerMotionTable('androidKeyboard', keyboard);
