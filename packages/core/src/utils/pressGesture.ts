// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressGesture.ts
 * @input The stylesheet's release clock (interactionOverlay.stylex.ts)
 * @output Exports the touch press model's measured clocks: PRESS_ONSET_MS,
 *   PRESS_SLOP_PX, PRESS_FLASH_MS, PRESS_FADE_MS and PRESS_SCROLL_BRAKE_MS
 * @position The numbers behind the press model. The tracking itself is
 *   UIControl's, in the gesture host (gestures/PressTracker.ts, whose
 *   PRESS_PROFILES carry each profile's clocks; gestures/delegatedPress.ts
 *   finds the surface under a finger); the constants table
 *   (motion/uikit/timing.ts) checks these against its own.
 *
 * WHAT A FINGER MEANS. A native (UIKit) list delays a press by 0.15 s,
 * cancels it the instant a scroll claims the gesture, never brings it back
 * inside that gesture, and fades it only on release. CSS `:active` on iOS
 * Safari does none of those things: measured on iOS 26.2, it paints within
 * 14 ms of the touch and was still painted 1.6 s into a scroll. So on a
 * coarse pointer the pressed state is owned in JavaScript, and `:active`
 * keeps only the mouse on a desktop.
 *
 * Every constant below was measured against the real Settings and Contacts
 * apps on an iPhone simulator, driven with real HID touches at 60 fps, before
 * it was written down.
 *
 * SYNC: When modified, update motion/uikit/timing.ts (uikit.test.ts checks
 * the two agree) and gestures/PressTracker.ts (PRESS_PROFILES).
 */

import {pressConsts} from './interactionOverlay.stylex';

/**
 * How long a finger must stay put before the surface believes it.
 *
 * UIKit's own number: `UIScrollView.delaysContentTouches` holds a content
 * touch for 0.15 s. Measured rather than taken on faith: a 1.5 s hold on a
 * Settings row painted the native highlight for 1.34 s, a 1.2 s hold for
 * 1.24 s. It is the whole reason a flick paints nothing: the scroller claims
 * a fling about 30 ms in, which is inside this window.
 */
export const PRESS_ONSET_MS = 150;

/**
 * How far a finger may travel and still be a press, in CSS pixels.
 *
 * iOS Safari's own scroller claims the gesture at about this distance (the
 * measured slow drag got its `pointercancel` after ~12 px of travel).
 * Cancelling on the distance as well as on the claim keeps the two in step
 * when the scroller is slower to decide: a list already at its end, a
 * horizontal drag on a vertical scroller.
 */
export const PRESS_SLOP_PX = 10;

/**
 * How long a too-quick tap holds the paint at full strength before fading.
 *
 * A UIKit scroll view forwards the delayed touch and the release together
 * when the finger lifts early, so the cell highlights AT THE LIFT and the
 * paint is still there while the next screen slides over it. Without this
 * the most common interaction there is would answer with nothing at all.
 */
export const PRESS_FLASH_MS = 100;

/**
 * How long the paint takes to leave after a cell's release: UIKit's deselect
 * crossfade. Shared with the stylesheet: a cell's release animation in
 * interactionOverlay.stylex.ts runs on the same constant. A control releases
 * on UIButton's clock instead (`PRESS_PROFILES.control.releaseMs`).
 */
export const PRESS_FADE_MS: number = pressConsts.releaseMs;

/**
 * How recently a scroller must have moved for a touch on it to be a BRAKE
 * rather than a press.
 *
 * Measured: a touch landing on a list that was still decelerating stopped it
 * and highlighted nothing. On the web that touch ends the momentum, so no
 * further scroll event arrives to cancel the press, and without this the
 * paint would arrive 150 ms after a finger that was only stopping the list.
 */
export const PRESS_SCROLL_BRAKE_MS = 150;
