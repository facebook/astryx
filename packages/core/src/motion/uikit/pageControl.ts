// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pageControl.ts
 * @input Nothing; data only
 * @output Exports `pageControl`: UIPageControl's measured geometry, its
 *   default indicator alphas and its tap rule
 * @position The page-control domain of the UIKit constants table
 *   (motion/uikit); read by the lab PageControl
 *
 * Every value was read from a stock UIPageControl (default style, default
 * tint) on the iOS 26.2 simulator, iPhone 17 Pro: its frames,
 * `intrinsicContentSize`, `size(forNumberOfPages:)`, the indicator images'
 * rendered pixels, and `valueChanged` under HID touches. Geometry is in
 * points.
 *
 * Every leaf carries one or more `@source`; uikit.test.ts enforces it.
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/PageControl/pageControlModel.ts
 * - /packages/core/src/motion/README.md (domain list)
 */

/**
 * UIPageControl on iOS 26.
 * @experimental
 */
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
} as const;
