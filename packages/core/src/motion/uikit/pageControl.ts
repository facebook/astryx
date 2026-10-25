// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pageControl.ts
 * @input Nothing; data only
 * @output Exports `pageControl`: UIPageControl's measured geometry, its
 *   default indicator alphas, its tap and scrub rules, its window of
 *   indicators, its fades and its jog past the window's edge
 * @position The page-control domain of the UIKit constants table
 *   (motion/uikit); read by the lab PageControl
 *
 * Every value was read from a stock UIPageControl (default style, default
 * tint) on the iOS 26.2 simulator, iPhone 17 Pro: its frames,
 * `intrinsicContentSize`, `size(forNumberOfPages:)`, the indicator images'
 * rendered pixels and animations, and `valueChanged` under HID touches, over
 * a mid-grey background. Geometry is in points.
 *
 * Every leaf carries one or more `@source`; uikit.test.ts enforces it.
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/PageControl/pageControlModel.ts
 * - /packages/cli/assets/docs/motion.doc.mjs (`pnpm generate:motion-roles`)
 * - /packages/core/src/motion/README.md (domain list)
 */

/**
 * UIPageControl on iOS 26.
 * @experimental
 */
import {registerMotionTable} from '../roles';

export const pageControl = {
  /**
   * Diameter of one page indicator.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
   *   5-page control: indicator dots 9.67 pt (2026-10-23)
   */
  indicatorSize: 9.67,
  /**
   * Space between neighbouring indicators.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
   *   5-page control: the indicator strip is 80.3 pt wide, 5 × 9.67 + 4 × 8
   *   (2026-10-23)
   */
  indicatorSpacing: 8,
  /**
   * Space between the strip and the control's leading and trailing edges.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
   *   5-page control 108.3 pt wide around an 80.3 pt strip (2026-10-23)
   */
  horizontalPadding: 14,
  /**
   * The control's height.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro,
   *   intrinsicContentSize 108.3 × 25.67 at 5 pages and 161.3 × 25.67 at 50
   *   (2026-10-23)
   */
  height: 25.67,
  /**
   * The control is never wider than this, however many pages: past it the
   * indicators scroll in a window (size(forNumberOfPages: 50) is 903.3 pt).
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro,
   *   intrinsicContentSize capped at 161.3 pt wide at 50 pages (2026-10-23)
   */
  maxWidth: 161.3,
  /**
   * Opacity of the current page's indicator, of the indicator colour.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, the
   *   default tint renders the current indicator white α 1 in light and dark
   *   (#FFFFFF over black) (2026-10-23)
   */
  currentIndicatorAlpha: 1,
  /**
   * Opacity of every other page's indicator, of the indicator colour.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, the
   *   default tint renders the other indicators white α 0.45 in light and
   *   dark (#737373 over black) (2026-10-23)
   */
  otherIndicatorAlpha: 0.45,
  /**
   * A tap on the trailing side of the current page's indicator moves one
   * page forward, on the leading side one back; the change is reported when
   * the finger lifts.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, HID taps
   *   on a 5-page control: valueChanged at the lift, about 70–90 ms after the
   *   touch, one page per tap (2026-10-23)
   */
  tapStep: 1,
  /**
   * How far a finger travels from where it landed before the control
   * scrubs: from then on the page is the indicator under the finger.
   * Movement alone starts it; holding first changes nothing.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, HID
   *   drags across 5- and 50-page controls from a still touch and after an
   *   800 ms hold: the first page change at 16.3 and 16.7 pt (2026-10-24)
   */
  scrubStartDistance: 16,
  /**
   * While scrubbing, the page switches at the midpoint between two
   * indicators' centres: one page per indicator pitch (9.67 + 8 pt), the
   * same going back.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
   *   5-page control: changes at x 192.3, 210.3, 229.0 against midpoints
   *   192.3, 210.2, 227.8 between indicator centres (2026-10-24)
   */
  scrubSwitchPoint: 0.5,
  /**
   * A finger held on the control turns it interactive after this many
   * milliseconds, moving or not: the platter shows and the other indicators
   * dim to `interactingOtherIndicatorAlpha`.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, the
   *   indicators' contentsMultiplyColor animations start 153–160 ms after
   *   touch-down, interactionState 2 (2026-10-24)
   */
  interactionDelayMs: 155,
  /**
   * Opacity of the indicators other than the current one while a finger is
   * on the control.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, held
   *   control: the other indicators' tint alpha 0.25 (2026-10-24)
   */
  interactingOtherIndicatorAlpha: 0.25,
  /**
   * At most this many indicator slots show. Past it the row is a window
   * that moves only when the current page would land in a shrunk slot.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
   *   50-page control at pages 0, 10, 25 and 49: ten slots on the 17.67 pt
   *   pitch, centred on the control (2026-10-24)
   */
  visibleSlots: 10,
  /**
   * Where pages continue past the window, its last two slots on that side
   * shrink to these diameters, outermost last; the slots beyond show
   * nothing.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
   *   50-page control: edge indicators 7.33 and 4.31 pt (scale 0.7588 and
   *   0.4461) (2026-10-24)
   */
  edgeIndicatorSizes: [7.33, 4.31],
  /**
   * When the window moves, every indicator slides to its new slot and
   * takes its new size on this spring.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
   *   50-page control at page 10 tapped to 11: UIView spring dampingRatio 1,
   *   response 0.15 (tracking), the strip sliding 17.67 pt in about 0.2 s
   *   (2026-10-24)
   */
  windowSlide: {response: 0.15, dampingRatio: 1},
  /**
   * The window starts to move this many milliseconds after the page changes;
   * the new current indicator lights first, in its shrunk slot.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
   *   50-page control at page 10 tapped to 11: the strip starts to slide
   *   about 50 ms after valueChanged (2026-10-24)
   */
  windowSlideDelayMs: 50,
  /**
   * After a tap, the indicator that stops being current fades to the
   * other indicators' opacity over this many milliseconds, on `fadeOutCurve`.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, taps:
   *   contentsMultiplyColor CABasicAnimation 0.125 s (2026-10-24)
   */
  tapFadeOutMs: 125,
  /**
   * After any other page change (scrubbing, or the app setting the page),
   * the indicator that stops being current fades over this many
   * milliseconds.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro,
   *   programmatic currentPage changes and scrubs: contentsMultiplyColor
   *   CABasicAnimation 0.25 s (2026-10-24)
   */
  fadeOutMs: 250,
  /**
   * The curve of both fades out.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, the
   *   fade's timing function control points (0, 0, 0.58, 1) (2026-10-24)
   */
  fadeOutCurve: [0, 0, 0.58, 1],
  /**
   * Any other opacity change (the new current indicator lighting, the
   * others dimming while a finger is down and recovering at the lift, the
   * platter showing) takes this many milliseconds: a switch.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro,
   *   contentsMultiplyColor and opacity CABasicAnimations 0.015625 s
   *   (2026-10-24)
   */
  switchMs: 15.625,
  /**
   * The curve of those switches.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, the
   *   switch's timing function control points (0.42, 0, 0.58, 1)
   *   (2026-10-24)
   */
  switchCurve: [0.42, 0, 0.58, 1],
  /**
   * Past the window's edge while scrubbing, the control steps pages on its
   * own, faster the further the finger is past the edge of the control's
   * content: this many pages per second per point.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
   *   50-page control scrubbed right at 40 pt/s: intervals from 266 ms 19 pt
   *   past the content edge to 66 ms at 76 pt, least squares 0.173 pages/s
   *   per pt; a run to the left settled at 10 pages/s 77 pt past it
   *   (2026-10-24)
   */
  jogRatePerPoint: 0.173,
  /**
   * The fastest the control steps pages past the window's edge, pages per
   * second.
   * @source measured: UIKit lab, iOS 26.2 simulator, iPhone 17 Pro, a
   *   50-page control held 108 pt past the content edge: one page every
   *   61–71 ms (2026-10-24)
   */
  jogMaxRate: 15,
} as const;

/**
 * Makes the window's slide (spring and delay) and the fades and switches
 * (durations and curves) motion roles a theme may retune (motion/roles.ts).
 * When a held finger turns the control interactive decides who holds the
 * touch, not how anything moves, so it is not a role. Nothing registers on
 * import: PageControl's touch layer calls it once (it is idempotent), so a
 * page that never shows the touch presentation ships no registry.
 * @experimental
 */
export function registerPageControlTable(): void {
  registerMotionTable('pageControl', pageControl, {
    exclude: ['interactionDelayMs'],
  });
}
