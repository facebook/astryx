// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tabBar.ts
 * @input Nothing; data only
 * @output Exports `tabBar` (with `registerTabBarTable`): the iOS 26 floating tab bar's geometry, its
 *   badge, the selection lens's slide
 * @position The tab-bar domain of the UIKit constants table (motion/uikit);
 *   read by the lab TabBar's touch presentation
 *
 * Every value was read from a stock UITabBarController (four UITabs and a
 * UISearchTab, each a UINavigationController over a long table) on the
 * iOS 26.2 simulator, iPhone 17 Pro (402 × 874 pt, bottom safe area 34 pt):
 * the bar's view tree and presentation frames every frame, the spring
 * behaviours UIKit attached, and HID touches. Geometry is in points, the
 * bar's own coordinates unless a value says otherwise.
 *
 * The selection lens rests over the selected item and slides to a newly
 * selected one on `lensTravel`.
 *
 * Every leaf carries one or more `@source`; uikit.test.ts enforces it.
 * Springs stay in UIKit's vocabulary (response in seconds, damping ratio).
 *
 * Each spring is a motion role (motion/roles.ts), `tabBar.lensTravel` and so
 * on, once `registerTabBarTable()` has run; the roles stay internal until the
 * public motion-token set is decided (spec:AST-094 DEC-11).
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/TabBar/tabBarModel.ts
 * - /packages/core/src/motion/README.md (domain list)
 * - the motion roles table (motion/roles.ts)
 */

import {registerMotionTable} from '../roles';

/**
 * UITabBar on iOS 26 (floating, Liquid Glass).
 */
export const tabBar = {
  /**
   * The capsule that holds the items: 62 pt tall.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, `_UITabBarPlatterView` frame 290 × 62 at (21, 791),
   *   Oct 23 2026
   */
  barHeight: 62,
  /**
   * The capsule's distance from the screen's leading and trailing edges,
   * and from its bottom edge (the capsule sits 13 pt inside the 34 pt home
   * indicator area).
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, `_UITabBarPlatterView` at x 21 and y 791 + 62 = 853 on
   *   an 874 pt screen, Oct 23 2026
   */
  barInset: 21,
  /**
   * Without a search tab the capsule is no wider than 16 + 86 pt per tab and
   * is centred when that is narrower than the screen allows: 188 pt with two
   * tabs, 274 with three; four reach the 360 pt an iPhone 17 Pro allows.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, `_UITabBarPlatterView` 188 pt at x 107 (two tabs) and
   *   274 pt at x 64 (three tabs), 360 pt at x 21 (four and five tabs),
   *   Oct 24 2026
   */
  naturalWidth: {base: 16, perTab: 86},
  /**
   * Every item, and the resting lens over the selected one, has one width:
   * 1.0659 × P ÷ n + 0.0436 × P − 14.61 for n tabs in a capsule P pt wide
   * (98 for four tabs in 360 pt, 76 with the search tab's 290 pt). The
   * first and last items sit `itemInset` from the capsule's edges and the
   * others are spread evenly between them, so neighbours overlap.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, `_UITabButton` frames in eight layouts (two to five
   *   tabs, with and without the search tab): least-squares fit, within
   *   1 pt of every row; one-letter labels give the same widths, a label
   *   wider than ~60 pt widens every item (not modelled), Oct 24 2026
   */
  itemWidth: {perSlot: 1.0659, perBar: 0.0436, offset: -14.61},
  /**
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, `_UITabButton` 54 pt tall at y 795, Oct 23 2026
   */
  itemHeight: 54,
  /**
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, items at y 795 in the capsule at y 791, the first at
   *   x 25 in the capsule at x 21, Oct 23 2026
   */
  itemInset: 4,
  /**
   * The icon's box, centred in the item 20 pt below its top: SF Symbols render
   * 25 to 29 pt tall and 25 to 33 pt wide in the stock bar.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, `UIImageView` frames (33.3 × 28, 27 × 25, 33.3 × 29.3,
   *   25.3 × 24.7, centres 19.7 to 20 pt below the item's top), Oct 23 2026
   */
  iconSize: 28,
  /**
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, icon centres at y 814.7 to 815 for items at y 795,
   *   Oct 23 2026
   */
  iconCenterY: 20,
  /**
   * The label: 10 pt, medium; the selected look is semibold. Its 12 pt box
   * starts 35 pt below the item's top.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, `.SFUI-Medium 10.0` / `.SFUI-Semibold 10.0`, label
   *   frames 12 pt tall at y 830, Oct 23 2026
   */
  labelSize: 10,
  /**
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, label frames at y 830 for items at y 795, Oct 23 2026
   */
  labelTop: 35,

  badge: {
    /**
     * The badge's height (a 55 ÷ 3 pt capsule), and its minimum width: a
     * one-character value is a circle, "12" is 21.33 wide.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, `_UIBarBadgeView` 18.33 × 18.33 for "1", "3" and "!",
     *   21.33 × 18.33 for "12", corner radius 9.17, Oct 23 2026
     */
    height: 18.333,
    /**
     * Horizontal padding around the text (the label sits 4 pt in, 2 pt down).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, badge at x 140.67, its label at x 144.67, Oct 23 2026
     */
    paddingInline: 4,
    /**
     * The text: 12 pt, medium, white on the system red.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, badge label `SF Medium 12` (weight 0.23), white, fill
     *   systemRed (1, 0.220, 0.235) light / (1, 0.259, 0.271) dark,
     *   Oct 24 2026
     */
    fontSize: 12,
    /**
     * Where it sits: its leading edge 9 pt after the item's centre, its top
     * 2 pt below the item's top (over the icon's top-trailing corner).
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, badge at (140.67, 797) on the item centred at 131.67
     *   with its top at 795, Oct 23 2026
     */
    offsetX: 9,
    /**
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, badge top 797, item top 795, Oct 23 2026
     */
    offsetY: 2,
    /**
     * Setting, changing or clearing the value never animates.
     * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
     *   iPhone 17 Pro, `UITab.badgeValue` nil → "1" → "12" → "!" → nil at
     *   1 s intervals, per-frame badge frames and opacity, Oct 23 2026
     */
    animates: false,
  },

  /**
   * The lens travelling to a landing finger, and the slide of a selection
   * set without a finger (keys, the app): response 0.40 s, damping ratio
   * 0.85, the same spring as the segmented control's selection.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, UIViewSpringAnimationBehavior (dampingRatio 0.85,
   *   response 0.4) attached at touch-down, Oct 23 2026
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, least-squares fit of the lens's per-frame position in
   *   the bar's coordinates: a press travelling 137 pt (rms 0.84 pt) and
   *   three programmatic changes (rms 0.28 to 0.77 pt), Oct 23 2026
   */
  lensTravel: {response: 0.4, dampingRatio: 0.85},
} as const;

/**
 * Makes each spring above a motion role (motion/roles.ts).
 * Nothing registers on import: TabBar's touch layer calls it once before its
 * first animation (registering again does nothing).
 */
export function registerTabBarTable(): void {
  registerMotionTable('tabBar', tabBar);
}
