// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file alert.ts
 * @input Nothing: plain data
 * @output Exports `alertController`: how UIAlertController (`.alert`)
 *   appears and leaves, lays out its actions, and tracks a finger across
 *   them. None of it is a motion role: its timings decide when a touch acts,
 *   which stays internal (`spec:AST-094` FR4, DEC-3)
 * @position The alert domain of the UIKit constants table (motion/uikit);
 *   its springs are `springs.alertPresent` and `springs.alertDismiss`
 *
 * Every value was read from UIKit on the iOS 26.2 simulator: a UIKit host
 * app presenting `UIAlertController(.alert)` with [Cancel, Delete] side by
 * side and with three stacked actions, driven with real HID touches, the
 * action views' highlight sampled every frame and the feedback generators
 * hooked. Lengths are in pt (CSS px), durations in ms.
 *
 * Every leaf carries one or more `@source`; GUESS values also carry the
 * `@measure` task that will confirm or replace them. uikit.test.ts enforces
 * both.
 *
 * SYNC: When modified, update /packages/core/src/motion/MEASUREMENTS.md
 */

import {registerMotionTable} from '../roles';
import {ALERT_DISMISS_SPRING, ALERT_PRESENT_SPRING} from './springs';

export const alertController = {
  /**
   * The alert's width, in pt: fixed, in portrait and landscape alike (the
   * height follows the content). AlertDialog takes it by default under a
   * finger; proposed, pending owner review (`component:AlertDialog`). At the
   * presentation's 1.2 start it stays on a phone's screen (384 of 402 pt).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, `UIAlertController(.alert)` view frames across 22
   *   portrait and landscape cases (every alert 320 pt wide; action row
   *   288 pt inside 16 pt insets), Oct 24 2026
   */
  width: 320,
  present: {
    /**
     * The alert appears from this scale to 1, fading in from opacity 0, both
     * on `springs.alertPresent`; the dimming view fades in from 0 on the same
     * spring. Nothing translates. Under Reduce Motion (Prefer Cross-Fade
     * Transitions) the scale is dropped and the fades keep the spring. A
     * wider alert than UIKit's starts at most as wide as the viewport.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CAAnimation dump of the alert view (transform scale,
     *   additive, 1.2 to 1; opacity 0 to 1) and the dimming view (opacity
     *   0 to 1), and again with Reduce Motion on (no scale animation),
     *   Oct 23 2026
     */
    scaleFrom: 1.2,
    /**
     * How long the presentation runs, in ms: the duration UIKit gives the
     * Core Animation spring of `springs.alertPresent` (cut there, 0.1 % from
     * rest), which is that spring's settling duration. Touches come back
     * this long after the start, plus the frame or two UIKit takes to
     * complete it (`ignoresTouchesForMs`). AlertDialog derives that window
     * from the spring's length, so it follows the spring; this value is the
     * measurement, not a role.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, `UIView.animate(withDuration:usingSpringWithDamping:…)`
     *   hooked and CASpringAnimation dumped (duration 0.404), Oct 23 2026
     */
    durationMs: 404,
    /**
     * Touches that land while the alert is presenting never reach it: input
     * comes back when the presentation completes, this many ms after it
     * starts (the spring's 404 ms and a frame or two; measured 435 to 461 ms,
     * taps at 300, 350 and 400 ms ignored, at 450 and 500 ms handled).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, real HID taps at fixed delays after `present`, window
     *   `sendEvent:` hooked and the presentation's completion logged,
     *   Oct 23 2026
     */
    ignoresTouchesForMs: 435,
  },
  dismiss: {
    /**
     * How long the dismissal runs, in ms: the alert only fades out (opacity
     * 1 to 0, its scale stays 1) and the dimming view fades out, both on
     * `springs.alertDismiss`. No touch is delivered until it ends, to the
     * alert or to the content behind it. A dialog whose fade never reports
     * its end closes this long after it started (and a frame budget),
     * derived from the spring's length; this value is the measurement
     * (`springs.alertDismiss`'s settling duration), not a role.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, CAAnimation dump of the alert and dimming views on a
     *   tap on an action (opacity only, duration 0.404); second taps 50, 150
     *   and 300 ms into the dismissal reached nothing, Oct 23 2026
     */
    durationMs: 404,
  },
  actions: {
    /**
     * Two actions share a row when each title fits its own share of the row
     * (this fraction of the row, less the gap) on one line, and stack when
     * one does not: per title, never the sum (titles 114 and 111 pt wide share
     * a row; 137.6 and 53.7 pt stack). Cancel leads a row, mirrored in a
     * right-to-left layout, and ends a stack. Three or more actions always
     * stack; a single action fills the row.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, two-action alerts with growing titles (a row up to a
     *   115.0 pt title next to Cancel, a stack from 119.0 pt; 140 pt capsules
     *   in a 288 pt row with an 8 pt gap), add orders swapped, forced
     *   right-to-left, Oct 23 2026
     */
    rowShare: 0.5,
    /**
     * How long after touch-down the touched action highlights: none, it is
     * highlighted in the touch-down frame (a tap and a 300 ms hold alike).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-frame highlight of the action views under real HID
     *   touches, Oct 23 2026
     */
    highlightOnsetMs: 0,
    /**
     * How far outside an action the finger may go and keep it highlighted:
     * none. The highlight cleared with the finger 1 pt below the action, and
     * a lift there ran nothing (UIButton keeps 70 pt; an alert action does
     * not).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-frame highlight of the action views under real HID
     *   touches, Oct 23 2026
     */
    highlightExpansion: 0,
    /**
     * How long the highlight of an action the finger slides off takes to
     * go: none, it is cut (the next action highlights when the finger
     * enters it; between the two nothing is highlighted).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, per-frame highlight of the action views under real HID
     *   touches, Oct 23 2026
     */
    leaveFadeMs: 0,
    /**
     * Haptics while tracking: none. Touch-down and lift only open and close
     * a selection feedback session (`userInteractionStarted` /
     * `userInteractionEnded`, which play nothing); moving from one action to
     * another plays no `selectionChanged` and no impact.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, UIFeedbackGenerator entry points hooked during taps,
     *   holds and drags across two and three actions, Oct 23 2026
     */
    haptic: 'none',
  },
} as const;

/**
 * The alert's springs as internal motion roles (`spec:AST-094` FR4, kept
 * internal by DEC-11): `alert.present` (the alert scales and fades in, its
 * dimming fades in) and `alert.dismiss` (both fade out). Each is the springs
 * table's row, so a bundle carries these two springs and no other.
 */
export const alertMotion = {
  /**
   * The alert appearing: the springs table's `alertPresent` row.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIView.animate hooked and CASpringAnimation dumped
   *   (mass 1, stiffness 522.350, damping 45.710, duration 0.404),
   *   Oct 23 2026
   */
  present: ALERT_PRESENT_SPRING,
  /**
   * The alert dismissing: the springs table's `alertDismiss` row.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, CASpringAnimation dump, Oct 23 2026
   */
  dismiss: ALERT_DISMISS_SPRING,
} as const;

/**
 * Registers the alert's two springs as internal motion roles (motion/roles.ts),
 * named in FR4's role table. Nothing registers on import, and a second call
 * does nothing.
 */
export function registerAlertTable(): void {
  registerMotionTable('alert', alertMotion, {roles: ['present', 'dismiss']});
}
